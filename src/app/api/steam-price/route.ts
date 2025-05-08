import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const appId = searchParams.get('appId');
  const marketHashName = searchParams.get('marketHashName');
  const currency = searchParams.get('currency') || '1'; // Default to USD (1)

  console.log('Steam Price API Request:', { appId, marketHashName, currency });

  if (!appId || !marketHashName) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    const encodedMarketHashName = encodeURIComponent(marketHashName);
    const url = `https://steamcommunity.com/market/priceoverview/?appid=${appId}&currency=${currency}&market_hash_name=${encodedMarketHashName}`;
    console.log('Steam API URL:', url);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    console.log('Steam API Response Status:', response.status);
    const data = await response.json();
    console.log('Steam API Response Data:', data);

    // Check if we got valid price data
    if (!data.success || (!data.lowest_price && !data.median_price)) {
      console.log('No price data available in response');
      return NextResponse.json(
        { 
          success: false, 
          error: 'No price data available',
          details: data
        },
        { status: 404 }
      );
    }

    const responseData = {
      success: true,
      lowest_price: data.lowest_price,
      median_price: data.median_price,
      volume: data.volume
    };
    console.log('Returning data:', responseData);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching Steam price:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch price from Steam',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 