
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "mock-key");

export async function POST(request) {
  try {
    const { candidates } = await request.json();

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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    return NextResponse.json(JSON.parse(text));

  } catch (error) {
    console.error("Batch Scoring Error:", error);
    return NextResponse.json({ error: "Failed to generate batch intelligence" }, { status: 500 });
  }
}
