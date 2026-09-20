export const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val || 0);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatWeight = (kg) => {
  const k = Number(kg || 0);
  if (k >= 100) {
    const quintal = (k / 100).toFixed(2).replace(/\.00$/, '');
    return `${k} kg (${quintal} Quintal)`;
  }
  return `${k} kg`;
};

// Generate shareable WhatsApp text for a transaction in English
export const generateWhatsAppReceipt = (customer, txn, millInfo) => {
  const isDeposit = txn.type === 'deposit';
  const actionText = isDeposit ? 'DEPOSIT RECEIPT' : 'WITHDRAWAL RECEIPT';
  
  let details = '';
  if (txn.category === 'wheat') {
    details = `🌾 Item: ${txn.item || (isDeposit ? 'Wheat Deposit' : 'Flour (Atta) Withdrawal')}\n⚖️ Quantity: ${txn.quantityKg} kg\n📊 Remaining Wheat Balance: ${txn.balanceAfterKg} kg`;
    if (txn.grindingFeeAmount > 0) {
      details += `\n💰 Grinding Charges: ₹${txn.grindingFeeAmount}`;
    }
  } else {
    details = `🌻 Item: ${txn.item || (isDeposit ? 'Mustard Deposit' : 'Mustard Oil Withdrawal')}\n⚖️ Quantity: ${txn.quantityKg || txn.oilLitre} ${txn.oilLitre ? 'Litres' : 'kg'}\n📊 Remaining Mustard: ${txn.balanceAfterKg || 0} kg`;
  }

  const msg = `*${millInfo.nameEn || millInfo.name || 'Rama Flour & Oil Mills'}*\n` +
    `_By: Sidra Motion_\n` +
    `--------------------------\n` +
    `🧾 *${actionText}*\n` +
    `📅 Date: ${formatDate(txn.date)}\n` +
    `👤 Customer: ${customer.name}\n` +
    `📱 Mobile: ${customer.phone || '-'}\n` +
    `🏡 Village/Address: ${customer.village || '-'}\n` +
    `🔖 Receipt No: ${txn.id}\n` +
    `--------------------------\n` +
    `${details}\n` +
    `--------------------------\n` +
    `🙏 Thank you! For inquiries contact: ${millInfo.phone}\n` +
    `Rama Flour & Mustard Oil Mills - Pure & Traditional Quality`;

  return encodeURIComponent(msg);
};
