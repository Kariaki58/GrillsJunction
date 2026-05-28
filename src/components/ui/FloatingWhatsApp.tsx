
"use client"

import { MessageCircle } from 'lucide-react'

export function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.me/2347017398454"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-6 bottom-24 md:bottom-8 z-40 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all animate-bounce md:animate-none"
    >
      <MessageCircle className="w-6 h-6 fill-white text-[#25D366]" />
      <span className="sr-only">Contact on WhatsApp</span>
    </a>
  )
}
