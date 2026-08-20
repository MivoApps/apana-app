'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2, Zap, Smartphone, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const LandingHero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
      {/* Background Glows and Decorative Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-linear-to-tr from-[#85f8c4]/25 to-[#059669]/15 blur-3xl rounded-full pointer-events-none -z-10" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#6cf8bb]/15 blur-2xl rounded-full pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center">
        {/* Transparency / Micro-tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#059669]/25 shadow-xs mb-6 text-xs font-semibold text-[#006c49] animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Sparkles size={14} className="text-[#059669]" />
          <span>La forma más rápida y directa de vender por internet</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#0b1c30] tracking-tight leading-[1.15] max-w-4xl text-balance">
          Tu catálogo digital para vender por{' '}
          <span className="bg-linear-to-r from-[#059669] via-[#00855d] to-[#006c49] bg-clip-text text-transparent underline decoration-[#6cf8bb]/60 decoration-wavy decoration-2">
            WhatsApp
          </span>{' '}
          y cobrar online, fácil y sin enredos.
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-[#3d4a42] max-w-2xl leading-relaxed text-balance">
          Tu tienda online <strong className="text-[#0b1c30] font-bold">lista en 1 minuto</strong>. Sube tus productos, genera tu código QR para tu local o redes, y recibe pedidos con cálculo exacto listos para despachar por WhatsApp.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
          <Link href="/login" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto text-base font-bold px-7 py-3.5 shadow-md shadow-[#059669]/25 hover:shadow-lg hover:shadow-[#059669]/35 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5"
            >
              <span>Ingresar como emprendedor</span>
              <ArrowRight size={18} />
            </Button>
          </Link>

          <Link href="/s/panaderia-don-jose" target="_blank" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-base font-medium px-6 py-3.5 bg-white/80 hover:bg-white text-[#0b1c30] border-[#bccac0] hover:border-[#059669] transition-all flex items-center justify-center gap-2"
            >
              <Smartphone size={18} className="text-[#059669]" />
              <span>Ver tienda de ejemplo</span>
            </Button>
          </Link>
        </div>

        {/* Value Trust Badges */}
        <div className="mt-10 pt-8 border-t border-[#bccac0]/30 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full text-left">
          <div className="flex items-center gap-3 bg-white/70 backdrop-blur-xs p-3 rounded-xl border border-[#bccac0]/25 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-[#059669]/10 text-[#059669] flex items-center justify-center shrink-0">
              <Zap size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#0b1c30]">Lista en 1 minuto</p>
              <p className="text-[11px] text-[#6d7a72]">Configuración instantánea</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/70 backdrop-blur-xs p-3 rounded-xl border border-[#bccac0]/25 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-[#059669]/10 text-[#059669] flex items-center justify-center shrink-0">
              <CreditCard size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#0b1c30]">Pedidos a tu WhatsApp</p>
              <p className="text-[11px] text-[#6d7a72]">Acuerda el pago directo y seguro</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/70 backdrop-blur-xs p-3 rounded-xl border border-[#bccac0]/25 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-[#059669]/10 text-[#059669] flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#0b1c30]">Sin apps que instalar</p>
              <p className="text-[11px] text-[#6d7a72]">Tus clientes compran desde su navegador</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
