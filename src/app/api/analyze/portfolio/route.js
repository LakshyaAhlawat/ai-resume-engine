
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "mock-key");
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function POST(request) {
  try {
    const { portfolio_url, candidate_data } = await request.json();

    if (!portfolio_url || !candidate_data) {
       return NextResponse.json({ error: 'Missing portfolio URL or candidate data' }, { status: 400 });
    }

    const prompt = `
      You are a Technical Researcher. Analyze the following candidate's technical depth based on their resume and a provided portfolio link.
      
      PORTFOLIO URL: ${portfolio_url}
      CANDIDATE DATA: ${JSON.stringify(candidate_data)}

      INSTRUCTIONS:
      1. Analyze the technical complexity of the projects mentioned in their resume.
      2. Provide a "Technical Depth Assessment" based on the patterns found in their claimed tech stack.
      3. Identify "Advanced Proficiency Markers".
      4. Suggest 3 specific "Deep-Dive" questions for the technical interview.

      Output strictly in JSON:
      {
        "depth_score": number (1-100),
        "assessment": "string",
        "proficiency_markers": ["string"],
        "deep_dive_questions": ["string"]
      }
    `;

    // 1. Try Gemini
    try {
      console.log("Attempting Gemini Portfolio Research...");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleanJson = text.replace(/```json|```/gi, "").trim();
      return NextResponse.json(JSON.parse(cleanJson));
    } catch (e) {
      console.error("Gemini Research Failed, falling back:", e.message);
    }

    // 2. Try Groq
    if (groq) {
      try {
        console.log("Attempting Groq Portfolio Research...");
        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" }
        });
        const content = completion.choices[0]?.message?.content;
        if (content) return NextResponse.json(JSON.parse(content));
      } catch (e) {
        console.error("Groq Research Failed:", e.message);
      }
    }

    return NextResponse.json({ error: 'Research failed' }, { status: 500 });
  } catch (error) {
    console.error("Portfolio Researcher Fatal Error:", error);
    return NextResponse.json({ error: 'Research failed' }, { status: 500 });
  }
}
