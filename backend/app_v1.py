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
# from google.cloud import storage
from io import BytesIO
from werkzeug.utils import secure_filename
import uuid
from urllib.parse import urlparse, urlunparse
import re
import io
import logging
import base64




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

SYSTEM_PROMPT = """
You are a helpful AI assistant for a large retail store. Your primary task is to assist users with shopping-related queries, but you can also help with other tasks such as providing recipes, answering general questions, and offering advice on a wide range of topics. For each query, provide:
For all types of queries:
1. An initial list of 4 products to search for
2. Any specific attributes or constraints for each product (e.g., price range, flavor, size)
3. A friendly response to the user explaining your suggestions
Interpret the user's request and provide an appropriate response.
If the query is shopping-related, suggest 4 relevant products with their attributes.
If the query is about a recipe, provide ingredients and instructions.
For general questions, offer clear and concise information or advice.
Always maintain a helpful, friendly, and professional tone.

strictly Format your response as given JSON:
{
    "products": [
        {
            "name": "product name",
            "min_price": optional minimum price,
            "max_price": optional maximum price,
            "attributes": ["attribute1", "attribute2", ...]
        },
        ...
    ],
    "response": "Your friendly response to the user",
    "category" : "Category of shopping based on query. only select one from these : {Grocery , Fashion&Clothing , Tech}"
}
"""

chat_history = [{"role": "system", "content": SYSTEM_PROMPT}]
latest_query_context = None

cred = credentials.Certificate(service_account_path)
firebase_admin.initialize_app(cred, {
    'storageBucket': 'walmart-assistant-d0901.appspot.com'
})
# storage_client = storage.Client()


LOOK_URI = ''  # Define your default look URI
AVATAR_URI = ''  # Define your default avatar URI
# rapid_key = rapid_key  # Define your RapidAPI key


async def interpret_query(query: str):
    chat_history.append({"role": "user", "content": query})
    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=chat_history,
            temperature=0.7,
        )

        response = completion.choices[0].message.content
        chat_history.append({"role": "assistant", "content": response})
        return response
    except Exception as e:
        print(f"Error in OpenAI API call: {str(e)}")
        raise

async def search_walmart(product: Product, session: ClientSession):
    url = "https://serpapi.com/search.json"
    query = product.name
    if product.attributes:
        query += " " + " ".join(product.attributes)
    
    params = {
        "engine": "walmart",
        "query": query,
        "api_key": serp_key,
    }
    
    if product.min_price is not None:
        params["min_price"] = product.min_price
    if product.max_price is not None:
        params["max_price"] = product.max_price
    
    async with session.get(url, params=params) as response:
        if response.status == 200:
            data = await response.json()
            if 'organic_results' in data and len(data['organic_results']) > 0:
                return data['organic_results'][:3]  # Return top 3 results
    return []


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






@app.route("/shop", methods=['POST'])
async def shop():
    global latest_query_context

    try:
        query = request.json.get('text')
        if not query:
            return jsonify({"error": "No query provided"}), 400

        interpretation = await interpret_query(query)
        try:
            interpreted_data = json.loads(interpretation)
        except json.JSONDecodeError:
            return jsonify({"error": "Failed to parse OpenAI response"}), 500
        
        # Debugging: Log the interpreted data to check its structure
        print("Interpreted Data:", interpreted_data)
        
        if 'products' not in interpreted_data:
            return jsonify({"error": "'products' key is missing in the response"}), 500
        
        results = []
        async with ClientSession() as session:
            tasks = []
            for product in interpreted_data['products']:
                product_obj = Product(**product)
                tasks.append(search_walmart(product_obj, session))
            
            search_results = await asyncio.gather(*tasks)
            
            for product, result in zip(interpreted_data['products'], search_results):
                results.append({
                    "product": product['name'],
                    "results": [
                        {   "pid" : item.get('product_id'),
                            "rating" : item.get('rating'),
                            "title": item.get('title'),
                            "price": item.get('primary_offer', {}).get('offer_price'),
                            "image": item.get('thumbnail'),
                            "link": item.get('product_page_url')
                        } for item in result
                    ]
                })
        
        latest_query_context = {
            'query': query,
            'response': interpreted_data.get('response', ''),
            'category': interpreted_data.get('category', '')
        }

        print(latest_query_context)
        
        return jsonify({
            "assistant_response": interpreted_data.get('response', ''),
            "results": results,
            "category" : interpreted_data.get('category' , '')
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


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
        'X-RapidAPI-Key': "12a458bc08msh522f3da4fff98dcp17f205jsn59bc8118beeb",
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
