'use client';

import React, { useState } from 'react';
import { Search, ShoppingBag, Smartphone, Monitor, Lock, Share2 } from 'lucide-react';

interface LiveStorePreviewProps {
  storeName: string;
  themeStyle: 'minimalist' | 'modern' | 'elegant' | 'minimalista' | 'moderna' | 'elegante';
  primaryColor: string;
  categoryName?: string;
  logoUrl?: string | null;
  defaultDevice?: 'mobile' | 'desktop';
}

export const LiveStorePreview: React.FC<LiveStorePreviewProps> = ({
  storeName,
  themeStyle,
  primaryColor,
  categoryName = 'General',
  logoUrl,
  defaultDevice = 'mobile',
}) => {
  const [device, setDevice] = useState<'mobile' | 'desktop'>(defaultDevice);

  const isModern = themeStyle === 'modern' || themeStyle === 'moderna';
  const isElegant = themeStyle === 'elegant' || themeStyle === 'elegante';
  const isMinimal = !isModern && !isElegant;

  const displayName = storeName.trim() || 'Mi Tienda';
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <div
      className={`flex flex-col items-center gap-2 w-full mx-auto select-none transition-all duration-300 ${
        device === 'desktop' ? 'max-w-[580px]' : 'max-w-[290px]'
      }`}
    >
      {/* Barra de Control de Vista Previa con Switch Móvil / Desktop */}
      <div className="flex items-center justify-between w-full px-1 gap-2 flex-wrap">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
          Vista Previa
        </span>

        {/* Toggle Móvil / Desktop */}
        <div className="flex items-center bg-slate-200/90 p-0.5 rounded-lg border border-slate-300/70 shadow-2xs">
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
              device === 'mobile'
                ? 'bg-white text-[#0b1c30] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Ver en formato teléfono móvil"
          >
            <Smartphone size={11} className={device === 'mobile' ? 'text-[#059669]' : 'text-slate-400'} />
            <span>Móvil</span>
          </button>
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
              device === 'desktop'
                ? 'bg-white text-[#0b1c30] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Ver en pantalla de computadora / laptop"
          >
            <Monitor size={11} className={device === 'desktop' ? 'text-[#059669]' : 'text-slate-400'} />
            <span>Desktop</span>
          </button>
        </div>

        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#059669] shrink-0">
          {isElegant ? '⚜️ Elegante' : isModern ? '⚡ Moderna' : '🍃 Minimalista'}
        </span>
      </div>

      {/* ========================================================
          DISPOSITIVO 1: FORMATO SMARTPHONE (MÓVIL)
          ======================================================== */}
      {device === 'mobile' ? (
        <div className="w-full bg-slate-900 p-2.5 rounded-[2.5rem] shadow-xl border-4 border-slate-800 relative animate-fadeIn">
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
            <div
              className={`pt-6 px-3 pb-2 flex items-center justify-between border-b ${
                isElegant ? 'bg-[#FAF8F5]/90 border-[#E7E2D9]' : 'bg-white/80 border-black/5'
              } backdrop-blur-xs`}
            >
              <span className={`text-[11px] font-bold truncate max-w-[140px] ${isElegant ? 'font-playfair' : ''}`}>
                {displayName}
              </span>
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
                <div
                  className={`w-10 h-10 overflow-hidden shadow-xs transition-all ${
                    isElegant ? 'rounded-xl border border-stone-200/60' : isModern ? 'rounded-2xl' : 'rounded-full'
                  }`}
                >
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
                Tienda oficial en WhatsApp
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

            {/* Mini Products Showcase (Móvil) */}
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

            {/* Bottom Nav / Legal Footer Mock */}
            <div className="py-1.5 px-3 bg-white/90 border-t border-slate-100 flex flex-col items-center justify-center gap-1">
              <span className="text-[7px] text-slate-400 font-medium">Libro de Reclamaciones • Políticas de la Tienda</span>
              <div className="w-12 h-1 bg-slate-300 rounded-full" />
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================
           DISPOSITIVO 2: FORMATO COMPUTADORA / LAPTOP (DESKTOP)
           ======================================================== */
        <div className="w-full bg-slate-900 p-2 sm:p-2.5 rounded-2xl shadow-xl border-4 border-slate-800 relative animate-fadeIn flex flex-col">
          {/* Top Browser Bar (macOS style window) */}
          <div className="flex items-center justify-between pb-2 px-1 text-slate-400">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>

            {/* Mock URL bar */}
            <div className="flex items-center gap-1 bg-slate-800/80 px-3 py-0.5 rounded-md text-[9px] font-mono text-slate-300 border border-slate-700 max-w-[200px] truncate">
              <Lock size={8} className="text-emerald-400 shrink-0" />
              <span>beapana.com/s/mi-tienda</span>
            </div>

            <div className="w-8" />
          </div>

          {/* Desktop Browser Viewport */}
          <div
            className={`w-full rounded-xl overflow-hidden text-left flex flex-col transition-colors duration-300 min-h-[350px] ${
              isElegant
                ? 'bg-[#FAF8F5] text-stone-900 font-playfair'
                : isModern
                ? 'bg-slate-50 text-[#0b1c30] font-space-grotesk'
                : 'bg-white text-[#0b1c30] font-plus-jakarta'
            }`}
          >
            {/* Desktop Navigation Header */}
            <div
              className={`px-4 py-2.5 flex items-center justify-between border-b ${
                isElegant ? 'bg-[#FAF8F5]/90 border-[#E7E2D9]' : 'bg-white/90 border-slate-200/80'
              } backdrop-blur-xs`}
            >
              <div className="flex items-center gap-2">
                {logoUrl ? (
                  <div
                    className={`w-6 h-6 overflow-hidden shadow-2xs ${
                      isElegant ? 'rounded-md' : isModern ? 'rounded-lg' : 'rounded-full'
                    }`}
                  >
                    <img src={logoUrl} alt={displayName} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div
                    style={{ backgroundColor: primaryColor || '#059669' }}
                    className={`w-6 h-6 text-white flex items-center justify-center font-bold text-[10px] ${
                      isElegant ? 'rounded-md' : isModern ? 'rounded-lg' : 'rounded-full'
                    }`}
                  >
                    {initials}
                  </div>
                )}
                <span className={`text-xs font-bold truncate max-w-[150px] ${isElegant ? 'font-playfair' : ''}`}>
                  {displayName}
                </span>
              </div>

              {/* Desktop Search Mini Bar */}
              <div className="bg-white border border-slate-200 rounded-full py-0.5 px-3 flex items-center gap-1.5 shadow-2xs w-44">
                <Search size={10} className="text-slate-400" />
                <span className="text-[9px] text-slate-400 truncate">Buscar en la tienda...</span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <Share2 size={11} />
                </div>
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <ShoppingBag size={11} />
                </div>
              </div>
            </div>

            {/* Desktop Hero Banner */}
            <div
              className={`px-4 py-3 flex flex-col items-center text-center gap-1 border-b ${
                isElegant
                  ? 'bg-[#FAF8F5] text-stone-900 border-[#E7E2D9]'
                  : isModern
                  ? 'bg-white text-[#0b1c30] border-slate-200/80'
                  : 'bg-white text-[#0b1c30] border-slate-100'
              }`}
            >
              <span className={`text-xs font-bold ${isElegant ? 'font-playfair text-stone-900' : 'text-[#0b1c30]'}`}>
                {displayName}
              </span>
              <span className={`text-[9px] ${isElegant ? 'text-stone-500 font-sans' : 'text-slate-500'}`}>
                Catálogo Digital y Pedidos Oficiales por WhatsApp • {categoryName}
              </span>

              {/* Category Pills */}
              <div className="flex gap-1.5 pt-1">
                <span
                  style={{ backgroundColor: primaryColor || '#059669' }}
                  className="px-2.5 py-0.5 rounded-full text-[8px] font-bold text-white shadow-2xs"
                >
                  Todos los Productos
                </span>
                <span className="px-2 py-0.5 rounded-full text-[8px] font-semibold bg-white text-slate-600 border border-slate-200 shadow-2xs">
                  {categoryName}
                </span>
              </div>
            </div>

            {/* Desktop Product Grid (Multi-Columna en Pantalla Ancha) */}
            <div className={`p-3.5 grid gap-2.5 flex-1 ${isModern ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {/* Product 1 */}
              {isModern ? (
                <div className="bg-white rounded-xl border border-slate-200/80 p-2 flex items-center gap-2 shadow-2xs hover:shadow-xs transition-all">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 shrink-0 overflow-hidden">
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
                    <span className="text-[8px] text-slate-400">Entrega rápida</span>
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
                  <div className="p-2 flex flex-col">
                    <span className="text-[9px] font-bold text-stone-900 line-clamp-1 font-playfair">
                      Producto Especial
                    </span>
                    <span className="text-[9px] font-bold italic font-playfair" style={{ color: primaryColor || '#059669' }}>
                      S/ 45.00
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col text-left gap-1">
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

              {/* Product 2 */}
              {isModern ? (
                <div className="bg-white rounded-xl border border-slate-200/80 p-2 flex items-center gap-2 shadow-2xs hover:shadow-xs transition-all">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 shrink-0 overflow-hidden">
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
                    <span className="text-[8px] text-slate-400">Stock disponible</span>
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
                  <div className="p-2 flex flex-col">
                    <span className="text-[9px] font-bold text-stone-900 line-clamp-1 font-playfair">
                      Edición Premium
                    </span>
                    <span className="text-[9px] font-bold italic font-playfair" style={{ color: primaryColor || '#059669' }}>
                      S/ 29.90
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col text-left gap-1">
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

              {/* Product 3 (Visible en Desktop) */}
              {isModern ? (
                <div className="bg-white rounded-xl border border-slate-200/80 p-2 flex items-center gap-2 shadow-2xs hover:shadow-xs transition-all col-span-2">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 shrink-0 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=200&q=80"
                      alt="Demo 3"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] font-bold text-slate-800 uppercase tracking-wider line-clamp-1">
                      Top Selección
                    </span>
                    <span className="text-[10px] font-extrabold" style={{ color: primaryColor || '#059669' }}>
                      S/ 89.00
                    </span>
                    <span className="text-[8px] text-slate-400">Favorito de clientes</span>
                  </div>
                </div>
              ) : isElegant ? (
                <div className="bg-white rounded-xl border border-[#E7E2D9] overflow-hidden flex flex-col text-center shadow-2xs">
                  <div className="aspect-square bg-[#FAF8F5] overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=200&q=80"
                      alt="Demo 3"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2 flex flex-col">
                    <span className="text-[9px] font-bold text-stone-900 line-clamp-1 font-playfair">
                      Selección Dorada
                    </span>
                    <span className="text-[9px] font-bold italic font-playfair" style={{ color: primaryColor || '#059669' }}>
                      S/ 89.00
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col text-left gap-1">
                  <div className="aspect-square bg-neutral-100 rounded-xl overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=200&q=80"
                      alt="Demo 3"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col px-0.5">
                    <span className="text-[8px] font-semibold text-neutral-800 line-clamp-1 font-plus-jakarta">
                      Cápsula Minimal
                    </span>
                    <span className="text-[9px] font-bold text-neutral-900 font-plus-jakarta">
                      S/ 89.00
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Desktop Footer Bar */}
            <div className="py-2 px-4 bg-white/90 border-t border-slate-100 flex items-center justify-between text-[8px] text-slate-400">
              <span>© {displayName} • Libro de Reclamaciones • Políticas</span>
              <span className="font-semibold text-emerald-600">✓ Envíos y Garantía</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
