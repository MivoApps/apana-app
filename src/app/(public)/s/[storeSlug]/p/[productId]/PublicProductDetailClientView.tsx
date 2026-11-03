'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ShoppingBag, 
  ShoppingCart, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Share2,
  ShieldCheck 
} from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { formatCurrency } from '@/lib/whatsapp';
import { getStoreBySlugFromFS, getProductsByStoreIdFromFS, getProductByIdFromFS } from '@/lib/firebase/firestore';
import { Store, Product, ProductOptionGroup, SelectedOption, ProductOptionValue } from '@/types/store';
import { ProductDetailSkeleton } from '@/components/public/StoreSkeletons';

interface ClientProps {
  storeSlug: string;
  productId: string;
  initialStore?: Store | null;
  initialProducts?: Product[];
  initialProduct?: Product | null;
}

export default function PublicProductDetailClientView({
  storeSlug,
  productId,
  initialStore,
  initialProducts = [],
  initialProduct,
}: ClientProps) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const cartItemCount = useCartStore((s) => s.items.reduce((total, item) => total + item.quantity, 0));
  const cartTotalPrice = useCartStore((s) => s.getTotalPrice());
  const [added, setAdded] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Inicializar opciones pre-seleccionadas inmediatamente si vienen del servidor
  const [selectedValues, setSelectedValues] = useState<{ [groupId: string]: string }>(() => {
    if (initialProduct?.options && initialProduct.options.length > 0) {
      const initialMap: { [groupId: string]: string } = {};
      initialProduct.options.forEach((group) => {
        if (group.values.length > 0) {
          initialMap[group.id] = group.values[0].id;
        }
      });
      return initialMap;
    }
    return {};
  });

  const [fsStore, setFsStore] = useState<Store | null>(initialStore || null);
  const [fsProducts, setFsProducts] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(!initialStore || (!initialProduct && initialProducts.length === 0));

  const activeStore = fsStore;
  const allProducts = fsProducts;
  const targetProduct = allProducts.find((p) => p.id === productId) || initialProduct;

  const handleShareProduct = () => {
    if (typeof window === 'undefined') return;
    if (navigator.share) {
      navigator.share({
        title: targetProduct?.title || 'Producto',
        text: `Mira este producto en ${activeStore?.name || 'la tienda'}: ${targetProduct?.title}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  React.useEffect(() => {
    // 1. Carga instantánea de sesión si el usuario navega desde la tienda
    if (typeof window !== 'undefined') {
      const cachedPublicStore = sessionStorage.getItem(`apana_public_store_${storeSlug}`);
      const cachedPublicProds = sessionStorage.getItem(`apana_public_prods_${storeSlug}`);

      if (cachedPublicStore && cachedPublicProds) {
        try {
          const parsedStore = JSON.parse(cachedPublicStore);
          const parsedProds: Product[] = JSON.parse(cachedPublicProds);
          if (!fsStore) setFsStore(parsedStore);
          if (fsProducts.length === 0) setFsProducts(parsedProds);
        } catch (e) { }
      }
    }

    const fetchFS = async () => {
      // Si ya vino pre-renderizado del servidor, solo registrar analítica de fondo
      if (initialStore && targetProduct) {
        setIsLoading(false);
        const sessionViewKey = `apana_prod_viewed_${productId}`;
        if (typeof window !== 'undefined' && !sessionStorage.getItem(sessionViewKey) && (initialStore.plan === 'emprendedor' || initialStore.plan === 'negocio')) {
          sessionStorage.setItem(sessionViewKey, 'true');
          try {
            const { increment } = await import('firebase/firestore');
            const { updateProductInFS, recordAnalyticsEvent } = await import('@/lib/firebase/firestore');
            await updateProductInFS(initialStore.id, productId, {
              views: increment(1) as any,
            });
            recordAnalyticsEvent(initialStore.id, 'product_view');
          } catch (err) {
            console.error('Error incrementing product views:', err);
          }
        }
        return;
      }

      // Fallback en caso de que no haya venido del servidor
      const fetchedStore = await getStoreBySlugFromFS(storeSlug);
      if (fetchedStore) {
        setFsStore(fetchedStore);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(`apana_public_store_${storeSlug}`, JSON.stringify(fetchedStore));
        }
        const prods = await getProductsByStoreIdFromFS(fetchedStore.id);
        
        let currentProd = prods.find((p) => p.id === productId);
        if (!currentProd) {
          const directProd = await getProductByIdFromFS(fetchedStore.id, productId);
          if (directProd) {
            prods.push(directProd);
            currentProd = directProd;
          }
        }
        
        setFsProducts(prods);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(`apana_public_prods_${storeSlug}`, JSON.stringify(prods));
        }

        if (currentProd && currentProd.options && currentProd.options.length > 0) {
          setSelectedValues((prev) => {
            if (Object.keys(prev).length > 0) return prev;
            const initialMap: { [groupId: string]: string } = {};
            currentProd.options?.forEach((group) => {
              if (group.values.length > 0) {
                initialMap[group.id] = group.values[0].id;
              }
            });
            return initialMap;
          });
        }

        const sessionViewKey = `apana_prod_viewed_${productId}`;
        if (typeof window !== 'undefined' && !sessionStorage.getItem(sessionViewKey) && (fetchedStore.plan === 'emprendedor' || fetchedStore.plan === 'negocio')) {
          sessionStorage.setItem(sessionViewKey, 'true');
          try {
            const { increment } = await import('firebase/firestore');
            const { updateProductInFS, recordAnalyticsEvent } = await import('@/lib/firebase/firestore');
            await updateProductInFS(fetchedStore.id, productId, {
              views: increment(1) as any,
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
  }, [storeSlug, productId, initialStore, targetProduct, fsStore, fsProducts.length]);

  const isPaidStore = activeStore?.plan === 'emprendedor' || activeStore?.plan === 'negocio';
  const isProStore = activeStore?.plan === 'negocio';
  const maxImagesAllowed = isProStore ? 8 : isPaidStore ? 4 : 1;

  const DEFAULT_PRODUCT_IMG = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80';

  const validImgs = (targetProduct?.imageUrls || []).filter((u): u is string => Boolean(u && !u.startsWith('blob:')));
  const rawImages: string[] = validImgs.length > 0
    ? validImgs
    : [
        (targetProduct?.imageUrl && !targetProduct.imageUrl.startsWith('blob:'))
          ? targetProduct.imageUrl
          : DEFAULT_PRODUCT_IMG
      ];

  const productImages: string[] = rawImages.slice(0, maxImagesAllowed);

  const options: ProductOptionGroup[] = targetProduct?.options || [];
  const selectedOptionsList: SelectedOption[] = options.map((group: ProductOptionGroup) => {
    const selectedValId = selectedValues[group.id];
    const valObj = group.values.find((v: ProductOptionValue) => v.id === selectedValId) || group.values[0];
    return {
      groupTitle: group.title,
      valueName: valObj?.name || '',
      priceDifference: isPaidStore ? (valObj?.priceDifference || 0) : 0,
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
      setActiveImageIndex((prev) => (prev + 1) % productImages.length);
    } else if (distance < -minSwipeDistance && productImages.length > 1) {
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

  if (isLoading && !targetProduct) {
    return <ProductDetailSkeleton />;
  }

  if (!targetProduct) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 bg-emerald-50 text-[#059669] rounded-full flex items-center justify-center mb-4 shadow-2xs">
          <ShoppingBag size={28} />
        </div>
        <h2 className="text-xl font-bold text-[#0b1c30] mb-2 tracking-tight">Producto no disponible</h2>
        <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
          Este producto ya no se encuentra disponible en el catálogo de la tienda o el enlace ha cambiado.
        </p>
        <Link
          href={`/s/${storeSlug}`}
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#059669] text-white font-semibold text-sm hover:bg-[#047857] transition-all shadow-md shadow-emerald-700/20"
        >
          Explorar tienda completa →
        </Link>
      </div>
    );
  }

  const sameCategoryProducts = targetProduct.category
    ? allProducts.filter((p) => p.id !== targetProduct.id && p.category && p.category === targetProduct.category)
    : [];
  const otherCategoryProducts = allProducts.filter(
    (p) => p.id !== targetProduct.id && (!targetProduct.category || p.category !== targetProduct.category)
  );
  const relatedProducts = [...sameCategoryProducts, ...otherCategoryProducts].slice(0, 4);

  const isElegant = activeStore?.themeStyle === 'elegante';
  const isModern = activeStore?.themeStyle === 'moderna';
  const brandColor = activeStore?.primaryColor || '#059669';

  const renderActionButtons = () => {
    if (targetProduct.inStock === false) {
      return (
        <div className="w-full h-12 bg-slate-100 text-slate-500 rounded-xl font-bold text-sm flex items-center justify-center border border-slate-200 cursor-not-allowed">
          🚫 Producto Agotado Temporalmente
        </div>
      );
    }

    if (activeStore?.status === 'pausada') {
      return (
        <div className="flex flex-col gap-2">
          <div className="w-full h-12 bg-amber-100 text-amber-900 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center border border-amber-200 cursor-not-allowed">
            ⏸️ Tienda en Pausa Temporal
          </div>
          <p className="text-[11px] text-amber-800 text-center leading-tight">
            Esta tienda no está recibiendo nuevos pedidos en este momento.
          </p>
        </div>
      );
    }

    if (activeStore?.slug !== 'panaderia-don-jose' && (!activeStore?.whatsappPhone || !activeStore?.isWhatsappVerified)) {
      return (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled
            className="w-full h-12 bg-slate-200 text-slate-500 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 cursor-not-allowed shadow-none select-none"
          >
            <span>⏳ Pedidos no disponibles temporalmente</span>
          </button>
          <p className="text-[11px] text-amber-950 bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 text-center leading-tight">
            Esta tienda se está terminando de configurar. Vuelve pronto para realizar tu compra.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2.5 w-full">
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
      </div>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans relative pb-32 md:pb-16 transition-colors ${
      isElegant
        ? 'bg-[#FAF8F5] text-stone-900'
        : isModern
        ? 'bg-slate-50 text-[#0b1c30]'
        : 'bg-white text-neutral-900'
    }`}>
      {/* Header Fijo con logo, back, share y carrito */}
      <header className={`fixed top-0 w-full z-50 backdrop-blur-xl border-b transition-colors ${
        isElegant
          ? 'bg-[#FAF8F5]/90 border-[#E7E2D9]'
          : isModern
          ? 'bg-white/90 border-slate-200/80 shadow-2xs'
          : 'bg-white/90 border-neutral-100'
      }`}>
        <div className="h-16 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            className={`h-10 px-2 sm:px-3 flex items-center gap-1.5 rounded-full transition-colors cursor-pointer ${
              isElegant ? 'text-stone-800 hover:bg-stone-200/50' : 'text-[#0b1c30] hover:bg-gray-100'
            }`}
            title="Volver"
          >
            <ArrowLeft size={19} />
            <span className="text-xs font-bold hidden sm:inline">Volver</span>
          </button>

          <Link
            href={`/s/${storeSlug}`}
            className="flex items-center gap-2.5 group"
            title="Ir a la tienda"
          >
            <div
              className={`w-9 h-9 flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 active:scale-95 transition-all overflow-hidden ${
                isElegant ? 'rounded-xl border border-stone-200/60 font-playfair' : isModern ? 'rounded-2xl' : 'rounded-full'
              }`}
              style={!activeStore?.logoUrl ? { backgroundColor: brandColor } : undefined}
            >
              {activeStore?.logoUrl ? (
                <img src={activeStore.logoUrl} alt={activeStore.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white">
                  {activeStore ? activeStore.name.substring(0, 2).toUpperCase() : 'AP'}
                </span>
              )}
            </div>
            <span className={`font-bold text-sm hidden md:inline truncate max-w-[220px] ${
              isElegant ? 'font-playfair text-stone-900' : isModern ? 'font-space-grotesk text-[#0b1c30]' : 'text-neutral-900'
            }`}>
              {activeStore?.name}
            </span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={handleShareProduct}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                isElegant ? 'text-stone-800 hover:bg-stone-200/50' : 'text-[#0b1c30] hover:bg-gray-100'
              }`}
              title="Compartir producto"
            >
              {copiedShare ? <Check size={18} className="text-[#059669]" /> : <Share2 size={18} />}
            </button>

            <Link
              href={`/s/${storeSlug}/cart`}
              className={`group flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-sm active:scale-95 ${
                cartItemCount > 0
                  ? isElegant
                    ? 'bg-[#FAF8F5] border-[#d6c4b2] text-stone-900 hover:border-amber-700/60'
                    : 'bg-white border-emerald-300 text-[#0b1c30] hover:border-emerald-500'
                  : isElegant
                  ? 'bg-white/80 border-[#E7E2D9] text-stone-700 hover:bg-white hover:border-stone-400'
                  : 'bg-white/90 border-[#bccac0]/40 text-[#3d4a42] hover:bg-white hover:border-slate-400'
              }`}
              title="Ver carrito de compras"
            >
              <ShoppingCart
                size={18}
                className={`transition-transform group-hover:scale-110 shrink-0 ${
                  cartItemCount > 0
                    ? isElegant
                      ? 'text-amber-800'
                      : 'text-emerald-700'
                    : 'text-slate-600'
                }`}
              />
              <span className="text-xs font-bold hidden sm:inline">Carrito</span>
              {cartItemCount > 0 ? (
                <>
                  <span
                    className="px-1.5 py-0.5 rounded-full text-[10px] font-black text-white min-w-4 text-center shadow-2xs"
                    style={{ backgroundColor: brandColor }}
                  >
                    {cartItemCount}
                  </span>
                  <span className="text-xs font-extrabold hidden md:inline border-l border-slate-200/80 pl-2 text-slate-800">
                    {formatCurrency(cartTotalPrice)}
                  </span>
                </>
              ) : (
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                  0
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-16">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Columna Izquierda: Galería de Imágenes */}
            <div className="md:col-span-6 lg:col-span-7 flex flex-col gap-3">
              <div className={`flex flex-col w-full md:rounded-3xl overflow-hidden border ${
                isElegant ? 'bg-[#FAF8F5] border-[#E7E2D9]' : isModern ? 'bg-slate-100 border-slate-200' : 'bg-white border-neutral-100 md:border-slate-200/80 md:shadow-2xs'
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
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_PRODUCT_IMG;
                    }}
                  />

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

                      <span className="absolute bottom-3 right-3 bg-black/65 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-xs shadow-xs">
                        {activeImageIndex + 1} / {productImages.length}
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              {productImages.length > 1 && (
                <div className="flex gap-2.5 pt-2 overflow-x-auto justify-start md:justify-center">
                  {productImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        activeImageIndex === idx
                          ? isElegant ? 'border-amber-700 scale-105 shadow-2xs' : 'border-[#059669] scale-105 shadow-2xs'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Miniatura ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_PRODUCT_IMG;
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Columna Derecha: Detalles del Producto y Botones Sticky en Desktop */}
            <div className="md:col-span-6 lg:col-span-5 flex flex-col gap-5 md:sticky md:top-24 md:bg-white md:p-6 lg:p-7 md:rounded-3xl md:border md:border-slate-200/80 md:shadow-xs">
              <div className="flex flex-col gap-2">
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
                  {isPaidStore && targetProduct.badge && targetProduct.inStock !== false && (
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-[#059669] text-white px-2.5 py-0.5 rounded-md shadow-2xs">
                      {targetProduct.badge === 'top'
                        ? '🔥 Top Ventas'
                        : targetProduct.badge === 'oferta'
                        ? '🏷️ Oferta'
                        : '✨ Nuevo'}
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

                {/* Precios con Descuento */}
                {(() => {
                  const hasDiscount = Boolean(isPaidStore && targetProduct.compareAtPrice && targetProduct.compareAtPrice > targetProduct.price);
                  const discountPct = hasDiscount
                    ? Math.round(((targetProduct.compareAtPrice! - targetProduct.price) / targetProduct.compareAtPrice!) * 100)
                    : 0;

                  return (
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className={`text-2xl sm:text-3xl font-bold block ${
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

                      {hasDiscount && (
                        <span className="text-base sm:text-lg text-slate-400 line-through font-medium">
                          {formatCurrency(targetProduct.compareAtPrice!)}
                        </span>
                      )}

                      {hasDiscount && discountPct > 0 && (
                        <span className="bg-red-600 text-white text-xs font-black px-2.5 py-0.5 rounded-full shadow-2xs">
                          -{discountPct}% OFF
                        </span>
                      )}
                    </div>
                  );
                })()}
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
                            {(() => {
                              const selectedVal = group.values.find((v: ProductOptionValue) => v.id === currentSelectedValId);
                              if (!selectedVal) return '';
                              const cleanName = (!selectedVal.priceDifference || selectedVal.priceDifference === 0)
                                ? selectedVal.name.replace(/\s+0+(\.0+)?$/, '').trim()
                                : selectedVal.name;
                              return cleanName;
                            })()}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {group.values.map((val: ProductOptionValue) => {
                            const isSelected = currentSelectedValId === val.id;
                            const hasDiff = val.priceDifference && val.priceDifference > 0;
                            const cleanValName = (!val.priceDifference || val.priceDifference === 0)
                              ? val.name.replace(/\s+0+(\.0+)?$/, '').trim()
                              : val.name;

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
                                    alt={cleanValName}
                                    className="w-4 h-4 rounded-md object-cover border border-black/10 shrink-0"
                                  />
                                )}
                                <span>{cleanValName}</span>
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

              {/* Descripción del Producto */}
              {targetProduct.description && (
                <div className="pt-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Descripción
                  </h4>
                  <p className={`text-sm leading-relaxed whitespace-pre-line ${
                    isElegant ? 'text-stone-600 font-sans' : isModern ? 'text-slate-600 font-sans' : 'text-neutral-600 font-plus-jakarta'
                  }`}>
                    {targetProduct.description}
                  </p>
                </div>
              )}

              {/* Acciones de Compra en Desktop (Integradas en la columna derecha) */}
              <div className="hidden md:flex flex-col gap-3 pt-4 border-t border-slate-100">
                {renderActionButtons()}
                <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-slate-500">
                  <ShieldCheck size={14} className="text-[#059669]" />
                  <span>Atención y coordinación directa por WhatsApp</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de Productos Relacionados */}
          {relatedProducts.length > 0 && (
            <div className={`mt-14 pt-8 border-t ${
              isElegant ? 'border-[#E7E2D9]' : 'border-gray-200/80'
            }`}>
              <h3 className={`text-xl font-bold mb-6 ${
                isElegant ? 'font-playfair text-stone-900' : isModern ? 'font-space-grotesk text-[#0b1c30]' : 'text-neutral-900'
              }`}>
                También te podría gustar
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                {relatedProducts.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/s/${storeSlug}/p/${rel.id}`}
                    className="flex flex-col gap-2 group"
                  >
                    <div className={`aspect-square rounded-2xl overflow-hidden relative ${
                      isElegant ? 'bg-[#FAF8F5] border border-[#E7E2D9]' : 'bg-gray-50 border border-slate-100 shadow-2xs'
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

      {/* Fixed Bottom Actions (Solo para Móvil < md) */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 w-full backdrop-blur-xl border-t p-4 pb-safe flex flex-col gap-2.5 z-50 ${
        isElegant ? 'bg-[#FAF8F5]/95 border-[#E7E2D9]' : 'bg-white/95 border-[#bccac0]/30'
      }`}>
        {renderActionButtons()}
      </div>
    </div>
  );
}
