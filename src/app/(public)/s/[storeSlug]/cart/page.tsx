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

  const handleSendWhatsAppOrder = async () => {
    if (items.length === 0 || !store) return;

    if (store.plan === 'emprendedor') {
      try {
        const { recordAnalyticsEvent } = await import('@/lib/firebase/firestore');
        await recordAnalyticsEvent(store.id, 'click');
      } catch (err) {}
    }

    const link = generateWhatsAppLink(store, items, customerName, notes);
    window.open(link, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans relative pb-36">
      {/* App Bar Superior Stitch */}
      <header className="fixed top-0 w-full z-50 bg-[#f8f9ff]/80 backdrop-blur-xl border-b border-[#bccac0]/20">
        <div className="h-16 px-4 max-w-[640px] mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#0b1c30] hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-lg text-[#0b1c30] truncate">
            Tu Carrito
          </h1>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-16 pb-safe max-w-[640px] w-full mx-auto">
        <div className="px-4 py-6 flex flex-col gap-6">
          {/* Header de Carrito Stitch */}
          <div className="flex flex-col items-center justify-center text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center mb-3 shadow-xs">
              <ShoppingBag size={32} />
            </div>
            <h2 className="text-2xl font-bold text-[#0b1c30]">Tu carrito</h2>
            <p className="text-sm text-[#3d4a42]">Estás a un paso de tenerlos.</p>
          </div>

          {items.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-[#bccac0]/40 text-center flex flex-col items-center gap-3 shadow-xs">
              <span className="text-4xl">🛍️</span>
              <h3 className="font-bold text-lg text-[#0b1c30]">El carrito está vacío</h3>
              <p className="text-xs text-[#6d7a72]">Regresa al catálogo y añade tus productos favoritos.</p>
              <Link href={`/s/${resolvedParams.storeSlug}`}>
                <Button variant="primary" size="sm" className="mt-2 h-10 px-4">
                  Explorar Productos
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Lista de Ítems del Carrito Stitch */}
              <div className="flex flex-col gap-3">
                {items.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl p-4 flex items-center gap-4 border border-[#bccac0]/40 shadow-xs relative overflow-hidden"
                  >
                    <div className="w-20 h-20 rounded-xl bg-gray-50 shrink-0 overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-[#0b1c30] truncate">
                        {product.title}
                      </h3>
                      <span className="text-sm font-bold text-[#059669] mt-0.5">
                        {formatCurrency(product.price)}
                      </span>

                      {/* Controles de Cantidad Stitch */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center rounded-full text-[#3d4a42] hover:bg-gray-200 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-xs font-bold text-[#0b1c30] w-4 text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center rounded-full text-[#3d4a42] hover:bg-gray-200 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(product.id)}
                          className="text-[#ba1a1a] hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                          title="Quitar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resumen de Total Stitch */}
              <div className="bg-white rounded-2xl p-5 border border-[#bccac0]/40 shadow-xs flex flex-col gap-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#6d7a72]">Subtotal</span>
                  <span className="font-semibold text-[#0b1c30]">{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between items-center text-sm pb-3 border-b border-gray-100">
                  <span className="text-[#6d7a72]">Envío estimado</span>
                  <span className="font-semibold text-[#059669]">Gratis</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="font-bold text-base text-[#0b1c30]">Total ({totalCount} productos)</span>
                  <span className="font-bold text-xl text-[#059669]">{formatCurrency(totalPrice)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Fixed Bottom Action Bar Stitch (Completar por WhatsApp) */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-[640px] mx-auto bg-white/95 backdrop-blur-md p-4 pb-safe border-t border-[#bccac0]/30 shadow-[0_-4px_16px_rgba(0,0,0,0.05)] z-40">
          <button
            onClick={handleSendWhatsAppOrder}
            className="w-full h-12 bg-[#059669] hover:bg-[#00855d] text-white rounded-xl font-bold text-base shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <WhatsAppIcon size={20} />
            Completar por WhatsApp
          </button>
          <p className="text-center text-xs text-[#6d7a72] mt-2">
            Serás redirigido a WhatsApp de forma segura.
          </p>
        </div>
      )}
    </div>
  );
}
