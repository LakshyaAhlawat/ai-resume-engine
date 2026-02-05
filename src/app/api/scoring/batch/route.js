import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function POST(request) {
  try {
    const { candidates } = await request.json();

    if (!groq) {
        return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 });
    }

    if (!candidates || candidates.length < 2) {
        return NextResponse.json({ error: "At least 2 candidates are required for batch analysis." }, { status: 400 });
    }

    const prompt = `
      ROLE: You are an Elite Hiring Committee Lead.
      
      TASK: Conduct a comparative trade-off analysis between these ${candidates.length} candidates.
      
      CANDIDATES:
      ${candidates.map(c => `
        - Name: ${c.name}
        - Current Score: ${c.score}%
        - Sub-scores: ${JSON.stringify(c.analysis?.sub_scores)}
        - Technical Strengths: ${c.analysis?.strengths?.join(', ')}
        - Experience Gaps: ${c.analysis?.weaknesses?.join(', ')}
        - Summary: ${c.analysis?.reasoning}
      `).join('\n')}

      INSTRUCTIONS:
      1. Compare them head-to-head based on technical depth vs experience.
      2. Identify who has the "Highest Ceiling" for growth vs "Lowest Risk" for immediate impact.
      3. Nominate a "Top Pick" and provide a 2-sentence winning rationale.
      4. Provide a confidence score for your recommendation.

      Output format (JSON):
      {
        "top_pick": "string (The name of the candidate)",
        "winning_rationale": "string (Concise reasoning)",
        "confidence": number (0-100),
        "trade_offs": [
            { "candidate": "string", "edge": "string", "risk": "string" }
        ]
      }
    `;

    const completion = await groq.chat.completions.create({
        messages: [
            { role: "system", content: "You are an Elite Hiring Committee Lead using Llama 3 intelligence." },
            { role: "user", content: prompt }
        ],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" }
    });
    
    return NextResponse.json(JSON.parse(completion.choices[0]?.message?.content));

  } catch (error) {
    console.error("Batch Groq Scoring Error:", error);
    return NextResponse.json({ error: "Failed to generate batch intelligence via Groq" }, { status: 500 });
  }
}
