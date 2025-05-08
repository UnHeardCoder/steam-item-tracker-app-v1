'use client';

import { getCurrentPrice } from '~/app/actions';
import { useState } from 'react';

interface RefreshButtonProps {
  itemId: number;
  onPriceUpdate: (price: number) => void;
  onVolumeUpdate: (volume: number) => void;
}

export default function RefreshButton({ itemId, onPriceUpdate, onVolumeUpdate }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      console.log('Fetching new price for item:', itemId);
      const result = await getCurrentPrice(itemId);
      console.log('Price fetch result:', result);
      
      if (result.success && result.data) {
        console.log('Updating price to:', result.data.currentPrice);
        onPriceUpdate(result.data.currentPrice);
        if (result.data.volume) {
          console.log('Updating volume to:', result.data.volume);
          onVolumeUpdate(result.data.volume);
        }
      } else {
        console.error('Failed to fetch price:', result.error);
      }
    } catch (error) {
      console.error('Error refreshing price:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {isRefreshing ? (
        <>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Refreshing...
        </>
      ) : (
        <>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </>
      )}
    </button>
  );
} 