"use client";
import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentPrice } from '~/app/actions';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';

// Type for the data coming from your API/database
export interface FetchedItemData {
  market_hash_name: string;
  tracked_start_date: Date | string | null; // API might return string, convert to Date
  tracked_end_date: Date | string | null;   // API might return string, convert to Date
  item_id: number;
  item_created_at: Date | string; // Might not be used in this table but good to have
  steam_appid: number;
}

// Type for the data structure specifically for the table display
interface TableDisplayItem {
  market_hash_name: string; // What's displayed as the main ID/name
  tracked_dates_display: string; // Formatted string for display
  db_item_id: number; // The actual database ID for actions
}

interface ItemPopupProps {
  onItemSelect?: (dbItemId: number) => void;
  initialData?: FetchedItemData[];
  onAddItemSubmit?: (newItem: { market_hash_name: string; steam_appid: number }) => Promise<{ success: boolean; error?: string }>;
  onPriceUpdate?: (price: number) => void;
  onVolumeUpdate?: (volume: number) => void;
}

export default function ItemPopup({ initialData, onAddItemSubmit, onPriceUpdate, onVolumeUpdate }: ItemPopupProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMainPopupOpen, setIsMainPopupOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  // State for form inputs when adding a new item
  const [newItemName, setNewItemName] = useState(''); // Market Hash Name
  const [newItemAppId, setNewItemAppId] = useState(''); // Steam AppID

  const [tableDisplayData, setTableDisplayData] = useState<TableDisplayItem[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Effect to process initialData when it's passed or updated
  useEffect(() => {
    if (initialData) {
      const formattedData = initialData.map(item => {
        let datesDisplay = "Not yet tracked";
        const startDate = item.tracked_start_date ? new Date(item.tracked_start_date) : null;
        const endDate = item.tracked_end_date ? new Date(item.tracked_end_date) : null;

        if (startDate && endDate) {
          datesDisplay = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
        } else if (startDate) {
          datesDisplay = `${startDate.toLocaleDateString()} - Present`;
        }
        return {
          market_hash_name: item.market_hash_name,
          tracked_dates_display: datesDisplay,
          db_item_id: item.item_id,
        };
      });
      setTableDisplayData(formattedData);
    }
  }, [initialData]);

  // Setup table columns
  const columnHelper = createColumnHelper<TableDisplayItem>();
  const columns = useMemo(() => [
    columnHelper.accessor('market_hash_name', {
      header: 'Item Name',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('tracked_dates_display', {
      header: 'Tracked Dates',
      cell: info => info.getValue(),
    }),
    // You could add a column for actions or the original item_id if needed for display
  ], [columnHelper]);

  // Initialize table
  const table = useReactTable({
    data: tableDisplayData, // Use processed data
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Handle row click
  const handleRowClick = async (dbItemId: number) => {
    try {
      // First fetch the price and volume
      const result = await getCurrentPrice(dbItemId);
      
      // Update the URL with just the selected item
      const params = new URLSearchParams(searchParams.toString());
      params.set('selectedItem', dbItemId.toString());
      params.delete('currentPrice'); // Remove any existing price from URL
      router.push(`?${params.toString()}`);

      // Then update the price and volume if successful
      if (result.success && result.data) {
        if (onPriceUpdate) {
          onPriceUpdate(result.data.currentPrice);
        }
        if (onVolumeUpdate && result.data.volume) {
          onVolumeUpdate(result.data.volume);
        }
      }

      // Close popup after everything is done
      setIsMainPopupOpen(false);
    } catch (error) {
      console.error('Error fetching price:', error);
      // Still update the URL even if price fetch fails
      const params = new URLSearchParams(searchParams.toString());
      params.set('selectedItem', dbItemId.toString());
      params.delete('currentPrice'); // Remove any existing price from URL
      router.push(`?${params.toString()}`);
      setIsMainPopupOpen(false);
    }
  };

  // Function to handle submitting the add item form
  const handleAddItem = async () => {
    if (newItemName && newItemAppId && onAddItemSubmit) {
      const steamAppIdNum = parseInt(newItemAppId, 10);
      if (isNaN(steamAppIdNum)) {
        alert("Steam AppID must be a number.");
        return;
      }
      try {
        const result = await onAddItemSubmit({
          market_hash_name: newItemName,
          steam_appid: steamAppIdNum,
        });

        if (result.success) {
          setNewItemName('');
          setNewItemAppId('');
          setIsAddFormOpen(false);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000); // Hide after 3 seconds
        } else {
          alert(result.error || "Failed to add item. Please try again.");
        }
      } catch (error) {
        console.error("Error submitting new item:", error);
        alert("An error occurred while adding the item.");
      }
    } else if (!onAddItemSubmit) {
      alert("Add item functionality is not configured.");
    }
  };

  return (
    <>
      {/* Main button to open the popup */}
      <button
        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
        onClick={() => setIsMainPopupOpen(true)}
      >
        View Tracked Items
      </button>

      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in-out z-[100]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>Item added successfully!</span>
        </div>
      )}

      {/* Main popup with table */}
      {isMainPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/75" onClick={() => setIsMainPopupOpen(false)}></div>
          <div className="bg-gray-900 p-6 rounded-3xl shadow-2xl z-10 w-[800px] max-w-[90%] max-h-[90vh] overflow-auto border-2 border-gray-600">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Tracked Items</h2>
              <div className="flex gap-2">
                <button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                  onClick={() => setIsAddFormOpen(true)}
                >
                  Add Item
                </button>
                <button
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  onClick={() => setIsMainPopupOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>

            {/* Table of tracked items */}
            <div className="overflow-x-auto overflow-y-auto max-h-[30vh] rounded-2xl border border-gray-700">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800 sticky top-0 z-10">
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th
                          key={header.id}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-700">
                  {table.getRowModel().rows.map((row, index) => (
                    <tr
                      key={row.id}
                      className={`${index % 2 === 0 ? 'bg-gray-800/50' : 'bg-gray-900/50'} cursor-pointer hover:bg-indigo-900/30 transition-colors`}
                      onClick={() => handleRowClick(row.original.db_item_id)} // Use original db_item_id
                    >
                      {row.getVisibleCells().map(cell => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-300"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add item form popup */}
            {isAddFormOpen && (
              <div className="fixed inset-0 flex items-center justify-center z-[60]"> {/* Increased z-index */}
                <div className="absolute inset-0 bg-black/75" onClick={() => setIsAddFormOpen(false)}></div>
                <div className="bg-gray-900 p-6 rounded-3xl shadow-2xl z-10 w-[500px] max-w-[90%] border-2 border-gray-600">
                  <h3 className="text-xl font-bold text-white mb-4">Add New Item to Track</h3>

                  <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="itemName">
                      Market Hash Name
                    </label>
                    <input
                      id="itemName"
                      type="text"
                      className="shadow appearance-none border border-gray-700 rounded-lg w-full py-2 px-3 bg-gray-800 text-gray-300 leading-tight focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. AK-47 | Redline (Field-Tested)"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="steamAppId">
                      Steam AppID
                    </label>
                    <input
                      id="steamAppId"
                      type="number" // Changed to number
                      className="shadow appearance-none border border-gray-700 rounded-lg w-full py-2 px-3 bg-gray-800 text-gray-300 leading-tight focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. 730 for CS:GO"
                      value={newItemAppId}
                      onChange={(e) => setNewItemAppId(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                      onClick={() => setIsAddFormOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                      onClick={handleAddItem}
                    >
                      Add Item
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}