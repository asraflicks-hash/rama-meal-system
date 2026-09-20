import React, { useState } from 'react';
import { 
  Droplets, 
  Search, 
  ArrowDownRight, 
  ArrowUpRight, 
  Calculator,
  Flame,
  Check,
  Percent
} from 'lucide-react';
import { formatWeight, formatCurrency } from '../../utils/format';
import { translations } from '../../utils/i18n';

export default function MustardOilLedger({ 
  customers, 
  rates, 
  onSelectCustomer, 
  onOpenQuickActionForCustomer,
  lang = 'en'
}) {
  const t = translations[lang] || translations.en;
  const isHi = lang === 'hi';

  const [searchTerm, setSearchTerm] = useState('');
  const [calcMustardKg, setCalcMustardKg] = useState(100);

  const oilRate = rates?.oilYieldPercent || 34;
  const khaliRate = rates?.khaliYieldPercent || 64;

  const calcOilYield = ((calcMustardKg * oilRate) / 100).toFixed(1);
  const calcKhaliYield = ((calcMustardKg * khaliRate) / 100).toFixed(1);

  const mustardCustomers = customers.filter(c => {
    const s = searchTerm.toLowerCase();
    return (
      c.name?.toLowerCase().includes(s) ||
      c.nameHi?.toLowerCase().includes(s) ||
      c.phone?.includes(s) ||
      c.village?.toLowerCase().includes(s) ||
      c.villageHi?.toLowerCase().includes(s)
    );
  });

  const totalMustard = customers.reduce((s, c) => s + (c.balances?.mustardDepositTotalKg || 0), 0);
  const totalOilAvailable = customers.reduce((s, c) => s + (c.balances?.oilAvailableLitre || 0), 0);

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      {/* SECTION HEADER: Dedicated Mustard & Oil Section */}
      <div className="bg-gradient-to-r from-stone-900 via-yellow-950 to-stone-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-yellow-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 text-xs font-bold mb-2">
              <Droplets className="w-3.5 h-3.5" />
              <span>{t.mustardSectionTag}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {t.mustardSectionTitle}
            </h2>
            <p className="text-xs text-yellow-200/80 mt-1 max-w-2xl">
              {t.mustardSectionSubtitle}
            </p>
          </div>

          {/* Aggregated Totals */}
          <div className="flex gap-2">
            <div className="bg-stone-800/90 border border-yellow-700/50 rounded-2xl p-3 text-center min-w-[110px]">
              <span className="text-[10px] text-yellow-400 block font-semibold">{t.totalMustardIn}</span>
              <span className="text-lg font-black font-mono text-white">{totalMustard} kg</span>
              <span className="text-[10px] text-stone-400 block">{(totalMustard/100).toFixed(2)} {t.quintal}</span>
            </div>
            <div className="bg-stone-800/90 border border-yellow-700/50 rounded-2xl p-3 text-center min-w-[110px]">
              <span className="text-[10px] text-yellow-300 block font-semibold">{t.totalAvailableOil}</span>
              <span className="text-lg font-black font-mono text-yellow-300">{totalOilAvailable.toFixed(1)} L</span>
              <span className="text-[10px] text-stone-400 block">Pure Oil</span>
            </div>
          </div>
        </div>

        {/* Mustard Crushing Yield Calculator */}
        <div className="mt-6 pt-5 border-t border-yellow-800/40 bg-black/30 rounded-2xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-yellow-400" />
              <h3 className="font-bold text-xs text-yellow-200">
                {t.yieldCalculatorTitle}
              </h3>
            </div>
            <span className="text-[11px] text-stone-400">
              {t.yieldCalculatorNote}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <div className="relative">
              <label className="text-[10px] text-stone-300 block mb-1">{t.enterMustardWeight}</label>
              <input
                type="number"
                value={calcMustardKg}
                onChange={(e) => setCalcMustardKg(Number(e.target.value) || 0)}
                className="w-full py-2 px-3 bg-stone-900 border border-yellow-700/60 rounded-xl text-yellow-300 font-mono font-bold text-sm"
              />
              <span className="absolute right-3 top-7 text-xs text-stone-400 font-bold">kg</span>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-2.5 text-center">
              <span className="text-[10px] text-yellow-300 block">{t.expectedPureOil}</span>
              <span className="text-lg font-black text-yellow-300 font-mono">{calcOilYield} {t.litres}</span>
              <span className="text-[10px] text-stone-400 block">(At 34% yield)</span>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 text-center">
              <span className="text-[10px] text-amber-300 block">{t.expectedKhali}</span>
              <span className="text-lg font-black text-amber-200 font-mono">{calcKhaliYield} kg</span>
              <span className="text-[10px] text-stone-400 block">(At 64% yield)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-stone-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={t.searchMustardPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-bold">
                <th className="py-3 px-3">{t.accountId}</th>
                <th className="py-3 px-3">{t.farmerName}</th>
                <th className="py-3 px-3">{t.villageAddress}</th>
                <th className="py-3 px-3 text-right">{t.mustardDeposited}</th>
                <th className="py-3 px-3 text-right">{t.availablePureOil}</th>
                <th className="py-3 px-3 text-right">{t.availableKhali}</th>
                <th className="py-3 px-3 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {mustardCustomers.map(customer => {
                const bal = customer.balances;
                const displayName = isHi ? (customer.nameHi || customer.name) : customer.name;
                const displayVillage = isHi ? (customer.villageHi || customer.village) : customer.village;

                return (
                  <tr 
                    key={customer.id} 
                    className="hover:bg-yellow-50/40 transition-colors cursor-pointer"
                    onClick={() => onSelectCustomer(customer)}
                  >
                    <td className="py-3.5 px-3 font-mono font-bold text-stone-600">
                      {customer.id}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-extrabold text-stone-900 text-sm">{displayName}</div>
                      <div className="text-[11px] text-stone-500">{customer.phone}</div>
                    </td>
                    <td className="py-3.5 px-3 text-stone-600">
                      {displayVillage || '-'}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-stone-900">
                      {bal?.mustardDepositTotalKg || 0} kg
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-amber-800 text-sm">
                      {bal?.oilAvailableLitre || 0} {t.litres}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-stone-700">
                      {bal?.khaliAvailableKg || 0} kg
                    </td>
                    <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex gap-1.5">
                        <button
                          onClick={() => onOpenQuickActionForCustomer(customer, 'mustard', 'withdraw')}
                          className="px-2.5 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-stone-950 font-bold rounded-xl text-xs active:scale-95 transition-all shadow-sm"
                        >
                          {t.withdrawOil}
                        </button>
                        <button
                          onClick={() => onOpenQuickActionForCustomer(customer, 'mustard', 'deposit')}
                          className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-xl text-xs active:scale-95 transition-all shadow-sm"
                        >
                          {t.depositMustard}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
