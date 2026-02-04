
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "mock-key");
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function POST(request) {
  try {
    const { candidate_data, current_jd } = await request.json();

    if (!candidate_data) {
       return NextResponse.json({ error: 'Missing candidate data' }, { status: 400 });
    }

    const prompt = `
      You are a Talent Strategy Architect. 
      Analyze this candidate who might be a "mismatch" for the current JD, and propose a NEW, high-impact role they could fill.
      
      CANDIDATE PROFILE: ${JSON.stringify(candidate_data)}
      CURRENT ATTEMPTED ROLE: "${current_jd}"

      INSTRUCTIONS:
      1. Identify their "Hidden Superpowers".
      2. Architect a "Proposed Role Title".
      3. Draft a "Business Impact" statement.
      4. Suggest "Success Metrics" for the first 90 days.

      Output format (JSON):
      {
        "proposed_role": "string",
        "superpowers": ["string"],
        "business_value": "string",
        "milestones": ["string"],
        "pivot_rationale": "string"
      }
    `;

    // 1. Try Gemini
    try {
      console.log("Attempting Gemini Role Architect...");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleanJson = text.replace(/```json|```/gi, "").trim();
      return NextResponse.json(JSON.parse(cleanJson));
    } catch (e) {
      console.error("Gemini Role Architect Failed, falling back:", e.message);
    }

    // 2. Try Groq
    if (groq) {
      try {
        console.log("Attempting Groq Role Architect...");
        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" }
        });
        const content = completion.choices[0]?.message?.content;
        if (content) return NextResponse.json(JSON.parse(content));
      } catch (e) {
        console.error("Groq Role Architect Failed:", e.message);
      }
    }

    return NextResponse.json({ error: 'Failed to architect a new path' }, { status: 500 });
  } catch (error) {
    console.error("Role Architect Fatal Error:", error);
    return NextResponse.json({ error: 'Failed to architect a new path' }, { status: 500 });
  }
}
