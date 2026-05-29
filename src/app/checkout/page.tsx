'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PaymentDetails } from '@/components/checkout/payment-details';
import { useCart } from '@/context/cart-context';
import { DELIVERY_FEE } from '@/lib/menu';
import { formatNaira } from '@/lib/format';
import { generateTrackingId, saveOrder, type FulfillmentType } from '@/lib/orders';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [fulfillmentType, setFulfillmentType] =
    useState<FulfillmentType>('delivery');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const deliveryFee = fulfillmentType === 'delivery' ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  const validate = () => {
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = 'Full name is required';
    if (!phone.trim()) next.phone = 'Phone number is required';
    if (!email.trim()) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = 'Enter a valid email';
    if (fulfillmentType === 'delivery') {
      if (!address.trim()) next.address = 'Delivery address is required';
      if (!area.trim()) next.area = 'Area / landmark is required';
    }
    if (!paymentConfirmed)
      next.payment = 'Please confirm you have made the payment';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handlePlaceOrder = () => {
    if (!validate() || items.length === 0) return;
    setSubmitting(true);

    const order = {
      trackingId: generateTrackingId(),
      createdAt: new Date().toISOString(),
      customer: { fullName: fullName.trim(), phone: phone.trim(), email: email.trim() },
      fulfillment: {
        type: fulfillmentType,
        address: address.trim(),
        area: area.trim(),
        notes: notes.trim(),
      },
      items: [...items],
      subtotal,
      deliveryFee,
      total,
      paymentConfirmed: true,
    };

    saveOrder(order);
    clearCart();
    router.push(`/order/confirmation?tracking=${encodeURIComponent(order.trackingId)}`);
  };

  if (items.length === 0) {
    return (
      <div className="md:pt-32 pb-24 px-4 min-h-screen flex flex-col items-center justify-center text-center">
        <p className="text-muted-foreground text-lg mb-6">Your cart is empty.</p>
        <Button asChild className="rounded-full bg-primary">
          <Link href="/menu">Browse Menu</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="md:pt-32 pb-24 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to cart
        </Link>

        <h1 className="text-4xl md:text-5xl font-headline font-bold mb-10">Checkout</h1>

        <div className="grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3 space-y-8">
            <section className="glass-card rounded-[2rem] p-6 md:p-8 border-border">
              <h2 className="text-xl font-bold mb-6">Your details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ada Okafor"
                    className="h-12 rounded-xl bg-background border-input"
                  />
                  {errors.fullName && (
                    <p className="text-xs text-destructive">{errors.fullName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08012345678"
                    className="h-12 rounded-xl bg-background border-input"
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="h-12 rounded-xl bg-background border-input"
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>
              </div>
            </section>

            <section className="glass-card rounded-[2rem] p-6 md:p-8 border-border">
              <h2 className="text-xl font-bold mb-6">Pickup or delivery</h2>
              <RadioGroup
                value={fulfillmentType}
                onValueChange={(v) => setFulfillmentType(v as FulfillmentType)}
                className="grid sm:grid-cols-2 gap-4 mb-6"
              >
                <label
                  className={`flex items-center gap-3 rounded-2xl border p-4 cursor-pointer transition-colors ${
                    fulfillmentType === 'delivery'
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-muted'
                  }`}
                >
                  <RadioGroupItem value="delivery" id="delivery" />
                  <div>
                    <p className="font-bold">Delivery</p>
                    <p className="text-xs text-muted-foreground">
                      {formatNaira(DELIVERY_FEE)} fee · 35–45 mins
                    </p>
                  </div>
                </label>
                <label
                  className={`flex items-center gap-3 rounded-2xl border p-4 cursor-pointer transition-colors ${
                    fulfillmentType === 'pickup'
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-muted'
                  }`}
                >
                  <RadioGroupItem value="pickup" id="pickup" />
                  <div>
                    <p className="font-bold">Pickup</p>
                    <p className="text-xs text-muted-foreground">Collect at our kitchen</p>
                  </div>
                </label>
              </RadioGroup>

              {fulfillmentType === 'delivery' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Delivery address</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street, house number, estate"
                      className="h-12 rounded-xl bg-background border-input"
                    />
                    {errors.address && (
                      <p className="text-xs text-destructive">{errors.address}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Area / landmark</Label>
                    <Input
                      id="area"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="e.g. Meiran, Alimosho"
                      className="h-12 rounded-xl bg-background border-input"
                    />
                    {errors.area && (
                      <p className="text-xs text-destructive">{errors.area}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2 mt-4">
                <Label htmlFor="notes">Order notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Extra pepper, call on arrival, etc."
                  className="min-h-[80px] rounded-xl bg-background border-input"
                />
              </div>
            </section>

            <section className="glass-card rounded-[2rem] p-6 md:p-8 border-border">
              <h2 className="text-xl font-bold mb-4">Payment</h2>
              <PaymentDetails />
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border bg-muted p-4">
                <Checkbox
                  id="paymentConfirmed"
                  checked={paymentConfirmed}
                  onCheckedChange={(c) => setPaymentConfirmed(c === true)}
                />
                <label
                  htmlFor="paymentConfirmed"
                  className="text-sm leading-relaxed cursor-pointer"
                >
                  Yes, I&apos;ve made the payment to the account above for{' '}
                  <span className="font-bold text-primary">{formatNaira(total)}</span>
                </label>
              </div>
              {errors.payment && (
                <p className="text-xs text-destructive mt-2">{errors.payment}</p>
              )}
            </section>
          </div>

          <div className="lg:col-span-2">
            <div className="glass-card rounded-[2rem] p-6 md:p-8 border-border sticky top-28">
              <h2 className="text-xl font-bold mb-6">Order summary</h2>
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
                      <Image
                        src={
                          PlaceHolderImages.find((i) => i.id === item.image)
                            ?.imageUrl || ''
                        }
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.qty} × {formatNaira(item.price)}
                      </p>
                    </div>
                    <p className="font-bold text-sm shrink-0">
                      {formatNaira(item.price * item.qty)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-3 border-t border-border pt-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-bold">{formatNaira(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span className="font-bold">
                    {deliveryFee === 0 ? 'Free' : formatNaira(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>Total</span>
                  <span className="text-primary">{formatNaira(total)}</span>
                </div>
              </div>
              <Button
                className="w-full h-14 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-lg mt-8"
                onClick={handlePlaceOrder}
                disabled={submitting}
              >
                {submitting ? 'Placing order...' : 'Place order'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
