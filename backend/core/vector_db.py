import chromadb
from chromadb.config import Settings
from typing import List, Dict, Optional
from backend.config import Config

class VectorStore:
    """
    Manages storage and retrieval of Resume embeddings.
    """
    def __init__(self):
        self.client = chromadb.PersistentClient(path=Config.VECTOR_DB_PATH)
        self.collection = self.client.get_or_create_collection(name="resumes")

    def add_resume(self, resume_id: str, segments: Dict[str, str], embeddings: Dict[str, List[float]], metadata: Dict):
        """
        Stores resume embeddings. We store each section as a separate vector or 
        aggregate them? For this design, let's store the 'FULL' text embedding for primary
        retrieval, and keep section parts in metadata for detailed analysis.
        
        Wait, for 'Semantic Matching' in Stage 2, we wanted section-wise comparison.
        So let's store one main document per resume, with the full text specific embedding,
        but we can also store the section embeddings in the specific metadata or separate entries.
        
        Simpler approach for MVP: Store ONE vector per resume (Full Text) for initial search,
        BUT we also pass the separate section vectors to the ranking logic manually (in-memory) 
        during the 'shortlist' phase if computing on the fly, OR store them here.
        
        Let's store the Main 'Combined' embedding.
        """
        
        # Flatten metadata for Chroma compatibility (no nested dicts)
        flat_metadata = {
            "filename": metadata.get("filename", ""),
            "education_text": segments.get("EDUCATION", "")[:1000], # Trucate storage
            "skills_text": segments.get("SKILLS", "")[:1000],
            "experience_text": segments.get("EXPERIENCE", "")[:1000]
        }

        # We can store just the 'Combined' embedding for generic similarity
        # But for our "Scoring Engine", we calculate scores explicitly.
        # So this DB acts mainly as a persistence layer.
        
        # Combining all text for the main vector
        full_text = f"{segments['SKILLS']} {segments['EXPERIENCE']} {segments['PROJECTS']}"
        
        # Note: Validations are assumed to be done by caller (embedding generation)
        # In a real app we might verify list lengths.
        
        # Here we only store the "main" generic vector to find candidates quickly if we had millions.
        # But since we are likely doing batch processing for a specific job against ALL uploaded files 
        # (small batch), or specific ones, we can just use it to ID them.
        
        self.collection.upsert(
            documents=[full_text],
            metadatas=[flat_metadata],
            ids=[resume_id],
            embeddings=[embeddings['FULL']] 
        )

    def get_all_resumes(self):
        """Retrieves all resumes (small scale assumption)."""
        return self.collection.get()

    def search(self, query_vector: List[float], k: int = 5):
        return self.collection.query(
            query_embeddings=[query_vector],
            n_results=k
        )
