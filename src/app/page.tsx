"use client"

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Truck, ShieldCheck, ArrowRight, Star, Plus, Search, Loader2, ShoppingCart, ChevronLeft, ChevronRight, Utensils, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { createClient } from '@/lib/supabase/client'
import { defaultSiteSettings, type SiteSettings } from '@/lib/site-settings'
import { useCart } from '@/context/cart-context'
import { useToast } from '@/hooks/use-toast'
import { formatNaira } from '@/lib/format'

interface MenuItem {
  id: number;
  name: string;
  price: number;
  rating: number;
  desc: string;
  image: string;
  badge: string | null;
}

const stats = [
  { label: 'Happy Customers', value: '2k+' },
  { label: 'Orders Served', value: '8k+' },
  { label: 'Lagos Location', value: '1' },
  { label: 'Avg Delivery Time', value: '35m' },
]

const PAGE_SIZE = 10;

// Categories are derived from the menu item names (no backend column needed).
// Each rule maps a set of keywords to a category label; the first match wins.
// Anything that isn't a Shawarma or a Drink falls back to "Grills".
const DEFAULT_CATEGORY = 'Grills'

const CATEGORY_RULES: { name: string; match: RegExp }[] = [
  { name: 'Shawarma', match: /shawarma|shawama|schawarma/i },
  { name: 'Drinks', match: /cocktail|drink|juice|water|soda|wine|beer|smoothie|zobo|chapman|malt|mocktail/i },
]

// Display order for the toggle pills (only those with dishes are shown).
const CATEGORY_ORDER = ['Shawarma', 'Drinks', DEFAULT_CATEGORY]

function getCategory(name: string): string {
  const rule = CATEGORY_RULES.find((r) => r.match.test(name))
  return rule ? rule.name : DEFAULT_CATEGORY
}

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-bg')
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [page, setPage] = useState(1)
  const [expandedDescId, setExpandedDescId] = useState<number | null>(null)
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings)
  const supabase = createClient()
  const { addItem, itemCount, subtotal } = useCart()
  const { toast } = useToast()

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
    });
    toast({
      title: 'Added to cart',
      description: `${item.name} — ${formatNaira(item.price)}`,
    });
  };

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('id', { ascending: true })

      if (!error && data) {
        setMenuItems(data)
      }
      setIsLoading(false)
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

  // Build the list of category pills from the dishes we actually have,
  // keeping a sensible order and always leading with "All".
  const categories = useMemo(() => {
    const present = new Set(menuItems.map((item) => getCategory(item.name)))
    const ordered = CATEGORY_ORDER.filter((name) => present.has(name))
    return ['All', ...ordered]
  }, [menuItems])

  const filteredItems = useMemo(
    () =>
      menuItems.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === 'All' || getCategory(item.name) === selectedCategory
        return matchesSearch && matchesCategory
      }),
    [menuItems, searchQuery, selectedCategory]
  )

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE))
  const showPagination = filteredItems.length > PAGE_SIZE

  // Keep the current page valid when the filter/result set changes.
  useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedCategory])

  // If the active category disappears (e.g. data reloads), fall back to "All".
  useEffect(() => {
    if (!categories.includes(selectedCategory)) {
      setSelectedCategory('All')
    }
  }, [categories, selectedCategory])

  const currentPage = Math.min(page, totalPages)
  const pagedItems = filteredItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const goToPage = (next: number) => {
    setPage(Math.min(Math.max(1, next), totalPages))
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

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
            <Link href="/#menu">Order Now</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white h-14 px-10 text-lg font-bold w-full sm:w-auto backdrop-blur-sm">
            <Link href="/#menu">Explore Menu</Link>
          </Button>
        </div>

        <p className="text-[10px] sm:text-xs md:text-sm tracking-[0.25em] sm:tracking-[0.3em] font-medium text-white/60 uppercase">
          Order Today <span className="mx-1.5 sm:mx-3 text-primary/80">•</span> Takeaway <span className="mx-1.5 sm:mx-3 text-primary/80">•</span> Delivery
        </p>
      </motion.div>
    </div>
  </section>

  {/* Full Menu — The Grill List */}
  <section id="menu" className="py-16 md:py-24 px-4 bg-background scroll-mt-24">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8 md:mb-12">
        <p className="text-primary font-bold text-xs md:text-sm tracking-widest uppercase mb-2">Our Specialties</p>
        <h2 className="text-3xl md:text-5xl font-headline font-bold">The Grill List</h2>
        <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto mt-3">
          Explore our premium selection of fire-grilled delicacies, prepared fresh in Abule Egba, Lagos.
        </p>
      </div>

      {/* Friendly note about hours & prep times */}
      <div className="max-w-3xl mx-auto mb-8 md:mb-10">
        <div className="rounded-2xl md:rounded-3xl border border-primary/20 bg-primary/5 p-4 md:p-6 flex gap-3 md:gap-4 text-left">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div className="text-sm md:text-[0.95rem] leading-relaxed text-foreground/80">
            <p className="font-bold text-foreground mb-1">A note from us 😊</p>
            <p>
              We are not a fast food restaurant dear sponsor/queen 😊 we open for{' '}
              <span className="font-semibold text-foreground">12pm</span> and delivery or pickup start by{' '}
              <span className="font-semibold text-foreground">2pm</span>. All orders after 3pm takes{' '}
              <span className="font-semibold text-foreground">30–40 minutes</span> to be ready. Our meals/sides
              are freshly prepared as you order.
            </p>
            <p className="mt-1.5">Thank you for always buying from us ☺️✨</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 md:mb-10">
        <div className="max-w-2xl mx-auto relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            placeholder="Search for Asun, Chicken, Catfish..."
            className="h-12 md:h-14 w-full pl-12 pr-4 rounded-full glass border-border text-base md:text-lg shadow-xl focus:ring-primary outline-none focus:border-primary/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {!isLoading && (
          <p className="text-center text-xs md:text-sm text-muted-foreground mt-4">
            {filteredItems.length} {filteredItems.length === 1 ? 'dish' : 'dishes'}
            {searchQuery ? ` matching “${searchQuery}”` : ' on the grill'}
            {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
          </p>
        )}
      </div>

      {/* Category toggle — derived from the menu names, no backend needed */}
      {!isLoading && categories.length > 1 && (
        <div className="mb-8 md:mb-10 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-2 md:gap-3 overflow-x-auto no-scrollbar pb-1 sm:flex-wrap sm:justify-center">
            {categories.map((category) => {
              const isActive = category === selectedCategory
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  aria-pressed={isActive}
                  className={`shrink-0 rounded-full px-4 md:px-5 h-9 md:h-10 text-sm md:text-base font-bold border transition-all ${
                    isActive
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                      : 'glass border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
                  }`}
                >
                  {category}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-8">
            <AnimatePresence mode="popLayout">
              {pagedItems.map((item, idx) => {
                const imageValue = item.image || '';
                const imageSrc = imageValue.startsWith('http')
                  ? imageValue
                  : PlaceHolderImages.find(i => i.id === imageValue)?.imageUrl || PlaceHolderImages[0]?.imageUrl || '';
                const isExpanded = expandedDescId === item.id;
                const desc = item.desc || '';
                const shouldTruncate = desc.length > 35;
                const displayDesc = (isExpanded || !shouldTruncate) ? desc : desc.slice(0, 35) + '...';
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: Math.min(idx, 8) * 0.05 }}
                  >
                    <div className="glass-card rounded-2xl md:rounded-[2rem] overflow-hidden flex flex-col h-full shadow-md hover:shadow-xl border border-border hover:border-primary/30 transition-all duration-500 active:scale-[0.98] bg-white dark:bg-slate-900">
                      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <Image
                          src={imageSrc}
                          alt={item.name}
                          fill
                          sizes="(max-width: 1024px) 50vw, 25vw"
                          className="object-cover hover:scale-105 transition-transform duration-700"
                        />
                        {item.badge && (
                          <div className="absolute top-2.5 left-2.5 md:top-4 md:left-4">
                            <Badge className="bg-primary text-white border-none px-2.5 py-0.5 text-[10px] md:text-xs font-bold shadow-md">
                              {item.badge}
                            </Badge>
                          </div>
                        )}
                        {item.rating ? (
                          <div className="absolute top-2.5 right-2.5 md:top-4 md:right-4 flex items-center gap-1 rounded-full bg-white/90 backdrop-blur px-2 py-0.5 shadow-sm">
                            <Star className="w-3 h-3 text-amber-500 fill-current" />
                            <span className="text-[10px] md:text-xs font-bold text-slate-800">{item.rating}</span>
                          </div>
                        ) : null}
                      </div>
                      <div className="p-3.5 md:p-6 flex-1 flex flex-col">
                        <h3 className="text-base md:text-xl font-bold mb-1.5 leading-tight line-clamp-1">{item.name}</h3>
                        <p
                          className={`text-xs md:text-sm text-muted-foreground ${
                            isExpanded ? '' : 'line-clamp-1'
                          }`}
                        >
                          {displayDesc}
                        </p>

                        {shouldTruncate && (
                          <button
                            onClick={() => setExpandedDescId(isExpanded ? null : item.id)}
                            className="block mb-1 mt-0 text-primary font-semibold text-xs hover:underline text-left"
                          >
                            {isExpanded ? 'See less' : 'See more'}
                          </button>
                        )}
                        <div className="mt-auto flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            {/* <span className="text-[10px] md:text-xs text-muted-foreground block font-bold uppercase tracking-wide">Price</span> */}
                            <span className="text-base md:text-xl font-bold">{formatNaira(item.price)}</span>
                          </div>
                          <Button
                            type="button"
                            onClick={() => handleAddToCart(item)}
                            className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary hover:bg-primary/90 text-white p-0 shadow-lg shadow-primary/20 shrink-0"
                            aria-label={`Add ${item.name} to cart`}
                          >
                            <Plus className="w-5 h-5 md:w-6 md:h-6" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <Utensils className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-2xl font-bold">No BBQ found!</h3>
              <p className="text-muted-foreground">Try a different search.</p>
            </div>
          )}

          {/* Pagination — only when there are more than 10 dishes */}
          {showPagination && (
            <div className="mt-10 flex items-center justify-center gap-1.5 sm:gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-10 w-10 shrink-0"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`h-10 w-10 rounded-full text-sm font-bold transition-colors ${
                    p === currentPage
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'bg-muted text-muted-foreground hover:bg-muted/70'
                  }`}
                  aria-label={`Page ${p}`}
                  aria-current={p === currentPage ? 'page' : undefined}
                >
                  {p}
                </button>
              ))}
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-10 w-10 shrink-0"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  </section>

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
            { icon: Truck, title: "Lagos Lightning Delivery", desc: "From our grill to your door in Abule Egba and beyond in record time." }
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
           { name: "Tunde Ednut", role: "Lagos Foodie", comment: "The Asun is legendary. Best I've had in the Abule Egba area, hands down!" },
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
               <div>
                 <p className="font-bold">{review.name}</p>
               </div>
             </div>
           </div>
         ))}
      </div>
    </div>
  </div>
  </section>

  {/* Call to Action */}
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
            <Link href="/#menu">Place Order</Link>
          </Button>
        </div>
      </div>
    </div>
  </section>

  {/* Floating cart bar (mobile) */}
  {itemCount > 0 && (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 md:hidden w-[90%] pointer-events-none">
      <Link href="/cart" className="pointer-events-auto">
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="glass h-16 rounded-3xl flex items-center justify-between px-6 shadow-2xl bg-primary border-none text-white"
        >
          <div className="flex items-center gap-3 text-black">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold opacity-80">
                {itemCount} {itemCount === 1 ? 'ITEM' : 'ITEMS'}
              </p>
              <p className="font-bold">{formatNaira(subtotal)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-black">
            <span className="font-bold">View Cart</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </motion.div>
      </Link>
    </div>
  )}
</div>
  )
}
