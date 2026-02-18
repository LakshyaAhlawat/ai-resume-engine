import os
from dotenv import load_dotenv

# Load from project root
load_dotenv(os.path.join(os.getcwd(), ".env.local"))

class Config:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
    VECTOR_DB_PATH = "./data/chroma_db"
    DATA_DIR = "./data"
    
    # Weights for scoring
    WEIGHT_SEMANTIC = 0.4
    WEIGHT_EXPERIENCE = 0.3
    WEIGHT_RULES = 0.2
    WEIGHT_LLM = 0.1

    # Fairness
    SENSITIVE_TERMS = ["male", "female", "man", "woman", "he", "she", "him", "her", "brother", "sister"]
    
os.makedirs(Config.DATA_DIR, exist_ok=True)
