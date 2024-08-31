import os
import json
import asyncio
from flask import Flask, request, jsonify, send_file
from openai import OpenAI
from aiohttp import ClientSession
from typing import List, Optional
from flask_cors import CORS
from dotenv import load_dotenv
import requests
import firebase_admin
from firebase_admin import credentials, storage
from io import BytesIO
from werkzeug.utils import secure_filename
import uuid
from urllib.parse import urlparse, urlunparse
import re
import io
import logging
import base64
from typing import List, Dict, Any
import aiohttp




load_dotenv()

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.DEBUG)


# directory of the current file
current_directory = os.path.dirname(os.path.abspath(__file__))

#  full path to the service account key
service_account_path = os.path.join(current_directory, "serviceAccountKey.json")



openai_key = os.getenv('OPENAI_API_KEY')
serp_key = os.getenv('SERPAPI_API_KEY')
rapid_key = os.getenv('RAPID_API_KEY')

# Configure OpenAI client - adjust model and parameters as needed
client = OpenAI(api_key=openai_key)

class Product:
    def __init__(self, name: str, min_price: Optional[float] = None, max_price: Optional[float] = None, attributes: List[str] = []):
        self.name = name
        self.min_price = min_price
        self.max_price = max_price
        self.attributes = attributes


UNIFIED_PROMPT = """
You are a helpful AI assistant for a Walmart store. Your main role is to assist users with shopping-related queries. Follow this process:

1. Understand the user's query.
2. If necessary, ask clarifying questions to better understand their needs.
3. Once you have a clear understanding, suggest relevant products.

Maintain a helpful, friendly, and professional tone throughout the conversation.

Format your response as JSON:
{{
    "response": "Your friendly response to the user, including any necessary clarifying questions",
    "products": [
        {{
            "name": "product name",
            "min_price": minimum price if specified or null,
            "max_price": maximum price if specified or null,
            "attributes": ["attribute1", "attribute2", ...] or null if no specific attributes
        }},
        ...
    ],
    "category": "Category of shopping based on query. Select one: Grocery, Fashion&Clothing, Tech",
    "ready_for_search": boolean (true if ready to search for products, false if more clarification is needed)
}}

If you need more information or clarification, set "ready_for_search" to false and leave the "products" list empty.
If you have enough information to suggest products, set "ready_for_search" to true and include up to 4 product suggestions in the "products" list.
"""


conversation_history: List[Dict[str, str]] = [{"role": "system", "content": UNIFIED_PROMPT}]
latest_query_context = None

cred = credentials.Certificate(service_account_path)
firebase_admin.initialize_app(cred, {
    'storageBucket': 'walmart-assistant-d0901.appspot.com'
})
# storage_client = storage.Client()


LOOK_URI = ''  # Define your default look URI
AVATAR_URI = ''  # Define your default avatar URI
# rapid_key = rapid_key  # Define your RapidAPI key

async def process_query(query: str) -> Dict[str, Any]:
    conversation_history.append({"role": "user", "content": query})
    try:
        completion = client.chat.completions.create(
            model="gpt-4",
            messages=conversation_history,
            temperature=0.7,
        )

        response = completion.choices[0].message.content
        conversation_history.append({"role": "assistant", "content": response})
        logging.debug(f"OpenAI response: {response}")
        return json.loads(response)
    except json.JSONDecodeError as e:
        logging.error(f"Failed to parse OpenAI response: {response}")
        logging.error(f"JSON decode error: {str(e)}")
        raise
    except Exception as e:
        logging.error(f"Error in OpenAI API call: {str(e)}")
        raise

async def search_walmart(products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    async def search_single_product(product: Dict[str, Any]) -> Dict[str, Any]:
        url = "https://serpapi.com/search.json"
        query = product['name']
        if product.get('attributes'):
            query += " " + " ".join(product['attributes'])
        
        params = {
            "engine": "walmart",
            "query": query,
            "api_key": serp_key,
        }
        
        if product.get('min_price'):
            params["min_price"] = product['min_price']
        if product.get('max_price'):
            params["max_price"] = product['max_price']

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        if 'organic_results' in data:
                            results = data['organic_results'][:3]  # Limit to top 3 results
                            return {
                                "product": product['name'],
                                "results": [
                                    {
                                        "pid": item.get('product_id'),
                                        "rating": item.get('rating'),
                                        "title": item.get('title'),
                                        "price": item.get('primary_offer', {}).get('offer_price'),
                                        "image": item.get('thumbnail'),
                                        "link": item.get('product_page_url')
                                    } for item in results
                                ]
                            }
        except Exception as e:
            logging.error(f"Error searching for product {product['name']}: {str(e)}")
        
        return {"product": product['name'], "results": []}

    tasks = [search_single_product(product) for product in products]
    return await asyncio.gather(*tasks)




async def generate_recipe_keyword(context: dict[str, str]):
    prompt = f"""
    Based on the following shopping context, generate a concise and relevant keyword or phrase for searching recipe videos. The keyword should capture the essence of a recipe the user might be interested in.

    User query: {context['query']}
    Shopping category: {context['category']}
    Assistant's response: {context['response']}

    Recipe search keyword:
    """

    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful AI assistant specializing in culinary topics."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=50
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error in OpenAI API call: {str(e)}")
        raise


async def search_youtube_recipes(keyword: str, session: ClientSession):
    url = "https://serpapi.com/search.json"
    search_query = f"{keyword} recipe"
    
    params = {
        "engine": "youtube",
        "search_query": search_query,
        "api_key": serp_key,
    }
    
    async with session.get(url, params=params) as response:
        if response.status == 200:
            data = await response.json()
            if 'video_results' in data:
                return [
                    {
                        "title": video.get('title'),
                        "link": video.get('link'),
                        "thumbnail": video.get('thumbnail', {}).get('static'),
                        "duration": video.get('duration'),
                        "views": video.get('views'),
                        "published_date": video.get('published_date')
                    } for video in data['video_results'][:5]  # Return top 5 results
                ]
    return []




# API routes

@app.route("/shop", methods=['POST'])
async def shop():
    try:
        query = request.json.get('text')
        if not query:
            return jsonify({"error": "No query provided"}), 400

        logging.info(f"Received query: {query}")

        ai_response = await process_query(query)
        
        if not ai_response['ready_for_search']:
            return jsonify({
                "assistant_response": ai_response['response'],
                "ready_for_search": False
            })

        results = await search_walmart(ai_response['products'])

        logging.info(f"Returning response with {len(results)} product results")
        return jsonify({
            "assistant_response": ai_response['response'],
            "results": results,
            "category": ai_response['category'],
            "ready_for_search": True
        })
    except json.JSONDecodeError as e:
        logging.error(f"JSON decode error: {str(e)}")
        return jsonify({"error": "Failed to parse API response", "details": str(e)}), 500
    except Exception as e:
        logging.error(f"Error in shop route: {str(e)}")
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500

@app.route("/recipe_search" , methods=['GET'])
async def recipe_search():
    global latest_query_context
    try:
        if not latest_query_context:
            return jsonify({"error": "No recent shopping context found. Please perform a shop query first."}), 400

        recipe_keyword = await generate_recipe_keyword(latest_query_context)

        async with ClientSession() as session:
            recipe_results = await search_youtube_recipes(recipe_keyword, session)

        return jsonify({
            "original_query": latest_query_context['query'],
            "recipe_keyword": recipe_keyword,
            "recipe_results": recipe_results
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/virtual-try-on', methods=['POST'])
def virtual_try_on():
    data = request.json
    clothing_image_url = data.get('clothing_image_url')
    avatar_image_url = data.get('avatar_image_url')

    if not clothing_image_url or not avatar_image_url:
        return {"error": "Missing clothing_image_url or avatar_image_url"}, 400

    params = {
        'clothing_image_url': clothing_image_url,
        'avatar_image_url': avatar_image_url
    }

    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-RapidAPI-Key': "1b1854fc8fmshe9b946dc0717eddp10a300jsn603547626f44",
        'X-RapidAPI-Host': 'texel-virtual-try-on.p.rapidapi.com'
    }

    try:
        logging.info(f"Sending request to RapidAPI with params: {params}")
        response = requests.post(
            'https://texel-virtual-try-on.p.rapidapi.com/try-on-url',
            headers=headers,
            data=params
        )
        response.raise_for_status()

         # Encode the image data to base64
        image_base64 = base64.b64encode(response.content).decode('utf-8')
        
        return jsonify({
            "image": image_base64,
            "content_type": response.headers.get('Content-Type', 'image/jpeg')
        })
    except requests.exceptions.RequestException as error:
        return jsonify({"error": str(error)}), 500
        
    #     return send_file(
    #         io.BytesIO(response.content),
    #         mimetype='image/jpeg',
    #         as_attachment=True,
    #         download_name='result.jpg'
    #     )
    # except requests.exceptions.RequestException as error:
    #     logging.error(f"Error from RapidAPI: {error}")
    #     if hasattr(error, 'response') and error.response is not None:
    #         logging.error(f"Response content: {error.response.content}")
    #     return {"error": str(error)}, 500
    
   
   

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(app.run(debug=True, host="0.0.0.0", port=8000))