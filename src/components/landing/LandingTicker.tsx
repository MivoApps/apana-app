'use client';

import React from 'react';
import { 
  Zap, 
  MessageCircle, 
  CreditCard, 
  QrCode, 
  Percent, 
  Package, 
  Smartphone,
  Palette
} from 'lucide-react';

export const LandingTicker: React.FC = () => {
  const items = [
    { icon: Zap, text: '0% Comisiones por Venta', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { icon: MessageCircle, text: 'Pedidos Directos a tu WhatsApp', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { icon: CreditCard, text: 'Próximamente: Pagos con Tarjetas & Yape', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { icon: QrCode, text: 'Código QR Descargable en Alta Definición', color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { icon: Palette, text: '3 Estilos de Tienda Personalizables', color: 'text-pink-600 bg-pink-50 border-pink-200' },
    { icon: Percent, text: 'Precios Tachados y Ofertas Flash', color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { icon: Package, text: 'Gestión de Stock y Variantes en Vivo', color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
    { icon: Smartphone, text: '100% Web: Sin Apps que Instalar', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  ];

  return (
    <div className="w-full overflow-hidden py-4 border-y border-[#bccac0]/25 bg-white/60 backdrop-blur-md relative select-none">
      {/* Gradient Fade Edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-linear-to-r from-[#f8f9ff] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-linear-to-l from-[#f8f9ff] to-transparent z-10 pointer-events-none" />

      {/* Marquee Track */}
      <div className="animate-marquee flex items-center gap-6">
        {/* First Loop */}
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={`ticker-1-${idx}`}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#bccac0]/30 shadow-2xs text-xs font-semibold text-[#0b1c30] whitespace-nowrap hover:scale-105 transition-transform"
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${item.color}`}>
                <Icon size={11} />
              </div>
              <span>{item.text}</span>
            </div>
          );
        })}

        {/* Second Loop for Seamless Loop */}
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={`ticker-2-${idx}`}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#bccac0]/30 shadow-2xs text-xs font-semibold text-[#0b1c30] whitespace-nowrap hover:scale-105 transition-transform"
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${item.color}`}>
                <Icon size={11} />
              </div>
              <span>{item.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
