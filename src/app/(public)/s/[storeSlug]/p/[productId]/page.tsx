'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ShoppingBag, 
  ShoppingCart, 
  Check, 
  MessageCircle 
} from 'lucide-react';
import { useAppStore } from '@/lib/app-store';
import { useCartStore } from '@/lib/cart-store';
import { formatCurrency } from '@/lib/whatsapp';
import { getStoreBySlugFromFS, getProductsByStoreIdFromFS } from '@/lib/firebase/firestore';
import { Store, Product } from '@/types/store';

interface Props {
  params: Promise<{
    storeSlug: string;
    productId: string;
  }>;
}

export default function PublicProductDetailPage({ params }: Props) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const [added, setAdded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Unwrap params
  const resolvedParams = React.use(params);
  const { storeSlug, productId } = resolvedParams;

  const [fsStore, setFsStore] = useState<Store | null>(null);
  const [fsProducts, setFsProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchFS = async () => {
      setIsLoading(true);
      const fetchedStore = await getStoreBySlugFromFS(storeSlug);
      if (fetchedStore) {
        setFsStore(fetchedStore);
        const prods = await getProductsByStoreIdFromFS(fetchedStore.id);
        setFsProducts(prods);

        // Registrar vista única de producto por sesión
        const sessionViewKey = `apana_prod_viewed_${productId}`;
        if (!sessionStorage.getItem(sessionViewKey) && fetchedStore.plan === 'emprendedor') {
          sessionStorage.setItem(sessionViewKey, 'true');
          try {
            const { increment } = await import('firebase/firestore');
            const { updateProductInFS } = await import('@/lib/firebase/firestore');
            await updateProductInFS(fetchedStore.id, productId, {
              views: increment(1) as any
            });
          } catch (err) {
            console.error('Error incrementing product views:', err);
          }
        }
      }
      setIsLoading(false);
    };
    fetchFS();
  }, [storeSlug, productId]);

  const activeStore = fsStore;
  const allProducts = fsProducts;
  const targetProduct = allProducts.find((p) => p.id === productId);

  const handleAddToCart = () => {
    if (targetProduct) {
      addItem(targetProduct);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (targetProduct) {
      addItem(targetProduct);
      router.push(`/s/${storeSlug}/cart`);
    }
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && document.referrer && document.referrer.includes(window.location.host)) {
      router.back();
    } else {
      router.push(`/s/${storeSlug}`);
    }
  };

  if (!targetProduct) {
    return <div className="min-h-screen bg-white" />;
  }

  const relatedProducts = allProducts.filter((p) => p.id !== targetProduct.id).slice(0, 2);

  return (
    <div className="min-h-screen bg-white text-[#0b1c30] flex flex-col font-sans relative pb-32">
      {/* Header Fijo con logo y back Stitch */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-[#bccac0]/20">
        <div className="h-16 px-4 max-w-[640px] mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#0b1c30] hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <Link
            href={`/s/${storeSlug}`}
            className="w-9 h-9 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-xs hover:scale-105 active:scale-95 transition-all"
            style={{ backgroundColor: activeStore?.primaryColor || '#059669' }}
            title="Ir a la tienda"
          >
            {activeStore ? activeStore.name.substring(0, 2).toUpperCase() : 'AP'}
          </Link>
          <div className="w-10" />
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-16">
        <div className="flex flex-col w-full max-w-[640px] mx-auto">
          {/* Galería de Imágenes Interactiva */}
          {(() => {
            const productImages = targetProduct.imageUrls && targetProduct.imageUrls.filter(Boolean).length > 0
              ? targetProduct.imageUrls.filter(Boolean)
              : [targetProduct.imageUrl || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80'];
            
            return (
              <div className="flex flex-col w-full bg-gray-50 pb-2 border-b border-gray-100">
                <div className="w-full aspect-square overflow-hidden relative">
                  <img
                    src={productImages[activeImageIndex] || productImages[0]}
                    alt={targetProduct.title}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                  {productImages.length > 1 && (
                    <span className="absolute bottom-4 right-4 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {activeImageIndex + 1} / {productImages.length}
                    </span>
                  )}
                </div>
                
                {productImages.length > 1 && (
                  <div className="flex gap-2 px-4 pt-3 overflow-x-auto justify-center">
                    {productImages.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                          activeImageIndex === idx
                            ? 'border-[#059669] scale-105 shadow-2xs'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={imgUrl} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Content Section Stitch */}
          <div className="px-6 py-6 flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold tracking-wider uppercase ${
                  targetProduct.inStock === false ? 'text-amber-700 bg-amber-100 px-2 py-0.5 rounded' : 'text-[#059669]'
                }`}>
                  {targetProduct.inStock === false ? 'Agotado temporalmente' : 'Pocas unidades'}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-[#0b1c30] leading-tight">
                {targetProduct.title}
              </h1>
              <span className={`text-2xl font-bold block mt-1 ${
                targetProduct.inStock === false ? 'text-slate-400' : 'text-[#0b1c30]'
              }`}>
                {formatCurrency(targetProduct.price)}
              </span>
            </div>
            <p className="text-sm text-[#3d4a42] leading-relaxed mt-1">
              {targetProduct.description || 'Pieza de diseño artesanal única elaborada con la máxima calidad y atención al detalle.'}
            </p>
          </div>

          {/* Related Products Stitch */}
          <div className="px-6 py-6 border-t border-gray-100 mt-2">
            <h3 className="text-lg font-bold text-[#0b1c30] mb-4">También te podría gustar</h3>
            <div className="grid grid-cols-2 gap-4">
              {relatedProducts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/s/${resolvedParams.storeSlug}/p/${rel.id}`}
                  className="flex flex-col gap-2 group"
                >
                  <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden relative">
                    <img
                      src={rel.imageUrl}
                      alt={rel.title}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                        rel.inStock === false ? 'grayscale contrast-75' : ''
                      }`}
                    />
                    {rel.inStock === false && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-white/95 text-slate-800 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                          Agotado
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#0b1c30] truncate">{rel.title}</h4>
                    <span className="text-xs text-[#6d7a72] font-semibold">{formatCurrency(rel.price)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Actions Stitch */}
      <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-[#bccac0]/30 p-4 pb-safe flex flex-col gap-2.5 z-50 max-w-[640px] mx-auto left-0 right-0">
        {targetProduct.inStock === false ? (
          <div className="w-full h-12 bg-slate-100 text-slate-500 rounded-xl font-bold text-sm flex items-center justify-center border border-slate-200 cursor-not-allowed">
            🚫 Producto Agotado Temporalmente
          </div>
        ) : (
          <>
            <button
              onClick={handleBuyNow}
              className="w-full h-12 bg-[#059669] hover:bg-[#00855d] text-white rounded-xl font-bold text-base shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Comprar ahora
            </button>

            <button
              onClick={handleAddToCart}
              className="w-full h-12 bg-white text-[#0b1c30] border border-[#bccac0] rounded-xl font-semibold text-sm hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {added ? <Check size={18} className="text-[#059669]" /> : <ShoppingCart size={18} />}
              {added ? '¡Añadido al Carrito!' : 'Añadir al carrito'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
