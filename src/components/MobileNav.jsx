import React from 'react';
import { Wheat, Droplets, PlusCircle, LayoutDashboard, Receipt, ShoppingBag } from 'lucide-react';
import { translations } from '../utils/i18n';

export default function MobileNav({ 
  currentView, 
  setCurrentView, 
  onOpenQuickAction, 
  lang = 'en',
  activeCommodity = 'wheat',
  setActiveCommodity = () => {}
}) {
  const t = translations[lang] || translations.en;
  const isManager = currentView.startsWith('manager');

  if (!isManager) {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-3 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setCurrentView('website-home')}
          className={`flex flex-col items-center gap-1 text-xs font-semibold ${
            currentView === 'website-home' ? 'text-amber-700 font-bold' : 'text-stone-500'
          }`}
        >
          <span className="text-base">🌾</span>
          <span>{t.home}</span>
        </button>
        <button
          onClick={() => setCurrentView('website-store')}
          className={`flex flex-col items-center gap-1 text-xs font-semibold ${
            currentView === 'website-store' ? 'text-amber-700 font-bold' : 'text-stone-500'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{t.products}</span>
        </button>
        <button
          onClick={() => setCurrentView('website-passbook')}
          className={`flex flex-col items-center gap-1 text-xs font-semibold ${
            currentView === 'website-passbook' ? 'text-amber-700 font-bold' : 'text-stone-500'
          }`}
        >
          <span className="text-base">📖</span>
          <span>{t.myPassbook}</span>
        </button>
        <button
          onClick={() => {
            setCurrentView('manager-ledger');
            setActiveCommodity('wheat');
          }}
          className="flex flex-col items-center gap-1 text-xs font-bold text-stone-900 bg-amber-100 px-2.5 py-1 rounded-xl"
        >
          <span className="text-xs">⚙️</span>
          <span>Manager</span>
        </button>
      </div>
    );
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-900 text-stone-300 border-t border-stone-800 px-2 py-2 flex items-center justify-around shadow-2xl safe-area-bottom">
      
      {/* 1. Wheat Section */}
      <button
        onClick={() => {
          setCurrentView('manager-ledger');
          setActiveCommodity('wheat');
        }}
        className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
          (currentView === 'manager-ledger' || currentView === 'manager-customer-detail') && activeCommodity === 'wheat'
            ? 'text-amber-400 font-black' 
            : 'hover:text-white'
        }`}
      >
        <Wheat className="w-5 h-5" />
        <span>{lang === 'hi' ? 'गेहूं/आटा' : 'Wheat/Flour'}</span>
      </button>

      {/* 2. Oil Section */}
      <button
        onClick={() => {
          setCurrentView('manager-ledger');
          setActiveCommodity('mustard');
        }}
        className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
          (currentView === 'manager-ledger' || currentView === 'manager-customer-detail') && activeCommodity === 'mustard'
            ? 'text-yellow-400 font-black' 
            : 'hover:text-white'
        }`}
      >
        <Droplets className="w-5 h-5" />
        <span>{lang === 'hi' ? 'सरसों/तेल' : 'Mustard/Oil'}</span>
      </button>

      {/* Floating Center (+) Button */}
      <button
        onClick={onOpenQuickAction}
        className="-mt-5 w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 p-2.5 shadow-lg shadow-amber-500/50 flex items-center justify-center border-4 border-stone-900 active:scale-95 transition-transform"
        title="Quick Entry"
      >
        <PlusCircle className="w-7 h-7 text-stone-950 stroke-[2.5]" />
      </button>

      {/* 3. Retail POS */}
      <button
        onClick={() => setCurrentView('manager-pos')}
        className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
          currentView === 'manager-pos' ? 'text-amber-400 font-bold' : 'hover:text-white'
        }`}
      >
        <Receipt className="w-5 h-5" />
        <span>{lang === 'hi' ? 'काउंटर' : 'POS'}</span>
      </button>

      {/* 4. Stocks & Dashboard */}
      <button
        onClick={() => setCurrentView('manager-dashboard')}
        className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
          currentView === 'manager-dashboard' ? 'text-amber-400 font-bold' : 'hover:text-white'
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>{lang === 'hi' ? 'स्टॉक' : 'Stock'}</span>
      </button>
    </div>
  );
}
