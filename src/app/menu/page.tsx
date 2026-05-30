'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Flame, Star, Plus, ArrowRight, Utensils, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useCart } from '@/context/cart-context';
import { formatNaira } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';

interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  desc: string;
  image: string;
  badge: string | null;
}

function MenuContent() {
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categoryNames, setCategoryNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem, itemCount, subtotal } = useCart();
  const { toast } = useToast();
  const supabase = createClient();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const availableCategories = categoryNames;
  const categoryOptions = ['All', ...availableCategories];

  useEffect(() => {
    const category = searchParams.get('category');
    if (category && category !== 'All' && availableCategories.includes(category)) {
      setActiveCategory(category);
    }
    
    if (searchParams.get('focusSearch') === 'true') {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [searchParams, availableCategories]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      setIsLoading(true);
      const [{ data: menuData, error: menuError }, { data: categoriesData }] = await Promise.all([
        supabase.from('menu_items').select('*').order('id', { ascending: true }),
        supabase.from('categories').select('name').order('name', { ascending: true }),
      ]);

      if (!menuError && menuData) {
        setMenuItems(menuData);
      }
      if (categoriesData) {
        setCategoryNames(categoriesData.map((cat) => cat.name));
      }
      setIsLoading(false);
    };
    fetchMenuItems();
  }, []);

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    const url = new URL(window.location.href);
    if (cat === 'All') {
      url.searchParams.delete('category');
    } else {
      url.searchParams.set('category', cat);
    }
    window.history.replaceState({}, '', url.toString());
  };

  const getImageSrc = (image: string) => {
    if (!image) return PlaceHolderImages[0]?.imageUrl || '';
    if (image.startsWith('http')) return image;
    const placeholder = PlaceHolderImages.find((i) => i.id === image);
    return placeholder?.imageUrl || image; // Fallback to raw string if it's a custom path
  };

  return (
    <div className="pt-28 md:pt-32 pb-24 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4">
            The <span className="font-body not-italic">grillsJunction</span> Menu
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {activeCategory === 'All'
              ? 'Explore our premium selection of fire-grilled delicacies, prepared fresh in Alimosho, Lagos.'
              : `Showing ${activeCategory} — hand-grilled and ready to order.`}
          </p>
        </header>

        <div className="mb-12 space-y-6">
          <div className="max-w-2xl mx-auto relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              ref={searchInputRef}
              placeholder="Search for Asun, Chicken, Catfish..."
              className="h-14 w-full pl-12 pr-4 rounded-full glass border-border text-lg shadow-2xl focus:ring-primary outline-none focus:border-primary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar justify-center">
            {['All', ...categoryNames].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`px-6 py-2 rounded-full whitespace-nowrap transition-all duration-300 font-bold border ${
                  activeCategory === cat
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                    : 'bg-muted text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : (
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
                  <div className="glass-card rounded-[2rem] overflow-hidden flex flex-col h-full shadow-lg border-border group-hover:border-primary/20 transition-all duration-500">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={getImageSrc(item.image)}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
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
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            Hot & Spicy
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-2xl font-bold mb-2 transition-colors">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{item.desc}</p>

                      <div className="mt-auto flex items-center justify-between">
                        <div>
                          <span className="text-xs text-muted-foreground block font-bold uppercase">
                            Price
                          </span>
                          <span className="text-2xl font-bold">{formatNaira(item.price)}</span>
                        </div>
                        <Button
                          type="button"
                          onClick={() => handleAddToCart(item)}
                          className="w-12 h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white p-0 shadow-lg shadow-primary/20"
                          aria-label={`Add ${item.name} to cart`}
                        >
                          <Plus className="w-6 h-6" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!isLoading && filteredItems.length === 0 && (
          <div className="text-center py-20">
            <Utensils className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-2xl font-bold">No BBQ found!</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

      {itemCount > 0 && (
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
                  <p className="text-xs font-bold opacity-80">
                    {itemCount} {itemCount === 1 ? 'ITEM' : 'ITEMS'}
                  </p>
                  <p className="font-bold">{formatNaira(subtotal)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">View Cart</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </motion.div>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-28 md:pt-32 pb-24 px-4 min-h-screen flex items-center justify-center text-muted-foreground">
          Loading menu...
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}
