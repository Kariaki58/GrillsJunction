import { jsPDF } from 'jspdf';
import { formatNaira } from '@/lib/format';
import { PAYMENT_DETAILS } from '@/lib/payment';
import type { Order } from '@/lib/orders';

async function loadLogoBase64(): Promise<string | null> {
  try {
    const res = await fetch('/logo.png');
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function formatReceiptDate(iso: string): string {
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

export async function downloadOrderReceipt(order: Order): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  let y = margin;

  const logo = await loadLogoBase64();
  if (logo) {
    doc.addImage(logo, 'PNG', margin, y, 28, 23);
    y += 28;
  } else {
    y += 4;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(30, 30, 30);
  doc.text('grillsJunction', margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Official Order Receipt', margin, y);
  y += 10;

  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text('Order Details', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const orderMeta = [
    ['Tracking ID', order.trackingId],
    ['Date', formatReceiptDate(order.createdAt)],
    ['Fulfillment', order.fulfillment.type === 'delivery' ? 'Delivery' : 'Pickup'],
    ['Payment', 'OPay Transfer'],
  ];
  orderMeta.forEach(([label, value]) => {
    doc.setTextColor(120, 120, 120);
    doc.text(`${label}:`, margin, y);
    doc.setTextColor(30, 30, 30);
    doc.text(String(value), margin + 38, y);
    y += 5.5;
  });
  y += 4;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('Customer', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  [
    order.customer.fullName,
    order.customer.phone,
    order.customer.email,
  ].forEach((line) => {
    doc.text(line, margin, y);
    y += 5;
  });

  if (order.fulfillment.type === 'delivery') {
    y += 2;
    doc.text(`Address: ${order.fulfillment.address}`, margin, y);
    y += 5;
    doc.text(`Area: ${order.fulfillment.area}`, margin, y);
    y += 5;
  }
  if (order.fulfillment.notes) {
    doc.text(`Notes: ${order.fulfillment.notes}`, margin, y);
    y += 5;
  }
  y += 6;

  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y, pageWidth - margin * 2, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  const colItem = margin + 2;
  const colQty = pageWidth - margin - 58;
  const colUnit = pageWidth - margin - 38;
  const colTotal = pageWidth - margin - 2;
  doc.text('Item', colItem, y + 5.5);
  doc.text('Qty', colQty, y + 5.5);
  doc.text('Unit', colUnit, y + 5.5);
  doc.text('Total', colTotal, y + 5.5, { align: 'right' });
  y += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);

  order.items.forEach((item) => {
    const lineTotal = item.price * item.qty;
    const name =
      item.name.length > 42 ? `${item.name.slice(0, 39)}...` : item.name;
    doc.text(name, colItem, y);
    doc.text(String(item.qty), colQty, y);
    doc.text(formatNaira(item.price), colUnit, y);
    doc.text(formatNaira(lineTotal), colTotal, y, { align: 'right' });
    y += 7;
    if (y > 250) {
      doc.addPage();
      y = margin;
    }
  });

  y += 4;
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  const totals: [string, string][] = [
    ['Subtotal', formatNaira(order.subtotal)],
    ['Delivery fee', formatNaira(order.deliveryFee)],
    ['TOTAL', formatNaira(order.total)],
  ];

  totals.forEach(([label, value], i) => {
    const isTotal = i === totals.length - 1;
    doc.setFont('helvetica', isTotal ? 'bold' : 'normal');
    doc.setFontSize(isTotal ? 12 : 10);
    doc.setTextColor(isTotal ? 255 : 30, isTotal ? 107 : 30, isTotal ? 0 : 30);
    if (!isTotal) doc.setTextColor(30, 30, 30);
    doc.text(label, margin, y);
    doc.text(value, pageWidth - margin, y, { align: 'right' });
    y += isTotal ? 8 : 6;
  });

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text('Payment transferred to:', margin, y);
  y += 5;
  doc.setTextColor(30, 30, 30);
  doc.text(
    `${PAYMENT_DETAILS.bank} • ${PAYMENT_DETAILS.accountNumber} • ${PAYMENT_DETAILS.accountName}`,
    margin,
    y,
  );
  y += 10;

  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text(
    'Thank you for ordering from grillsJunction. Keep this receipt for your records.',
    margin,
    y,
    { maxWidth: pageWidth - margin * 2 },
  );

  doc.save(`grillsJunction-receipt-${order.trackingId}.pdf`);
}
