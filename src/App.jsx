import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';
import ReceiptModal from './components/ReceiptModal';
import QuickActionModal from './components/QuickActionModal';
import CartDrawer from './components/CartDrawer';

// Website Pages
import WebsiteHome from './pages/Website/Home';
import WebsiteStore from './pages/Website/Store';
import CustomerPassbookLookup from './pages/Website/CustomerPassbookLookup';

// Manager Pages
import CustomerLedger from './pages/Manager/CustomerLedger';
import CustomerDetail from './pages/Manager/CustomerDetail';
import MustardOilLedger from './pages/Manager/MustardOilLedger';
import Dashboard from './pages/Manager/Dashboard';
import CounterSale from './pages/Manager/CounterSale';
import DailyReportModal from './pages/Manager/DailyReportModal';

import { ArrowLeft, X, Home as HomeIcon } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('manager-ledger'); // Default to manager ledger as requested
  const [viewHistory, setViewHistory] = useState(['manager-ledger']);
  const [isMobileSimulated, setIsMobileSimulated] = useState(false);
  const [lang, setLang] = useState('en'); // Default language is ENGLISH as requested
  const [millInfo, setMillInfo] = useState({
    name: 'Rama Flour & Mustard Oil Mills',
    phone: '+91 98765 43210',
    address: 'Main Market, Mandi Road, Near Station, Lucknow'
  });
  const [rates, setRates] = useState({});
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Daily Report & PDF Modal state
  const [isDailyReportOpen, setIsDailyReportOpen] = useState(false);

  // Quick Action Modal state
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [quickActionPreCustomer, setQuickActionPreCustomer] = useState(null);

  // Receipt Modal state
  const [receiptModalData, setReceiptModalData] = useState({
    isOpen: false,
    txn: null,
    customer: null
  });

  // E-Commerce Cart
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Active Commodity in Manager Ledger: 'wheat' (आटा), 'mustard' (तेल), or 'all' (दोनों)
  const [activeCommodity, setActiveCommodity] = useState('all');

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [infoRes, ratesRes, custRes, prodRes] = await Promise.all([
        fetch('/api/info'),
        fetch('/api/rates'),
        fetch('/api/customers'),
        fetch('/api/products')
      ]);

      if (infoRes.ok) setMillInfo(await infoRes.json());
      if (ratesRes.ok) setRates(await ratesRes.json());
      if (custRes.ok) setCustomers(await custRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
    } catch (err) {
      console.error('Error loading data from API', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update selected customer detail when customer list changes
  const refreshCustomer = async (id) => {
    try {
      const res = await fetch(`/api/customers/${id}`);
      if (res.ok) {
        const full = await res.json();
        setSelectedCustomer(full);
      }
      // Also refresh full list
      const listRes = await fetch('/api/customers');
      if (listRes.ok) {
        setCustomers(await listRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const navigateToView = (newView) => {
    if (newView === currentView) return;
    setViewHistory(prev => [...prev, newView]);
    setCurrentView(newView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (viewHistory.length > 1) {
      const nextHist = [...viewHistory];
      nextHist.pop(); // remove current view
      const prev = nextHist[nextHist.length - 1];
      setViewHistory(nextHist);
      setCurrentView(prev);
    } else {
      setViewHistory(['manager-ledger']);
      setCurrentView('manager-ledger');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHome = () => {
    setViewHistory(['manager-ledger']);
    setCurrentView('manager-ledger');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCustomer = async (customer) => {
    try {
      const res = await fetch(`/api/customers/${customer.id}`);
      if (res.ok) {
        const full = await res.json();
        setSelectedCustomer(full);
      } else {
        setSelectedCustomer(customer);
      }
      navigateToView('manager-customer-detail');
    } catch (err) {
      setSelectedCustomer(customer);
      navigateToView('manager-customer-detail');
    }
  };

  const handleOpenQuickAction = (customer = null, category = 'wheat', type = 'withdraw') => {
    setQuickActionPreCustomer(customer || selectedCustomer || customers[0]);
    setIsQuickActionOpen(true);
  };

  const handleTransactionComplete = async (txn, customer) => {
    // Refresh master data
    await fetchData();
    if (customer?.id) {
      await refreshCustomer(customer.id);
    }
    // Automatically open receipt slip modal!
    setReceiptModalData({
      isOpen: true,
      txn,
      customer
    });
  };

  const handleAddToCart = (product, option) => {
    const itemKey = `${product.id}-${option.size}`;
    const existing = cart.find(i => i.key === itemKey);
    if (existing) {
      setCart(cart.map(i => i.key === itemKey ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, {
        key: itemKey,
        productId: product.id,
        name: `${product.name} (${option.size})`,
        price: option.price,
        qty: 1
      }]);
    }
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (key, delta) => {
    setCart(cart.map(i => {
      if (i.key === key) {
        const newQty = i.qty + delta;
        return newQty > 0 ? { ...i, qty: newQty } : null;
      }
      return i;
    }).filter(Boolean));
  };

  return (
    <div className={`min-h-screen bg-stone-100 flex flex-col items-center transition-all w-full max-w-full overflow-x-hidden ${isMobileSimulated ? 'py-4 sm:py-8' : ''}`}>
      
      {/* Container - Full width normally, or smartphone frame if simulated */}
      <div className={`w-full max-w-full bg-stone-50 flex flex-col min-h-screen transition-all shadow-2xl overflow-x-hidden ${
        isMobileSimulated 
          ? 'max-w-[420px] rounded-[40px] border-[10px] border-stone-900 min-h-[860px]' 
          : 'max-w-7xl'
      }`}>
        
        {/* Navigation Bar */}
        <Navbar
          currentView={currentView}
          setCurrentView={setCurrentView}
          isMobileSimulated={isMobileSimulated}
          setIsMobileSimulated={setIsMobileSimulated}
          rates={rates}
          cartCount={cart.reduce((s, i) => s + i.qty, 0)}
          setIsCartOpen={setIsCartOpen}
          onOpenQuickAction={() => handleOpenQuickAction()}
          lang={lang}
          setLang={setLang}
          activeCommodity={activeCommodity}
          setActiveCommodity={setActiveCommodity}
          onOpenDailyReport={() => setIsDailyReportOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-full p-2.5 sm:p-6 overflow-x-hidden">
          
          {/* Universal Top Navigation Strip: "✕ यानी Home" और "← Back" */}
          {currentView !== 'manager-ledger' && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white px-3.5 py-2.5 rounded-2xl shadow-lg border border-stone-700 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                {/* 1. Back Button */}
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-800 hover:bg-stone-700 active:bg-stone-600 text-stone-100 hover:text-white rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 shadow border border-stone-600 hover:border-amber-400/60"
                  title="पीछे जाएं / Go Back"
                >
                  <ArrowLeft className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'hi' ? '← वापस (Back)' : '← Back'}</span>
                </button>

                {/* 2. X yani Home Button */}
                <button
                  type="button"
                  onClick={handleHome}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 rounded-xl text-xs sm:text-sm font-black transition-all active:scale-95 shadow-md hover:shadow-amber-500/25 border border-amber-400"
                  title="मुख्य होम स्क्रीन पर जाएं / Go Home"
                >
                  <X className="w-4 h-4 text-stone-950 font-black stroke-[3]" />
                  <span>{lang === 'hi' ? '✕ होम (Home)' : '✕ Home'}</span>
                </button>
              </div>

              {/* Breadcrumb / Current View Indicator */}
              <div className="text-[11px] sm:text-xs text-stone-300 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="text-stone-400">{lang === 'hi' ? 'वर्तमान विकल्प:' : 'Active Option:'}</span>
                <span className="text-amber-300 font-bold">
                  {currentView === 'manager-customer-detail' && (lang === 'hi' ? `खाता पासबुक (${selectedCustomer?.id || ''})` : `Passbook (${selectedCustomer?.id || ''})`)}
                  {currentView === 'manager-dashboard' && (lang === 'hi' ? 'दैनिक ऑपरेशन्स व मंडी भाव' : 'Daily Operations & Rates')}
                  {currentView === 'manager-pos' && (lang === 'hi' ? 'काउंटर नकद बिक्री (POS)' : 'Counter Sales POS')}
                  {currentView === 'website-home' && (lang === 'hi' ? 'वेबसाइट मुख्य पृष्ठ' : 'Website Home')}
                  {currentView === 'website-store' && (lang === 'hi' ? 'ताजा उत्पाद स्टोर' : 'Product Store')}
                  {currentView === 'website-passbook' && (lang === 'hi' ? 'किसान ऑनलाइन पासबुक' : 'Passbook Lookup')}
                </span>
              </div>
            </div>
          )}

          {/* Website Home */}
          {currentView === 'website-home' && (
            <WebsiteHome
              rates={rates}
              products={products}
              onAddToCart={handleAddToCart}
              onNavigateToStore={() => navigateToView('website-store')}
              onNavigateToPassbook={() => navigateToView('website-passbook')}
              onNavigateToManager={() => navigateToView('manager-ledger')}
              lang={lang}
            />
          )}

          {/* Website Store */}
          {currentView === 'website-store' && (
            <WebsiteStore
              products={products}
              onAddToCart={handleAddToCart}
              onBack={handleBack}
              onHome={handleHome}
              lang={lang}
            />
          )}

          {/* Farmer Passbook Self Lookup */}
          {currentView === 'website-passbook' && (
            <CustomerPassbookLookup
              onBack={handleBack}
              onHome={handleHome}
              lang={lang}
            />
          )}

          {/* Manager: Customer Ledger Directory (Unified: Wheat, Mustard Oil & Both in One Section) */}
          {(currentView === 'manager-ledger' || currentView === 'manager-mustard') && (
            <CustomerLedger
              customers={customers}
              rates={rates}
              onSelectCustomer={handleSelectCustomer}
              onRefresh={fetchData}
              onOpenQuickActionForCustomer={(c, cat, type) => handleOpenQuickAction(c, cat, type)}
              lang={lang}
              activeCommodity={activeCommodity}
              setActiveCommodity={setActiveCommodity}
              onOpenDailyReport={() => setIsDailyReportOpen(true)}
            />
          )}

          {/* Manager: Customer Detailed Passbook */}
          {currentView === 'manager-customer-detail' && selectedCustomer && (
            <CustomerDetail
              customer={selectedCustomer}
              onBack={handleBack}
              onHome={handleHome}
              onOpenQuickActionForCustomer={(c, cat, type) => handleOpenQuickAction(c, cat, type)}
              onShowReceipt={(txn, c) => setReceiptModalData({ isOpen: true, txn, customer: c })}
              onRefresh={fetchData}
              lang={lang}
              activeCommodity={activeCommodity}
            />
          )}

          {/* Manager: Daily Operations & Stock Dashboard */}
          {currentView === 'manager-dashboard' && (
            <Dashboard
              rates={rates}
              onUpdateRates={(newRates) => setRates(newRates)}
              onBack={handleBack}
              onHome={handleHome}
              lang={lang}
            />
          )}

          {/* Manager: Counter Sales POS */}
          {currentView === 'manager-pos' && (
            <CounterSale
              products={products}
              onSaleComplete={() => fetchData()}
              onBack={handleBack}
              onHome={handleHome}
              lang={lang}
            />
          )}

        </main>

        {/* Mobile Navigation Bottom Bar */}
        <MobileNav
          currentView={currentView}
          setCurrentView={setCurrentView}
          onOpenQuickAction={() => handleOpenQuickAction()}
          onBack={handleBack}
          onHome={handleHome}
          onOpenDailyReport={() => setIsDailyReportOpen(true)}
          lang={lang}
          activeCommodity={activeCommodity}
          setActiveCommodity={setActiveCommodity}
        />

        {/* Modals & Drawers */}
        <DailyReportModal
          isOpen={isDailyReportOpen}
          onClose={() => setIsDailyReportOpen(false)}
          onHome={handleHome}
          lang={lang}
          millInfo={millInfo}
        />

        <QuickActionModal
          isOpen={isQuickActionOpen}
          onClose={() => setIsQuickActionOpen(false)}
          customers={customers}
          preSelectedCustomer={quickActionPreCustomer}
          rates={rates}
          onTransactionComplete={handleTransactionComplete}
          lang={lang}
        />

        <ReceiptModal
          isOpen={receiptModalData.isOpen}
          onClose={() => setReceiptModalData({ ...receiptModalData, isOpen: false })}
          txn={receiptModalData.txn}
          customer={receiptModalData.customer}
          millInfo={millInfo}
          lang={lang}
        />

        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onUpdateQty={handleUpdateCartQty}
          onClearCart={() => setCart([])}
          millInfo={millInfo}
        />

      </div>
    </div>
  );
}
