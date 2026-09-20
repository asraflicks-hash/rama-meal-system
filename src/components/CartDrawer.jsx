import React, { useState } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, CheckCircle2, MessageCircle } from 'lucide-react';
import { formatCurrency } from '../utils/format';

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  cart, 
  onUpdateQty, 
  onClearCart, 
  millInfo 
}) {
  if (!isOpen) return null;

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(null);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!customerName || !phone || !address) {
      alert('कृपया नाम, मोबाइल नंबर और पता भरें');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customerName,
        phone,
        address,
        items: cart,
        total: cartTotal,
        paymentMethod: 'Cash on Delivery'
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const order = await res.json();
        setOrderPlaced(order);
        onClearCart();
      }
    } catch (err) {
      alert('ऑर्डर दर्ज करने में त्रुटि: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppOrderUrl = () => {
    const itemsText = cart.map(i => `• ${i.name} x ${i.qty} = ₹${i.price * i.qty}`).join('\n');
    const msg = `*नया ऑनलाइन आर्डर - ${millInfo.name || 'रामा आटा व तेल मिल'}*\n` +
      `_22 सिद्रा मोशन (By Sidra Motion)_\n` +
      `--------------------------\n` +
      `👤 नाम: ${customerName || '-'}\n` +
      `📱 फोन: ${phone || '-'}\n` +
      `📍 पता: ${address || '-'}\n` +
      `--------------------------\n` +
      `*सामान की सूची:*\n${itemsText}\n` +
      `--------------------------\n` +
      `💰 *कुल योग: ₹${cartTotal}*\n` +
      `भुगतान विधि: कैश ऑन डिलीवरी (COD)\n` +
      `कृपया आर्डर कन्फर्म करें!`;

    return `https://wa.me/91${(millInfo.phone || '9876543210').replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-4 bg-gradient-to-r from-amber-700 to-amber-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            <h3 className="font-black text-lg">आपका शॉपिंग थैला (Cart)</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {orderPlaced ? (
            <div className="text-center py-12 space-y-3">
              <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
              <h3 className="text-xl font-black text-stone-900">ऑर्डर सफलतापूर्वक दर्ज हो गया!</h3>
              <p className="text-xs text-stone-600">
                ऑर्डर संख्या: <b className="font-mono">{orderPlaced.id}</b>
              </p>
              <p className="text-xs text-stone-500">
                रामा आटा मिल की टीम जल्द ही आपके पते पर डिलीवरी के लिए संपर्क करेगी।
              </p>
              <button
                onClick={() => { setOrderPlaced(null); onClose(); }}
                className="mt-4 px-6 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-bold"
              >
                खरीदारी जारी रखें
              </button>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={item.key} className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between text-xs">
                    <div className="flex-1 pr-2">
                      <p className="font-extrabold text-stone-900">{item.name}</p>
                      <p className="text-stone-500">₹{item.price} प्रति पैक</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onUpdateQty(item.key, -1)}
                        className="w-6 h-6 rounded-lg bg-stone-200 hover:bg-stone-300 flex items-center justify-center font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono font-bold w-5 text-center text-sm">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => onUpdateQty(item.key, 1)}
                        className="w-6 h-6 rounded-lg bg-stone-200 hover:bg-stone-300 flex items-center justify-center font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <span className="font-mono font-black text-stone-900 ml-2">
                        ₹{item.price * item.qty}
                      </span>
                    </div>
                  </div>
                ))}

                {cart.length === 0 && (
                  <div className="text-center py-12 text-stone-400 text-xs">
                    आपका थैला खाली है। कृपया स्टोर से उत्पाद जोड़ें।
                  </div>
                )}
              </div>

              {/* Delivery Details Form */}
              {cart.length > 0 && (
                <div className="pt-3 border-t border-stone-200 space-y-3 text-xs">
                  <h4 className="font-bold text-stone-800">डिलीवरी व ग्राहक विवरण:</h4>
                  <input
                    type="text"
                    required
                    placeholder="आपका पूरा नाम *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="मोबाइल नंबर (व्हाट्सएप) *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                  />
                  <textarea
                    rows={2}
                    required
                    placeholder="पूरा डिलीवरी पता (मकान न., गली, मोहल्ला, लैंडमार्क) *"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && !orderPlaced && (
          <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-2.5">
            <div className="flex justify-between items-center text-sm font-black">
              <span>कुल देय राशि:</span>
              <span className="text-xl font-mono text-emerald-700">
                {formatCurrency(cartTotal)}
              </span>
            </div>

            <button
              onClick={handleSubmitOrder}
              disabled={isSubmitting}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'ऑर्डर प्रोसेस हो रहा है...' : 'कैश ऑन डिलीवरी ऑर्डर करें (Place COD)'}</span>
            </button>

            <a
              href={getWhatsAppOrderUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>सीधे व्हाट्सएप पर भेजें</span>
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
