# Walmart Sparkathon Project

## Shopping Assistant Backend

This project is a backend implementation of a shopping assistant for the Walmart Sparkathon. It uses OpenAI's GPT model to interpret user queries and the Walmart API (via SerpAPI) to fetch product information.

Repository: [https://github.com/HarshJ23/walmart-sparkathon-project](https://github.com/HarshJ23/walmart-sparkathon-project)

[![Watch the video](https://img.youtube.com/vi/jhjSAe0Gqfs/0.jpg)](https://www.youtube.com/watch?v=jhjSAe0Gqfs)



### Features

- Interprets natural language shopping queries
- Generates product suggestions based on user input
- Searches Walmart's product catalog
- Returns relevant product information

### Tech Stack

- Python
- Flask
- OpenAI API
- SerpAPI (for Walmart product search)

### Local Setup

Follow these steps to set up the project locally:

1. **Clone the repository**

   ```
   git clone https://github.com/HarshJ23/walmart-sparkathon-project.git
   cd walmart-sparkathon-project
   ```

2. **Navigate to the backend folder**

   ```
   cd backend
   ```


2. **Set up a virtual environment**

   ```
   python -m venv venv 
   venv\Scripts\activate
   ```

3. **Install dependencies**

   ```
   pip install -r requirements.txt
   ```

4. **Set up environment variables**

   Create a `.env` file in the root directory and add the following(check .env.example for reference):

   ```
   OPENAI_API_KEY=your_openai_api_key
   SERPAPI_API_KEY=your_serpapi_api_key
   ```

   Replace `your_openai_api_key` and `your_serpapi_api_key` with your actual API keys.

5. **Run the application**

   ```
   python app_v1.py
   ```

   The server should start running on `http://localhost:8000`.

### Usage

Send a POST request to `http://localhost:8000/shop` with a JSON body:

example query:
```json
{
  "text": "Plan the snacks for football watch party at my house."
}
```

The response will include the assistant's interpretation and relevant product results.


### Frontend Setup

Follow these steps to set up the frontend locally:

1. **Navigate to the frontend folder**

   ```
   cd frontend
   ```

2. **Install dependencies**

   ```
   npm install
    ```
3. **Run the development server**

   ```
   npm run dev
   ```

   The frontend should now be running on ```http://localhost:3000```.

### Usage

Access the application by opening `http://localhost:3000` in your web browser. Use the interface to input your shopping queries and receive product suggestions.

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

