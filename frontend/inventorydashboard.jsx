import { useState } from "react";

// Mock inventory data — swap this for real API data later.
// daysUntilStockout = currentStock / avgDailyUsage
const mockInventory = [
  { id: 1, medicine: "Amoxicillin 500mg", currentStock: 340, avgDailyUsage: 45 },
  { id: 2, medicine: "Insulin Glargine", currentStock: 28, avgDailyUsage: 12 },
  { id: 3, medicine: "Paracetamol IV", currentStock: 15, avgDailyUsage: 20 },
  { id: 4, medicine: "Oxygen Cylinders", currentStock: 8, avgDailyUsage: 6 },
];

function calculateDaysUntilStockout(currentStock, avgDailyUsage) {
  if (avgDailyUsage <= 0) return Infinity;
  return Math.floor(currentStock / avgDailyUsage);
}

function StockoutBadge({ daysUntilStockout }) {
  const isCritical = daysUntilStockout <= 3;
  const isWarning = daysUntilStockout > 3 && daysUntilStockout <= 7;

  const colorClasses = isCritical
    ? "bg-red-600 text-white"
    : isWarning
    ? "bg-yellow-500 text-black"
    : "bg-green-600 text-white";

  return (
    <div
      className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-2xl shadow-lg ${colorClasses}`}
    >
      <span>Days Until Stockout:</span>
      <span className="text-3xl">{daysUntilStockout}</span>
    </div>
  );
}

export default function InventoryDashboard() {
  const [inventory] = useState(mockInventory);

  return (
    <div className="p-8 space-y-6 bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-6">
        Hospital Inventory Status
      </h1>
      {inventory.map((item) => {
        const days = calculateDaysUntilStockout(
          item.currentStock,
          item.avgDailyUsage
        );
        return (
          <div
            key={item.id}
            className="flex items-center justify-between bg-gray-800 p-6 rounded-lg"
          >
            <div>
              <h2 className="text-xl font-semibold text-white">
                {item.medicine}
              </h2>
              <p className="text-gray-400">
                Stock: {item.currentStock} units · Usage:{" "}
                {item.avgDailyUsage}/day
              </p>
            </div>
            <StockoutBadge daysUntilStockout={days} />
          </div>
        );
      })}
    </div>
  );
}