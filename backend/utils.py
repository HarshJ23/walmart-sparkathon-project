import os
from openai import OpenAI
from typing import List, Optional, Dict
from aiohttp import ClientSession

openai_key = os.getenv('OPENAI_API_KEY')
serp_key = os.getenv('SERPAPI_API_KEY')

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
    "response": "Your friendly response to the user",
    "category" : "Category of shopping based on query. only select one from these : {Grocery , Fashion&Clothing , Tech}"
}
"""

chat_history = [{"role": "system", "content": SYSTEM_PROMPT}]

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


async def generate_recipe_keyword(context: Dict[str, str]):
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