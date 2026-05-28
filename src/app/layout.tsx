
import type {Metadata} from 'next';
import './globals.css';
import { MobileNav } from '@/components/layout/MobileNav';
import { Navbar } from '@/components/layout/Navbar';
import { FloatingWhatsApp } from '@/components/ui/FloatingWhatsApp';

export const metadata: Metadata = {
  title: 'Jiggy Grills & Asun | Lagos’ Premium BBQ Experience',
  description: 'Luxury African BBQ brand specializing in Asun, Grilled Chicken, Catfish, and more. 24/7 Delivery in Lagos.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-primary selection:text-white">
        <Navbar />
        <main className="pb-20 md:pb-0 min-h-screen">
          {children}
        </main>
        <MobileNav />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
