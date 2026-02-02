import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "mock-key");
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let rawText = "";

    // 1. Extract Text from File (Server-Side)
    try {
        if (file.type === 'application/pdf') {
            console.log("📄 Attempting PDF text extraction...");
            // Use pdf-parse-fork which works better in Next.js
            const pdfParse = (await import('pdf-parse-fork')).default;
            const data = await pdfParse(buffer);
            rawText = data.text;
            console.log(`✅ PDF extracted: ${rawText.length} chars`);
        } else if (file.type.includes('word') || file.name.endsWith('.docx')) {
            console.log("📄 Attempting DOCX text extraction...");
            const mammothModule = await import('mammoth');
            const extractRawText = mammothModule.extractRawText || mammothModule.default?.extractRawText;
            
            if (extractRawText) {
                 const result = await extractRawText({ buffer: buffer });
                 rawText = result.value;
                 console.log(`✅ DOCX extracted: ${rawText.length} chars`);
            }
        } else {
            // Fallback for plain text or unknown
            rawText = buffer.toString('utf-8');
        }
    } catch (e) {
        console.error("❌ Text Extraction Failed:", e.message);
        rawText = ""; 
    }

    // 2. Try Groq (Llama 3) with Extracted Text - Priority 1
    if (groq && rawText.length > 50) {
        try {
            console.log("✅ GROQ PARSING ATTEMPT");
            console.log(`📄 Text extracted: ${rawText.length} characters`);
            console.log(`📝 First 200 chars: ${rawText.slice(0, 200)}`);
            
            const truncatedText = rawText.slice(0, 30000); 

            const completion = await groq.chat.completions.create({
                messages: [
                    { 
                        role: "system", 
                        content: "You are a world-class resume parser. Your goal is 100% accuracy across all resume formats (single-column, multi-column, functional, or creative).\n\nFIELDS TO EXTRACT:\n1. name, email, phone, location\n2. skills: A unified array of all detectable technical skills mentioned ANYWHERE in the resume (Projects, Experience, Education, or Skills sections).\n3. projects: Array of {title, description, technologies}\n4. experience: Array of {role, company, duration, key_points}\n5. education: string\n6. career_level: A string representing the candidate's seniority (e.g., 'Beginner', 'Junior (1-2 yrs)', 'Mid-Level (3-5 yrs)', 'Senior (5+ yrs)'). \n\nCRITICAL INSTRUCTIONS:\n- 'Experience Calculation': Calculate 'career_level' logically. Check 'Work Experience' first. If empty, analyze the 'Projects' section for technical depth. If both are thin, default to 'Beginner'. \n- 'Unified Skills': If a candidate mentions 'React' in a project but not in a skills list, it MUST be included in the 'skills' array.\n- 'Layout Resilience': The text may be jumbled from multi-column layouts. Reconstruct the logical context to ensure nothing is missed.\n- 'JSON Only': Return ONLY valid JSON." 
                    },
                    { role: "user", content: truncatedText }
                ],
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" }
            });
            
            const content = completion.choices[0]?.message?.content;
            console.log("✅ GROQ RESPONSE RECEIVED");
            
            if (content) {
                const parsedData = JSON.parse(content);
                console.log("✅ GROQ PARSING SUCCESS - Returning real data");
                console.log(`Parsed name: ${parsedData.name}`);
                return NextResponse.json({
                    filename: file.name,
                    parsed_data: parsedData
                });
            }
        } catch (e) {
            console.error("❌ GROQ PARSING FAILED:", e.message);
        }
    } else {
        console.log("⚠️ SKIPPING GROQ:");
        console.log(`  - Groq initialized: ${!!groq}`);
        console.log(`  - Text length: ${rawText.length}`);
    }

    // 3. Fallback Mock - Last Resort
    console.log("⚠️ Using fallback mock data");
    return NextResponse.json({
      filename: file.name,
      parsed_data: {
        name: "Demo Candidate (AI Extraction Failed)",
        email: "demo@example.com",
        skills: ["React", "Node.js", "System Design"],
        experience: "Could not extract details from file. Please verify file format.",
        education: "Unknown"
      }
    });

  } catch (error) {
    console.error("❌ Parsing Fatal Error:", error);
    return NextResponse.json({ error: "Parsing failed" }, { status: 500 });
  }
}
