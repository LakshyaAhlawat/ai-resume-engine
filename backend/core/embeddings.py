from typing import List
from langchain_huggingface import HuggingFaceEmbeddings
from backend.config import Config

class EmbeddingService:
    """
    Wrapper for generation of Document Embeddings.
    """
    def __init__(self):
        print(f"Loading Embedding Model: {Config.EMBEDDING_MODEL_NAME}...")
        self.output_dim = 384 # For all-MiniLM-L6-v2
        self.model = HuggingFaceEmbeddings(model_name=Config.EMBEDDING_MODEL_NAME)

    def embed_text(self, text: str) -> List[float]:
        """Embeds a single string."""
        if not text:
            return [0.0] * self.output_dim
        return self.model.embed_query(text)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embeds a list of strings."""
        return self.model.embed_documents(texts)
