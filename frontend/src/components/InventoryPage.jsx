import React, { useMemo, useState } from 'react';

export default function InventoryPage({ hospital, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');

  const inventoryEntries = useMemo(() => {
    if (!hospital?.fullInventory) return [];
    return Object.entries(hospital.fullInventory)
      .filter(([name]) => name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a[1].days - b[1].days); // Sort by days remaining ascending
  }, [hospital, searchTerm]);

  if (!hospital) return null;

  return (
    <div className="absolute inset-0 z-[2000] flex flex-col bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-edge bg-bg px-6 py-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-ink">{hospital.name} - Full Inventory</h2>
            {hospital.type && (
              <span className="inline-flex items-center rounded border border-edge bg-surface px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-mute shadow-sm">
                {hospital.type}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-mute">Comprehensive real-time stock levels and burn rates.</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-md border border-edge bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-raised"
        >
          Back to Map
        </button>
      </div>

      {/* Toolbar */}
      <div className="border-b border-edge px-6 py-3">
        <input
          type="text"
          placeholder="Search medicines..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm rounded-md border border-edge bg-bg px-4 py-2 text-sm text-ink placeholder-mute focus:border-action focus:outline-none focus:ring-1 focus:ring-action"
        />
      </div>

      {/* Inventory Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="rounded-lg border border-edge bg-bg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface">
              <tr>
                <th className="px-4 py-3 font-medium text-mute">Medicine</th>
                <th className="px-4 py-3 font-medium text-mute text-right">Current Stock</th>
                <th className="px-4 py-3 font-medium text-mute text-right">Est. Days Left</th>
                <th className="px-4 py-3 font-medium text-mute">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge">
              {inventoryEntries.length > 0 ? (
                inventoryEntries.map(([name, data]) => (
                  <tr key={name} className="hover:bg-surface/50">
                    <td className="px-4 py-3 font-medium text-ink">{name}</td>
                    <td className="px-4 py-3 text-right font-mono text-ink">
                      {data.stock} <span className="text-xs text-mute">{data.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      <span className={data.days <= 5 ? 'text-red-500 font-bold' : 'text-ink'}>
                        {data.days}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {data.days <= 3 ? (
                        <span className="inline-flex rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-500">Critical</span>
                      ) : data.days <= 7 ? (
                        <span className="inline-flex rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-500">Warning</span>
                      ) : (
                        <span className="inline-flex rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">Safe</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-mute">
                    No inventory records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
