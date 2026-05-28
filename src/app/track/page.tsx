
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Phone, MessageSquare, Flame, CheckCircle2, Truck, Timer, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

const steps = [
  { id: 1, label: 'Order Confirmed', icon: CheckCircle2, time: '12:30 PM' },
  { id: 2, label: 'On the Grill', icon: Flame, time: '12:45 PM' },
  { id: 3, label: 'Ready for Pick-up', icon: User, time: '1:05 PM' },
  { id: 4, label: 'Out for Delivery', icon: Truck, time: '1:15 PM' },
]

export default function TrackOrderPage() {
  const [currentStep, setCurrentStep] = useState(2)
  const [progress, setProgress] = useState(45)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => (p < 100 ? p + 0.1 : 100))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="pt-24 md:pt-32 pb-24 px-4 min-h-screen flex items-center justify-center">
      <div className="max-w-3xl w-full">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">Track Order</h1>
          <p className="text-muted-foreground">Order #JGY-8849-LP • Estimating delivery in <span className="text-primary font-bold">15-20 mins</span></p>
        </header>

        <div className="glass-card rounded-[3rem] p-8 md:p-12 border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
             <div className="w-16 h-16 rounded-full bg-primary/20 flex flex-col items-center justify-center border border-primary/30">
                <span className="text-xs font-bold text-primary uppercase">Mins</span>
                <span className="text-2xl font-bold leading-none">18</span>
             </div>
          </div>

          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
               <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Delivery Progress</span>
               <span className="text-sm font-bold text-primary">{Math.floor(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-3 bg-white/5" />
          </div>

          <div className="space-y-8 relative">
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-white/5" />
            
            {steps.map((step, i) => {
              const Icon = step.icon
              const isActive = step.id <= currentStep
              const isLatest = step.id === currentStep

              return (
                <div key={step.id} className="flex gap-8 relative z-10">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-500 ${
                    isActive ? "bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/20" : "bg-background border-white/10 text-muted-foreground"
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 flex justify-between items-center">
                    <div>
                      <h4 className={`text-xl font-bold ${isActive ? "text-white" : "text-muted-foreground"}`}>{step.label}</h4>
                      <p className="text-sm text-muted-foreground">{isActive ? 'Completed' : 'Upcoming'}</p>
                    </div>
                    {isActive && <span className="text-sm font-medium opacity-60">{step.time}</span>}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-12 pt-12 border-t border-white/5">
            <div className="flex items-center gap-6">
               <div className="relative">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5">
                     <Image 
                        src="https://picsum.photos/seed/delivery/100/100" 
                        alt="Rider" 
                        fill 
                        className="object-cover"
                     />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-primary text-white p-1 rounded-full border-2 border-background">
                     <Truck className="w-3 h-3" />
                  </div>
               </div>
               <div className="flex-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Your Delivery Partner</p>
                  <h4 className="text-xl font-bold">Olawale Johnson</h4>
                  <div className="flex items-center gap-1 text-accent">
                     <Star className="w-3 h-3 fill-current" />
                     <span className="text-xs font-bold">4.9 • 2.5k Deliveries</span>
                  </div>
               </div>
               <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="rounded-full glass w-12 h-12">
                     <Phone className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full glass w-12 h-12">
                     <MessageSquare className="w-5 h-5" />
                  </Button>
               </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
           <Button variant="link" className="text-muted-foreground font-bold uppercase tracking-widest hover:text-primary">
              View Order Details
           </Button>
        </div>
      </div>
    </div>
  )
}
