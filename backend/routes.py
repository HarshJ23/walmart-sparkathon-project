from flask import request, jsonify
from app_v2 import app
from utils import interpret_query, search_walmart, search_youtube_recipes, generate_recipe_keyword, Product
import json
import asyncio
from aiohttp import ClientSession


latest_query_context = None

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
        "query": query,
        "category": interpreted_data.get('category', ''),
        "response": interpreted_data.get('response', '')
        }
        
        return jsonify({
            "assistant_response": interpreted_data.get('response', ''),
            "results": results,
            "category" : interpreted_data.get('category' , '')
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


@app.route("/recipe_search", methods=['GET'])
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