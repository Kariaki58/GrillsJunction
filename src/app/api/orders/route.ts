import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';
import { mapSiteSettingsRow } from '@/lib/site-settings';
import {
  buildAdminOrderEmail,
  buildCustomerOrderEmail,
  type OrderEmailData,
} from '@/lib/order-emails';

const FROM_EMAIL = 'GrillsJunction <admin@grillsjunction.com.ng>';

function adminRecipients(): string[] {
  const emails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  // De-duplicate while preserving order.
  const unique = Array.from(new Set(emails));
  return unique.length > 0 ? unique : ['admin@grillsjunction.com.ng'];
}

// Sends the admin + customer order emails. Failures are logged but never block the order.
async function sendOrderEmails(data: OrderEmailData, customerEmail: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[API /api/orders] RESEND_API_KEY not set — skipping order emails');
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const admin = buildAdminOrderEmail(data);
  const customer = buildCustomerOrderEmail(data);

  const results = await Promise.allSettled([
    resend.emails.send({
      from: FROM_EMAIL,
      to: adminRecipients(),
      replyTo: customerEmail,
      subject: admin.subject,
      html: admin.html,
    }),
    resend.emails.send({
      from: FROM_EMAIL,
      to: [customerEmail],
      subject: customer.subject,
      html: customer.html,
    }),
  ]);

  results.forEach((r, i) => {
    const who = i === 0 ? 'admin' : 'customer';
    if (r.status === 'rejected') {
      console.error(`[API /api/orders] ${who} email failed:`, r.reason);
    } else if (r.value.error) {
      console.error(`[API /api/orders] ${who} email error:`, r.value.error);
    }
  });
}

// Public lookup of a single order by its tracking ID (for the customer Track page).
// Uses the admin client to bypass RLS, but only ever returns the one matching order.
export async function GET(request: NextRequest) {
  const trackingId = request.nextUrl.searchParams.get('tracking_id');

  if (!trackingId) {
    return NextResponse.json({ error: 'tracking_id is required' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items (*)')
    .eq('tracking_id', trackingId.trim().toUpperCase())
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ order: null }, { status: 404 });
  }

  return NextResponse.json({ order: data });
}

export async function POST(request: NextRequest) {

  try {
    const body = await request.json();

    const {
      tracking_id,
      customer_name,
      customer_phone,
      customer_email,
      fulfillment_type,
      fulfillment_address,
      fulfillment_area,
      fulfillment_notes,
      subtotal,
      delivery_fee,
      total,
      payment_confirmed,
      status,
      items,
    } = body;

    // --- Basic validation ---
    if (!tracking_id || !customer_name || !customer_phone || !customer_email) {
      console.error('[API /api/orders] ❌ Validation failed: missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: tracking_id, customer_name, customer_phone, customer_email' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('[API /api/orders] ❌ Validation failed: no items');
      return NextResponse.json(
        { error: 'Order must contain at least one item' },
        { status: 400 }
      );
    }

    // --- Create admin client (bypasses RLS) ---
    const supabase = createAdminClient();

    // --- Insert the order ---
    const orderData = {
      tracking_id,
      customer_name,
      customer_phone,
      customer_email,
      fulfillment_type,
      fulfillment_address: fulfillment_address || null,
      fulfillment_area: fulfillment_area || null,
      fulfillment_notes: fulfillment_notes || null,
      subtotal,
      delivery_fee,
      total,
      payment_confirmed: payment_confirmed ?? true,
      status: status || 'pending',
    };


    const { data: orderResult, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select('id')
      .single();

    if (orderError) {
      console.error('[API /api/orders] ❌ Order insert failed:', JSON.stringify(orderError, null, 2));
      return NextResponse.json(
        { error: 'Failed to create order', details: orderError },
        { status: 500 }
      );
    }


    // --- Insert order items ---
    const orderId = orderResult.id;
    const orderItemsData = items.map((item: { id: number; name: string; price: number; qty: number; image?: string }) => ({
      order_id: orderId,
      menu_item_id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.qty,
      image: item.image || null,
    }));


    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) {
      console.error('[API /api/orders] ❌ Order items insert failed:', JSON.stringify(itemsError, null, 2));
      // Order was created, but items failed — still return success with a warning
      return NextResponse.json(
        { 
          success: true, 
          orderId, 
          warning: 'Order created but some items failed to save',
          itemsError 
        },
        { status: 201 }
      );
    }
    // --- Send notification emails (admin + customer). Non-blocking failures. ---
    try {
      const { data: settingsRow } = await supabase
        .from('site_settings')
        .select('*')
        .maybeSingle();
      const settings = mapSiteSettingsRow(settingsRow);

      const emailData: OrderEmailData = {
        trackingId: tracking_id,
        customerName: customer_name,
        customerPhone: customer_phone,
        customerEmail: customer_email,
        fulfillmentType: fulfillment_type,
        fulfillmentAddress: fulfillment_address,
        fulfillmentArea: fulfillment_area,
        fulfillmentNotes: fulfillment_notes,
        items: (items as { name: string; price: number; qty: number }[]).map((it) => ({
          name: it.name,
          price: Number(it.price),
          qty: Number(it.qty),
        })),
        subtotal: Number(subtotal),
        total: Number(total),
        businessName: settings.businessName || 'GrillsJunction',
        bank: {
          bank: settings.bankName,
          accountNumber: settings.accountNumber,
          accountName: settings.accountName,
        },
        trackUrl: `${request.nextUrl.origin}/track?id=${encodeURIComponent(tracking_id)}`,
      };

      await sendOrderEmails(emailData, customer_email);
    } catch (emailErr) {
      console.error('[API /api/orders] Failed sending order emails:', emailErr);
    }

    return NextResponse.json(
      { success: true, orderId, trackingId: tracking_id },
      { status: 201 }
    );
  } catch (err) {
    console.error('[API /api/orders] 💥 Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error', message: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
