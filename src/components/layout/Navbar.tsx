
"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, User, Search, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Menu', href: '/menu' },
  { name: 'About Us', href: '/about' },
  { name: 'Track Order', href: '/track' },
  { name: 'Contact', href: '/contact' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 hidden md:block">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <div className="glass h-16 rounded-full flex items-center justify-between px-8 shadow-2xl">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <Flame className="text-white w-6 h-6" />
            </div>
            <span className="font-headline text-xl font-bold tracking-tight">
              JIGGY <span className="text-primary italic">GRILLS</span>
            </span>
          </Link>

          <div className="flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === link.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
              <Search className="w-5 h-5" />
            </Button>
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 relative">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-primary text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">3</span>
              </Button>
            </Link>
            <Button className="rounded-full px-6 bg-primary hover:bg-primary/90 text-white font-bold">
              ORDER NOW
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
