'use client';

import React from 'react';
import { 
  Check, 
  Sparkles, 
  Smartphone, 
  Layers, 
  Eye, 
  Palette, 
  Zap, 
  QrCode, 
  CreditCard, 
  Percent, 
  ShieldCheck, 
  CheckCheck,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

export const LandingFeaturesMatrix: React.FC = () => {
  return (
    <section id="funciones" className="py-20 md:py-28 bg-[#eff4ff]/60 border-y border-[#bccac0]/25 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-10 right-10 w-80 h-80 bg-[#85f8c4]/15 blur-3xl rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#3b82f6]/10 blur-3xl rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#059669]/10 text-[#00855d] text-xs font-bold mb-3 border border-[#059669]/20 shadow-2xs">
            <Sparkles size={13} className="text-[#059669]" />
            <span>Potencia tus Ventas</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0b1c30] tracking-tight">
            Herramientas diseñadas para hacerte vender más
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#3d4a42]">
            Todo lo que tu comercio necesita para verse profesional, generar confianza y automatizar pedidos.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Bento Card 1 (Large 8 cols): Catálogo Móvil & Variantes */}
          <div className="md:col-span-7 lg:col-span-8 bg-white rounded-3xl p-7 sm:p-9 border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col justify-between relative overflow-hidden group hover:border-[#059669]/40 transition-all">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center mb-6 shadow-2xs">
                <Smartphone size={24} />
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Experiencia Ultra Rápida
              </span>
              <h3 className="text-2xl font-black text-[#0b1c30] mt-3 mb-2">
                Catálogo Web con Opciones y Variantes
              </h3>
              <p className="text-sm text-[#3d4a42] max-w-md leading-relaxed">
                Tus clientes seleccionan tallas, sabores, colores o presentaciones con precios diferenciales calculados al segundo.
              </p>
            </div>

            {/* Visual Interactive Preview Pills */}
            <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-left">
                <p className="text-xs font-bold text-[#0b1c30]">Tallas & Medidas</p>
                <p className="text-[11px] text-slate-500">S, M, L, XL (+S/ 5.00)</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-left">
                <p className="text-xs font-bold text-[#0b1c30]">Sabores & Rellenos</p>
                <p className="text-[11px] text-slate-500">Chocolate, Vainilla</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-left col-span-2 sm:col-span-1">
                <p className="text-xs font-bold text-[#0b1c30]">Fotos en Galería</p>
                <p className="text-[11px] text-slate-500">Hasta 8 fotos por producto</p>
              </div>
            </div>
          </div>

          {/* Bento Card 2 (Medium 4 cols): Pagos Digitales con Culqi */}
          <div className="md:col-span-5 lg:col-span-4 bg-linear-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-7 sm:p-9 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-indigo-300 flex items-center justify-center mb-6 backdrop-blur-md">
                <CreditCard size={24} />
              </div>
              <span className="text-xs font-bold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30">
                ⚡ Próximamente
              </span>
              <h3 className="text-2xl font-black text-white mt-3 mb-2">
                Cobra con Tarjetas & Yape
              </h3>
              <p className="text-sm text-indigo-200 leading-relaxed">
                Muy pronto: Integración nativa con Culqi para recibir pagos con tarjeta de crédito/débito y Yape directo en tu catálogo.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-2 text-xs font-bold text-indigo-300 bg-white/5 p-3 rounded-2xl border border-white/10">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Transacciones seguras y automáticas</span>
            </div>
          </div>

          {/* Bento Card 3 (Medium 4 cols): Código QR para Mesas & Mostrador */}
          <div className="md:col-span-6 lg:col-span-4 bg-white rounded-3xl p-7 sm:p-9 border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col justify-between hover:border-[#059669]/40 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 shadow-2xs">
                <QrCode size={24} />
              </div>
              <h3 className="text-xl font-extrabold text-[#0b1c30] mb-2">
                Código QR de Alta Definición
              </h3>
              <p className="text-xs text-[#3d4a42] leading-relaxed">
                Descarga tu código QR en vector o PNG para imprimir en acrílicos, mesas, empaques o vitrinas.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 p-2.5 rounded-xl border border-blue-200">
              <CheckCheck size={15} />
              <span>Escaneo instantáneo con cualquier cámara</span>
            </div>
          </div>

          {/* Bento Card 4 (Medium 4 cols): Ofertas & Precios Tachados */}
          <div className="md:col-span-6 lg:col-span-4 bg-white rounded-3xl p-7 sm:p-9 border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col justify-between hover:border-rose-400/40 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6 shadow-2xs">
                <Percent size={24} />
              </div>
              <h3 className="text-xl font-extrabold text-[#0b1c30] mb-2">
                Precios Tachados e Insignias
              </h3>
              <p className="text-xs text-[#3d4a42] leading-relaxed">
                Destaca productos con etiquetas de <strong className="text-rose-600 font-bold">"OFERTA"</strong> o <strong className="text-amber-600 font-bold">"MÁS VENDIDO"</strong> y muestra descuentos atractivos.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              <span>🔥 Aumenta la tasa de conversión en 35%</span>
            </div>
          </div>

          {/* Bento Card 5 (Medium 4 cols): Métricas & Visitas en Vivo */}
          <div className="md:col-span-12 lg:col-span-4 bg-white rounded-3xl p-7 sm:p-9 border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col justify-between hover:border-emerald-400/40 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center mb-6 shadow-2xs">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-extrabold text-[#0b1c30] mb-2">
                Métricas y Analíticas en Vivo
              </h3>
              <p className="text-xs text-[#3d4a42] leading-relaxed">
                Monitorea cuántos clientes visitan tu catálogo, qué productos son los más vistos y el valor de tus carritos.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
              <span>📊 Métricas por día, semana y mes</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
