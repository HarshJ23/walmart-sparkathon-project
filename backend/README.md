# Walmart Sparkathon Project

## Shopping Assistant Backend

This project is a backend implementation of a shopping assistant for the Walmart Sparkathon. It uses OpenAI's GPT model to interpret user queries and the Walmart API (via SerpAPI) to fetch product information.

Repository: [https://github.com/HarshJ23/walmart-sparkathon-project](https://github.com/HarshJ23/walmart-sparkathon-project)

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
   python app.py
   ```

   The server should start running on `http://localhost:8000`.

### Usage

Send a POST request to `http://localhost:8000/shop` with a JSON body:

```json
{
  "text": "Plan the snacks for football watch party at my house."
}
```

The response will include the assistant's interpretation and relevant product results.

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### License

This project is open source and available under the [MIT License](LICENSE).