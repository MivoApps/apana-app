'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShoppingBag,
  Search,
  Heart,
  MessageCircle,
  Check,
  Plus,
  PhoneCall,
  X,
  Sparkles,
  Truck,
  ArrowRight,
  MessageSquare,
  Crown,
  BadgeCheck,
  MapPin,
  Clock,
} from 'lucide-react';
import { InstagramIcon } from '@/components/ui/InstagramIcon';
import { useAppStore } from '@/lib/app-store';
import { useCartStore } from '@/lib/cart-store';
import { formatCurrency } from '@/lib/whatsapp';
import StoreNotFoundPage from '@/app/(public)/store-not-found/page';

import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';

interface Props {
  params: Promise<{
    storeSlug: string;
  }>;
}

import { getStoreBySlugFromFS, getProductsByStoreIdFromFS } from '@/lib/firebase/firestore';
import { Store, Product } from '@/types/store';

import { TermsModal } from '@/components/ui/TermsModal';
import { ProductOptionsModal } from '@/components/public/ProductOptionsModal';
import { SelectedOption } from '@/types/store';

export default function PublicStorePage({ params }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { stores, getStoreBySlug, getProductsByStoreId, createOrUpdateStore } = useAppStore();
  const { items, getTotalItems, getTotalPrice, addItem } = useCartStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [mounted, setMounted] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [selectedModalProduct, setSelectedModalProduct] = useState<Product | null>(null);

  // Estado Firestore híbrido
  const [fsStore, setFsStore] = useState<Store | null>(null);
  const [fsProducts, setFsProducts] = useState<Product[]>([]);
  const [isFetchingFS, setIsFetchingFS] = useState(true);

  // Modal de WhatsApp tras publicar 1er producto
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [phoneSavedSuccess, setPhoneSavedSuccess] = useState(false);

  // Desenvolver params de la ruta
  const resolvedParams = React.use(params);
  const targetSlug = resolvedParams.storeSlug;

  // 1. Obtener tienda local
  const localStore = getStoreBySlug(targetSlug);

  React.useEffect(() => {
    setMounted(true);

    // 1. Intentar cargar instantáneamente del caché de sesión si existía previamente (0 ms)
    const cachedPublicStore = sessionStorage.getItem(`apana_public_store_${targetSlug}`);
    const cachedPublicProds = sessionStorage.getItem(`apana_public_prods_${targetSlug}`);

    if (cachedPublicStore && cachedPublicProds) {
      try {
        setFsStore(JSON.parse(cachedPublicStore));
        setFsProducts(JSON.parse(cachedPublicProds));
        setIsFetchingFS(false);
      } catch (e) { }
    }

    // 2. Revalidar de Firestore silenciosamente en segundo plano
    const fetchFromFirestore = async () => {
      const fetchedStore = await getStoreBySlugFromFS(targetSlug);
      if (fetchedStore) {
        setFsStore(fetchedStore);
        sessionStorage.setItem(`apana_public_store_${targetSlug}`, JSON.stringify(fetchedStore));

        // Registrar visita única por sesión
        const sessionVisitKey = `apana_session_visited_${fetchedStore.id}`;
        if (!sessionStorage.getItem(sessionVisitKey) && (fetchedStore.plan === 'emprendedor' || fetchedStore.plan === 'negocio')) {
          sessionStorage.setItem(sessionVisitKey, 'true');
          const { recordAnalyticsEvent } = await import('@/lib/firebase/firestore');
          recordAnalyticsEvent(fetchedStore.id, 'visit');
        }

        const fetchedProducts = await getProductsByStoreIdFromFS(fetchedStore.id);
        setFsProducts(fetchedProducts);
        sessionStorage.setItem(`apana_public_prods_${targetSlug}`, JSON.stringify(fetchedProducts));
      } else {
        // Si la tienda fue borrada en Firestore, limpiar caché y forzar vista no encontrada
        setFsStore(null);
        setFsProducts([]);
        sessionStorage.removeItem(`apana_public_store_${targetSlug}`);
        sessionStorage.removeItem(`apana_public_prods_${targetSlug}`);
      }
      setIsFetchingFS(false);
    };

    fetchFromFirestore();
  }, [targetSlug]);

  const store = fsStore;

  React.useEffect(() => {
    // Si viene de publicar el primer producto y AÚN NO tiene un teléfono configurado
    const isFirstProduct = searchParams.get('firstProductCreated') === 'true';
    const currentPhone = store?.whatsappPhone || '';
    const hasPhoneAlready = currentPhone.trim() !== '';

    if (isFirstProduct && !hasPhoneAlready) {
      // Abrir el modal inmediatamente sin delay para capturar el WhatsApp
      setShowPhoneModal(true);
    }
  }, [searchParams, store]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 9);
    setWhatsappPhone(value);
  };

  const handleSaveModalPhone = async (e: React.FormEvent, storeName: string, themeStyle?: any, primaryColor?: string, description?: string) => {
    e.preventDefault();
    if (whatsappPhone.length < 9) return;

    const fullPhone = `51${whatsappPhone}`;

    // Guardar en Firestore
    if (store?.ownerId) {
      const { createOrUpdateStoreInFS } = await import('@/lib/firebase/firestore');
      await createOrUpdateStoreInFS(store.ownerId, {
        name: storeName,
        whatsappPhone: fullPhone,
        themeStyle: themeStyle || 'minimalista',
        primaryColor: primaryColor || '#059669',
      });
    }

    setPhoneSavedSuccess(true);
    setTimeout(() => {
      setShowPhoneModal(false);
      // Redirigir automáticamente al panel de administración /dashboard
      router.push('/dashboard');
    }, 1500);
  };

  // Evitar error de hidratación renderizando cuando se monte el cliente
  if (!mounted || isFetchingFS) {
    return <div className="min-h-screen bg-[#f8f9ff]" />;
  }

  // Validación: si la tienda no existe en el registro o su estado es 'eliminada'
  if (!store || (store.status !== 'activa' && store.status !== 'pausada')) {
    return <StoreNotFoundPage />;
  }

  // Productos pertenecientes a esta tienda
  const storeProducts = fsProducts;

  const totalCartCount = getTotalItems();

  const filteredProducts = storeProducts.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    const isEmprendedor = store?.plan === 'emprendedor';
    const matchesCategory =
      !isEmprendedor ||
      selectedCategory === 'todos' ||
      product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans relative pb-28">
      {/* Header Fijo con Nombre de Tienda y Carrito Stitch */}
      <header className="fixed top-0 w-full z-50 bg-[#f8f9ff]/80 backdrop-blur-xl border-b border-[#bccac0]/20">
        <div className="h-16 px-4 max-w-[640px] mx-auto flex items-center justify-between">
          <h1 className="font-bold text-lg text-[#0b1c30] truncate tracking-tight">
            {store.name}
          </h1>
          <div className="flex items-center gap-2">
            <Link href={`/s/${store.slug}/cart`}>
              <button aria-label="Ver Carrito" className="w-10 h-10 flex items-center justify-center rounded-full text-[#3d4a42] relative hover:bg-gray-100 transition-colors">
                <ShoppingBag size={22} />
                {totalCartCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#059669] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {totalCartCount}
                  </span>
                )}
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className={`pt-16 pb-24 min-h-screen transition-colors ${store.themeStyle === 'elegante'
          ? 'bg-[#FAF8F5] text-stone-900'
          : store.themeStyle === 'moderna'
            ? 'bg-slate-50 text-[#0b1c30]'
            : 'bg-white text-[#0b1c30]'
        }`}>
        {/* Banner Informativo si la Tienda está Pausada */}
        {store.status === 'pausada' && (
          <div className="bg-amber-500 text-white px-4 py-3 text-xs text-center flex items-center justify-center gap-2 shadow-xs font-semibold">
            <span>⏸️</span>
            <span>Esta tienda está en pausa temporalmente y no está recibiendo nuevos pedidos en este momento.</span>
          </div>
        )}

        {/* Banner Informativo de Tienda Demo */}
        {store.slug === 'panaderia-don-jose' && (
          <div className="bg-linear-to-r from-[#00855d] to-[#059669] text-white px-4 py-2.5 text-xs text-center flex flex-col sm:flex-row items-center justify-center gap-2 border-b border-emerald-700/30">
            <span className="font-bold flex items-center gap-1.5">
              ✨ Tienda Demo Oficial
            </span>
            <span className="text-emerald-100 hidden sm:inline">•</span>
            <span className="text-emerald-50">
              Así verán tus clientes tu catálogo y harán pedidos directos a tu WhatsApp.
            </span>
            <Link
              href="/login"
              className="font-bold underline text-white hover:text-emerald-200 ml-1 shrink-0"
            >
              Crear mi tienda gratis →
            </Link>
          </div>
        )}

        {/* Banner Informativo si la tienda no tiene WhatsApp validado */}
        {(!store.whatsappPhone || !store.isWhatsappVerified) && (
          <div className="w-full bg-amber-50/95 border-b border-amber-200/90 text-amber-950 px-4 py-2.5 text-center text-xs font-semibold flex items-center justify-center gap-2 sticky top-0 z-30 shadow-2xs backdrop-blur-xs">
            <span className="text-sm">🛠️</span>
            <span>Esta tienda está configurando sus canales de atención. Muy pronto disponible para pedidos por WhatsApp.</span>
          </div>
        )}

        <div className="flex flex-col w-full max-w-[640px] mx-auto">
          {/* Header Tienda Info Dinámico según Tema */}
          <div className={`px-4 py-6 flex flex-col items-center gap-2 text-center transition-all ${store.themeStyle === 'elegante'
              ? 'bg-[#FAF8F5] text-stone-900 py-8 border-b border-[#E7E2D9] mb-3'
              : store.themeStyle === 'moderna'
                ? 'bg-white text-[#0b1c30] border-b border-slate-200/80 shadow-2xs mb-2 py-7'
                : 'bg-white text-neutral-900 border-b border-neutral-100 py-6'
            }`}>
            {store.logoUrl ? (
              <div className={`w-20 h-20 overflow-hidden shadow-sm transition-all ${
                store.themeStyle === 'elegante'
                  ? 'rounded-2xl border border-stone-200/60'
                  : store.themeStyle === 'moderna'
                  ? 'rounded-3xl shadow-md'
                  : 'rounded-full w-16 h-16 shadow-xs'
              }`}>
                <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div
                style={{ backgroundColor: store.primaryColor || '#059669' }}
                className={`w-20 h-20 text-white flex items-center justify-center font-bold text-2xl shadow-sm transition-all ${
                  store.themeStyle === 'elegante'
                    ? 'rounded-2xl border border-stone-200/60 font-playfair'
                    : store.themeStyle === 'moderna'
                    ? 'rounded-3xl shadow-md'
                    : 'rounded-full w-16 h-16 shadow-xs'
                }`}
              >
                {store.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${store.themeStyle === 'elegante'
                  ? 'text-stone-900 font-playfair'
                  : store.themeStyle === 'moderna'
                    ? 'text-[#0b1c30] font-space-grotesk font-extrabold'
                    : 'text-neutral-900 font-plus-jakarta'
                }`}>
                {store.name}
              </h2>
              {store.plan === 'negocio' && (
                <div className="inline-flex items-center select-none" title="Negocio Oficial Verificado">
                  {store.themeStyle === 'elegante' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100/70 border border-amber-300 text-amber-900 font-bold text-[11px] shadow-2xs">
                      <BadgeCheck size={14} className="text-amber-700 fill-amber-300/60" />
                      <span>Verificada</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[11px] shadow-2xs">
                      <BadgeCheck size={14} className="text-[#059669] fill-emerald-100" />
                      <span>Verificada</span>
                    </span>
                  )}
                </div>
              )}
            </div>
            <p className={`text-xs max-w-sm mx-auto leading-relaxed ${store.themeStyle === 'elegante'
                ? 'text-stone-600 font-sans'
                : store.themeStyle === 'moderna'
                  ? 'text-slate-600 font-sans font-medium'
                  : 'text-neutral-500 font-plus-jakarta'
              }`}>
              {store.description}
            </p>

            {/* Píldoras de Información Comercial (Ubicación, Horario y Envíos) */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1">
              {/* Modalidad de Envíos */}
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold border ${store.themeStyle === 'elegante'
                  ? 'bg-white border-[#E7E2D9] text-stone-700 shadow-2xs'
                  : store.themeStyle === 'moderna'
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                    : 'bg-neutral-100/70 border-neutral-200/60 text-neutral-600'
                }`}>
                <Truck size={13} className={store.themeStyle === 'elegante' ? 'text-amber-700' : 'text-[#059669]'} />
                <span>
                  {store.shippingType === 'gratis'
                    ? 'Envío Gratis'
                    : 'Envíos: A coordinar por WhatsApp'}
                </span>
              </span>

              {/* Ubicación */}
              {store.city && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${store.themeStyle === 'elegante'
                    ? 'bg-white border-[#E7E2D9] text-stone-600 shadow-2xs'
                    : 'bg-slate-100 border-slate-200/80 text-slate-700'
                  }`}>
                  <MapPin size={12} className="text-slate-500" />
                  <span>{store.city}</span>
                </span>
              )}

              {/* Horario */}
              {store.schedule && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${store.themeStyle === 'elegante'
                    ? 'bg-white border-[#E7E2D9] text-stone-600 shadow-2xs'
                    : 'bg-slate-100 border-slate-200/80 text-slate-700'
                  }`}>
                  <Clock size={12} className="text-slate-500" />
                  <span>{store.schedule}</span>
                </span>
              )}
            </div>

            {/* Enlaces de Redes Sociales (Instagram / TikTok) */}
            {(store.socialLinks?.instagram || store.socialLinks?.tiktok) && (
              <div className="flex items-center gap-2 mt-1">
                {store.socialLinks?.instagram && (
                  <a
                    href={
                      store.socialLinks.instagram.startsWith('http')
                        ? store.socialLinks.instagram
                        : `https://instagram.com/${store.socialLinks.instagram.replace('@', '')}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-pink-50 border border-pink-200 text-pink-700 hover:bg-pink-100 transition-colors shadow-2xs"
                  >
                    <InstagramIcon size={12} />
                    <span>Instagram</span>
                  </a>
                )}
                {store.socialLinks?.tiktok && (
                  <a
                    href={
                      store.socialLinks.tiktok.startsWith('http')
                        ? store.socialLinks.tiktok
                        : `https://tiktok.com/@${store.socialLinks.tiktok.replace('@', '')}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 border border-slate-300 text-slate-800 hover:bg-slate-200 transition-colors shadow-2xs"
                  >
                    <span className="text-[10px]">🎵</span>
                    <span>TikTok</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Buscador de Productos Stitch */}
          <div className="px-4 mb-4 mt-2 w-full max-w-md mx-auto relative">
            <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-[#6d7a72]" size={18} />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#bccac0]/40 rounded-full py-3 pl-10 pr-4 text-sm text-[#0b1c30] focus:outline-none focus:ring-2 transition-all shadow-xs"
              style={{ borderColor: store.primaryColor ? `${store.primaryColor}60` : undefined }}
            />
          </div>

          {/* Barra Horizontal de Categorías (Plan Emprendedor y Negocio) */}
          {(store.plan === 'emprendedor' || store.plan === 'negocio') && store.categories && store.categories.length > 0 && (
            <div className="w-full max-w-md mx-auto px-4 mb-4">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin snap-x snap-mandatory">
                {/* Chip 'Todos' */}
                <button
                  type="button"
                  onClick={() => setSelectedCategory('todos')}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 snap-start ${selectedCategory === 'todos'
                      ? 'text-white'
                      : 'bg-white text-[#3d4a42] border border-[#bccac0]/30 hover:bg-slate-50'
                    }`}
                  style={
                    selectedCategory === 'todos'
                      ? { backgroundColor: store.primaryColor || '#059669' }
                      : undefined
                  }
                >
                  Todos
                </button>
                {/* Chips de categorías del comercio */}
                {store.categories.map((cat, idx) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 snap-start ${isSelected
                          ? 'text-white'
                          : 'bg-white text-[#3d4a42] border border-[#bccac0]/30 hover:bg-slate-50'
                        }`}
                      style={
                        isSelected
                          ? { backgroundColor: store.primaryColor || '#059669' }
                          : undefined
                      }
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Grid de Productos Dinámico según Tema */}
          <div className={`grid gap-3.5 px-4 mb-8 ${store.themeStyle === 'moderna' ? 'grid-cols-1' : 'grid-cols-2'
            }`}>
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-12 text-center text-[#6d7a72] text-sm">
                Esta tienda aún no tiene productos publicados.
              </div>
            ) : (
              filteredProducts.map((product, pIndex) => {
                const isOutOfStock = product.inStock === false;
                const isNewProduct = !isOutOfStock && pIndex === 0;

                // MODERNA (Horizontal Cards, High Contrast)
                if (store.themeStyle === 'moderna') {
                  return (
                    <article
                      key={product.id}
                      className={`bg-white rounded-2xl border border-slate-200/80 overflow-hidden flex flex-row items-center p-2.5 group cursor-pointer shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative ${isOutOfStock ? 'opacity-70 bg-slate-50' : ''
                        }`}
                    >
                      <Link href={`/s/${store.slug}/p/${product.id}`} className="flex w-full flex-row items-center gap-3.5">
                        <div className="w-24 h-24 rounded-2xl shrink-0 overflow-hidden bg-slate-100 relative">
                          <img
                            src={product.imageUrl || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80'}
                            alt={product.title}
                            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? 'grayscale contrast-75' : ''
                              }`}
                          />
                          {isNewProduct && (
                            <span className="absolute top-1.5 left-1.5 bg-[#059669] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                              ✨ Nuevo
                            </span>
                          )}
                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                              <span className="bg-white/95 text-[#0b1c30] text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider shadow-xs">
                                Agotado
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col gap-1 text-left justify-center py-1">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-space-grotesk font-bold text-sm text-[#0b1c30] uppercase tracking-wider line-clamp-1 group-hover:text-emerald-700 transition-colors ${isOutOfStock ? 'text-slate-500' : ''
                              }`}>
                              {product.title}
                            </h3>
                            {isOutOfStock && (
                              <span className="text-[9px] font-bold text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded">
                                Agotado
                              </span>
                            )}
                          </div>
                          {product.description && (
                            <p className="text-xs text-slate-500 line-clamp-1 font-sans">
                              {product.description}
                            </p>
                          )}
                          <span
                            className={`font-space-grotesk font-extrabold text-base mt-0.5 ${isOutOfStock ? 'text-slate-400' : ''
                              }`}
                            style={!isOutOfStock ? { color: store.primaryColor || '#059669' } : undefined}
                          >
                            {formatCurrency(product.price)}
                          </span>
                        </div>
                      </Link>
                    </article>
                  );
                }

                // ELEGANTE (Warm Cream Cards, Serif Headlines, Italic Prices)
                if (store.themeStyle === 'elegante') {
                  return (
                    <article
                      key={product.id}
                      className={`bg-white rounded-2xl border border-[#e8dfd5] overflow-hidden flex flex-col group cursor-pointer shadow-2xs hover:shadow-md hover:border-amber-400/50 transition-all duration-300 relative ${isOutOfStock ? 'opacity-70 bg-[#f4f1ea]' : ''
                        }`}
                    >
                      <Link href={`/s/${store.slug}/p/${product.id}`} className="flex w-full flex-col">
                        <div className="aspect-square relative overflow-hidden bg-[#FAF9F6]">
                          <img
                            src={product.imageUrl || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80'}
                            alt={product.title}
                            className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${isOutOfStock ? 'grayscale contrast-75' : ''
                              }`}
                          />
                          {isNewProduct && (
                            <span className="absolute top-2 left-2 bg-[#059669] text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-xs z-10">
                              ✨ Nuevo
                            </span>
                          )}
                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-10">
                              <span className="bg-white/95 text-stone-900 font-playfair text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider shadow-sm">
                                Agotado
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-3.5 flex flex-col gap-1 text-center">
                          <h3 className={`font-playfair font-bold text-sm text-[#1a1a1a] line-clamp-1 group-hover:text-amber-900 transition-colors ${isOutOfStock ? 'text-stone-500' : ''
                            }`}>
                            {product.title}
                          </h3>
                          <span
                            className={`font-playfair italic font-bold text-sm tracking-wide mt-0.5 ${isOutOfStock ? 'text-stone-400' : ''
                              }`}
                            style={!isOutOfStock ? { color: store.primaryColor || '#059669' } : undefined}
                          >
                            {formatCurrency(product.price)}
                          </span>
                        </div>
                      </Link>
                    </article>
                  );
                }

                // MINIMALISTA (Editorial Lookbook, Clean Photos without Box Borders, Left-aligned Typography)
                return (
                  <article
                    key={product.id}
                    className="flex flex-col group cursor-pointer relative"
                  >
                    <Link href={`/s/${store.slug}/p/${product.id}`} className="flex w-full flex-col gap-2">
                      <div className="aspect-square relative overflow-hidden rounded-2xl bg-neutral-100/90">
                        <img
                          src={product.imageUrl || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80'}
                          alt={product.title}
                          className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${isOutOfStock ? 'grayscale contrast-75' : ''
                            }`}
                        />
                        {isNewProduct && (
                          <span className="absolute top-2 left-2 bg-neutral-900/80 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-2xs z-10">
                            Nuevo
                          </span>
                        )}
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px] flex items-center justify-center z-10">
                            <span className="bg-white/95 text-neutral-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider shadow-xs">
                              Agotado
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5 text-left px-0.5">
                        <h3 className={`font-plus-jakarta font-semibold text-xs text-neutral-800 line-clamp-1 group-hover:text-black transition-colors ${isOutOfStock ? 'text-neutral-400' : ''
                          }`}>
                          {product.title}
                        </h3>
                        <span
                          className={`font-plus-jakarta font-bold text-xs ${isOutOfStock ? 'text-neutral-400' : 'text-neutral-900'
                            }`}
                        >
                          {formatCurrency(product.price)}
                        </span>
                      </div>
                    </Link>
                  </article>
                );
              })
            )}
          </div>

          {/* Footer Tienda Pública Stitch */}
          <footer className="py-8 px-4 text-center bg-white border-t border-[#bccac0]/20 flex flex-col items-center gap-3">
            {(!store.plan || store.plan === 'gratis') && (
              <Link
                href="/"
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#059669]/10 text-[#006c49] text-[11px] font-bold rounded-full hover:bg-[#059669]/20 transition-all border border-[#059669]/15 shadow-2xs"
              >
                <span>⚡ Creado con APANA</span>
                <span className="text-[#6d7a72]/50 font-normal">|</span>
                <span>Obtén tu tienda gratis</span>
              </Link>
            )}
            <p className="text-xs text-[#6d7a72]">
              © {new Date().getFullYear()} {store.name}. Todos los derechos reservados.
            </p>
          </footer>
        </div>
      </main>

      {/* 🛍️ BARRA FLOTANTE DE PEDIDO EN CURSO (Aparece cuando hay items en el carrito) */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-20 left-4 right-4 z-40 max-w-[608px] mx-auto animate-in slide-in-from-bottom-5 duration-300">
          <Link
            href={`/s/${store.slug}/cart`}
            className="w-full bg-[#0b1c30] text-white p-3.5 px-5 rounded-2xl shadow-xl flex items-center justify-between border border-white/10 hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white"
                style={{ backgroundColor: store.primaryColor || '#059669' }}
              >
                {totalCartCount}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs text-slate-300">Pedido en curso</span>
                <span className="text-sm font-bold">{formatCurrency(getTotalPrice())}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
              <span>Ver mi pedido</span>
              <ArrowRight size={16} />
            </div>
          </Link>
        </div>
      )}

      {/* 💬 BOTÓN FLOTANTE RÁPIDO DE WHATSAPP (Corner FAB) */}
      {store.whatsappPhone && (
        <a
          href={`https://wa.me/${store.whatsappPhone}?text=${encodeURIComponent(`¡Hola! Tengo una consulta sobre los productos de ${store.name}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={async () => {
            if (store.plan === 'emprendedor') {
              try {
                const { recordAnalyticsEvent } = await import('@/lib/firebase/firestore');
                await recordAnalyticsEvent(store.id, 'click');
              } catch (err) { }
            }
          }}
          className="fixed bottom-20 right-4 z-30 w-12 h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all animate-in zoom-in-75 duration-300"
          style={totalCartCount > 0 ? { bottom: '5.5rem' } : { bottom: '5rem' }}
          title="Hacer una consulta por WhatsApp"
        >
          <WhatsAppIcon size={26} />
        </a>
      )}

      {/* Floating Bottom Navigation Stitch */}
      <nav className="fixed bottom-0 w-full z-50 bg-[#f8f9ff]/90 backdrop-blur-xl border-t border-[#bccac0]/30 shadow-[0_-1px_8px_rgba(0,0,0,0.04)]">
        <div className="flex justify-around items-center h-16 px-4 max-w-[640px] mx-auto">
          <Link
            href={`/s/${store.slug}`}
            className="flex flex-col items-center gap-1 font-semibold"
            style={{ color: store.primaryColor || '#059669' }}
          >
            <ShoppingBag size={20} />
            <span className="text-[11px]">Tienda</span>
          </Link>
          <Link
            href={`/s/${store.slug}/cart`}
            className="flex flex-col items-center gap-1 text-[#6d7a72] hover:text-[#0b1c30]"
          >
            <div className="relative">
              <ShoppingBag size={20} />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 text-white text-[9px] rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: store.primaryColor || '#059669' }}>
                  {totalCartCount}
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium">Mis Pedidos</span>
          </Link>
        </div>
      </nav>

      {/* Modal Automático de Vincular WhatsApp */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-50 bg-[#0b1c30]/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300 pointer-events-auto">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-5 relative border border-[#bccac0]/30 animate-in zoom-in-95 duration-300">
            {/* Header Modal */}
            <div className="flex flex-col items-center text-center gap-2 pt-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center shadow-xs">
                <WhatsAppIcon size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#0b1c30]">
                ¡Recibe tus pedidos por WhatsApp!
              </h3>
              <p className="text-xs text-[#6d7a72] leading-relaxed">
                Ingresa tu número de WhatsApp para que tus clientes puedan enviarte sus compras directamente.
              </p>
            </div>

            {/* Form Input WhatsApp */}
            <form onSubmit={(e) => handleSaveModalPhone(e, store.name, store.themeStyle, store.primaryColor, store.description)} className="flex flex-col gap-4">
              {(() => {
                const hasStartedTyping = whatsappPhone.length > 0;
                const isInvalidStart = hasStartedTyping && !whatsappPhone.startsWith('9');
                const isCompleteValid = whatsappPhone.length === 9 && whatsappPhone.startsWith('9');

                return (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[#0b1c30] ml-1">
                        Número de Celular
                      </label>
                      <div className={`relative flex items-center bg-white border rounded-xl overflow-hidden shadow-xs transition-all ${isInvalidStart
                          ? 'border-red-500 ring-2 ring-red-500/10'
                          : 'border-[#bccac0] focus-within:border-[#059669] focus-within:ring-2 focus-within:ring-[#059669]/10'
                        }`}>
                        <div className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 border-r border-gray-200 select-none shrink-0">
                          <span className="text-base leading-none" role="img" aria-label="Bandera de Perú">🇵🇪</span>
                          <span className="text-xs font-bold text-[#0b1c30]">+51</span>
                        </div>
                        <input
                          type="tel"
                          required
                          maxLength={9}
                          placeholder="987654321"
                          value={whatsappPhone}
                          onChange={handlePhoneChange}
                          className="h-11 w-full bg-transparent px-3 text-sm font-medium text-[#0b1c30] placeholder:text-[#6d7a72]/40 focus:outline-none tracking-wide"
                        />
                      </div>

                      {/* Mensaje de Error Informativo */}
                      {isInvalidStart ? (
                        <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1 mt-0.5 ml-1 animate-in fade-in">
                          <span>⚠️ El número celular debe comenzar obligatoriamente con 9.</span>
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-400 ml-1">
                          Ingresa los 9 dígitos de tu número de WhatsApp.
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={!isCompleteValid}
                      className="h-12 w-full bg-[#059669] hover:bg-[#00855d] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      {phoneSavedSuccess ? <Check size={20} /> : <WhatsAppIcon size={20} />}
                      {phoneSavedSuccess ? '¡WhatsApp Conectado!' : 'Guardar y Vincular WhatsApp'}
                    </button>
                  </>
                );
              })()}

              <p className="text-[10px] text-slate-400 text-center leading-tight">
                Al vincular tu número, declaras bajo juramento ser el titular de la línea y aceptas los{' '}
                <button
                  type="button"
                  onClick={() => setIsTermsOpen(true)}
                  className="text-[#059669] underline font-medium hover:text-[#006c49]"
                >
                  Términos y Condiciones
                </button>
                .
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Términos y Condiciones */}
      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />

      {/* Modal / Bottom Sheet de Selección de Variantes */}
      <ProductOptionsModal
        product={selectedModalProduct}
        isOpen={!!selectedModalProduct}
        onClose={() => setSelectedModalProduct(null)}
        onAddToCart={(prod, opts) => addItem(prod, opts)}
        primaryColor={store.primaryColor}
        themeStyle={store.themeStyle}
      />
    </div>
  );
}
