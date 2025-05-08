'use server';

import { db } from '~/drizzle/db';
import { items, priceHistory } from '~/drizzle/schema';
import { revalidatePath } from 'next/cache';
import { eq, desc } from 'drizzle-orm';

async function validateSteamItem(market_hash_name: string, steam_appid: number) {
  try {
    const response = await fetch(
      `https://steamcommunity.com/market/priceoverview/?appid=${steam_appid}&currency=20&market_hash_name=${encodeURIComponent(market_hash_name)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }
    );

    if (!response.ok) {
      return { valid: false, error: 'Item not found in Steam Market' };
    }

    const data = await response.json();
    
    // Check if we got a valid response with price data
    if (!data.success || (!data.lowest_price && !data.median_price)) {
      return { valid: false, error: 'Item not found in Steam Market' };
    }

    // Additional validation to ensure the item exists
    if (data.lowest_price === '0' && data.median_price === '0') {
      return { valid: false, error: 'Item not found in Steam Market' };
    }

    // Check if the market_hash_name matches exactly
    const searchResponse = await fetch(
      `https://steamcommunity.com/market/listings/${steam_appid}/${encodeURIComponent(market_hash_name)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }
    );

    if (!searchResponse.ok) {
      return { valid: false, error: 'Item not found in Steam Market' };
    }

    return { valid: true };
  } catch (error) {
    console.error('Error validating Steam item:', error);
    return { valid: false, error: 'Failed to validate item' };
  }
}

export async function addNewItem(newItem: { market_hash_name: string; steam_appid: number }) {
  try {
    // First validate the item exists in Steam Market
    const validation = await validateSteamItem(newItem.market_hash_name, newItem.steam_appid);
    
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // If validation passes, add the item to the database
    await db.insert(items).values(newItem);
    revalidatePath('/'); // Revalidate the home page
    return { success: true };
  } catch (error) {
    console.error('Error adding new item:', error);
    return { success: false, error: 'Failed to add item' };
  }
}

// Function to just fetch current price without updating history
export async function getCurrentPrice(itemId: number) {
  try {
    // Get item details from database
    const item = await db.query.items.findFirst({
      where: eq(items.id, itemId),
    });

    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    // Fetch current price from Steam Market API
    const response = await fetch(
      `https://steamcommunity.com/market/priceoverview/?appid=${item.steam_appid}&currency=20&market_hash_name=${encodeURIComponent(item.market_hash_name)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch price from Steam Market');
    }

    const data = await response.json();
    
    // Extract price and volume from response, using median_price as fallback
    const currentPrice = parseFloat(
      (data.lowest_price || data.median_price)?.replace(/[^0-9.]/g, '') || '0'
    );
    const volume = parseInt(data.volume?.replace(/[^0-9]/g, '') || '0');

    return {
      success: true,
      data: {
        currentPrice,
        volume,
        market_hash_name: item.market_hash_name,
        steam_appid: item.steam_appid
      }
    };
  } catch (error) {
    console.error('Error fetching price:', error);
    return { success: false, error: 'Failed to fetch price' };
  }
}

// This function should only be used by scheduled tasks or admin actions
export async function updateItemPrice(itemId: number) {
  try {
    // Get item details from database
    const item = await db.query.items.findFirst({
      where: eq(items.id, itemId),
    });

    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    // Fetch current price from Steam Market API
    const response = await fetch(
      `https://steamcommunity.com/market/priceoverview/?appid=${item.steam_appid}&currency=20&market_hash_name=${encodeURIComponent(item.market_hash_name)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch price from Steam Market');
    }

    const data = await response.json();
    
    // Extract price and volume from response, using median_price as fallback
    const currentPrice = parseFloat(
      (data.lowest_price || data.median_price)?.replace(/[^0-9.]/g, '') || '0'
    );
    const volume = parseInt(data.volume?.replace(/[^0-9]/g, '') || '0');

    // Insert new price into priceHistory
    await db.insert(priceHistory).values({
      itemId: itemId,
      price: currentPrice,
      recordedAt: new Date(),
    });

    // Only revalidate if we're in a Next.js context
    if (typeof window === 'undefined' && process.env.NEXT_RUNTIME) {
      revalidatePath('/');
    }

    return {
      success: true,
      data: {
        currentPrice,
        volume,
        market_hash_name: item.market_hash_name,
        steam_appid: item.steam_appid
      }
    };
  } catch (error) {
    console.error('Error updating price:', error);
    return { success: false, error: 'Failed to update price' };
  }
}

// Function to fetch price history for an item
export async function getPriceHistory(itemId: number) {
  try {
    const history = await db.query.priceHistory.findMany({
      where: eq(priceHistory.itemId, itemId),
      orderBy: [desc(priceHistory.recordedAt)],
      limit: 100, // Limit to last 100 entries
    });

    return {
      success: true,
      data: history.map(item => ({
        recordedAt: item.recordedAt,
        price: item.price
      }))
    };
  } catch (error) {
    console.error('Error fetching price history:', error);
    return { success: false, error: 'Failed to fetch price history' };
  }
} 