import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
    try {
        const { code, question, mode, timeTaken, language } = await req.json();
        
        const isTestMode = mode === 'test';
        
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an Elite AI Referee with LeetCode-level strictness. You evaluate competitive programming code based on strict logic, time/space complexity, and standard DSA patterns. YOU MUST SIMULATE 100-200 DIVERSE TEST CASES INTERNALLY (including edge cases, empty inputs, large constraints, negative values, and performance-heavy scenarios). IF THE CODE VIOLATES THE GIVEN CONSTRAINTS OR COMPLEXITY REQUIREMENTS, YOU MUST MARK IT AS isCorrect: false, even if it passes some tests."
                },
                {
                    role: "user",
                    content: `
                        Evaluate the following code in ${language.toUpperCase()} based on the provided DSA question.
                        
                        QUESTION:
                        Title: ${question.title || "Unknown Challenge"}
                        Description: ${question.description || "No description provided"}
                        
                        CODE:
                        ${code}
                        
                        ${isTestMode ? "MODE: TEST (Logic validation only)" : `MODE: SUBMIT (Forensic analysis. Time taken: ${timeTaken}s)`}
                        
                        CRITICAL: Perform a strict dry-run of the code against the QUESTION constraints (e.g. N = 10^5). If the code is O(N^2) but the constraint requires O(N log N), handle it as a failure.
                        
                        Return ONLY a JSON object with this exact structure:
                        {
                            "score": number (0-100),
                            "feedback": "Sharp technical critique focused on complexity/constraints",
                            "isCorrect": boolean,
                            "passCount": number,
                            "totalCount": number,
                            "errorType": "Optional: 'TLE', 'MLE', 'WA', 'Internal Error', or null",
                            "failedTests": [
                                { "input": "...", "expected": "...", "actual": "...", "reason": "e.g. TLE / Wrong Answer" }
                            ],
                            "timeComplexity": "e.g. O(N Log N)",
                            "spaceComplexity": "e.g. O(N)",
                            "idealSolution": "Complete, working C++ code for this specific problem. MUST BE C++ ONLY."
                        }
                        
                        If in TEST mode, set complexity and rankGain to "N/A" and 0 respectively.
                    `
                }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const evalResult = JSON.parse(completion.choices[0]?.message?.content || "{}");
        return NextResponse.json(evalResult);
    } catch (error) {
        console.error("Groq Referee Error Details:", error);
        return NextResponse.json({
            score: 0,
            feedback: `Astra Referee initialization error: ${error.message || "Engine failure"}`,
            isCorrect: false,
            timeComplexity: "Unknown",
            spaceComplexity: "Unknown",
            rankGain: 0
        });
    }
}
