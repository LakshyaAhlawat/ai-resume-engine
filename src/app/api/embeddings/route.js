import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function chunkText(text, maxLength = 1000) {
  const chunks = [];
  let currentChunk = "";
  
  const sentences = text.split('. ');
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxLength) {
        chunks.push(currentChunk);
        currentChunk = sentence + ". ";
    } else {
        currentChunk += sentence + ". ";
    }
  }
  if (currentChunk) chunks.push(currentChunk);
  
  return chunks;
}

export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    
    // Chunk the text if it's too long
    const chunks = chunkText(text);
    
    // For MVP transparency, if we have multiple chunks, we'll embed the first/most relevant one
    // or ideally batch embed (which requires more complex handling).
    // Here we'll show we are handling the text.
    
    const result = await model.embedContent(chunks[0] || text);
    const embedding = result.embedding.values;

    return NextResponse.json({
      embedding: embedding,
      model: "text-embedding-004",
      chunking_info: {
          total_chunks: chunks.length,
          processed_chunk_size: (chunks[0] || text).length
      }
    });

  } catch (error) {
    console.error("Embedding Error", error);
    return NextResponse.json({ error: "Embedding failed" }, { status: 500 });
  }
}
