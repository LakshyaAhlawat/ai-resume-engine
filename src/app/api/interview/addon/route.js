
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { jd, candidate_data, round, user_query } = await request.json();

    if (!jd || !candidate_data || !round) {
      return NextResponse.json({ error: 'Missing required context' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
      You are an elite technical interviewer.
      Generate ONE specific, high-quality interview question for the '${round}' round.
      
      CONTEXT:
      Job Description: ${jd}
      Candidate Data: ${JSON.stringify(candidate_data)}
      
      USER SPECIFIC REQUEST (Optional): ${user_query || 'Generate a relevant follow-up or extra question.'}
      
      Output ONLY a valid JSON object:
      {
        "round": "${round}",
        "question": "string",
        "expected_answer": "string"
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanJson = text.replace(/```json|```/gi, "").trim();
    const data = JSON.parse(cleanJson);

    return NextResponse.json(data);

  } catch (error) {
    console.error("Add-on Question Error:", error);
    return NextResponse.json({ error: 'Failed to generate extra question' }, { status: 500 });
  }
}
