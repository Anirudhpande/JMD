import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import https from 'https';

dotenv.config();

// Nodemailer Transporter Configuration
// Fallback to a mock transporter if SMTP variables are not defined in .env
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
});

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const isEmailConfigured = !!(RESEND_API_KEY || (process.env.SMTP_HOST && process.env.SMTP_USER));

// Helper function to make HTTP POST requests with JSON payload using Node's built-in https module
function postJson(url, headers, body) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(responseBody);
        } catch (e) {
          parsed = { message: responseBody };
        }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ ok: true, status: res.statusCode, body: parsed });
        } else {
          resolve({ ok: false, status: res.statusCode, body: parsed });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(JSON.stringify(body));
    req.end();
  });
}

// Unified sendMail function that routes through Resend API (HTTP) if available, falling back to SMTP
async function sendMail({ from, to, subject, html }) {
  if (RESEND_API_KEY) {
    let sender = from;
    if (process.env.RESEND_FROM) {
      sender = process.env.RESEND_FROM;
    } else if (!process.env.SMTP_FROM || process.env.SMTP_FROM.includes('gmail.com')) {
      sender = 'JMD Global Stones <onboarding@resend.dev>';
    }

    const res = await postJson('https://api.resend.com/emails', {
      'Authorization': `Bearer ${RESEND_API_KEY}`
    }, {
      from: sender,
      to,
      subject,
      html
    });

    if (!res.ok) {
      throw new Error(res.body?.message || `Resend API failed with status ${res.status}`);
    }
    return res.body;
  } else if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return transporter.sendMail({
      from,
      to,
      subject,
      html
    });
  } else {
    console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
    return { mock: true };
  }
}


const BRAND_HEADER = `
  <div style="background-color: #111111; color: #F5F0E8; padding: 2.5rem; text-align: center; border-bottom: 2px solid #C9A96E;">
    <h1 style="margin: 0; font-family: 'Cormorant Garamond', serif; font-size: 2.2rem; letter-spacing: 0.1em; font-weight: 400; text-transform: uppercase;">JMD Global Stones</h1>
    <span style="font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase; color: #C9A96E; margin-top: 0.5rem; display: block;">Architectural Paving & Stone</span>
  </div>
`;

const BRAND_FOOTER = `
  <div style="background-color: #111111; color: #8E8A82; padding: 2rem; font-size: 0.75rem; text-align: center; border-top: 1px solid #222222; margin-top: 3rem; line-height: 1.6;">
    <p style="margin: 0 0 0.5rem 0; color: #F5F0E8; text-transform: uppercase; letter-spacing: 0.05em;">JMD Global Stones Pvt Ltd</p>
    <p style="margin: 0 0 1rem 0;">Wirral HQ: Twelve Quays House, CH41 1LD | Southampton Yard: Yard 2, Eling Wharf, SO40 4TE</p>
    <p style="margin: 0; color: #5E5A52;">Company No: 12807959 | VAT No: GB 358688337</p>
  </div>
`;

export const emails = {
  // 1. Order Confirmation & Tax Invoice (Customer)
  async sendOrderConfirmation(order) {
    const itemsList = order.items.map(item => `
      <tr style="border-bottom: 1px solid #D9D2C5;">
        <td style="padding: 1rem 0; font-size: 0.9rem; color: #111111;">
          <strong>${item.product_name}</strong><br/>
          <span style="font-size: 0.75rem; color: #4A453E;">Pack size: ${item.size}</span>
        </td>
        <td style="padding: 1rem 0; text-align: center; font-size: 0.9rem;">${item.quantity}</td>
        <td style="padding: 1rem 0; text-align: right; font-size: 0.9rem; font-weight: 600;">£${(Number(item.price) * Number(item.quantity)).toFixed(2)}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'DM Sans', Arial, sans-serif; background-color: #F5F0E8; color: #111111; margin: 0; padding: 2rem 0; }
          .wrapper { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #D9D2C5; }
          .content { padding: 3rem 2.5rem; }
          .summary-table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; }
          .summary-total { font-size: 1.15rem; color: #C9A96E; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          ${BRAND_HEADER}
          <div class="content">
            <h2 style="font-family: 'Cormorant Garamond', serif; font-size: 1.8rem; font-weight: 400; margin-top: 0; border-bottom: 1px solid #D9D2C5; padding-bottom: 1rem;">Tax Invoice</h2>
            <p>Dear ${order.customer_details.name},</p>
            <p>Thank you for your order from JMD Global Stones. Please find the details of your tax invoice below.</p>
            
            <div style="background-color: #F5F0E8; padding: 1.25rem; border: 1px solid #D9D2C5; margin: 2rem 0;">
              <p style="margin: 0 0 0.5rem 0;"><strong>Invoice Number:</strong> INV-${order.id}</p>
              <p style="margin: 0 0 0.5rem 0;"><strong>Payment Method:</strong> ${order.payment_method === 'stripe' ? 'Credit/Debit Card' : 'Direct Bank Transfer'}</p>
              <p style="margin: 0 0 0.5rem 0;"><strong>Estimated Delivery:</strong> 3-5 Working Days (HGV Tail-Lift Drop)</p>
              <p style="margin: 0 0 1rem 0;"><strong>Delivery Address:</strong> ${order.shipping_address ? order.shipping_address.address : order.customer_details.address}</p>
              <p style="margin: 0;">
                <a href="${process.env.SITE_URL || 'http://localhost:5173'}/invoice/${order.id}" style="background-color: #111111; color: #F5F0E8; padding: 0.65rem 1.25rem; text-decoration: none; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.08em; font-weight: 600; display: inline-block; border: 1px solid #111111;">View / Print Tax Invoice</a>
              </p>
            </div>

            <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; margin-top: 2rem; margin-bottom: 0.5rem; font-weight: 400;">Invoice Summary</h3>
            <table class="summary-table">
              <thead>
                <tr style="border-bottom: 1px solid #C9A96E; text-align: left; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: #4A453E;">
                  <th style="padding-bottom: 0.5rem;">Product</th>
                  <th style="padding-bottom: 0.5rem; text-align: center;">Qty</th>
                  <th style="padding-bottom: 0.5rem; text-align: right;">Total (ex VAT)</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
                <tr>
                  <td colspan="2" style="padding: 1rem 0 0.5rem 0; font-size: 0.85rem; color: #4A453E; text-align: right;">Subtotal (ex VAT):</td>
                  <td style="padding: 1rem 0 0.5rem 0; font-size: 0.85rem; text-align: right; font-weight: 600;">£${Number(order.subtotal).toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 0.25rem 0; font-size: 0.85rem; color: #4A453E; text-align: right;">UK Zone Carriage:</td>
                  <td style="padding: 0.25rem 0; font-size: 0.85rem; text-align: right; font-weight: 600;">£${Number(order.shipping).toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 0.25rem 0; font-size: 0.85rem; color: #4A453E; text-align: right;">VAT @ 20%:</td>
                  <td style="padding: 0.25rem 0; font-size: 0.85rem; text-align: right; font-weight: 600;">£${Number(order.vat).toFixed(2)}</td>
                </tr>
                <tr style="border-top: 2px solid #C9A96E;">
                  <td colspan="2" style="padding: 1rem 0; text-align: right; font-weight: bold; text-transform: uppercase; font-size: 0.9rem;">Invoice Total (inc VAT):</td>
                  <td style="padding: 1rem 0; text-align: right;" class="summary-total">£${Number(order.total).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div style="margin-top: 2.5rem; border-top: 1px solid #D9D2C5; padding-top: 1.5rem; font-size: 0.85rem; color: #4A453E; line-height: 1.6;">
              <p><strong>Direct Bank Transfer Payments:</strong> If you selected Bank Transfer, please send the total amount of <strong>£${Number(order.total).toFixed(2)}</strong> referencing your order number <strong>#${order.id}</strong> to:</p>
              <p style="background-color: #F5F0E8; padding: 1rem; border: 1px solid #D9D2C5; font-family: monospace;">
                Bank: Barclays UK<br/>
                Account: 88724109<br/>
                Sort Code: 20-41-15<br/>
                Beneficiary: JMD Global Stones Ltd
              </p>
            </div>
          </div>
          ${BRAND_FOOTER}
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"JMD Global Stones" <${process.env.SMTP_FROM || 'sales@jmdglobalstones.co.uk'}>`,
      to: order.customer_details.email,
      subject: `Tax Invoice INV-${order.id} | JMD Global Stones`,
      html: htmlContent
    };

    try {
      await sendMail(mailOptions);
      if (isEmailConfigured) {
        console.log(`Tax Invoice email sent to ${order.customer_details.email} for order #${order.id}`);
      }
    } catch (err) {
      console.error(`Failed to send confirmation email to customer:`, err);
    }
  },

  // 2. New Order Notification (Admin)
  async sendAdminNewOrderAlert(order) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <body>
        <div style="font-family: sans-serif; padding: 1.5rem; color: #111111;">
          <h2>[NEW ORDER RECEIVED] Order #${order.id}</h2>
          <p>A new order has been placed on the JMD Global Stones website.</p>
          <p><strong>Customer Name:</strong> ${order.customer_details.name}</p>
          <p><strong>Email:</strong> ${order.customer_details.email}</p>
          <p><strong>Phone:</strong> ${order.customer_details.phone}</p>
          <p><strong>Order Value:</strong> £${Number(order.total).toFixed(2)} (inc VAT & shipping)</p>
          <p><strong>Payment Method:</strong> ${order.payment_method}</p>
          <p><a href="${process.env.SITE_URL || 'http://localhost:5173'}/admin" style="background-color: #111111; color: white; padding: 0.75rem 1.5rem; text-decoration: none;">Open Admin CMS</a></p>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"JMD System" <${process.env.SMTP_FROM || 'system@jmdglobalstones.co.uk'}>`,
      to: process.env.ADMIN_ALERT_EMAIL || 'sales@jmdglobalstones.co.uk',
      subject: `[New Order Alert] #${order.id} - £${Number(order.total).toFixed(2)}`,
      html: htmlContent
    };

    try {
      await sendMail(mailOptions);
    } catch (err) {
      console.error('Failed to send admin order alert email:', err);
    }
  },

  // 3. Shipping Status Update (Customer)
  async sendOrderDispatchedEmail(order) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'DM Sans', Arial, sans-serif; background-color: #F5F0E8; color: #111111; margin: 0; padding: 2rem 0; }
          .wrapper { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #D9D2C5; }
          .content { padding: 3rem 2.5rem; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          ${BRAND_HEADER}
          <div class="content" style="text-align: center;">
            <h2 style="font-family: 'Cormorant Garamond', serif; font-size: 1.8rem; font-weight: 400; margin-top: 0; border-bottom: 1px solid #D9D2C5; padding-bottom: 1rem; color: #C9A96E;">Your Stone Order is Dispatched</h2>
            <p style="font-size: 1.05rem; line-height: 1.6;">Dear ${order.customer_details.name},</p>
            <p style="font-size: 1.05rem; line-height: 1.6;">We are pleased to inform you that your order <strong>#${order.id}</strong> has been loaded onto our tail-lift lorry transport and is dispatched from our stockyard.</p>
            
            <div style="background-color: #F5F0E8; padding: 1.5rem; border: 1px solid #D9D2C5; margin: 2rem 0; text-align: left; font-size: 0.9rem; line-height: 1.6;">
              <p style="margin: 0 0 0.5rem 0;"><strong>Delivery Type:</strong> Kerbside Tail-Lift HGV Lorry Drop</p>
              <p style="margin: 0 0 0.5rem 0;"><strong>Delivery Timeline:</strong> Next 1-2 business days</p>
              <p style="margin: 0;"><strong>Access Warning:</strong> Ensure your roadway clearances (3.2m width) and solid ground conditions are clear.</p>
            </div>

            <p style="font-size: 0.95rem; margin-top: 2rem;">You can check your order's real-time progress on our public tracking dashboard:</p>
            <p style="margin: 2rem 0;">
              <a href="${process.env.SITE_URL || 'http://localhost:5173'}/track?order=${order.id}&email=${encodeURIComponent(order.customer_details.email)}" style="background-color: #111111; color: #F5F0E8; padding: 1rem 2rem; text-decoration: none; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.1em; font-weight: 600; display: inline-block; border: 1px solid #111111;">Track Order Status</a>
            </p>
          </div>
          ${BRAND_FOOTER}
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"JMD Global Stones" <${process.env.SMTP_FROM || 'sales@jmdglobalstones.co.uk'}>`,
      to: order.customer_details.email,
      subject: `Order #${order.id} Dispatched | JMD Global Stones`,
      html: htmlContent
    };

    try {
      await sendMail(mailOptions);
      if (isEmailConfigured) {
        console.log(`Shipping notification email sent to ${order.customer_details.email} for order #${order.id}`);
      }
    } catch (err) {
      console.error(`Failed to send shipping email to customer:`, err);
    }
  },

  // 4. Low Stock Warning (Admin)
  async sendAdminLowStockAlert(product) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <body>
        <div style="font-family: sans-serif; padding: 1.5rem; color: #111111; border: 1px solid #C25656;">
          <h2 style="color: #C25656;">[LOW STOCK ALERT] Inventory Level Warning</h2>
          <p>The following product listing has dropped to or below critical stock levels (5 units remaining):</p>
          <p style="background-color: #F5F0E8; padding: 1rem; border: 1px solid #D9D2C5; line-height: 1.6;">
            <strong>Product:</strong> ${product.name}<br/>
            <strong>Category:</strong> ${product.category}<br/>
            <strong>Size:</strong> ${product.size}<br/>
            <strong>Remaining Stock:</strong> <span style="color: #C25656; font-weight: bold;">${product.stock} units</span><br/>
            <strong>SKU/ID:</strong> ${product.id}
          </p>
          <p><a href="${process.env.SITE_URL || 'http://localhost:5173'}/admin" style="background-color: #111111; color: white; padding: 0.75rem 1.5rem; text-decoration: none;">Restock inventory in Dashboard</a></p>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"JMD Inventory Alert" <${process.env.SMTP_FROM || 'system@jmdglobalstones.co.uk'}>`,
      to: process.env.ADMIN_ALERT_EMAIL || 'sales@jmdglobalstones.co.uk',
      subject: `[Low Stock Alert] ${product.name} - Only ${product.stock} left`,
      html: htmlContent
    };

    try {
      await sendMail(mailOptions);
      if (isEmailConfigured) {
        console.log(`Low stock alert email sent to admin for product: ${product.name}`);
      }
    } catch (err) {
      console.error('Failed to send low stock warning:', err);
    }
  },

  // 5. Post-Purchase Review Request (7 days after order)
  async sendReviewRequestEmail(order) {
    const cd = order.customer_details || {};
    const customerName = cd.name || 'Valued Customer';
    const customerEmail = cd.email;
    if (!customerEmail) return;

    const siteUrl = process.env.SITE_URL || 'https://jmdglobalstones.co.uk';
    const firstItem = (order.items || [])[0];
    const productSlug = firstItem?.product_slug || '';
    const productName = firstItem?.product_name || 'your recent purchase';
    const reviewUrl = `${siteUrl}/products/${productSlug}#reviews`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"/></head>
      <body style="margin:0;padding:0;background:#F5F0E8;font-family:Arial,Helvetica,sans-serif;">
        <div style="max-width:600px;margin:2rem auto;background:#FFFFFF;border:1px solid #D9D2C5;">
          <div style="background:#111111;padding:2rem 2.5rem;text-align:center;">
            <h1 style="color:#C9A84C;font-size:1.6rem;margin:0;letter-spacing:0.05em;">JMD Global Stones</h1>
            <p style="color:#888;font-size:0.75rem;margin:0.5rem 0 0;text-transform:uppercase;letter-spacing:0.15em;">Customer Review Request</p>
          </div>
          <div style="padding:2.5rem;">
            <p style="font-size:1rem;color:#111;">Dear ${customerName},</p>
            <p style="color:#444;line-height:1.7;">
              We hope your <strong>${productName}</strong> has arrived safely and that you're delighted with it.
              Your feedback means the world to us — and helps other customers make confident choices.
            </p>
            <div style="background:#F5F0E8;border:1px solid #D9D2C5;padding:1.5rem;margin:1.5rem 0;text-align:center;">
              <p style="font-size:0.9rem;color:#555;margin:0 0 1rem;">Would you take 2 minutes to leave us a review?</p>
              <a href="${reviewUrl}" style="display:inline-block;background:#111111;color:#C9A84C;padding:0.85rem 2.5rem;text-decoration:none;font-size:0.85rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;">
                ★ Leave a Review
              </a>
            </div>
            <p style="color:#444;line-height:1.7;font-size:0.9rem;">
              As a family-run business, every review genuinely helps us grow. 
              Thank you for choosing JMD Global Stones.
            </p>
            <p style="color:#444;font-size:0.9rem;">Warm regards,<br/><strong>The JMD Team</strong></p>
          </div>
          <div style="background:#F5F0E8;padding:1rem 2.5rem;text-align:center;border-top:1px solid #D9D2C5;">
            <p style="font-size:0.72rem;color:#888;margin:0;">
              JMD Global Stones Ltd · Twelve Quays House, Egerton Wharf, CH41 1LD<br/>
              You received this because you placed order #${order.id}. 
              <a href="${siteUrl}/contact" style="color:#C9A84C;">Contact us</a> with any questions.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"JMD Global Stones" <${process.env.SMTP_FROM || 'sales@jmdglobalstones.co.uk'}>`,
      to: customerEmail,
      subject: `How are you enjoying your ${productName}? ⭐ Leave a quick review`,
      html: htmlContent
    };

    try {
      await sendMail(mailOptions);
      console.log(`Review request email sent to ${customerEmail} for order ${order.id}`);
    } catch (err) {
      console.error('Failed to send review request email:', err);
    }
  },

  // 6. Abandoned Cart Reminder Email
  async sendAbandonedCartEmail(cart) {
    const { user_email, user_name, cart_items, cart_total } = cart;
    if (!user_email) return;

    const siteUrl = process.env.SITE_URL || 'https://jmdglobalstones.co.uk';
    const itemsHtml = (cart_items || []).map(item => `
      <tr>
        <td style="padding:0.75rem 0;border-bottom:1px solid #E8E2D8;font-size:0.85rem;color:#111;">${item.product_name}</td>
        <td style="padding:0.75rem 0;border-bottom:1px solid #E8E2D8;font-size:0.85rem;color:#555;text-align:center;">${item.quantity}x</td>
        <td style="padding:0.75rem 0;border-bottom:1px solid #E8E2D8;font-size:0.85rem;color:#111;text-align:right;">£${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"/></head>
      <body style="margin:0;padding:0;background:#F5F0E8;font-family:Arial,Helvetica,sans-serif;">
        <div style="max-width:600px;margin:2rem auto;background:#FFFFFF;border:1px solid #D9D2C5;">
          <div style="background:#111111;padding:2rem 2.5rem;text-align:center;">
            <h1 style="color:#C9A84C;font-size:1.6rem;margin:0;letter-spacing:0.05em;">JMD Global Stones</h1>
            <p style="color:#888;font-size:0.75rem;margin:0.5rem 0 0;text-transform:uppercase;letter-spacing:0.15em;">You left something behind</p>
          </div>
          <div style="padding:2.5rem;">
            <p style="font-size:1rem;color:#111;">Hi ${user_name || 'there'},</p>
            <p style="color:#444;line-height:1.7;">
              You left some premium stone in your basket. It's still waiting for you — 
              but popular products sell out fast. Complete your order while stock lasts.
            </p>
            <table style="width:100%;border-collapse:collapse;margin:1.5rem 0;">
              <thead>
                <tr>
                  <th style="text-align:left;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:#888;padding-bottom:0.5rem;border-bottom:2px solid #D9D2C5;">Product</th>
                  <th style="text-align:center;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:#888;padding-bottom:0.5rem;border-bottom:2px solid #D9D2C5;">Qty</th>
                  <th style="text-align:right;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:#888;padding-bottom:0.5rem;border-bottom:2px solid #D9D2C5;">Price</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding-top:0.75rem;font-weight:700;font-size:0.85rem;">Basket Total (ex. VAT)</td>
                  <td style="padding-top:0.75rem;font-weight:700;font-size:0.95rem;color:#111;text-align:right;">£${Number(cart_total || 0).toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
            <div style="text-align:center;margin:2rem 0;">
              <a href="${siteUrl}/cart" style="display:inline-block;background:#111111;color:#C9A84C;padding:0.9rem 2.5rem;text-decoration:none;font-size:0.85rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;">
                Complete My Order →
              </a>
            </div>
            <p style="font-size:0.85rem;color:#777;line-height:1.6;">
              Any questions? Reply to this email or WhatsApp us on <strong>07450148506</strong> — 
              our yard team is available Mon–Sat 8am–5pm.
            </p>
          </div>
          <div style="background:#F5F0E8;padding:1rem 2.5rem;text-align:center;border-top:1px solid #D9D2C5;">
            <p style="font-size:0.72rem;color:#888;margin:0;">
              JMD Global Stones Ltd · Wirral HQ & Southampton Yard<br/>
              <a href="${siteUrl}/contact" style="color:#C9A84C;">Unsubscribe from cart reminders</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"JMD Global Stones" <${process.env.SMTP_FROM || 'sales@jmdglobalstones.co.uk'}>`,
      to: user_email,
      subject: `You left some stone behind 🪨 — complete your order`,
      html: htmlContent
    };

    try {
      await sendMail(mailOptions);
      console.log(`Abandoned cart email sent to ${user_email}`);
    } catch (err) {
      console.error('Failed to send abandoned cart email:', err);
    }
  }
};
