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

    const systemPrompt = `
      You are an AI assistant helping a recruiter. You are analyzing the profile of a candidate named ${candidate.name}.
      
      Candidate Data:
      ${JSON.stringify(candidate)}

      User Question: "${message}"

      Answer the user's question based strictly on the candidate's data provided above. 
      Be professional, concise, and helpful. If the information is not in the data, state that clearly.
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

    // 3. Fallback Mock (Demo Mode)
    const mockResponses = [
        "Based on the candidate's profile, they have strong frontend skills, particularly in React.",
        "Yes, the experience listed aligns well with the Senior Engineer role.",
        "I noticed they have a gap in cloud infrastructure knowledge, but their coding scores are high.",
        "Could you clarify which specific skill you are interested in?",
         "This candidate has a solid educational background relevant to the job description."
    ];
    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    
    return NextResponse.json({ 
        role: "assistant", 
        content: `(Demo Mode) ${randomResponse}` 
    });

  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json({ error: "Chat processing failed" }, { status: 500 });
  }
}
