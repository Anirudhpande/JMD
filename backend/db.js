import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase REST client (optional fallback)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
let supabase = null;
const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_KEY);

if (isSupabaseConfigured) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Supabase client initialized.');
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
  }
}

// PostgreSQL Client Pool (primary backend database layer)
const DATABASE_URL = process.env.DATABASE_URL;
let pool = null;
const isPostgresConfigured = !!DATABASE_URL;

if (isPostgresConfigured) {
  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('supabase.co') ? { rejectUnauthorized: false } : false
  });
  
  // Test connection and configure tables
  pool.connect()
    .then(async (client) => {
      console.log('✅ Successfully connected to Supabase PostgreSQL Database.');
      try {
        await initializePostgresSchema(client);
      } catch (err) {
        console.error('❌ Failed to initialize PostgreSQL schemas:', err);
      } finally {
        client.release();
      }
    })
    .catch(err => {
      console.error('❌ Failed to connect to PostgreSQL database. Operating in local fallback:', err.message);
      pool = null;
    });
}

// Local JSON Database Fallback
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function initializeLocalDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      products: [],
      orders: [],
      reviews: [
        {
          id: 'rev-1',
          product_slug: 'autumn-brown-indian-sandstone-paving-slabs',
          user_name: 'David L. from Wirral',
          rating: 5,
          comment: 'Outstanding quality sandstone. Delivered exactly when requested, and the color variations are stunning. Highly recommend JMD!',
          is_approved: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'rev-2',
          product_slug: 'county-anthracite-porcelain-paving-slabs',
          user_name: 'Sarah M. from Southampton',
          rating: 5,
          comment: 'Extremely premium look! The porcelain paving has a beautiful anti-slip texture and looks perfect on our modern patio.',
          is_approved: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'rev-3',
          product_slug: 'kota-black-limestone',
          user_name: 'James K. from Chester',
          rating: 4,
          comment: 'Very pleased with the black limestone. Be sure to seal it to retain that rich dark color. Great customer service from Roopesh.',
          is_approved: true,
          created_at: new Date().toISOString()
        }
      ],
      users: [
        {
          id: 'user-admin',
          email: 'admin@jmdglobalstones.co.uk',
          password: 'admin123',
          role: 'admin',
          name: 'Roopesh Kapur (Director)',
          phone: '07458148586',
          created_at: new Date().toISOString()
        },
        {
          id: 'user-customer',
          email: 'customer@jmdglobalstones.co.uk',
          password: 'customer123',
          role: 'customer',
          name: 'John Doe',
          phone: '07890123456',
          created_at: new Date().toISOString()
        }
      ]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

initializeLocalDb();

function readLocalDb() {
  initializeLocalDb();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading local JSON db, resetting data.', error);
    return { products: [], orders: [], reviews: [], users: [] };
  }
}

function writeLocalDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to local JSON db', error);
  }
}

// PostgreSQL Table Initializer and Seeder
async function initializePostgresSchema(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      phone TEXT,
      role TEXT DEFAULT 'customer',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      name TEXT,
      email TEXT,
      phone TEXT,
      role TEXT DEFAULT 'customer',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category TEXT,
      description TEXT,
      price NUMERIC NOT NULL,
      stock INTEGER DEFAULT 0,
      size TEXT,
      images JSONB,
      is_featured BOOLEAN DEFAULT false,
      stars NUMERIC DEFAULT 5,
      seo_title TEXT,
      seo_description TEXT,
      variant_group_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      customer_details JSONB,
      shipping_address JSONB,
      items JSONB,
      subtotal NUMERIC,
      vat NUMERIC,
      shipping NUMERIC,
      total NUMERIC,
      payment_method TEXT,
      payment_status TEXT,
      status TEXT,
      review_email_sent BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Add review_email_sent column if it doesn't exist (migration for existing tables)
  try {
    await client.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS review_email_sent BOOLEAN DEFAULT false`);
  } catch (e) { /* column may already exist */ }

  await client.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      product_slug TEXT,
      user_name TEXT,
      rating INTEGER,
      comment TEXT,
      is_approved BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS shipping_zones (
      id INTEGER PRIMARY KEY,
      zone_name TEXT,
      rate NUMERIC
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value JSONB
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      description TEXT NOT NULL,
      user_name TEXT,
      user_email TEXT,
      meta JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS abandoned_carts (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_email TEXT NOT NULL,
      user_name TEXT,
      cart_items JSONB NOT NULL,
      cart_total NUMERIC,
      email_sent BOOLEAN DEFAULT false,
      last_updated TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  const productCountRes = await client.query('SELECT COUNT(*) FROM products');
  const productCount = parseInt(productCountRes.rows[0].count);
  
  if (productCount === 0) {
    if (process.env.NODE_ENV === 'production') {
      console.log('PostgreSQL database is empty, but seeding is disabled in production.');
    } else {
      console.log('PostgreSQL database is empty. Seeding JMD Global Stones records...');
      const seedData = readLocalDb();
    
    // 1. Seed users & profiles
    for (const u of seedData.users || []) {
      await client.query(
        'INSERT INTO users (id, email, password, name, phone, role, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING',
        [u.id, u.email, u.password, u.name, u.phone, u.role, u.created_at]
      );
      await client.query(
        'INSERT INTO profiles (id, name, email, phone, role, created_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
        [u.id, u.name, u.email, u.phone, u.role, u.created_at]
      );
    }

    // 2. Seed products
    for (const p of seedData.products || []) {
      await client.query(
        'INSERT INTO products (id, name, slug, category, description, price, stock, size, images, is_featured, stars, seo_title, seo_description, variant_group_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) ON CONFLICT DO NOTHING',
        [p.id, p.name, p.slug, p.category, p.description, p.price, p.stock, p.size, JSON.stringify(p.images), p.is_featured, p.stars, p.seo_title, p.seo_description, p.variant_group_id, p.created_at]
      );
    }

    // 3. Seed reviews
    for (const r of seedData.reviews || []) {
      await client.query(
        'INSERT INTO reviews (id, product_slug, user_name, rating, comment, is_approved, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING',
        [r.id, r.product_slug, r.user_name, r.rating, r.comment, r.is_approved, r.created_at]
      );
    }

    // 4. Seed default shipping zones
    const rates = [68.00, 68.00, 85.00, 95.00, 120.00, 160.00, 180.00, 200.00];
    const defaultZones = Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      zone_name: `UK Zone ${i + 1}`,
      rate: rates[i]
    }));
    for (const z of defaultZones) {
      await client.query(
        'INSERT INTO shipping_zones (id, zone_name, rate) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [z.id, z.zone_name, z.rate]
      );
    }

    // 5. Seed default settings
    const defaultSettings = {
      logo_url: "",
      whatsapp_number: "447458148586",
      maintenance_mode: false,
      home_hero_headline: "Enduring Stone.",
      home_hero_subheadline: "Architectural Form.",
      home_hero_text: "We source raw architectural stone slabs directly from quarry beds, supplying calibrated Sandstone, Slate, Limestone, and Vitrified Porcelain flags. Crafted to weather gracefully for generations.",
      trust_bar: [
        "£49 Flat Rate UK Delivery",
        "Direct Imported Best Quality",
        "Ready for Fast Dispatch",
        "Yard Managers on Call"
      ],
      why_choose_us: "We treat our stone as a luxury architectural material. Direct import pricing, strict thickness calibrations, and nationwide lorry delivery make us the trusted partner for landscape designers across the UK.",
      footer: {
        contact_phone: "07458148586 (Roopesh Kapur)",
        contact_email: "sales@jmdglobalstones.co.uk",
        company_no: "12807959",
        vat_no: "GB 358688337",
        wirral_hq: "Twelve Quays House, Egerton Wharf, CH41 1LD",
        southampton_yard: "Yard 2, Eling Wharf, SO40 4TE"
      },
      delivery_guide: "Standard stone paving deliveries are kerbside-only and require heavy goods vehicle (HGV) clearance. Please read our guidelines thoroughly before ordering.",
      care_guide: {
        sandstone: "SBR slurry priming is required on the back of each slab before placing onto the 4:1 wet mortar bed.",
        porcelain: "Full porcelain priming slurry is mandatory. Use 3-5mm spacers for outdoor grouting.",
        limestone: "Prime the underside with SBR. Never use acid-based cleaners on limestone.",
        slate: "Back prime with SBR and lay on a continuous mortar bed for structural support."
      }
    };
    for (const [key, value] of Object.entries(defaultSettings)) {
      await client.query(
        'INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [key, JSON.stringify(value)]
      );
    }

    console.log('🎉 Seeding successfully finalized in PostgreSQL.');
    }
  }
}

function formatProduct(row) {
  if (!row) return null;
  const images = typeof row.images === 'string' ? JSON.parse(row.images) : row.images;
  return {
    ...row,
    price: parseFloat(row.price),
    stock: parseInt(row.stock),
    stars: parseFloat(row.stars),
    images: Array.isArray(images) ? images : [],
    variants: [
      {
        size: row.size || "Single Size",
        price: parseFloat(row.price),
        stock: parseInt(row.stock)
      }
    ]
  };
}

// Unified Database API
export const db = {
  // PRODUCTS
  async getProducts() {
    if (pool) {
      const res = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
      return res.rows.map(formatProduct);
    }
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('products').select('*');
      if (!error) return data.map(formatProduct);
    }
    return (readLocalDb().products || []).map(formatProduct);
  },

  async getProductBySlug(slug) {
    if (pool) {
      const res = await pool.query('SELECT * FROM products WHERE slug = $1', [slug]);
      if (res.rows.length > 0) {
        return formatProduct(res.rows[0]);
      }
      return null;
    }
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('products').select('*').eq('slug', slug).single();
      if (!error) return formatProduct(data);
    }
    const found = (readLocalDb().products || []).find(p => p.slug === slug);
    return found ? formatProduct(found) : null;
  },

  async getProductsByVariantGroup(variantGroupId) {
    if (!variantGroupId) return [];
    if (pool) {
      const res = await pool.query('SELECT * FROM products WHERE variant_group_id = $1', [variantGroupId]);
      return res.rows.map(formatProduct);
    }
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('products').select('*').eq('variant_group_id', variantGroupId);
      if (!error) return data.map(formatProduct);
    }
    return (readLocalDb().products || [])
      .filter(p => p.variant_group_id === variantGroupId)
      .map(formatProduct);
  },

  async saveProducts(productsList) {
    if (pool) {
      for (const p of productsList) {
        await pool.query(
          `INSERT INTO products (id, name, slug, category, description, price, stock, size, images, is_featured, stars, seo_title, seo_description, variant_group_id, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
           ON CONFLICT (slug) DO UPDATE SET
             name = EXCLUDED.name,
             category = EXCLUDED.category,
             description = EXCLUDED.description,
             price = EXCLUDED.price,
             stock = EXCLUDED.stock,
             size = EXCLUDED.size,
             images = EXCLUDED.images,
             is_featured = EXCLUDED.is_featured,
             stars = EXCLUDED.stars,
             variant_group_id = EXCLUDED.variant_group_id`,
          [
            p.id,
            p.name,
            p.slug,
            p.category,
            p.description,
            p.price,
            p.stock,
            p.size,
            JSON.stringify(p.images),
            p.is_featured,
            p.stars,
            p.seo_title === undefined ? null : p.seo_title,
            p.seo_description === undefined ? null : p.seo_description,
            p.variant_group_id === undefined ? null : p.variant_group_id,
            p.created_at || new Date().toISOString()
          ]
        );
      }
      return true;
    }
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('products').upsert(productsList, { onConflict: 'slug' });
      if (!error) return true;
    }
    const store = readLocalDb();
    store.products = productsList;
    writeLocalDb(store);
    return true;
  },

  async addProduct(product) {
    const newProduct = {
      ...product,
      id: product.id || `prod-${Date.now()}`,
      seo_title: product.seo_title === undefined ? null : product.seo_title,
      seo_description: product.seo_description === undefined ? null : product.seo_description,
      variant_group_id: product.variant_group_id === undefined ? null : product.variant_group_id,
      created_at: new Date().toISOString()
    };

    if (pool) {
      await pool.query(
        `INSERT INTO products (id, name, slug, category, description, price, stock, size, images, is_featured, stars, seo_title, seo_description, variant_group_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          newProduct.id,
          newProduct.name,
          newProduct.slug,
          newProduct.category,
          newProduct.description,
          newProduct.price,
          newProduct.stock,
          newProduct.size,
          JSON.stringify(newProduct.images),
          newProduct.is_featured,
          newProduct.stars,
          newProduct.seo_title,
          newProduct.seo_description,
          newProduct.variant_group_id,
          newProduct.created_at
        ]
      );
      return formatProduct(newProduct);
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('products').insert([newProduct]).select().single();
      if (!error) return formatProduct(data);
    }

    const store = readLocalDb();
    if (!store.products) store.products = [];
    store.products.push(newProduct);
    writeLocalDb(store);
    return formatProduct(newProduct);
  },

  async updateProduct(id, updatedFields) {
    if (pool) {
      const keys = Object.keys(updatedFields);
      const setClause = keys.map((key, i) => `"${key}" = $${i + 2}`).join(', ');
      const values = keys.map(key => key === 'images' ? JSON.stringify(updatedFields[key]) : (updatedFields[key] === undefined ? null : updatedFields[key]));
      const res = await pool.query(
        `UPDATE products SET ${setClause} WHERE id = $1 RETURNING *`,
        [id, ...values]
      );
      if (res.rows.length > 0) {
        return formatProduct(res.rows[0]);
      }
      return null;
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('products').update(updatedFields).eq('id', id).select().single();
      if (!error) return formatProduct(data);
    }

    const store = readLocalDb();
    const index = store.products.findIndex(p => p.id === id);
    if (index !== -1) {
      store.products[index] = { ...store.products[index], ...updatedFields };
      writeLocalDb(store);
      return formatProduct(store.products[index]);
    }
    return null;
  },

  async deleteProduct(id) {
    if (pool) {
      const res = await pool.query('DELETE FROM products WHERE id = $1', [id]);
      return res.rowCount > 0;
    }
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) return true;
    }

    const store = readLocalDb();
    const initialLength = store.products.length;
    store.products = store.products.filter(p => p.id !== id);
    writeLocalDb(store);
    return store.products.length < initialLength;
  },

  // ORDERS
  async getOrders() {
    if (pool) {
      const res = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
      return res.rows.map(row => ({
        ...row,
        subtotal: parseFloat(row.subtotal),
        vat: parseFloat(row.vat),
        shipping: parseFloat(row.shipping),
        total: parseFloat(row.total),
        customer_details: typeof row.customer_details === 'string' ? JSON.parse(row.customer_details) : row.customer_details,
        shipping_address: typeof row.shipping_address === 'string' ? JSON.parse(row.shipping_address) : row.shipping_address,
        items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items
      }));
    }
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (!error) return data;
    }
    return (readLocalDb().orders || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async getOrderById(id) {
    if (pool) {
      const res = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          ...row,
          subtotal: parseFloat(row.subtotal),
          vat: parseFloat(row.vat),
          shipping: parseFloat(row.shipping),
          total: parseFloat(row.total),
          customer_details: typeof row.customer_details === 'string' ? JSON.parse(row.customer_details) : row.customer_details,
          shipping_address: typeof row.shipping_address === 'string' ? JSON.parse(row.shipping_address) : row.shipping_address,
          items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items
        };
      }
      return null;
    }
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
      if (!error) return data;
    }
    return (readLocalDb().orders || []).find(o => o.id === id) || null;
  },

  async createOrder(orderData) {
    let nextId = orderData.id;
    
    if (!nextId) {
      if (pool) {
        try {
          const idRes = await pool.query('SELECT id FROM orders');
          const numericIds = idRes.rows
            .map(row => parseInt(row.id, 10))
            .filter(id => !isNaN(id) && id >= 100475);
          const nextIdNum = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 100476;
          nextId = nextIdNum.toString();
        } catch (err) {
          console.error('Error fetching sequential ID, falling back to random:', err);
          nextId = `ord-${Math.floor(100000 + Math.random() * 900000)}`;
        }
      } else if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.from('orders').select('id');
          if (!error && data) {
            const numericIds = data
              .map(row => parseInt(row.id, 10))
              .filter(id => !isNaN(id) && id >= 100475);
            const nextIdNum = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 100476;
            nextId = nextIdNum.toString();
          } else {
            nextId = `ord-${Math.floor(100000 + Math.random() * 900000)}`;
          }
        } catch (err) {
          nextId = `ord-${Math.floor(100000 + Math.random() * 900000)}`;
        }
      } else {
        const store = readLocalDb();
        const ordersList = store.orders || [];
        const numericIds = ordersList
          .map(o => parseInt(o.id, 10))
          .filter(id => !isNaN(id) && id >= 100475);
        const nextIdNum = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 100476;
        nextId = nextIdNum.toString();
      }
    }

    const newOrder = {
      ...orderData,
      id: nextId,
      status: orderData.status || 'pending',
      created_at: new Date().toISOString()
    };

    if (pool) {
      if (newOrder.items && Array.isArray(newOrder.items)) {
        for (const item of newOrder.items) {
          await pool.query(
            'UPDATE products SET stock = GREATEST(0, stock - $1) WHERE id = $2 OR slug = $3',
            [item.quantity || 1, item.product_id, item.product_slug]
          );
        }
      }

      await pool.query(
        `INSERT INTO orders (id, user_id, customer_details, shipping_address, items, subtotal, vat, shipping, total, payment_method, payment_status, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          newOrder.id,
          newOrder.user_id,
          JSON.stringify(newOrder.customer_details),
          JSON.stringify(newOrder.shipping_address || null),
          JSON.stringify(newOrder.items),
          newOrder.subtotal,
          newOrder.vat,
          newOrder.shipping,
          newOrder.total,
          newOrder.payment_method,
          newOrder.payment_status,
          newOrder.status,
          newOrder.created_at
        ]
      );
      
      // Auto-increment the site settings starting number to sync with admin panel!
      try {
        const nextNum = parseInt(nextId, 10);
        if (!isNaN(nextNum)) {
          await this.updateSiteSetting('invoice_starting_number', nextNum);
        }
      } catch (err) {
        console.error('Failed to auto-increment setting:', err);
      }

      return newOrder;
    }

    const store = readLocalDb();
    const updatedProducts = [...(store.products || [])];

    if (newOrder.items && Array.isArray(newOrder.items)) {
      for (const item of newOrder.items) {
        const prod = updatedProducts.find(p => p.id === item.product_id || p.slug === item.product_slug);
        if (prod) {
          prod.stock = Math.max(0, (prod.stock || 0) - (item.quantity || 1));
        }
      }
    }

    store.products = updatedProducts;
    if (!store.orders) store.orders = [];
    store.orders.push(newOrder);

    // Auto-increment local settings starting number to sync with admin panel!
    try {
      const nextNum = parseInt(nextId, 10);
      if (!isNaN(nextNum)) {
        if (!store.site_settings) store.site_settings = {};
        store.site_settings.invoice_starting_number = nextNum;
      }
    } catch (err) {}

    writeLocalDb(store);

    if (isSupabaseConfigured) {
      try {
        await this.saveProducts(updatedProducts);
        await supabase.from('orders').insert([newOrder]);
        // Auto-increment Supabase settings starting number!
        const nextNum = parseInt(nextId, 10);
        if (!isNaN(nextNum)) {
          await supabase.from('site_settings').upsert({ key: 'invoice_starting_number', value: nextNum });
        }
      } catch (err) {
        console.error('Supabase sync order error:', err);
      }
    }

    return newOrder;
  },

  async updateOrderStatus(id, status) {
    if (pool) {
      const res = await pool.query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          ...row,
          subtotal: parseFloat(row.subtotal),
          vat: parseFloat(row.vat),
          shipping: parseFloat(row.shipping),
          total: parseFloat(row.total),
          customer_details: typeof row.customer_details === 'string' ? JSON.parse(row.customer_details) : row.customer_details,
          shipping_address: typeof row.shipping_address === 'string' ? JSON.parse(row.shipping_address) : row.shipping_address,
          items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items
        };
      }
      return null;
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single();
      if (!error) return data;
    }

    const store = readLocalDb();
    const index = store.orders.findIndex(o => o.id === id);
    if (index !== -1) {
      store.orders[index].status = status;
      writeLocalDb(store);
      return store.orders[index];
    }
    return null;
  },

  // REVIEWS
  async getReviews() {
    if (pool) {
      const res = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC');
      return res.rows.map(row => ({
        ...row,
        rating: parseInt(row.rating),
        is_approved: !!row.is_approved
      }));
    }
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('reviews').select('*');
      if (!error) return data;
    }
    return readLocalDb().reviews || [];
  },

  async addReview(review) {
    const newReview = {
      ...review,
      id: `rev-${Date.now()}`,
      is_approved: false,
      created_at: new Date().toISOString()
    };

    if (pool) {
      await pool.query(
        'INSERT INTO reviews (id, product_slug, user_name, rating, comment, is_approved, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [newReview.id, newReview.product_slug, newReview.user_name, newReview.rating, newReview.comment, newReview.is_approved, newReview.created_at]
      );
      return newReview;
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('reviews').insert([newReview]).select().single();
      if (!error) return data;
    }

    const store = readLocalDb();
    if (!store.reviews) store.reviews = [];
    store.reviews.push(newReview);
    writeLocalDb(store);
    return newReview;
  },

  async approveReview(id) {
    if (pool) {
      const res = await pool.query('UPDATE reviews SET is_approved = true WHERE id = $1 RETURNING *', [id]);
      if (res.rows.length > 0) {
        return {
          ...res.rows[0],
          is_approved: true
        };
      }
      return null;
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('reviews').update({ is_approved: true }).eq('id', id).select().single();
      if (!error) return data;
    }

    const store = readLocalDb();
    const index = store.reviews.findIndex(r => r.id === id);
    if (index !== -1) {
      store.reviews[index].is_approved = true;
      writeLocalDb(store);
      return store.reviews[index];
    }
    return null;
  },

  async deleteReview(id) {
    if (pool) {
      const res = await pool.query('DELETE FROM reviews WHERE id = $1', [id]);
      return res.rowCount > 0;
    }
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (!error) return true;
    }

    const store = readLocalDb();
    const initialLength = store.reviews.length;
    store.reviews = store.reviews.filter(r => r.id !== id);
    writeLocalDb(store);
    return store.reviews.length < initialLength;
  },

  // SHIPPING ZONES
  async getShippingZones() {
    if (pool) {
      const res = await pool.query('SELECT * FROM shipping_zones ORDER BY id ASC');
      return res.rows.map(row => ({
        ...row,
        rate: parseFloat(row.rate)
      }));
    }
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('shipping_zones').select('*').order('id', { ascending: true });
      if (!error) return data;
    }
    const store = readLocalDb();
    if (!store.shipping_zones || store.shipping_zones.length === 0) {
      const rates = [68.00, 68.00, 85.00, 95.00, 120.00, 160.00, 180.00, 200.00];
      store.shipping_zones = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        zone_name: `UK Zone ${i + 1}`,
        rate: rates[i]
      }));
      writeLocalDb(store);
    }
    return store.shipping_zones;
  },

  async updateShippingZone(id, rate) {
    const parsedRate = parseFloat(rate) || 0;
    if (pool) {
      const res = await pool.query('UPDATE shipping_zones SET rate = $1 WHERE id = $2 RETURNING *', [parsedRate, parseInt(id)]);
      if (res.rows.length > 0) {
        return {
          ...res.rows[0],
          rate: parseFloat(res.rows[0].rate)
        };
      }
      return null;
    }
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('shipping_zones').update({ rate: parsedRate }).eq('id', id).select().single();
      if (!error) return data;
    }
    const store = readLocalDb();
    const idx = store.shipping_zones.findIndex(z => z.id === parseInt(id));
    if (idx !== -1) {
      store.shipping_zones[idx].rate = parsedRate;
      writeLocalDb(store);
      return store.shipping_zones[idx];
    }
    return null;
  },

  // SITE SETTINGS
  async getSiteSettings() {
    if (pool) {
      const res = await pool.query('SELECT * FROM site_settings');
      const settings = {};
      res.rows.forEach(row => {
        let val = row.value;
        if (typeof val === 'string') {
          try {
            val = JSON.parse(val);
          } catch (e) {
            // Keep as plain string if it fails to parse as JSON
          }
        }
        settings[row.key] = val;
      });
      return settings;
    }
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('site_settings').select('*');
      if (!error) {
        const settings = {};
        data.forEach(item => { settings[item.key] = item.value; });
        return settings;
      }
    }
    const store = readLocalDb();
    return store.site_settings;
  },

  async updateSiteSetting(key, value) {
    if (pool) {
      await pool.query(
        'INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
        [key, JSON.stringify(value)]
      );
      return { key, value };
    }
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('site_settings').upsert({ key, value }).select().single();
      if (!error) return data;
    }
    const store = readLocalDb();
    if (!store.site_settings) store.site_settings = {};
    store.site_settings[key] = value;
    writeLocalDb(store);
    return { key, value };
  },

  // PROFILES
  async getProfile(userId) {
    if (pool) {
      const res = await pool.query('SELECT * FROM profiles WHERE id = $1', [userId]);
      if (res.rows.length > 0) {
        return res.rows[0];
      }
      return null;
    }
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (!error) return data;
    }
    const store = readLocalDb();
    if (!store.profiles) store.profiles = [];
    return store.profiles.find(p => p.id === userId) || null;
  },

  async updateProfile(userId, fields) {
    if (pool) {
      const keys = Object.keys(fields);
      const setClause = keys.map((key, i) => `"${key}" = $${i + 2}`).join(', ');
      const values = keys.map(key => fields[key]);
      const res = await pool.query(
        `UPDATE profiles SET ${setClause} WHERE id = $1 RETURNING *`,
        [userId, ...values]
      );
      if (res.rows.length > 0) {
        return res.rows[0];
      }
      return null;
    }
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('profiles').update(fields).eq('id', userId).select().single();
      if (!error) return data;
    }
    const store = readLocalDb();
    if (!store.profiles) store.profiles = [];
    const idx = store.profiles.findIndex(p => p.id === userId);
    if (idx !== -1) {
      store.profiles[idx] = { ...store.profiles[idx], ...fields };
      writeLocalDb(store);
      return store.profiles[idx];
    }
    return null;
  },

  // AUTH
  async authenticateUser(email, password) {
    if (pool) {
      const res = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
      if (res.rows.length > 0) {
        const { password: _, ...safeUser } = res.rows[0];
        return safeUser;
      }
      return null;
    }
    const store = readLocalDb();
    const user = (store.users || []).find(u => u.email === email && u.password === password);
    if (user) {
      const { password: _, ...safeUser } = user;
      return safeUser;
    }
    return null;
  },

  async registerUser(userData) {
    if (pool) {
      const checkRes = await pool.query('SELECT id FROM users WHERE email = $1', [userData.email]);
      if (checkRes.rows.length > 0) {
        throw new Error('Email already registered');
      }

      const newUser = {
        id: `user-${Date.now()}`,
        email: userData.email,
        password: userData.password,
        role: userData.role || 'customer',
        name: userData.name || '',
        phone: userData.phone || '',
        created_at: new Date().toISOString()
      };

      await pool.query(
        'INSERT INTO users (id, email, password, name, phone, role, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [newUser.id, newUser.email, newUser.password, newUser.name, newUser.phone, newUser.role, newUser.created_at]
      );

      await pool.query(
        'INSERT INTO profiles (id, name, email, phone, role, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [newUser.id, newUser.name, newUser.email, newUser.phone, newUser.role, newUser.created_at]
      );

      const { password: _, ...safeUser } = newUser;
      return safeUser;
    }

    const store = readLocalDb();
    if (!store.users) store.users = [];
    if (store.users.some(u => u.email === userData.email)) {
      throw new Error('Email already registered');
    }

    const newUser = {
      id: `user-${Date.now()}`,
      email: userData.email,
      password: userData.password,
      role: userData.role || 'customer',
      name: userData.name || '',
      phone: userData.phone || '',
      created_at: new Date().toISOString()
    };

    store.users.push(newUser);
    
    if (!store.profiles) store.profiles = [];
    store.profiles.push({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      created_at: newUser.created_at
    });

    writeLocalDb(store);
    const { password: _, ...safeUser } = newUser;
    return safeUser;
  },
  async logActivity({ event_type, description, user_name = null, user_email = null, meta = null }) {
    const id = `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const created_at = new Date().toISOString();
    if (pool) {
      try {
        await pool.query(
          'INSERT INTO activity_logs (id, event_type, description, user_name, user_email, meta, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [id, event_type, description, user_name, user_email, meta ? JSON.stringify(meta) : null, created_at]
        );
      } catch (err) {
        console.error('Failed to write activity log:', err.message);
      }
      return;
    }
    // Local fallback
    try {
      const store = readLocalDb();
      if (!store.activity_logs) store.activity_logs = [];
      store.activity_logs.unshift({ id, event_type, description, user_name, user_email, meta, created_at });
      if (store.activity_logs.length > 500) store.activity_logs = store.activity_logs.slice(0, 500);
      writeLocalDb(store);
    } catch (err) {
      console.error('Failed to write local activity log:', err.message);
    }
  },

  async getActivityLogs(limit = 100) {
    if (pool) {
      const res = await pool.query(
        'SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT $1',
        [limit]
      );
      return res.rows.map(r => ({
        ...r,
        meta: r.meta || null
      }));
    }
    const store = readLocalDb();
    return (store.activity_logs || []).slice(0, limit);
  },

  // ── REVIEW EMAIL FUNCTIONS ──────────────────────────────────────────────────

  async getOrdersForReviewEmail() {
    // Orders placed 7 days ago that are paid/dispatched/delivered and haven't had a review email sent
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const sixDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString();
    if (pool) {
      const res = await pool.query(
        `SELECT * FROM orders 
         WHERE created_at BETWEEN $1 AND $2
         AND review_email_sent = false
         AND payment_status IN ('paid', 'completed')
         AND status IN ('dispatched', 'delivered', 'processing')`,
        [sevenDaysAgo, sixDaysAgo]
      );
      return res.rows.map(r => ({
        ...r,
        customer_details: typeof r.customer_details === 'string' ? JSON.parse(r.customer_details) : (r.customer_details || {}),
        items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || [])
      }));
    }
    const store = readLocalDb();
    const cutoffStart = new Date(sevenDaysAgo).getTime();
    const cutoffEnd = new Date(sixDaysAgo).getTime();
    return (store.orders || []).filter(o => {
      const t = new Date(o.created_at).getTime();
      return t >= cutoffStart && t <= cutoffEnd && !o.review_email_sent && ['paid','completed'].includes(o.payment_status);
    });
  },

  async markReviewEmailSent(orderId) {
    if (pool) {
      await pool.query('UPDATE orders SET review_email_sent = true WHERE id = $1', [orderId]);
      return;
    }
    const store = readLocalDb();
    const idx = (store.orders || []).findIndex(o => o.id === orderId);
    if (idx > -1) { store.orders[idx].review_email_sent = true; writeLocalDb(store); }
  },

  // ── ABANDONED CART FUNCTIONS ────────────────────────────────────────────────

  async saveAbandonedCart({ user_id, user_email, user_name, cart_items, cart_total }) {
    if (!user_email) return;
    const id = `cart-${user_email.replace(/[^a-z0-9]/gi, '-')}`;
    const last_updated = new Date().toISOString();
    if (pool) {
      await pool.query(
        `INSERT INTO abandoned_carts (id, user_id, user_email, user_name, cart_items, cart_total, email_sent, last_updated)
         VALUES ($1, $2, $3, $4, $5, $6, false, $7)
         ON CONFLICT (id) DO UPDATE SET
           cart_items = $5, cart_total = $6, email_sent = false, last_updated = $7`,
        [id, user_id || null, user_email, user_name || null, JSON.stringify(cart_items), cart_total || 0, last_updated]
      );
      return;
    }
    const store = readLocalDb();
    if (!store.abandoned_carts) store.abandoned_carts = [];
    const existingIdx = store.abandoned_carts.findIndex(c => c.id === id);
    const entry = { id, user_id, user_email, user_name, cart_items, cart_total, email_sent: false, last_updated };
    if (existingIdx > -1) store.abandoned_carts[existingIdx] = entry;
    else store.abandoned_carts.push(entry);
    writeLocalDb(store);
  },

  async deleteAbandonedCart(userEmail) {
    if (!userEmail) return;
    const id = `cart-${userEmail.replace(/[^a-z0-9]/gi, '-')}`;
    if (pool) {
      await pool.query('DELETE FROM abandoned_carts WHERE id = $1', [id]);
      return;
    }
    const store = readLocalDb();
    if (store.abandoned_carts) {
      store.abandoned_carts = store.abandoned_carts.filter(c => c.id !== id);
      writeLocalDb(store);
    }
  },

  async getAbandonedCarts() {
    // Carts last updated more than 2 hours ago, email not yet sent
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    if (pool) {
      const res = await pool.query(
        `SELECT * FROM abandoned_carts 
         WHERE last_updated BETWEEN $1 AND $2 
         AND email_sent = false`,
        [oneDayAgo, twoHoursAgo]
      );
      return res.rows.map(r => ({
        ...r,
        cart_items: typeof r.cart_items === 'string' ? JSON.parse(r.cart_items) : (r.cart_items || [])
      }));
    }
    const store = readLocalDb();
    const cutoff = new Date(twoHoursAgo).getTime();
    const dayAgo = new Date(oneDayAgo).getTime();
    return (store.abandoned_carts || []).filter(c => {
      const t = new Date(c.last_updated).getTime();
      return t >= dayAgo && t <= cutoff && !c.email_sent;
    });
  },

  async markAbandonedCartEmailSent(cartId) {
    if (pool) {
      await pool.query('UPDATE abandoned_carts SET email_sent = true WHERE id = $1', [cartId]);
      return;
    }
    const store = readLocalDb();
    const idx = (store.abandoned_carts || []).findIndex(c => c.id === cartId);
    if (idx > -1) { store.abandoned_carts[idx].email_sent = true; writeLocalDb(store); }
  }
};
