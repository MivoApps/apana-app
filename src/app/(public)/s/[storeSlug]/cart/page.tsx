'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { useCartStore } from '@/lib/cart-store';
import { useAppStore } from '@/lib/app-store';
import { Store } from '@/types/store';
import { formatCurrency, generateWhatsAppLink } from '@/lib/whatsapp';
import { Button } from '@/components/ui/Button';

interface Props {
  params: Promise<{
    storeSlug: string;
  }>;
}

export default function PublicCartPage({ params }: Props) {
  const router = useRouter();
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems } = useCartStore();
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'yape' | 'transferencia' | 'efectivo' | ''>('yape');
  const [notes, setNotes] = useState('');

  const resolvedParams = React.use(params);
  const [store, setStore] = useState<Store | null>(null);

  React.useEffect(() => {
    const fetchStore = async () => {
      const { getStoreBySlugFromFS } = await import('@/lib/firebase/firestore');
      const fsStore = await getStoreBySlugFromFS(resolvedParams.storeSlug);
      if (fsStore) setStore(fsStore);
    };
    fetchStore();
  }, [resolvedParams.storeSlug]);

  const totalPrice = getTotalPrice();
  const totalCount = getTotalItems();

  const getPaymentMethodLabel = () => {
    if (paymentMethod === 'yape') return 'Yape / Plin';
    if (paymentMethod === 'transferencia') return 'Transferencia Bancaria';
    if (paymentMethod === 'efectivo') return 'Efectivo / Contra entrega';
    return '';
  };

  const handleSendWhatsAppOrder = async () => {
    if (items.length === 0 || !store) return;

    if (store.plan === 'emprendedor' || store.plan === 'negocio') {
      try {
        const { recordAnalyticsEvent } = await import('@/lib/firebase/firestore');
        await recordAnalyticsEvent(store.id, 'click');
      } catch (err) { }
    }

    const paymentLabel = getPaymentMethodLabel();

    // Registrar pedido en la base de datos para exportación a Excel en Plan Negocio Pro
    try {
      const { recordStoreOrderInFS } = await import('@/lib/firebase/firestore');
      await recordStoreOrderInFS(store.id, {
        storeId: store.id,
        customerName: customerName.trim() || 'Cliente WhatsApp',
        customerAddress: customerAddress.trim() || '',
        paymentMethod: paymentLabel || 'WhatsApp',
        items: items.map(it => ({
          id: it.product.id,
          title: it.product.title,
          price: it.calculatedPrice ?? it.product.price,
          quantity: it.quantity,
          selectedOption: it.selectedOptions && it.selectedOptions.length > 0
            ? it.selectedOptions.map(o => `${o.groupTitle}: ${o.valueName}`).join(', ')
            : '',
        })),
        total: totalPrice,
        status: 'enviado_whatsapp',
      });
    } catch (orderErr) {
      console.warn('No se pudo registrar orden local:', orderErr);
    }

    const link = generateWhatsAppLink(store, items, {
      customerName: customerName.trim(),
      customerAddress: customerAddress.trim(),
      paymentMethod: paymentLabel,
      notes: notes.trim(),
    });
    window.open(link, '_blank');
  };

  const isElegant = store?.themeStyle === 'elegante';
  const isModern = store?.themeStyle === 'moderna';
  const brandColor = store?.primaryColor || '#059669';

  return (
    <div className={`min-h-screen flex flex-col font-sans relative pb-36 transition-colors ${isElegant
      ? 'bg-[#FAF8F5] text-stone-900'
      : isModern
        ? 'bg-slate-50 text-[#0b1c30]'
        : 'bg-white text-neutral-900'
      }`}>
      {/* App Bar Superior */}
      <header className={`fixed top-0 w-full z-50 backdrop-blur-xl border-b transition-colors ${isElegant
        ? 'bg-[#FAF8F5]/90 border-[#E7E2D9]'
        : isModern
          ? 'bg-white/90 border-slate-200/80 shadow-2xs'
          : 'bg-white/90 border-neutral-100'
        }`}>
        <div className="h-16 px-4 max-w-[640px] mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors cursor-pointer ${isElegant ? 'text-stone-800 hover:bg-stone-200/50' : 'text-[#0b1c30] hover:bg-gray-100'
              }`}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className={`font-bold text-lg truncate ${isElegant ? 'font-playfair text-stone-900' : isModern ? 'font-space-grotesk text-[#0b1c30]' : 'font-plus-jakarta text-neutral-900'
            }`}>
            Tu Carrito
          </h1>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-16 pb-safe max-w-[640px] w-full mx-auto">
        <div className="px-4 py-6 flex flex-col gap-6">
          {/* Header de Carrito */}
          <div className="flex flex-col items-center justify-center text-center py-4">
            <div
              style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
              className="w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-xs"
            >
              <ShoppingBag size={30} />
            </div>
            <h2 className={`text-2xl font-bold ${isElegant ? 'font-playfair text-stone-900' : isModern ? 'font-space-grotesk text-[#0b1c30]' : 'font-plus-jakarta text-neutral-900'
              }`}>
              Tu carrito
            </h2>
            <p className={`text-sm ${isElegant ? 'text-stone-500 font-sans' : 'text-neutral-500'}`}>
              Estás a un paso de tenerlos.
            </p>
          </div>

          {items.length === 0 ? (
            <div className={`rounded-2xl p-8 border text-center flex flex-col items-center gap-3 shadow-xs ${isElegant ? 'bg-white border-[#E7E2D9]' : isModern ? 'bg-white border-slate-200' : 'bg-neutral-50 border-neutral-200'
              }`}>
              <span className="text-4xl">🛍️</span>
              <h3 className={`font-bold text-lg ${isElegant ? 'font-playfair text-stone-900' : 'text-[#0b1c30]'}`}>
                El carrito está vacío
              </h3>
              <p className="text-xs text-[#6d7a72]">Regresa al catálogo y añade tus productos favoritos.</p>
              <Link href={`/s/${resolvedParams.storeSlug}`}>
                <Button variant="primary" size="sm" className="mt-2 h-10 px-4">
                  Explorar Productos
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Lista de Ítems del Carrito */}
              <div className="flex flex-col gap-3">
                {items.map((item) => {
                  const { id: cartItemId, product, quantity, selectedOptions, calculatedPrice } = item;
                  const itemUnitPrice = calculatedPrice ?? product.price;

                  return (
                    <div
                      key={cartItemId}
                      className={`bg-white rounded-2xl p-4 flex items-center gap-4 border shadow-xs relative overflow-hidden ${isElegant ? 'border-[#E7E2D9]' : isModern ? 'border-slate-200' : 'border-neutral-100'
                        }`}
                    >
                      <div className="w-20 h-20 rounded-xl bg-gray-50 shrink-0 overflow-hidden">
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <h3 className={`font-semibold text-sm truncate ${isElegant ? 'font-playfair text-stone-900' : isModern ? 'font-space-grotesk text-[#0b1c30]' : 'text-neutral-900'
                          }`}>
                          {product.title}
                        </h3>

                        {/* Opciones Seleccionadas */}
                        {selectedOptions && selectedOptions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedOptions.map((opt, i) => (
                              <span
                                key={i}
                                className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md border ${isElegant
                                  ? 'bg-amber-50 text-amber-900 border-amber-200/70'
                                  : isModern
                                    ? 'bg-blue-50 text-blue-900 border-blue-200/70'
                                    : 'bg-neutral-100 text-neutral-700 border-neutral-200/70'
                                  }`}
                              >
                                {opt.groupTitle}: {opt.valueName}
                              </span>
                            ))}
                          </div>
                        )}

                        <span
                          className={`text-sm font-bold mt-1 ${isElegant ? 'font-playfair italic text-stone-900' : ''}`}
                          style={!isElegant ? { color: brandColor } : undefined}
                        >
                          {formatCurrency(itemUnitPrice)}
                        </span>

                        {/* Controles de Cantidad */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1">
                            <button
                              onClick={() => updateQuantity(cartItemId, quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center rounded-full text-[#3d4a42] hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-xs font-bold text-[#0b1c30] w-4 text-center">
                              {quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(cartItemId, quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center rounded-full text-[#3d4a42] hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(cartItemId)}
                            className="text-[#ba1a1a] hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                            title="Quitar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tarjeta de Datos de Entrega y Pago del Cliente */}
              <div className={`bg-white rounded-2xl p-5 border shadow-xs flex flex-col gap-4 ${isElegant ? 'border-[#E7E2D9]' : isModern ? 'border-slate-200' : 'border-neutral-100'
                }`}>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                  <h3 className={`text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 ${isElegant ? 'font-playfair text-stone-900 font-bold' : ''
                    }`}>
                    <span>📍 Datos para tu Entrega y Pago</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">Opcional</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Nombre */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-slate-600">Tu Nombre</label>
                    <input
                      type="text"
                      placeholder="Ej: María Gómez"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="h-10 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-[#0b1c30] placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#059669] transition-all"
                    />
                  </div>

                  {/* Dirección / Distrito */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-slate-600">Distrito / Dirección</label>
                    <input
                      type="text"
                      placeholder="Ej: Miraflores, Lima"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="h-10 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-[#0b1c30] placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#059669] transition-all"
                    />
                  </div>
                </div>

                {/* Selector de Método de Pago */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-600">¿Cómo prefieres pagar?</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('yape')}
                      className={`h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${paymentMethod === 'yape'
                        ? 'bg-[#742284]/10 border-[#742284] text-[#742284] shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      <span>🟣</span>
                      <span>Yape / Plin</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('transferencia')}
                      className={`h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${paymentMethod === 'transferencia'
                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      <span>💳</span>
                      <span>Transferencia</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('efectivo')}
                      className={`h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${paymentMethod === 'efectivo'
                        ? 'bg-emerald-50 border-[#059669] text-[#059669] shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      <span>💵</span>
                      <span>Efectivo</span>
                    </button>
                  </div>
                </div>

                {/* Notas adicionales */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-600">Notas o indicación especial</label>
                  <input
                    type="text"
                    placeholder="Deseas comentarnos algo?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="h-10 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-[#0b1c30] placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#059669] transition-all"
                  />
                </div>
              </div>

              {/* Resumen de Total */}
              <div className={`bg-white rounded-2xl p-5 border shadow-xs flex flex-col gap-3 ${isElegant ? 'border-[#E7E2D9]' : isModern ? 'border-slate-200' : 'border-neutral-100'
                }`}>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#6d7a72]">Subtotal</span>
                  <span className="font-semibold text-[#0b1c30]">{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between items-center text-sm pb-3 border-b border-gray-100">
                  <span className="text-[#6d7a72]">Envío estimado</span>
                  <span className={`font-semibold ${store?.shippingType === 'gratis' ? 'text-[#059669]' : 'text-slate-600 text-xs'}`}>
                    {store?.shippingType === 'gratis' ? 'Gratis' : 'A coordinar por WhatsApp'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className={`font-bold text-base ${isElegant ? 'font-playfair text-stone-900' : 'text-[#0b1c30]'}`}>
                    Total ({totalCount} productos)
                  </span>
                  <span
                    className={`font-bold text-xl ${isElegant ? 'font-playfair italic text-stone-900' : ''}`}
                    style={!isElegant ? { color: brandColor } : undefined}
                  >
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Fixed Bottom Action Bar (Completar por WhatsApp) */}
      {items.length > 0 && (
        <div className={`fixed bottom-0 left-0 right-0 max-w-[640px] mx-auto backdrop-blur-md p-4 pb-safe border-t shadow-[0_-4px_16px_rgba(0,0,0,0.05)] z-40 ${isElegant ? 'bg-[#FAF8F5]/95 border-[#E7E2D9]' : 'bg-white/95 border-[#bccac0]/30'
          }`}>
          {(!store?.whatsappPhone || !store?.isWhatsappVerified) ? (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                disabled
                className="w-full h-12 bg-slate-200 text-slate-500 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 cursor-not-allowed shadow-none select-none"
              >
                <span>⏳ Pedidos no disponibles temporalmente</span>
              </button>
              <p className="text-[11px] text-amber-950 bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 text-center leading-tight">
                Esta tienda aún está configurando su línea de atención. Vuelve a visitarnos pronto para enviar tu pedido por WhatsApp.
              </p>
            </div>
          ) : (
            <>
              <button
                onClick={handleSendWhatsAppOrder}
                style={{ backgroundColor: brandColor }}
                className={`w-full h-12 text-white font-bold text-base shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer ${isElegant ? 'rounded-2xl font-playfair tracking-wide' : isModern ? 'rounded-2xl uppercase font-space-grotesk' : 'rounded-xl font-plus-jakarta'
                  }`}
              >
                <WhatsAppIcon size={20} />
                Completar por WhatsApp
              </button>
              <p className="text-center text-xs text-[#6d7a72] mt-2">
                Serás redirigido a WhatsApp de forma segura.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
