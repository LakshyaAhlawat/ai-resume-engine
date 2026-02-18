from typing import List, Dict, Optional
from pydantic import BaseModel

class JobDescription(BaseModel):
    title: str
    description: str
    required_skills: List[str]
    min_experience_years: int
    
class ProcessedCandidate(BaseModel):
    id: str
    name: str
    skills_text: str
    experience_text: str
    
class EvaluationResult(BaseModel):
    candidate_id: str
    total_score: float
    rank: int
    breakdown: Dict[str, float]
    summary: Dict[str, object]
    fairness_note: Optional[str] = None

class ShortlistRequest(BaseModel):
    job_description: JobDescription
    top_k: int = 5
