import Link from 'next/link';
import { Instagram, MapPin, Mail, Phone } from 'lucide-react';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-stone-950 text-stone-300 py-12 md:py-16 mt-20 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          {/* Brand & Intro */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="grillsJunction"
                width={200}
                height={60}
                className="h-12 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-sm md:text-base leading-relaxed text-stone-400 max-w-md">
              Experience the authentic taste of Lagos with our premium BBQ and grilled selections. Bringing fiery flavor, luxury, and quality straight to your door.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-white font-bold text-lg font-heading tracking-wide uppercase">Quick Links</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link href="/menu" className="hover:text-primary transition-colors">Order Now</Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-primary transition-colors">Track Order</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-6">
            <h4 className="text-white font-bold text-lg font-heading tracking-wide uppercase">Connect</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <a href="mailto:admin@grillsjunction.com.ng" className="flex items-center gap-3 hover:text-primary transition-colors">
                  <Mail className="w-5 h-5 text-primary" />
                  admin@grillsjunction.com.ng
                </a>
              </li>
              <li>
                <a href="https://maps.app.goo.gl/h59fc4rasj68KjYu5" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary transition-colors">
                  <MapPin className="w-5 h-5 text-primary" />
                  Find us on Google Maps
                </a>
              </li>
            </ul>
            
            <div className="pt-4 flex items-center gap-4">
              <a 
                href="https://www.instagram.com/grillsjunction/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-stone-900 p-3 rounded-full hover:bg-primary hover:text-white transition-all transform hover:scale-110"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://www.tiktok.com/@grillsjunction" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-stone-900 px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-primary hover:text-white transition-all transform hover:scale-110 text-sm"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="fill-current">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.68a6.34 6.34 0 0 0 11.14 4.15c.08-.12.15-.25.21-.39V10.2a8.3 8.3 0 0 0 3.24.66z" />
                </svg>
                TikTok
              </a>
            </div>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-stone-800 text-center text-sm text-stone-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} grillsJunction. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-stone-300 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-stone-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
