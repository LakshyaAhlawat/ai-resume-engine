import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function GET() {
  const logs = [];
  
  try {
    logs.push("Step 1: Checking Groq initialization...");
    logs.push(`Groq client exists: ${!!groq}`);
    logs.push(`API Key present: ${!!process.env.GROQ_API_KEY}`);
    
    if (!groq) {
      return NextResponse.json({ error: "Groq not initialized", logs });
    }
    
    logs.push("Step 2: Testing Groq API call...");
    
    const testResume = `
      John Doe
      Email: john.doe@email.com
      
      Skills: React, Node.js, Python, AWS, Docker
      
      Experience: Senior Software Engineer at TechCorp (2020-2024)
      Built scalable microservices architecture serving 1M+ users.
      
      Education: BS Computer Science, MIT
    `;
    
    const completion = await groq.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are a resume parser. Extract: name, email, skills (array), experience (summary), education. Return ONLY valid JSON." 
        },
        { role: "user", content: testResume }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });
    
    logs.push("Step 3: Groq API call successful!");
    const content = completion.choices[0]?.message?.content;
    logs.push(`Response received: ${content ? 'YES' : 'NO'}`);
    
    if (content) {
      const parsed = JSON.parse(content);
      logs.push("Step 4: JSON parsing successful!");
      return NextResponse.json({ 
        success: true, 
        logs, 
        parsed_data: parsed 
      });
    }
    
    return NextResponse.json({ error: "No content in response", logs });
    
  } catch (error) {
    logs.push(`ERROR: ${error.message}`);
    return NextResponse.json({ error: error.message, logs }, { status: 500 });
  }
}
