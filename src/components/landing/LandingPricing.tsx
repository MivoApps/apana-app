'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Check, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Crown, 
  Zap,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const LandingPricing: React.FC = () => {
  return (
    <section id="planes" className="py-20 md:py-28 max-w-6xl mx-auto px-4 sm:px-6 relative">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#059669]/10 text-[#00855d] text-xs font-bold mb-3 border border-[#059669]/20 shadow-2xs">
          <Sparkles size={13} className="text-[#059669]" />
          <span>Planes Transparentes</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0b1c30] tracking-tight">
          Elige el plan ideal para tu negocio
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#3d4a42]">
          Comienza gratis sin tarjeta de crédito y mejora cuando tu catálogo o tus ventas crezcan.
        </p>
      </div>

      {/* 3 Main Subscription Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto items-stretch mb-16">
        
        {/* 1. PLAN GRATIS */}
        <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200 shadow-lg shadow-slate-200/30 flex flex-col justify-between relative hover:border-slate-300 transition-all">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Gratis
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Para empezar
              </span>
            </div>

            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl sm:text-5xl font-black text-[#0b1c30]">S/ 0</span>
              <span className="text-sm text-slate-500">/ siempre gratis</span>
            </div>
            <p className="text-xs text-[#3d4a42] mb-6">
              Para empezar a vender por WhatsApp sin pagar mensualidades ni comisiones.
            </p>

            <div className="pt-6 border-t border-slate-100 space-y-3.5 text-xs sm:text-sm text-[#0b1c30]">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span>Hasta <strong>25 productos</strong></span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span><strong>1 foto</strong> por producto</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span><strong>Checkout inteligente:</strong> captura datos y método de pago</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span><strong>Código QR y enlaces</strong> para compartir</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span>Pedidos directos a tu <strong>WhatsApp</strong></span>
              </div>

              <div className="flex items-center gap-3 text-slate-400 text-xs pt-1">
                <span>• Incluye marca "Creado por APANA"</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <Link href="/register">
              <Button
                variant="outline"
                fullWidth
                size="lg"
                className="font-bold border-slate-300 hover:border-[#059669] text-[#0b1c30] rounded-2xl h-12"
              >
                Comenzar gratis
              </Button>
            </Link>
          </div>
        </div>

        {/* 2. PLAN EMPRENDEDOR (DESTACADO CON GLOW) */}
        <div className="bg-linear-to-b from-[#f5fff7] via-white to-white rounded-3xl p-7 sm:p-9 border-2 border-[#059669] shadow-2xl shadow-emerald-500/15 relative flex flex-col justify-between scale-[1.02] z-10">
          <div className="absolute -top-4 right-6 bg-linear-to-r from-[#059669] to-[#00855d] text-white text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1.5">
            <Sparkles size={12} />
            <span>Recomendado</span>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-extrabold text-[#006c49] uppercase tracking-wider">
                Emprendedor
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Todo incluido
              </span>
            </div>

            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl sm:text-5xl font-black text-[#0b1c30]">
                S/ 19.90
              </span>
              <span className="text-sm text-slate-500">/ mes</span>
            </div>
            <p className="text-xs text-[#3d4a42] mb-6">
              Para negocios en crecimiento que quieren mayor capacidad, fotos múltiples y métricas.
            </p>

            <div className="pt-6 border-t border-emerald-100 space-y-3.5 text-xs sm:text-sm text-[#0b1c30]">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span>Hasta <strong>150 productos</strong></span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span>Hasta <strong>4 imágenes HD</strong> por producto</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span><strong>🔥 Precios de oferta tachados (% OFF)</strong></span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span><strong>🏷️ Insignias</strong> (Nuevo / Top Ventas)</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span><strong>Variantes con sobreprecio</strong> (2 grupos)</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span><strong>Categorías de productos</strong> ilimitadas</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span><strong>Métricas de visitas</strong> y clics</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span><strong>Sin marca "Creado por APANA"</strong></span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-emerald-100">
            <Link href="/register">
              <Button
                variant="primary"
                fullWidth
                size="lg"
                className="font-bold bg-[#059669] hover:bg-[#00855d] text-white rounded-2xl h-12 shadow-md shadow-[#059669]/30 flex items-center justify-center gap-2"
              >
                <span>Elegir Plan Emprendedor</span>
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>

        {/* 3. PLAN NEGOCIO PRO */}
        <div className="bg-white rounded-3xl p-7 sm:p-9 border-2 border-amber-300 shadow-lg shadow-amber-500/10 flex flex-col justify-between relative hover:border-amber-400 transition-all">
          <div className="absolute -top-4 right-6 bg-linear-to-r from-amber-600 to-amber-500 text-white text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
            <Crown size={12} />
            <span>Escala Total</span>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-extrabold text-amber-700 uppercase tracking-wider">
                Negocio Pro
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                Sin Límites
              </span>
            </div>

            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl sm:text-5xl font-black text-[#0b1c30]">
                S/ 39.90
              </span>
              <span className="text-sm text-slate-500">/ mes</span>
            </div>
            <p className="text-xs text-[#3d4a42] mb-6">
              Para marcas consolidadas y escala total.
            </p>

            <div className="pt-6 border-t border-slate-100 space-y-3.5 text-xs sm:text-sm text-[#0b1c30]">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span><strong>PRODUCTOS ILIMITADOS</strong></span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span><strong>Todo lo del Plan Emprendedor</strong></span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span><strong>📊 Exportación a Excel</strong> (Catálogo y Pedidos)</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span>Badge de <strong>Tienda Verificada Oficial</strong> 🛡️</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span>Soporte prioritario personalizado por WhatsApp</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-amber-100">
            <Link href="/register">
              <Button
                variant="outline"
                fullWidth
                size="lg"
                className="font-bold border-amber-300 hover:bg-amber-50 text-amber-900 rounded-2xl h-12"
              >
                Elegir Plan Negocio Pro
              </Button>
            </Link>
          </div>
        </div>

      </div>

      {/* Trust Guarantee Box */}
      <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#0b1c30]">Sin permanencias ni contratos forzosos</p>
            <p className="text-[11px] text-slate-500">Cancela o cambia de plan en cualquier momento con un solo clic.</p>
          </div>
        </div>
        <Link href="/terms" className="text-xs font-bold text-[#059669] hover:underline whitespace-nowrap">
          Términos y condiciones ➔
        </Link>
      </div>
    </section>
  );
};
