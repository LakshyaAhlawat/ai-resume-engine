import numpy as np
from typing import List, Dict
from sklearn.metrics.pairwise import cosine_similarity
from backend.config import Config
from backend.core.embeddings import EmbeddingService
from backend.core.vector_db import VectorStore

class RankingEngine:
    def __init__(self, vector_store: VectorStore, embedding_service: EmbeddingService):
        self.vector_store = vector_store
        self.embedding_service = embedding_service

    def calculate_score(self, candidate_data: Dict, jd_embedding: List[float], jd_text: str) -> float:
        """
        Calculates the composite score for a candidate.
        Note: In a full prod system, we'd have pre-computed embeddings for sections.
        Here we might verify them or re-compute if not in DB.
        """
        
        # 1. Semantic Score (vector similarity)
        # We retrieve the candidate's embedding from the DB or memory
        # For this function, let's assume we have the vector or compute it.
        # Ideally, we did a batch search already and have the similarity score.
        pass 

    def rank_candidates(self, job_desc: str, top_k: int = 5):
        """
        Main pipeline to retrieve and rank candidates.
        """
        # 1. Embed JD
        jd_vector = self.embedding_service.embed_text(job_desc)
        
        # 2. Semantic Search (Stage 2 - Vector Match)
        # We get more than k to filter them later
        results = self.vector_store.search(jd_vector, k=top_k * 3)
        
        candidates = []
        ids = results['ids'][0]
        metadatas = results['metadatas'][0]
        distances = results['distances'][0] # Chroma returns distance (lower is better? or similarity?)
        # Chroma default is L2 usually, but let's assume cosine if configured or convert.
        # Actually for simplicity, we treat (1 - distance) as similarity proxy if L2.
        
        for i, uid in enumerate(ids):
            meta = metadatas[i]
            dist = distances[i]
            similarity = 1 / (1 + dist) # Simple conversion
            
            # Stage 1: simple rules (e.g. if we had years of exp in metadata)
            # score = self.apply_rules(meta) 
            
            candidates.append({
                "id": uid,
                "metadata": meta,
                "semantic_score": similarity,
                "final_score": similarity # Baseline
            })
            
        # Sort by score
        candidates.sort(key=lambda x: x['final_score'], reverse=True)
        
        return candidates[:top_k]
