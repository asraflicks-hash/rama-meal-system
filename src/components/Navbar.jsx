import React from 'react';
import { 
  Wheat, 
  Store, 
  LayoutDashboard, 
  BookUser, 
  Smartphone, 
  Monitor, 
  TrendingUp, 
  PhoneCall, 
  ShoppingBag,
  Droplets,
  Receipt,
  PlusCircle,
  Languages,
  Calendar
} from 'lucide-react';
import { translations } from '../utils/i18n';

export default function Navbar({ 
  currentView, 
  setCurrentView, 
  isMobileSimulated, 
  setIsMobileSimulated,
  rates,
  cartCount,
  setIsCartOpen,
  onOpenQuickAction,
  lang,
  setLang,
  activeCommodity,
  setActiveCommodity,
  onOpenDailyReport
}) {
  const t = translations[lang] || translations.en;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm transition-all">
      {/* Top Live Rates & Language Bar */}
      <div className="bg-stone-900 text-stone-200 text-xs py-1.5 px-4 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          
          {/* Rates ticker */}
          <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5">
            <span className="inline-flex items-center gap-1 font-bold text-amber-400">
              <TrendingUp className="w-3.5 h-3.5" />
              {t.mandiRates}
            </span>
            <span>{t.wheat}: <b className="text-white">₹{rates?.wheatPerKg || 27.5}/kg</b></span>
            <span className="text-stone-600">•</span>
            <span>{t.flour}: <b className="text-white">₹{rates?.attaPerKg || 32}/kg</b></span>
            <span className="text-stone-600">•</span>
            <span>{t.mustard}: <b className="text-white">₹{rates?.mustardPerKg || 58}/kg</b></span>
            <span className="text-stone-600">•</span>
            <span>{t.mustardOil}: <b className="text-white">₹{rates?.oilPerLitre || 145}/L</b></span>
            <span className="text-stone-600">•</span>
            <span>{t.chokar}: <b className="text-white">₹{rates?.chokarPerKg || 22}/kg</b></span>
          </div>

          {/* Right: Language Selector & Phone */}
          <div className="flex items-center gap-3 text-[11px] font-medium">
            
            {/* PROMINENT LANGUAGE SELECTOR OPTION AT THE TOP */}
            <div className="flex items-center border border-amber-400/50 rounded-xl overflow-hidden bg-stone-800/90 shadow-inner">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 text-xs font-black transition-colors ${
                  lang === 'en' 
                    ? 'bg-amber-500 text-stone-950 shadow-sm' 
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLang('hi')}
                className={`px-2.5 py-1 text-xs font-black transition-colors ${
                  lang === 'hi' 
                    ? 'bg-amber-500 text-stone-950 shadow-sm' 
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                हिंदी
              </button>
            </div>

            <a 
              href="tel:+919876543210" 
              className="hidden sm:inline-flex items-center gap-1 text-stone-300 hover:text-white transition-colors"
            >
              <PhoneCall className="w-3 h-3 text-amber-400" />
              <span>{t.helpdesk}: +91 98765 43210</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Brand Logo & Tag */}
        <div 
          onClick={() => setCurrentView('website-home')}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white shadow-md shadow-amber-700/20 group-hover:scale-105 transition-transform">
            <Wheat className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-base sm:text-xl font-black tracking-tight text-stone-900 group-hover:text-amber-700 transition-colors truncate max-w-[130px] sm:max-w-none">
                {t.brandName}
              </h1>
              <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                By Sidra Motion
              </span>
            </div>
            <p className="text-[11px] font-medium text-stone-500 hidden sm:block">
              {t.brandSubtitle}
            </p>
          </div>
        </div>

        {/* View Switcher Tabs (Website vs Manager App) */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-bold shrink-0">
          <button
            onClick={() => setCurrentView('website-home')}
            className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg transition-all ${
              currentView.startsWith('website')
                ? 'bg-amber-700 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.storeAndWebsite}</span>
            <span className="sm:hidden">{lang === 'hi' ? 'वेबसाइट' : 'Store'}</span>
          </button>

          <button
            onClick={() => setCurrentView('manager-ledger')}
            className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg transition-all ${
              currentView.startsWith('manager')
                ? 'bg-stone-900 text-amber-300 shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
            }`}
          >
            <BookUser className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.millManagerSoftware}</span>
            <span className="sm:hidden">{lang === 'hi' ? 'सॉफ्टवेयर' : 'Software'}</span>
            <span className="hidden sm:inline bg-amber-500 text-stone-950 text-[10px] px-1.5 py-0.2 rounded-full font-black ml-0.5">
              PRO
            </span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {currentView.startsWith('manager') && (
            <button
              onClick={onOpenQuickAction}
              className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm active:scale-95 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t.newEntry}</span>
            </button>
          )}

          {currentView.startsWith('website') && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative inline-flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold px-3 py-2 rounded-xl transition-all"
            >
              <ShoppingBag className="w-4 h-4 text-amber-800" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Mobile frame toggle */}
          <button
            onClick={() => setIsMobileSimulated(!isMobileSimulated)}
            title={isMobileSimulated ? "Full Desktop View" : "Simulate Mobile App View"}
            className="p-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 transition-colors"
          >
            {isMobileSimulated ? (
              <Monitor className="w-4 h-4 text-indigo-600" />
            ) : (
              <Smartphone className="w-4 h-4 text-amber-700" />
            )}
          </button>
        </div>
      </div>

      {/* UNIFIED MILL SECTION: Atta Separate, Oil Separate, Both in One Section */}
      {currentView.startsWith('manager') && (
        <div className="bg-stone-50 border-t border-stone-200 px-2 sm:px-4 py-2 overflow-x-auto scrollbar-none w-full max-w-full">
          <div className="flex items-center justify-between gap-2 text-xs font-bold whitespace-nowrap min-w-max">
            
            {/* Connected Ledger Pill Group */}
            <div className="flex items-center gap-1 bg-stone-200/80 p-1 rounded-2xl border border-stone-300/80 shadow-inner shrink-0">
              <span className="text-[11px] font-black text-stone-600 px-2 hidden sm:inline">
                {lang === 'hi' ? 'मिल खाता:' : 'Mill Ledger:'}
              </span>

              {/* Atta / Wheat Tab */}
              <button
                type="button"
                onClick={() => {
                  setCurrentView('manager-ledger');
                  setActiveCommodity('wheat');
                }}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all text-xs font-black ${
                  (currentView === 'manager-ledger' || currentView === 'manager-customer-detail') && activeCommodity === 'wheat'
                    ? 'bg-amber-700 text-white shadow-md'
                    : 'text-stone-700 hover:text-stone-950 hover:bg-white/70'
                }`}
              >
                <Wheat className="w-3.5 h-3.5 text-amber-300" />
                <span>{lang === 'hi' ? '🌾 आटा (Wheat)' : '🌾 Wheat & Flour'}</span>
              </button>

              {/* Mustard Oil Tab */}
              <button
                type="button"
                onClick={() => {
                  setCurrentView('manager-ledger');
                  setActiveCommodity('mustard');
                }}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all text-xs font-black ${
                  (currentView === 'manager-ledger' || currentView === 'manager-customer-detail') && activeCommodity === 'mustard'
                    ? 'bg-yellow-500 text-stone-950 shadow-md font-black'
                    : 'text-stone-700 hover:text-stone-950 hover:bg-white/70'
                }`}
              >
                <Droplets className="w-3.5 h-3.5 text-yellow-600" />
                <span>{lang === 'hi' ? '🌻 तेल (Oil)' : '🌻 Mustard & Oil'}</span>
              </button>

              {/* Both / All Tab */}
              <button
                type="button"
                onClick={() => {
                  setCurrentView('manager-ledger');
                  setActiveCommodity('all');
                }}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all text-xs font-black ${
                  (currentView === 'manager-ledger' || currentView === 'manager-customer-detail') && activeCommodity === 'all'
                    ? 'bg-stone-900 text-amber-300 shadow-md'
                    : 'text-stone-700 hover:text-stone-950 hover:bg-white/70'
                }`}
              >
                <span>{lang === 'hi' ? '🌾🌻 दोनों' : '🌾🌻 Both'}</span>
              </button>
            </div>

            {/* Section 3: Operations & Stocks */}
            <button
              onClick={() => setCurrentView('manager-dashboard')}
              className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl flex items-center gap-1.5 transition-colors border shrink-0 ${
                currentView === 'manager-dashboard'
                  ? 'bg-stone-800 text-white border-stone-900 shadow-sm'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{t.operationsStocks}</span>
            </button>

            {/* Section 4: Counter Sales POS */}
            <button
              onClick={() => setCurrentView('manager-pos')}
              className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl flex items-center gap-1.5 transition-colors border shrink-0 ${
                currentView === 'manager-pos'
                  ? 'bg-stone-800 text-white border-stone-900 shadow-sm'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>{t.retailPos}</span>
            </button>

            {/* Section 5: Daily Report & PDF */}
            <button
              onClick={onOpenDailyReport}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl flex items-center gap-1.5 transition-all bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 shadow-sm shrink-0 font-bold active:scale-95"
              title="दैनिक आवक-जावक व PDF डाउनलोड"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-800" />
              <span>{lang === 'hi' ? '📅 दैनिक PDF' : '📅 Daily PDF'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
