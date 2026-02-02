
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "mock-key");
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function POST(request) {
  try {
    const { jd, candidate_data } = await request.json();

    const prompt = `
      CRITICAL EVALUATION RULES:
      1. 'GLOBAL SKILL MATCHING': Scan all sections (Projects, Work Experience, Skills List). If a candidate has used a tech in a project, they HAVE the skill. 
      2. 'EVIDENCE PEERING': Prioritize hands-on work in 'projects' or 'experience' over simple keyword strings.
      3. 'FAIRNESS AUDIT': Benchmark the candidate against the seniority level of the JD. Identify "keyword stuffing" (listing skills without project evidence).
      4. 'GENUINE ANALYSIS': Do not be overly generous. If there is a gap, highlight it. If a project is impressive, credit it.
      5. 'MULTI-LEVEL SCORING': Break down the evaluation into specific dimensions: Technical, Experience, Education, Soft Skills, and Culture Alignment.

      Job Description:
      "${jd}"

      Candidate Profile:
      ${JSON.stringify(candidate_data)}

      Output your analysis in strictly valid JSON format.
      Structure:
      {
        "score": number (Overall calculated average 0-100),
        "sub_scores": {
          "technical": number (0-100),
          "experience": number (0-100),
          "education": number (0-100),
          "soft_skills": number (0-100),
          "culture": number (0-100)
        },
        "fairness_audit": {
          "evidence_density": "high|medium|low",
          "seniority_alignment": "junior|mid|senior|mismatch",
          "notes": "Direct comments on the genuineness of the claims"
        },
        "analysis": {
          "strengths": ["Evidence-based Strength 1", "Evidence-based Strength 2"],
          "weaknesses": ["Specific Missing Requirement 1", "Specific Gap 2"],
          "reasoning": "A direct, auditor-style explanation of the final decision."
        }
      }
    `;

    // 1. Try Groq (Llama 3) - Primary
    if (groq) {
        try {
            console.log("Attempting Groq Scoring...");
            const completion = await groq.chat.completions.create({
                messages: [{ role: "system", content: "You are a precise technical auditor. You provide objective, critical assessments." }, { role: "user", content: prompt }],
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
