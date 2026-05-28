
"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Utensils, ShoppingBag, MapPin, User, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const mobileTabs = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Menu', href: '/menu', icon: Utensils },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Track', href: '/track', icon: MapPin },
  { name: 'Profile', href: '/profile', icon: User },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe">
      <div className="mx-4 mb-4 glass rounded-3xl h-16 flex items-center justify-around px-2 shadow-2xl border-t border-white/10">
        {mobileTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = pathname === tab.href
          
          return (
            <Link 
              key={tab.href} 
              href={tab.href}
              className="relative flex flex-col items-center justify-center w-12 h-12 group"
            >
              <div className={cn(
                "p-2 rounded-xl transition-all duration-300",
                isActive ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-white"
              )}>
                <Icon className="w-6 h-6" />
              </div>
              {isActive && (
                <span className="absolute -top-1 w-1 h-1 bg-primary rounded-full" />
              )}
            </Link>
          )
        })}
        
        <Link href="/cart" className="relative group">
          <div className="p-3 bg-white/5 rounded-2xl text-primary border border-white/10">
            <ShoppingBag className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-background">
              2
            </span>
          </div>
        </Link>
      </div>
    </div>
  )
}
