'use client';

import React from 'react';
import { PlusCircle, QrCode, MessageSquareCheck, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export const LandingHowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      icon: PlusCircle,
      title: 'Sube tus productos',
      description: 'Ingresa el nombre de tu tienda, tu número de WhatsApp y carga tus productos con fotos, descripción y precios.',
      badge: 'En solo 3 minutos*',
      color: 'from-emerald-500/20 to-emerald-500/5 text-emerald-600',
    },
    {
      number: '02',
      icon: QrCode,
      title: 'Comparte tu link o QR',
      description: 'Pega el enlace en tu biografía de Instagram/TikTok e imprime tu código QR para exhibirlo en tu mostrador o mesas.',
      badge: 'QR listo para imprimir',
      color: 'from-blue-500/20 to-blue-500/5 text-blue-600',
    },
    {
      number: '03',
      icon: MessageSquareCheck,
      title: 'Recibe pedidos listos',
      description: 'Tus clientes seleccionan lo que desean y te envían un mensaje estructurado con el cálculo total y sus datos de entrega.',
      badge: 'Directo a tu WhatsApp',
      color: 'from-indigo-500/20 to-indigo-500/5 text-indigo-600',
    },
  ];

  return (
    <section id="como-funciona" className="py-16 md:py-24 max-w-6xl mx-auto px-4 sm:px-6 relative">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#059669]/10 text-[#00855d] text-xs font-bold mb-3 border border-[#059669]/20 shadow-2xs">
          <Sparkles size={13} className="text-[#059669]" />
          <span>Paso a paso</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0b1c30] tracking-tight">
          Vender por WhatsApp nunca fue tan ordenado
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#3d4a42]">
          Olvídate de enviar listas en PDF desactualizadas o repetir precios por mensaje todo el día.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              className="bg-white/80 backdrop-blur-md rounded-3xl p-7 sm:p-8 border border-white/90 shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-[#059669]/40 hover:-translate-y-1 transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Step indicator top */}
              <div className="flex items-center justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${step.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs`}>
                  <Icon size={26} />
                </div>
                <span className="text-4xl font-black text-slate-200 group-hover:text-emerald-300/80 transition-colors">
                  {step.number}
                </span>
              </div>

              {/* Step Text */}
              <div>
                <span className="text-[11px] font-bold text-[#059669] uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                  {step.badge}
                </span>
                <h3 className="text-lg font-extrabold text-[#0b1c30] mt-3 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[#3d4a42] leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Decorative bottom line */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Paso {idx + 1} de 3</span>
                <span className="text-emerald-600 font-bold group-hover:translate-x-1 transition-transform">➔</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/register"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#059669] hover:text-[#00855d] bg-emerald-50 hover:bg-emerald-100/80 px-5 py-2.5 rounded-full border border-emerald-200 transition-all shadow-2xs group"
        >
          <span>¿Listo para comenzar? Crea tu tienda gratis en 3 minutos*</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
};
