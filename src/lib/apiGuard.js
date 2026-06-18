import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { ok: true, session };
}

export async function requireAuthOrInternal(request) {
  const internalKey = request.headers.get('x-internal-key');
  const secret = process.env.API_SECRET || 'dev_secret_123';
  if (internalKey && internalKey === secret) {
    return { ok: true, internal: true };
  }
  return requireAuth();
}

export function apiError(error, fallback = 'Something went wrong', status = 500) {
  console.error(fallback, error);
  return NextResponse.json({ error: error?.message || fallback }, { status });
}
