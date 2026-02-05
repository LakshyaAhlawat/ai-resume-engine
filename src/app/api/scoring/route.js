import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function POST(request) {
  try {
    const { jd, candidate_data, persona = 'expert', company_culture = 'Velocity, Transparency, Extreme Ownership' } = await request.json();

    if (!groq) {
      return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 });
    }

    const personaDescriptions = {
        expert: "You are an Expert Auditor. You are skeptical, precise, and prioritize deep technical evidence and proven seniority.",
        hacker: "You are a Startup Hacker. You prioritize speed, versatility, and candidates who have built real things from scratch.",
        architect: "You are a System Architect. You prioritize scalability, clean code, and long-term architectural thinking."
    };

    const currentPersona = personaDescriptions[persona] || personaDescriptions.expert;

    const prompt = `
      PERSONA: ${currentPersona}
      CULTURE: "${company_culture}"
      
      TASK: Conduct a MISSION-CRITICAL evaluation of this candidate.
      
      Job Description: "${jd}"
      Candidate: ${JSON.stringify(candidate_data)}

      INTERVIEW QUESTIONS GENERATION RULES:
      1. Generate EXACTLY 15 questions in total.
      2. EXACTLY 5 for the "Technical" round.
      3. EXACTLY 5 for the "Culture" round.
      4. EXACTLY 5 for the "Systems" round.
      5. Every question MUST have a detailed "expected_answer" (Look for in the answer).
      6. Each question should be unique and map specifically to the candidate's resume vs JD gaps.

      Output format (JSON):
      {
        "score": number,
        "recommendation": "Strong Hire|Hire|Maybe|Rejected",
        "confidence": number,
        "analysis": {
          "sub_scores": { 
            "technical": number, 
            "experience": number, 
            "education": number, 
            "soft_skills": number, 
            "culture": number 
          },
          "reasoning": "string",
          "interview_questions": [
            { "round": "Technical", "question": "Technical Q1", "expected_answer": "..." },
            { "round": "Technical", "question": "Technical Q2", "expected_answer": "..." },
            { "round": "Technical", "question": "Technical Q3", "expected_answer": "..." },
            { "round": "Technical", "question": "Technical Q4", "expected_answer": "..." },
            { "round": "Technical", "question": "Technical Q5", "expected_answer": "..." },
            { "round": "Culture", "question": "Culture Q1", "expected_answer": "..." },
            { "round": "Culture", "question": "Culture Q2", "expected_answer": "..." },
            { "round": "Culture", "question": "Culture Q3", "expected_answer": "..." },
            { "round": "Culture", "question": "Culture Q4", "expected_answer": "..." },
            { "round": "Culture", "question": "Culture Q5", "expected_answer": "..." },
            { "round": "Systems", "question": "Systems Q1", "expected_answer": "..." },
            { "round": "Systems", "question": "Systems Q2", "expected_answer": "..." },
            { "round": "Systems", "question": "Systems Q3", "expected_answer": "..." },
            { "round": "Systems", "question": "Systems Q4", "expected_answer": "..." },
            { "round": "Systems", "question": "Systems Q5", "expected_answer": "..." }
          ],
          "culture_radar": [{ "value": "string", "score": number }],
          "market_gap_analysis": {
            "trending_skills_missing": ["string"],
            "unique_market_leverage": "string",
            "demand_forecast": "Low|Medium|High"
          },
          "interview_prep_kit": {
            "killer_questions": [{ "question": "string", "expected_answer": "string", "trap_to_avoid": "string" }],
            "recruiter_cheat_sheet": "string"
          },
          "career_arc": {
            "title_2_year": "string",
            "title_5_year": "string",
            "title_10_year": "string",
            "growth_trajectory": "Linear|Exponential|Managerial|Specialist",
            "milestone_prediction": "string"
          },
          "team_dynamics": {
            "archetype": "Visionary|Executor|Diplomat|Analyst",
            "team_complementarity": "string (How they fill gaps)",
            "potential_conflict_areas": ["string"]
          },
          "skill_verification_quiz": [
            { "question": "string", "options": ["string", "string", "string", "string"], "correct_answer": "string", "difficulty": "Junior|Mid|Senior" }
          ]
        }
      }
    `;

    const completion = await groq.chat.completions.create({
        messages: [
            { role: "system", content: `You are a world-class recruitment AI operating in ${persona} mode.` },
            { role: "user", content: prompt }
        ],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" }
    });

    const finalData = JSON.parse(completion.choices[0]?.message?.content);

    return NextResponse.json(finalData);

  } catch (error) {
    console.error("Groq Scoring Fatal Error:", error);
    return NextResponse.json({ score: 0, error: "Critical failure in Groq analysis" }, { status: 500 });
  }
}
