
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "mock-key");
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function POST(request) {
  try {
    const { jd, candidate_data, persona = 'expert' } = await request.json();

    const personaDescriptions = {
        expert: "You are an Expert Auditor. You are skeptical, precise, and prioritize deep technical evidence and proven seniority. Your tone is professional and slightly critical.",
        hacker: "You are a Startup Hacker. You prioritize speed, versatility, and candidates who have built real things from scratch. Your tone is energetic, informal, and moves fast.",
        architect: "You are a System Architect. You prioritize scalability, clean code, documentation, and long-term architectural thinking. Your tone is methodical and focused on the 'big picture'."
    };

    const currentPersona = personaDescriptions[persona] || personaDescriptions.expert;

    const prompt = `
      PERSONA: ${currentPersona}

      CRITICAL EVALUATION RULES:
      1. 'GLOBAL SKILL MATCHING': Scan all sections (Projects, Work Experience, Skills List). If a candidate has used a tech in a project, they HAVE the skill. 
      2. 'EVIDENCE PEERING': Prioritize hands-on work in 'projects' or 'experience' over simple keyword strings.
      3. 'FAIRNESS AUDIT': Benchmark the candidate against the seniority level of the JD.
      4. 'GENUINE ANALYSIS': Be highly opinionated. If a hacker, prioritize builds. If an auditor, prioritize proof.
      5. 'MULTI-ROUND INTERVIEW PREP': Generate 15 questions in total, exactly 5 for each of the following rounds:
         - 'Technical': Focus on core engineering, logic, and 'DSA (Data Structures & Algorithms)'.
         - 'Culture': Behavioral insights, conflict resolution, and growth mindset.
         - 'Systems': Architecture, scalability, database design, and high-level patterns.
      6. 'POTENTIAL PROJECTION': Predict where this candidate will be in 3-5 years.

      Job Description:
      "${jd}"

      Candidate Profile:
      ${JSON.stringify(candidate_data)}

      Output your analysis in strictly valid JSON format. Ensure the JSON is complete and not truncated.
      Structure:
      {
        "score": number,
        "recommendation": "Strong Hire|Hire|Maybe|Rejected",
        "confidence": number,
        "analysis": {
          "sub_scores": {
            "technical": number, "experience": number, "education": number, "soft_skills": number, "culture": number
          },
          "strengths": ["string"],
          "weaknesses": ["string"],
          "reasoning": "A detailed 3-5 sentence analysis in your persona.",
          "highlights": ["string"],
          "red_flags": ["string"],
          "candidate_feedback": "string",
          "fairness_audit": {
            "evidence_density": "high|medium|low",
            "seniority_alignment": "junior|mid|senior|mismatch",
            "notes": "string"
          },
          "interview_questions": [
             { "round": "Technical|Culture|Systems", "question": "string", "expected_answer": "string" }
          ],
          "career_projection": {
             "trajectory": "fast|steady|plateau",
             "potential_role": "string",
             "growth_areas": ["string"]
          }
        }
      }
    `;

    // 1. Try Groq (Llama 3) - Primary
    if (groq) {
        try {
            console.log("Attempting Groq Scoring...");
            const completion = await groq.chat.completions.create({
                messages: [{ role: "system", content: currentPersona }, { role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" }
            });
            const content = completion.choices[0]?.message?.content;
            if (content) return NextResponse.json(JSON.parse(content));
        } catch (e) {
            console.error("Groq Scoring Failed (Falling back):", e.message);
        }
    }

    // 2. Try Gemini - Secondary
    try {
        console.log("Attempting Gemini Scoring...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); 
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        return NextResponse.json(JSON.parse(jsonString));
    } catch (e) {
        console.error("Gemini Scoring Failed (Falling back):", e.message);
    }

    // 3. Fallback - Safety Net (No more 85% fake scores)
    return NextResponse.json({ 
        score: 0, 
        sub_scores: { technical: 0, experience: 0, education: 0, soft_skills: 0, culture: 0 },
        fairness_audit: { evidence_density: "low", seniority_alignment: "mismatch", notes: "System fallback triggered." },
        analysis: { 
            strengths: ["None detected"], 
            weaknesses: ["AI analysis failed or timed out"], 
            reasoning: "System could not generate a precise score at this time. Defaulting to zero for safety." 
        } 
    });

  } catch (error) {
    console.error("Scoring Fatal Error:", error);
    // Absolute safety net
    return NextResponse.json({ 
        score: 0, 
        analysis: { 
            strengths: ["System Error"], 
            weaknesses: ["Check logs"], 
            reasoning: "Critical system failure during scoring." 
        } 
    });
  }
}
