
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "mock-key");
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function POST(request) {
  try {
    const { candidate_data, jd, company_values = "Velocity, Transparency, Extreme Ownership" } = await request.json();

    if (!candidate_data || !jd) {
       return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    const prompt = `
      You are an Executive Onboarding Coach. 
      Architect a personalized 30-60-90 Day Success Roadmap for this new hire.
      
      NEW HIRE: ${candidate_data.name}
      BACKGROUND: ${JSON.stringify(candidate_data.extracted_data)}
      ROLE (JD): "${jd}"
      COMPANY VALUES: "${company_values}"

      Output format (JSON):
      {
        "phases": [
          { "period": "Days 1-30", "focus": "string", "milestones": ["string"] },
          { "period": "Days 31-60", "focus": "string", "milestones": ["string"] },
          { "period": "Days 61-90", "focus": "string", "milestones": ["string"] }
        ],
        "cultural_rituals": ["string"],
        "friction_mitigation": [
           { "risk": "string", "solution": "string"}
        ]
      }
    `;

    // 1. Try Gemini
    try {
      console.log("Attempting Gemini Onboarding...");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleanJson = text.replace(/```json|```/gi, "").trim();
      return NextResponse.json(JSON.parse(cleanJson));
    } catch (e) {
      console.error("Gemini Onboarding Failed, falling back:", e.message);
    }

    // 2. Try Groq
    if (groq) {
      try {
        console.log("Attempting Groq Onboarding...");
        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" }
        });
        const content = completion.choices[0]?.message?.content;
        if (content) return NextResponse.json(JSON.parse(content));
      } catch (e) {
        console.error("Groq Onboarding Failed:", e.message);
      }
    }

    return NextResponse.json({ error: 'Failed to architect success roadmap' }, { status: 500 });
  } catch (error) {
    console.error("Onboarding Fatal Error:", error);
    return NextResponse.json({ error: 'Failed to architect success roadmap' }, { status: 500 });
  }
}
