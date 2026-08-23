'use client';

import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  ShoppingBag, 
  ArrowLeft,
  ArrowRight,
  Trash2,
  Phone,
  Video,
  MoreVertical,
  CheckCheck,
  Smile,
  Paperclip,
  Camera,
  Mic
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import Link from 'next/link';

export const LandingDevicePreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'cart' | 'whatsapp'>('catalog');
  const [timerKey, setTimerKey] = useState(0);

  // Rotación automática cada 7 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => {
        if (prev === 'catalog') return 'cart';
        if (prev === 'cart') return 'whatsapp';
        return 'catalog';
      });
    }, 7000);

    return () => clearInterval(interval);
  }, [timerKey]);

  const handleTabChange = (tab: 'catalog' | 'cart' | 'whatsapp') => {
    setActiveTab(tab);
    setTimerKey((k) => k + 1); // Reiniciar temporizador al interactuar manualmente
  };

  /*
   * =========================================================================================
   * CONFIGURACIÓN DE IMÁGENES / BANNERS PERSONALIZABLES:
   * Puedes reemplazar estas URLs por las imágenes de tu preferencia o capturas reales de tu tienda.
   * =========================================================================================
   */
  const customImages = {
    // Banner superior opcional de la tienda (deja null para ver el banner diseñado en código)
    storeBannerUrl: null as string | null,
    
    // Captura completa opcional del catálogo si prefieres mostrar un screenshot directo
    customCatalogScreenshot: null as string | null,

    // Imágenes de productos de muestra en el catálogo y carrito
    croissant: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=400&q=80',
    baguette: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=400&q=80',
    panCampesino: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
    tortaChocolate: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80',
  };

  return (
    <section className="py-12 md:py-20 relative overflow-hidden bg-linear-to-b from-transparent via-[#eff4ff]/60 to-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#059669]/10 text-[#00855d] text-xs font-bold mb-3">
            <Smartphone size={14} />
            <span>Experiencia 100% móvil</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0b1c30] tracking-tight">
            Así es como tus clientes compran desde su celular
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#3d4a42]">
            Sin descargar aplicaciones pesadas. Abren tu enlace o escanean tu QR y hacen su pedido en segundos.
          </p>
        </div>

        {/* View Switcher Tabs - Chips Mejorados con Ancho Completo */}
        <div className="flex justify-center mb-8 px-2">
          <div className="inline-flex items-center p-1.5 bg-white/95 backdrop-blur-md rounded-full border border-[#bccac0]/40 shadow-xs gap-1 sm:gap-2 max-w-full overflow-x-auto relative z-20">
            
            {/* Chip 1: Catálogo */}
            <button
              type="button"
              onClick={() => handleTabChange('catalog')}
              className={`shrink-0 cursor-pointer touch-manipulation whitespace-nowrap flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 ${
                activeTab === 'catalog'
                  ? 'bg-[#059669] text-white shadow-xs'
                  : 'text-[#3d4a42] hover:text-[#0b1c30] hover:bg-slate-100/80'
              }`}
            >
              <Smartphone size={16} />
              <span>1. Catálogo Web</span>
            </button>

            {/* Chip 2: Carrito */}
            <button
              type="button"
              onClick={() => handleTabChange('cart')}
              className={`shrink-0 cursor-pointer touch-manipulation whitespace-nowrap flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 ${
                activeTab === 'cart'
                  ? 'bg-[#059669] text-white shadow-xs'
                  : 'text-[#3d4a42] hover:text-[#0b1c30] hover:bg-slate-100/80'
              }`}
            >
              <ShoppingBag size={16} />
              <span>2. Carrito y Total</span>
            </button>

            {/* Chip 3: Pedido en WhatsApp */}
            <button
              type="button"
              onClick={() => handleTabChange('whatsapp')}
              className={`shrink-0 cursor-pointer touch-manipulation whitespace-nowrap flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 ${
                activeTab === 'whatsapp'
                  ? 'bg-linear-to-r from-[#25d366] to-[#128c7e] text-white shadow-md shadow-[#25d366]/25'
                  : 'text-[#3d4a42] hover:text-[#006c49] hover:bg-emerald-50/70'
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                <WhatsAppIcon size={16} />
              </div>
              <span>3. Pedido en WhatsApp</span>
              {activeTab === 'whatsapp' && (
                <span className="w-2 h-2 rounded-full bg-white animate-pulse hidden sm:inline-block" />
              )}
            </button>
          </div>
        </div>

        {/* Interactive Device Mockup Container */}
        <div className="relative max-w-4xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
          
          {/* Phone Frame Device */}
          <div className="w-[320px] sm:w-[350px] h-[670px] bg-[#0b1c30] rounded-[48px] p-3.5 shadow-2xl ring-1 ring-white/20 relative shrink-0">
            {/* Phone Speaker & Camera Notch */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#0b1c30] rounded-full z-30 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800 mr-2" />
              <div className="w-10 h-1 bg-slate-800 rounded-full" />
            </div>

            {/* Phone Screen Container */}
            <div className="w-full h-full bg-[#f8f9ff] rounded-[36px] overflow-hidden flex flex-col relative text-[#0b1c30] text-xs shadow-inner">
              
              {/* Browser Address Bar (Shown only on web tabs: Catalog & Cart) */}
              {activeTab !== 'whatsapp' && (
                <div className="bg-white border-b border-slate-100 pt-7 pb-2 px-3 flex items-center gap-2 shrink-0">
                  <div className="flex-1 bg-slate-100 rounded-full px-3 py-1 flex items-center gap-1.5 text-[10px] text-slate-600 truncate">
                    <span className="text-[#059669] font-bold">🔒</span>
                    <span className="truncate">apana.app/s/panaderia-don-jose</span>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* SCREEN CONTENT: TAB 1 - CATALOG */}
              {/* ========================================================================= */}
              {activeTab === 'catalog' && (
                <div className="flex-1 overflow-y-auto pb-16">
                  {/* Store Banner */}
                  {customImages.storeBannerUrl ? (
                    <div className="w-full h-28 overflow-hidden">
                      <img
                        src={customImages.storeBannerUrl}
                        alt="Banner de tienda"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="bg-linear-to-r from-[#00855d] to-[#059669] p-4 text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-sm border border-white/30">
                          🥖
                        </div>
                        <div>
                          <h3 className="font-extrabold text-sm leading-tight">Panadería Don José</h3>
                          <p className="text-[10px] text-emerald-100">Pan artesanal recién horneado</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Categories Pills */}
                  <div className="flex gap-1.5 p-3 overflow-x-auto border-b border-slate-200/60 bg-white">
                    <span className="px-2.5 py-1 rounded-full bg-[#059669] text-white text-[10px] font-bold shrink-0">
                      Todos
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-medium shrink-0">
                      Panes Rústicos
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-medium shrink-0">
                      Pastelería
                    </span>
                  </div>

                  {/* Products Grid */}
                  <div className="p-3 grid grid-cols-2 gap-2.5">
                    {/* Croissant */}
                    <div className="bg-white rounded-xl p-2 border border-slate-200 shadow-2xs flex flex-col">
                      <div className="w-full h-20 rounded-lg overflow-hidden bg-slate-100 mb-1.5 relative">
                        <img
                          src={customImages.croissant}
                          alt="Croissant Francés"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="font-bold text-[11px] text-slate-900 line-clamp-1">Croissant Mantequilla</p>
                      <p className="text-[9px] text-slate-500 line-clamp-1">100% hojaldrado</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-bold text-[#059669] text-[11px]">S/ 5.00</span>
                        <button className="w-6 h-6 rounded-full bg-[#059669] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                          +
                        </button>
                      </div>
                    </div>

                    {/* Baguette */}
                    <div className="bg-white rounded-xl p-2 border border-slate-200 shadow-2xs flex flex-col">
                      <div className="w-full h-20 rounded-lg overflow-hidden bg-slate-100 mb-1.5 relative">
                        <img
                          src={customImages.baguette}
                          alt="Baguette Rústica"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="font-bold text-[11px] text-slate-900 line-clamp-1">Baguette Rústica</p>
                      <p className="text-[9px] text-slate-500 line-clamp-1">Corteza dorada</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-bold text-[#059669] text-[11px]">S/ 4.50</span>
                        <button className="w-6 h-6 rounded-full bg-[#059669] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                          +
                        </button>
                      </div>
                    </div>

                    {/* Pan Campesino */}
                    <div className="bg-white rounded-xl p-2 border border-slate-200 shadow-2xs flex flex-col col-span-2">
                      <div className="flex gap-2.5">
                        <img
                          src={customImages.panCampesino}
                          alt="Pan Campesino"
                          className="w-16 h-16 rounded-lg object-cover bg-slate-100 shrink-0"
                        />
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <p className="font-bold text-[11px] text-slate-900">Pan Campesino Masa Madre</p>
                            <p className="text-[9px] text-slate-500">24 horas de fermentación natural</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#059669] text-[11px]">S/ 8.50</span>
                            <button className="px-2.5 py-1 rounded-full bg-[#059669] text-white text-[10px] font-bold shadow-xs">
                              Agregar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Mini Cart Indicator */}
                  <div className="absolute bottom-3 left-3 right-3 bg-[#059669] text-white p-2.5 rounded-xl shadow-lg flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <ShoppingBag size={14} />
                      <span className="font-bold text-[11px]">2 productos</span>
                    </div>
                    <span className="font-bold text-[11px]">Ver Carrito · S/ 9.50</span>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* SCREEN CONTENT: TAB 2 - CART (Fiel a la captura real del usuario) */}
              {/* ========================================================================= */}
              {activeTab === 'cart' && (
                <div className="flex-1 flex flex-col justify-between bg-[#f8f9ff] overflow-y-auto">
                  
                  {/* Top Bar with Back Arrow */}
                  <div className="p-3.5 flex items-center gap-2.5 border-b border-slate-100 bg-white shrink-0">
                    <ArrowLeft size={16} className="text-slate-800" />
                    <span className="font-bold text-xs text-slate-900">Tu Carrito</span>
                  </div>

                  {/* Cart Body */}
                  <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                    
                    {/* Header Icon + Title */}
                    <div className="flex flex-col items-center justify-center text-center py-2">
                      <div className="w-12 h-12 rounded-full bg-[#dcfce7] text-[#059669] flex items-center justify-center mb-1.5 shadow-2xs">
                        <ShoppingBag size={22} className="stroke-[2.2]" />
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900">Tu carrito</h3>
                      <p className="text-[10px] text-slate-500">Estás a un paso de tenerlos.</p>
                    </div>

                    {/* Product 1: Croissant Francés de Mantequilla */}
                    <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs flex items-center gap-3">
                      <img
                        src={customImages.croissant}
                        alt="Croissant Francés de Mantequilla"
                        className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[11px] text-slate-900 truncate">
                          Croissant Francés de Mantequilla
                        </p>
                        <p className="text-[#059669] font-bold text-xs mt-0.5">S/ 5.00</p>
                        
                        <div className="mt-2 flex items-center justify-between">
                          <div className="inline-flex items-center gap-2.5 bg-slate-100 px-2 py-0.5 rounded-full text-[11px] font-semibold text-slate-700">
                            <span className="text-slate-400 cursor-pointer">−</span>
                            <span>1</span>
                            <span className="text-slate-600 cursor-pointer">+</span>
                          </div>
                          <Trash2 size={13} className="text-rose-500 cursor-pointer" />
                        </div>
                      </div>
                    </div>

                    {/* Product 2: Baguette Rústica Tradicional */}
                    <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs flex items-center gap-3">
                      <img
                        src={customImages.baguette}
                        alt="Baguette Rústica Tradicional"
                        className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[11px] text-slate-900 truncate">
                          Baguette Rústica Tradicional
                        </p>
                        <p className="text-[#059669] font-bold text-xs mt-0.5">S/ 4.50</p>
                        
                        <div className="mt-2 flex items-center justify-between">
                          <div className="inline-flex items-center gap-2.5 bg-slate-100 px-2 py-0.5 rounded-full text-[11px] font-semibold text-slate-700">
                            <span className="text-slate-400 cursor-pointer">−</span>
                            <span>1</span>
                            <span className="text-slate-600 cursor-pointer">+</span>
                          </div>
                          <Trash2 size={13} className="text-rose-500 cursor-pointer" />
                        </div>
                      </div>
                    </div>

                    {/* Summary Totals Box */}
                    <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs space-y-1.5">
                      <div className="flex justify-between text-[11px] text-slate-600">
                        <span>Subtotal</span>
                        <span className="font-semibold text-slate-800">S/ 9.50</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-600">
                        <span>Envío estimado</span>
                        <span className="text-[#059669] font-semibold">Gratis</span>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-900">
                        <span>Total (2 productos)</span>
                        <span className="text-[#059669] text-sm">S/ 9.50</span>
                      </div>
                    </div>

                  </div>

                  {/* Bottom Checkout Button Area */}
                  <div className="p-3 bg-white border-t border-slate-100 shrink-0 space-y-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveTab('whatsapp')}
                      className="w-full bg-[#059669] hover:bg-[#00855d] text-white font-bold py-2.5 rounded-full text-xs flex items-center justify-center gap-2 shadow-md shadow-[#059669]/25 transition-all"
                    >
                      <WhatsAppIcon size={15} />
                      <span>Completar por WhatsApp</span>
                    </button>
                    <p className="text-[9px] text-slate-400 text-center">
                      Serás redirigido a WhatsApp de forma segura.
                    </p>
                  </div>

                </div>
              )}

              {/* ========================================================================= */}
              {/* SCREEN CONTENT: TAB 3 - WHATSAPP MESSAGE (100% Auténtico a WhatsApp) */}
              {/* ========================================================================= */}
              {activeTab === 'whatsapp' && (
                <div className="flex-1 bg-[#efeae2] flex flex-col justify-between overflow-hidden relative font-sans">
                  
                  {/* WhatsApp Doodle Wallpaper Pattern */}
                  <div 
                    className="absolute inset-0 opacity-[0.06] pointer-events-none bg-repeat"
                    style={{
                      backgroundImage: `radial-gradient(#128c7e 1px, transparent 1px)`,
                      backgroundSize: '16px 16px'
                    }}
                  />

                  {/* Phone Native Status Bar (WhatsApp Header) */}
                  <div className="bg-[#008069] text-white pt-6 pb-1 px-4 flex items-center justify-between text-[10px] font-semibold tracking-wide shrink-0">
                    <span>9:41</span>
                    <div className="flex items-center gap-1.5 text-white/90">
                      <span className="text-[10px]">5G</span>
                      <div className="w-4 h-2 rounded-[2px] border border-white/80 p-[1px] flex items-center">
                        <div className="w-2.5 h-full bg-white rounded-[1px]" />
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp App Chat Header */}
                  <div className="bg-[#008069] text-white px-2.5 py-2 flex items-center justify-between shrink-0 shadow-md relative z-10">
                    <div className="flex items-center gap-1.5">
                      <ArrowLeft size={16} className="text-white cursor-pointer" />
                      <div className="w-8 h-8 rounded-full bg-white text-[#008069] font-bold flex items-center justify-center text-sm shadow-xs shrink-0 overflow-hidden border border-white/40">
                        🥖
                      </div>
                      <div className="leading-tight">
                        <p className="font-bold text-xs text-white truncate max-w-[130px]">Panadería Don José</p>
                        <p className="text-[9.5px] text-emerald-100">en línea</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-white">
                      <Video size={16} className="cursor-pointer" />
                      <Phone size={15} className="cursor-pointer" />
                      <MoreVertical size={16} className="cursor-pointer" />
                    </div>
                  </div>

                  {/* WhatsApp Chat Message Scroll Area */}
                  <div className="p-3 overflow-y-auto space-y-2 flex-1 flex flex-col justify-end relative z-10">
                    
                    {/* WhatsApp Timestamp Badge */}
                    <div className="self-center bg-white/90 text-[#54656f] px-2.5 py-0.5 rounded-md text-[9px] font-medium shadow-2xs uppercase tracking-wider">
                      HOY
                    </div>

                    {/* WhatsApp Authentic Sent Message Bubble */}
                    <div className="bg-[#d9fdd3] text-[#111b21] rounded-2xl rounded-tr-xs p-3 shadow-xs border border-[#c4ebbe] max-w-[94%] self-end space-y-1 text-[11px] leading-[1.35] relative">
                      
                      {/* Header Line */}
                      <p className="font-bold text-[#111b21]">
                        🛒 NUEVO PEDIDO - PANADERÍA DON JOSÉ
                      </p>
                      <p className="text-[9px] text-[#111b21]/40 tracking-tighter select-none font-mono">
                        ━━━━━━━━━━━━━━━━━━━━━
                      </p>

                      {/* Items List */}
                      <div className="space-y-1 pt-0.5 text-[11px]">
                        <div>
                          <p className="font-bold text-[#111b21]">▪️ Croissant Francés de Mantequilla</p>
                          <p className="pl-3 text-[#111b21]/80 text-[10.5px]">
                            Cantidad: 1 x S/ 5.00 = <span className="font-bold text-[#111b21]">S/ 5.00</span>
                          </p>
                        </div>
                        <div>
                          <p className="font-bold text-[#111b21]">▪️ Baguette Rústica Tradicional</p>
                          <p className="pl-3 text-[#111b21]/80 text-[10.5px]">
                            Cantidad: 1 x S/ 4.50 = <span className="font-bold text-[#111b21]">S/ 4.50</span>
                          </p>
                        </div>
                      </div>

                      {/* Total Line */}
                      <p className="text-[9px] text-[#111b21]/40 tracking-tighter select-none font-mono">
                        ━━━━━━━━━━━━━━━━━━━━━
                      </p>
                      <p className="font-bold text-[#111b21] text-[11.5px]">
                        💰 TOTAL A PAGAR: S/ 9.50
                      </p>

                      {/* Customer Details */}
                      <div className="pt-1 space-y-0.5 text-[10.5px]">
                        <p>👤 <span className="font-bold">Cliente:</span> Carlos Mendoza</p>
                        <p>📝 <span className="font-bold">Dirección / Notas:</span> Delivery a Av. Larco 450 (Pan calientito por favor)</p>
                      </div>

                      {/* Footer Signature */}
                      <p className="text-[10px] italic text-[#111b21]/70 pt-1">
                        ✨ Enviado desde mi tienda APANA
                      </p>

                      {/* WhatsApp Time + Double Blue Ticks */}
                      <div className="flex items-center justify-end gap-1 text-[9px] text-[#667781] pt-0.5 font-sans">
                        <span>12:35 p. m.</span>
                        <CheckCheck size={13} className="text-[#53bdeb] stroke-[2.2]" />
                      </div>
                    </div>

                    {/* Subtle info pill under chat */}
                    <div className="bg-white/95 backdrop-blur-xs rounded-full px-3 py-1 text-[9px] text-center text-slate-600 font-semibold shadow-xs border border-slate-200 self-center">
                      ⚡ Recibes el pedido estructurado listo para despachar
                    </div>

                  </div>

                  {/* WhatsApp Bottom Native Input Bar */}
                  <div className="p-2 bg-[#f0f2f5] border-t border-slate-200/80 flex items-center gap-1.5 shrink-0 relative z-10">
                    <div className="bg-white rounded-full px-3 py-1.5 flex items-center gap-2 flex-1 shadow-2xs border border-slate-200">
                      <Smile size={16} className="text-[#8696a0] cursor-pointer" />
                      <span className="flex-1 text-[11px] text-[#8696a0]">Mensaje</span>
                      <Paperclip size={15} className="text-[#8696a0] rotate-45 cursor-pointer" />
                      <Camera size={15} className="text-[#8696a0] cursor-pointer" />
                    </div>
                    <button className="w-8 h-8 rounded-full bg-[#00a884] text-white flex items-center justify-center shadow-xs cursor-pointer shrink-0">
                      <Mic size={15} />
                    </button>
                  </div>

                </div>
              )}

            </div>
          </div>

          {/* Interactive 3-Step Selector Cards on the Side of the Phone */}
          <div className="flex-1 space-y-3.5 max-w-lg w-full">
            
            {/* Step Card 1: Catálogo */}
            <button
              type="button"
              onClick={() => handleTabChange('catalog')}
              className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-white border-[#059669] shadow-md shadow-[#059669]/10 ring-2 ring-[#059669]/20'
                  : 'bg-white/80 hover:bg-white border-[#bccac0]/40 hover:border-[#bccac0]/80 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  activeTab === 'catalog'
                    ? 'bg-[#059669] text-white shadow-xs'
                    : 'bg-[#059669]/10 text-[#059669]'
                }`}>
                  <Smartphone size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-[#0b1c30]">
                      1. Catálogo interactivo sin descargas
                    </h3>
                    {activeTab === 'catalog' && (
                      <span className="px-2 py-0.5 rounded-full bg-[#059669]/10 text-[#00855d] text-[10px] font-bold shrink-0">
                        Viendo ahora
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-[#3d4a42] mt-1 leading-relaxed">
                    Tus clientes ven fotos, precios actualizados y disponibilidad al instante desde su celular sin instalar ninguna aplicación.
                  </p>
                </div>
              </div>
            </button>

            {/* Step Card 2: Carrito */}
            <button
              type="button"
              onClick={() => handleTabChange('cart')}
              className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                activeTab === 'cart'
                  ? 'bg-white border-[#059669] shadow-md shadow-[#059669]/10 ring-2 ring-[#059669]/20'
                  : 'bg-white/80 hover:bg-white border-[#bccac0]/40 hover:border-[#bccac0]/80 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  activeTab === 'cart'
                    ? 'bg-[#059669] text-white shadow-xs'
                    : 'bg-[#059669]/10 text-[#059669]'
                }`}>
                  <ShoppingBag size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-[#0b1c30]">
                      2. Carrito y cálculo automatizado
                    </h3>
                    {activeTab === 'cart' && (
                      <span className="px-2 py-0.5 rounded-full bg-[#059669]/10 text-[#00855d] text-[10px] font-bold shrink-0">
                        Viendo ahora
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-[#3d4a42] mt-1 leading-relaxed">
                    Suma automáticamente los montos, calcula envíos y recopila los datos del cliente sin errores de cálculo manual.
                  </p>
                </div>
              </div>
            </button>

            {/* Step Card 3: WhatsApp */}
            <button
              type="button"
              onClick={() => handleTabChange('whatsapp')}
              className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                activeTab === 'whatsapp'
                  ? 'bg-white border-[#25d366] shadow-md shadow-[#25d366]/15 ring-2 ring-[#25d366]/30'
                  : 'bg-white/80 hover:bg-white border-[#bccac0]/40 hover:border-[#bccac0]/80 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  activeTab === 'whatsapp'
                    ? 'bg-linear-to-r from-[#25d366] to-[#128c7e] text-white shadow-xs'
                    : 'bg-[#25d366]/10 text-[#128c7e]'
                }`}>
                  <WhatsAppIcon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-[#0b1c30]">
                      3. Pedido directo a tu WhatsApp
                    </h3>
                    {activeTab === 'whatsapp' && (
                      <span className="px-2 py-0.5 rounded-full bg-[#25d366]/15 text-[#075e54] text-[10px] font-bold shrink-0">
                        Viendo ahora
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-[#3d4a42] mt-1 leading-relaxed">
                    Recibes un mensaje 100% ordenado con los productos, datos de entrega y el total exacto listo para cobrar y despachar.
                  </p>
                </div>
              </div>
            </button>

            {/* Bottom Call to Action */}
            <div className="pt-2">
              <Link
                href="/register"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#059669] hover:bg-[#00855d] text-white font-bold text-sm shadow-md shadow-[#059669]/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>Crear mi catálogo digital gratis</span>
                <ArrowRight size={16} />
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
