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
                    content: `You are an Ultra-Strict AI Referee for competitive programming. You must:
1. GENERATE EXACTLY 300 UNIQUE TEST CASES covering:
   - Basic examples from the problem statement
   - Edge cases (empty input, single element, all same values, max/min constraints)
   - Boundary cases (N=0, N=1, N=max)
   - Large random inputs at constraint limits
   - Negative values, zeros, duplicates
   - Sorted/reverse-sorted/random order inputs
   - Special patterns (alternating, palindromic, fibonacci-like)
2. MENTALLY EXECUTE the submitted code against ALL 300 test cases
3. If ANY test case fails, report the FIRST failing case with:
   - The exact input
   - The expected correct output
   - The actual output the code would produce
   - The test case number (1-indexed)
4. Check time complexity against constraints. If code is O(N²) but needs O(N log N), mark as TLE.
5. Check space complexity against constraints.
6. ENFORCE: Every test case must be unique. No duplicates allowed.`
                },
                {
                    role: "user",
                    content: `
Evaluate this ${language.toUpperCase()} code against 300 unique test cases.

QUESTION:
Title: ${question.title || "Unknown"}
Description: ${question.description || "No description"}
Constraints: ${JSON.stringify(question.constraints || [])}
Examples: ${JSON.stringify(question.examples || [])}

CODE:
\`\`\`${language}
${code}
\`\`\`

${isTestMode ? "MODE: TEST (Quick validation against all 300 cases)" : `MODE: SUBMIT (Full forensic analysis. Time taken: ${timeTaken}s)`}

CRITICAL INSTRUCTIONS:
- Generate 300 UNIQUE test cases internally (edge cases, random, boundary, stress tests)
- Dry-run the code MENTALLY against each test case
- If a test fails, STOP and report it as the first failure
- Report total passed vs total (e.g., "passed 187/300")

Return ONLY valid JSON:
{
    "score": number (0-100, based on % of tests passed and code quality),
    "feedback": "Technical critique: what went wrong or why it's correct",
    "isCorrect": boolean (true ONLY if ALL 300 pass),
    "passCount": number (how many of 300 passed),
    "totalCount": 300,
    "errorType": "TLE" | "MLE" | "WA" | "RE" | null,
    "failedTestNumber": number | null (1-indexed, which test case failed first),
    "failedTests": [
        {
            "testNumber": number,
            "input": "exact input that failed",
            "expected": "correct expected output",
            "actual": "what the code would return",
            "reason": "WA / TLE / RE / MLE"
        }
    ] (include up to 3 failing tests, starting from the first failure),
    "timeComplexity": "O(...)",
    "spaceComplexity": "O(...)",
    "idealSolution": "Complete working C++ solution code"
}
                    `
                }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const evalResult = JSON.parse(completion.choices[0]?.message?.content || "{}");
        
        // Ensure totalCount is always 300
        evalResult.totalCount = 300;
        if (evalResult.passCount === undefined) evalResult.passCount = evalResult.isCorrect ? 300 : 0;
        
        return NextResponse.json(evalResult);
    } catch (error) {
        console.error("Groq Referee Error:", error);
        return NextResponse.json({
            score: 0,
            feedback: `Referee engine failure: ${error.message || "Unknown error"}`,
            isCorrect: false,
            passCount: 0,
            totalCount: 300,
            errorType: "Internal Error",
            failedTests: [],
            timeComplexity: "Unknown",
            spaceComplexity: "Unknown",
        });
    }
}
