import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from routes import *

load_dotenv()

app = Flask(__name__)
CORS(app)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000)