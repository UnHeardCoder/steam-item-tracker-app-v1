"use client"
import { useState } from 'react';
import ItemPopup from './ItemPopup';

export default function Steamitemtracker() {
  const [selectedItem, setSelectedItem] = useState('item name');

  return (
    <div className="w-full max-w-6xl rounded-3xl bg-gray-900 shadow-2xl overflow-hidden relative border-2 border-gray-600">
      {/* Header */}
      <div className="bg-gray-800 p-6 border-b border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="w-12 h-12 object-contain mr-4 rounded bg-gray-700 p-1">
              <p>item image</p>
            </div>
            <div>
              <h1 className="text-white text-xl font-bold">{selectedItem}</h1>
              <p className="text-gray-400 text-sm">item game name</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
            >
              <div>refresh</div>
            </button>
            <ItemPopup onItemSelect={setSelectedItem} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Price Stats */}
          <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-4">
            {/* Current Price Card */}
            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 shadow-lg">
              <div className="flex justify-between items-start mb-2">
                <p className="text-gray-400 font-medium">current price</p>
                <div className="px-2 py-1 rounded-full text-xs font-medium flex items-center bg-green-900/20 text-green-400">
                  <div className="mr-1">10.00%</div>
                </div>
              </div>
              <div className="flex items-baseline">
                <h2 className="text-white text-3xl font-bold">CDN$ 100</h2>
              </div>
              <p className="text-gray-400 text-sm mt-1">Up +22.14 in the last month</p>
            </div>

            {/* Volume Card */}
            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 shadow-lg">
              <p className="text-gray-400 font-medium mb-2">Volume</p>
              <div className="flex items-baseline">
                <h2 className="text-white text-3xl font-bold">100</h2>
              </div>
              <p className="text-gray-400 text-sm mt-1">Volume of items on the market</p>
            </div>

            {/* Median Price Card */}
            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 shadow-lg lg:col-span-1 col-span-2">
              <p className="text-gray-400 font-medium mb-2">Market trend</p>
              <div className="flex items-center">
                <div className="mr-2 text-green-400">UP</div>
                <h2 className="text-white text-xl font-bold">Upwards trend</h2>
              </div>
              <p className="text-gray-400 text-sm mt-1">Based on historical data</p>
            </div>
          </div>

          {/* Chart Section */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 shadow-lg h-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div className="flex items-center mb-4 sm:mb-0">
                  <h3 className="text-white text-lg font-bold mr-2">Price history</h3>
                  <div className="bg-indigo-900/30 text-indigo-400 text-xs px-2 py-1 rounded-full flex items-center">
                    <div className="mr-1">Tracked data</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  {/* Chart Type Selector */}
                  <div className="bg-gray-700 rounded-lg p-1 flex">
                    <button className="px-3 py-1 rounded-md text-sm font-medium transition-colors bg-indigo-600 text-white">
                      line
                    </button>
                    <button className="px-3 py-1 rounded-md text-sm font-medium transition-colors text-gray-300 hover:bg-gray-600">
                      bar
                    </button>
                  </div>

                  {/* Time Range Selector */}
                  <div className="relative">
                    <button className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center">
                      range
                    </button>
                  </div>
                </div>
              </div>

              {/* Chart Container */}
              <div className="h-[300px] flex items-center justify-center rounded-xl bg-gray-800">
                {/* Chart will go here */}
                <div className="text-gray-500">Chart</div> 
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="p-6 border-t border-gray-700 items-center justify-center flex flex-col gap-2 bg-gray-800">
        <p>
          Made with ❤️ by <a className="hover:text-indigo-400 transition-colors">UnHeardCoder</a>
        </p>
      </div>
    </div>
  );
} 
