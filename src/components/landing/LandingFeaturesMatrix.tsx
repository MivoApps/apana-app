'use client';

import React from 'react';
import { Check, Sparkles, Smartphone, Layers, Eye, Palette, Zap } from 'lucide-react';
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

        {/* 2 Column Comparison Cards: Basic vs Advanced */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Card 1: Lo Básico (Incluido gratis) */}
          <div className="bg-white rounded-3xl p-7 sm:p-8 border border-[#bccac0]/40 shadow-xs flex flex-col justify-between">
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
                Lo Básico: Todo para empezar hoy
              </h3>
              <p className="mt-2 text-sm text-[#3d4a42] leading-relaxed">
                Herramientas fundamentales para digitalizar tu negocio y dejar atrás las listas de precios en fotos o texto plano.
              </p>

              <ul className="mt-6 space-y-3.5 text-sm text-[#0b1c30]">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#059669]/10 text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <strong className="font-semibold">Hasta 25 productos activos:</strong> Ideal para cartas de restaurantes, postres, tiendas de ropa o servicios.
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#059669]/10 text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <strong className="font-semibold">1 imagen por producto:</strong> Muestra foto nítida de cada artículo.
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

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#059669]/10 text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <strong className="font-semibold">Compartir enlaces directos:</strong> Envía links a productos específicos por chat o redes.
                  </div>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link href="/login" className="block text-center py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0b1c30] font-bold text-sm transition-colors">
                Comenzar gratis
              </Link>
            </div>
          </div>

          {/* Card 2: Lo Avanzado (Plan Emprendedor) */}
          <div className="bg-linear-to-b from-[#f5fff7] to-white rounded-3xl p-7 sm:p-8 border-2 border-[#059669]/50 shadow-md relative flex flex-col justify-between">
            <div className="absolute -top-3.5 right-6 bg-linear-to-r from-[#059669] to-[#00855d] text-white text-[11px] font-bold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Sparkles size={12} />
              Plan Emprendedor (S/ 19.90/mes)
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#059669] text-white flex items-center justify-center font-bold shadow-xs">
                  <Zap size={22} />
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-[#059669]/15 text-[#006c49] rounded-full">
                  Para negocios en crecimiento
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-[#0b1c30]">
                Lo Avanzado: Mayor capacidad y presencia de marca
              </h3>
              <p className="mt-2 text-sm text-[#3d4a42] leading-relaxed">
                Herramientas superiores diseñadas para negocios con catálogos más extensos, categorías y métricas de clientes.
              </p>

              <ul className="mt-6 space-y-3.5 text-sm text-[#0b1c30]">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <strong className="font-semibold text-[#006c49]">Hasta 250 productos:</strong> Mayor capacidad para inventarios amplios y variedades.
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} className="stroke-[3]" />
                  </div>
                  <div>
                    <strong className="font-semibold text-[#006c49]">Hasta 4 imágenes por producto:</strong> Muestra diferentes vistas y detalles de cada producto.
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Layers size={14} className="text-[#059669]" />
                  </div>
                  <div>
                    <strong className="font-semibold text-[#006c49]">Categorías organizadas:</strong> Navegación por secciones (ej. Bebidas, Postres, Ropa, Combos).
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Eye size={14} className="text-[#059669]" />
                  </div>
                  <div>
                    <strong className="font-semibold text-[#006c49]">Estadísticas básicas de visitas:</strong> Conoce cuántos clientes ingresan a tu catálogo y qué productos generan más interés.
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Palette size={14} className="text-[#059669]" />
                  </div>
                  <div>
                    <strong className="font-semibold text-[#006c49]">Sin marca "Creado por APANA":</strong> Tu tienda 100% con tu propia identidad y colores personalizados.
                  </div>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-emerald-100">
              <Link href="/login" className="block text-center py-3 rounded-xl bg-[#059669] hover:bg-[#00855d] text-white font-bold text-sm shadow-sm transition-all">
                Activar Plan Emprendedor
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
