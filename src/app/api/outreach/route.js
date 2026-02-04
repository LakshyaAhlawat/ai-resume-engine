
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "mock-key");
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function POST(request) {
  try {
    const { jd, candidate_name, candidate_data, platform = 'linkedin', tone = 'professional' } = await request.json();

    if (!jd || !candidate_data) {
      return NextResponse.json({ error: 'Missing context (JD or Candidate Data)' }, { status: 400 });
    }

    const prompt = `
      You are an elite Tech Recruiter. Create a hyper-personalized outreach message for a candidate.
      
      CANDIDATE NAME: ${candidate_name}
      CANDIDATE BACKGROUND: ${JSON.stringify(candidate_data)}
      JOB DESCRIPTION: "${jd}"
      PLATFORM: ${platform}
      TONE: ${tone}

      RULES:
      1. Reference a specific project or achievement from the candidate's background.
      2. Keep it concise.
      3. Focus on "What's in it for them".
      4. DO NOT use generic placeholders like [Company Name].
      5. End with a low-friction call to action.

      Output strictly in JSON:
      {
        "subject": "string (for email only, else null)",
        "message": "string"
      }
    `;

    // 1. Try Gemini
    try {
      console.log("Attempting Gemini Talent Outreach...");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleanJson = text.replace(/```json|```/gi, "").trim();
      return NextResponse.json(JSON.parse(cleanJson));
    } catch (e) {
      console.error("Gemini Outreach Failed, falling back:", e.message);
    }

    // 2. Try Groq
    if (groq) {
      try {
        console.log("Attempting Groq Talent Outreach...");
        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" }
        });
        const content = completion.choices[0]?.message?.content;
        if (content) return NextResponse.json(JSON.parse(content));
      } catch (e) {
        console.error("Groq Outreach Failed:", e.message);
      }
    }

    return NextResponse.json({ error: 'Failed to generate outreach message' }, { status: 500 });
  } catch (error) {
    console.error("Outreach Fatal Error:", error);
    return NextResponse.json({ error: 'Failed to generate outreach message' }, { status: 500 });
  }
}
