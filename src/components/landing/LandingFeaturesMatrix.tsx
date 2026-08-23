'use client';

import React from 'react';
import { Check, Sparkles, Smartphone, Layers, Eye, Palette, Zap, Crown } from 'lucide-react';
import Link from 'next/link';

export const LandingFeaturesMatrix: React.FC = () => {
  return (
    <section id="funciones" className="py-16 md:py-24 bg-[#eff4ff]/40 border-y border-[#bccac0]/25">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#006c49] bg-[#6cf8bb]/30 px-3 py-1 rounded-full border border-[#059669]/20">
            Transparencia total
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-[#0b1c30] tracking-tight">
            Todo lo que necesitas para tu negocio
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#3d4a42]">
            Empieza con todo lo esencial completamente gratis y mejora tu plan cuando tu catálogo o tus ventas crezcan.
          </p>
        </div>

        {/* 3 Column Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Card 1: Lo Básico (Plan Gratis) */}
          <div className="bg-white rounded-3xl p-7 sm:p-8 border border-[#bccac0]/40 shadow-xs flex flex-col justify-between hover:border-[#bccac0] transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#059669] flex items-center justify-center font-bold">
                  <Smartphone size={22} />
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
                  Plan Gratis
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-[#0b1c30]">
                Lo Básico: Para empezar hoy
              </h3>
              <p className="mt-2 text-xs text-[#3d4a42] leading-relaxed">
                Herramientas fundamentales para digitalizar tu negocio y dejar atrás las listas en fotos o texto plano.
              </p>

              <ul className="mt-6 space-y-3.5 text-xs sm:text-sm text-[#0b1c30]">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#059669]/10 text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <strong className="font-semibold">Hasta 25 productos activos:</strong> Ideal para cartas, postres o tiendas pequeñas.
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#059669]/10 text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <strong className="font-semibold">1 imagen por producto:</strong> Foto nítida y optimizada de cada artículo.
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#059669]/10 text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <strong className="font-semibold">Variantes simples:</strong> 1 grupo de opciones (ej. Tallas S, M, L o Colores) con precio base.
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#059669]/10 text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <strong className="font-semibold">Código QR listo para tu local:</strong> Descárgalo e imprímelo en tus mesas o vitrina.
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#059669]/10 text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <strong className="font-semibold">Pedidos automáticos por WhatsApp:</strong> Recibe pedidos detallados con total sumado.
                  </div>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link href="/register" className="block text-center py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0b1c30] font-bold text-xs transition-colors">
                Comenzar gratis
              </Link>
            </div>
          </div>

          {/* Card 2: Lo Avanzado (Plan Emprendedor) */}
          <div className="bg-linear-to-b from-[#f5fff7] to-white rounded-3xl p-7 sm:p-8 border-2 border-[#059669] shadow-md relative flex flex-col justify-between scale-[1.01]">
            <div className="absolute -top-3.5 right-6 bg-linear-to-r from-[#059669] to-[#00855d] text-white text-[11px] font-bold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Sparkles size={12} />
              Más Popular
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#059669] text-white flex items-center justify-center font-bold shadow-xs">
                  <Zap size={22} />
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-[#059669]/15 text-[#006c49] rounded-full">
                  S/ 19.90 / mes
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-[#0b1c30]">
                Lo Avanzado: Mayor capacidad
              </h3>
              <p className="mt-2 text-xs text-[#3d4a42] leading-relaxed">
                Herramientas superiores para negocios en crecimiento con opciones de precios y métricas.
              </p>

              <ul className="mt-6 space-y-3.5 text-xs sm:text-sm text-[#0b1c30]">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <strong className="font-semibold text-[#006c49]">Hasta 150 productos:</strong> Capacidad amplia para tu catálogo completo.
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <strong className="font-semibold text-[#006c49]">Hasta 4 fotos por producto:</strong> Muestra diferentes ángulos y detalles.
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <strong className="font-semibold text-[#006c49]">Opciones con precios diferenciales:</strong> Hasta 2 grupos (ej. Talla + Color con +S/ X.XX).
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Layers size={14} className="text-[#059669]" />
                  </div>
                  <div>
                    <strong className="font-semibold text-[#006c49]">Categorías organizadas:</strong> Navegación por pestañas (Bebidas, Postres, Ropa).
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Eye size={14} className="text-[#059669]" />
                  </div>
                  <div>
                    <strong className="font-semibold text-[#006c49]">Métricas de visitas y clics:</strong> Conoce cuántos clientes exploran tu tienda.
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Palette size={14} className="text-[#059669]" />
                  </div>
                  <div>
                    <strong className="font-semibold text-[#006c49]">Sin marca "Creado por APANA":</strong> Tu tienda 100% con tu propia identidad.
                  </div>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-emerald-100">
              <Link href="/register" className="block text-center py-3 rounded-xl bg-[#059669] hover:bg-[#00855d] text-white font-bold text-xs shadow-sm transition-all">
                Activar Plan Emprendedor
              </Link>
            </div>
          </div>

          {/* Card 3: Escala Total (Plan Negocio Pro) */}
          <div className="bg-white rounded-3xl p-7 sm:p-8 border-2 border-amber-300 shadow-md relative flex flex-col justify-between hover:border-amber-400 transition-all">
            <div className="absolute -top-3.5 right-6 bg-linear-to-r from-amber-600 to-amber-500 text-white text-[11px] font-bold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
              👑 Escala Total
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Crown size={22} />
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-900 rounded-full">
                  S/ 39.90 / mes
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-[#0b1c30]">
                Negocio Pro: Sin límites
              </h3>
              <p className="mt-2 text-xs text-[#3d4a42] leading-relaxed">
                Para marcas consolidadas que necesitan catálogo ilimitado, fotos por variante y badge de verificación.
              </p>

              <ul className="mt-6 space-y-3.5 text-xs sm:text-sm text-[#0b1c30]">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <strong className="font-semibold text-amber-900">PRODUCTOS ILIMITADOS:</strong> Sube todo tu catálogo sin restricción de cantidad.
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <strong className="font-semibold text-amber-900">Hasta 8 fotos por producto:</strong> Máxima calidad fotográfica y galería completa.
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <strong className="font-semibold text-amber-900">Variantes ilimitadas + fotos:</strong> Múltiples grupos (ej. Tamaño, Color, Fragancia, Presentación).
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Eye size={14} className="text-amber-600" />
                  </div>
                  <div>
                    <strong className="font-semibold text-amber-900">Métricas completas del mes:</strong> Analíticas de rendimiento, visitas e intención de compra.
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles size={14} className="text-amber-600" />
                  </div>
                  <div>
                    <strong className="font-semibold text-amber-900">Badge de Tienda Verificada VIP:</strong> Distintivo oficial de confianza en tu catálogo.
                  </div>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-amber-100">
              <Link href="/register" className="block text-center py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all">
                Activar Plan Negocio Pro
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
