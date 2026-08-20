'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Check, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  CreditCard, 
  Wallet, 
  BadgeCheck, 
  Smartphone,
  QrCode
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const LandingPricing: React.FC = () => {
  return (
    <section id="planes" className="py-16 md:py-24 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-xs font-bold uppercase tracking-widest text-[#059669] bg-[#059669]/10 px-3 py-1 rounded-full">
          Planes y Precios
        </span>
        <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-[#0b1c30] tracking-tight">
          Elige el plan ideal para tu negocio
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#3d4a42]">
          Comienza gratis y escala cuando tu negocio lo necesite. Sin contratos forzosos.
        </p>
      </div>

      {/* 2 Main Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch mb-16">
        
        {/* 1. PLAN GRATIS */}
        <div className="bg-white rounded-3xl p-7 sm:p-8 border border-[#bccac0]/40 shadow-xs flex flex-col justify-between relative hover:border-[#bccac0] transition-all">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-[#6d7a72] uppercase tracking-wider">
                Gratis
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Para empezar
              </span>
            </div>

            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl sm:text-5xl font-black text-[#0b1c30]">S/ 0</span>
              <span className="text-sm text-[#6d7a72]">/ siempre gratis</span>
            </div>
            <p className="text-xs text-[#3d4a42] mb-6">
              Para empezar a vender sin pagar. Incluye todo lo esencial para digitalizar tu negocio.
            </p>

            <div className="pt-6 border-t border-slate-100 space-y-3.5 text-sm text-[#0b1c30]">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#059669]/10 text-[#059669] flex items-center justify-center shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span><strong>Hasta 25 productos</strong></span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#059669]/10 text-[#059669] flex items-center justify-center shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span><strong>1 imagen</strong> por producto</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#059669]/10 text-[#059669] flex items-center justify-center shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span><strong>Código QR</strong> de la tienda listo</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#059669]/10 text-[#059669] flex items-center justify-center shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span>Compartir enlace de productos</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#059669]/10 text-[#059669] flex items-center justify-center shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span><strong>Pedidos por WhatsApp</strong></span>
              </div>

              <div className="flex items-center gap-3 text-slate-500">
                <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                  •
                </div>
                <span className="text-xs">Incluye marca "Creado por APANA"</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6">
            <Link href="/login" className="w-full block">
              <Button variant="outline" fullWidth size="lg" className="font-bold text-sm bg-white hover:bg-slate-50 border-[#bccac0]">
                Crear tienda gratis
              </Button>
            </Link>
          </div>
        </div>

        {/* 2. PLAN EMPRENDEDOR */}
        <div className="bg-linear-to-b from-[#f5fff7] via-white to-white rounded-3xl p-7 sm:p-8 border-2 border-[#059669] shadow-xl flex flex-col justify-between relative hover:shadow-2xl transition-all">
          {/* Badge Popular */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-linear-to-r from-[#059669] to-[#00855d] text-white text-xs font-extrabold px-4 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
            <Sparkles size={13} />
            Recomendado
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-[#059669] uppercase tracking-wider">
                Emprendedor
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#059669]/15 text-[#006c49]">
                Para negocios en crecimiento
              </span>
            </div>

            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl sm:text-5xl font-black text-[#0b1c30]">S/ 19.90</span>
              <span className="text-sm text-[#6d7a72]">/ mes</span>
            </div>
            <p className="text-xs text-[#3d4a42] mb-6">
              Para negocios que están creciendo y necesitan mayor capacidad y control de su marca.
            </p>

            <div className="pt-6 border-t border-emerald-100 space-y-3.5 text-sm text-[#0b1c30]">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span><strong>Hasta 250 productos</strong></span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span><strong>Hasta 4 imágenes</strong> por producto</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span><strong>Categorías de productos</strong></span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span><strong>Estadísticas básicas</strong> de visitas y clics</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span><strong>Más personalización</strong> y temas visuales</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span><strong>Sin marca "Creado por APANA"</strong></span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span><strong>Pedidos por WhatsApp y QR</strong></span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6">
            <Link href="/login" className="w-full block">
              <Button variant="primary" fullWidth size="lg" className="font-bold text-sm shadow-md shadow-[#059669]/20 flex items-center justify-center gap-2">
                Elegir Plan Emprendedor
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>

      </div>

      {/* COMPLEMENTARY ADD-ON SECTION: APANA PAGOS (PROXIMAMENTE) */}
      <div className="max-w-4xl mx-auto mt-6">
        <div className="bg-[#eff4ff]/70 border border-[#cbdbf5] rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          
          {/* Section Header for Payments */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-6 border-b border-[#bccac0]/30">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 text-xs font-bold mb-2 border border-amber-500/20">
                <Sparkles size={14} className="text-amber-600" />
                <span>Próximamente en APANA</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#0b1c30] tracking-tight">
                Próximamente: Cobros Online con Tarjeta (APANA Pagos)
              </h3>
              <p className="text-xs sm:text-sm text-[#3d4a42] mt-1">
                Actualmente tus ventas se gestionan 100% por WhatsApp. Pronto podrás activar cobros con tarjeta opcionales en cualquiera de tus planes.
              </p>
            </div>
          </div>

          {/* 2 Payment Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Option A: APANA Pagos */}
            <div className="bg-white/90 rounded-2xl p-5 border border-[#bccac0]/40 shadow-xs flex flex-col justify-between relative opacity-95">
              <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                Próximamente
              </span>
              <div>
                <div className="w-9 h-9 rounded-xl bg-[#eff4ff] text-[#059669] flex items-center justify-center font-bold mb-3">
                  <Wallet size={20} />
                </div>
                <h4 className="text-base font-extrabold text-[#0b1c30]">
                  APANA Pagos
                </h4>
                <p className="mt-1 text-xs text-[#059669] font-semibold">
                  "Conecta tu propia cuenta de pagos y cobra online."
                </p>
                <p className="mt-3 text-xs text-[#3d4a42] leading-relaxed">
                  Para cuando desees vincular tu propia cuenta de cobros existente y recibir el dinero de tus ventas directamente.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-[#6d7a72]">
                <BadgeCheck size={14} className="text-[#059669]" />
                <span>Integración directa con tu cuenta</span>
              </div>
            </div>

            {/* Option B: APANA Pagos Gestionado */}
            <div className="bg-white/90 rounded-2xl p-5 border border-[#059669]/30 shadow-xs flex flex-col justify-between relative opacity-95">
              <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                Próximamente
              </span>
              <div>
                <div className="w-9 h-9 rounded-xl bg-[#059669]/10 text-[#006c49] flex items-center justify-center font-bold mb-3">
                  <CreditCard size={20} />
                </div>
                <h4 className="text-base font-extrabold text-[#0b1c30]">
                  APANA Pagos Gestionado
                </h4>
                <p className="mt-1 text-xs text-[#059669] font-semibold">
                  "Cobra online sin preocuparte por la configuración de pagos."
                </p>
                <p className="mt-3 text-xs text-[#3d4a42] leading-relaxed">
                  Para procesar tarjetas sin trámites ni configuraciones. Nosotros recibiremos los pagos de tus clientes y te transferiremos tus fondos.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-[#6d7a72]">
                <BadgeCheck size={14} className="text-[#059669]" />
                <span>Listo para usar sin configuraciones técnicas</span>
              </div>
            </div>

          </div>

          <div className="mt-6 pt-4 border-t border-[#bccac0]/20 flex flex-col sm:flex-row items-center justify-between text-xs text-[#3d4a42] gap-3">
            <p>
              💡 <em>Hoy puedes empezar al 100% con pedidos y checkout por WhatsApp con tu catálogo listo en 1 minuto.</em>
            </p>
            <Link href="/login" className="font-bold text-[#059669] hover:underline shrink-0">
              Crear catálogo gratis →
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};
