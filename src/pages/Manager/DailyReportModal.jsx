import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Download, 
  Printer, 
  ArrowLeft, 
  X, 
  Search, 
  Wheat, 
  Droplets, 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  Filter, 
  FileText,
  ChevronLeft,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate } from '../../utils/format';

export default function DailyReportModal({ 
  isOpen, 
  onClose, 
  onHome, 
  lang = 'en', 
  millInfo = {} 
}) {
  const isHi = lang === 'hi';
  const getTodayStr = () => new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'wheat', 'mustard', 'cash'

  const fetchDailyReport = async (dateStr) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/daily-report?date=${dateStr}`);
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (err) {
      console.error('Error fetching daily report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDailyReport(selectedDate);
    }
  }, [isOpen, selectedDate]);

  if (!isOpen) return null;

  // Day navigation helpers
  const handleShiftDay = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    const newDateStr = d.toISOString().split('T')[0];
    setSelectedDate(newDateStr);
  };

  const handleSetToday = () => {
    setSelectedDate(getTodayStr());
  };

  // Filtered transactions
  const filteredTransactions = (report?.transactions || []).filter(t => {
    // Tab filter
    if (activeTab === 'wheat' && t.category !== 'wheat') return false;
    if (activeTab === 'mustard' && t.category !== 'mustard' && t.category !== 'mustard_oil') return false;
    if (activeTab === 'cash' && (!t.grindingFeeAmount || Number(t.grindingFeeAmount) <= 0)) return false;

    // Search query filter
    if (!searchTerm.trim()) return true;
    const s = searchTerm.toLowerCase().trim();
    return (
      t.customerId?.toLowerCase().includes(s) ||
      t.customerName?.toLowerCase().includes(s) ||
      t.customerNameHi?.toLowerCase().includes(s) ||
      t.customerVillage?.toLowerCase().includes(s) ||
      t.note?.toLowerCase().includes(s) ||
      t.item?.toLowerCase().includes(s)
    );
  });

  // Generate and Download PDF using jsPDF + autoTable
  const handleDownloadPDF = () => {
    if (!report) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    const primaryColor = [180, 83, 9]; // Amber-700
    const darkColor = [28, 25, 23]; // Stone-900

    // Header Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...darkColor);
    doc.text(millInfo.nameEn || 'RAMA FLOUR & MUSTARD OIL MILLS', 40, 45);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('OPERATED BY SIDRA MOTION', 40, 60);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`${millInfo.address || 'Main Mandi Road, Near Railway Crossing, Lucknow'} | Phone: ${millInfo.phone || '+91 98765 43210'}`, 40, 74);

    // Decorative line
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(1.5);
    doc.line(40, 82, 555, 82);

    // Report Title & Date
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...darkColor);
    doc.text('DAILY MILL REGISTER & CASH AUDIT REPORT', 40, 104);

    doc.setFontSize(10);
    doc.setTextColor(70, 70, 70);
    doc.text(`Report Date: ${selectedDate} (${new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long' })})`, 40, 120);
    doc.text(`Generated At: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN')}`, 370, 120);

    // Summary KPI Table
    const summaryData = [
      [
        'Total Wheat Deposit',
        `+${report.wheatDepositTotalKg || 0} kg`,
        'Total Atta Withdrawn',
        `-${report.attaWithdrawnTotalKg || 0} kg`
      ],
      [
        'Total Mustard Deposit',
        `+${report.mustardDepositTotalKg || 0} kg`,
        'Total Mustard Oil Out',
        `-${report.oilWithdrawnTotalLitre || 0} Litres`
      ],
      [
        'Cash Grinding Rent',
        `INR ${report.grindingFeeTotal || 0}`,
        'Counter Retail Sales',
        `INR ${report.counterSalesTotal || 0}`
      ],
      [
        'TOTAL CASH INCOME',
        `INR ${report.totalCashIncome || 0}`,
        'Total Transactions',
        `${report.totalTransactions || 0} entries`
      ]
    ];

    autoTable(doc, {
      startY: 132,
      head: [['Metric', 'Figure', 'Metric', 'Figure']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8.5, textColor: [30, 30, 30] },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 140 },
        1: { textColor: [180, 83, 9], fontStyle: 'bold', cellWidth: 100 },
        2: { fontStyle: 'bold', cellWidth: 140 },
        3: { textColor: [16, 149, 106], fontStyle: 'bold', cellWidth: 135 }
      }
    });

    // Transactions Table
    const txns = report.transactions || [];
    const tableRows = txns.map((t, idx) => {
      const isDeposit = t.type === 'deposit';
      const typeLabel = isDeposit ? 'IN (Deposit)' : 'OUT (Withdraw)';
      const itemLabel = t.category === 'wheat' 
        ? (isDeposit ? 'Wheat In' : 'Atta Out') 
        : (isDeposit ? 'Mustard In' : 'Oil Out');
      const qtyStr = t.category === 'wheat' ? `${t.quantityKg} kg` : (t.oilLitre ? `${t.oilLitre} L` : `${t.quantityKg} kg`);

      return [
        idx + 1,
        t.customerId || '-',
        t.customerName || '-',
        t.customerVillage || '-',
        typeLabel,
        itemLabel,
        qtyStr,
        t.grindingFeeAmount ? `INR ${t.grindingFeeAmount}` : '0',
        `${t.balanceAfterKg || 0} kg`,
        t.operator || 'Munim'
      ];
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...darkColor);
    const prevY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 18 : 230;
    doc.text(`DETAILED TRANSACTIONS LIST (${txns.length} ENTRIES)`, 40, prevY);

    // Build footer rows for autoTable with full totals
    const footRows = [
      [
        { content: 'TOTAL (कुल प्रविष्टियां योग):', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold', fontSize: 8.5 } },
        { content: `${txns.filter(t => t.type === 'deposit').length} In / ${txns.filter(t => t.type === 'withdraw').length} Out`, styles: { fontStyle: 'bold', fontSize: 7.5 } },
        { content: 'Total Qty:', styles: { halign: 'right', fontStyle: 'bold', fontSize: 7.5 } },
        { content: `+${report.wheatDepositTotalKg || 0} kg जमा\n-${report.attaWithdrawnTotalKg || 0} kg आटा${report.oilWithdrawnTotalLitre ? `\n-${report.oilWithdrawnTotalLitre} L तेल` : ''}`, styles: { fontStyle: 'bold', fontSize: 7.5, textColor: [180, 83, 9] } },
        { content: `INR ${report.grindingFeeTotal || 0}`, styles: { halign: 'right', fontStyle: 'bold', fontSize: 8.5, textColor: [16, 149, 106] } },
        { content: '-', styles: { halign: 'center' } },
        { content: `पिसाई: INR ${report.grindingFeeTotal || 0}`, styles: { fontStyle: 'bold', fontSize: 7.5 } }
      ],
      [
        { 
          content: `दैनिक कुल नकद गल्ला आय (GRAND TOTAL CASH: पिसाई ₹${report.grindingFeeTotal || 0} + काउंटर ₹${report.counterSalesTotal || 0}):`, 
          colSpan: 7, 
          styles: { halign: 'right', fontStyle: 'bold', fontSize: 9 } 
        },
        { 
          content: `INR ${report.totalCashIncome || 0}`, 
          styles: { halign: 'right', fontStyle: 'bold', fontSize: 9.5, textColor: [16, 149, 106] } 
        },
        { 
          content: 'AUDITED & VERIFIED', 
          colSpan: 2, 
          styles: { halign: 'center', fontStyle: 'bold', fontSize: 7.5, textColor: [90, 90, 90] } 
        }
      ]
    ];

    autoTable(doc, {
      startY: prevY + 6,
      head: [['#', 'Cust ID', 'Customer Name', 'Village', 'Type', 'Item', 'Quantity', 'Rent Paid', 'Balance', 'Operator']],
      body: tableRows.length > 0 ? tableRows : [['-', '-', 'No transactions recorded on this date', '-', '-', '-', '-', '-', '-', '-']],
      foot: tableRows.length > 0 ? footRows : undefined,
      theme: 'striped',
      headStyles: { fillColor: darkColor, textColor: 255, fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 7.5, textColor: [40, 40, 40] },
      footStyles: { 
        fillColor: [248, 240, 226], 
        textColor: [20, 20, 20], 
        fontStyle: 'bold', 
        lineWidth: 0.5, 
        lineColor: [210, 185, 150] 
      },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      didDrawPage: (data) => {
        // Page Footer
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(130, 130, 130);
        doc.text(
          `Rama Flour & Oil Mills (By Sidra Motion) • Page ${data.pageNumber} of ${pageCount}`,
          40,
          doc.internal.pageSize.height - 20
        );
        doc.text(
          `Authorized Mill Operator Signature: _______________________`,
          340,
          doc.internal.pageSize.height - 20
        );
      }
    });

    // If counter retail sales exist, also render Counter Sales Table with Total
    if (report.counterSales && report.counterSales.length > 0) {
      const counterRows = report.counterSales.map((s, idx) => {
        const itemsStr = (s.items || []).map(i => `${i.name} (x${i.qty})`).join(', ');
        return [
          idx + 1,
          s.id || '-',
          s.customerName || 'Walk-in',
          s.phone || '-',
          itemsStr,
          s.paymentMode || 'Cash',
          `INR ${s.totalAmount || 0}`,
          s.operator || 'Counter'
        ];
      });

      const currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 16 : 400;
      if (currentY > doc.internal.pageSize.height - 120) {
        doc.addPage();
      }
      const titleY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 16 : 40;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(...darkColor);
      doc.text(`COUNTER RETAIL POS SALES (${report.counterSales.length} ENTRIES)`, 40, titleY);

      autoTable(doc, {
        startY: titleY + 5,
        head: [['#', 'Bill ID', 'Customer Name', 'Phone', 'Items Purchased', 'Mode', 'Amount', 'Operator']],
        body: counterRows,
        foot: [
          [
            { content: 'TOTAL COUNTER SALES (काउंटर बिक्री कुल):', colSpan: 6, styles: { halign: 'right', fontStyle: 'bold', fontSize: 8.5 } },
            { content: `INR ${report.counterSalesTotal || 0}`, styles: { halign: 'right', fontStyle: 'bold', fontSize: 9, textColor: [16, 149, 106] } },
            { content: 'Verified', styles: { halign: 'center', fontStyle: 'bold', fontSize: 7.5 } }
          ]
        ],
        theme: 'striped',
        headStyles: { fillColor: [45, 75, 95], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 7.5 },
        footStyles: { fillColor: [235, 245, 250], textColor: [20, 20, 20], fontStyle: 'bold' }
      });
    }

    // Trigger instant download
    doc.save(`Rama_Mill_Daily_Report_${selectedDate}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-stone-50 rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden border border-stone-300 animate-in fade-in zoom-in-95 duration-200 max-h-[96vh] flex flex-col">
        
        {/* Top Header Bar with '← Back' and '✕ Home' */}
        <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 text-white p-3.5 sm:p-4 flex items-center justify-between gap-3 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-black shadow-md">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span>{isHi ? 'दैनिक आवक-जावक रजिस्टर व PDF रिपोर्ट' : 'Daily Mill Ledger & PDF Report'}</span>
              </h2>
              <p className="text-[11px] text-amber-300 font-medium">
                {isHi ? 'तारीख वार पूरा हिसाब • कितना आया, कितना गया, कितने पैसे आए' : 'Date-wise Audit • Total In, Out & Cash Collected'}
              </p>
            </div>
          </div>

          {/* Navigation Action Buttons: Back and X (Home) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 active:bg-stone-600 text-stone-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-stone-700 active:scale-95 shadow-sm"
              title="वापस जाएं / Back"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>{isHi ? '← वापस' : '← Back'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onHome) onHome();
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-black transition-all border border-amber-400 active:scale-95 shadow-md"
              title="मुख्य होम स्क्रीन पर जाएं / Home"
            >
              <X className="w-3.5 h-3.5 font-black stroke-[3]" />
              <span>{isHi ? '✕ होम' : '✕ Home'}</span>
            </button>
          </div>
        </div>

        {/* Date Selection & Action Toolbar */}
        <div className="bg-white px-3.5 py-3 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-sm">
          {/* Left: Date Selection Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Today Button */}
            <button
              type="button"
              onClick={handleSetToday}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 shadow-sm active:scale-95 ${
                selectedDate === getTodayStr()
                  ? 'bg-amber-500 text-stone-950 shadow-amber-500/20'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300'
              }`}
            >
              <span>⚡ {isHi ? 'आज (Today)' : 'Today'}</span>
            </button>

            {/* Previous Day */}
            <button
              type="button"
              onClick={() => handleShiftDay(-1)}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 transition-colors shadow-sm active:scale-95"
              title="पिछला दिन / Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Date Picker Input */}
            <div className="flex items-center gap-1.5 bg-stone-100 border border-stone-300 rounded-xl px-2.5 py-1.5 shadow-inner">
              <Calendar className="w-4 h-4 text-amber-700" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-black text-stone-900 outline-none cursor-pointer"
              />
            </div>

            {/* Next Day */}
            <button
              type="button"
              onClick={() => handleShiftDay(1)}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 transition-colors shadow-sm active:scale-95"
              title="अगला दिन / Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="text-xs text-stone-500 font-bold hidden sm:inline">
              ({formatDate(selectedDate)})
            </span>
          </div>

          {/* Right: PDF Download and Print Buttons */}
          <div className="flex items-center gap-2">
            {/* Download PDF Button */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-black transition-all shadow-md hover:shadow-emerald-700/25 active:scale-95"
              title="फोन या PC में PDF डाउनलोड करें"
            >
              <Download className="w-4 h-4 text-emerald-200" />
              <span>{isHi ? '📥 PDF डाउनलोड करें' : '📥 Download PDF'}</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
              title="प्रिंट पर्ची"
            >
              <Printer className="w-4 h-4 text-stone-600" />
              <span className="hidden sm:inline">{isHi ? 'प्रिंट' : 'Print'}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-5 flex-1 bg-stone-100/70">
          
          {loading && (
            <div className="py-12 text-center text-stone-500 text-xs sm:text-sm font-semibold">
              <span className="animate-spin inline-block mr-2">⏳</span>
              {isHi ? 'डेटा लोड हो रहा है...' : 'Loading daily ledger data...'}
            </div>
          )}

          {!loading && report && (
            <>
              {/* 4 Summary Metric Cards: कितना आया, कितना गया, कितने पैसे आए */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
                
                {/* 1. Wheat & Atta Card */}
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-black uppercase text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Wheat className="w-3.5 h-3.5 text-amber-700" />
                      <span>{isHi ? 'गेहूं व आटा' : 'Wheat & Atta'}</span>
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-stone-500">{isHi ? 'आवक (जमा):' : 'Deposit In:'}</span>
                      <span className="font-black text-emerald-700 font-mono text-sm">+{report.wheatDepositTotalKg || 0} kg</span>
                    </div>
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-stone-500">{isHi ? 'जावक (निकाला):' : 'Flour Out:'}</span>
                      <span className="font-black text-rose-700 font-mono text-sm">-{report.attaWithdrawnTotalKg || 0} kg</span>
                    </div>
                  </div>
                </div>

                {/* 2. Mustard & Oil Card */}
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-black uppercase text-yellow-900 bg-yellow-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-yellow-700" />
                      <span>{isHi ? 'सरसों व तेल' : 'Mustard & Oil'}</span>
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-stone-500">{isHi ? 'आवक (सरसों):' : 'Mustard In:'}</span>
                      <span className="font-black text-emerald-700 font-mono text-sm">+{report.mustardDepositTotalKg || 0} kg</span>
                    </div>
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-stone-500">{isHi ? 'जावक (तेल निकाला):' : 'Oil Out:'}</span>
                      <span className="font-black text-amber-700 font-mono text-sm">-{report.oilWithdrawnTotalLitre || 0} L</span>
                    </div>
                  </div>
                </div>

                {/* 3. Cash Income Card (कितने पैसे उस दिन आए) */}
                <div className="bg-gradient-to-br from-amber-600 to-amber-800 text-white p-3.5 sm:p-4 rounded-2xl shadow-md flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-950 bg-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <IndianRupee className="w-3.5 h-3.5" />
                      <span>{isHi ? 'कुल नकद वसूली' : 'Total Cash'}</span>
                    </span>
                  </div>
                  <div className="mt-1">
                    <div className="text-xl sm:text-2xl font-black font-mono">
                      ₹{report.totalCashIncome || 0}
                    </div>
                    <div className="text-[10px] text-amber-200 mt-1 flex justify-between">
                      <span>पिसाई किराया: ₹{report.grindingFeeTotal || 0}</span>
                      <span>काउंटर: ₹{report.counterSalesTotal || 0}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Total Activity Card */}
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-black uppercase text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-stone-600" />
                      <span>{isHi ? 'कुल लेन-देन' : 'Total Activity'}</span>
                    </span>
                  </div>
                  <div className="mt-1">
                    <div className="text-xl sm:text-2xl font-black text-stone-900 font-mono">
                      {report.totalTransactions || 0}
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      {isHi ? `तारीख: ${selectedDate} का हिसाब` : `Date: ${selectedDate}`}
                    </p>
                  </div>
                </div>

              </div>

              {/* Transactions Section */}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-stone-100">
                  
                  {/* Category Filter Tabs */}
                  <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-bold">
                    <button
                      onClick={() => setActiveTab('all')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        activeTab === 'all' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {isHi ? 'सभी' : 'All'} ({report.transactions?.length || 0})
                    </button>
                    <button
                      onClick={() => setActiveTab('wheat')}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                        activeTab === 'wheat' ? 'bg-amber-700 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <span>🌾 {isHi ? 'गेहूं/आटा' : 'Wheat'}</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('mustard')}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                        activeTab === 'mustard' ? 'bg-yellow-500 text-stone-950 font-black shadow-sm' : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <span>🌻 {isHi ? 'सरसों/तेल' : 'Mustard'}</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('cash')}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                        activeTab === 'cash' ? 'bg-emerald-700 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <span>💰 {isHi ? 'नकद किराया' : 'Cash Rent'}</span>
                    </button>
                  </div>

                  {/* Search box for this date */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      placeholder={isHi ? 'किसान नाम, गांव या SN खोजें...' : 'Search customer, SN...'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Transactions Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-stone-100/90 text-stone-600 font-bold border-b border-stone-200">
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">{isHi ? 'सीरियल ID' : 'SN ID'}</th>
                        <th className="py-2.5 px-3">{isHi ? 'किसान का नाम' : 'Customer Name'}</th>
                        <th className="py-2.5 px-3">{isHi ? 'गांव / पता' : 'Village'}</th>
                        <th className="py-2.5 px-3">{isHi ? 'प्रकार' : 'Type'}</th>
                        <th className="py-2.5 px-3">{isHi ? 'मात्रा' : 'Quantity'}</th>
                        <th className="py-2.5 px-3 text-right">{isHi ? 'पिसाई दी (₹)' : 'Rent Paid (₹)'}</th>
                        <th className="py-2.5 px-3 text-right">{isHi ? 'शेष बैलेंस' : 'Balance'}</th>
                        <th className="py-2.5 px-3">{isHi ? 'मुनीम' : 'Operator'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium">
                      {filteredTransactions.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="py-8 text-center text-stone-400 text-xs">
                            {isHi 
                              ? `तारीख ${selectedDate} में कोई लेन-देन दर्ज नहीं है।` 
                              : `No transactions found for ${selectedDate}.`}
                          </td>
                        </tr>
                      ) : (
                        filteredTransactions.map((t, idx) => {
                          const isDeposit = t.type === 'deposit';
                          return (
                            <tr key={t.id || idx} className="hover:bg-amber-50/50 transition-colors">
                              <td className="py-2 px-3 text-stone-400 text-[11px] font-mono">{idx + 1}</td>
                              <td className="py-2 px-3">
                                <span className="font-mono font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                                  {t.customerId}
                                </span>
                              </td>
                              <td className="py-2 px-3 font-bold text-stone-900">
                                {isHi ? (t.customerNameHi || t.customerName) : t.customerName}
                              </td>
                              <td className="py-2 px-3 text-stone-600">
                                {t.customerVillage || '-'}
                              </td>
                              <td className="py-2 px-3">
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                  isDeposit ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {isDeposit ? (isHi ? 'जमा (In)' : 'Deposit') : (isHi ? 'निकासी (Out)' : 'Withdraw')}
                                </span>
                              </td>
                              <td className="py-2 px-3 font-mono font-bold text-stone-900">
                                {t.category === 'wheat' ? `${t.quantityKg} kg` : (t.oilLitre ? `${t.oilLitre} L` : `${t.quantityKg} kg`)}
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-bold">
                                {Number(t.grindingFeeAmount) > 0 ? (
                                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    ₹{t.grindingFeeAmount}
                                  </span>
                                ) : (
                                  <span className="text-stone-400">-</span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-amber-800">
                                {t.balanceAfterKg || 0} kg
                              </td>
                              <td className="py-2 px-3 text-stone-500 text-[11px]">
                                {t.operator || 'Munim'}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                    {filteredTransactions.length > 0 && (
                      <tfoot className="border-t-2 border-amber-400 bg-amber-50/95 font-bold text-stone-900">
                        {/* Row 1: Subtotal of Table Entries */}
                        <tr className="border-b border-amber-200">
                          <td colSpan="4" className="py-2.5 px-3 text-right font-black uppercase text-amber-950 text-xs">
                            {isHi ? `कुल योग (${filteredTransactions.length} एंट्री):` : `TOTAL (${filteredTransactions.length} ENTRIES):`}
                          </td>
                          <td className="py-2.5 px-3 text-[11px] font-bold text-stone-700">
                            {filteredTransactions.filter(t => t.type === 'deposit').length} {isHi ? 'जमा' : 'In'} / {filteredTransactions.filter(t => t.type === 'withdraw').length} {isHi ? 'निकासी' : 'Out'}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-black text-xs">
                            <div className="text-emerald-800">+{report.wheatDepositTotalKg || 0} kg {isHi ? 'जमा' : 'In'}</div>
                            <div className="text-amber-900">-{report.attaWithdrawnTotalKg || 0} kg {isHi ? 'आटा' : 'Out'}</div>
                            {report.oilWithdrawnTotalLitre > 0 && (
                              <div className="text-yellow-800">-{report.oilWithdrawnTotalLitre} L {isHi ? 'तेल' : 'Oil'}</div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-800 text-sm">
                            ₹{report.grindingFeeTotal || 0}
                          </td>
                          <td className="py-2.5 px-3 text-right text-stone-400 font-mono">-</td>
                          <td className="py-2.5 px-3 text-[11px] text-stone-600 font-semibold">
                            {isHi ? 'पिसाई नकद' : 'Cash Rent'}
                          </td>
                        </tr>

                        {/* Row 2: Grand Total Cash Income */}
                        <tr className="bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 text-stone-950">
                          <td colSpan="6" className="py-3 px-3 text-right font-black text-xs sm:text-sm text-stone-900">
                            💰 {isHi ? 'दैनिक कुल नकद गल्ला आय (पिसाई किराया + काउंटर बिक्री):' : 'DAILY GRAND TOTAL CASH INCOME (Rent + Counter POS):'}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-black text-base sm:text-lg text-emerald-900">
                            ₹{report.totalCashIncome || 0}
                          </td>
                          <td colSpan="2" className="py-3 px-3 text-[11px] font-bold text-amber-900">
                            (पिसाई: ₹{report.grindingFeeTotal || 0} + काउंटर: ₹{report.counterSalesTotal || 0})
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>

              {/* Counter Retail Sales Section (if any on this date) */}
              {report.counterSales && report.counterSales.length > 0 && (
                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <h4 className="font-black text-stone-900 text-xs sm:text-sm flex items-center gap-1.5">
                      <span>🛍️</span>
                      <span>{isHi ? 'काउंटर सीधी बिक्री (Retail POS Bills)' : 'Counter Retail POS Sales'}</span>
                      <span className="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-bold font-mono">
                        {report.counterSales.length}
                      </span>
                    </h4>
                    <span className="font-mono font-bold text-emerald-700 text-xs sm:text-sm">
                      {isHi ? 'काउंटर बिक्री कुल:' : 'Total:'} ₹{report.counterSalesTotal || 0}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-stone-100/90 text-stone-600 font-bold border-b border-stone-200">
                          <th className="py-2.5 px-3">#</th>
                          <th className="py-2.5 px-3">{isHi ? 'बिल क्र.' : 'Bill ID'}</th>
                          <th className="py-2.5 px-3">{isHi ? 'ग्राहक' : 'Customer'}</th>
                          <th className="py-2.5 px-3">{isHi ? 'सामान' : 'Items'}</th>
                          <th className="py-2.5 px-3">{isHi ? 'माध्यम' : 'Mode'}</th>
                          <th className="py-2.5 px-3 text-right">{isHi ? 'रकम (₹)' : 'Amount (₹)'}</th>
                          <th className="py-2.5 px-3">{isHi ? 'ऑपरेटर' : 'Operator'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 font-medium">
                        {report.counterSales.map((sale, idx) => (
                          <tr key={sale.id || idx} className="hover:bg-stone-50">
                            <td className="py-2 px-3 text-stone-400 font-mono text-[11px]">{idx + 1}</td>
                            <td className="py-2 px-3 font-mono font-bold text-stone-900">{sale.id}</td>
                            <td className="py-2 px-3 font-bold text-stone-900">{sale.customerName}</td>
                            <td className="py-2 px-3 text-stone-600">
                              {(sale.items || []).map(i => `${i.name} (x${i.qty})`).join(', ')}
                            </td>
                            <td className="py-2 px-3">
                              <span className="bg-stone-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                {sale.paymentMode || 'Cash'}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-black text-emerald-800">
                              ₹{sale.totalAmount}
                            </td>
                            <td className="py-2 px-3 text-stone-500 text-[11px]">{sale.operator || 'Counter'}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="border-t-2 border-stone-300 bg-stone-100 font-bold">
                        <tr>
                          <td colSpan="5" className="py-2.5 px-3 text-right font-black uppercase text-stone-800 text-xs">
                            {isHi ? 'कुल काउंटर बिक्री (TOTAL COUNTER):' : 'TOTAL COUNTER SALES:'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-800 text-sm">
                            ₹{report.counterSalesTotal || 0}
                          </td>
                          <td className="py-2.5 px-3"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-stone-900 text-stone-300 p-3 px-4 flex flex-wrap items-center justify-between gap-2 border-t border-stone-800 shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-black">●</span>
            <span>
              {isHi 
                ? `तारीख: ${selectedDate} • कुल लेन-देन: ${report?.totalTransactions || 0}`
                : `Audit Date: ${selectedDate} • Total Entries: ${report?.totalTransactions || 0}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all shadow active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isHi ? 'PDF डाउनलोड' : 'Download PDF'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold transition-colors"
            >
              {isHi ? 'बंद करें' : 'Close'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
