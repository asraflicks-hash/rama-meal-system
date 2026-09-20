import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dataStore } from './dataStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '..', 'dist');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mill branding & info
app.get('/api/info', (req, res) => {
  res.json(dataStore.getMillInfo());
});

// Rates
app.get('/api/rates', (req, res) => {
  res.json(dataStore.getRates());
});

app.post('/api/rates', (req, res) => {
  try {
    const updated = dataStore.updateRates(req.body);
    res.json({ success: true, rates: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Customers & Ledgers
app.get('/api/customers', (req, res) => {
  const search = req.query.search || '';
  const list = dataStore.getCustomers(search);
  res.json(list);
});

app.get('/api/customers/:id', (req, res) => {
  const customer = dataStore.getCustomerById(req.params.id);
  if (!customer) {
    return res.status(404).json({ error: 'ग्राहक नहीं मिला (Customer not found)' });
  }
  res.json(customer);
});

const MASTER_PIN = '982026';

app.post('/api/customers', (req, res) => {
  try {
    const { name, phone, village, location, fatherName, notes, pin } = req.body;
    const providedPin = pin || req.headers['x-admin-pin'];
    if (providedPin !== MASTER_PIN) {
      return res.status(403).json({ error: 'अमान्य सुरक्षा पिन! नया खाता बनाने के लिए सही पिन (982026) दर्ज करें।' });
    }

    if (!name) {
      return res.status(400).json({ error: 'ग्राहक का नाम आवश्यक है' });
    }
    const created = dataStore.addCustomer({ name, phone, village, location, fatherName, notes });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/customers/:id', (req, res) => {
  try {
    const { pin } = req.body || {};
    const providedPin = pin || req.headers['x-admin-pin'] || req.query.pin;
    if (providedPin !== MASTER_PIN) {
      return res.status(403).json({ error: 'अमान्य सुरक्षा पिन! खाता डिलीट करने के लिए सही पिन (982026) दर्ज करें।' });
    }

    const deleted = dataStore.deleteCustomer(req.params.id);
    res.json({ success: true, message: 'खाता सफलतापूर्वक डिलीट किया गया', deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Daily Report (Totals, Cash Income & Transactions by date)
app.get('/api/daily-report', (req, res) => {
  try {
    const { date } = req.query;
    const report = dataStore.getDailyReport(date);
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Transactions (Deposit / Withdrawal)
app.get('/api/transactions', (req, res) => {
  const { date, type, search } = req.query;
  const list = dataStore.getTransactions({ date, type, search });
  res.json(list);
});

app.post('/api/transactions', (req, res) => {
  try {
    const {
      customerId,
      type,
      category,
      quantityKg,
      oilLitre,
      khaliKg,
      grindingFeeMode,
      grindingFeeAmount,
      note,
      date,
      operator,
      pin
    } = req.body;

    const providedPin = pin || req.headers['x-admin-pin'];
    if (providedPin !== MASTER_PIN) {
      return res.status(403).json({ error: 'अमान्य सुरक्षा पिन! जमा या निकासी दर्ज करने के लिए सही पिन (982026) दर्ज करें।' });
    }

    if (!customerId || !type || !category) {
      return res.status(400).json({ error: 'अधूरी जानकारी (Missing customerId, type, or category)' });
    }

    const result = dataStore.addTransaction({
      customerId,
      type,
      category,
      quantityKg,
      oilLitre,
      khaliKg,
      grindingFeeMode,
      grindingFeeAmount,
      note,
      date,
      operator
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Products & E-Commerce
app.get('/api/products', (req, res) => {
  res.json(dataStore.getProducts());
});

app.post('/api/orders', (req, res) => {
  try {
    const order = dataStore.createOrder(req.body);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders', (req, res) => {
  res.json(dataStore.getOrders());
});

app.patch('/api/orders/:id', (req, res) => {
  const { status } = req.body;
  const order = dataStore.updateOrderStatus(req.params.id, status);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// Counter Sales (POS)
app.get('/api/counter-sales', (req, res) => {
  res.json(dataStore.getCounterSales());
});

app.post('/api/counter-sales', (req, res) => {
  try {
    const sale = dataStore.addCounterSale(req.body);
    res.status(201).json(sale);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mill Stock & Dashboard
app.get('/api/stock', (req, res) => {
  res.json(dataStore.getMillStock());
});

app.get('/api/dashboard', (req, res) => {
  res.json(dataStore.getDashboardStats());
});

// Farmer Passbook Lookup (Requires Serial No. in UPPERCASE e.g. SN404, and Security PIN)
app.all(['/api/lookup/:query', '/api/lookup'], (req, res) => {
  const queryParam = req.params?.query;
  const body = req.body || {};
  const rawId = queryParam || body.serialNo || body.query || req.query.serialNo || '';
  const id = rawId.trim().toUpperCase();
  const pin = (body.pin || req.query.pin || req.headers['x-access-pin'] || '').trim();

  if (!id) {
    return res.status(400).json({ error: 'कृपया किसान सीरियल नंबर (उदा. SN404) दर्ज करें।' });
  }

  const customer = dataStore.getCustomerById(id);
  if (!customer) {
    return res.status(404).json({ error: `सीरियल नंबर "${id}" से कोई किसान खाता नहीं मिला।` });
  }

  if (!pin) {
    return res.status(401).json({ error: 'सुरक्षा पिन दर्ज करना अनिवार्य है।' });
  }

  const validPins = [
    MASTER_PIN,
    customer.pin,
    customer.phone ? customer.phone.slice(-4) : null,
    '982026'
  ].filter(Boolean);

  if (!validPins.includes(pin)) {
    return res.status(403).json({ error: 'अमान्य सुरक्षा पिन! कृपया सही पिन दर्ज करें।' });
  }

  // Return sanitized customer data for passbook display
  res.json({
    id: customer.id,
    name: customer.name,
    nameHi: customer.nameHi,
    village: customer.village,
    villageHi: customer.villageHi,
    location: customer.location,
    phone: customer.phone ? customer.phone.replace(/(\d{2})\d{4}(\d{4})/, '$1****$2') : '',
    balances: customer.balances,
    recentTransactions: customer.transactions.slice(0, 10)
  });
});

// Serve frontend static assets in production/unified mode
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

app.listen(PORT, () => {
  console.log(`🌾 Rama Flour & Oil Mill API Server running on port ${PORT}`);
});
