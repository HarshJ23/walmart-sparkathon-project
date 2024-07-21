import os
from flask import Flask, request, jsonify
from openai import OpenAI
from groq import Groq
import requests
from typing import List, Optional
import json
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

openai_key = os.getenv('OPENAI_API_KEY')
serp_key = os.getenv('SERPAPI_API_KEY')
groq_key = os.getenv('GROQ_API_KEY')

# Configure OpenAI client - slow response , high quality.
client = OpenAI(api_key= openai_key )

# groq client(optional) - fast response , low quality
# client = Groq(
#     api_key = groq_key,
# )

class Product:
    def __init__(self, name: str, min_price: Optional[float] = None, max_price: Optional[float] = None, attributes: List[str] = []):
        self.name = name
        self.min_price = min_price
        self.max_price = max_price
        self.attributes = attributes

SYSTEM_PROMPT = """
You are a helpful shopping assistant for Walmart. Your task is to interpret user queries and generate appropriate product searches.
For each query, provide:
1. An initial list of 4 products to search for
2. Any specific attributes or constraints for each product (e.g., price range, flavor, size)
3. A friendly response to the user explaining your suggestions

Format your response as JSON:
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
    "response": "Your friendly response to the user"
}
"""

def interpret_query(query: str):
    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            # model = "llama3-8b-8192",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": query}
            ],
            temperature=0.7,
        )
        return completion.choices[0].message.content
    except Exception as e:
        print(f"Error in OpenAI API call: {str(e)}")
        raise

def search_walmart(product: Product):
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
    
    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()
        if 'organic_results' in data and len(data['organic_results']) > 0:
            return data['organic_results'][:3]  # Return top 3 results
    return []

@app.route("/shop", methods=['POST'])
def shop():
    try:
        query = request.json.get('text')
        if not query:
            return jsonify({"error": "No query provided"}), 400

        interpretation = interpret_query(query)
        try:
            interpreted_data = json.loads(interpretation)
        except json.JSONDecodeError:
            return jsonify({"error": "Failed to parse OpenAI response"}), 500
        
        results = []
        for product in interpreted_data['products']:
            product_obj = Product(**product)
            search_results = search_walmart(product_obj)
            results.append({
                "product": product_obj.name,
                "results": [
                    {
                        "title": item.get('title'),
                        "price": item.get('primary_offer', {}).get('offer_price'),
                        "image": item.get('thumbnail'),
                        "link": item.get('product_page_url')
                    } for item in search_results
                ]
            })
        
        return jsonify({
            "assistant_response": interpreted_data['response'],
            "results": results
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000)