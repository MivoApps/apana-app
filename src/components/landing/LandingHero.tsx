'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Zap,
  Smartphone,
  CreditCard,
  QrCode,
  CheckCheck,
  ChevronDown
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { Button } from '@/components/ui/Button';

export const LandingHero: React.FC = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background Animated Glows & Mesh Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-linear-to-tr from-[#85f8c4]/30 via-[#059669]/20 to-[#3b82f6]/10 blur-3xl rounded-full pointer-events-none -z-10 animate-float-slow" />
      <div className="absolute top-24 right-6 md:right-24 w-80 h-80 bg-[#6cf8bb]/20 blur-3xl rounded-full pointer-events-none -z-10 animate-float-reverse" />
      <div className="absolute top-48 left-6 md:left-24 w-72 h-72 bg-[#38bdf8]/15 blur-3xl rounded-full pointer-events-none -z-10 animate-float-slow" />

      {/* Floating Mockup Badges (Solo Desktop & Tablet) */}
      <div className="hidden lg:flex items-center gap-3 absolute top-40 left-8 xl:left-20 bg-white/85 backdrop-blur-md p-3.5 rounded-2xl border border-white/90 shadow-xl shadow-slate-200/50 z-20 animate-float-slow hover:scale-105 transition-transform select-none">
        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
          <WhatsAppIcon size={20} className="fill-white" />
        </div>
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-extrabold text-[#0b1c30]">Nuevo Pedido WhatsApp</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Pan Campesino x2 • <strong className="text-emerald-700 font-bold">S/ 18.00</strong></span>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-3 absolute top-60 right-8 xl:right-20 bg-white/85 backdrop-blur-md p-3.5 rounded-2xl border border-white/90 shadow-xl shadow-slate-200/50 z-20 animate-float-reverse hover:scale-105 transition-transform select-none">
        <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-sm">
          <QrCode size={20} />
        </div>
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-extrabold text-[#0b1c30]">QR Escaneado en Mesa</span>
            <CheckCheck size={13} className="text-indigo-600" />
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Catálogo abierto al instante</span>
        </div>
      </div>

      {/* 1. First Screen Fold: Exact 100svh Viewport on Mobile */}
      <section className="min-h-[100svh] flex flex-col justify-between pt-20 pb-6 sm:pt-32 sm:pb-10 relative z-10">
        {/* Spacer top */}
        <div className="w-full h-1" />

        {/* Center Main Hero Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center justify-center my-auto">
          {/* Transparency / Micro-tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#059669]/30 shadow-xs mb-4 text-xs font-semibold text-[#006c49] animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Sparkles size={14} className="text-[#059669] animate-spin-slow" />
            <span>La forma más rápida y moderna de vender por internet</span>
          </div>

          {/* Hero Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-[#0b1c30] tracking-tight leading-[1.14] max-w-4xl text-balance">
            Tu catálogo digital para vender por{' '}
            <span className="bg-linear-to-r from-[#059669] via-[#00855d] to-[#006c49] bg-clip-text text-transparent underline decoration-[#6cf8bb]/80 decoration-wavy decoration-2">
              WhatsApp
            </span>{' '}
            y cobrar online, fácil y sin enredos.
          </h1>

          {/* Hero Subtitle */}
          <p className="mt-4 sm:mt-6 text-sm sm:text-lg md:text-xl text-[#3d4a42] max-w-2xl leading-relaxed text-balance">
            Tu tienda online <strong className="text-[#0b1c30] font-bold">lista en 3 minutos*</strong>. Sube tus productos, genera tu código QR para tu local o redes, y recibe pedidos con cálculo exacto listos para despachar por WhatsApp.
          </p>

          {/* Action Buttons */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto text-base font-bold px-8 py-3.5 sm:py-4 bg-[#059669] hover:bg-[#00855d] text-white shadow-xl shadow-[#059669]/25 hover:shadow-2xl hover:shadow-[#059669]/35 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 rounded-2xl relative overflow-hidden group"
              >
                <span className="relative z-10">Crear mi tienda gratis</span>
                <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000" />
              </Button>
            </Link>

            <Link href="/s/panaderia-don-jose" target="_blank" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-base font-semibold px-6 py-3.5 sm:py-4 bg-white/85 hover:bg-white text-[#0b1c30] border-[#bccac0]/60 hover:border-[#059669] shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 rounded-2xl"
              >
                <Smartphone size={18} className="text-[#059669]" />
                <span>Ver tienda de ejemplo</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Bottom Screen Element: ONLY the Scroll Down Arrow */}
        <div className="w-full flex justify-center pb-2">
          <div
            onClick={() => {
              const el = document.getElementById('hero-features');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-[#059669] transition-colors cursor-pointer group select-none"
          >
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-[#059669] transition-colors">
              Desliza para ver más
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 border border-slate-200/80 shadow-xs flex items-center justify-center animate-bounce group-hover:border-[#059669]/40 group-hover:shadow-md transition-all">
              <ChevronDown size={16} className="text-[#059669]" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Below The Fold Section (Solo visible al scrollear o apretar el botón) */}
      <section id="hero-features" className="max-w-5xl mx-auto px-4 sm:px-6 w-full py-12 sm:py-16 scroll-mt-20 relative z-10">
        <div className="pt-6 border-t border-[#bccac0]/30 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md p-3.5 rounded-2xl border border-white/80 shadow-xs hover:border-[#059669]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-[#059669] flex items-center justify-center shrink-0">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#0b1c30]">Lista en 3 minutos*</p>
              <p className="text-[11px] text-[#6d7a72]">Configuración instantánea</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md p-3.5 rounded-2xl border border-white/80 shadow-xs hover:border-[#059669]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-[#059669] flex items-center justify-center shrink-0">
              <CreditCard size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#0b1c30]">Pedidos a tu WhatsApp</p>
              <p className="text-[11px] text-[#6d7a72]">Acuerda el pago directo y seguro</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md p-3.5 rounded-2xl border border-white/80 shadow-xs hover:border-[#059669]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-[#059669] flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#0b1c30]">Sin apps que instalar</p>
              <p className="text-[11px] text-[#6d7a72]">Tus clientes compran desde su navegador</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
