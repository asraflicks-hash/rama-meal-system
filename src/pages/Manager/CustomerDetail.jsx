import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Phone, 
  MapPin, 
  Wheat, 
  Droplets, 
  ArrowDownRight, 
  ArrowUpRight, 
  Printer, 
  Calendar, 
  FileText,
  IndianRupee,
  CheckCircle2,
  Trash2,
  Lock,
  AlertTriangle,
  X
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/format';
import { translations } from '../../utils/i18n';

export default function CustomerDetail({ 
  customer, 
  onBack, 
  onOpenQuickActionForCustomer,
  onShowReceipt,
  onRefresh,
  lang = 'en',
  activeCommodity = 'wheat'
}) {
  const t = translations[lang] || translations.en;
  const isHi = lang === 'hi';

  const [activeTab, setActiveTab] = useState(
    activeCommodity === 'mustard' ? 'mustard' : (activeCommodity === 'all' ? 'all' : 'wheat')
  );

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePin, setDeletePin] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!customer) return null;

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (deletePin.trim() !== '982026') {
      alert(isHi ? 'अमान्य सुरक्षा पिन! खाता डिलीट करने के लिए सही पिन (982026) दर्ज करना अनिवार्य है।' : 'Invalid PIN! Correct PIN 982026 is required to delete account.');
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: deletePin.trim() })
      });
      if (res.ok) {
        setShowDeleteModal(false);
        setDeletePin('');
        if (onRefresh) await onRefresh();
        alert(isHi ? 'खाता सफलतापूर्वक डिलीट किया गया।' : 'Account successfully deleted.');
        onBack();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete account');
      }
    } catch (err) {
      alert('Error deleting account: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const displayName = isHi ? (customer.nameHi || customer.name) : customer.name;
  const displayFather = isHi ? (customer.fatherNameHi || customer.fatherName) : customer.fatherName;
  const displayVillage = isHi ? (customer.villageHi || customer.village) : customer.village;
  const displayLocation = isHi ? (customer.locationHi || customer.location) : customer.location;

  const wheatBalance = customer.balances?.wheatCurrentBalanceKg || 0;
  const wheatDeposited = customer.balances?.wheatDepositTotalKg || 0;
  const attaWithdrawn = customer.balances?.attaWithdrawnTotalKg || 0;

  const mustardBalance = customer.balances?.mustardCurrentBalanceKg || 0;
  const oilAvailable = customer.balances?.oilAvailableLitre || 0;

  const transactions = (customer.transactions || []).filter(t => {
    if (activeTab === 'wheat') return t.category === 'wheat';
    if (activeTab === 'mustard') return t.category === 'mustard' || t.category === 'mustard_oil';
    return true;
  });

  // Calculate total grinding rent paid by this customer
  const totalGrindingPaid = transactions.reduce((sum, t) => sum + (Number(t.grindingFeeAmount) || 0), 0);

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      {/* Top Back & Account ID Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 w-full max-w-full">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-300 hover:bg-stone-100 rounded-xl text-xs font-bold text-stone-700 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isHi ? '← वापस सूची' : '← Back to Accounts'}</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Delete Account Button */}
          <button
            type="button"
            onClick={() => {
              setDeletePin('');
              setShowDeleteModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            title={isHi ? "खाता डिलीट करें (पिन 982026 आवश्यक)" : "Delete Account (PIN 982026 required)"}
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
            <span>{isHi ? 'खाता डिलीट करें' : 'Delete Account'}</span>
          </button>

          <span className="text-xs sm:text-sm font-mono font-black bg-amber-100 text-amber-950 px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-amber-300">
            ID: {customer.id}
          </span>
        </div>
      </div>

      {/* Customer Master Header */}
      <div className="bg-stone-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-stone-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-500 text-stone-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                {isHi ? 'किसान पासबुक' : 'Farmer Passbook'}
              </span>
              <span className="text-xs text-stone-400">
                {isHi ? 'खाता संख्या:' : 'Account ID:'} <b className="font-mono text-amber-400">{customer.id}</b>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {displayName}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-300 mt-2">
              {displayFather && (
                <span>{isHi ? 'पिता:' : 'S/o:'} <b>{displayFather}</b></span>
              )}
              {displayVillage && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <b>{displayVillage}</b> {displayLocation ? `(${displayLocation})` : ''}
                </span>
              )}
              {customer.phone ? (
                <a 
                  href={`tel:${customer.phone}`}
                  className="flex items-center gap-1 text-amber-300 hover:underline font-mono"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {customer.phone}
                </a>
              ) : (
                <span className="text-stone-500 italic text-[11px]">(मोबाइल दर्ज नहीं / Optional)</span>
              )}
            </div>
          </div>

          {/* Quick Action Buttons on Header */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onOpenQuickActionForCustomer(customer, 'wheat', 'withdraw')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-all active:scale-95"
            >
              <ArrowUpRight className="w-4 h-4 stroke-[3]" />
              <span>{isHi ? '- आटा निकासी' : '- Withdraw Flour'}</span>
            </button>
            <button
              onClick={() => onOpenQuickActionForCustomer(customer, 'wheat', 'deposit')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-all active:scale-95"
            >
              <ArrowDownRight className="w-4 h-4 stroke-[3]" />
              <span>{isHi ? '+ गेहूं जमा' : '+ Deposit Wheat'}</span>
            </button>
          </div>
        </div>

        {/* Live Balance Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-6 pt-6 border-t border-stone-800">
          
          {/* Wheat Account Card */}
          <div className="bg-stone-800/80 rounded-2xl p-4 sm:p-5 border border-amber-500/30 relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
                  <Wheat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">
                    {isHi ? 'गेहूं व आटा खाता' : 'Wheat & Flour Account'}
                  </h3>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {isHi ? 'लाइव बैलेंस' : 'Live Balance'}
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-4">
              <div>
                <span className="text-xs text-stone-300 block">
                  {isHi ? 'वर्तमान शेष गेहूं (इतना बचा):' : 'Current Balance Remaining (इतना बचा):'}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-amber-300 font-mono">
                    {wheatBalance.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-stone-300">kg</span>
                </div>
                <span className="text-xs text-amber-400/80 font-medium">
                  = {(wheatBalance / 100).toFixed(2)} Quintal
                </span>
              </div>

              <div className="text-right text-xs space-y-1">
                <div className="text-stone-300">
                  {isHi ? 'कुल जमा:' : 'Total Deposited:'} <b className="text-white font-mono">{wheatDeposited} kg</b>
                </div>
                <div className="text-stone-300">
                  {isHi ? 'कुल निकाला:' : 'Total Flour Taken:'} <b className="text-amber-200 font-mono">{attaWithdrawn} kg</b>
                </div>
                <div className="text-emerald-400 font-bold">
                  {isHi ? 'कुल पिसाई दी:' : 'Total Grinding Paid:'} ₹{totalGrindingPaid}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-700 flex gap-2">
              <button
                onClick={() => onOpenQuickActionForCustomer(customer, 'wheat', 'withdraw')}
                className="flex-1 py-2 px-2.5 rounded-xl bg-amber-500 text-stone-950 font-black text-xs hover:bg-amber-400 transition-colors flex items-center justify-center gap-1 active:scale-95"
              >
                <span>{isHi ? 'निकासी करें (उदा. 20kg)' : 'Withdraw (e.g. 20kg)'}</span>
              </button>
              <button
                onClick={() => onOpenQuickActionForCustomer(customer, 'wheat', 'deposit')}
                className="flex-1 py-2 px-2.5 rounded-xl bg-stone-900 text-amber-200 border border-stone-700 font-bold text-xs hover:bg-stone-800 transition-colors flex items-center justify-center gap-1 active:scale-95"
              >
                <span>{isHi ? '+ नया गेहूं जमा' : '+ Deposit Wheat'}</span>
              </button>
            </div>
          </div>

          {/* Mustard Account Card */}
          <div className="bg-stone-800/80 rounded-2xl p-4 sm:p-5 border border-yellow-500/30 relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-yellow-400 text-stone-950 flex items-center justify-center font-bold">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">
                    {isHi ? 'सरसों व तेल खाता' : 'Mustard & Oil Account'}
                  </h3>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                {isHi ? 'तेल पेराई' : 'Oil Expeller'}
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-4">
              <div>
                <span className="text-xs text-stone-300 block">
                  {isHi ? 'उपलब्ध शुद्ध तेल (Pure Oil):' : 'Available Pure Cold-Pressed Oil:'}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-yellow-300 font-mono">
                    {oilAvailable.toFixed(1)}
                  </span>
                  <span className="text-sm font-bold text-stone-300">Litre</span>
                </div>
                <span className="text-xs text-yellow-400/80 font-medium">
                  {isHi ? '100% शुद्ध कच्ची घानी' : '100% Cold-Pressed'}
                </span>
              </div>

              <div className="text-right text-xs space-y-1">
                <div className="text-stone-300">
                  {isHi ? 'कुल सरसों जमा:' : 'Total Mustard In:'} <b className="text-white font-mono">{customer.balances?.mustardDepositTotalKg || 0} kg</b>
                </div>
                <div className="text-stone-300">
                  {isHi ? 'बची सरसों:' : 'Remaining Mustard:'} <b className="text-yellow-200 font-mono">{mustardBalance} kg</b>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-700 flex gap-2">
              <button
                onClick={() => onOpenQuickActionForCustomer(customer, 'mustard', 'withdraw')}
                className="flex-1 py-2 px-2.5 rounded-xl bg-yellow-400 text-stone-950 font-black text-xs hover:bg-yellow-300 transition-colors flex items-center justify-center gap-1 active:scale-95"
              >
                <span>{isHi ? '- तेल निकासी' : '- Withdraw Pure Oil'}</span>
              </button>
              <button
                onClick={() => onOpenQuickActionForCustomer(customer, 'mustard', 'deposit')}
                className="flex-1 py-2 px-2.5 rounded-xl bg-stone-900 text-yellow-200 border border-stone-700 font-bold text-xs hover:bg-stone-800 transition-colors flex items-center justify-center gap-1 active:scale-95"
              >
                <span>{isHi ? '+ सरसों जमा' : '+ Deposit Mustard'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* DETAILED STATEMENT TABLE WITH THE EXACT REQUESTED COLUMNS */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-700" />
              <span>
                {isHi ? 'खाता पासबुक लेजर (तारीखवार जमा-निकासी-पिसाई-शेष)' : 'Passbook Ledger (Date-wise Deposit, Withdrawal, Grinding Fee & Balance)'}
              </span>
            </h3>
            <p className="text-xs text-stone-500">
              {isHi 
                ? 'किस तारीख को कितना जमा किया, कितना निकाला, कितनी पिसाई दी और कितना बचा' 
                : 'Exact log of: Date, Deposit Quantity, Withdrawal Quantity, Grinding Fee Paid, and Balance Remaining'}
            </p>
          </div>

          <div className="flex gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab('wheat')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                activeTab === 'wheat'
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              🌾 {isHi ? 'गेहूं व आटा' : 'Wheat & Flour'}
            </button>
            <button
              onClick={() => setActiveTab('mustard')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                activeTab === 'mustard'
                  ? 'bg-yellow-500 text-stone-950 font-black shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              🌻 {isHi ? 'सरसों व तेल' : 'Mustard & Oil'}
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                activeTab === 'all'
                  ? 'bg-stone-800 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {isHi ? 'सभी' : 'All'}
            </button>
          </div>
        </div>

        {/* Exact Table with Requested Columns: Date | Deposit | Withdrawal | Grinding Fee Paid | Balance Remaining */}
        <div className="overflow-x-auto w-full max-w-full block">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-stone-300 bg-stone-100/80 text-stone-800 font-black">
                <th className="py-3.5 px-3">Date (तारीख)</th>
                <th className="py-3.5 px-3">Description (विवरण)</th>
                <th className="py-3.5 px-3 text-right text-emerald-900 bg-emerald-50">
                  Deposited (कितना जमा)
                </th>
                <th className="py-3.5 px-3 text-right text-amber-900 bg-amber-50">
                  Withdrawn (कितना निकाला)
                </th>
                <th className="py-3.5 px-3 text-right text-indigo-900 bg-indigo-50/50">
                  Grinding Rent (इतनी पिसाई दी)
                </th>
                <th className="py-3.5 px-3 text-right font-black text-stone-950 bg-amber-100/70">
                  Balance Remaining (इतना बचा)
                </th>
                <th className="py-3.5 px-3 text-center">Slip (पर्ची)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {transactions.map(txn => {
                const isDeposit = txn.type === 'deposit';
                const depositAmount = isDeposit ? (txn.depositKg || txn.quantityKg) : 0;
                const withdrawAmount = !isDeposit ? (txn.withdrawKg || txn.quantityKg) : 0;

                return (
                  <tr 
                    key={txn.id}
                    className="hover:bg-amber-50/40 transition-colors"
                  >
                    {/* 1. Date */}
                    <td className="py-3.5 px-3 font-semibold text-stone-800 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>{formatDate(txn.date)}</span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono block">
                        {txn.id}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-stone-900 text-xs">
                        {isHi ? (txn.itemHi || txn.item) : txn.item}
                      </div>
                      {txn.note && (
                        <div className="text-[11px] text-stone-500 italic mt-0.5">
                          "{isHi ? (txn.noteHi || txn.note) : txn.note}"
                        </div>
                      )}
                    </td>

                    {/* 2. Deposited (कितना जमा) */}
                    <td className="py-3.5 px-3 text-right font-mono font-black text-sm bg-emerald-50/40 whitespace-nowrap">
                      {isDeposit ? (
                        <span className="text-emerald-700">
                          +{depositAmount} kg
                        </span>
                      ) : (
                        <span className="text-stone-300">-</span>
                      )}
                    </td>

                    {/* 3. Withdrawn (कितना निकाला) */}
                    <td className="py-3.5 px-3 text-right font-mono font-black text-sm bg-amber-50/40 whitespace-nowrap">
                      {!isDeposit ? (
                        <span className="text-amber-800">
                          -{withdrawAmount} {txn.oilLitre ? 'L' : 'kg'}
                        </span>
                      ) : (
                        <span className="text-stone-300">-</span>
                      )}
                    </td>

                    {/* 4. Grinding Rent Paid (इतनी पिसाई दी) */}
                    <td className="py-3.5 px-3 text-right font-mono font-bold bg-indigo-50/30 whitespace-nowrap">
                      {txn.grindingFeeAmount > 0 ? (
                        <span className="text-indigo-800 font-black text-sm">
                          ₹{txn.grindingFeeAmount}
                        </span>
                      ) : (
                        <span className="text-stone-400">₹0</span>
                      )}
                    </td>

                    {/* 5. Balance Remaining (इतना बचा) */}
                    <td className="py-3.5 px-3 text-right font-mono font-black text-base text-amber-950 bg-amber-100/70 whitespace-nowrap">
                      {txn.balanceAfterKg !== undefined ? `${txn.balanceAfterKg} kg` : '-'}
                    </td>

                    {/* 6. Receipt Slip */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => onShowReceipt(txn, customer)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-900 hover:text-white rounded-xl text-stone-700 font-bold transition-all shadow-sm active:scale-95"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>{isHi ? 'पर्ची' : 'Slip'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {transactions.length === 0 && (
            <div className="text-center py-8 text-stone-500 text-xs">
              {isHi ? 'इस खाते में अभी कोई लेनदेन दर्ज नहीं है।' : 'No transactions recorded for this account yet.'}
            </div>
          )}
        </div>
      </div>

      {/* PIN-PROTECTED ACCOUNT DELETE MODAL (982026) */}
      {showDeleteModal && (
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
                onClick={() => { setShowDeleteModal(false); setDeletePin(''); }}
                className="p-1 hover:bg-white/20 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeleteAccount} className="p-5 space-y-4 text-xs">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-xs text-red-700 bg-red-100 px-2 py-0.5 rounded">
                    {customer.id}
                  </span>
                  <span className="font-bold text-stone-600">{displayVillage}</span>
                </div>
                <h4 className="font-extrabold text-base text-stone-900">
                  {displayName}
                </h4>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  {isHi 
                    ? 'चेतावनी: यह खाता और इसके सभी लेन-देन (गेहूं, आटा, सरसों, तेल, पर्चियां) स्थायी रूप से हटा दिए जाएंगे। इसे वापस नहीं लाया जा सकता।'
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
                  onClick={() => { setShowDeleteModal(false); setDeletePin(''); }}
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
