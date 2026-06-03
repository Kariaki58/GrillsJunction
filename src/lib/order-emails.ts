// Server-side email templates for order notifications.
// Pure functions that return { subject, html } — no external dependencies.

export interface OrderEmailItem {
  name: string;
  price: number;
  qty: number;
  addons?: { name: string; price: number }[];
}

export interface OrderEmailData {
  trackingId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  fulfillmentType: string; // 'delivery' | 'pickup'
  fulfillmentAddress?: string | null;
  fulfillmentArea?: string | null;
  fulfillmentNotes?: string | null;
  items: OrderEmailItem[];
  subtotal: number;
  total: number;
  businessName: string;
  bank: { bank: string; accountNumber: string; accountName: string };
  trackUrl: string;
}

const ORANGE = '#ea580c';
const DARK = '#1f2429';
const MUTED = '#7d8590';
const BORDER = '#e6e9ee';

const ngn = (n: number) => `₦${Math.round(Number(n) || 0).toLocaleString('en-NG')}`;
const esc = (s: unknown) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

function itemRows(items: OrderEmailItem[]): string {
  return items
    .map((it) => {
      const addons = Array.isArray(it.addons) ? it.addons : [];
      const addonLine = addons.length
        ? `<br/><span style="color:${MUTED};font-size:12px;">+ ${addons
            .map((a) => esc(a.name))
            .join(', ')}</span>`
        : '';
      return `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${BORDER};color:${DARK};font-size:14px;">
          ${esc(it.name)} <span style="color:${MUTED};">× ${it.qty}</span>${addonLine}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid ${BORDER};color:${DARK};font-size:14px;text-align:right;white-space:nowrap;">
          ${ngn(it.price * it.qty)}
        </td>
      </tr>`;
    })
    .join('');
}

function totalsBlock(data: OrderEmailData): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
      <tr>
        <td style="padding:4px 0;color:${MUTED};font-size:14px;">Subtotal</td>
        <td style="padding:4px 0;color:${DARK};font-size:14px;text-align:right;">${ngn(data.subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0 0;color:${DARK};font-size:16px;font-weight:700;border-top:2px solid ${BORDER};">Total</td>
        <td style="padding:10px 0 0;color:${ORANGE};font-size:18px;font-weight:700;text-align:right;border-top:2px solid ${BORDER};">${ngn(data.total)}</td>
      </tr>
    </table>`;
}

function fulfillmentBlock(data: OrderEmailData): string {
  const isDelivery = data.fulfillmentType === 'delivery';
  const addr = [data.fulfillmentAddress, data.fulfillmentArea].filter(Boolean).map(esc).join(', ');
  return `
    <p style="margin:0 0 4px;color:${MUTED};font-size:12px;text-transform:uppercase;letter-spacing:.05em;">${
      isDelivery ? 'Delivery to' : 'Pickup'
    }</p>
    <p style="margin:0;color:${DARK};font-size:14px;line-height:1.5;">
      ${isDelivery ? (addr || 'Address provided at checkout') : 'Customer will pick up'}
      ${data.fulfillmentNotes ? `<br/><span style="color:${MUTED};">Note: ${esc(data.fulfillmentNotes)}</span>` : ''}
    </p>`;
}

function shell(inner: string): string {
  return `
  <div style="background:#f3f4f6;padding:24px 0;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid ${BORDER};">
          ${inner}
        </table>
      </td></tr>
    </table>
  </div>`;
}

/** Email to the business when a new order comes in. */
export function buildAdminOrderEmail(data: OrderEmailData): { subject: string; html: string } {
  const subject = `🔔 New order ${data.trackingId} — ${ngn(data.total)}`;
  const html = shell(`
    <tr><td style="background:${DARK};padding:20px 28px;">
      <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;">New Order Received</p>
      <p style="margin:4px 0 0;color:#c8ccd2;font-size:13px;">Tracking ID: <strong style="color:#ffffff;">${esc(
        data.trackingId
      )}</strong></p>
    </td></tr>
    <tr><td style="padding:24px 28px;">
      <p style="margin:0 0 4px;color:${MUTED};font-size:12px;text-transform:uppercase;letter-spacing:.05em;">Customer</p>
      <p style="margin:0 0 18px;color:${DARK};font-size:14px;line-height:1.6;">
        <strong>${esc(data.customerName)}</strong><br/>
        ${esc(data.customerPhone)}<br/>
        ${esc(data.customerEmail)}
      </p>
      <div style="margin-bottom:18px;">${fulfillmentBlock(data)}</div>
      <p style="margin:0 0 6px;color:${MUTED};font-size:12px;text-transform:uppercase;letter-spacing:.05em;">Items</p>
      <table width="100%" cellpadding="0" cellspacing="0">${itemRows(data.items)}</table>
      ${totalsBlock(data)}
      <div style="margin-top:20px;padding:12px 14px;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;">
        <p style="margin:0;color:#9a3412;font-size:13px;">⚠️ Payment is <strong>not yet confirmed</strong>. Confirm it from the admin dashboard once the transfer is received.</p>
      </div>
    </td></tr>
    <tr><td style="padding:0 28px 24px;">
      <a href="${esc(data.trackUrl)}" style="color:${ORANGE};font-size:13px;">View order tracking →</a>
    </td></tr>
  `);
  return { subject, html };
}

/** Confirmation email to the customer, including their tracking ID. */
export function buildCustomerOrderEmail(data: OrderEmailData): { subject: string; html: string } {
  const subject = `Your ${data.businessName} order is placed — ${data.trackingId}`;
  const html = shell(`
    <tr><td style="background:linear-gradient(135deg,#ea580c,#dc2626);padding:28px;text-align:center;">
      <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Order Placed! 🎉</p>
      <p style="margin:6px 0 0;color:#ffe8db;font-size:14px;">Thank you for ordering from ${esc(
        data.businessName
      )}.</p>
    </td></tr>
    <tr><td style="padding:24px 28px;">
      <p style="margin:0 0 16px;color:${DARK};font-size:15px;line-height:1.6;">Hi ${esc(
        data.customerName
      )}, we've received your order. Use the tracking ID below to follow its progress.</p>

      <div style="text-align:center;background:#fff7ed;border:1px dashed #fdba74;border-radius:12px;padding:16px;margin-bottom:22px;">
        <p style="margin:0 0 4px;color:${MUTED};font-size:12px;text-transform:uppercase;letter-spacing:.08em;">Your Tracking ID</p>
        <p style="margin:0;color:${ORANGE};font-size:26px;font-weight:800;letter-spacing:1px;font-family:'Courier New',monospace;">${esc(
          data.trackingId
        )}</p>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
        <tr><td align="center">
          <a href="${esc(data.trackUrl)}" style="display:inline-block;background:${ORANGE};color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:999px;">Track My Order</a>
        </td></tr>
      </table>

      <div style="margin:24px 0;">${fulfillmentBlock(data)}</div>

      <p style="margin:0 0 6px;color:${MUTED};font-size:12px;text-transform:uppercase;letter-spacing:.05em;">Order Summary</p>
      <table width="100%" cellpadding="0" cellspacing="0">${itemRows(data.items)}</table>
      ${totalsBlock(data)}

      <div style="margin-top:22px;padding:16px;background:#f9fafb;border:1px solid ${BORDER};border-radius:12px;">
        <p style="margin:0 0 8px;color:${DARK};font-size:13px;font-weight:700;">Payment</p>
        <p style="margin:0 0 10px;color:${MUTED};font-size:13px;line-height:1.5;">If you haven't paid yet, transfer <strong style="color:${DARK};">${ngn(
          data.total
        )}</strong> to the account below. Your order is confirmed once we verify your payment.</p>
        <p style="margin:0;color:${DARK};font-size:14px;line-height:1.7;">
          <strong>${esc(data.bank.bank)}</strong><br/>
          ${esc(data.bank.accountNumber)}<br/>
          ${esc(data.bank.accountName)}
        </p>
      </div>
    </td></tr>
    <tr><td style="padding:0 28px 26px;text-align:center;">
      <p style="margin:0;color:${MUTED};font-size:12px;">${esc(data.businessName)} • 31 Santos Ave, Abule Egba, Lagos</p>
    </td></tr>
  `);
  return { subject, html };
}
