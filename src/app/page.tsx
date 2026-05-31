"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Flame, Clock, Truck, ShieldCheck, ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { createClient } from '@/lib/supabase/client'
import { defaultSiteSettings, type SiteSettings } from '@/lib/site-settings'

interface Category {
  id: number;
  name: string;
  image: string;
}

const stats = [
  { label: 'Happy Customers', value: '2k+' },
  { label: 'Orders Served', value: '8k+' },
  { label: 'Lagos Location', value: '1' },
  { label: 'Avg Delivery Time', value: '35m' },
]

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-bg')
  const [featuredItems, setFeaturedItems] = useState<any[]>([])
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings)
  const supabase = createClient()

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .limit(4)
        .order('id', { ascending: true })

      if (!error && data) {
        setFeaturedItems(data)
      }
    }
    fetchItems()
  }, [])

  useEffect(() => {
    const loadSiteSettings = async () => {
      try {
        const response = await fetch('/api/site-settings')
        const data = await response.json()
        setSiteSettings(data ?? defaultSiteSettings)
      } catch {
        setSiteSettings(defaultSiteSettings)
      }
    }

    loadSiteSettings()
  }, [])

  return (
    <div className="overflow-hidden">
  {/* Hero Section */}
  <section className="relative h-screen min-h-[520px] md:min-h-[700px] flex items-center justify-center">
    <div className="absolute inset-0">
      <Image
        src={heroImage?.imageUrl || ''}
        alt="Premium Barbecue"
        fill
        className="object-cover brightness-[0.55]"
        priority
        data-ai-hint="luxury barbecue"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
    </div>

    <div className="relative z-10 text-center max-w-4xl px-4 pt-24 md:pt-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl mx-auto"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-headline font-bold mb-6 tracking-tight text-white leading-tight">
          {siteSettings.siteTitle}
        </h1>
        <p className="text-base md:text-lg lg:text-xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
          {siteSettings.siteDescription}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Button asChild size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-white h-14 px-10 text-lg font-bold shadow-xl shadow-primary/20 w-full sm:w-auto">
            <Link href="/menu">Order Now</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white h-14 px-10 text-lg font-bold w-full sm:w-auto backdrop-blur-sm">
            <Link href="/menu">Explore Menu</Link>
          </Button>
        </div>
        
        <p className="text-[10px] sm:text-xs md:text-sm tracking-[0.25em] sm:tracking-[0.3em] font-medium text-white/60 uppercase">
          Order Today <span className="mx-1.5 sm:mx-3 text-primary/80">•</span> Dine In <span className="mx-1.5 sm:mx-3 text-primary/80">•</span> Takeaway <span className="mx-1.5 sm:mx-3 text-primary/80">•</span> Delivery
        </p>
      </motion.div>
    </div>

    {/* <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
      <div className="w-1 h-12 rounded-full bg-gradient-to-b from-primary to-transparent" />
    </div> */}
  </section>

  {/* Featured Menu Items */}
  {featuredItems.length > 0 && (
  <section className="py-24 px-4 bg-background">
    <div className="max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-12">
        <div>
          <p className="text-primary font-bold tracking-widest uppercase mb-2">Our Specialties</p>
          <h2 className="text-4xl md:text-5xl font-headline font-bold">The Grill List</h2>
        </div>
        <Link href="/menu" className="hidden md:flex items-center text-primary font-bold group">
          View All Menu <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {featuredItems.map((item, idx) => {
          const imageValue = item.image || '';
          const imageSrc = imageValue.startsWith('http')
            ? imageValue
            : PlaceHolderImages.find(i => i.id === imageValue)?.imageUrl || '';
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <Link
                href="/menu"
                className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-3xl"
              >
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-4">
                  <Image
                    src={imageSrc}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  <div className="absolute bottom-6 left-6">
                    <h3 className="text-xl font-bold mb-1 text-white">{item.name}</h3>
                    <p className="text-xs text-white/60">
                      ₦{Number(item.price).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
  )}

  {/* Why grillsJunction Section */}
  <section className="py-24 px-4 bg-muted/50">
    <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
      <div className="relative aspect-square rounded-[3rem] overflow-hidden">
        <Image
          src={PlaceHolderImages.find(i => i.id === 'vibe-1')?.imageUrl || ''}
          alt="grillsJunction lounge"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 border-[1.5rem] border-background/20 rounded-[3rem]" />
      </div>

      <div>
        <h2 className="text-4xl md:text-6xl font-headline font-bold mb-8">Why Lagos Loves <br /><span className="text-primary font-body not-italic">grillsJunction</span></h2>
        
        <div className="space-y-8">
          {[
            { icon: ShieldCheck, title: "Premium Quality Meat", desc: "We source only the finest cuts, hand-picked daily for maximum tenderness." },
            { icon: Flame, title: "The Signature Junction Rub", desc: "Our secret spice blend inspired by traditional Yoruba hearth cooking." },
            { icon: Truck, title: "Lagos Lightning Delivery", desc: "From our grill to your door in Alimosho and beyond in record time." }
          ].map((item, i) => (
            <div key={i} className="flex gap-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>

  {/* Stats Counter */}
  <section className="py-16 px-4 bg-background">
    <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      {stats.map((stat, i) => (
        <div key={i}>
          <div className="text-4xl md:text-5xl font-bold text-primary mb-2 font-headline">{stat.value}</div>
          <div className="text-sm uppercase tracking-widest text-muted-foreground font-bold">{stat.label}</div>
        </div>
      ))}
    </div>
  </section>

  {/* Testimonials */}
  <section className="py-24 px-4 overflow-hidden">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
         <h2 className="text-4xl md:text-5xl font-headline font-bold">What The Customers Say</h2>
      </div>
      
      <div className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex flex-nowrap gap-6 md:animate-marquee md:overflow-visible snap-x snap-mandatory scroll-smooth p-4">
         {[
           { name: "Tunde Ednut", role: "Lagos Foodie", comment: "The Asun is legendary. Best I've had in Alimosho area, hands down!" },
           { name: "Seyi Shay", role: "Artist", comment: "grillsJunction is the perfect late-night vibe. Their Catfish is 10/10." },
           { name: "Davido", role: "Customer", comment: "E choke! Best BBQ in the city. No cap." },
           { name: "Chioma", role: "Chef", comment: "The spice level is perfect. Truly premium quality." }
         ].map((review, i) => (
           <div key={i} className="glass-card p-8 rounded-[2.5rem] min-w-[260px] md:min-w-[400px] flex-shrink-0 snap-start">
             <div className="flex text-accent mb-4">
               {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
             </div>
             <p className="text-lg italic mb-6">"{review.comment}"</p>
             <div className="flex items-center gap-4">
               {/* <div className="w-10 h-10 rounded-full bg-primary/20" /> */}
               <div>
                 <p className="font-bold">{review.name}</p>
                 {/* <p className="text-xs text-muted-foreground">{review.role}</p> */}
               </div>
             </div>
           </div>
         ))}
      </div>
    </div>
  </div>
  </section>

  {/* Call to Action - Fixed Version */}
  <section className="py-20 px-4 bg-gradient-to-b from-background to-primary/5">
    <div className="max-w-4xl mx-auto">
      <div className="glass rounded-[3rem] p-8 md:p-16 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-primary/5 opacity-40" />
        
        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl md:text-6xl lg:text-7xl font-headline font-bold leading-tight">
            Hungry? <br />
            <span className="text-primary font-body not-italic">Order Now</span>
          </h2>
          
          <p className="text-base md:text-lg text-muted-foreground max-w-md mx-auto">
            Premium grill delivered in under 45 minutes
          </p>
          
          <Button 
            asChild 
            size="lg" 
            className="rounded-full bg-primary hover:bg-primary/90 text-white h-12 md:h-14 px-6 md:px-10 text-base md:text-lg font-bold shadow-lg shadow-primary/30 transition-all hover:scale-105"
          >
            <Link href="/menu">Place Order</Link>
          </Button>
        </div>
      </div>
    </div>
  </section>
</div>
  )
}