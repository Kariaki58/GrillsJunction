import { PAYMENT_DETAILS, WHATSAPP_NUMBER } from '@/lib/payment';
import { formatNaira } from '@/lib/format';
import type { Order } from '@/lib/orders';

export function buildOrderWhatsAppMessage(order: Order): string {
  const lines = [
    'Hello grillsJunction! I have placed an order.',
    '',
    `Tracking ID: ${order.trackingId}`,
    `Name: ${order.customer.fullName}`,
    `Phone: ${order.customer.phone}`,
    `Email: ${order.customer.email}`,
    `Order type: ${order.fulfillment.type === 'delivery' ? 'Delivery' : 'Pickup'}`,
  ];

  if (order.fulfillment.type === 'delivery') {
    lines.push(`Address: ${order.fulfillment.address}`);
    lines.push(`Area: ${order.fulfillment.area}`);
  }

  if (order.fulfillment.notes) {
    lines.push(`Notes: ${order.fulfillment.notes}`);
  }

  lines.push('', 'Items:');
  order.items.forEach((item) => {
    lines.push(`• ${item.name} × ${item.qty} — ${formatNaira(item.price * item.qty)}`);
  });

  lines.push(
    '',
    `Subtotal: ${formatNaira(order.subtotal)}`,
    `Delivery: ${formatNaira(order.deliveryFee)}`,
    `Total: ${formatNaira(order.total)}`,
    '',
    `I have made payment via ${PAYMENT_DETAILS.bank} to ${PAYMENT_DETAILS.accountNumber} (${PAYMENT_DETAILS.accountName}).`,
    '',
    'Please confirm my order. Thank you!',
  );

  return lines.join('\n');
}

export function getWhatsAppOrderUrl(order: Order): string {
  const text = encodeURIComponent(buildOrderWhatsAppMessage(order));
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}
