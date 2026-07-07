/**
 * prerender.js — Build-time SEO meta injector for JMD Global Stones
 *
 * Runs automatically after `vite build` via the `postbuild` npm script.
 *
 * Strategy: reads the built dist/index.html shell and generates
 * route-specific copies with correct <title>, meta description,
 * canonical, OG tags, and JSON-LD structured data injected into <head>.
 * Also injects a <noscript> body block with key content for non-JS crawlers.
 *
 * Works with zero external dependencies — pure Node.js built-ins + the
 * native fetch() available in Node 18+.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const DIST_DIR    = path.join(__dirname, 'dist');
const SITE_URL    = 'https://jmdglobalstones.co.uk';
const BACKEND_API = 'https://jmd-backend-749859334588.europe-west2.run.app';

// ---------------------------------------------------------------------------
// Static route metadata
// ---------------------------------------------------------------------------
const STATIC_ROUTES = [
  {
    route: '/',
    title: 'Premium Natural Stone & Porcelain Paving | JMD Global Stones',
    description: 'Premium natural sandstone, porcelain, and clay brick paving supplied direct from our warehouse. UK-wide delivery. Browse our full range of garden and driveway paving.',
    heading: 'JMD Global Stones — Premium Natural Paving',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'JMD Global Stones',
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      sameAs: [],
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'admin@jmdglobalstones.co.uk',
        contactType: 'customer service',
      },
    },
  },
  {
    route: '/products',
    title: 'All Paving Products | JMD Global Stones',
    description: 'Browse our full range of natural sandstone, porcelain, and clay brick paving. Project packs and single sizes available with UK-wide delivery.',
    heading: 'All Paving Products',
  },
  {
    route: '/delivery',
    title: 'Delivery Information | JMD Global Stones',
    description: 'Find out about our UK-wide delivery service, shipping zones, and lead times for natural stone and porcelain paving orders.',
    heading: 'Delivery Information',
  },
  {
    route: '/care',
    title: 'Paving Care Guide | JMD Global Stones',
    description: 'Expert advice on how to clean, seal, and maintain your natural sandstone and porcelain paving to keep it looking great for years.',
    heading: 'Paving Care & Maintenance Guide',
  },
  {
    route: '/contact',
    title: 'Contact Us | JMD Global Stones',
    description: 'Get in touch with JMD Global Stones for product enquiries, trade pricing, or delivery questions. We are here to help.',
    heading: 'Contact JMD Global Stones',
  },
];

// ---------------------------------------------------------------------------
// Fetch all products from backend
// ---------------------------------------------------------------------------
async function fetchProducts() {
  try {
    const res = await fetch(`${BACKEND_API}/api/products`);
    if (!res.ok) throw new Error(`API ${res.status}`);
    const products = await res.json();
    console.log(`  [api] Fetched ${products.length} products.`);
    return products;
  } catch (err) {
    console.warn(`  [api] Could not fetch products: ${err.message}`);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Build product route metadata from API data
// ---------------------------------------------------------------------------
function buildProductRoute(product) {
  const slug  = product.slug;
  const name  = product.name  || 'Natural Stone Paving';
  const desc  = product.description
    ? product.description.replace(/<[^>]*>/g, '').slice(0, 160)
    : `${name} — premium natural paving from JMD Global Stones. UK-wide delivery available.`;
  const price = product.price_per_sqm || product.price || null;
  const image = (product.images && product.images[0]) || `${SITE_URL}/logo.png`;
  const category = product.category || 'Paving';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: desc,
    image,
    brand: { '@type': 'Brand', name: 'JMD Global Stones' },
    category,
    url: `${SITE_URL}/products/${slug}`,
    offers: price
      ? {
          '@type': 'Offer',
          priceCurrency: 'GBP',
          price: price.toFixed(2),
          availability: 'https://schema.org/InStock',
          url: `${SITE_URL}/products/${slug}`,
        }
      : undefined,
  };

  // Remove undefined fields
  if (!jsonLd.offers) delete jsonLd.offers;

  return {
    route: `/products/${slug}`,
    title: `${name} | JMD Global Stones`,
    description: desc,
    heading: name,
    image,
    jsonLd,
    extra: price
      ? `<p><strong>Price: £${price.toFixed(2)} per m²</strong></p><p>Category: ${category}</p>`
      : `<p>Category: ${category}</p>`,
  };
}

// ---------------------------------------------------------------------------
// Inject meta tags and content into the HTML shell
// ---------------------------------------------------------------------------
function generateHtml(shell, routeMeta) {
  const canonical = `${SITE_URL}${routeMeta.route}`;
  const ogImage   = routeMeta.image || `${SITE_URL}/logo.png`;
  const jsonLdStr = routeMeta.jsonLd
    ? `<script type="application/ld+json">${JSON.stringify(routeMeta.jsonLd, null, 2)}</script>`
    : '';

  const headInjection = `
    <title>${routeMeta.title}</title>
    <meta name="description" content="${routeMeta.description.replace(/"/g, '&quot;')}">
    <link rel="canonical" href="${canonical}">
    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="${routeMeta.title}">
    <meta property="og:description" content="${routeMeta.description.replace(/"/g, '&quot;')}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${ogImage}">
    <meta property="og:site_name" content="JMD Global Stones">
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${routeMeta.title}">
    <meta name="twitter:description" content="${routeMeta.description.replace(/"/g, '&quot;')}">
    <meta name="twitter:image" content="${ogImage}">
    ${jsonLdStr}`;

  // Noscript block gives crawlers real content even with JS disabled
  const noscriptBlock = `
  <noscript>
    <div style="font-family:sans-serif;max-width:900px;margin:2rem auto;padding:1rem">
      <h1>${routeMeta.heading}</h1>
      <p>${routeMeta.description}</p>
      ${routeMeta.extra || ''}
      <p><a href="${SITE_URL}">Return to JMD Global Stones</a></p>
    </div>
  </noscript>`;

  let html = shell;

  // 1. Remove any existing <title> tag from the shell
  html = html.replace(/<title>[^<]*<\/title>/i, '');

  // 2. Remove existing meta description / canonical / OG / Twitter tags injected at build time
  html = html.replace(/<meta\s+name="description"[^>]*>/gi, '');
  html = html.replace(/<link\s+rel="canonical"[^>]*>/gi, '');
  html = html.replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '');
  html = html.replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, '');
  html = html.replace(/<script\s+type="application\/ld\+json"[\s\S]*?<\/script>/gi, '');

  // 3. Inject our new head content right before </head>
  html = html.replace('</head>', `${headInjection}\n  </head>`);

  // 4. Inject noscript block right after <body ...>
  html = html.replace(/(<body[^>]*>)/i, `$1${noscriptBlock}`);

  return html;
}

// ---------------------------------------------------------------------------
// Write a prerendered HTML file to the correct dist location
// ---------------------------------------------------------------------------
function writeRoute(shell, routeMeta) {
  const html       = generateHtml(shell, routeMeta);
  const routePath  = routeMeta.route === '/' ? '' : routeMeta.route;
  const outputDir  = path.join(DIST_DIR, routePath);
  const outputFile = path.join(outputDir, 'index.html');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFile, html, 'utf-8');
  console.log(`  [done]  dist${routePath || '/'}/index.html`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('\n🔧 JMD Prerender — Injecting SEO meta into static HTML routes...\n');

  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ dist/ directory not found. Run `vite build` first.');
    process.exit(1);
  }

  // Read the built HTML shell once
  const shell = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf-8');

  // Fetch products for dynamic routes
  const products = await fetchProducts();
  const productRoutes = products.filter(p => p.slug).map(buildProductRoute);

  const allRoutes = [...STATIC_ROUTES, ...productRoutes];
  console.log(`📄 Generating ${allRoutes.length} route HTML files...\n`);

  for (const routeMeta of allRoutes) {
    try {
      writeRoute(shell, routeMeta);
    } catch (err) {
      console.warn(`  [warn]  Failed: ${routeMeta.route} — ${err.message}`);
    }
  }

  console.log(`\n✅ Prerendering complete — ${allRoutes.length} routes generated.\n`);
}

main().catch((err) => {
  console.error('❌ Prerender fatal error:', err);
  process.exit(1);
});
