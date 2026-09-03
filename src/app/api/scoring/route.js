import { NextResponse } from 'next/server';
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireAuthOrInternal } from '@/lib/apiGuard';
import { getMarketTrends } from '@/lib/marketTrends';

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

async function getSecondOpinionScore(jd, candidate_data) {
  if (!genAI) return null;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(
      `You are an independent technical recruiter cross-checking another evaluator's work.
      Score this candidate against the job description, 0-100, strictly on resume evidence.
      Job Description: "${jd}"
      Candidate: ${JSON.stringify(candidate_data)}
      Reply with ONLY a JSON object: {"score": number}`
    );
    const text = result.response.text().replace(/```json|```/gi, "").trim();
    const parsed = JSON.parse(text);
    return typeof parsed.score === 'number' ? Math.round(parsed.score) : null;
  } catch (e) {
    console.error("Gemini second-opinion score failed:", e.message);
    return null;
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuthOrInternal(request);
    if (!auth.ok) return auth.response;

    const { jd, candidate_data, persona = 'expert', company_culture = 'Velocity, Transparency, Extreme Ownership' } = await request.json();

    if (!groq) {
      return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 });
    }

    const personaDescriptions = {
        expert: "You are an Expert Auditor. You are skeptical, precise, and prioritize deep technical evidence and proven seniority.",
        hacker: "You are a Startup Hacker. You prioritize speed, versatility, and candidates who have built real things from scratch.",
        architect: "You are a System Architect. You prioritize scalability, clean code, and long-term architectural thinking."
    };

    const currentPersona = personaDescriptions[persona] || personaDescriptions.expert;

    let marketContext = "No live market data available for this evaluation.";
    let trendingSkillNames = [];
    try {
      const trends = await getMarketTrends();
      trendingSkillNames = trends.trendingLanguages.map((l) => l.name);
      marketContext = `Skills/languages seeing the most real-world open-source momentum right now (last ${trends.windowDays} days, via GitHub): ${trendingSkillNames.join(', ')}.`;
    } catch (e) {
      console.error("Market trends unavailable for scoring context:", e.message);
    }

    const prompt = `
      PERSONA: ${currentPersona}
      CULTURE: "${company_culture}"

      TASK: Conduct a MISSION-CRITICAL evaluation of this candidate.

      Job Description: "${jd}"
      Candidate: ${JSON.stringify(candidate_data)}

      LIVE MARKET SIGNAL: ${marketContext}
      For "market_gap_analysis", ONLY reference skills from that live market signal list (or the JD) — never invent trend names.

      INTERVIEW QUESTIONS GENERATION RULES:
      1. Generate EXACTLY 15 questions in total.
      2. EXACTLY 5 for the "Technical" round.
      3. EXACTLY 5 for the "Culture" round.
      4. EXACTLY 5 for the "Systems" round.
      GROUND TRUTH RULES (STRICT AUDIT):
      1. ONLY mention skills as "Strengths" if they appear EXPLICITLY in the resume (Work Exp or Skills section).
      2. STACK MISMATCH PENALTY: If JD requires React and resume only has Backend/ML, the Technical score MUST be capped at 30.
      3. No "transferable" bonus for mismatched stacks. Be brutal.
      4. DO NOT assume proficiency in core JS if JD is React and they only used Python.

      SCORE CALCULATION:
      - "score": (integer 0-100) - The final AGGREGATED match score.
      - Every sub-score MUST also be a plain integer 0-100.

      Output format (JSON):
      {
        "score": number, // Pure integer 0-100
        "recommendation": "Strong Hire|Hire|Maybe|Rejected",
        "confidence": number,
        "analysis": {
          "sub_scores": { 
            "technical": number, 
            "experience": number, 
            "education": number, 
            "soft_skills": number, 
            "culture": number 
          },
          "strengths": ["string"],
          "weaknesses": ["string"],
          "reasoning": "string",
          "interview_questions": [
            { "round": "Technical", "question": "Technical Q1", "expected_answer": "..." },
            { "round": "Technical", "question": "Technical Q2", "expected_answer": "..." },
            { "round": "Technical", "question": "Technical Q3", "expected_answer": "..." },
            { "round": "Technical", "question": "Technical Q4", "expected_answer": "..." },
            { "round": "Technical", "question": "Technical Q5", "expected_answer": "..." },
            { "round": "Culture", "question": "Culture Q1", "expected_answer": "..." },
            { "round": "Culture", "question": "Culture Q2", "expected_answer": "..." },
            { "round": "Culture", "question": "Culture Q3", "expected_answer": "..." },
            { "round": "Culture", "question": "Culture Q4", "expected_answer": "..." },
            { "round": "Culture", "question": "Culture Q5", "expected_answer": "..." },
            { "round": "Systems", "question": "Systems Q1", "expected_answer": "..." },
            { "round": "Systems", "question": "Systems Q2", "expected_answer": "..." },
            { "round": "Systems", "question": "Systems Q3", "expected_answer": "..." },
            { "round": "Systems", "question": "Systems Q4", "expected_answer": "..." },
            { "round": "Systems", "question": "Systems Q5", "expected_answer": "..." }
          ],
          "fairness_audit": {
            "evidence_density": "string, e.g. 'High — 8/10 claims backed by explicit resume evidence'",
            "seniority_alignment": "Aligned|Under-leveled|Over-leveled",
            "notes": "one sentence on whether this score leaned on hard evidence vs assumptions"
          },
          "market_gap_analysis": {
            "demand_forecast": "Rising|Stable|Declining",
            "trending_skills_missing": ["string — ONLY from the LIVE MARKET SIGNAL list, skills the candidate lacks"],
            "unique_market_leverage": "one sentence on the candidate's strongest real-world differentiator, or 'None identified' if there isn't one"
          },
          "culture_radar": [
            { "value": "Ownership", "score": number },
            { "value": "Collaboration", "score": number },
            { "value": "Adaptability", "score": number },
            { "value": "Communication", "score": number },
            { "value": "Pace", "score": number }
          ],
          "skill_verification_quiz": [
            { "question": "string — tests a SPECIFIC skill this candidate claims on their resume", "difficulty": "Easy|Medium|Hard", "options": ["string", "string", "string", "string"], "correct_index": number },
            { "question": "string — tests a SPECIFIC skill this candidate claims on their resume", "difficulty": "Easy|Medium|Hard", "options": ["string", "string", "string", "string"], "correct_index": number },
            { "question": "string — tests a SPECIFIC skill this candidate claims on their resume", "difficulty": "Easy|Medium|Hard", "options": ["string", "string", "string", "string"], "correct_index": number },
            { "question": "string — tests a SPECIFIC skill this candidate claims on their resume", "difficulty": "Easy|Medium|Hard", "options": ["string", "string", "string", "string"], "correct_index": number }
          ]
        }
      }
      QUIZ RULES: each question must verify a skill actually listed in the candidate's resume/skills — never quiz on something they didn't claim. "correct_index" is the 0-based index into "options" of the right answer. Exactly 4 distinct options per question.
    `;

    const completion = await groq.chat.completions.create({
        messages: [
            { role: "system", content: `You are a world-class recruitment AI operating in ${persona} mode.` },
            { role: "user", content: prompt }
        ],
        model: "openai/gpt-oss-120b",
        response_format: { type: "json_object" }
    });

    const finalData = JSON.parse(completion.choices[0]?.message?.content);

    const groqScore = Math.round(Number(finalData.score) || 0);
    const geminiScore = await getSecondOpinionScore(jd, candidate_data);

    if (geminiScore !== null) {
      const variance = Math.abs(groqScore - geminiScore);
      finalData.analysis = finalData.analysis || {};
      finalData.analysis.consensus_metrics = {
        gemini_score: geminiScore,
        groq_score: groqScore,
        variance,
        reliability: variance <= 10 ? "High" : variance <= 25 ? "Medium" : "Low",
      };
    }

    return NextResponse.json(finalData);

  } catch (error) {
    console.error("Groq Scoring Fatal Error:", error);
    return NextResponse.json({ score: 0, error: "Critical failure in Groq analysis" }, { status: 500 });
  }
}
