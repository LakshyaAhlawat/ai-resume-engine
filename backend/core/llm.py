import json
from typing import List
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from backend.config import Config

class LLMReasoning:
    """
    Uses Groq to evaluate candidates like a human recruiter.
    """
    def __init__(self):
        if not Config.GROQ_API_KEY:
            print("WARNING: GROQ_API_KEY not found. Using Mock Reasoning Mode.")
            self.llm = None
            return

        self.llm = ChatGroq(
            temperature=0.1, 
            model_name="llama3-70b-8192", 
            api_key=Config.GROQ_API_KEY
        )
        self.prompt = PromptTemplate.from_template(
            """
            You are an expert Technical Recruiter.
            
            JOB DESCRIPTION:
            {job_description}
            
            CANDIDATE PROFILE (Parsed Data):
            {candidate_profile}
            
            TASK:
            1. Analyze the candidate's fit for this specific role.
            2. Identify strengths and weaknesses.
            3. Provide a hiring recommendation (Strong Hire, Hire, Weak Hire, Reject).
            4. Assign a fit score (0-100).
            
            OUTPUT FORMAT (JSON ONLY, no markdown):
            {{
                "recommendation": "Strong Hire/Hire/Weak Hire/Reject",
                "fit_score": 85,
                "strengths": ["list", "of", "strengths"],
                "weaknesses": ["list", "of", "weaknesses"],
                "reasoning": "Brief explanation..."
            }}
            """
        )

    def evaluate_candidate(self, resume_text: str, jd_text: str) -> dict:
        """
        Generates a qualitative evaluation of the candidate.
        """
        if not self.llm:
            return {
                "recommendation": "Mock Hire",
                "fit_score": 75,
                "strengths": ["Strong foundational skills", "Relevant experience"],
                "weaknesses": ["None identified in mock mode"],
                "reasoning": "AI Analysis is currently in MOCK MODE because GROQ_API_KEY is missing."
            }
        try:
            chain = self.prompt | self.llm
            response = chain.invoke({
                "job_description": jd_text,
                "candidate_profile": resume_text[:6000] # Truncate to fit context if needed
            })
            
            content = response.content.replace("```json", "").replace("```", "").strip()
            return json.loads(content)
        except Exception as e:
            print(f"LLM Error: {e}")
            return {
                "recommendation": "Error",
                "fit_score": 0,
                "strengths": [],
                "weaknesses": ["LLM processing failed"],
                "reasoning": f"Could not generate reasoning: {e}"
            }

    def generate_interview_questions(self, candidate_summary: str, jd_text: str) -> List[dict]:
        """
        Generates targeted interview questions based on candidate gaps/weaknesses.
        """
        if not self.llm:
            return [
                {"question": "What is your experience with Python?", "intent": "Verify core skill", "expected_signal": "Solid terminology usage"},
                {"question": "Describe a difficult project you led.", "intent": "Soft skills", "expected_signal": "Leadership and conflict resolution"}
            ]
        prompt = PromptTemplate.from_template(
            """
            Analyze the following candidate evaluation and job description.
            Generate 5 targeted behavioral and technical interview questions that probe the candidate's 
            claimed experience or identified weaknesses.
            
            JD: {jd_text}
            EVALUATION: {candidate_summary}
            
            OUTPUT FORMAT (JSON List ONLY):
            [
                {{"question": "...", "intent": "why we are asking this", "expected_signal": "what a good answer looks like"}}
            ]
            """
        )
        try:
            chain = prompt | self.llm
            response = chain.invoke({
                "jd_text": jd_text,
                "candidate_summary": candidate_summary
            })
            content = response.content.replace("```json", "").replace("```", "").strip()
            return json.loads(content)
        except Exception as e:
            print(f"LLM Error sharing questions: {e}")
            return []
