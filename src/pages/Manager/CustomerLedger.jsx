import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  ChevronRight, 
  Phone, 
  MapPin, 
  Wheat, 
  Droplets,
  ArrowDownRight, 
  ArrowUpRight, 
  X, 
  Check, 
  Calendar, 
  Filter,
  ArrowDownLeft,
  ArrowUpRight as ArrowUpRightIcon,
  IndianRupee,
  Calculator,
  Percent,
  Trash2,
  Lock,
  KeyRound,
  AlertTriangle
} from 'lucide-react';
import { formatWeight, formatCurrency, formatDate } from '../../utils/format';
import { translations } from '../../utils/i18n';

export default function CustomerLedger({ 
  customers, 
  rates,
  onSelectCustomer, 
  onRefresh, 
  onOpenQuickActionForCustomer,
  lang = 'en',
  activeCommodity = 'all',
  setActiveCommodity = () => {},
  onOpenDailyReport = () => {}
}) {
  const t = translations[lang] || translations.en;
  const isHi = lang === 'hi';

  const [activeViewMode, setActiveViewMode] = useState('accounts'); // 'accounts', 'incoming', 'outgoing'
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [incomingSearch, setIncomingSearch] = useState('');
  const [outgoingSearch, setOutgoingSearch] = useState('');
  const [allTransactions, setAllTransactions] = useState([]);
  
  // Mustard Crushing Pure Oil Yield Calculator (34% Oil)
  const [calcMustardKg, setCalcMustardKg] = useState(100);
  const oilRate = rates?.oilYieldPercent || 34;
  const calcOilYield = ((calcMustardKg * oilRate) / 100).toFixed(1);

  // Registration form with mandatory Name, Village, Location, and OPTIONAL Mobile Number
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [regPin, setRegPin] = useState('');
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    village: '',
    location: '',
    phone: '',
    fatherName: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Account Delete Confirmation State (PIN 982026 Protected)
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletePin, setDeletePin] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all transactions for the incoming/outgoing date search
  const fetchTransactions = async () => {
    try {
      let url = '/api/transactions';
      const params = new URLSearchParams();
      if (dateFilter) params.append('date', dateFilter);
      if (params.toString()) url += `?${params.toString()}`;
      const res = await fetch(url);
      if (res.ok) {
        setAllTransactions(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [dateFilter]);

  // Filter customers for accounts view by SN, Name, Village, Location, Phone, Date
  const filteredCustomers = customers.filter(c => {
    const s = searchTerm.toLowerCase().trim();
    if (!s) return true;
    return (
      c.id?.toLowerCase().includes(s) || // SN search e.g. SN400
      c.name?.toLowerCase().includes(s) ||
      c.nameHi?.toLowerCase().includes(s) ||
      c.village?.toLowerCase().includes(s) ||
      c.villageHi?.toLowerCase().includes(s) ||
      c.location?.toLowerCase().includes(s) ||
      c.locationHi?.toLowerCase().includes(s) ||
      c.phone?.includes(s)
    );
  });

  // Filter Incoming (आने का - Deposit)
  const incomingTxns = allTransactions.filter(t => {
    if (t.type !== 'deposit') return false;
    if (dateFilter && t.date !== dateFilter) return false;
    if (activeCommodity === 'wheat' && t.category !== 'wheat') return false;
    if (activeCommodity === 'mustard' && t.category !== 'mustard') return false;
    const s = incomingSearch.toLowerCase().trim();
    if (!s) return true;
    return (
      t.customerId?.toLowerCase().includes(s) ||
      t.customerName?.toLowerCase().includes(s) ||
      t.customerVillage?.toLowerCase().includes(s) ||
      t.customerLocation?.toLowerCase().includes(s) ||
      t.item?.toLowerCase().includes(s)
    );
  });

  // Filter Outgoing (जाने का - Withdrawal)
  const outgoingTxns = allTransactions.filter(t => {
    if (t.type !== 'withdraw') return false;
    if (dateFilter && t.date !== dateFilter) return false;
    if (activeCommodity === 'wheat' && t.category !== 'wheat') return false;
    if (activeCommodity === 'mustard' && (t.category !== 'mustard' && t.category !== 'mustard_oil')) return false;
    const s = outgoingSearch.toLowerCase().trim();
    if (!s) return true;
    return (
      t.customerId?.toLowerCase().includes(s) ||
      t.customerName?.toLowerCase().includes(s) ||
      t.customerVillage?.toLowerCase().includes(s) ||
      t.customerLocation?.toLowerCase().includes(s) ||
      t.item?.toLowerCase().includes(s)
    );
  });

  // Totals for Wheat
  const totalWheatStored = customers.reduce((sum, c) => sum + (c.balances?.wheatCurrentBalanceKg || 0), 0);
  const totalFlourDispatched = customers.reduce((sum, c) => sum + (c.balances?.attaWithdrawnTotalKg || 0), 0);

  // Totals for Mustard & Oil
  const totalMustardIn = customers.reduce((sum, c) => sum + (c.balances?.mustardDepositTotalKg || 0), 0);
  const totalOilAvailable = customers.reduce((sum, c) => sum + (c.balances?.oilAvailableLitre || 0), 0);

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (regPin.trim() !== '982026') {
      alert(isHi ? 'अमान्य सुरक्षा पिन! नया खाता बनाने के लिए सही पिन (982026) दर्ज करें।' : 'Invalid PIN! Correct PIN 982026 is required.');
      return;
    }

    if (!newCustomer.name || !newCustomer.village || !newCustomer.location) {
      alert(isHi ? 'कृपया नाम, गांव और लोकेशन/पता अवश्य भरें!' : 'Name, Village, and Location are mandatory!');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newCustomer, pin: regPin.trim() })
      });
      if (res.ok) {
        const created = await res.json();
        setIsAddModalOpen(false);
        setNewCustomer({ name: '', village: '', location: '', phone: '', fatherName: '', notes: '' });
        setRegPin('');
        await onRefresh();
        onSelectCustomer(created);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add customer');
      }
    } catch (err) {
      alert('Error adding customer: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCustomer = async (e) => {
    e.preventDefault();
    if (!deleteTarget) return;

    if (deletePin.trim() !== '982026') {
      alert(isHi ? 'अमान्य सुरक्षा पिन! खाता डिलीट करने के लिए सही पिन (982026) दर्ज करना अनिवार्य है।' : 'Invalid PIN! Correct PIN 982026 is required.');
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/customers/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: deletePin.trim() })
      });
      if (res.ok) {
        setDeleteTarget(null);
        setDeletePin('');
        await onRefresh();
        alert(isHi ? 'खाता सफलतापूर्वक डिलीट किया गया।' : 'Account successfully deleted.');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete account');
      }
    } catch (err) {
      alert('Error deleting customer: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      
      {/* 1. TOP COMMODITY SELECTOR: Atta Separate, Tel Separate, Both in One Section */}
      <div className="bg-white p-2 sm:p-2.5 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 w-full max-w-full">
        <div className="grid grid-cols-3 sm:flex items-center gap-1 bg-stone-100 p-1 rounded-2xl border border-stone-200 w-full sm:w-auto">
          {/* Atta / Wheat Section Button */}
          <button
            type="button"
            onClick={() => setActiveCommodity('wheat')}
            className={`px-2 sm:px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 sm:gap-2 ${
              activeCommodity === 'wheat'
                ? 'bg-amber-700 text-white shadow-md'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/70'
            }`}
          >
            <Wheat className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 shrink-0" />
            <span className="truncate">{isHi ? '🌾 आटा' : '🌾 Flour'}</span>
          </button>

          {/* Mustard Oil Section Button */}
          <button
            type="button"
            onClick={() => setActiveCommodity('mustard')}
            className={`px-2 sm:px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 sm:gap-2 ${
              activeCommodity === 'mustard'
                ? 'bg-yellow-500 text-stone-950 shadow-md font-black'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/70'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-600 shrink-0" />
            <span className="truncate">{isHi ? '🌻 तेल' : '🌻 Oil'}</span>
          </button>

          {/* Both / All Section Button */}
          <button
            type="button"
            onClick={() => setActiveCommodity('all')}
            className={`px-2 sm:px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 sm:gap-2 ${
              activeCommodity === 'all'
                ? 'bg-stone-900 text-amber-300 shadow-md'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/70'
            }`}
          >
            <span className="truncate">{isHi ? '🌾🌻 दोनों' : '🌾🌻 Both'}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* DAILY REGISTER & REPORT BUTTON */}
          <button
            type="button"
            onClick={onOpenDailyReport}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 hover:from-stone-800 hover:to-stone-700 text-amber-300 border border-amber-500/50 font-black px-3.5 py-2 rounded-xl text-xs shadow-md transition-all active:scale-95"
            title="तारीख वार हिसाब व PDF रिपोर्ट"
          >
            <Calendar className="w-4 h-4 text-amber-400 stroke-[2.5]" />
            <span>📅 {isHi ? 'दैनिक रजिस्टर व PDF' : 'Daily Report & PDF'}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black px-3.5 py-2 rounded-xl text-xs shadow-sm transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>+ {isHi ? 'नया खाता (SN)' : 'Register Farmer (SN)'}</span>
          </button>
        </div>
      </div>

      {/* 2. TOP BANNER & METRICS (Adapts dynamically to Wheat, Mustard, or Both) */}
      <div className={`text-white rounded-3xl p-5 sm:p-6 shadow-xl border transition-all ${
        activeCommodity === 'mustard'
          ? 'bg-gradient-to-r from-stone-900 via-yellow-950 to-stone-900 border-yellow-800/40'
          : activeCommodity === 'wheat'
          ? 'bg-stone-900 border-stone-800'
          : 'bg-stone-900 border-stone-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 bg-amber-500/20 text-amber-300">
              {activeCommodity === 'wheat' && <Wheat className="w-3.5 h-3.5 text-amber-400" />}
              {activeCommodity === 'mustard' && <Droplets className="w-3.5 h-3.5 text-yellow-400" />}
              {activeCommodity === 'all' && <span>🌾🌻</span>}
              <span>
                {activeCommodity === 'wheat'
                  ? (isHi ? 'सेक्शन: गेहूं व आटा चक्की (SN400 सीरीज़)' : 'Section: Wheat & Flour Mill Ledger (SN400 Series)')
                  : activeCommodity === 'mustard'
                  ? (isHi ? 'सेक्शन: सरसों पेराई व तेल एक्सपेलर (SN400 सीरीज़)' : 'Section: Mustard Oil Expeller Ledger (SN400 Series)')
                  : (isHi ? 'संयुक्त रजिस्टर: आटा व तेल दोनों (SN400 सीरीज़)' : 'Unified Master Ledger: Flour & Mustard Oil (SN400 Series)')
                }
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {activeCommodity === 'wheat'
                ? (isHi ? 'गेहूं जमा, आटा पिसाई निकासी व आवक-जावक रजिस्टर' : 'Wheat Deposit, Flour Withdrawal & Daily In/Out Register')
                : activeCommodity === 'mustard'
                ? (isHi ? 'सरसों आवक, शुद्ध कच्ची घानी तेल व खली रजिस्टर' : 'Mustard Inflow, Pure Cold-Pressed Oil & Cattle Cake Register')
                : (isHi ? 'आटा व तेल संपूर्ण खाता-बही रजिस्टर' : 'All-In-One Wheat, Flour, Mustard & Pure Oil Master Register')
              }
            </h2>
            <p className="text-xs text-stone-300 mt-1 max-w-2xl">
              {isHi 
                ? 'तारीख, गांव, SN400 संख्या या नाम से सर्च करें • आने का (जमा) व जाने का (निकासी) अलग-अलग देखें' 
                : 'Search by Date, Village, SN400 ID, or Name • View Incoming (Deposit) and Outgoing (Withdrawal) separately'}
            </p>
          </div>

          <div className="text-xs text-stone-400 font-mono">
            {customers.length} Accounts Registered (SN400+)
          </div>
        </div>

        {/* Dynamic Aggregated Metrics */}
        {activeCommodity === 'wheat' && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6 pt-5 border-t border-stone-800">
            <div className="bg-stone-800/90 rounded-2xl p-3 border border-stone-700">
              <span className="text-[11px] text-stone-400 block font-medium">{isHi ? 'कुल किसान खाते' : 'Total Accounts'}</span>
              <span className="text-lg sm:text-2xl font-black text-white font-mono">
                {customers.length}
              </span>
              <span className="text-[10px] text-amber-400 block mt-0.5">SN400 - SN{400 + Math.max(0, customers.length - 1)}</span>
            </div>

            <div className="bg-stone-800/90 rounded-2xl p-3 border border-stone-700">
              <span className="text-[11px] text-amber-300 block font-medium">{isHi ? 'वर्तमान जमा गेहूं' : 'Current Stored Wheat'}</span>
              <span className="text-lg sm:text-2xl font-black text-amber-200 font-mono">
                {totalWheatStored.toLocaleString()} <span className="text-xs font-normal">kg</span>
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">
                {(totalWheatStored / 100).toFixed(2)} Quintal
              </span>
            </div>

            <div className="bg-stone-800/90 rounded-2xl p-3 border border-stone-700">
              <span className="text-[11px] text-stone-400 block font-medium">{isHi ? 'कुल आटा निकासी' : 'Flour Dispatched'}</span>
              <span className="text-lg sm:text-2xl font-black text-white font-mono">
                {totalFlourDispatched.toLocaleString()} <span className="text-xs font-normal">kg</span>
              </span>
            </div>
          </div>
        )}

        {activeCommodity === 'mustard' && (
          <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-6 pt-5 border-t border-yellow-800/40">
            <div className="bg-stone-800/90 rounded-2xl p-3 border border-yellow-700/50">
              <span className="text-[11px] text-yellow-400 block font-medium">{isHi ? 'कुल जमा सरसों' : 'Total Mustard In'}</span>
              <span className="text-lg sm:text-2xl font-black text-white font-mono">
                {totalMustardIn.toLocaleString()} <span className="text-xs font-normal">kg</span>
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">{(totalMustardIn / 100).toFixed(2)} Quintal</span>
            </div>

            <div className="bg-stone-800/90 rounded-2xl p-3 border border-yellow-700/50">
              <span className="text-[11px] text-yellow-300 block font-medium">{isHi ? 'उपलब्ध शुद्ध तेल (Pure Oil)' : 'Available Pure Oil'}</span>
              <span className="text-lg sm:text-2xl font-black text-yellow-300 font-mono">
                {totalOilAvailable.toFixed(1)} <span className="text-xs font-normal">L</span>
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">100% Pure Cold-Pressed</span>
            </div>
          </div>
        )}

        {activeCommodity === 'all' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-6 pt-5 border-t border-stone-800">
            <div className="bg-stone-800/90 rounded-2xl p-2.5 border border-stone-700">
              <span className="text-[10px] text-stone-400 block font-medium">{isHi ? 'कुल किसान (SN400+)' : 'Total Accounts'}</span>
              <span className="text-lg font-black text-white font-mono">{customers.length}</span>
            </div>
            <div className="bg-stone-800/90 rounded-2xl p-2.5 border border-stone-700">
              <span className="text-[10px] text-amber-300 block font-medium">{isHi ? 'जमा गेहूं (Atta)' : 'Stored Wheat'}</span>
              <span className="text-lg font-black text-amber-200 font-mono">{totalWheatStored.toLocaleString()} kg</span>
            </div>
            <div className="bg-stone-800/90 rounded-2xl p-2.5 border border-stone-700">
              <span className="text-[10px] text-yellow-400 block font-medium">{isHi ? 'जमा सरसों (Mustard)' : 'Mustard Seeds'}</span>
              <span className="text-lg font-black text-white font-mono">{totalMustardIn.toLocaleString()} kg</span>
            </div>
            <div className="bg-stone-800/90 rounded-2xl p-2.5 border border-stone-700">
              <span className="text-[10px] text-yellow-300 block font-medium">{isHi ? 'शुद्ध तेल (Pure Oil)' : 'Pure Oil Available'}</span>
              <span className="text-lg font-black text-yellow-300 font-mono">{totalOilAvailable.toFixed(1)} L</span>
            </div>
          </div>
        )}

        {/* Mustard Crushing Yield Calculator (Shown when in Mustard or Both view) */}
        {(activeCommodity === 'mustard' || activeCommodity === 'all') && (
          <div className="mt-5 pt-4 border-t border-yellow-800/30 bg-black/25 rounded-2xl p-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-yellow-400" />
                <h3 className="font-bold text-xs text-yellow-200">
                  {isHi ? 'सरसों पेराई शुद्ध तेल रिकवरी कैलकुलेटर (34% तेल):' : 'Mustard Crushing Pure Oil Recovery Calculator (34% Oil):'}
                </h3>
              </div>
              <span className="text-[10px] text-stone-400">100 kg सरसों = 34 Litre शुद्ध तेल</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center">
              <div>
                <label className="text-[10px] text-stone-300 block mb-1">
                  {isHi ? 'सरसों वजन दर्ज करें (kg):' : 'Enter Mustard Weight (kg):'}
                </label>
                <input
                  type="number"
                  value={calcMustardKg}
                  onChange={(e) => setCalcMustardKg(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-stone-900 border border-yellow-700/50 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400"
                />
              </div>

              <div className="bg-yellow-950/50 border-2 border-yellow-500/60 rounded-xl p-2.5 text-center">
                <span className="text-[11px] text-yellow-300 block font-bold">
                  {isHi ? 'प्राप्त शुद्ध तेल (34% Pure Oil):' : 'Expected Pure Oil (34%):'}
                </span>
                <span className="text-xl font-black font-mono text-yellow-300">
                  {calcOilYield} <span className="text-sm">Litre</span>
                </span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 3. VIEW SELECTOR: 1) Accounts Directory  2) Incoming (आने का)  3) Outgoing (जाने का) */}
      <div className="bg-white p-2 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 w-full max-w-full">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveViewMode('accounts')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${
              activeViewMode === 'accounts'
                ? 'bg-stone-900 text-amber-300 shadow-sm'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{isHi ? '📋 किसान खाते' : '📋 Accounts'}</span>
          </button>

          <button
            onClick={() => setActiveViewMode('incoming')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${
              activeViewMode === 'incoming'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>
              {isHi ? '📥 आने का (जमा)' : '📥 Incoming'}
            </span>
            <span className="bg-white/20 text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5">
              {incomingTxns.length}
            </span>
          </button>

          <button
            onClick={() => setActiveViewMode('outgoing')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${
              activeViewMode === 'outgoing'
                ? 'bg-amber-700 text-white shadow-sm'
                : 'text-amber-900 bg-amber-50 hover:bg-amber-100'
            }`}
          >
            <ArrowUpRightIcon className="w-3.5 h-3.5" />
            <span>
              {isHi ? '📤 जाने का (निकासी)' : '📤 Outgoing'}
            </span>
            <span className="bg-white/20 text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5">
              {outgoingTxns.length}
            </span>
          </button>

          {/* 4. Daily Report & PDF Tab */}
          <button
            type="button"
            onClick={onOpenDailyReport}
            className="px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 shadow-sm active:scale-95"
            title="तारीख वार हिसाब व PDF"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-800" />
            <span>{isHi ? '📅 दैनिक रिपोर्ट (PDF)' : '📅 Daily Report (PDF)'}</span>
          </button>
        </div>

        {/* Date Filter Input */}
        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs pt-1 sm:pt-0 border-t sm:border-t-0 border-stone-100">
          <span className="text-stone-500 font-bold flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <span>{isHi ? 'तारीख:' : 'Date:'}</span>
          </span>
          <div className="flex items-center gap-1">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="p-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-stone-400 hover:text-stone-600 text-xs px-2 py-1 bg-stone-100 rounded-lg"
                title="Clear Date"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* VIEW 1: FARMER ACCOUNTS DIRECTORY */}
      {activeViewMode === 'accounts' && (
        <div className="space-y-3">
          {/* Universal Search Bar: SN, Name, Village, Location, Mobile */}
          <div className="relative">
            <input
              type="text"
              placeholder={isHi 
                ? "खाता क्र. (उदा. SN400), नाम, गांव, लोकेशन या फोन नंबर से खोजें..." 
                : "Search by SN ID (e.g. SN400), Name, Village, Location, or Phone..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-stone-300 rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-sm font-medium"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 text-xs bg-stone-100 p-1 rounded-full"
              >
                ✕
              </button>
            )}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCustomers.map(customer => {
              // Wheat balances
              const wheatBal = customer.balances?.wheatCurrentBalanceKg || 0;
              const wheatDeposited = customer.balances?.wheatDepositTotalKg || 0;
              const attaWithdrawn = customer.balances?.attaWithdrawnTotalKg || 0;

              // Mustard & Oil balances
              const mustardBal = customer.balances?.mustardCurrentBalanceKg || 0;
              const mustardDeposited = customer.balances?.mustardDepositTotalKg || 0;
              const oilAvailable = customer.balances?.oilAvailableLitre || 0;
              const khaliAvailable = customer.balances?.khaliAvailableKg || 0;

              const displayName = isHi ? (customer.nameHi || customer.name) : customer.name;
              const displayFather = isHi ? (customer.fatherNameHi || customer.fatherName) : customer.fatherName;
              const displayVillage = isHi ? (customer.villageHi || customer.village) : customer.village;
              const displayLocation = isHi ? (customer.locationHi || customer.location) : customer.location;

              return (
                <div
                  key={customer.id}
                  onClick={() => onSelectCustomer(customer)}
                  className="bg-white rounded-2xl p-4 border border-stone-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group relative flex flex-col justify-between"
                >
                  <div>
                    {/* Top: SN400 ID Badge */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-black text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-300">
                            {customer.id}
                          </span>
                          {customer.notes && (
                            <span className="text-[10px] text-stone-400 truncate max-w-[130px]">
                              • {customer.notes}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-extrabold text-stone-900 group-hover:text-amber-800 transition-colors mt-1">
                          {displayName}
                        </h3>
                        {displayFather && (
                          <p className="text-xs text-stone-500">
                            {isHi ? 'पिता:' : 'S/o:'} {displayFather}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          title={isHi ? "खाता डिलीट करें (पिन आवश्यक)" : "Delete Account (PIN Required)"}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(customer);
                            setDeletePin('');
                          }}
                          className="w-8 h-8 rounded-full bg-stone-100 hover:bg-red-50 text-stone-400 hover:text-red-600 border border-transparent hover:border-red-200 flex items-center justify-center transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-stone-100 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center transition-colors">
                          <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Village & Location */}
                    <div className="space-y-1 text-xs text-stone-500 mb-3.5">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span className="font-bold text-stone-700">{displayVillage}</span>
                        {displayLocation && (
                          <span className="text-stone-400 text-[11px] truncate">
                            ({displayLocation})
                          </span>
                        )}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-1 text-[11px] font-mono text-stone-400 pl-5">
                          <Phone className="w-3 h-3" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* COMMODITY BALANCES ACCORDING TO SELECTION */}
                  <div className="space-y-2.5 pt-3 border-t border-stone-100">
                    
                    {/* 1. Wheat Account Box (Shown when Wheat or Both) */}
                    {(activeCommodity === 'wheat' || activeCommodity === 'all') && (
                      <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Wheat className="w-3.5 h-3.5 text-amber-700" />
                            <span className="text-xs font-bold text-amber-900">
                              {isHi ? 'शेष गेहूं (Atta):' : 'Remaining Wheat:'}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className={`font-mono font-black text-base ${
                              wheatBal > 0 ? 'text-amber-950' : 'text-stone-400'
                            }`}>
                              {wheatBal.toLocaleString()} kg
                            </span>
                            <span className="text-[10px] text-stone-500 block">
                              {(wheatBal / 100).toFixed(2)} Q
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between text-[11px] text-stone-500 mt-1 pt-1 border-t border-amber-200/50">
                          <span>{isHi ? 'जमा:' : 'In:'} <b>{wheatDeposited} kg</b></span>
                          <span>{isHi ? 'निकाला:' : 'Out:'} <b>{attaWithdrawn} kg</b></span>
                        </div>
                      </div>
                    )}

                    {/* 2. Mustard Oil Account Box (Shown when Mustard or Both) */}
                    {(activeCommodity === 'mustard' || activeCommodity === 'all') && (
                      <div className="p-2.5 rounded-xl bg-yellow-50/80 border border-yellow-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Droplets className="w-3.5 h-3.5 text-yellow-600" />
                            <span className="text-xs font-bold text-yellow-950">
                              {isHi ? 'शुद्ध तेल (Pure Oil):' : 'Pure Oil Available:'}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-black text-base text-yellow-950">
                              {oilAvailable.toFixed(1)} L
                            </span>
                            <span className="text-[10px] text-stone-500 block">
                              100% Pure Oil
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between text-[11px] text-stone-500 mt-1 pt-1 border-t border-yellow-200">
                          <span>{isHi ? 'सरसों जमा:' : 'Mustard In:'} <b>{mustardDeposited} kg</b></span>
                          <span>{isHi ? 'बची सरसों:' : 'Seed Bal:'} <b>{mustardBal} kg</b></span>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Action Buttons */}
                  <div className="mt-3 pt-2" onClick={(e) => e.stopPropagation()}>
                    {activeCommodity === 'wheat' && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => onOpenQuickActionForCustomer(customer, 'wheat', 'withdraw')}
                          className="flex-1 py-2 px-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors active:scale-95"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>{isHi ? '- आटा निकासी' : '- Withdraw Flour'}</span>
                        </button>
                        <button
                          onClick={() => onOpenQuickActionForCustomer(customer, 'wheat', 'deposit')}
                          className="flex-1 py-2 px-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors active:scale-95"
                        >
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          <span>{isHi ? '+ गेहूं जमा' : '+ Deposit Wheat'}</span>
                        </button>
                      </div>
                    )}

                    {activeCommodity === 'mustard' && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => onOpenQuickActionForCustomer(customer, 'mustard', 'withdraw')}
                          className="flex-1 py-2 px-2 bg-yellow-500 hover:bg-yellow-400 text-stone-950 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-colors active:scale-95"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>{isHi ? '- तेल निकासी' : '- Withdraw Pure Oil'}</span>
                        </button>
                        <button
                          onClick={() => onOpenQuickActionForCustomer(customer, 'mustard', 'deposit')}
                          className="flex-1 py-2 px-2 bg-stone-900 hover:bg-stone-800 text-yellow-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors active:scale-95"
                        >
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          <span>{isHi ? '+ सरसों जमा' : '+ Deposit Mustard'}</span>
                        </button>
                      </div>
                    )}

                    {activeCommodity === 'all' && (
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => onOpenQuickActionForCustomer(customer, 'wheat', 'withdraw')}
                          className="py-1.5 px-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-colors active:scale-95"
                        >
                          <span>🌾 {isHi ? 'आटा (+/-)' : 'Flour (+/-)'}</span>
                        </button>
                        <button
                          onClick={() => onOpenQuickActionForCustomer(customer, 'mustard', 'withdraw')}
                          className="py-1.5 px-2 bg-yellow-500 hover:bg-yellow-400 text-stone-950 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 transition-colors active:scale-95"
                        >
                          <span>🌻 {isHi ? 'तेल (+/-)' : 'Oil (+/-)'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: INCOMING (आने का - GRAIN DEPOSITS) WITH DEDICATED SEARCH */}
      {activeViewMode === 'incoming' && (
        <div className="bg-white rounded-3xl p-5 border border-emerald-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <h3 className="font-black text-base text-stone-900">
                  {activeCommodity === 'wheat' 
                    ? (isHi ? 'आवक रजिस्टर: गेहूं जमा (आने का)' : 'Incoming Register: Wheat Deposits (आने का)')
                    : activeCommodity === 'mustard'
                    ? (isHi ? 'आवक रजिस्टर: सरसों जमा (आने का)' : 'Incoming Register: Mustard Deposits (आने का)')
                    : (isHi ? 'आवक रजिस्टर: गेहूं व सरसों जमा (आने का)' : 'Incoming Register: Grain Deposits (आने का)')
                  }
                </h3>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {dateFilter 
                  ? `${isHi ? 'तारीख' : 'Date'}: ${formatDate(dateFilter)}` 
                  : (isHi ? 'सभी तारीखों की आवक जमा' : 'All Date Grain Inflows')}
              </p>
            </div>

            {/* Dedicated Search for Incoming */}
            <div className="relative w-full sm:w-72 shrink-0">
              <input
                type="text"
                placeholder={isHi ? "आने वाले में खोजें (SN, नाम, गांव)..." : "Search incoming (SN, Name, Village)..."}
                value={incomingSearch}
                onChange={(e) => setIncomingSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />
            </div>
          </div>

          {/* Incoming Table */}
          <div className="overflow-x-auto w-full max-w-full block">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-emerald-200 bg-emerald-50/50 text-emerald-950 font-bold">
                  <th className="py-3 px-3">Date (तारीख)</th>
                  <th className="py-3 px-3">Account (SN)</th>
                  <th className="py-3 px-3">Farmer Name</th>
                  <th className="py-3 px-3">Village & Location</th>
                  <th className="py-3 px-3">Commodity & Item</th>
                  <th className="py-3 px-3 text-right">Deposited (कितना जमा)</th>
                  <th className="py-3 px-3 text-right">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {incomingTxns.map(t => (
                  <tr key={t.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-3 px-3 font-semibold text-stone-800 whitespace-nowrap">
                      {formatDate(t.date)}
                    </td>
                    <td className="py-3 px-3 font-mono font-black text-emerald-800">
                      {t.customerId}
                    </td>
                    <td className="py-3 px-3 font-bold text-stone-900">
                      {isHi ? (t.customerNameHi || t.customerName) : t.customerName}
                    </td>
                    <td className="py-3 px-3 text-stone-600">
                      {t.customerVillage} {t.customerLocation ? `(${t.customerLocation})` : ''}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        t.category === 'mustard'
                          ? 'bg-yellow-100 text-yellow-900 border border-yellow-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {t.category === 'mustard' ? '🌻 सरसों (Mustard)' : '🌾 गेहूं (Wheat)'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-sm text-emerald-700">
                      +{t.quantityKg || t.depositKg} kg
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-stone-900 bg-stone-50">
                      {t.balanceAfterKg !== undefined ? `${t.balanceAfterKg} kg` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {incomingTxns.length === 0 && (
              <div className="text-center py-8 text-stone-400 text-xs">
                {isHi ? 'इस तारीख या फिल्टर में कोई आवक जमा रिकॉर्ड नहीं मिला।' : 'No incoming grain deposit records found for this date/search.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: OUTGOING (जाने का - FLOUR & OIL WITHDRAWALS) WITH DEDICATED SEARCH */}
      {activeViewMode === 'outgoing' && (
        <div className="bg-white rounded-3xl p-5 border border-amber-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-600" />
                <h3 className="font-black text-base text-stone-900">
                  {activeCommodity === 'wheat' 
                    ? (isHi ? 'जावक रजिस्टर: आटा निकासी व पिसाई किराया (जाने का)' : 'Outgoing Register: Flour Withdrawals & Grinding Rent (जाने का)')
                    : activeCommodity === 'mustard'
                    ? (isHi ? 'जावक रजिस्टर: सरसों तेल निकासी व पेराई किराया (जाने का)' : 'Outgoing Register: Mustard Oil Withdrawals & Rent (जाने का)')
                    : (isHi ? 'जावक रजिस्टर: आटा व तेल निकासी (जाने का)' : 'Outgoing Register: Flour & Oil Withdrawals (जाने का)')
                  }
                </h3>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {dateFilter 
                  ? `${isHi ? 'तारीख' : 'Date'}: ${formatDate(dateFilter)}` 
                  : (isHi ? 'सभी तारीखों की जावक निकासी व किराया' : 'All Date Outflows & Rent Paid')}
              </p>
            </div>

            {/* Dedicated Search for Outgoing */}
            <div className="relative w-full sm:w-72 shrink-0">
              <input
                type="text"
                placeholder={isHi ? "जाने वाले में खोजें (SN, नाम, गांव)..." : "Search outgoing (SN, Name, Village)..."}
                value={outgoingSearch}
                onChange={(e) => setOutgoingSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />
            </div>
          </div>

          {/* Outgoing Table with Grinding Rent column */}
          <div className="overflow-x-auto w-full max-w-full block">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-amber-200 bg-amber-50/50 text-amber-950 font-bold">
                  <th className="py-3 px-3">Date (तारीख)</th>
                  <th className="py-3 px-3">Account (SN)</th>
                  <th className="py-3 px-3">Farmer Name</th>
                  <th className="py-3 px-3">Village & Location</th>
                  <th className="py-3 px-3">Commodity / Item</th>
                  <th className="py-3 px-3 text-right">Withdrawn (कितना निकाला)</th>
                  <th className="py-3 px-3 text-right text-emerald-800">Rent Paid (इतनी पिसाई दी)</th>
                  <th className="py-3 px-3 text-right font-black">Remaining Balance (इतना बचा)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {outgoingTxns.map(t => (
                  <tr key={t.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-3 px-3 font-semibold text-stone-800 whitespace-nowrap">
                      {formatDate(t.date)}
                    </td>
                    <td className="py-3 px-3 font-mono font-black text-amber-800">
                      {t.customerId}
                    </td>
                    <td className="py-3 px-3 font-bold text-stone-900">
                      {isHi ? (t.customerNameHi || t.customerName) : t.customerName}
                    </td>
                    <td className="py-3 px-3 text-stone-600">
                      {t.customerVillage} {t.customerLocation ? `(${t.customerLocation})` : ''}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        t.category === 'mustard' || t.category === 'mustard_oil'
                          ? 'bg-yellow-100 text-yellow-900 border border-yellow-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {t.category === 'mustard' || t.category === 'mustard_oil' ? '🌻 सरसों तेल (Pure Oil)' : '🌾 आटा (Flour)'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-sm text-amber-900">
                      -{t.quantityKg || t.withdrawKg} {t.oilLitre ? 'L' : 'kg'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                      {t.grindingFeeAmount > 0 ? `₹${t.grindingFeeAmount}` : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-stone-900 bg-amber-50/50">
                      {t.balanceAfterKg !== undefined ? `${t.balanceAfterKg} kg` : (t.oilBalanceLitre !== undefined ? `${t.oilBalanceLitre} L` : '-')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {outgoingTxns.length === 0 && (
              <div className="text-center py-8 text-stone-400 text-xs">
                {isHi ? 'इस तारीख या फिल्टर में कोई जावक निकासी रिकॉर्ड नहीं मिला।' : 'No outgoing withdrawal records found for this date/search.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* REGISTRATION MODAL: MANDATORY Name, Village, Location; OPTIONAL Mobile */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-stone-900 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg">
                  {isHi ? 'नया किसान खाता जोड़ें (SN400 सीरीज़)' : 'Register New Farmer (SN400 Series)'}
                </h3>
                <p className="text-xs text-amber-300">
                  {isHi ? 'नाम, गांव और लोकेशन आवश्यक हैं • मोबाइल नंबर वैकल्पिक' : 'Name, Village & Location are required • Mobile is optional'}
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="p-5 space-y-3.5 text-xs">
              {/* 1. Full Name (MANDATORY) */}
              <div>
                <label className="font-bold text-stone-800 block mb-1">
                  {isHi ? 'किसान / ग्राहक का पूरा नाम * (आवश्यक)' : 'Farmer Full Name * (Required)'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isHi ? "उदा. राम कुमार वर्मा" : "e.g. Ram Kumar Verma"}
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm font-semibold"
                />
              </div>

              {/* 2. Village (MANDATORY) */}
              <div>
                <label className="font-bold text-stone-800 block mb-1">
                  {isHi ? 'गांव का नाम * (आवश्यक)' : 'Village Name * (Required)'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isHi ? "उदा. रामपुर कलां" : "e.g. Rampur Kalan"}
                  value={newCustomer.village}
                  onChange={(e) => setNewCustomer({ ...newCustomer, village: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm font-medium"
                />
              </div>

              {/* 3. Location / Address (MANDATORY) */}
              <div>
                <label className="font-bold text-stone-800 block mb-1">
                  {isHi ? 'लोकेशन / पता * (आवश्यक)' : 'Location / Address Landmark * (Required)'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isHi ? "उदा. प्राथमिक स्कूल के पास, मेन रोड" : "e.g. Near Primary School, Main Road"}
                  value={newCustomer.location}
                  onChange={(e) => setNewCustomer({ ...newCustomer, location: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm font-medium"
                />
              </div>

              {/* 4. Mobile Number (OPTIONAL) */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-stone-800">
                    {isHi ? 'मोबाइल नंबर (व्हाट्सएप)' : 'Mobile Number (WhatsApp)'}
                  </label>
                  <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                    {isHi ? 'वैकल्पिक (Optional)' : 'Optional'}
                  </span>
                </div>
                <input
                  type="tel"
                  placeholder={isHi ? "मोबाइल नंबर (भले ना डालें, खाली छोड़ सकते हैं)" : "Mobile number (Can be left blank)"}
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm font-mono"
                />
              </div>

              {/* 5. Father's Name (Optional) */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  {isHi ? "पिता का नाम (वैकल्पिक)" : "Father's Name (Optional)"}
                </label>
                <input
                  type="text"
                  placeholder={isHi ? "उदा. बद्री प्रसाद" : "e.g. Badri Prasad"}
                  value={newCustomer.fatherName}
                  onChange={(e) => setNewCustomer({ ...newCustomer, fatherName: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm"
                />
              </div>

              {/* 6. Remarks */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  {isHi ? "टिप्पणी / विवरण (वैकल्पिक)" : "Remarks (Optional)"}
                </label>
                <input
                  type="text"
                  placeholder={isHi ? "उदा. 4 बीघा खेती, नियमित ग्राहक" : "e.g. Regular farmer"}
                  value={newCustomer.notes}
                  onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm"
                />
              </div>

              {/* Master Security PIN (Mandatory 982026) */}
              <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-3 space-y-1.5 mt-2">
                <div className="flex items-center justify-between">
                  <label className="font-black text-amber-950 flex items-center gap-1.5 text-xs">
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    <span>{isHi ? 'मास्टर सुरक्षा पिन (आवश्यक) *' : 'Master Security PIN (Required) *'}</span>
                  </label>
                  <span className="text-[10px] font-mono font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                    PIN: 982026
                  </span>
                </div>
                <input
                  type="password"
                  required
                  placeholder="Enter PIN 982026"
                  value={regPin}
                  onChange={(e) => setRegPin(e.target.value)}
                  className="w-full p-2.5 bg-white border border-amber-400 rounded-xl text-center font-mono font-black tracking-widest text-base text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <p className="text-[11px] text-amber-800">
                  {isHi ? '🔒 बिना सही पिन (982026) के नया खाता नहीं बनेगा।' : '🔒 Correct PIN 982026 is strictly required to open account.'}
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-4 active:scale-98"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{isHi ? 'खाता खोलें (SN400 ID जनरेट करें)' : 'Create Account & Open Passbook'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CUSTOMER ACCOUNT CONFIRMATION MODAL (PIN PROTECTED 982026) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-red-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-red-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-200" />
                <h3 className="font-black text-base">
                  {isHi ? 'खाता डिलीट करें (Account Delete)' : 'Delete Customer Account'}
                </h3>
              </div>
              <button
                onClick={() => { setDeleteTarget(null); setDeletePin(''); }}
                className="p-1 hover:bg-white/20 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeleteCustomer} className="p-5 space-y-4 text-xs">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-xs text-red-700 bg-red-100 px-2 py-0.5 rounded">
                    {deleteTarget.id}
                  </span>
                  <span className="font-bold text-stone-600">{deleteTarget.village}</span>
                </div>
                <h4 className="font-extrabold text-base text-stone-900">
                  {isHi ? (deleteTarget.nameHi || deleteTarget.name) : deleteTarget.name}
                </h4>
                <p className="text-stone-500 text-[11px] leading-relaxed">
                  {isHi 
                    ? 'चेतावनी: यह खाता और इसके सभी लेन-देन (गेहूं, आटा, सरसों, तेल) स्थायी रूप से हटा दिए जाएंगे। इसे वापस नहीं लाया जा सकता।'
                    : 'Warning: This account and all its transaction history will be permanently deleted. This action cannot be undone.'}
                </p>
              </div>

              {/* Master Security PIN Input */}
              <div className="bg-stone-50 border-2 border-stone-200 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-black text-stone-900 flex items-center gap-1.5 text-xs">
                    <Lock className="w-4 h-4 text-red-600" />
                    <span>{isHi ? 'मास्टर सुरक्षा पिन दर्ज करें *' : 'Enter Master Security PIN *'}</span>
                  </label>
                  <span className="text-[10px] font-mono font-bold text-stone-500 bg-stone-200 px-1.5 py-0.5 rounded">
                    Required: 982026
                  </span>
                </div>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="Enter PIN 982026"
                  value={deletePin}
                  onChange={(e) => setDeletePin(e.target.value)}
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-center font-mono font-black tracking-widest text-lg text-stone-900 focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
                <p className="text-[11px] text-stone-500 text-center">
                  {isHi ? '🔒 बिना सही पिन (982026) के खाता डिलीट नहीं होगा।' : '🔒 Account cannot be deleted without PIN 982026.'}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setDeleteTarget(null); setDeletePin(''); }}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition-all"
                >
                  {isHi ? 'रद्द करें (Cancel)' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isDeleting}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? (isHi ? 'हटा रहे हैं...' : 'Deleting...') : (isHi ? 'स्थायी डिलीट करें' : 'Confirm Delete')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
