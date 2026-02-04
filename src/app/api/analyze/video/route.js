
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "mock-key");
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function POST(request) {
  try {
    const { transcript, candidate_name } = await request.json();

    if (!transcript) {
       return NextResponse.json({ error: 'Missing transcript' }, { status: 400 });
    }

    const prompt = `
      You are an Interview Intelligence Analyst. Analyze the following interview transcript for candidate ${candidate_name}.
      
      TRANSCRIPT:
      "${transcript}"

      INSTRUCTIONS:
      1. Rate the "Technical Accuracy" (1-100).
      2. Provide a "Sentiment & Confidence" score (1-100).
      3. Identify any "Red Flags".
      4. Highlight "Golden Nuggets".
      5. Summarize the overall "Candidate Vibe".

      Output format (JSON):
      {
        "technical_score": number,
        "sentiment_score": number,
        "red_flags": ["string"],
        "golden_nuggets": ["string"],
        "vibe": "string"
      }
    `;

    // 1. Try Gemini
    try {
      console.log("Attempting Gemini Video Analysis...");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleanJson = text.replace(/```json|```/gi, "").trim();
      return NextResponse.json(JSON.parse(cleanJson));
    } catch (e) {
      console.error("Gemini Video Analysis Failed, falling back:", e.message);
    }

    // 2. Try Groq
    if (groq) {
      try {
        console.log("Attempting Groq Video Analysis...");
        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" }
        });
        const content = completion.choices[0]?.message?.content;
        if (content) return NextResponse.json(JSON.parse(content));
      } catch (e) {
        console.error("Groq Video Analysis Failed:", e.message);
      }
    }

    return NextResponse.json({ error: 'Interview analysis failed' }, { status: 500 });
  } catch (error) {
    console.error("Video Analysis Fatal Error:", error);
    return NextResponse.json({ error: 'Interview analysis failed' }, { status: 500 });
  }
}
