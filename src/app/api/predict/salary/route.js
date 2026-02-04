
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "mock-key");
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function POST(request) {
  try {
    const { jd, candidate_data, location = 'Global' } = await request.json();

    if (!jd || !candidate_data) {
       return NextResponse.json({ error: 'Missing JD or candidate context' }, { status: 400 });
    }

    const prompt = `
      You are a Compensation & Benefits Expert. Predict a fair market salary range for the following role and candidate.
      
      LOCATION: ${location}
      JOB TITLE/JD: "${jd}"
      CANDIDATE EXPERIENCE: ${JSON.stringify(candidate_data)}

      INSTRUCTIONS:
      1. Suggest a Low, Mid, and High salary bracket in USD.
      2. Provide a "Value Proposition".
      3. Identify "Negotiation Leverage Points".

      Output format (JSON):
      {
        "range": { "low": "string", "mid": "string", "high": "string" },
        "currency": "USD",
        "value_proposition": "string",
        "leverage_points": ["string"],
        "market_confidence": number (1-100)
      }
    `;

    // 1. Try Gemini
    try {
      console.log("Attempting Gemini Salary Prediction...");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleanJson = text.replace(/```json|```/gi, "").trim();
      return NextResponse.json(JSON.parse(cleanJson));
    } catch (e) {
      console.error("Gemini Salary Failed, falling back:", e.message);
    }

    // 2. Try Groq
    if (groq) {
      try {
        console.log("Attempting Groq Salary Prediction...");
        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" }
        });
        const content = completion.choices[0]?.message?.content;
        if (content) return NextResponse.json(JSON.parse(content));
      } catch (e) {
        console.error("Groq Salary Failed:", e.message);
      }
    }

    return NextResponse.json({ error: 'Market prediction unavailable' }, { status: 500 });
  } catch (error) {
    console.error("Salary Prediction Fatal Error:", error);
    return NextResponse.json({ error: 'Market prediction unavailable' }, { status: 500 });
  }
}
