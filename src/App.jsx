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

export default function App() {
  const [currentView, setCurrentView] = useState('manager-ledger'); // Default to manager ledger as requested
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

  const handleSelectCustomer = async (customer) => {
    try {
      const res = await fetch(`/api/customers/${customer.id}`);
      if (res.ok) {
        const full = await res.json();
        setSelectedCustomer(full);
      } else {
        setSelectedCustomer(customer);
      }
      setCurrentView('manager-customer-detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSelectedCustomer(customer);
      setCurrentView('manager-customer-detail');
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
        />

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-full p-2.5 sm:p-6 overflow-x-hidden">
          
          {/* Website Home */}
          {currentView === 'website-home' && (
            <WebsiteHome
              rates={rates}
              products={products}
              onAddToCart={handleAddToCart}
              onNavigateToStore={() => setCurrentView('website-store')}
              onNavigateToPassbook={() => setCurrentView('website-passbook')}
              onNavigateToManager={() => setCurrentView('manager-ledger')}
              lang={lang}
            />
          )}

          {/* Website Store */}
          {currentView === 'website-store' && (
            <WebsiteStore
              products={products}
              onAddToCart={handleAddToCart}
              lang={lang}
            />
          )}

          {/* Farmer Passbook Self Lookup */}
          {currentView === 'website-passbook' && (
            <CustomerPassbookLookup lang={lang} />
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
            />
          )}

          {/* Manager: Customer Detailed Passbook */}
          {currentView === 'manager-customer-detail' && selectedCustomer && (
            <CustomerDetail
              customer={selectedCustomer}
              onBack={() => setCurrentView('manager-ledger')}
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
            />
          )}

          {/* Manager: Counter Sales POS */}
          {currentView === 'manager-pos' && (
            <CounterSale
              products={products}
              onSaleComplete={() => fetchData()}
            />
          )}

        </main>

        {/* Mobile Navigation Bottom Bar */}
        <MobileNav
          currentView={currentView}
          setCurrentView={setCurrentView}
          onOpenQuickAction={() => handleOpenQuickAction()}
          lang={lang}
          activeCommodity={activeCommodity}
          setActiveCommodity={setActiveCommodity}
        />

        {/* Modals & Drawers */}
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
