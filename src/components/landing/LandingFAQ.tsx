'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export const LandingFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: '¿Cómo cobro las ventas de mis productos?',
      answer:
        'El pedido llega directamente a tu WhatsApp con el total calculado y los datos del cliente. Tú recibes el 100% de tu dinero a través de Yape, Plin, transferencia bancaria o pago contra entrega, sin intermediarios. Próximamente habilitaremos la funcionalidad adicional de APANA Pagos para quienes deseen cobrar con tarjeta de crédito/débito online.',
    },
    {
      question: '¿Cuánto tiempo toma tener mi tienda online lista?',
      answer:
        'Tu tienda online está lista en solo 1 minuto. Solo ingresas el nombre de tu negocio, tu número de WhatsApp y subes tus primeros productos con fotos y precios. Inmediatamente obtienes tu enlace público y tu código QR listo para exhibir.',
    },
    {
      question: '¿Cuáles son los planes actuales disponibles?',
      answer:
        'Actualmente contamos con dos planes únicos: el Plan Gratis (S/ 0 para siempre, hasta 25 productos, QR y pedidos por WhatsApp) y el Plan Emprendedor (S/ 19.90/mes con hasta 250 productos, 4 imágenes por producto, categorías, estadísticas de visitas y sin marca APANA). Puedes comenzar gratis hoy mismo y subir de plan cuando tu negocio lo necesite.',
    },
    {
      question: '¿Qué es APANA Pagos y cuándo estará activo?',
      answer:
        'APANA Pagos es una funcionalidad de cobro con tarjeta que se lanzará próximamente. Estará disponible tanto para conectar tu propia cuenta como en modalidad gestionada sin trámites. Hoy en día todas las tiendas operan al 100% recibiendo pedidos por WhatsApp.',
    },
    {
      question: '¿Mis clientes necesitan instalar alguna aplicación?',
      answer:
        'No. Tu tienda funciona como una página web ultrarrápida desde el navegador del celular de tus clientes (Chrome, Safari, etc.). Solo deben hacer clic en tu enlace o escanear tu código QR para ver tu catálogo.',
    },
  ];

  return (
    <section id="preguntas" className="py-16 md:py-24 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#059669]/10 text-[#00855d] text-xs font-bold mb-3">
          <HelpCircle size={14} />
          <span>Resolvemos tus dudas</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0b1c30] tracking-tight">
          Preguntas Frecuentes
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[#3d4a42]">
          Todo claro y transparente desde el primer día.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl border border-[#bccac0]/35 overflow-hidden transition-all shadow-2xs"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#0b1c30] hover:text-[#059669] transition-colors cursor-pointer touch-manipulation select-none"
              >
                <span>{faq.question}</span>
                <span className="p-1 rounded-lg bg-slate-100 text-slate-600 shrink-0">
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-sm text-[#3d4a42] leading-relaxed border-t border-slate-100">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
