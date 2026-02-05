import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function POST(request) {
  try {
    const { jd, candidate_data, round, user_query } = await request.json();

    if (!groq) {
      return NextResponse.json({ error: 'Groq API key not configured' }, { status: 500 });
    }

    if (!jd || !candidate_data || !round) {
      return NextResponse.json({ error: 'Missing required context' }, { status: 400 });
    }

    const prompt = `
      You are an elite technical interviewer using Llama 3 intelligence.
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

    const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" }
    });

    const data = JSON.parse(completion.choices[0]?.message?.content);

    return NextResponse.json(data);

  } catch (error) {
    console.error("Add-on Question Error (Groq):", error);
    return NextResponse.json({ error: 'Failed to generate extra question via Groq' }, { status: 500 });
  }
}
