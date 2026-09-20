import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowDownRight, 
  ArrowUpRight, 
  Search, 
  Check, 
  AlertCircle, 
  Wheat, 
  Droplets, 
  UserPlus, 
  Users, 
  IndianRupee,
  Sparkles,
  Lock,
  KeyRound
} from 'lucide-react';
import { translations } from '../utils/i18n';

export default function QuickActionModal({ 
  isOpen, 
  onClose, 
  customers, 
  preSelectedCustomer, 
  rates,
  onTransactionComplete,
  lang = 'en'
}) {
  if (!isOpen) return null;

  const t = translations[lang] || translations.en;
  const isHi = lang === 'hi';

  // Master Security PIN Protection (982026 required for any save or new account)
  const [securityPin, setSecurityPin] = useState('');

  // Customer Mode: Existing vs New Customer (पहली बार आया है)
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    village: '',
    location: '',
    phone: '',
    fatherName: ''
  });

  const [selectedCustomerId, setSelectedCustomerId] = useState(preSelectedCustomer?.id || (customers[0]?.id || ''));
  const [searchTerm, setSearchTerm] = useState('');
  
  // Category: 'wheat' or 'mustard'
  const [category, setCategory] = useState('wheat');
  
  // Transaction Mode: 'deposit', 'withdraw', or 'deposit_and_withdraw' (जमा + तुरंत निकाला)
  const [opMode, setOpMode] = useState('withdraw'); 

  // Weights
  const [quantity, setQuantity] = useState(20); // Used for single deposit or single withdraw
  const [depositQty, setDepositQty] = useState(100); // For combined deposit + withdraw
  const [withdrawQty, setWithdrawQty] = useState(20); // For combined deposit + withdraw
  
  // Grinding Rent Paid (इतनी पिसाई दी)
  const [feeAmount, setFeeAmount] = useState(20);
  const [feeMode, setFeeMode] = useState('cash'); // 'cash' or 'flour_deduction'

  const [oilLitre, setOilLitre] = useState(0);
  const [khaliKg, setKhaliKg] = useState(0);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync with preselected customer if passed
  useEffect(() => {
    if (preSelectedCustomer?.id) {
      setSelectedCustomerId(preSelectedCustomer.id);
      setIsNewCustomer(false);
    }
  }, [preSelectedCustomer]);

  // Auto calculate suggested grinding fee when withdrawal weight changes
  useEffect(() => {
    const activeWithdrawWeight = opMode === 'deposit_and_withdraw' ? Number(withdrawQty || 0) : Number(quantity || 0);
    if (category === 'wheat' && (opMode === 'withdraw' || opMode === 'deposit_and_withdraw')) {
      const rate = rates?.grindingPerKg || 1; // Default ₹1 per kg or rate from mandi
      setFeeAmount(activeWithdrawWeight * rate);
    } else if (category === 'mustard' && (opMode === 'withdraw' || opMode === 'deposit_and_withdraw')) {
      const rate = rates?.oilExpellerPerKg || 4;
      setFeeAmount(activeWithdrawWeight * rate);
    }
  }, [quantity, withdrawQty, category, opMode, rates]);

  const activeCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  const currentWheatBalance = activeCustomer?.balances?.wheatCurrentBalanceKg || 0;
  const currentMustardBalance = activeCustomer?.balances?.mustardCurrentBalanceKg || 0;

  // Calculate live projected balance preview
  let startingBalance = 0;
  if (!isNewCustomer) {
    startingBalance = category === 'wheat' ? currentWheatBalance : currentMustardBalance;
  }

  let finalProjectedBalance = 0;
  if (opMode === 'deposit') {
    finalProjectedBalance = startingBalance + Number(quantity || 0);
  } else if (opMode === 'withdraw') {
    finalProjectedBalance = startingBalance - Number(quantity || 0);
  } else if (opMode === 'deposit_and_withdraw') {
    finalProjectedBalance = startingBalance + Number(depositQty || 0) - Number(withdrawQty || 0);
  }

  const filteredCustomers = customers.filter(c => 
    c.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nameHi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm) ||
    c.village?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.villageHi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Strict Master PIN Verification
    if (securityPin.trim() !== '982026') {
      setErrorMsg(isHi ? 'अमान्य सुरक्षा पिन! बिना सही पिन (982026) के न नया खाता बनेगा और न एंट्री सेव होगी।' : 'Invalid PIN! Correct PIN 982026 is strictly required.');
      return;
    }

    let targetCustomerId = selectedCustomerId;

    // 1. If registering a NEW customer who came for the first time:
    if (isNewCustomer) {
      if (!newCustomerData.name || !newCustomerData.village || !newCustomerData.location) {
        setErrorMsg(isHi ? 'कृपया नए ग्राहक का नाम, गांव और लोकेशन/पता अवश्य भरें!' : 'Name, Village, and Location are mandatory for new customer!');
        return;
      }

      setIsSubmitting(true);
      try {
        const custRes = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newCustomerData, pin: securityPin.trim() })
        });
        if (!custRes.ok) {
          const err = await custRes.json();
          throw new Error(err.error || 'Failed to register customer');
        }
        const createdCustomer = await custRes.json();
        targetCustomerId = createdCustomer.id;
      } catch (err) {
        setIsSubmitting(false);
        setErrorMsg(err.message);
        return;
      }
    }

    if (!targetCustomerId) {
      setErrorMsg(isHi ? 'कृपया ग्राहक/खाता चुनें' : 'Please select or create an account');
      return;
    }

    setIsSubmitting(true);
    const today = new Date().toISOString().split('T')[0];

    try {
      if (opMode === 'deposit_and_withdraw') {
        // Step A: Record Deposit
        const depRes = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId: targetCustomerId,
            type: 'deposit',
            category: category,
            quantityKg: Number(depositQty),
            grindingFeeMode: 'none',
            grindingFeeAmount: 0,
            note: note || (isHi ? `${depositQty} kg जमा किया` : `${depositQty} kg deposited`),
            date: today,
            operator: 'Munim Ji',
            pin: securityPin.trim()
          })
        });

        if (!depRes.ok) throw new Error('Failed to record deposit');

        // Step B: Record Withdrawal with Grinding Fee Paid
        const withRes = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId: targetCustomerId,
            type: 'withdraw',
            category: category,
            quantityKg: Number(withdrawQty),
            grindingFeeMode: feeMode,
            grindingFeeAmount: Number(feeAmount || 0),
            note: note || (isHi ? `${withdrawQty} kg आटा तुरंत निकाला, ₹${feeAmount} पिसाई दी` : `${withdrawQty} kg flour withdrawn, Rs. ${feeAmount} rent paid`),
            date: today,
            operator: 'Munim Ji',
            pin: securityPin.trim()
          })
        });

        if (!withRes.ok) throw new Error('Failed to record withdrawal');
        const withData = await withRes.json();
        onTransactionComplete(withData.transaction, withData.customer);
        onClose();

      } else {
        // Single Deposit or Single Withdrawal
        const numQty = Number(quantity || 0);
        if (numQty <= 0) {
          throw new Error(isHi ? 'कृपया मान्य वजन दर्ज करें' : 'Please enter valid quantity');
        }

        const res = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId: targetCustomerId,
            type: opMode,
            category: category,
            quantityKg: numQty,
            oilLitre: category === 'mustard' && opMode === 'withdraw' ? numQty : 0,
            khaliKg: 0,
            grindingFeeMode: feeMode,
            grindingFeeAmount: opMode === 'withdraw' ? Number(feeAmount || 0) : 0,
            note: note || (category === 'wheat'
              ? (opMode === 'deposit' ? `${numQty} kg गेहूं जमा किया` : `${numQty} kg आटा निकाला, ₹${feeAmount} पिसाई दी`)
              : (opMode === 'deposit' ? `${numQty} kg सरसों जमा की` : `${numQty} L शुद्ध तेल निकाला, ₹${feeAmount} पेराई दी`)),
            date: today,
            operator: 'Munim Ji',
            pin: securityPin.trim()
          })
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to save transaction');
        }

        const data = await res.json();
        onTransactionComplete(data.transaction, data.customer);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-stone-900 text-white p-4 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-black flex items-center gap-2">
              <span>⚡ {isHi ? 'मिल त्वरित एंट्री (जमा / निकासी / पिसाई किराया)' : 'Mill Entry (Deposit / Withdrawal / Grinding Rent)'}</span>
            </h3>
            <p className="text-xs text-amber-300 font-medium">
              {isHi 
                ? 'नया ग्राहक हो या पुराना • कितना जमा, कितना निकाला, कितनी पिसाई दी सब दर्ज करें' 
                : 'New or Existing Customer • Record Deposited, Withdrawn & Rent Paid in 1 step'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm flex-1">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. COMMODITY SWITCHER: Wheat vs Mustard */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setCategory('wheat')}
              className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-xs ${
                category === 'wheat' 
                  ? 'bg-amber-700 text-white shadow-md' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Wheat className="w-4 h-4 text-amber-300" />
              <span>{isHi ? '🌾 गेहूं व आटा चक्की' : '🌾 Wheat & Flour'}</span>
            </button>
            <button
              type="button"
              onClick={() => setCategory('mustard')}
              className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-xs ${
                category === 'mustard' 
                  ? 'bg-yellow-500 text-stone-950 shadow-md font-black' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Droplets className="w-4 h-4 text-yellow-600" />
              <span>{isHi ? '🌻 सरसों व तेल मिल' : '🌻 Mustard & Oil'}</span>
            </button>
          </div>

          {/* 2. CUSTOMER TYPE TOGGLE: Existing Customer vs New Customer (पहली बार आया है) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-stone-800 text-xs">
                {isHi ? 'ग्राहक चयन (Customer Selection):' : 'Customer Selection:'}
              </label>
              
              <div className="inline-flex rounded-xl bg-stone-100 p-0.5 border border-stone-200 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setIsNewCustomer(false)}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    !isNewCustomer ? 'bg-stone-900 text-amber-300 shadow-sm' : 'text-stone-600'
                  }`}
                >
                  <Users className="w-3 h-3" />
                  <span>{isHi ? 'पुराना खाता' : 'Existing Account'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewCustomer(true)}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    isNewCustomer ? 'bg-emerald-700 text-white shadow-sm' : 'text-stone-600'
                  }`}
                >
                  <UserPlus className="w-3 h-3" />
                  <span>{isHi ? '👤 पहली बार आया है (नया खाता)' : '+ First Time (New)'}</span>
                </button>
              </div>
            </div>

            {/* A. If NEW CUSTOMER: Provide direct input fields for Name, Village, Location, Mobile */}
            {isNewCustomer ? (
              <div className="bg-emerald-50/70 border-2 border-emerald-300 p-3.5 rounded-2xl space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between pb-1 border-b border-emerald-200">
                  <span className="font-bold text-emerald-950 text-xs flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    {isHi ? 'नए किसान का विवरण भरें (ऑटो SN400 आईडी बनेगी):' : 'New Farmer Details (Auto SN400 ID):'}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    SN{400 + customers.length} Auto
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-stone-800 block mb-0.5">
                      {isHi ? 'पूरा नाम * (आवश्यक)' : 'Full Name * (Required)'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isHi ? "उदा. रमेश शर्मा" : "e.g. Ramesh Sharma"}
                      value={newCustomerData.name}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, name: e.target.value })}
                      className="w-full p-2 bg-white border border-stone-300 rounded-xl font-bold text-stone-900 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-800 block mb-0.5">
                      {isHi ? 'गांव का नाम * (आवश्यक)' : 'Village * (Required)'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isHi ? "उदा. रायपुर" : "e.g. Raipur"}
                      value={newCustomerData.village}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, village: e.target.value })}
                      className="w-full p-2 bg-white border border-stone-300 rounded-xl font-medium text-stone-900 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-stone-800 block mb-0.5">
                      {isHi ? 'लोकेशन / पता * (आवश्यक)' : 'Location Landmark * (Required)'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isHi ? "उदा. मंदिर के पास, मेन रोड" : "e.g. Near Temple"}
                      value={newCustomerData.location}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, location: e.target.value })}
                      className="w-full p-2 bg-white border border-stone-300 rounded-xl font-medium text-stone-900 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-0.5">
                      <label className="text-[11px] font-bold text-stone-800">
                        {isHi ? 'मोबाइल नंबर (फोन)' : 'Phone Number'}
                      </label>
                      <span className="text-[9px] text-stone-400 font-bold bg-stone-100 px-1 rounded">
                        {isHi ? 'वैकल्पिक' : 'Optional'}
                      </span>
                    </div>
                    <input
                      type="tel"
                      placeholder={isHi ? "मोबाइल (खाली छोड़ सकते हैं)" : "Optional phone number"}
                      value={newCustomerData.phone}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
                      className="w-full p-2 bg-white border border-stone-300 rounded-xl font-mono text-stone-900 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* B. If EXISTING CUSTOMER: Search & Select Dropdown */
              <div className="space-y-1.5">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={isHi ? "SN ID, नाम या गांव से खोजें..." : "Search by SN ID, Name or Village..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                </div>

                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-bold text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs"
                >
                  {filteredCustomers.map(c => {
                    const bal = category === 'wheat' 
                      ? (c.balances?.wheatCurrentBalanceKg || 0)
                      : (c.balances?.mustardCurrentBalanceKg || 0);
                    return (
                      <option key={c.id} value={c.id}>
                        {c.id} - {isHi ? (c.nameHi || c.name) : c.name} ({c.village}) • Balance: {bal} kg
                      </option>
                    );
                  })}
                </select>

                {activeCustomer && (
                  <div className="flex justify-between items-center px-3 py-1.5 bg-stone-100 rounded-xl text-xs">
                    <span className="text-stone-600">
                      {isHi ? 'वर्तमान शेष बैलेंस:' : 'Current Balance:'} <b>{activeCustomer.name}</b>
                    </span>
                    <span className="font-mono font-black text-amber-900">
                      {category === 'wheat' ? `${currentWheatBalance} kg (गेहूं)` : `${currentMustardBalance} kg (सरसों)`}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. TRANSACTION ACTION MODE: 
               1) Deposit Only 
               2) Withdraw Only 
               3) Deposit & Instant Withdraw (जमा किया + तुरंत निकाला) 
          */}
          <div className="space-y-1">
            <label className="font-bold text-stone-800 text-xs block">
              {isHi ? 'लेनदेन का प्रकार चुनें:' : 'Transaction Type:'}
            </label>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setOpMode('withdraw')}
                className={`py-2 px-2 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-0.5 border transition-all ${
                  opMode === 'withdraw'
                    ? 'bg-amber-700 text-white border-amber-800 shadow-md ring-2 ring-amber-300'
                    : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{isHi ? '- सिर्फ निकाला' : '- Withdraw'}</span>
              </button>

              <button
                type="button"
                onClick={() => setOpMode('deposit')}
                className={`py-2 px-2 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-0.5 border transition-all ${
                  opMode === 'deposit'
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-md ring-2 ring-emerald-300'
                    : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>{isHi ? '+ सिर्फ जमा किया' : '+ Deposit'}</span>
              </button>

              <button
                type="button"
                onClick={() => setOpMode('deposit_and_withdraw')}
                className={`py-2 px-2 rounded-xl font-black text-xs flex flex-col items-center justify-center gap-0.5 border transition-all ${
                  opMode === 'deposit_and_withdraw'
                    ? 'bg-indigo-700 text-white border-indigo-800 shadow-md ring-2 ring-indigo-300'
                    : 'bg-indigo-50 text-indigo-900 border-indigo-200 hover:bg-indigo-100'
                }`}
              >
                <span>⚡ {isHi ? 'जमा + निकाला' : 'Deposit + Take'}</span>
                <span className="text-[10px] font-normal opacity-90">{isHi ? '(रियल चक्की)' : '(Combined)'}</span>
              </button>
            </div>
          </div>

          {/* 4. INPUT FIELDS BASED ON OPERATION MODE */}

          {/* SCENARIO A: DEPOSIT ONLY */}
          {opMode === 'deposit' && (
            <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-200 space-y-2">
              <label className="font-bold text-emerald-950 text-xs block">
                {isHi ? 'कितना गेहूं / सरसों जमा किया (वजन - kg):' : 'Deposit Quantity (kg):'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full p-2.5 bg-white border-2 border-emerald-500 rounded-xl text-lg font-mono font-black text-emerald-950 focus:outline-none"
                  placeholder="उदा. 100"
                />
                <span className="absolute right-3 top-3 text-xs font-bold text-emerald-800">KG</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[50, 100, 200, 500, 1000].map(w => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setQuantity(w)}
                    className="px-2 py-0.5 rounded-lg bg-white border border-emerald-300 text-xs font-bold text-emerald-900 hover:bg-emerald-100"
                  >
                    {w} kg {w >= 100 ? `(${w/100}Q)` : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SCENARIO B: WITHDRAW ONLY */}
          {opMode === 'withdraw' && (
            <div className="space-y-3">
              {/* Withdrawn Weight */}
              <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200 space-y-2">
                <label className="font-bold text-amber-950 text-xs block">
                  {category === 'wheat' 
                    ? (isHi ? 'कितना आटा निकाला (निकासी वजन - kg):' : 'Flour Withdrawn Quantity (kg):')
                    : (isHi ? 'कितना शुद्ध तेल निकाला (निकासी - Litre):' : 'Pure Oil Withdrawn (Litre):')
                  }
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full p-2.5 bg-white border-2 border-amber-500 rounded-xl text-lg font-mono font-black text-amber-950 focus:outline-none"
                    placeholder={category === 'wheat' ? "उदा. 20" : "उदा. 10"}
                  />
                  <span className="absolute right-3 top-3 text-xs font-bold text-amber-800">
                    {category === 'wheat' ? 'KG' : 'Litre'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[10, 20, 25, 30, 40, 50].map(w => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setQuantity(w)}
                      className="px-2 py-0.5 rounded-lg bg-white border border-amber-300 text-xs font-bold text-amber-900 hover:bg-amber-100"
                    >
                      {w} kg
                    </button>
                  ))}
                </div>
              </div>

              {/* GRINDING RENT PAID (इतनी पिसाई दी) */}
              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-300 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-black text-xs text-stone-900 flex items-center gap-1.5">
                    <IndianRupee className="w-4 h-4 text-emerald-600" />
                    <span>{isHi ? 'इतनी पिसाई दी (पिसाई किराया नकद - ₹):' : 'Grinding Rent Paid (इतनी पिसाई दी - ₹):'}</span>
                  </label>
                  <span className="text-[10px] text-stone-500">
                    {category === 'wheat' ? '@ ₹1/kg rate' : '@ ₹4/kg rate'}
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    value={feeAmount}
                    onChange={(e) => setFeeAmount(e.target.value)}
                    placeholder="उदा. 20"
                    className="w-full pl-8 pr-4 py-2 bg-white border-2 border-emerald-500 rounded-xl text-lg font-black font-mono text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <span className="absolute left-3 top-2.5 font-bold text-emerald-700">₹</span>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[0, 10, 20, 30, 40, 50, 60, 100].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setFeeAmount(amt)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        Number(feeAmount) === amt 
                          ? 'bg-emerald-700 text-white shadow-sm' 
                          : 'bg-stone-200/80 hover:bg-stone-300 text-stone-800'
                      }`}
                    >
                      {amt === 0 ? (isHi ? '₹0 (छूट/उधारी)' : '₹0 Free') : `₹${amt}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SCENARIO C: COMBINED DEPOSIT + INSTANT WITHDRAWAL (उदा. 100 kg जमा, 20 kg निकाला, ₹20 पिसाई) */}
          {opMode === 'deposit_and_withdraw' && (
            <div className="bg-indigo-50/50 p-4 rounded-2xl border-2 border-indigo-200 space-y-3">
              <div className="flex items-center gap-1.5 pb-2 border-b border-indigo-200 text-indigo-950 font-bold text-xs">
                <span>⚡ रियल चक्की मोड: 100 kg जमा किया, 20 kg निकाला, ₹20 पिसाई दी</span>
              </div>

              {/* Step 1: Deposit Weight */}
              <div>
                <label className="font-bold text-stone-800 text-xs block mb-1">
                  {isHi ? '1. कितना जमा किया (Deposit - kg):' : '1. Quantity Deposited (kg):'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={depositQty}
                    onChange={(e) => setDepositQty(e.target.value)}
                    placeholder="उदा. 100"
                    className="w-full p-2 bg-white border-2 border-indigo-400 rounded-xl text-base font-mono font-black text-indigo-950"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-indigo-800">KG</span>
                </div>
                <div className="flex gap-1.5 pt-1">
                  {[50, 100, 200, 500].map(w => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setDepositQty(w)}
                      className="px-2 py-0.5 rounded bg-white border border-indigo-200 text-[11px] font-bold text-indigo-900"
                    >
                      {w} kg {w === 100 ? '(1 क्विंटल)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Instant Withdrawal */}
              <div>
                <label className="font-bold text-stone-800 text-xs block mb-1">
                  {isHi ? '2. तुरंत कितना निकाला (Withdrawn - kg):' : '2. Instant Flour Taken (kg):'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={withdrawQty}
                    onChange={(e) => setWithdrawQty(e.target.value)}
                    placeholder="उदा. 20"
                    className="w-full p-2 bg-white border-2 border-amber-400 rounded-xl text-base font-mono font-black text-amber-950"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-amber-800">KG</span>
                </div>
                <div className="flex gap-1.5 pt-1">
                  {[10, 20, 25, 30, 40].map(w => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWithdrawQty(w)}
                      className="px-2 py-0.5 rounded bg-white border border-amber-200 text-[11px] font-bold text-amber-900"
                    >
                      {w} kg
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Grinding Fee Paid (इतनी पिसाई दी) */}
              <div>
                <label className="font-bold text-stone-800 text-xs block mb-1 flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isHi ? '3. इतनी पिसाई दी (पिसाई किराया नकद - ₹):' : '3. Grinding Rent Paid (₹):'}</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={feeAmount}
                    onChange={(e) => setFeeAmount(e.target.value)}
                    placeholder="उदा. 20"
                    className="w-full pl-8 pr-3 py-2 bg-white border-2 border-emerald-500 rounded-xl text-base font-mono font-black text-emerald-800"
                  />
                  <span className="absolute left-3 top-2.5 font-bold text-emerald-700">₹</span>
                </div>
                <div className="flex gap-1.5 pt-1">
                  {[0, 10, 20, 30, 40, 50].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setFeeAmount(amt)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        Number(feeAmount) === amt ? 'bg-emerald-700 text-white' : 'bg-white border border-emerald-300 text-emerald-900'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. LIVE REMAINING BALANCE PREVIEW (इतना बचा) */}
          <div className="p-3.5 bg-amber-500/15 border-2 border-amber-300 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <span className="font-black text-amber-950 block text-xs">
                {isHi ? 'खाते में इतना बचा (Remaining Balance):' : 'Balance Remaining (इतना बचा):'}
              </span>
              <span className="text-[11px] text-stone-600 font-medium">
                {opMode === 'deposit_and_withdraw'
                  ? `${depositQty || 0} kg जमा - ${withdrawQty || 0} kg निकाला = ${Number(depositQty || 0) - Number(withdrawQty || 0)} kg`
                  : `${startingBalance} kg पहले + इस एंट्री का प्रभाव`
                }
              </span>
            </div>

            <div className="text-right">
              <span className="font-mono font-black text-xl sm:text-2xl text-stone-950 block">
                {finalProjectedBalance.toLocaleString()} kg
              </span>
              <span className="text-[10px] text-stone-600 font-bold block">
                = {(finalProjectedBalance / 100).toFixed(2)} Quintal
              </span>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <input
              type="text"
              placeholder={isHi ? "टिप्पणी / रिमार्क (वैकल्पिक)..." : "Note / Remark (optional)..."}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs"
            />
          </div>

          {/* Master Security PIN Input Box (982026) */}
          <div className="bg-stone-900 text-white p-3.5 rounded-2xl border-2 border-amber-500 space-y-2 shadow-inner">
            <div className="flex justify-between items-center">
              <label className="font-black text-xs text-amber-300 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>{isHi ? 'मालिक सुरक्षा पिन दर्ज करें *:' : 'Enter Master Security PIN *:'}</span>
              </label>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full font-bold">
                PIN: 982026
              </span>
            </div>

            <div className="relative">
              <input
                type="password"
                maxLength={6}
                required
                value={securityPin}
                onChange={(e) => setSecurityPin(e.target.value)}
                placeholder="पिन दर्ज करें (उदा. 982026)"
                className="w-full text-center tracking-[0.3em] font-mono font-black text-lg py-2 px-3 bg-stone-800 border border-stone-600 rounded-xl text-amber-400 placeholder:text-stone-600 placeholder:tracking-normal placeholder:font-normal focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
              <KeyRound className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
            </div>

            <p className="text-[10px] text-stone-400 text-center">
              {isHi 
                ? '🔒 बिना पिन 982026 के न नया खाता बनेगा और न निकासी/जमा सुरक्षित होगी' 
                : '🔒 PIN 982026 is strictly required to save or create any account'}
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black rounded-2xl text-sm shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>
              {isSubmitting 
                ? (isHi ? 'दर्ज किया जा रहा है...' : 'Saving Entry...') 
                : (isHi ? '✓ एंट्री सुरक्षित करें व पर्ची निकालें' : 'Save Entry & Generate Receipt')
              }
            </span>
          </button>
        </form>

      </div>
    </div>
  );
}
