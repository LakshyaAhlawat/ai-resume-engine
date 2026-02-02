import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "mock-key");
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function POST(request) {
  try {
    const { message, candidate } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    // Clean candidate data for the prompt (remove large binary strings)
    const cleanCandidate = { ...candidate };
    delete cleanCandidate.resumeFile;

    const systemPrompt = `
      You are a precise and critical technical auditor analyzing a candidate named ${cleanCandidate.name}.
      Your job is to provide objective, no-nonsense answers to the recruiter's questions. 
      
      CRITICAL INSTRUCTIONS:
      1. Do NOT be overly generous or "nice". 
      2. If the candidate lacks a skill or experience, state it plainly. 
      3. 'EXPERIENCE EVALUATION': When asked about skills or experience:
         - Check 'Work Experience' first.
         - If missing, analyze 'Projects' for technical depth and complexity.
         - If both are missing, categorize the candidate as a 'Beginner' for that specific area.
      4. Use "extracted_data" as your primary source of truth.
      5. Strictly follow the user's request for formatting (e.g., bullet points, numbered lists).
      6. Provide professional but direct technical assessments.

      Candidate Data:
      ${JSON.stringify(cleanCandidate)}

      User Question: "${message}"
    `;

    // 1. Try Groq (Llama 3) - High Priority for "Real AI"
    if (groq) {
        try {
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: systemPrompt }],
                model: "llama-3.3-70b-versatile",
            });
            return NextResponse.json({
                role: 'assistant',
                content: completion.choices[0]?.message?.content || "No response from Groq."
            });
        } catch (e) {
            console.error("Groq Error (Falling back):", e.message);
        }
    }

    // 2. Try Gemini - Secondary Priority
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result = await model.generateContent(systemPrompt);
        const responseText = result.response.text();
        return NextResponse.json({ role: 'assistant', content: responseText });
    } catch (e) {
        console.error("Gemini Error (Falling back):", e.message);
    }

    // 3. Fallback (Detailed fallback based on data if AI fails)
    let content = "I can see the candidate's profile, but I'm having trouble connecting to the AI brain right now. ";
    if (cleanCandidate.extracted_data?.skills) {
        content += `Based on the data, the candidate has skills in: ${cleanCandidate.extracted_data.skills.join(", ")}. `;
    }
    content += "How else can I help you today?";
    
    return NextResponse.json({ 
        role: "assistant", 
        content: content
    });

  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json({ error: "Chat processing failed" }, { status: 500 });
  }
}
