import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

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
