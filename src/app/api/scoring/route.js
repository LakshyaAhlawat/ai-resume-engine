
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "mock-key");
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function POST(request) {
  try {
    const { jd, candidate_data, persona = 'expert', company_culture = 'Velocity, Transparency, Extreme Ownership' } = await request.json();

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

      Output format (JSON):
      {
        "score": number,
        "recommendation": "Strong Hire|Hire|Maybe|Rejected",
        "confidence": number,
        "analysis": {
          "sub_scores": { "technical": number, "experience": number, "culture": number },
          "reasoning": "string",
          "interview_questions": [{ "round": "string", "question": "string" }],
          "culture_radar": [{ "value": "string", "score": number }]
        }
      }
    `;

    // --- PRODUCTION LEVEL: Consensus Scoring ---
    // We run both models in parallel to eliminate single-model bias.
    
    const [groqResult, geminiResult] = await Promise.allSettled([
        // Groq Execution
        (async () => {
            if (!groq) throw new Error("Groq not configured");
            const completion = await groq.chat.completions.create({
                messages: [{ role: "system", content: currentPersona }, { role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" }
            });
            return JSON.parse(completion.choices[0]?.message?.content);
        })(),
        // Gemini Execution
        (async () => {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
            const result = await model.generateContent(prompt);
            const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(text);
        })()
    ]);

    let finalData = null;
    let variance = 0;

    const groqData = groqResult.status === 'fulfilled' ? groqResult.value : null;
    const geminiData = geminiResult.status === 'fulfilled' ? geminiResult.value : null;

    if (groqData && geminiData) {
        // Consensus achieved! Calculate weighted average
        const avgScore = Math.round((groqData.score * 0.4) + (geminiData.score * 0.6));
        variance = Math.abs(groqData.score - geminiData.score);
        
        finalData = {
            ...geminiData, // Default to Gemini's rich structure
            score: avgScore,
            consensus_metrics: {
                groq_score: groqData.score,
                gemini_score: geminiData.score,
                variance: variance,
                reliability: variance < 15 ? "High" : "Manual Review Recommended"
            }
        };
    } else {
        // Fallback to whichever one succeeded
        finalData = geminiData || groqData || { score: 0, analysis: { reasoning: "Both AI models failed." }};
    }

    return NextResponse.json(finalData);

  } catch (error) {
    console.error("Scoring Fatal Error:", error);
    return NextResponse.json({ score: 0, error: "Critical failure" }, { status: 500 });
  }
}
