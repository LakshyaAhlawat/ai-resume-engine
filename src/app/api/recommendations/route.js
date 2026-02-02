import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function POST(request) {
  try {
    const { candidate, jobDescription } = await request.json();

    if (!candidate) {
      return NextResponse.json({ error: "No candidate data provided" }, { status: 400 });
    }

    // Clean candidate data for the prompt (remove large binary strings)
    const cleanCandidate = { ...candidate };
    delete cleanCandidate.resumeFile;

    const prompt = `You are a precise and critical technical auditor. Analyze this candidate and provide an objective hiring recommendation. 

CRITICAL AUDIT RULES:
1. 'Universal Skill Detection': Validate skills by looking at the entire profile. A skill used in a 'Project' counts as a verified skill.
2. 'Reliability First': Treat all resume sections (projects, experience, education) as a single pool of evidence.
3. 'Objective Assessment': Do not be overly generous. Provide a 'Hire' or 'Pass' based on evidence-based matching against the Job Description.

Candidate Profile:
- Name: ${cleanCandidate.name}
- Email: ${cleanCandidate.email || 'N/A'}
- Skills: ${cleanCandidate.extracted_data?.skills?.join(', ') || 'N/A'}
- Projects: ${JSON.stringify(cleanCandidate.extracted_data?.projects || [])}
- Experience: ${JSON.stringify(cleanCandidate.extracted_data?.experience || [])}
- Education: ${cleanCandidate.extracted_data?.education || 'N/A'}
- AI Score: ${candidate.score}/100

Job Description: ${jobDescription || 'Full Stack Engineer position'}

Provide a structured recommendation with:
1. recommendation: "Strong Hire" | "Hire" | "Maybe" | "Pass"
2. confidence: 0-100
3. reasoning: Objective explanation for the decision (recruiter-facing).
4. candidate_feedback: A professional, encouraging message for the candidate. Highlight shortcomings as growth opportunities (e.g., "Consider exploring React Server Components to strengthen your architecture skills").
5. next_steps: Array of 2-3 actions.
6. red_flags: Array of critical concerns.
7. highlights: Array of key strengths (only if they exist).

Return ONLY valid JSON.`;

    // Try Groq first
    if (groq) {
      try {
        console.log("✅ Generating precise recommendation with Groq...");
        const completion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: "You are a precise technical auditor. You provide objective, critical hierarchy-based assessments." },
            { role: "user", content: prompt }
          ],
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" }
        });

        const content = completion.choices[0]?.message?.content;
        if (content) {
          return NextResponse.json(JSON.parse(content));
        }
      } catch (e) {
        console.error("❌ Groq Recommendation Failed:", e.message);
      }
    }

    // Fallback: Generic Audit Failure (No more fake positive recommendations)
    return NextResponse.json({
      recommendation: "Pass",
      confidence: 0,
      reasoning: "Objective analysis could not be completed due to backend unavailability. Defaulting to 'Pass' for risk mitigation.",
      next_steps: ["Verify candidate data manually", "Wait for system restoration"],
      red_flags: ["System analysis unavailable"],
      highlights: []
    });

  } catch (error) {
    console.error("❌ Recommendation API Error:", error);
    return NextResponse.json({ error: "Failed to generate recommendation" }, { status: 500 });
  }
}
