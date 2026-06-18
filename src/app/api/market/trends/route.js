import { NextResponse } from 'next/server';
import { requireAuth, apiError } from '@/lib/apiGuard';
import { getMarketTrends } from '@/lib/marketTrends';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;

    const trends = await getMarketTrends();
    return NextResponse.json(trends);
  } catch (error) {
    return apiError(error, 'Failed to fetch live market trends');
  }
}
