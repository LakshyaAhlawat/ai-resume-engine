
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "mock-key");
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function POST(request) {
  try {
    const { message, history, candidate_name, candidate_data, jd } = await request.json();

    if (!message || !candidate_data) {
      return NextResponse.json({ error: 'Missing chat context' }, { status: 400 });
    }

    const systemPrompt = `
      ROLE: You are the virtual AI "Ghost" of the candidate ${candidate_name}.
      
      CONTEXT (Candidate Resume Data):
      ${JSON.stringify(candidate_data)}

      CONTEXT (Job Description):
      "${jd}"

      INSTRUCTIONS:
      1. Role-play as this candidate. Use "I" and "my".
      2. Answer recruiter questions based STRICTLY on your resume facts. 
      3. If asked about something NOT in your resume, pivot to a technical skill or project you HAVE.
      4. Match the tone of your seniority level.
    `;

    // 1. Try Gemini (Priority)
    try {
      console.log("Attempting Gemini Ghost Chat...");
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro",
        systemInstruction: systemPrompt
      });

      const chat = model.startChat({
          history: history || [],
          generationConfig: {
            maxOutputTokens: 500,
          },
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      return NextResponse.json({ text: response.text() });
    } catch (geminiError) {
      console.error("Gemini Ghost Chat failed, falling back to Groq:", geminiError.message);
    }

    // 2. Try Groq (Fallback)
    if (groq) {
      try {
        console.log("Attempting Groq Ghost Chat...");
        const groqHistory = history.map(h => ({
            role: h.role === 'user' ? 'user' : 'assistant',
            content: h.parts[0].text
        }));

        const completion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            ...groqHistory,
            { role: "user", content: message }
          ],
          model: "llama-3.3-70b-versatile",
        });

        const text = completion.choices[0]?.message?.content;
        if (text) return NextResponse.json({ text });
      } catch (groqError) {
        console.error("Groq Ghost Chat failed:", groqError.message);
      }
    }

    return NextResponse.json({ error: 'Ghost candidate is currently silent.' }, { status: 500 });

  } catch (error) {
    console.error("Ghost Chat Fatal Error:", error);
    return NextResponse.json({ error: 'Ghost candidate is currently silent.' }, { status: 500 });
  }
}
