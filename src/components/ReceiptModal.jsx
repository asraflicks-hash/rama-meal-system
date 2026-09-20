import React from 'react';
import { X, ArrowLeft, Printer, Share2, CheckCircle2 } from 'lucide-react';
import { formatDate, formatCurrency, generateWhatsAppReceipt } from '../utils/format';

export default function ReceiptModal({ isOpen, onClose, txn, customer, millInfo }) {
  if (!isOpen || !txn || !customer) return null;

  const handlePrint = () => {
    window.print();
  };

  const whatsappUrl = `https://wa.me/91${customer.phone?.replace(/\D/g, '')}?text=${generateWhatsAppReceipt(customer, txn, millInfo)}`;

  const isDeposit = txn.type === 'deposit';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar with 2 Options: Back and X (Home) */}
        <div className="bg-stone-900 text-white px-4 py-3.5 flex items-center justify-between no-print border-b border-stone-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm sm:text-base">लेन-देन रसीद पर्ची</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold transition-all border border-stone-700 active:scale-95"
              title="वापस जाएं / Back"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>वापस</span>
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-black transition-all border border-amber-400 active:scale-95 shadow-sm"
              title="होम पर जाएं / बंद करें (Home / Close)"
            >
              <X className="w-3.5 h-3.5 font-black stroke-[3]" />
              <span>✕ होम</span>
            </button>
          </div>
        </div>

        {/* Slip Body (Printable Area) */}
        <div id="printable-slip" className="p-6 bg-white text-stone-900 text-sm">
          
          {/* Header */}
          <div className="text-center border-b-2 border-dashed border-stone-300 pb-4 mb-4">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 text-amber-900 text-xl font-black mb-1">
              🌾
            </div>
            <h2 className="text-xl font-black tracking-tight text-stone-900">{millInfo.nameEn || millInfo.name || 'Rama Flour & Mustard Oil Mills'}</h2>
            <p className="text-xs font-semibold text-amber-700">22 Sidra Motion (रामा आटा व तेल मिल)</p>
            <p className="text-xs text-stone-500 mt-1">{millInfo.address} • Ph: {millInfo.phone}</p>
            <div className="mt-2 inline-block px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-stone-100 text-stone-800 border border-stone-300">
              {isDeposit ? '✅ DEPOSIT SLIP (जमा पर्ची)' : '📤 WITHDRAWAL SLIP (निकासी पर्ची)'}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 mb-4 text-xs font-medium">
            <div className="flex justify-between py-1 border-b border-stone-200">
              <span className="text-stone-500">Receipt No:</span>
              <span className="font-mono font-bold">{txn.id}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-200">
              <span className="text-stone-500">Date:</span>
              <span className="font-bold">{formatDate(txn.date)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-200">
              <span className="text-stone-500">Account ID:</span>
              <span className="font-bold text-amber-800">{customer.id}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-200">
              <span className="text-stone-500">Customer Name:</span>
              <span className="font-bold text-stone-900 text-sm">{customer.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-200">
              <span className="text-stone-500">Father's Name:</span>
              <span>{customer.fatherName || '-'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-200">
              <span className="text-stone-500">Village / Address:</span>
              <span>{customer.village || '-'}</span>
            </div>
          </div>

          {/* Transaction Quantity Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-amber-900 text-sm">
                {txn.item || (isDeposit ? 'Wheat Deposit' : 'Flour Withdrawal')}
              </span>
              <span className="text-lg font-black text-amber-950 font-mono">
                {txn.quantityKg || txn.oilLitre} {txn.oilLitre ? 'Litres' : 'kg'}
              </span>
            </div>

            {txn.grindingFeeAmount > 0 && (
              <div className="flex justify-between items-center text-xs text-stone-700 pt-1 border-t border-amber-200">
                <span>Grinding Charges (पिसाई शुल्क):</span>
                <span className="font-bold">{formatCurrency(txn.grindingFeeAmount)}</span>
              </div>
            )}
          </div>

          {/* Balance Remaining Box */}
          <div className="bg-stone-900 text-white rounded-xl p-3 text-center mb-4">
            <p className="text-xs uppercase tracking-wider text-amber-300 font-semibold mb-0.5">
              Current Balance Remaining (शेष बैलेंस)
            </p>
            <p className="text-2xl font-black text-white font-mono">
              {txn.balanceAfterKg !== undefined ? `${txn.balanceAfterKg} kg` : `${customer.balances?.wheatCurrentBalanceKg || 0} kg`}
            </p>
            <p className="text-[11px] text-stone-400 mt-1">
              (Safely stored in mill customer warehouse)
            </p>
          </div>

          {txn.note && (
            <div className="text-xs text-stone-500 italic mb-3">
              Remarks: "{txn.note}"
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-dashed border-stone-300 flex justify-between text-[11px] text-stone-500">
            <span>Operator: {txn.operator || 'Authorized Signatory'}</span>
            <span>Customer Signature: _________</span>
          </div>

          <div className="text-center mt-3 text-[10px] text-stone-400">
            Computer Generated Slip • Rama Flour & Mustard Oil Mills (By Sidra Motion)
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex gap-2 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-stone-800 hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all shadow-sm active:scale-95"
          >
            <Printer className="w-4 h-4" />
            Print Slip
          </button>

          {customer.phone && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all shadow-sm active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              WhatsApp Slip
            </a>
          )}
        </div>

      </div>
    </div>
  );
}
