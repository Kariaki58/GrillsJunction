'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Menu', href: '/menu' },
  { name: 'About Us', href: '/about' },
  { name: 'Track Order', href: '/track' },
];

export function Navbar() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 hidden md:block">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <div className="glass min-h-[4.5rem] h-auto py-2 rounded-full flex items-center justify-between px-6 lg:px-8 shadow-2xl">
          <Link href="/" className="flex items-center shrink-0 group py-1">
            <Image
              src="/logo.png"
              alt="grillsJunction"
              width={280}
              height={231}
              className="h-14 lg:h-16 w-auto max-w-[200px] lg:max-w-[240px] object-contain group-hover:scale-[1.02] transition-transform"
              priority
            />
          </Link>

          <div className="flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === link.href ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
              <Search className="w-5 h-5" />
            </Button>
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-muted relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Button>
            </Link>
            <Button
              asChild
              className="rounded-full px-6 bg-primary hover:bg-primary/90 text-white font-bold"
            >
              <Link href="/menu">ORDER NOW</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
