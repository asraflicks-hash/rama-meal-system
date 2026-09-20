import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Wheat, 
  Droplets, 
  IndianRupee, 
  Warehouse, 
  ArrowDownRight, 
  ArrowUpRight, 
  Clock, 
  Edit3, 
  Check, 
  AlertCircle,
  ArrowLeft,
  X
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/format';

export default function Dashboard({ rates, onUpdateRates, onBack, onHome, lang = 'en' }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingRates, setIsEditingRates] = useState(false);
  const [editableRates, setEditableRates] = useState({ ...rates });

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    setEditableRates({ ...rates });
  }, [rates]);

  const handleSaveRates = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editableRates)
      });
      if (res.ok) {
        const data = await res.json();
        onUpdateRates(data.rates);
        setIsEditingRates(false);
      }
    } catch (err) {
      alert('Error updating rates: ' + err.message);
    }
  };

  if (loading || !stats) {
    return (
      <div className="text-center py-20 text-stone-500 text-sm">
        Loading mill dashboard...
      </div>
    );
  }

  const stock = stats.millStock || {};

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Back & Home Navigation Bar */}
      {(onBack || onHome) && (
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-stone-300 hover:bg-stone-100 rounded-xl text-xs sm:text-sm font-bold text-stone-700 transition-colors shadow-sm active:scale-95"
              title="वापस जाएं / Back"
            >
              <ArrowLeft className="w-4 h-4 text-stone-700" />
              <span>{lang === 'hi' ? '← वापस (Back)' : '← Back'}</span>
            </button>
          )}
          {onHome && (
            <button
              onClick={onHome}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs sm:text-sm font-black transition-colors shadow-sm active:scale-95 border border-amber-400"
              title="मुख्य होम स्क्रीन पर जाएं / Home"
            >
              <X className="w-4 h-4 font-black stroke-[3]" />
              <span>{lang === 'hi' ? '✕ होम (Home)' : '✕ Home'}</span>
            </button>
          )}
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-stone-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-stone-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-2">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Daily Operations & Stock Dashboard</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              Rama Flour & Mustard Oil Mill Status
            </h2>
            <p className="text-xs text-stone-300 mt-1">
              Date: {formatDate(stats.today)} • Total Active Farmer Accounts: {stats.totalCustomers}
            </p>
          </div>

          <button
            onClick={() => setIsEditingRates(!isEditingRates)}
            className="inline-flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/40 text-xs font-bold px-4 py-2.5 rounded-2xl transition-all"
          >
            <Edit3 className="w-4 h-4" />
            <span>Update Mandi Rates</span>
          </button>
        </div>

        {/* Rate Card Display / Edit */}
        {isEditingRates && (
          <form onSubmit={handleSaveRates} className="mt-5 p-4 bg-stone-800/80 rounded-2xl border border-amber-500/40 text-xs space-y-3">
            <h3 className="font-bold text-amber-300">Update Today's Rates (₹ per Unit):</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-stone-300 mb-1">Wheat (₹/kg):</label>
                <input
                  type="number"
                  step="any"
                  value={editableRates.wheatPerKg}
                  onChange={(e) => setEditableRates({ ...editableRates, wheatPerKg: Number(e.target.value) })}
                  className="w-full p-2 bg-stone-900 border border-stone-700 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-300 mb-1">Atta / Flour (₹/kg):</label>
                <input
                  type="number"
                  step="any"
                  value={editableRates.attaPerKg}
                  onChange={(e) => setEditableRates({ ...editableRates, attaPerKg: Number(e.target.value) })}
                  className="w-full p-2 bg-stone-900 border border-stone-700 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-300 mb-1">Mustard (₹/kg):</label>
                <input
                  type="number"
                  step="any"
                  value={editableRates.mustardPerKg}
                  onChange={(e) => setEditableRates({ ...editableRates, mustardPerKg: Number(e.target.value) })}
                  className="w-full p-2 bg-stone-900 border border-stone-700 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-300 mb-1">Mustard Oil (₹/L):</label>
                <input
                  type="number"
                  step="any"
                  value={editableRates.oilPerLitre}
                  onChange={(e) => setEditableRates({ ...editableRates, oilPerLitre: Number(e.target.value) })}
                  className="w-full p-2 bg-stone-900 border border-stone-700 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-300 mb-1">Grinding Rate (₹/kg):</label>
                <input
                  type="number"
                  step="any"
                  value={editableRates.grindingPerKg}
                  onChange={(e) => setEditableRates({ ...editableRates, grindingPerKg: Number(e.target.value) })}
                  className="w-full p-2 bg-stone-900 border border-stone-700 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-300 mb-1">Chokar / Bran (₹/kg):</label>
                <input
                  type="number"
                  step="any"
                  value={editableRates.chokarPerKg}
                  onChange={(e) => setEditableRates({ ...editableRates, chokarPerKg: Number(e.target.value) })}
                  className="w-full p-2 bg-stone-900 border border-stone-700 rounded-lg text-white font-mono"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsEditingRates(false)}
                className="px-3 py-1.5 bg-stone-700 text-stone-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-amber-600 text-white font-bold rounded-lg flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Rates</span>
              </button>
            </div>
          </form>
        )}

      </div>

      {/* TWO SECTIONS: Section 1 (Wheat Operations) & Section 2 (Mustard Operations) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Section 1: Wheat Movement Today */}
        <div className="bg-white rounded-3xl p-5 border border-amber-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
            <Wheat className="w-5 h-5 text-amber-600" />
            <span>Wheat Section: Today's Activity</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-100">
              <div className="flex justify-between text-xs text-stone-500 mb-1">
                <span>Wheat Deposit In</span>
                <ArrowDownRight className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-stone-900 font-mono">
                {stats.todayWheatDepositKg} <span className="text-xs font-normal">kg</span>
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                +{(stats.todayWheatDepositKg / 100).toFixed(2)} Quintal In
              </p>
            </div>

            <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-100">
              <div className="flex justify-between text-xs text-stone-500 mb-1">
                <span>Flour Withdrawn</span>
                <ArrowUpRight className="w-4 h-4 text-amber-700" />
              </div>
              <div className="text-2xl font-black text-stone-900 font-mono">
                {stats.todayAttaWithdrawKg} <span className="text-xs font-normal">kg</span>
              </div>
              <p className="text-[11px] text-amber-800 font-semibold mt-1">
                Fresh Flour Dispatched
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Mustard Operations Today */}
        <div className="bg-white rounded-3xl p-5 border border-yellow-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-yellow-900 font-black text-sm">
            <Droplets className="w-5 h-5 text-yellow-600" />
            <span>Mustard Oil Section: Today's Activity</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-yellow-50/60 rounded-2xl border border-yellow-100">
              <div className="flex justify-between text-xs text-stone-500 mb-1">
                <span>Mustard Crushed</span>
                <ArrowDownRight className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-stone-900 font-mono">
                {stats.todayMustardDepositKg} <span className="text-xs font-normal">kg</span>
              </div>
              <p className="text-[11px] text-yellow-800 font-semibold mt-1">
                Expeller Running
              </p>
            </div>

            <div className="p-3 bg-yellow-50/60 rounded-2xl border border-yellow-100">
              <div className="flex justify-between text-xs text-stone-500 mb-1">
                <span>Pure Oil Taken</span>
                <ArrowUpRight className="w-4 h-4 text-amber-700" />
              </div>
              <div className="text-2xl font-black text-stone-900 font-mono">
                {stats.todayOilWithdrawLitre} <span className="text-xs font-normal">Litres</span>
              </div>
              <p className="text-[11px] text-stone-600 font-semibold mt-1">
                Cold Pressed Output
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Revenue Card */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm">
        <div className="flex items-center justify-between text-stone-700 font-bold text-xs mb-2">
          <span>Today's Total Cash Collections</span>
          <IndianRupee className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-3xl font-black text-emerald-700 font-mono">
          {formatCurrency((stats.todayGrindingIncome || 0) + (stats.todayCounterSalesAmount || 0))}
        </div>
        <p className="text-xs text-stone-500 mt-1">
          Grinding Fee: ₹{stats.todayGrindingIncome} + Retail POS Sales: ₹{stats.todayCounterSalesAmount}
        </p>
      </div>

      {/* Silo & Warehouse Inventory */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Warehouse className="w-5 h-5 text-stone-700" />
          <h3 className="font-black text-base text-stone-900">
            Mill Warehouse & Commercial Silo Stock
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
            <span className="text-stone-500 block">Total Farmer Stored Wheat:</span>
            <span className="text-xl font-black font-mono text-stone-900">
              {stock.farmerDepositWheatTotalKg} kg
            </span>
            <span className="text-[11px] text-amber-700 font-bold block mt-0.5">
              ({(stock.farmerDepositWheatTotalKg / 100).toFixed(1)} Quintal)
            </span>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
            <span className="text-stone-500 block">Mill Commercial Wheat:</span>
            <span className="text-xl font-black font-mono text-stone-900">
              {stock.millOwnedWheatQuintal} Q
            </span>
            <span className="text-[11px] text-stone-500 block mt-0.5">
              Bulk milling stock
            </span>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
            <span className="text-stone-500 block">Packaged Flour (50kg Bags):</span>
            <span className="text-xl font-black font-mono text-stone-900">
              {stock.processedAttaBags50kg} Bags
            </span>
            <span className="text-[11px] text-stone-500 block mt-0.5">
              + {stock.processedAttaBags10kg} Bags (10kg)
            </span>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
            <span className="text-stone-500 block">Cold-Pressed Mustard Oil:</span>
            <span className="text-xl font-black font-mono text-amber-800">
              {stock.mustardOilStockLitres} Litres
            </span>
            <span className="text-[11px] text-stone-500 block mt-0.5">
              + {stock.mustardKhaliSacks} Sacks Cattle Khali
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
