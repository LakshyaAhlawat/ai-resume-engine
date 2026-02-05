import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function POST(request) {
  try {
    const { message, candidate } = await request.json();

    if (!groq) {
      return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 });
    }

    if (!message) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    // Clean candidate data for the prompt (remove large binary strings)
    const cleanCandidate = { ...candidate };
    delete cleanCandidate.resumeFile;

    const systemPrompt = `
      You are a precise and critical technical auditor analyzing a candidate named ${cleanCandidate.name} using Llama 3 intelligence.
      Your job is to provide objective, no-nonsense answers to the recruiter's questions. 
      
      CRITICAL INSTRUCTIONS:
      1. Do NOT be overly generous or "nice". 
      2. If the candidate lacks a skill or experience, state it plainly. 
      3. Use "extracted_data" as your primary source of truth.
      4. Support your answers with specific evidence from the candidate's work experience or projects.
      5. Strictly follow the user's request for formatting.

      Candidate Data:
      ${JSON.stringify(cleanCandidate)}

      User Question: "${message}"
    `;

    const completion = await groq.chat.completions.create({
        messages: [
            { role: "system", content: "You are a professional technical recruiter assistant." },
            { role: "user", content: systemPrompt }
        ],
        model: "llama-3.3-70b-versatile",
    });

    return NextResponse.json({
        role: 'assistant',
        content: completion.choices[0]?.message?.content || "No response from Groq."
    });

  } catch (error) {
    console.error("Groq Chat Error:", error);
    return NextResponse.json({ error: "Chat processing failed in Groq engine" }, { status: 500 });
  }
}
