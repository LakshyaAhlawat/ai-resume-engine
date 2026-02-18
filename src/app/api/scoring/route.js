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
      GROUND TRUTH RULES (STRICT AUDIT):
      1. ONLY mention skills as "Strengths" if they appear EXPLICITLY in the resume (Work Exp or Skills section).
      2. STACK MISMATCH PENALTY: If JD requires React and resume only has Backend/ML, the Technical score MUST be capped at 30.
      3. No "transferable" bonus for mismatched stacks. Be brutal.
      4. DO NOT assume proficiency in core JS if JD is React and they only used Python.

      SCORE CALCULATION:
      - "score": (integer 0-100) - The final AGGREGATED match score.
      - Every sub-score MUST also be a plain integer 0-100.

      Output format (JSON):
      {
        "score": number, // Pure integer 0-100
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
          "strengths": ["string"],
          "weaknesses": ["string"],
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
