import React from 'react';
import { Wheat, Droplets, PlusCircle, LayoutDashboard, Receipt, ShoppingBag, ArrowLeft, X, Calendar } from 'lucide-react';
import { translations } from '../utils/i18n';

export default function MobileNav({ 
  currentView, 
  setCurrentView, 
  onOpenQuickAction, 
  onBack,
  onHome,
  onOpenDailyReport = () => {},
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

      {/* 5. Daily PDF Report */}
      <button
        onClick={onOpenDailyReport}
        className="flex flex-col items-center gap-1 text-[11px] font-medium text-amber-300 hover:text-white transition-colors"
        title="दैनिक रिपोर्ट व PDF"
      >
        <Calendar className="w-5 h-5 text-amber-400" />
        <span>{lang === 'hi' ? 'रिपोर्ट' : 'Report'}</span>
      </button>

      {/* Floating Mobile Quick Back & Home Dock */}
      {currentView !== 'manager-ledger' && (onBack || onHome) && (
        <div className="fixed bottom-16 left-0 right-0 z-40 px-3 py-1 flex items-center justify-center pointer-events-none">
          <div className="bg-stone-950/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-2xl border border-stone-700 flex items-center gap-2 pointer-events-auto">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1 px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-full text-xs font-bold transition-all border border-stone-600 active:scale-95"
                title="वापस जाएं / Back"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'hi' ? '← वापस' : '← Back'}</span>
              </button>
            )}
            {onHome && (
              <button
                type="button"
                onClick={onHome}
                className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-full text-xs font-black transition-all border border-amber-400 active:scale-95 shadow"
                title="मुख्य होम स्क्रीन पर जाएं / Home"
              >
                <X className="w-3.5 h-3.5 font-black stroke-[3]" />
                <span>{lang === 'hi' ? '✕ होम' : '✕ Home'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
