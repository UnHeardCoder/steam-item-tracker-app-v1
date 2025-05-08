import { NextResponse } from 'next/server';
import updateAllItemPrices from '~/cron/updatePrices';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    await updateAllItemPrices();
    return NextResponse.json({ success: true, message: 'Price update completed successfully' });
  } catch (error) {
    console.error('Error in price update cron job:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update prices' },
      { status: 500 }
    );
  }
} 