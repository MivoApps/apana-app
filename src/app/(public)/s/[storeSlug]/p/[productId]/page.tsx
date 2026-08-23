'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ShoppingBag, 
  ShoppingCart, 
  Check, 
  MessageCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAppStore } from '@/lib/app-store';
import { useCartStore } from '@/lib/cart-store';
import { formatCurrency } from '@/lib/whatsapp';
import { getStoreBySlugFromFS, getProductsByStoreIdFromFS } from '@/lib/firebase/firestore';
import { Store, Product, ProductOptionGroup, SelectedOption, ProductOptionValue } from '@/types/store';

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
  const [selectedValues, setSelectedValues] = useState<{ [groupId: string]: string }>({});

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

        // Inicializar opciones del producto actual
        const currentProd = prods.find((p) => p.id === productId);
        if (currentProd && currentProd.options && currentProd.options.length > 0) {
          const initialMap: { [groupId: string]: string } = {};
          currentProd.options.forEach((group) => {
            if (group.values.length > 0) {
              initialMap[group.id] = group.values[0].id;
            }
          });
          setSelectedValues(initialMap);
        }

        // Registrar vista única de producto por sesión
        const sessionViewKey = `apana_prod_viewed_${productId}`;
        if (!sessionStorage.getItem(sessionViewKey) && (fetchedStore.plan === 'emprendedor' || fetchedStore.plan === 'negocio')) {
          sessionStorage.setItem(sessionViewKey, 'true');
          try {
            const { increment } = await import('firebase/firestore');
            const { updateProductInFS, recordAnalyticsEvent } = await import('@/lib/firebase/firestore');
            await updateProductInFS(fetchedStore.id, productId, {
              views: increment(1) as any
            });
            recordAnalyticsEvent(fetchedStore.id, 'product_view');
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

  const productImages: string[] = targetProduct?.imageUrls && targetProduct.imageUrls.filter(Boolean).length > 0
    ? targetProduct.imageUrls.filter(Boolean) as string[]
    : [targetProduct?.imageUrl || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80'];

  const options: ProductOptionGroup[] = targetProduct?.options || [];
  const selectedOptionsList: SelectedOption[] = options.map((group: ProductOptionGroup) => {
    const selectedValId = selectedValues[group.id];
    const valObj = group.values.find((v: ProductOptionValue) => v.id === selectedValId) || group.values[0];
    return {
      groupTitle: group.title,
      valueName: valObj?.name || '',
      priceDifference: valObj?.priceDifference || 0,
    };
  }).filter(o => o.valueName.trim() !== '');

  const priceDelta = selectedOptionsList.reduce((acc, opt) => acc + (opt.priceDifference || 0), 0);
  const unitPrice = Math.max(0, (targetProduct?.price || 0) + priceDelta);

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 40;

    if (distance > minSwipeDistance && productImages.length > 1) {
      // Deslizar a la izquierda -> Siguiente foto
      setActiveImageIndex((prev) => (prev + 1) % productImages.length);
    } else if (distance < -minSwipeDistance && productImages.length > 1) {
      // Deslizar a la derecha -> Foto anterior
      setActiveImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const handleAddToCart = () => {
    if (targetProduct) {
      addItem(targetProduct, selectedOptionsList);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
      if (activeStore && (activeStore.plan === 'emprendedor' || activeStore.plan === 'negocio')) {
        import('@/lib/firebase/firestore').then(({ recordAnalyticsEvent }) => {
          recordAnalyticsEvent(activeStore.id, 'cart_add');
        });
      }
    }
  };

  const handleBuyNow = () => {
    if (targetProduct) {
      addItem(targetProduct, selectedOptionsList);
      if (activeStore && (activeStore.plan === 'emprendedor' || activeStore.plan === 'negocio')) {
        import('@/lib/firebase/firestore').then(({ recordAnalyticsEvent }) => {
          recordAnalyticsEvent(activeStore.id, 'cart_add');
        });
      }
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

  // Recomendación Inteligente de Productos:
  // 1. Muestra primero los de la misma categoría
  // 2. Completa con los demás productos activos de la tienda
  // 3. Máximo 4 sugerencias
  const sameCategoryProducts = targetProduct.category
    ? allProducts.filter((p) => p.id !== targetProduct.id && p.category && p.category === targetProduct.category)
    : [];
  const otherCategoryProducts = allProducts.filter(
    (p) => p.id !== targetProduct.id && (!targetProduct.category || p.category !== targetProduct.category)
  );
  const relatedProducts = [...sameCategoryProducts, ...otherCategoryProducts].slice(0, 4);

  const isElegant = activeStore?.themeStyle === 'elegante';
  const isModern = activeStore?.themeStyle === 'moderna';
  const isMinimal = !isElegant && !isModern;
  const brandColor = activeStore?.primaryColor || '#059669';

  return (
    <div className={`min-h-screen flex flex-col font-sans relative pb-32 transition-colors ${
      isElegant
        ? 'bg-[#FAF8F5] text-stone-900'
        : isModern
        ? 'bg-slate-50 text-[#0b1c30]'
        : 'bg-white text-neutral-900'
    }`}>
      {/* Header Fijo con logo y back */}
      <header className={`fixed top-0 w-full z-50 backdrop-blur-xl border-b transition-colors ${
        isElegant
          ? 'bg-[#FAF8F5]/90 border-[#E7E2D9]'
          : isModern
          ? 'bg-white/90 border-slate-200/80 shadow-2xs'
          : 'bg-white/90 border-neutral-100'
      }`}>
        <div className="h-16 px-4 max-w-[640px] mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
              isElegant ? 'text-stone-800 hover:bg-stone-200/50' : 'text-[#0b1c30] hover:bg-gray-100'
            }`}
          >
            <ArrowLeft size={20} />
          </button>
          <Link
            href={`/s/${storeSlug}`}
            className={`w-9 h-9 flex items-center justify-center font-bold text-sm shadow-xs hover:scale-105 active:scale-95 transition-all overflow-hidden ${
              isElegant ? 'rounded-xl border border-stone-200/60 font-playfair' : isModern ? 'rounded-2xl' : 'rounded-full'
            }`}
            style={!activeStore?.logoUrl ? { backgroundColor: brandColor } : undefined}
            title="Ir a la tienda"
          >
            {activeStore?.logoUrl ? (
              <img src={activeStore.logoUrl} alt={activeStore.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white">
                {activeStore ? activeStore.name.substring(0, 2).toUpperCase() : 'AP'}
              </span>
            )}
          </Link>
          <div className="w-10" />
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-16">
        <div className="flex flex-col w-full max-w-[640px] mx-auto">
          {/* Galería de Imágenes Interactiva con Flechas y Swipe */}
          <div className={`flex flex-col w-full pb-2 border-b ${
            isElegant ? 'bg-[#FAF8F5] border-[#E7E2D9]' : isModern ? 'bg-slate-100 border-slate-200' : 'bg-white border-neutral-100'
          }`}>
            <div
              className="w-full aspect-square overflow-hidden relative select-none touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={productImages[activeImageIndex] || productImages[0]}
                alt={targetProduct.title}
                className="w-full h-full object-cover transition-all duration-300 pointer-events-none"
              />

              {/* Botones Laterales para pasar de foto */}
              {productImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 active:scale-90 text-white flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer shadow-md z-20"
                    title="Foto anterior"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 active:scale-90 text-white flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer shadow-md z-20"
                    title="Siguiente foto"
                  >
                    <ChevronRight size={20} />
                  </button>

                  {/* Badge Contador de fotos */}
                  <span className="absolute bottom-3 right-3 bg-black/65 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-xs shadow-xs">
                    {activeImageIndex + 1} / {productImages.length}
                  </span>
                </>
              )}
            </div>
            
            {/* Tira de Miniaturas */}
            {productImages.length > 1 && (
              <div className="flex gap-2 px-4 pt-3 overflow-x-auto justify-center">
                {productImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? isElegant ? 'border-amber-700 scale-105 shadow-2xs' : 'border-[#059669] scale-105 shadow-2xs'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="px-6 py-6 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              {/* Badge de Categoría y Estado */}
              <div className="flex items-center gap-2 flex-wrap">
                {targetProduct.category && (
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                    isElegant
                      ? 'bg-amber-100/70 border-amber-300 text-amber-900'
                      : isModern
                      ? 'bg-blue-100/70 border-blue-200 text-blue-900'
                      : 'bg-neutral-100 border-neutral-200 text-neutral-700 font-medium'
                  }`}>
                    {targetProduct.category}
                  </span>
                )}
                {targetProduct.inStock === false && (
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md">
                    Agotado temporalmente
                  </span>
                )}
              </div>

              <h1 className={`text-2xl sm:text-3xl font-bold leading-tight ${
                isElegant
                  ? 'font-playfair text-stone-900'
                  : isModern
                  ? 'font-space-grotesk font-extrabold text-[#0b1c30] uppercase tracking-wide'
                  : 'font-plus-jakarta text-neutral-900 tracking-tight'
              }`}>
                {targetProduct.title}
              </h1>
              <span className={`text-2xl font-bold block mt-0.5 ${
                targetProduct.inStock === false
                  ? 'text-slate-400'
                  : isElegant
                  ? 'font-playfair italic text-stone-900'
                  : isModern
                  ? 'font-space-grotesk font-extrabold'
                  : 'font-plus-jakarta text-neutral-900'
              }`}
                style={targetProduct.inStock !== false && isModern ? { color: brandColor } : undefined}
              >
                {formatCurrency(unitPrice)}
              </span>
            </div>

            {/* Selector de Variantes / Opciones */}
            {options.length > 0 && (
              <div className={`space-y-4 pt-2 pb-2 border-t border-b my-1 ${
                isElegant ? 'border-[#E7E2D9]' : 'border-gray-100'
              }`}>
                {options.map((group: ProductOptionGroup) => {
                  const currentSelectedValId = selectedValues[group.id];

                  return (
                    <div key={group.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className={`text-xs font-bold uppercase tracking-wider ${
                          isElegant ? 'text-stone-800 font-playfair' : 'text-[#0b1c30]'
                        }`}>
                          {group.title}:
                        </label>
                        <span className={`text-xs font-bold ${
                          isElegant ? 'text-amber-800' : 'text-[#059669]'
                        }`}>
                          {group.values.find((v: ProductOptionValue) => v.id === currentSelectedValId)?.name}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {group.values.map((val: ProductOptionValue) => {
                          const isSelected = currentSelectedValId === val.id;
                          const hasDiff = val.priceDifference && val.priceDifference > 0;

                          return (
                            <button
                              key={val.id}
                              type="button"
                              onClick={() => {
                                setSelectedValues((prev) => ({
                                  ...prev,
                                  [group.id]: val.id,
                                }));
                                if (val.imageUrl) {
                                  const imgIdx = productImages.findIndex((img) => img === val.imageUrl);
                                  if (imgIdx !== -1) {
                                    setActiveImageIndex(imgIdx);
                                  }
                                }
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                isSelected
                                  ? isElegant
                                    ? 'bg-amber-900 text-white shadow-sm ring-2 ring-amber-400/30'
                                    : isModern
                                    ? 'bg-[#059669] text-white shadow-md shadow-[#059669]/20 ring-2 ring-[#059669]/30 scale-[1.02]'
                                    : 'bg-neutral-900 text-white shadow-2xs'
                                  : isElegant
                                  ? 'bg-white hover:bg-amber-50/50 text-stone-800 border border-[#E7E2D9]'
                                  : isModern
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80'
                                  : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200/80'
                              }`}
                            >
                              {isSelected && <Check size={13} className="stroke-[3]" />}
                              {val.imageUrl && (
                                <img
                                  src={val.imageUrl}
                                  alt={val.name}
                                  className="w-4 h-4 rounded-md object-cover border border-black/10 shrink-0"
                                />
                              )}
                              <span>{val.name}</span>
                              {hasDiff && (
                                <span className={`text-[10px] ml-0.5 ${
                                  isSelected ? 'text-amber-100 font-normal' : isElegant ? 'text-amber-800' : 'text-[#059669]'
                                }`}>
                                  (+{formatCurrency(val.priceDifference!)})
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Descripción del Producto (Solo se muestra si fue escrita) */}
            {targetProduct.description && (
              <p className={`text-sm leading-relaxed mt-1 whitespace-pre-line ${
                isElegant ? 'text-stone-600 font-sans' : isModern ? 'text-slate-600 font-sans' : 'text-neutral-600 font-plus-jakarta'
              }`}>
                {targetProduct.description}
              </p>
            )}
          </div>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className={`px-6 py-6 border-t mt-2 ${
              isElegant ? 'border-[#E7E2D9]' : 'border-gray-100'
            }`}>
              <h3 className={`text-lg font-bold mb-4 ${
                isElegant ? 'font-playfair text-stone-900' : isModern ? 'font-space-grotesk text-[#0b1c30]' : 'text-neutral-900'
              }`}>
                También te podría gustar
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {relatedProducts.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/s/${resolvedParams.storeSlug}/p/${rel.id}`}
                    className="flex flex-col gap-2 group"
                  >
                    <div className={`aspect-square rounded-xl overflow-hidden relative ${
                      isElegant ? 'bg-[#FAF8F5] border border-[#E7E2D9]' : 'bg-gray-50'
                    }`}>
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
                      <h4 className={`text-sm font-semibold truncate ${
                        isElegant ? 'font-playfair text-stone-900' : isModern ? 'font-space-grotesk text-[#0b1c30]' : 'text-neutral-900'
                      }`}>
                        {rel.title}
                      </h4>
                      <span className={`text-xs font-semibold ${
                        isElegant ? 'font-playfair italic text-stone-700' : 'text-[#6d7a72]'
                      }`}>
                        {formatCurrency(rel.price)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Fixed Bottom Actions */}
      <div className={`fixed bottom-0 left-0 w-full backdrop-blur-xl border-t p-4 pb-safe flex flex-col gap-2.5 z-50 max-w-[640px] mx-auto left-0 right-0 ${
        isElegant ? 'bg-[#FAF8F5]/95 border-[#E7E2D9]' : 'bg-white/95 border-[#bccac0]/30'
      }`}>
        {targetProduct.inStock === false ? (
          <div className="w-full h-12 bg-slate-100 text-slate-500 rounded-xl font-bold text-sm flex items-center justify-center border border-slate-200 cursor-not-allowed">
            🚫 Producto Agotado Temporalmente
          </div>
        ) : (
          <>
            <button
              onClick={handleBuyNow}
              style={{ backgroundColor: brandColor }}
              className={`w-full h-12 text-white font-bold text-base shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isElegant ? 'rounded-2xl font-playfair tracking-wide' : isModern ? 'rounded-2xl uppercase font-space-grotesk' : 'rounded-xl font-plus-jakarta'
              }`}
            >
              Comprar ahora
            </button>

            <button
              onClick={handleAddToCart}
              className={`w-full h-12 bg-white text-[#0b1c30] rounded-xl font-semibold text-sm hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                isElegant ? 'border-[#E7E2D9] text-stone-800 rounded-2xl' : 'border-[#bccac0]'
              }`}
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
