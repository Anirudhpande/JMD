import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import helmet from 'helmet';
import { db } from './db.js';
import { emails } from './emails.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable secure HTTP headers
app.use(helmet());

// Configure CORS policy dynamically
const allowedOrigins = [
  process.env.SITE_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'https://jmd-beryl.vercel.app',
  'https://jmd-production.up.railway.app',
  'https://jmdglobalstones.co.uk',
  'https://www.jmdglobalstones.co.uk'
];

app.use(cors({
  origin: (origin, callback) => {
    // In non-production, allow requests with no origin (like mobile apps, curl, postman) or matching allowed origins
    if (!origin || process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  }
}));

// Stripe client initialization
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// 1. Stripe Webhook Endpoint (MUST be configured BEFORE global express.json() middleware)
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  if (stripe && sig && process.env.STRIPE_WEBHOOK_SECRET) {
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  } else {
    if (process.env.NODE_ENV === 'production') {
      console.error('[SECURITY ERROR] Stripe webhook signature missing or secret unconfigured in production.');
      return res.status(400).send('Webhook Error: Webhook signature verification required in production.');
    }
    // Fallback mock webhook trigger for testing in development/staging
    console.log('[MOCK WEBHOOK] Bypassing Stripe signature verification.');
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : req.body;
    event = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
  }

  // Handle successful payments
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;
    console.log(`Payment confirmed for Order ID: ${orderId}`);
    
    try {
      const order = await db.getOrderById(orderId);
      if (order) {
        order.payment_status = 'paid';
        order.status = 'processing';
        await db.updateOrderStatus(orderId, 'processing');
        
        // Dispatch emails
        await emails.sendOrderConfirmation(order);
        await emails.sendAdminNewOrderAlert(order);
      }
    } catch (error) {
      console.error(`Error updating order #${orderId} on payment success:`, error);
    }
  }

  res.json({ received: true });
});

// Global JSON body parser middleware for all subsequent routes
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// AUTH & PROFILES ENDPOINTS
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.authenticateUser(email, password);
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, phone, role } = req.body;
  try {
    const user = await db.registerUser({ email, password, name, phone, role });
    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/profiles/upsert', async (req, res) => {
  const { id, email, name, phone, role } = req.body;
  try {
    const profile = await db.updateProfile(id, { email, name, phone, role: role || 'customer' });
    res.json(profile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/profiles/:userId', async (req, res) => {
  try {
    const profile = await db.getProfile(req.params.userId);
    if (profile) {
      res.json(profile);
    } else {
      res.status(404).json({ message: 'Profile not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PRODUCTS ENDPOINTS
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/products/:slug', async (req, res) => {
  try {
    const product = await db.getProductBySlug(req.params.slug);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/variant-groups/:id', async (req, res) => {
  try {
    const related = await db.getProductsByVariantGroup(req.params.id);
    res.json(related);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = await db.addProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await db.updateProduct(req.params.id, req.body);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const deleted = await db.deleteProduct(req.params.id);
    if (deleted) {
      res.json({ message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ORDERS ENDPOINTS
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await db.getOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/orders/track', async (req, res) => {
  const { orderId, email } = req.query;
  try {
    const order = await db.getOrderById(orderId);
    if (order && order.customer_details.email.toLowerCase() === email.toLowerCase()) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'No order found with those details' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await db.getOrderById(req.params.id);
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    
    // Recalculate totals server-side for safety
    const subtotal = orderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const vat = subtotal * 0.20;
    const shipping = orderData.shipping;
    const total = subtotal + vat + shipping;
    
    const verifiedOrder = {
      ...orderData,
      subtotal,
      vat,
      total,
      payment_status: orderData.payment_method === 'stripe' ? 'pending' : 'unpaid'
    };

    const order = await db.createOrder(verifiedOrder);

    // If Bank Transfer, send confirmation emails immediately
    if (order.payment_method === 'bank_transfer') {
      await emails.sendOrderConfirmation(order);
      await emails.sendAdminNewOrderAlert(order);
    }

    // Trigger low stock alerts
    const products = await db.getProducts();
    for (const item of order.items) {
      const prod = products.find(p => p.id === item.product_id);
      if (prod && prod.stock <= 5) {
        await emails.sendAdminLowStockAlert(prod);
      }
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  const { status } = req.body;
  try {
    const order = await db.updateOrderStatus(req.params.id, status);
    if (order) {
      // Trigger status update email on Dispatch
      if (status === 'dispatched') {
        await emails.sendOrderDispatchedEmail(order);
      }
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PAYMENTS ENDPOINTS
app.post('/api/payments/create-intent', async (req, res) => {
  const { amount, orderId } = req.body;
  try {
    if (stripe) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount),
        currency: 'gbp',
        metadata: { orderId }
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } else {
      console.log(`[MOCK PAYMENT] Simulating clientSecret for Order #${orderId}`);
      res.json({ clientSecret: `pi_mock_secret_${orderId}_${Date.now()}` });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// REVIEWS ENDPOINTS
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await db.getReviews();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const review = await db.addReview(req.body);
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/reviews/:id/approve', async (req, res) => {
  try {
    const review = await db.approveReview(req.params.id);
    if (review) {
      res.json(review);
    } else {
      res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/reviews/:id', async (req, res) => {
  try {
    const deleted = await db.deleteReview(req.params.id);
    if (deleted) {
      res.json({ message: 'Review deleted successfully' });
    } else {
      res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// SHIPPING ZONES ENDPOINTS
app.get('/api/shipping-zones', async (req, res) => {
  try {
    const zones = await db.getShippingZones();
    res.json(zones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/shipping-zones/:id', async (req, res) => {
  try {
    const zone = await db.updateShippingZone(req.params.id, req.body.rate);
    if (zone) {
      res.json(zone);
    } else {
      res.status(404).json({ message: 'Zone not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// SITE SETTINGS ENDPOINTS
app.get('/api/site-settings', async (req, res) => {
  try {
    const settings = await db.getSiteSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/site-settings/:key', async (req, res) => {
  try {
    const setting = await db.updateSiteSetting(req.params.key, req.body.value);
    res.json(setting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// SEO & WEB SERVICE GENERATORS
app.get('/sitemap.xml', async (req, res) => {
  try {
    const products = await db.getProducts();
    const siteUrl = process.env.SITE_URL || 'https://jmdglobalstones.co.uk';
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    const pages = ['', '/products', '/delivery', '/care', '/contact', '/track'];
    pages.forEach(p => {
      sitemap += `  <url>\n    <loc>${siteUrl}${p}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${p === '' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
    });
    
    products.forEach(p => {
      sitemap += `  <url>\n    <loc>${siteUrl}/products/${p.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });
    
    sitemap += `</urlset>`;
    
    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    res.status(500).send('Error generating sitemap');
  }
});

app.get('/robots.txt', (req, res) => {
  const siteUrl = process.env.SITE_URL || 'https://jmdglobalstones.co.uk';
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml`);
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`JMD Global Stones API Server running on port ${PORT}`);
});
