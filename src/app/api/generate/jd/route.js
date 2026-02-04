
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "mock-key");
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function POST(request) {
  try {
    const { role_title, key_requirements, company_context, tone = 'modern' } = await request.json();

    if (!role_title) {
       return NextResponse.json({ error: 'Missing role title' }, { status: 400 });
    }

    const prompt = `
      You are a world-class HR Strategist and ATS Optimizer. 
      Generate a professional, high-converting Job Description (JD).

      ROLE TITLE: ${role_title}
      KEY REQUIREMENTS: ${key_requirements}
      COMPANY CONTEXT: ${company_context}
      TONE: ${tone}

      Output format (JSON):
      {
        "summary": "string",
        "responsibilities": ["string"],
        "required_skills": { "technical": ["string"], "soft": ["string"] },
        "preferred": ["string"],
        "about_company": "string"
      }
    `;

    // 1. Try Gemini
    try {
      console.log("Attempting Gemini JD Generation...");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleanJson = text.replace(/```json|```/gi, "").trim();
      const data = JSON.parse(cleanJson);
      return NextResponse.json(validateJD(data));
    } catch (e) {
      console.error("Gemini JD Generation Failed, falling back:", e.message);
    }

    // 2. Try Groq
    if (groq) {
      try {
        console.log("Attempting Groq JD Generation...");
        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" }
        });
        const content = completion.choices[0]?.message?.content;
        if (content) return NextResponse.json(validateJD(JSON.parse(content)));
      } catch (e) {
        console.error("Groq JD Generation Failed:", e.message);
      }
    }

    return NextResponse.json({ error: 'Failed to architect the perfect JD' }, { status: 500 });
  } catch (error) {
    console.error("JD Generator Fatal Error:", error);
    return NextResponse.json({ error: 'Failed to architect the perfect JD' }, { status: 500 });
  }
}

function validateJD(data) {
  return {
    summary: data.summary || "No summary available.",
    responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities : [],
    required_skills: {
      technical: Array.isArray(data.required_skills?.technical) ? data.required_skills.technical : [],
      soft: Array.isArray(data.required_skills?.soft) ? data.required_skills.soft : []
    },
    preferred: Array.isArray(data.preferred) ? data.preferred : [],
    about_company: data.about_company || "No company information provided."
  };
}
