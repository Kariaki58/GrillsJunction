
"use client"

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, ShieldCheck, Flame, Users, ChefHat, Award } from 'lucide-react'
import { PlaceHolderImages } from '@/lib/placeholder-images'

export default function AboutPage() {
  return (
    <div className="pt-24 md:pt-32 pb-24 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Story Section */}
        <section className="grid lg:grid-cols-2 gap-16 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
             <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
             <h1 className="text-5xl md:text-7xl font-headline font-bold mb-8">The Smoke <br /><span className="text-gradient">Behind The Swagger</span></h1>
             <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Born in the heart of Meiran, Alimosho, Jiggy Grills & Asun isn't just a restaurant—it's a tribute to the nocturnal soul of Lagos. We believe that premium barbecue shouldn't be reserved for high-end lounges alone.
             </p>
             <p className="text-lg text-muted-foreground leading-relaxed">
                Founded in 2021 by Chef Jiggy, a visionary woman determined to redefine the street-food culture of Lagos, our mission was simple: 100% authentic flavors, served with 100% luxury vibes.
             </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative aspect-square rounded-[4rem] overflow-hidden rotate-3"
          >
            <Image
              src={PlaceHolderImages.find(i => i.id === 'vibe-3')?.imageUrl || ''}
              alt="Grill Master at Work"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
          </motion.div>
        </section>

        {/* Women Owned Spotlight */}
        <section className="glass rounded-[4rem] p-12 md:p-24 mb-32 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-48 -mt-48" />
           <div className="max-w-4xl mx-auto text-center relative z-10">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/30">
                 <Heart className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-4xl md:text-6xl font-headline font-bold mb-8 italic">Proudly Women-Owned</h2>
              <p className="text-xl text-warm-cream/80 leading-relaxed">
                 We are breaking barriers in the traditionally male-dominated world of Lagos pit-masters. Every spice blend is crafted with care, and every member of our team is family. When you eat at Jiggy, you're supporting local Lagos craftsmanship.
              </p>
           </div>
        </section>

        {/* Values */}
        <div className="grid md:grid-cols-3 gap-8 mb-32">
           {[
             { icon: ShieldCheck, title: "Uncompromising Quality", desc: "No frozen meats. No shortcuts. Just fresh, hand-rubbed proteins grilled to order." },
             { icon: Users, title: "Lagos Community", desc: "We employ locally and source our ingredients from Alimosho markets daily." },
             { icon: Award, title: "Premium Experience", desc: "From the packaging to the delivery, we ensure every interaction feels luxury." }
           ].map((v, i) => (
             <div key={i} className="glass-card p-10 rounded-[3rem] border-white/5 hover:border-primary/20 transition-colors">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 text-primary">
                   <v.icon className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-bold mb-4">{v.title}</h4>
                <p className="text-muted-foreground leading-relaxed">{v.desc}</p>
             </div>
           ))}
        </div>

        {/* Vibe Gallery */}
        <section className="mb-32">
           <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-headline font-bold">The Jiggy Vibe</h2>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: 'vibe-1', span: 'col-span-2' },
                { id: 'vibe-2', span: 'col-span-1' },
                { id: 'catfish-bbq', span: 'col-span-1' },
                { id: 'bbq-chicken', span: 'col-span-1' },
                { id: 'vibe-3', span: 'col-span-2' },
                { id: 'asun-special', span: 'col-span-1' },
              ].map((img, i) => (
                <div key={i} className={`relative aspect-square rounded-3xl overflow-hidden ${img.span}`}>
                   <Image
                      src={PlaceHolderImages.find(p => p.id === img.id)?.imageUrl || ''}
                      alt="Gallery"
                      fill
                      className="object-cover hover:scale-110 transition-transform duration-700"
                   />
                </div>
              ))}
           </div>
        </section>
      </div>
    </div>
  )
}
