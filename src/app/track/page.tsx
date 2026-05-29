'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Flame,
  Truck,
  User,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { CopyButton } from '@/components/ui/copy-button';
import { getOrderByTrackingId, type Order } from '@/lib/orders';
import { formatNaira } from '@/lib/format';
import { getWhatsAppOrderUrl } from '@/lib/whatsapp';

const steps = [
  { id: 1, label: 'Order Confirmed', icon: CheckCircle2 },
  { id: 2, label: 'On the Grill', icon: Flame },
  { id: 3, label: 'Ready for Pick-up', icon: User },
  { id: 4, label: 'Out for Delivery', icon: Truck },
];

function TrackContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('id') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const currentStep = 2;
  const progress = 45;

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setQuery(id);
      const found = getOrderByTrackingId(id);
      setOrder(found);
      setSearched(true);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = getOrderByTrackingId(query.trim().toUpperCase());
    setOrder(found);
    setSearched(true);
  };

  return (
    <div className="pt-28 md:pt-32 pb-24 px-4 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">Track Order</h1>
          <p className="text-muted-foreground">
            Enter your tracking ID from your order confirmation
          </p>
        </header>

        <form
          onSubmit={handleSearch}
          className="flex gap-2 mb-10 max-w-lg mx-auto"
        >
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. GJ-XXXXX"
            className="h-12 rounded-full bg-muted border-border font-mono uppercase"
          />
          <Button type="submit" className="rounded-full bg-primary px-6 shrink-0">
            <Search className="w-5 h-5" />
          </Button>
        </form>

        {searched && !order && (
          <div className="text-center glass-card rounded-3xl p-10">
            <p className="text-muted-foreground mb-4">
              No order found for <span className="font-mono font-bold text-foreground">{query}</span>
            </p>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/menu">Place a new order</Link>
            </Button>
          </div>
        )}

        {order && (
          <>
            <div className="glass-card rounded-[3rem] p-8 md:p-12 border-border shadow-2xl mb-8">
              <div className="flex items-center justify-between gap-3 mb-8 rounded-2xl bg-primary/10 border border-primary/20 p-4">
                <div>
                  <p className="text-xs font-bold uppercase text-muted-foreground">Tracking ID</p>
                  <p className="text-xl font-bold font-mono">{order.trackingId}</p>
                </div>
                <CopyButton value={order.trackingId} label="Tracking ID" />
              </div>

              <p className="text-sm text-muted-foreground mb-2">
                {order.fulfillment.type === 'delivery' ? 'Delivery' : 'Pickup'} ·{' '}
                {formatNaira(order.total)}
              </p>

              <div className="mb-12 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    Order progress
                  </span>
                  <span className="text-sm font-bold text-primary">{progress}%</span>
                </div>
                <Progress value={progress} className="h-3 bg-muted" />
              </div>

              <div className="space-y-8 relative">
                <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-muted" />
                {steps.map((step) => {
                  const Icon = step.icon;
                  const isActive = step.id <= currentStep;
                  return (
                    <div key={step.id} className="flex gap-8 relative z-10">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-500 ${
                          isActive
                            ? 'bg-primary border-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20'
                            : 'bg-background border-border text-muted-foreground'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 flex justify-between items-center">
                        <div>
                          <h4
                            className={`text-xl font-bold ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                          >
                            {step.label}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {isActive ? 'In progress / completed' : 'Upcoming'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-card rounded-[2rem] p-6 text-center border-border">
              <p className="text-sm text-muted-foreground mb-4">
                Notify us on WhatsApp about your order
              </p>
              <Button
                asChild
                className="w-full h-12 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold"
              >
                <a href={getWhatsAppOrderUrl(order)} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon className="w-5 h-5 mr-2" />
                  Notify us on WhatsApp
                </a>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="pt-28 text-center text-muted-foreground">Loading...</div>}>
      <TrackContent />
    </Suspense>
  );
}
