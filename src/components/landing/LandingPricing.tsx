'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Check, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  CreditCard, 
  Crown, 
  Zap,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const LandingPricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  return (
    <section id="planes" className="py-20 md:py-28 max-w-6xl mx-auto px-4 sm:px-6 relative">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
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

        {/* Billing Cycle Switcher */}
        <div className="mt-8 inline-flex items-center p-1.5 rounded-2xl bg-slate-100 border border-slate-200 shadow-inner">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              billingCycle === 'monthly'
                ? 'bg-white text-[#0b1c30] shadow-sm'
                : 'text-slate-500 hover:text-[#0b1c30]'
            }`}
          >
            Facturación Mensual
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('annual')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              billingCycle === 'annual'
                ? 'bg-[#059669] text-white shadow-sm'
                : 'text-slate-500 hover:text-[#0b1c30]'
            }`}
          >
            <span>Facturación Anual</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              billingCycle === 'annual' ? 'bg-white text-[#059669]' : 'bg-emerald-100 text-emerald-800'
            }`}>
              2 Meses Gratis
            </span>
          </button>
        </div>
      </div>

      {/* 3 Main Subscription Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto items-stretch mb-16">
        
        {/* 1. PLAN GRATIS */}
        <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200 shadow-lg shadow-slate-200/30 flex flex-col justify-between relative hover:border-slate-300 transition-all">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Plan Básico
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                100% Gratis
              </span>
            </div>

            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl sm:text-5xl font-black text-[#0b1c30]">S/ 0</span>
              <span className="text-sm text-slate-500">/ siempre</span>
            </div>
            <p className="text-xs text-[#3d4a42] mb-6">
              Para digitalizar tu catálogo y empezar a recibir pedidos por WhatsApp sin costos fijos.
            </p>

            <div className="pt-6 border-t border-slate-100 space-y-3.5 text-xs sm:text-sm text-[#0b1c30]">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span><strong>Hasta 25 productos</strong> en catálogo</span>
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
                <span><strong>Variantes simples:</strong> 1 grupo sin precio diferencial</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span><strong>Código QR listo para imprimir</strong></span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span><strong>Checkout a WhatsApp</strong> con cálculo exacto</span>
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
            <span>Más Recomendado</span>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-extrabold text-[#006c49] uppercase tracking-wider">
                Plan Emprendedor
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Todo incluido
              </span>
            </div>

            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl sm:text-5xl font-black text-[#0b1c30]">
                {billingCycle === 'monthly' ? 'S/ 19.90' : 'S/ 16.50'}
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
                <span><strong>Hasta 150 productos</strong> en catálogo</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span><strong>Hasta 4 fotos</strong> por producto</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span><strong>Opciones con precios (+S/):</strong> hasta 2 grupos</span>
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
                <span><strong>Métricas y analíticas</strong> de visitas y clics</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span><strong>Sin marca APANA:</strong> 100% tu identidad</span>
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
                <span>Activar Plan Emprendedor</span>
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
                Plan Negocio Pro
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                Sin Límites
              </span>
            </div>

            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl sm:text-5xl font-black text-[#0b1c30]">
                {billingCycle === 'monthly' ? 'S/ 39.90' : 'S/ 33.25'}
              </span>
              <span className="text-sm text-slate-500">/ mes</span>
            </div>
            <p className="text-xs text-[#3d4a42] mb-6">
              Para marcas consolidadas que requieren catálogo ilimitado y fotos en variantes.
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
                <span><strong>Hasta 8 fotos</strong> por producto</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span><strong>Variantes ilimitadas</strong> con fotos</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span><strong>Insignia de Tienda Verificada</strong> VIP</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0">
                  <Check size={13} className="stroke-[3]" />
                </div>
                <span><strong>Soporte prioritario</strong> por WhatsApp</span>
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
                Activar Negocio Pro
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
            <p className="text-xs font-bold text-[#0b1c30]">Sin permanencias ni contratos ocultos</p>
            <p className="text-[11px] text-slate-500">Cancela o cambia de plan en cualquier momento desde tus ajustes.</p>
          </div>
        </div>
        <Link href="/terms" className="text-xs font-bold text-[#059669] hover:underline whitespace-nowrap">
          Términos y condiciones ➔
        </Link>
      </div>
    </section>
  );
};
