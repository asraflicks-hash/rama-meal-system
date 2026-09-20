import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Plus, 
  Minus, 
  Trash2, 
  Check, 
  Printer, 
  ShoppingBag,
  IndianRupee,
  Clock,
  ArrowLeft,
  X
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/format';

export default function CounterSale({ products, onSaleComplete, onBack, onHome, lang = 'en' }) {
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [salesHistory, setSalesHistory] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSales = async () => {
    try {
      const res = await fetch('/api/counter-sales');
      if (res.ok) {
        const data = await res.json();
        setSalesHistory(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const addToCart = (product, option) => {
    const itemKey = `${product.id}-${option.size}`;
    const existing = cart.find(item => item.key === itemKey);
    if (existing) {
      setCart(cart.map(item => item.key === itemKey ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, {
        key: itemKey,
        productId: product.id,
        name: `${product.name} (${option.size})`,
        price: option.price,
        qty: 1
      }]);
    }
  };

  const updateQty = (key, delta) => {
    setCart(cart.map(item => {
      if (item.key === key) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handleCompleteSale = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsSubmitting(true);

    try {
      const payload = {
        customerName: customerName || 'Counter Walk-in (Cash)',
        phone,
        items: cart,
        totalAmount: cartTotal,
        paymentMode,
        date: new Date().toISOString().split('T')[0],
        operator: 'Counter'
      };

      const res = await fetch('/api/counter-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const sale = await res.json();
        setSalesHistory([sale, ...salesHistory]);
        setCart([]);
        setCustomerName('');
        setPhone('');
        alert(`Sales Receipt #${sale.id} generated successfully! Total: ₹${cartTotal}`);
      }
    } catch (err) {
      alert('Error saving sale: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-20 md:pb-8">
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

      {/* Header */}
      <div className="bg-stone-900 text-white p-5 rounded-3xl shadow-lg border border-stone-800">
        <div className="flex items-center gap-2 mb-1">
          <Receipt className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-black">Retail Counter POS & Instant Invoicing</h2>
        </div>
        <p className="text-xs text-stone-300">
          Direct walk-in billing for packaged Atta, Cold-Pressed Mustard Oil, Wheat Bran (Chokar), and Cattle Feed (Khali)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Products Grid (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-bold text-xs text-stone-700">
            Select Products to Add to Bill:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {products.map(prod => (
              <div key={prod.id} className="bg-white rounded-2xl p-3.5 border border-stone-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                      {prod.category}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-stone-900 text-xs sm:text-sm line-clamp-1">
                    {prod.name}
                  </h4>
                </div>

                <div className="mt-2 pt-2 border-t border-stone-100 flex flex-wrap gap-1.5">
                  {prod.options?.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => addToCart(prod, opt)}
                      className="py-1 px-2.5 rounded-lg bg-stone-100 hover:bg-amber-700 hover:text-white text-stone-800 text-[11px] font-bold transition-all border border-stone-200 flex items-center gap-1 active:scale-95"
                    >
                      <span>{opt.size}</span>
                      <span className="text-amber-800 font-mono font-black group-hover:text-white">
                        ₹{opt.price}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Bill / Cart (Right col) */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm flex flex-col justify-between h-fit sticky top-20">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-3">
              <h3 className="font-black text-sm text-stone-900 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-amber-700" />
                <span>Invoice Cart</span>
              </h3>
              <span className="text-xs text-stone-500 font-medium">
                {cart.length} items
              </span>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {cart.map(item => (
                <div key={item.key} className="flex items-center justify-between text-xs p-2 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="flex-1 pr-2">
                    <p className="font-bold text-stone-900">{item.name}</p>
                    <p className="text-[11px] text-stone-500">₹{item.price} × {item.qty}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQty(item.key, -1)}
                      className="w-5 h-5 rounded-md bg-stone-200 hover:bg-stone-300 flex items-center justify-center font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-bold font-mono text-xs">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.key, 1)}
                      className="w-5 h-5 rounded-md bg-stone-200 hover:bg-stone-300 flex items-center justify-center font-bold text-xs"
                    >
                      +
                    </button>
                    <span className="font-bold font-mono text-stone-900 ml-1.5">
                      ₹{item.price * item.qty}
                    </span>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="text-center py-8 text-stone-400 text-xs">
                  Click on products from left to add to bill
                </div>
              )}
            </div>

            {/* Total and Form */}
            {cart.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-stone-200 text-xs">
                <div className="flex justify-between items-center text-sm font-black text-stone-900">
                  <span>Total Payable:</span>
                  <span className="text-lg font-mono text-emerald-700">
                    {formatCurrency(cartTotal)}
                  </span>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Customer Name (Optional)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <input
                    type="tel"
                    placeholder="Mobile Number (Optional)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('Cash')}
                    className={`p-2 rounded-xl border text-center font-bold ${
                      paymentMode === 'Cash' ? 'bg-amber-700 text-white border-amber-800' : 'bg-stone-50 text-stone-700'
                    }`}
                  >
                    💵 Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode('UPI')}
                    className={`p-2 rounded-xl border text-center font-bold ${
                      paymentMode === 'UPI' ? 'bg-indigo-700 text-white border-indigo-800' : 'bg-stone-50 text-stone-700'
                    }`}
                  >
                    📱 UPI / QR
                  </button>
                </div>

                <button
                  onClick={handleCompleteSale}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Generate Bill & Print Receipt</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
