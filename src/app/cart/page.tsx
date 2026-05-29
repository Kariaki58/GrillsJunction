'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { DELIVERY_FEE } from '@/lib/menu';
import { formatNaira } from '@/lib/format';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function CartPage() {
  const { items, subtotal, updateQty, removeItem } = useCart();
  const deliveryFee = items.length > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="md:pt-32 pb-24 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-headline font-bold mb-12">Your Basket</h1>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                className="glass-card rounded-3xl p-4 flex gap-6 items-center border-border shadow-xl"
              >
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                  <Image
                    src={
                      PlaceHolderImages.find((i) => i.id === item.image)?.imageUrl || ''
                    }
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold mb-1">{item.name}</h3>
                  <p className="text-primary font-bold">{formatNaira(item.price)}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center bg-muted rounded-xl border border-border p-1">
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-lg transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold">{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-lg transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-20 glass-card rounded-3xl">
                <p className="text-muted-foreground mb-6 text-lg">Your basket is empty!</p>
                <Button asChild className="rounded-full bg-primary text-white px-8">
                  <Link href="/menu">Browse Menu</Link>
                </Button>
              </div>
            )}

            {items.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6 mt-12">
                <div className="glass p-6 rounded-3xl flex items-center gap-4 border-border">
                  <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase">
                      Delivery Time
                    </p>
                    <p className="font-bold">35 - 45 Minutes</p>
                  </div>
                </div>
                <div className="glass p-6 rounded-3xl flex items-center gap-4 border-border">
                  <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center text-secondary">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase">
                      Open Hours
                    </p>
                    <p className="font-bold">Open 24/7 Everyday</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="lg:col-span-1">
              <div className="glass-card rounded-[2.5rem] p-8 sticky top-32 border-border shadow-2xl">
                <h2 className="text-2xl font-bold mb-8">Order Summary</h2>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-bold">{formatNaira(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery Fee (est.)</span>
                    <span className="font-bold">{formatNaira(deliveryFee)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pickup is free — selected at checkout
                  </p>
                  <div className="h-px bg-muted my-4" />
                  <div className="flex justify-between text-xl font-bold">
                    <span>Estimated total</span>
                    <span className="text-primary font-headline text-2xl">
                      {formatNaira(total)}
                    </span>
                  </div>
                </div>

                <Button
                  asChild
                  className="w-full h-16 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl shadow-primary/20 mb-6"
                >
                  <Link href="/checkout">
                    CHECKOUT NOW <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-secondary" />
                  Pay via OPay transfer at checkout
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
