'use client';

import Image from 'next/image';
import ItemPopup from './ItemPopup';
import RefreshButton from './RefreshButton';
import PriceHistoryChart from './PriceHistoryChart';
import { addNewItem, getCurrentPrice, getPriceHistory } from '~/app/actions';
import { useState, useEffect } from 'react';
import type { FetchedItemData } from './ItemPopup';

// Map of common Steam AppIDs to their game names
const STEAM_GAMES: Record<number, string> = {
  730: 'CS:GO',
  570: 'Dota 2',
  440: 'Team Fortress 2',
  252490: 'Rust'
};

// Function to get game name from AppID
const getGameName = (appId: number): string => {
  return STEAM_GAMES[appId] || `Steam AppID: ${appId}`;
};

interface SteamitemtrackerProps {
  initialSummaryData: FetchedItemData[];
  selectedItemData: FetchedItemData | null;
  selectedItemId: number | null;
}

export default function Steamitemtracker({
  initialSummaryData,
  selectedItemData,
  selectedItemId
}: SteamitemtrackerProps) {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [currentVolume, setCurrentVolume] = useState<number | null>(null);
  const [lastUpdatedItemId, setLastUpdatedItemId] = useState<number | null>(null);
  const [priceHistoryData, setPriceHistoryData] = useState<{ recordedAt: Date; price: number; }[]>([]);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [priceChange, setPriceChange] = useState<{ trend: 'up' | 'down' | 'stable'; percentage: number } | null>(null);

  // Calculate price change when price history data changes
  useEffect(() => {
    if (priceHistoryData.length >= 2) {
      const sortedData = [...priceHistoryData].sort((a, b) => 
        new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
      );
      
      const currentPrice = sortedData[0].price;
      const previousPrice = sortedData[1].price;
      const change = ((currentPrice - previousPrice) / previousPrice) * 100;
      
      let trend: 'up' | 'down' | 'stable';
      if (Math.abs(change) < 0.01) {
        trend = 'stable';
      } else {
        trend = change > 0 ? 'up' : 'down';
      }

      setPriceChange({
        trend,
        percentage: Math.abs(change)
      });
    } else {
      setPriceChange(null);
    }
  }, [priceHistoryData]);

  // Fetch initial price and price history when item is selected
  useEffect(() => {
    const fetchData = async () => {
      if (selectedItemId && selectedItemId !== lastUpdatedItemId) {
        try {
          // Fetch current price
          const result = await getCurrentPrice(selectedItemId);
          if (result.success && result.data) {
            setCurrentPrice(result.data.currentPrice);
            setCurrentVolume(result.data.volume);
            setLastUpdatedItemId(selectedItemId);
          }

          // Fetch price history
          const historyResult = await getPriceHistory(selectedItemId);
          if (historyResult.success && historyResult.data) {
            setPriceHistoryData(historyResult.data);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          // Reset states on error
          setCurrentPrice(null);
          setCurrentVolume(null);
          setPriceHistoryData([]);
        }
      }
    };

    fetchData();
  }, [selectedItemId, lastUpdatedItemId]);

  const handlePriceUpdate = (price: number) => {
    console.log('Steamitemtracker received price update:', price);
    console.log('Current selectedItemId:', selectedItemId);
    console.log('Current lastUpdatedItemId:', lastUpdatedItemId);
    if (selectedItemId === lastUpdatedItemId) {
      console.log('Updating price state to:', price);
      setCurrentPrice(price);
    } else {
      console.log('Ignoring price update - item IDs do not match');
    }
  };

  const handleVolumeUpdate = (volume: number) => {
    console.log('Steamitemtracker received volume update:', volume);
    console.log('Current selectedItemId:', selectedItemId);
    console.log('Current lastUpdatedItemId:', lastUpdatedItemId);
    if (selectedItemId === lastUpdatedItemId) {
      console.log('Updating volume state to:', volume);
      setCurrentVolume(volume);
    } else {
      console.log('Ignoring volume update - item IDs do not match');
    }
  };

  return (
    <div className="w-full max-w-6xl rounded-3xl bg-gray-900 shadow-2xl overflow-hidden relative border-2 border-gray-600 my-4">
      {/* Header */}
      <div className="bg-gray-800 p-4 sm:p-6 border-b border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 object-contain mr-3 sm:mr-4 rounded bg-gray-700 p-1">
              {selectedItemData?.steam_appid === 730 ? (
                <Image src="/csgo-case.png" alt="CS:GO Case" className="w-full h-full object-contain rounded" width={48} height={48}/>
              ) : (
                <p>item image</p>
              )}
            </div>
            <div>
              <h1 className="text-white text-lg sm:text-xl font-bold">
                {selectedItemData?.market_hash_name || 'No item selected'}
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm">
                {selectedItemData?.steam_appid 
                  ? getGameName(selectedItemData.steam_appid)
                  : 'Select an item to view details'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {selectedItemId && <RefreshButton itemId={selectedItemId} onPriceUpdate={handlePriceUpdate} onVolumeUpdate={handleVolumeUpdate} />}
            <ItemPopup 
              initialData={initialSummaryData || []}
              onAddItemSubmit={addNewItem}
              onPriceUpdate={handlePriceUpdate}
              onVolumeUpdate={handleVolumeUpdate}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 pr-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Price Stats */}
          <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-4">
            {/* Current Price Card */}
            <div className="bg-gray-800 rounded-2xl p-4 sm:p-5 border border-gray-700 shadow-lg">
              <div className="flex justify-between items-start mb-2">
                <p className="text-gray-400 text-sm sm:text-base font-medium">current price</p>
                {priceChange && (
                  <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${
                    priceChange.trend === 'up' 
                      ? 'bg-green-900/30 text-green-400' 
                      : priceChange.trend === 'down'
                      ? 'bg-red-900/30 text-red-400'
                      : 'bg-gray-700/20 text-gray-400'
                  }`}>
                    <div className="mr-1">
                      {priceChange.trend === 'up' ? '↑' : priceChange.trend === 'down' ? '↓' : '→'} 
                      {priceChange.percentage.toFixed(2)}%
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-baseline">
                <h2 className="text-white text-2xl sm:text-3xl font-bold">
                  {currentPrice ? `CAD$ ${currentPrice.toFixed(2)}` : 'CAD$ 0.00'}
                </h2>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">
                {currentPrice ? 'Current market price' : 'Click refresh to get current price'}
              </p>
            </div>

            {/* Volume Card */}
            <div className="bg-gray-800 rounded-2xl p-4 sm:p-5 border border-gray-700 shadow-lg">
              <p className="text-gray-400 text-sm sm:text-base font-medium mb-2">Volume</p>
              <div className="flex items-baseline">
                <h2 className="text-white text-2xl sm:text-3xl font-bold">
                  {currentVolume !== null ? currentVolume : '0'}
                </h2>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">
                {currentVolume !== null ? 'Current market volume' : 'Click refresh to get current volume'}
              </p>
            </div>

            {/* Market Trend Card */}
            <div className="bg-gray-800 rounded-2xl p-4 sm:p-5 border border-gray-700 shadow-lg lg:col-span-1 col-span-2">
              <p className="text-gray-400 text-sm sm:text-base font-medium mb-2">Market trend</p>
              <div className="flex items-center">
                {priceChange ? (
                  <>
                    <div className={`mr-2 ${
                      priceChange.trend === 'up' 
                        ? 'text-green-400' 
                        : priceChange.trend === 'down'
                        ? 'text-red-400'
                        : 'text-gray-400'
                    }`}>
                      {priceChange.trend === 'up' ? '↑' : priceChange.trend === 'down' ? '↓' : '→'}
                    </div>
                    <h2 className={`text-lg sm:text-xl font-bold ${
                      priceChange.trend === 'up' 
                        ? 'text-green-400' 
                        : priceChange.trend === 'down'
                        ? 'text-red-400'
                        : 'text-white'
                    }`}>
                      {priceChange.trend === 'up' 
                        ? 'Price Increasing' 
                        : priceChange.trend === 'down'
                        ? 'Price Decreasing'
                        : 'Price Stable'}
                    </h2>
                  </>
                ) : (
                  <>
                    <div className="mr-2 text-gray-400">→</div>
                    <h2 className="text-white text-lg sm:text-xl font-bold">No trend data</h2>
                  </>
                )}
              </div>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">
                {priceChange 
                  ? `Based on last ${priceHistoryData.length} price updates` 
                  : 'Based on historical data'}
              </p>
            </div>
          </div>

          {/* Chart Section */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-2xl p-4 sm:p-5 pr-2 border border-gray-700 shadow-lg h-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
                <div className="flex items-center mb-4 sm:mb-0">
                  <h3 className="text-white text-base sm:text-lg font-bold mr-2">Price history</h3>
                  <div className="bg-indigo-900/30 text-indigo-400 text-xs px-2 py-1 rounded-full flex items-center">
                    <div className="mr-1">Tracked data</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  {/* Chart Type Selector */}
                  <div className="bg-gray-700 rounded-lg p-1 flex">
                    <button 
                      className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                        chartType === 'line' 
                          ? 'bg-indigo-600 text-white' 
                          : 'text-gray-300 hover:bg-gray-600'
                      }`}
                      onClick={() => setChartType('line')}
                    >
                      line
                    </button>
                    <button 
                      className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                        chartType === 'bar' 
                          ? 'bg-indigo-600 text-white' 
                          : 'text-gray-300 hover:bg-gray-600'
                      }`}
                      onClick={() => setChartType('bar')}
                    >
                      bar
                    </button>
                  </div>
                </div>
              </div>

              {/* Chart Container */}
              <div className="h-[250px] sm:h-[300px] px-4 sm:px-0 flex justify-center">
                <div className="w-full max-w-xs sm:max-w-full h-full">
                  <PriceHistoryChart data={priceHistoryData} chartType={chartType} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="p-4 sm:p-6 border-t border-gray-700 items-center justify-center flex flex-col gap-2 bg-gray-800">
        <p className="text-sm sm:text-base">
          Made with ❤️ by <a className="hover:text-indigo-400 transition-colors" href="https://github.com/UnHeardCoder">UnHeardCoder</a>
        </p>
      </div>
    </div>
  );
} 
