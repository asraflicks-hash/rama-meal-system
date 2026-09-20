import React, { useState } from 'react';
import { 
  Search, 
  BookUser, 
  Wheat, 
  Droplets, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  Printer,
  Lock,
  ArrowLeft,
  X
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/format';

export default function CustomerPassbookLookup({ onBack, onHome, lang = 'en' }) {
  const [serialNo, setSerialNo] = useState('SN400');
  const [pin, setPin] = useState('982026');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!serialNo.trim()) {
      setErrorMsg('कृपया किसान सीरियल नंबर (उदा. SN404) दर्ज करें।');
      return;
    }
    if (!pin.trim()) {
      setErrorMsg('कृपया सुरक्षा पिन दर्ज करें।');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const cleanId = serialNo.trim().toUpperCase();
      const res = await fetch(`/api/lookup/${encodeURIComponent(cleanId)}?pin=${encodeURIComponent(pin.trim())}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'खाता नहीं मिला या अमान्य पिन');
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setErrorMsg(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 md:pb-16">
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

      {/* Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 mb-1">
          <BookUser className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
          किसान ऑनलाइन पासबुक ट्रैकर
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
          अपना सीरियल नंबर (उदा. SN404) केवल CAPITAL में और सुरक्षा पिन दर्ज करके अपना शेष बैलेंस देखें।
        </p>
      </div>

      {/* Search Form with Capital Serial No & PIN */}
      <form onSubmit={handleSearch} className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-black text-stone-800 flex items-center justify-between mb-1">
              <span>सीरियल नंबर (Serial No.) *</span>
              <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-mono">CAPITAL</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="उदा. SN404, SN400"
                value={serialNo}
                onChange={(e) => setSerialNo(e.target.value.toUpperCase())}
                className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-mono font-black uppercase text-amber-900 tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-stone-800 flex items-center gap-1 mb-1">
              <Lock className="w-3.5 h-3.5 text-stone-600" />
              <span>सुरक्षा पिन (Security PIN) *</span>
            </label>
            <input
              type="password"
              required
              placeholder="पिन दर्ज करें (उदा. 982026)"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-mono font-bold text-stone-900 tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 shadow-md"
        >
          <Search className="w-4 h-4" />
          <span>{loading ? 'जांच रहे हैं...' : 'पासबुक बैलेंस देखें'}</span>
        </button>
      </form>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Result Passbook Card */}
      {result && (
        <div className="bg-white rounded-3xl overflow-hidden border border-amber-200 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-amber-800 to-stone-900 text-white p-5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  सत्यापित किसान खाता
                </span>
                <h2 className="text-xl font-black mt-1">{result.name}</h2>
                <p className="text-xs text-amber-200">
                  गांव: {result.village || 'स्थानीय'} • खाता क्र.: {result.id}
                </p>
              </div>
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
          </div>

          {/* Balance Highlights */}
          <div className="p-5 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Wheat Balance */}
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs mb-1">
                <Wheat className="w-4 h-4 text-amber-700" />
                <span>शेष जमा गेहूं बैलेंस:</span>
              </div>
              <div className="text-3xl font-black text-amber-950 font-mono">
                {result.balances?.wheatCurrentBalanceKg || 0} <span className="text-sm font-normal">किग्रा</span>
              </div>
              <p className="text-[11px] text-amber-800 font-medium mt-1">
                (कुल जमा: {result.balances?.wheatDepositTotalKg || 0}kg - निकासी: {result.balances?.attaWithdrawnTotalKg || 0}kg)
              </p>
            </div>

            {/* Mustard Balance */}
            <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
              <div className="flex items-center gap-2 text-yellow-900 font-bold text-xs mb-1">
                <Droplets className="w-4 h-4 text-yellow-700" />
                <span>उपलब्ध शुद्ध सरसों तेल:</span>
              </div>
              <div className="text-3xl font-black text-yellow-950 font-mono">
                {result.balances?.oilAvailableLitre || 0} <span className="text-sm font-normal">लीटर</span>
              </div>
              <p className="text-[11px] text-yellow-800 font-medium mt-1">
                (उपलब्ध खली: {result.balances?.khaliAvailableKg || 0} किग्रा)
              </p>
            </div>
          </div>

          {/* Recent Slips */}
          <div className="p-5 pt-0 space-y-2">
            <h4 className="text-xs font-bold text-stone-700">हाल के लेनदेन (Recent Slips):</h4>
            <div className="space-y-1.5">
              {result.recentTransactions?.map(txn => (
                <div key={txn.id} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-stone-800">
                      {txn.item || (txn.type === 'deposit' ? 'जमा' : 'निकासी')}
                    </div>
                    <div className="text-[10px] text-stone-500">
                      तारीख: {formatDate(txn.date)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold font-mono text-amber-900">
                      {txn.quantityKg || txn.oilLitre} {txn.oilLitre ? 'L' : 'kg'}
                    </span>
                    <span className="block text-[10px] text-stone-500">
                      शेष: {txn.balanceAfterKg !== undefined ? `${txn.balanceAfterKg} kg` : '-'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-stone-50 border-t border-stone-200 text-center text-xs text-stone-500">
            रामा आटा व तेल मिल • किसी भी सहायता के लिए संपर्क करें: <b>+91 98765 43210</b>
          </div>
        </div>
      )}
    </div>
  );
}
