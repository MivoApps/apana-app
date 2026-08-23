'use client';

import React from 'react';
import { Search, ShoppingBag } from 'lucide-react';

interface LiveStorePreviewProps {
  storeName: string;
  themeStyle: 'minimalist' | 'modern' | 'elegant' | 'minimalista' | 'moderna' | 'elegante';
  primaryColor: string;
  categoryName?: string;
  logoUrl?: string | null;
}

export const LiveStorePreview: React.FC<LiveStorePreviewProps> = ({
  storeName,
  themeStyle,
  primaryColor,
  categoryName = 'General',
  logoUrl,
}) => {
  const isModern = themeStyle === 'modern' || themeStyle === 'moderna';
  const isElegant = themeStyle === 'elegant' || themeStyle === 'elegante';
  const isMinimal = !isModern && !isElegant;

  const displayName = storeName.trim() || 'Mi Tienda';
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-[280px] mx-auto select-none">
      <div className="flex items-center justify-between w-full px-1">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Vista Previa en Vivo
        </span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#059669]">
          {isElegant ? '⚜️ Elegante' : isModern ? '⚡ Moderna' : '🍃 Minimalista'}
        </span>
      </div>

      {/* Smartphone Frame */}
      <div className="w-full bg-slate-900 p-2.5 rounded-[2.5rem] shadow-xl border-4 border-slate-800 relative">
        {/* Speaker / Camera Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-slate-900 rounded-full z-20 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
        </div>

        {/* Phone Screen Container */}
        <div
          className={`w-full rounded-[1.8rem] overflow-hidden text-left flex flex-col transition-colors duration-300 min-h-[380px] ${
            isElegant
              ? 'bg-[#FAF8F5] text-stone-900 font-playfair'
              : isModern
              ? 'bg-slate-50 text-[#0b1c30] font-space-grotesk'
              : 'bg-white text-[#0b1c30] font-plus-jakarta'
          }`}
        >
          {/* Mini Nav Bar */}
          <div className={`pt-6 px-3 pb-2 flex items-center justify-between border-b ${
            isElegant ? 'bg-[#FAF8F5]/90 border-[#E7E2D9]' : 'bg-white/80 border-black/5'
          } backdrop-blur-xs`}>
            <span className={`text-[11px] font-bold truncate max-w-[140px] ${isElegant ? 'font-playfair' : ''}`}>{displayName}</span>
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <ShoppingBag size={12} />
            </div>
          </div>

          {/* Mini Store Header Hero */}
          <div
            className={`p-3 flex flex-col items-center text-center gap-1.5 transition-all ${
              isElegant
                ? 'bg-[#FAF8F5] text-stone-900 border-b border-[#E7E2D9] py-3.5'
                : isModern
                ? 'bg-white text-[#0b1c30] border-b border-slate-200/80 py-3'
                : 'bg-white text-[#0b1c30] py-3'
            }`}
          >
            {logoUrl ? (
              <div className={`w-10 h-10 overflow-hidden shadow-xs transition-all ${
                isElegant ? 'rounded-xl border border-stone-200/60' : isModern ? 'rounded-2xl' : 'rounded-full'
              }`}>
                <img src={logoUrl} alt={displayName} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div
                style={{ backgroundColor: primaryColor || '#059669' }}
                className={`w-10 h-10 text-white flex items-center justify-center font-bold text-sm shadow-xs transition-all ${
                  isElegant ? 'rounded-xl border border-stone-200/60 font-playfair' : isModern ? 'rounded-2xl' : 'rounded-full'
                }`}
              >
                {initials}
              </div>
            )}
            <span className={`text-xs font-bold leading-tight ${isElegant ? 'text-stone-900 font-playfair' : 'text-[#0b1c30]'}`}>
              {displayName}
            </span>
            <span className={`text-[9px] leading-tight line-clamp-1 ${isElegant ? 'text-stone-500 font-sans' : 'text-slate-500'}`}>
              Catálogo oficial en WhatsApp
            </span>
          </div>

          {/* Mini Search & Category Chips */}
          <div className="px-3 pt-2.5 flex flex-col gap-2">
            <div className="bg-white border border-slate-200 rounded-full py-1 px-2.5 flex items-center gap-1.5 shadow-2xs">
              <Search size={10} className="text-slate-400" />
              <span className="text-[9px] text-slate-400">Buscar...</span>
            </div>

            <div className="flex gap-1.5 overflow-hidden">
              <span
                style={{ backgroundColor: primaryColor || '#059669' }}
                className="px-2 py-0.5 rounded-full text-[8px] font-bold text-white shrink-0"
              >
                Todos
              </span>
              <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-white text-slate-600 border border-slate-200 shrink-0 truncate max-w-[80px]">
                {categoryName}
              </span>
            </div>
          </div>

          {/* Mini Products Showcase */}
          <div className={`p-3 grid gap-2 flex-1 ${isModern ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {/* Mock Product 1 */}
            {isModern ? (
              <div className="bg-white rounded-xl border border-slate-200 p-1.5 flex items-center gap-2 shadow-2xs">
                <div className="w-12 h-12 rounded-lg bg-slate-100 shrink-0 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=200&q=80"
                    alt="Demo 1"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-bold text-slate-800 uppercase tracking-wider line-clamp-1">
                    Producto Estrella
                  </span>
                  <span className="text-[10px] font-extrabold" style={{ color: primaryColor || '#059669' }}>
                    S/ 45.00
                  </span>
                </div>
              </div>
            ) : isElegant ? (
              <div className="bg-white rounded-xl border border-[#E7E2D9] overflow-hidden flex flex-col text-center shadow-2xs">
                <div className="aspect-square bg-[#FAF8F5] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=200&q=80"
                    alt="Demo 1"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-1.5 flex flex-col">
                  <span className="text-[9px] font-bold text-stone-900 line-clamp-1 font-playfair">
                    Producto Especial
                  </span>
                  <span className="text-[9px] font-bold italic font-playfair" style={{ color: primaryColor || '#059669' }}>
                    S/ 45.00
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col text-left gap-1 cursor-pointer">
                <div className="aspect-square bg-neutral-100 rounded-xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=200&q=80"
                    alt="Demo 1"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col px-0.5">
                  <span className="text-[8px] font-semibold text-neutral-800 line-clamp-1 font-plus-jakarta">
                    Lookbook Básico
                  </span>
                  <span className="text-[9px] font-bold text-neutral-900 font-plus-jakarta">
                    S/ 45.00
                  </span>
                </div>
              </div>
            )}

            {/* Mock Product 2 */}
            {isModern ? (
              <div className="bg-white rounded-xl border border-slate-200 p-1.5 flex items-center gap-2 shadow-2xs">
                <div className="w-12 h-12 rounded-lg bg-slate-100 shrink-0 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=200&q=80"
                    alt="Demo 2"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-bold text-slate-800 uppercase tracking-wider line-clamp-1">
                    Colección Nueva
                  </span>
                  <span className="text-[10px] font-extrabold" style={{ color: primaryColor || '#059669' }}>
                    S/ 29.90
                  </span>
                </div>
              </div>
            ) : isElegant ? (
              <div className="bg-white rounded-xl border border-[#E7E2D9] overflow-hidden flex flex-col text-center shadow-2xs">
                <div className="aspect-square bg-[#FAF8F5] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=200&q=80"
                    alt="Demo 2"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-1.5 flex flex-col">
                  <span className="text-[9px] font-bold text-stone-900 line-clamp-1 font-playfair">
                    Edición Premium
                  </span>
                  <span className="text-[9px] font-bold italic font-playfair" style={{ color: primaryColor || '#059669' }}>
                    S/ 29.90
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col text-left gap-1 cursor-pointer">
                <div className="aspect-square bg-neutral-100 rounded-xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=200&q=80"
                    alt="Demo 2"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col px-0.5">
                  <span className="text-[8px] font-semibold text-neutral-800 line-clamp-1 font-plus-jakarta">
                    Pack Esencial
                  </span>
                  <span className="text-[9px] font-bold text-neutral-900 font-plus-jakarta">
                    S/ 29.90
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Nav Mock */}
          <div className="py-2.5 px-4 bg-white/90 border-t border-slate-100 flex items-center justify-center">
            <div className="w-16 h-1 bg-slate-300 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
