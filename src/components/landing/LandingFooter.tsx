'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Heart, ExternalLink, Zap } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#bccac0]/30 pt-16 pb-12 text-[#0b1c30]">
      {/* Bottom CTA Banner */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
        <div className="bg-linear-to-br from-[#00855d] via-[#059669] to-[#006c49] rounded-3xl p-8 sm:p-12 text-white text-center flex flex-col items-center relative overflow-hidden shadow-xl shadow-[#059669]/20">
          {/* Background decorative elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#6cf8bb]/20 rounded-full blur-2xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-200 bg-white/15 px-3.5 py-1.5 rounded-full mb-4 border border-white/20">
            <Zap size={14} className="text-amber-300" />
            <span>Listo en 3 minutos*</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight max-w-2xl text-balance">
            Crea tu catálogo móvil hoy y transforma la forma en que vendes
          </h2>

          <p className="mt-4 text-sm sm:text-base text-emerald-100 max-w-xl leading-relaxed">
            Sin contratos forzosos, sin comisiones por venta y con control total de tus pedidos desde WhatsApp.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
            {/* Primary CTA Button */}
            <Link href="/register" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto font-extrabold text-sm sm:text-base bg-white text-[#006c49] hover:bg-emerald-50 px-8 py-4 rounded-xl shadow-lg shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Crear mi catálogo gratis</span>
                <ArrowRight size={18} className="stroke-[2.5]" />
              </button>
            </Link>

            {/* Secondary Demo Button */}
            <Link href="/s/panaderia-don-jose" target="_blank" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto font-semibold text-sm sm:text-base text-white bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-xs px-6 py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Ver tienda de ejemplo</span>
                <ExternalLink size={16} />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-[#bccac0]/25">
          {/* Column 1: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block transition-opacity hover:opacity-90">
              <Image
                src="/logo_lockup.svg"
                alt="APANA"
                width={140}
                height={31}
                className="h-8 w-auto object-contain"
              />
            </Link>
            <p className="text-xs sm:text-sm text-[#3d4a42] max-w-sm leading-relaxed">
              La plataforma más simple para crear catálogos digitales con código QR y recibir pedidos organizados directamente en WhatsApp.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0b1c30] mb-3">
              Navegación
            </h4>
            <ul className="space-y-2 text-xs font-medium text-[#3d4a42]">
              <li>
                <a href="#como-funciona" className="hover:text-[#059669] transition-colors">
                  Cómo funciona
                </a>
              </li>
              <li>
                <a href="#funciones" className="hover:text-[#059669] transition-colors">
                  Funcionalidades
                </a>
              </li>
              <li>
                <a href="#planes" className="hover:text-[#059669] transition-colors">
                  Planes y Precios
                </a>
              </li>
              <li>
                <a href="#preguntas" className="hover:text-[#059669] transition-colors">
                  Preguntas Frecuentes
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Acceso */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0b1c30] mb-3">
              Acceso
            </h4>
            <ul className="space-y-2 text-xs font-medium text-[#3d4a42]">
              <li>
                <Link href="/login" className="hover:text-[#059669] transition-colors font-semibold">
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#059669] transition-colors">
                  Crear cuenta nueva
                </Link>
              </li>
              <li>
                <Link href="/s/panaderia-don-jose" target="_blank" className="hover:text-[#059669] transition-colors">
                  Ver tienda demo
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Declaración Jurada */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0b1c30] mb-3">
              Legal
            </h4>
            <ul className="space-y-2 text-xs font-medium text-[#3d4a42]">
              <li>
                <Link href="/terms" className="hover:text-[#059669] transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#059669] transition-colors">
                  Declaración Jurada
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#059669] transition-colors">
                  Política de Privacidad
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6d7a72] gap-4">
          <p>© {new Date().getFullYear()} APANA. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <Link href="/terms" className="hover:underline">
              Términos del Servicio
            </Link>
            <span>•</span>
            <p className="flex items-center gap-1">
              Diseñado con <Heart size={12} className="text-rose-500 fill-rose-500" /> para emprendedores.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
