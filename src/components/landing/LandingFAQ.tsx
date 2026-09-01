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
      question: '¿Cuáles son los planes disponibles en APANA?',
      answer:
        'Contamos con 3 planes diseñados para cada etapa: 1) Plan Gratis (S/ 0 para siempre, hasta 25 productos, 1 foto, QR y pedidos por WhatsApp), 2) Plan Emprendedor (S/ 19.90/mes con hasta 150 productos, 4 fotos, variantes con precios diferenciales de hasta 2 grupos, categorías, métricas y sin marca APANA), y 3) Plan Negocio Pro (S/ 39.90/mes con productos ilimitados, hasta 8 fotos, variantes ilimitadas con foto por opción, métricas completas del mes y exportación a Excel).',
    },
    {
      question: '¿Cómo funcionan las opciones y variantes de producto en cada plan?',
      answer:
        'Las variantes permiten que un mismo producto tenga diferentes presentaciones (como Tallas, Colores, Sabores o Tamaños). En el Plan Gratis puedes crear 1 grupo de opciones (ej. Tallas: S, M, L) con hasta 4 valores manteniendo el mismo precio base. En el Plan Emprendedor puedes combinar hasta 2 grupos simultáneos (ej. Talla + Color) y asignar precios diferenciales individuales (ej. Talla XL + S/ 4.00). En el Plan Negocio Pro cuentas con grupos ilimitados, fotos individuales por variante y total libertad de precios.',
    },
    {
      question: '¿Cómo cobro las ventas de mis productos?',
      answer:
        'El cliente arma su carrito en tu tienda online y te envía el pedido detallado a tu WhatsApp. Tú cobras el 100% de tus ventas directamente a través de Yape, Plin, transferencia bancaria o contra entrega, sin ninguna comisión por venta.',
    },
    {
      question: '¿Cuánto tiempo toma tener mi tienda online lista?',
      answer:
        'Tu tienda online puede estar lista en aproximadamente 3 minutos*. Solo ingresas el nombre de tu negocio, tu número de WhatsApp y subes tus primeros productos con fotos y precios. Inmediatamente obtienes tu enlace público personalizado y tu código QR listo para imprimir y exhibir. (*El tiempo estimado puede variar ligeramente según la velocidad y estabilidad de tu conexión a internet o la cantidad de fotos que cargues).',
    },
    {
      question: '¿Qué es APANA Pagos y cuándo estará activo?',
      answer:
        'APANA Pagos es una funcionalidad complementaria de cobros online con tarjeta que se habilitará próximamente para quienes deseen procesar pagos con tarjeta dentro de su tienda. Mientras tanto, el 100% de pedidos se atiende de forma rápida y directa por WhatsApp.',
    },
    {
      question: '¿Mis clientes necesitan instalar alguna aplicación para ver mi tienda?',
      answer:
        'No. Tu tienda online funciona como una página web ultrarrápida que abre directamente en el navegador del celular de tus clientes (Chrome, Safari, etc.). Solo deben tocar tu enlace o escanear tu código QR.',
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
