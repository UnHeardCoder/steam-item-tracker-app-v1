"use client"
import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';

// Define types for our tracked items
interface TrackedItem {
  ITEM_ID: string;
  Tracked_Dates: string;
}

interface ItemPopupProps {
  onItemSelect?: (itemId: string) => void;
}

export default function ItemPopup({ onItemSelect }: ItemPopupProps) {
  // State for controlling popups
  const [isMainPopupOpen, setIsMainPopupOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  
  // State for form inputs
  const [newItemId, setNewItemId] = useState('');
  const [newItemDates, setNewItemDates] = useState('');
  
  // Fake data for tracked items
  const [trackedItems, setTrackedItems] = useState<TrackedItem[]>([
    { ITEM_ID: 'CS:GO Weapon Case', Tracked_Dates: '2023-01-15 - 2023-05-20' },
    { ITEM_ID: 'AK-47 | Redline', Tracked_Dates: '2023-02-10 - 2023-06-15' },
    { ITEM_ID: 'AWP | Dragon Lore', Tracked_Dates: '2023-03-05 - 2023-07-10' },
    { ITEM_ID: 'CS:GO Weapon Case', Tracked_Dates: '2023-01-15 - 2023-05-20' },
    { ITEM_ID: 'AK-47 | Redline', Tracked_Dates: '2023-02-10 - 2023-06-15' },
    { ITEM_ID: 'AWP | Dragon Lore', Tracked_Dates: '2023-03-05 - 2023-07-10' },
    { ITEM_ID: 'CS:GO Weapon Case', Tracked_Dates: '2023-01-15 - 2023-05-20' },
    { ITEM_ID: 'AK-47 | Redline', Tracked_Dates: '2023-02-10 - 2023-06-15' },
    { ITEM_ID: 'AWP | Dragon Lore', Tracked_Dates: '2023-03-05 - 2023-07-10' },
    { ITEM_ID: 'Butterfly Knife', Tracked_Dates: '2023-04-20 - 2023-08-25' }
  ]);

  // Setup table columns
  const columnHelper = createColumnHelper<TrackedItem>();
  const columns = useMemo(() => [
    columnHelper.accessor('ITEM_ID', {
      header: 'Item ID',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('Tracked_Dates', {
      header: 'Tracked Dates',
      cell: info => info.getValue(),
    }),
  ], []);

  // Initialize table
  const table = useReactTable({
    data: trackedItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Handle row click
  const handleRowClick = (itemId: string) => {
    if (onItemSelect) {
      onItemSelect(itemId);
      setIsMainPopupOpen(false);
    }
  };
  
  // Function to handle adding a new item
  const handleAddItem = () => {
    if (newItemId && newItemDates) {
      setTrackedItems([
        ...trackedItems,
        { ITEM_ID: newItemId, Tracked_Dates: newItemDates }
      ]);
      setNewItemId('');
      setNewItemDates('');
      setIsAddFormOpen(false);
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
            <div className="overflow-x-auto overflow-y-auto max-h-[400px] rounded-2xl border border-gray-700">
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
                      onClick={() => handleRowClick(row.original.ITEM_ID)}
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
              <div className="fixed inset-0 flex items-center justify-center z-[60]">
                <div className="absolute inset-0 bg-black/75" onClick={() => setIsAddFormOpen(false)}></div>
                <div className="bg-gray-900 p-6 rounded-3xl shadow-2xl z-10 w-[500px] max-w-[90%] border-2 border-gray-600">
                  <h3 className="text-xl font-bold text-white mb-4">Add New Item</h3>
                  
                  <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="itemId">
                      Item ID
                    </label>
                    <input
                      id="itemId"
                      type="text"
                      className="shadow appearance-none border border-gray-700 rounded-lg w-full py-2 px-3 bg-gray-800 text-gray-300 leading-tight focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. CS:GO Weapon Case"
                      value={newItemId}
                      onChange={(e) => setNewItemId(e.target.value)}
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="trackedDates">
                      Tracked Dates
                    </label>
                    <input
                      id="trackedDates"
                      type="text"
                      className="shadow appearance-none border border-gray-700 rounded-lg w-full py-2 px-3 bg-gray-800 text-gray-300 leading-tight focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. 2023-01-15 - 2023-05-20"
                      value={newItemDates}
                      onChange={(e) => setNewItemDates(e.target.value)}
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
