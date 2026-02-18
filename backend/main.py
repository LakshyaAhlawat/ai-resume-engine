import os
import shutil
import uuid
from typing import List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from backend.config import Config
from backend.core.parsing import ResumeParser
from backend.core.embeddings import EmbeddingService
from backend.core.vector_db import VectorStore
from backend.core.ranking import RankingEngine
from backend.core.llm import LLMReasoning
from backend.core.fairness import FairnessAnalyzer
from backend.models.schemas import EvaluationResult

app = FastAPI(title="AI Resume Shortlisting Engine")

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Singletons
embedding_service = EmbeddingService()
vector_store = VectorStore()
ranking_engine = RankingEngine(vector_store, embedding_service)
llm_service = LLMReasoning()

# Mount Static Files (Frontend)
app.mount("/static", StaticFiles(directory="backend/static"), name="static")

@app.get("/")
async def read_root():
    static_file = "backend/static/index.html"
    if not os.path.exists(static_file):
        logger.error(f"Static file not found: {static_file}")
        return HTMLResponse(content="<h1>Static file missing</h1>", status_code=404)
    return FileResponse(static_file)

@app.post("/api/v1/upload")
async def upload_resumes(files: List[UploadFile] = File(...)):
    uploaded_ids = []
    
    for file in files:
        file_id = str(uuid.uuid4())
        file_path = os.path.join(Config.DATA_DIR, f"{file_id}_{file.filename}")
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Parse
        try:
            raw_text = ResumeParser.extract_text(file_path)
            clean_text = ResumeParser.clean_text(raw_text)
            segments = ResumeParser.segment_resume(raw_text) # Use raw for better regex matching
            
            # Embed
            # We embed the Full Text for broad search
            full_vector = embedding_service.embed_text(clean_text)
            
            # Store in DB
            vector_store.add_resume(
                resume_id=file_id,
                segments=segments,
                embeddings={"FULL": full_vector},
                metadata={"filename": file.filename}
            )
            
            uploaded_ids.append({"filename": file.filename, "id": file_id, "status": "Indexed"})
            
        except Exception as e:
            print(f"Error processing {file.filename}: {e}")
            uploaded_ids.append({"filename": file.filename, "status": "Failed", "error": str(e)})

    return {"uploaded": uploaded_ids}

@app.post("/api/v1/shortlist")
async def shortlist_candidates(
    job_description: str = Form(...),
    top_k: int = Form(5)
):
    # 1. Rank Candidates (Semantic Search)
    ranked_candidates = ranking_engine.rank_candidates(job_description, top_k=top_k)
    
    final_results = []
    
    # 2. Detailed Analysis for Top K
    for candidate in ranked_candidates:
        cand_id = candidate['id']
        metadata = candidate['metadata']
        
        # Reconstruct text for LLM (retrieved from metadata or storage)
        # Note: metadata keys are 'skills_text', 'experience_text' etc. from vector_db.py
        full_profile = f"Skills: {metadata.get('skills_text','')}\nExperience: {metadata.get('experience_text','')}"
        
        # 3. LLM Reasoning
        llm_eval = llm_service.evaluate_candidate(full_profile, job_description)
        
        # 4. Fairness Check
        fairness = FairnessAnalyzer.check_bias(full_profile)
        
        # 5. Composite Score Calculation
        # Base semantic score (0-1) * 100 * 0.5 + LLM Score * 0.5
        semantic_score = candidate.get('semantic_score', 0) * 100
        llm_score = llm_eval.get('fit_score', 0)
        
        total_score = (semantic_score * 0.6) + (llm_score * 0.4)
        
        result = {
            "candidate_id": cand_id,
            "filename": metadata.get('filename'),
            "rank": 0, # Placeholder, set after sorting
            "total_score": round(total_score, 1),
            "breakdown": {
                "semantic_match": round(semantic_score, 1),
                "llm_score": llm_score
            },
            "summary": llm_eval,
            "fairness_analysis": fairness
        }
        final_results.append(result)

    # Re-sort by total score
    final_results.sort(key=lambda x: x['total_score'], reverse=True)
    
    # Assign Rank
    for i, res in enumerate(final_results):
        res['rank'] = i + 1
        
    return {"job_description_preview": job_description[:50] + "...", "results": final_results}

@app.post("/api/v1/interview-questions")
async def generate_questions(
    candidate_summary: str = Form(...),
    job_description: str = Form(...)
):
    questions = llm_service.generate_interview_questions(candidate_summary, job_description)
    return {"questions": questions}
