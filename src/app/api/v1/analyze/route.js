
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const apiKey = request.headers.get('x-api-key');
    const secret = process.env.API_SECRET || 'dev_secret_123';

    if (apiKey !== secret) {
      return NextResponse.json({ error: 'Unauthorized: Invalid API Key' }, { status: 401 });
    }

    const { jd, candidate, persona = 'expert' } = await request.json();

    if (!jd || !candidate) {
      return NextResponse.json({ error: 'Missing required fields: jd and candidate' }, { status: 400 });
    }

    // Call the internal scoring logic by importing the internal handler or fetching it
    // For simplicity and to avoid circular logic, we fetch the internal scoring API
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const internalRes = await fetch(`${baseUrl}/api/scoring`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jd, candidate_data: candidate, persona })
    });

    const data = await internalRes.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("API v1 Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
