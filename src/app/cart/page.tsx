
"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PlaceHolderImages } from '@/lib/placeholder-images'

const initialItems = [
  { id: 1, name: 'Special Lagos Asun', price: 4500, qty: 2, image: 'asun-special' },
  { id: 2, name: 'Flame BBQ Chicken', price: 6500, qty: 1, image: 'bbq-chicken' },
]

export default function CartPage() {
  const [items, setItems] = useState(initialItems)
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0)
  const deliveryFee = 1500
  const total = subtotal + deliveryFee

  return (
    <div className="pt-24 md:pt-32 pb-24 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-headline font-bold mb-12">Your Basket</h1>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <motion.div 
                key={item.id}
                layout
                className="glass-card rounded-3xl p-4 flex gap-6 items-center border-white/5 shadow-xl"
              >
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                  <Image 
                    src={PlaceHolderImages.find(i => i.id === item.image)?.imageUrl || ''} 
                    alt={item.name} 
                    fill 
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1">{item.name}</h3>
                  <p className="text-primary font-bold">₦{item.price.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-1">
                    <button className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold">{item.qty}</span>
                    <button className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button className="text-muted-foreground hover:text-destructive transition-colors">
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
            
            <div className="grid md:grid-cols-2 gap-6 mt-12">
               <div className="glass p-6 rounded-3xl flex items-center gap-4 border-white/5">
                  <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                     <Truck className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="text-xs font-bold text-muted-foreground uppercase">Delivery Time</p>
                     <p className="font-bold">35 - 45 Minutes</p>
                  </div>
               </div>
               <div className="glass p-6 rounded-3xl flex items-center gap-4 border-white/5">
                  <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center text-secondary">
                     <Clock className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="text-xs font-bold text-muted-foreground uppercase">Open Hours</p>
                     <p className="font-bold">Open 24/7 Everyday</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-[2.5rem] p-8 sticky top-32 border-white/10 shadow-2xl">
              <h2 className="text-2xl font-bold mb-8">Order Summary</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-white font-bold">₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Fee</span>
                  <span className="text-white font-bold">₦{deliveryFee.toLocaleString()}</span>
                </div>
                <div className="h-px bg-white/5 my-4" />
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-primary font-headline text-2xl">₦{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="mb-8">
                <div className="relative group">
                   <Input 
                    placeholder="Promo Code" 
                    className="h-14 rounded-2xl bg-white/5 border-white/10 focus:ring-primary pr-20"
                   />
                   <button className="absolute right-2 top-1/2 -translate-y-1/2 text-primary font-bold text-sm px-4">
                      APPLY
                   </button>
                </div>
              </div>

              <Button className="w-full h-16 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl shadow-primary/20 mb-6">
                CHECKOUT NOW <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-secondary" />
                Secure Payment Powered by Flutterwave
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
