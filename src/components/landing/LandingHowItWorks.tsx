'use client';

import React from 'react';
import { PlusCircle, QrCode, MessageSquareCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const LandingHowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      icon: PlusCircle,
      title: 'Sube tus productos',
      description: 'Ingresa el nombre de tu tienda, tu número de WhatsApp y carga tus productos con fotos, descripción y precios.',
      badge: 'En solo 1 minuto',
    },
    {
      number: '02',
      icon: QrCode,
      title: 'Comparte tu link o QR',
      description: 'Pega el enlace en tu biografía de Instagram/TikTok e imprime tu código QR para exhibirlo en tu mostrador o mesas.',
      badge: 'QR listo para imprimir',
    },
    {
      number: '03',
      icon: MessageSquareCheck,
      title: 'Recibe pedidos listos',
      description: 'Tus clientes seleccionan lo que desean y te envían un mensaje estructurado con el cálculo total y sus datos de entrega.',
      badge: 'Directo a tu WhatsApp',
    },
  ];

  return (
    <section id="como-funciona" className="py-16 md:py-24 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-widest text-[#059669] bg-[#059669]/10 px-3 py-1 rounded-full">
          Paso a paso
        </span>
        <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-[#0b1c30] tracking-tight">
          Vender por WhatsApp nunca fue tan ordenado
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#3d4a42]">
          Olvídate de enviar listas en PDF desactualizadas o repetir precios por mensaje todo el día.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-[#bccac0]/30 shadow-xs hover:shadow-md hover:border-[#059669]/40 transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Step indicator top */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#059669]/10 text-[#059669] flex items-center justify-center group-hover:bg-[#059669] group-hover:text-white transition-colors">
                  <Icon size={24} />
                </div>
                <span className="text-3xl font-black text-[#eff4ff] group-hover:text-[#cbdbf5] transition-colors">
                  {step.number}
                </span>
              </div>

              {/* Step Text */}
              <div>
                <span className="text-[11px] font-bold text-[#059669] uppercase tracking-wide">
                  {step.badge}
                </span>
                <h3 className="text-lg font-bold text-[#0b1c30] mt-1 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[#3d4a42] leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Decorative bottom line */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-[#059669]">
                <span>Paso {idx + 1} de 3</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#059669] hover:underline"
        >
          <span>¿Listo para comenzar? Ingresa y configura tu tienda en 1 minuto</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
};
