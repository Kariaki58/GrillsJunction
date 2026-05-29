
import type {Metadata} from 'next';
import './globals.css';
import { MobileNav } from '@/components/layout/MobileNav';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { Navbar } from '@/components/layout/Navbar';
import { FloatingWhatsApp } from '@/components/ui/FloatingWhatsApp';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'grillsJunction | Lagos’ Premium BBQ Experience',
  description: 'grillsJunction — luxury African BBQ specializing in Asun, Grilled Chicken, Catfish, and more. 24/7 delivery in Lagos.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-primary selection:text-primary-foreground">
        <Providers>
          <Navbar />
          <MobileHeader />
          <main className="pb-20 pt-[7.25rem] md:pt-0 md:pb-0 min-h-screen">
            {children}
          </main>
          <MobileNav />
          <FloatingWhatsApp />
        </Providers>
      </body>
    </html>
  );
}
