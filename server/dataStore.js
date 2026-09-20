import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, 'db.json');
const INITIAL_DATA_FILE = path.join(__dirname, 'initialData.json');

class DataStore {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_FILE)) {
      const initial = fs.readFileSync(INITIAL_DATA_FILE, 'utf-8');
      fs.writeFileSync(DB_FILE, initial, 'utf-8');
      this.data = JSON.parse(initial);
    } else {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Error reading DB_FILE, loading initial data', err);
        const initial = fs.readFileSync(INITIAL_DATA_FILE, 'utf-8');
        fs.writeFileSync(DB_FILE, initial, 'utf-8');
        this.data = JSON.parse(initial);
      }
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save db.json:', err);
    }
  }

  getMillInfo() {
    return this.data.millInfo;
  }

  getRates() {
    return this.data.rates;
  }

  updateRates(newRates) {
    this.data.rates = { ...this.data.rates, ...newRates };
    this.save();
    return this.data.rates;
  }

  // Calculate live balances for a customer based on their transaction history
  calculateCustomerBalances(customerId) {
    const txns = this.data.transactions
      .filter(t => t.customerId === customerId)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    let wheatDepositTotalKg = 0;
    let attaWithdrawnTotalKg = 0;
    let wheatCurrentBalanceKg = 0;

    let mustardDepositTotalKg = 0;
    let oilWithdrawnTotalLitre = 0;
    let khaliWithdrawnTotalKg = 0;

    const yieldPercent = (this.data.rates?.oilYieldPercent || 34) / 100;
    const khaliYieldPercent = (this.data.rates?.khaliYieldPercent || 64) / 100;

    let mustardCurrentBalanceKg = 0;
    let oilAvailableLitre = 0;
    let khaliAvailableKg = 0;

    for (const t of txns) {
      if (t.category === 'wheat') {
        if (t.type === 'deposit') {
          wheatDepositTotalKg += Number(t.quantityKg || 0);
          wheatCurrentBalanceKg += Number(t.quantityKg || 0);
        } else if (t.type === 'withdraw') {
          attaWithdrawnTotalKg += Number(t.quantityKg || 0);
          wheatCurrentBalanceKg -= Number(t.quantityKg || 0);
        }
      } else if (t.category === 'mustard' || t.category === 'mustard_oil') {
        if (t.type === 'deposit') {
          const qty = Number(t.quantityKg || 0);
          mustardDepositTotalKg += qty;
          mustardCurrentBalanceKg += qty;
          oilAvailableLitre += qty * yieldPercent;
          khaliAvailableKg += qty * khaliYieldPercent;
        } else if (t.type === 'withdraw') {
          const oil = Number(t.oilLitre || t.quantityKg || 0);
          const khali = Number(t.khaliKg || 0);
          oilWithdrawnTotalLitre += oil;
          khaliWithdrawnTotalKg += khali;
          oilAvailableLitre = Math.max(0, oilAvailableLitre - oil);
          khaliAvailableKg = Math.max(0, khaliAvailableKg - khali);
          // If customer withdrew mustard directly
          if (t.category === 'mustard') {
            mustardCurrentBalanceKg -= Number(t.quantityKg || 0);
          }
        }
      }
    }

    return {
      wheatDepositTotalKg,
      attaWithdrawnTotalKg,
      wheatCurrentBalanceKg: Number(wheatCurrentBalanceKg.toFixed(2)),
      mustardDepositTotalKg,
      oilWithdrawnTotalLitre,
      khaliWithdrawnTotalKg,
      mustardCurrentBalanceKg: Number(mustardCurrentBalanceKg.toFixed(2)),
      oilAvailableLitre: Number(oilAvailableLitre.toFixed(2)),
      khaliAvailableKg: Number(khaliAvailableKg.toFixed(2)),
      totalTransactions: txns.length
    };
  }

  getCustomers(search = '') {
    const s = search.toLowerCase().trim();
    return this.data.customers
      .filter(c => {
        if (!s) return true;
        return (
          c.id?.toLowerCase().includes(s) ||
          c.name?.toLowerCase().includes(s) ||
          c.nameHi?.toLowerCase().includes(s) ||
          c.phone?.toLowerCase().includes(s) ||
          c.village?.toLowerCase().includes(s) ||
          c.villageHi?.toLowerCase().includes(s) ||
          c.location?.toLowerCase().includes(s) ||
          c.locationHi?.toLowerCase().includes(s)
        );
      })
      .map(c => {
        const balances = this.calculateCustomerBalances(c.id);
        return {
          ...c,
          balances
        };
      });
  }

  getCustomerById(id) {
    const customer = this.data.customers.find(c => 
      c.id?.toLowerCase() === id?.toLowerCase() || 
      (c.phone && c.phone === id)
    );
    if (!customer) return null;
    const balances = this.calculateCustomerBalances(customer.id);
    const transactions = this.data.transactions
      .filter(t => t.customerId === customer.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // newest first

    return {
      ...customer,
      balances,
      transactions
    };
  }

  addCustomer(customerData) {
    // Generate next SN ID starting from SN400
    const existingNums = this.data.customers
      .map(c => {
        const m = (c.id || '').match(/^SN(\d+)$/i);
        return m ? parseInt(m[1], 10) : null;
      })
      .filter(n => n !== null);
    
    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 400;
    const id = `SN${nextNum}`;

    const newCustomer = {
      id,
      name: customerData.name?.trim(),
      nameHi: customerData.nameHi || customerData.name?.trim(),
      phone: customerData.phone?.trim() || '', // Optional
      village: customerData.village?.trim() || '',
      villageHi: customerData.villageHi || customerData.village?.trim() || '',
      location: customerData.location?.trim() || customerData.address?.trim() || '',
      locationHi: customerData.locationHi || customerData.location?.trim() || '',
      fatherName: customerData.fatherName?.trim() || '',
      fatherNameHi: customerData.fatherNameHi || customerData.fatherName?.trim() || '',
      accountOpenDate: customerData.accountOpenDate || new Date().toISOString().split('T')[0],
      notes: customerData.notes || ''
    };
    this.data.customers.unshift(newCustomer);
    this.save();
    return this.getCustomerById(id);
  }

  deleteCustomer(id) {
    const index = this.data.customers.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Customer not found');
    }
    const deleted = this.data.customers.splice(index, 1)[0];
    // Also remove associated transactions
    this.data.transactions = this.data.transactions.filter(t => t.customerId !== id);
    this.save();
    return deleted;
  }

  addTransaction(txnData) {
    const customer = this.data.customers.find(c => c.id === txnData.customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const currentBalances = this.calculateCustomerBalances(customer.id);
    const id = `TXN-${Date.now().toString().slice(-8)}`;

    let balanceAfterKg = 0;
    if (txnData.category === 'wheat') {
      const qty = Number(txnData.quantityKg || 0);
      if (txnData.type === 'deposit') {
        balanceAfterKg = currentBalances.wheatCurrentBalanceKg + qty;
        this.data.millStock.farmerDepositWheatTotalKg = (this.data.millStock.farmerDepositWheatTotalKg || 0) + qty;
      } else {
        // Unlimited: subtract exact quantity
        balanceAfterKg = currentBalances.wheatCurrentBalanceKg - qty;
        this.data.millStock.farmerDepositWheatTotalKg = Math.max(0, (this.data.millStock.farmerDepositWheatTotalKg || 0) - qty);
      }
    } else {
      const qty = Number(txnData.quantityKg || 0);
      if (txnData.type === 'deposit') {
        balanceAfterKg = currentBalances.mustardCurrentBalanceKg + qty;
        this.data.millStock.farmerDepositMustardTotalKg = (this.data.millStock.farmerDepositMustardTotalKg || 0) + qty;
      } else {
        balanceAfterKg = currentBalances.mustardCurrentBalanceKg - qty;
        this.data.millStock.farmerDepositMustardTotalKg = Math.max(0, (this.data.millStock.farmerDepositMustardTotalKg || 0) - qty);
      }
    }

    const isDeposit = txnData.type === 'deposit';
    const depositKg = isDeposit ? Number(txnData.quantityKg || 0) : 0;
    const withdrawKg = !isDeposit ? Number(txnData.quantityKg || 0) : 0;

    const newTxn = {
      id,
      customerId: txnData.customerId,
      date: txnData.date || new Date().toISOString().split('T')[0],
      type: txnData.type, // 'deposit' or 'withdraw'
      category: txnData.category, // 'wheat', 'mustard', 'mustard_oil'
      item: txnData.item || (txnData.category === 'wheat' ? (isDeposit ? 'Wheat Deposit' : 'Flour Withdrawal') : (isDeposit ? 'Mustard Deposit' : 'Oil Withdrawal')),
      quantityKg: Number(txnData.quantityKg || 0),
      depositKg,
      withdrawKg,
      oilLitre: txnData.oilLitre ? Number(txnData.oilLitre) : 0,
      khaliKg: txnData.khaliKg ? Number(txnData.khaliKg) : 0,
      grindingFeeMode: txnData.grindingFeeMode || 'cash',
      grindingFeeAmount: Number(txnData.grindingFeeAmount || 0),
      note: txnData.note || '',
      balanceAfterKg,
      operator: txnData.operator || 'Munim Ji',
      createdAt: new Date().toISOString()
    };

    this.data.transactions.unshift(newTxn);
    this.save();

    return {
      transaction: newTxn,
      customer: this.getCustomerById(customer.id)
    };
  }

  getTransactions({ date = '', type = '', search = '' } = {}) {
    let txns = [...this.data.transactions];
    if (date) {
      txns = txns.filter(t => t.date === date);
    }
    if (type) {
      txns = txns.filter(t => t.type === type);
    }
    if (search) {
      const s = search.toLowerCase().trim();
      txns = txns.filter(t => {
        const cust = this.data.customers.find(c => c.id === t.customerId);
        return (
          t.customerId?.toLowerCase().includes(s) ||
          t.item?.toLowerCase().includes(s) ||
          t.note?.toLowerCase().includes(s) ||
          cust?.name?.toLowerCase().includes(s) ||
          cust?.nameHi?.toLowerCase().includes(s) ||
          cust?.village?.toLowerCase().includes(s) ||
          cust?.location?.toLowerCase().includes(s)
        );
      });
    }
    return txns.map(t => {
      const customer = this.data.customers.find(c => c.id === t.customerId) || {};
      return {
        ...t,
        customerName: customer.name || t.customerId,
        customerNameHi: customer.nameHi || '',
        customerVillage: customer.village || '',
        customerLocation: customer.location || '',
        customerPhone: customer.phone || ''
      };
    });
  }

  getProducts() {
    return this.data.products;
  }

  getMillStock() {
    // recalculate totals across all customers
    let totalFarmerWheat = 0;
    let totalFarmerMustard = 0;

    for (const c of this.data.customers) {
      const b = this.calculateCustomerBalances(c.id);
      totalFarmerWheat += b.wheatCurrentBalanceKg;
      totalFarmerMustard += b.mustardCurrentBalanceKg;
    }

    this.data.millStock.farmerDepositWheatTotalKg = totalFarmerWheat;
    this.data.millStock.farmerDepositMustardTotalKg = totalFarmerMustard;

    return this.data.millStock;
  }

  addCounterSale(saleData) {
    const id = `SALE-${Date.now().toString().slice(-6)}`;
    const newSale = {
      id,
      date: saleData.date || new Date().toISOString().split('T')[0],
      customerName: saleData.customerName || 'काउंटर ग्राहक',
      phone: saleData.phone || '',
      items: saleData.items || [],
      totalAmount: Number(saleData.totalAmount || 0),
      paymentMode: saleData.paymentMode || 'Cash',
      operator: saleData.operator || 'काउंटर',
      createdAt: new Date().toISOString()
    };
    this.data.counterSales.unshift(newSale);
    this.save();
    return newSale;
  }

  getCounterSales() {
    return this.data.counterSales;
  }

  createOrder(orderData) {
    const id = `ORD-${Date.now().toString().slice(-6)}`;
    const newOrder = {
      id,
      date: new Date().toISOString().split('T')[0],
      customerName: orderData.customerName,
      phone: orderData.phone,
      address: orderData.address,
      city: orderData.city || 'स्थानीय',
      items: orderData.items,
      total: Number(orderData.total || 0),
      paymentMethod: orderData.paymentMethod || 'Cash on Delivery',
      status: 'Pending',
      type: 'Online Website Order',
      createdAt: new Date().toISOString()
    };
    this.data.orders.unshift(newOrder);
    this.save();
    return newOrder;
  }

  getOrders() {
    return this.data.orders;
  }

  updateOrderStatus(orderId, status) {
    const order = this.data.orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      this.save();
    }
    return order;
  }

  getDashboardStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayTxns = this.data.transactions.filter(t => t.date === today);

    const todayWheatDepositKg = todayTxns
      .filter(t => t.category === 'wheat' && t.type === 'deposit')
      .reduce((sum, t) => sum + (Number(t.quantityKg) || 0), 0);

    const todayAttaWithdrawKg = todayTxns
      .filter(t => t.category === 'wheat' && t.type === 'withdraw')
      .reduce((sum, t) => sum + (Number(t.quantityKg) || 0), 0);

    const todayMustardDepositKg = todayTxns
      .filter(t => t.category === 'mustard' && t.type === 'deposit')
      .reduce((sum, t) => sum + (Number(t.quantityKg) || 0), 0);

    const todayOilWithdrawLitre = todayTxns
      .filter(t => t.type === 'withdraw')
      .reduce((sum, t) => sum + (Number(t.oilLitre) || 0), 0);

    const todayGrindingIncome = todayTxns
      .reduce((sum, t) => sum + (Number(t.grindingFeeAmount) || 0), 0);

    const todayCounterSalesAmount = this.data.counterSales
      .filter(s => s.date === today)
      .reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);

    return {
      today,
      todayWheatDepositKg,
      todayAttaWithdrawKg,
      todayMustardDepositKg,
      todayOilWithdrawLitre,
      todayGrindingIncome,
      todayCounterSalesAmount,
      totalCustomers: this.data.customers.length,
      millStock: this.getMillStock(),
      rates: this.data.rates
    };
  }

  getDailyReport(targetDate) {
    const date = targetDate || new Date().toISOString().split('T')[0];
    const txns = this.getTransactions({ date });
    const counterSales = (this.data.counterSales || []).filter(s => s.date === date);

    const wheatDepositTotalKg = txns
      .filter(t => t.category === 'wheat' && t.type === 'deposit')
      .reduce((sum, t) => sum + (Number(t.quantityKg) || 0), 0);

    const attaWithdrawnTotalKg = txns
      .filter(t => t.category === 'wheat' && t.type === 'withdraw')
      .reduce((sum, t) => sum + (Number(t.quantityKg) || 0), 0);

    const mustardDepositTotalKg = txns
      .filter(t => t.category === 'mustard' && t.type === 'deposit')
      .reduce((sum, t) => sum + (Number(t.quantityKg) || 0), 0);

    const oilWithdrawnTotalLitre = txns
      .filter(t => t.type === 'withdraw')
      .reduce((sum, t) => sum + (Number(t.oilLitre) || 0), 0);

    const grindingFeeTotal = txns
      .reduce((sum, t) => sum + (Number(t.grindingFeeAmount) || 0), 0);

    const counterSalesTotal = counterSales
      .reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);

    const totalCashIncome = grindingFeeTotal + counterSalesTotal;

    return {
      date,
      wheatDepositTotalKg,
      attaWithdrawnTotalKg,
      mustardDepositTotalKg,
      oilWithdrawnTotalLitre,
      grindingFeeTotal,
      counterSalesTotal,
      totalCashIncome,
      totalTransactions: txns.length,
      transactions: txns,
      counterSales
    };
  }
}

export const dataStore = new DataStore();
