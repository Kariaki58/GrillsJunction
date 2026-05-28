
"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ShoppingCart, Flame, Star, Plus, Minus, Heart, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PlaceHolderImages } from '@/lib/placeholder-images'

const menuItems = [
  { id: 1, name: 'Special Lagos Asun', category: 'Asun', price: 4500, rating: 4.9, desc: 'Fiery goat meat, hand-cut and slow grilled with scotch bonnets.', image: 'asun-special', badge: 'Best Seller' },
  { id: 2, name: 'Flame BBQ Chicken', category: 'Chicken', price: 6500, rating: 4.8, desc: 'Half chicken marinated in Jiggy spices for 24 hours.', image: 'bbq-chicken', badge: 'Popular' },
  { id: 3, name: 'Premium Grilled Catfish', category: 'Fish', price: 8500, rating: 5.0, desc: 'Whole point-and-kill catfish, expertly seasoned.', image: 'catfish-bbq', badge: 'Fresh' },
  { id: 4, name: 'Suya Spiced Beef BBQ', category: 'Beef', price: 5500, rating: 4.7, desc: 'Tender beef chunks with yaji spice and grilled onions.', image: 'beef-bbq', badge: null },
  { id: 5, name: 'Jiggy Turkey Wings', category: 'Turkey', price: 4800, rating: 4.6, desc: 'Massive turkey wings, grilled till crispy and golden.', image: 'turkey-bbq', badge: null },
  { id: 6, name: 'Spicy Goat Chops', category: 'Asun', price: 7000, rating: 4.8, desc: 'Thick cut goat chops grilled over wood fire.', image: 'asun-special', badge: 'New' },
]

const categories = ['All', 'Asun', 'Chicken', 'Fish', 'Beef', 'Turkey', 'Drinks']

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="pt-24 md:pt-32 pb-24 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4">The Jiggy Menu</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Explore our premium selection of fire-grilled delicacies, prepared fresh in Alimosho, Lagos.</p>
        </header>

        {/* Search and Filters */}
        <div className="sticky top-20 z-30 mb-12 space-y-6">
          <div className="max-w-2xl mx-auto relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              placeholder="Search for Asun, Chicken, Catfish..."
              className="h-14 w-full pl-12 pr-4 rounded-full glass border-white/10 text-lg shadow-2xl focus:ring-primary outline-none focus:border-primary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full whitespace-nowrap transition-all duration-300 font-bold border ${
                  activeCategory === cat 
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                  : "bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative"
              >
                <Link href={`/menu/${item.id}`}>
                  <div className="glass-card rounded-[2rem] overflow-hidden flex flex-col h-full hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-white/5 group-hover:border-primary/20">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={PlaceHolderImages.find(i => i.id === item.image)?.imageUrl || ''}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <button className="p-2 glass rounded-full hover:bg-white/20 transition-colors">
                          <Heart className="w-5 h-5" />
                        </button>
                      </div>
                      {item.badge && (
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-primary text-white border-none px-3 py-1 font-bold">
                            {item.badge}
                          </Badge>
                        </div>
                      )}
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                         <div className="glass px-3 py-1 rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3 text-secondary fill-current" />
                            <span className="text-xs font-bold">{item.rating}</span>
                         </div>
                         <div className="glass px-3 py-1 rounded-full flex items-center gap-1">
                            <Flame className="w-3 h-3 text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Hot & Spicy</span>
                         </div>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                        {item.desc}
                      </p>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <div>
                          <span className="text-xs text-muted-foreground block font-bold uppercase">Price</span>
                          <span className="text-2xl font-bold">₦{item.price.toLocaleString()}</span>
                        </div>
                        <Button className="w-12 h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white p-0 shadow-lg shadow-primary/20">
                          <Plus className="w-6 h-6" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <Utensils className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-2xl font-bold">No BBQ found!</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

      {/* Floating Cart for Mobile */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 md:hidden w-[90%] pointer-events-none">
        <Link href="/cart" className="pointer-events-auto">
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="glass h-16 rounded-3xl flex items-center justify-between px-6 shadow-2xl bg-primary border-none text-white"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold opacity-80">3 ITEMS</p>
                <p className="font-bold">₦19,500.00</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">View Cart</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </motion.div>
        </Link>
      </div>
    </div>
  )
}

function Utensils(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  )
}
