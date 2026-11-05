'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShoppingBag,
  Search,
  Check,
  Truck,
  ArrowRight,
  MapPin,
  Clock,
  Flag,
  Share2,
  BookOpen,
  FileText,
  Store as StoreIcon,
  ShieldCheck,
  X,
  Plus,
  Award,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { InstagramIcon } from '@/components/ui/InstagramIcon';
import { useAppStore } from '@/lib/app-store';
import { useCartStore } from '@/lib/cart-store';
import { formatCurrency } from '@/lib/whatsapp';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { Store, Product } from '@/types/store';
import { TermsModal } from '@/components/ui/TermsModal';
import { StorePoliciesModal } from '@/components/ui/StorePoliciesModal';
import { ReportStoreModal } from '@/components/ui/ReportStoreModal';
import { ProductOptionsModal } from '@/components/public/ProductOptionsModal';
import {
  getContrastTextColor,
  normalizeStoreStyle,
  VISUAL_MOODS,
  FONT_PAIRINGS,
} from '@/lib/design-system';

interface PublicStoreClientViewProps {
  initialStore: Store;
  initialProducts: Product[];
  storeSlug: string;
}

const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80';
const getSafeProductImage = (url?: string) => (!url || url.startsWith('blob:') ? DEFAULT_PRODUCT_IMAGE : url);

export default function PublicStoreClientView({
  initialStore,
  initialProducts,
  storeSlug,
}: PublicStoreClientViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, getTotalItems, getTotalPrice, addItem } = useCartStore();

  const [store, setStore] = useState<Store>(initialStore);
  const [storeProducts, setStoreProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [mounted, setMounted] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPoliciesOpen, setIsPoliciesOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [selectedModalProduct, setSelectedModalProduct] = useState<Product | null>(null);
  const [isVerifiedModalOpen, setIsVerifiedModalOpen] = useState(false);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  const normalizedStyle = normalizeStoreStyle(store.themeStyle);
  const currentMood = VISUAL_MOODS.find((m) => m.id === normalizedStyle) || VISUAL_MOODS[1];
  const primaryColor = store.primaryColor || '#059669';
  const contrastColor = getContrastTextColor(primaryColor);
  const heroStyle = store.heroStyle || (store.headerStyle === 'card' ? 'glass' : store.headerStyle === 'minimal' ? 'clean' : 'banner');
  const showTrustBadges = store.showTrustBadges !== false;
  const productHoverZoom = store.productHoverZoom !== false;
  const isListLayout = store.catalogLayout === 'list';
  const fontConfig = FONT_PAIRINGS.find((f) => f.id === store.fontPairing) || (normalizedStyle === 'luxe' ? FONT_PAIRINGS[0] : FONT_PAIRINGS[1]);

  useEffect(() => {
    setMounted(true);

    // Guardar en sessionStorage para transiciones instantáneas dentro del navegador
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(`apana_public_store_${storeSlug}`, JSON.stringify(initialStore));
        sessionStorage.setItem(`apana_public_prods_${storeSlug}`, JSON.stringify(initialProducts));
      } catch (_) {}

      // Registrar visita única de forma no bloqueante
      const sessionVisitKey = `apana_session_visited_${initialStore.id}`;
      if (!sessionStorage.getItem(sessionVisitKey)) {
        sessionStorage.setItem(sessionVisitKey, 'true');
        import('@/lib/firebase/firestore')
          .then(({ recordAnalyticsEvent }) => {
            recordAnalyticsEvent(initialStore.id, 'visit').catch(() => {});
          })
          .catch(() => {});
      }
    }
  }, [initialStore, initialProducts, storeSlug]);

  const handleShareStore = () => {
    if (typeof window === 'undefined') return;
    const shareUrl = window.location.href;
    const shareTitle = store?.name || 'Tienda Online';
    const shareText = `¡Hola! Te invito a visitar la tienda online de ${shareTitle}. Explora los productos y haz tus pedidos fácilmente por WhatsApp:`;

    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  // Elementos reutilizables de información comercial
  const renderLogo = (sizeClass = 'w-20 h-20') =>
    store.logoUrl ? (
      <div className={`${sizeClass} rounded-2xl overflow-hidden bg-white p-1 shadow-md border border-slate-100 shrink-0 flex items-center justify-center`}>
        <img src={store.logoUrl} alt={store.name} className="w-full h-full object-contain" />
      </div>
    ) : (
      <div
        style={{ backgroundColor: primaryColor }}
        className={`${sizeClass} rounded-2xl text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0`}
      >
        {store.name.substring(0, 2).toUpperCase()}
      </div>
    );

  const commercialPills = (
    <div className="flex flex-col items-center gap-2 mt-1">
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <span
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold border ${
            normalizedStyle === 'luxe'
              ? 'bg-white border-[#E7E2D9] text-stone-700 shadow-2xs'
              : normalizedStyle === 'modern'
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
              : 'bg-neutral-100/70 border-neutral-200/60 text-neutral-600'
          }`}
        >
          {store.shippingType === 'solo_recojo' ? (
            <>
              <StoreIcon size={13} className="text-[#059669]" />
              <span>Solo recojo en tienda</span>
            </>
          ) : (
            <>
              <Truck size={13} className="text-[#059669]" />
              <span>
                {store.shippingType === 'gratis' ? 'Envío Gratis' : 'Envíos: A coordinar por WhatsApp'}
              </span>
            </>
          )}
        </span>

        {store.shippingType === 'solo_recojo' && store.pickupAddress ? (
          <span
            title={`Punto de recojo: ${store.pickupAddress}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border border-slate-200 bg-white text-slate-700 max-w-[240px] truncate shadow-2xs"
          >
            <MapPin size={12} className="text-slate-500 shrink-0" />
            <span className="truncate">{store.pickupAddress}</span>
          </span>
        ) : store.city ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border border-slate-200 bg-white text-slate-700 shadow-2xs">
            <MapPin size={12} className="text-slate-500" />
            <span>{store.city}</span>
          </span>
        ) : null}

        {store.schedule && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border border-slate-200 bg-white text-slate-700 shadow-2xs">
            <Clock size={12} className="text-slate-500" />
            <span>{store.schedule}</span>
          </span>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 mt-1 flex-wrap">
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
        <button
          type="button"
          onClick={handleShareStore}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 border border-emerald-200 text-[#006c49] hover:bg-emerald-100 transition-colors shadow-2xs cursor-pointer"
          title="Compartir enlace de la tienda"
        >
          {copiedShare ? (
            <>
              <Check size={12} className="text-[#059669]" />
              <span>¡Enlace copiado!</span>
            </>
          ) : (
            <>
              <Share2 size={12} />
              <span>Compartir tienda</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const totalCartCount = mounted ? getTotalItems() : 0;
  const isPaidPlan = store?.plan === 'emprendedor' || store?.plan === 'negocio';
  const maxProductsAllowed = store?.plan === 'gratis' ? 25 : store?.plan === 'emprendedor' ? 150 : 99999;
  const allowedProducts = storeProducts.slice(0, maxProductsAllowed);

  const filteredProducts = allowedProducts.filter((product) => {
    if (!product) return false;
    const title = (product.title || '').toLowerCase();
    const query = (searchQuery || '').toLowerCase();
    const matchesSearch = title.includes(query);
    const matchesCategory =
      !isPaidPlan ||
      selectedCategory === 'todos' ||
      product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans relative pb-24 md:pb-12">
      {/* Header Fijo con Nombre de Tienda y Carrito */}
      <header className="fixed top-0 w-full z-50 bg-[#f8f9ff]/80 backdrop-blur-xl border-b border-[#bccac0]/20">
        <div className="h-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="font-bold text-lg text-[#0b1c30] truncate tracking-tight">
            {store.name}
          </h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareStore}
              className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                normalizedStyle === 'luxe'
                  ? 'text-stone-700 hover:bg-stone-200/50'
                  : 'text-[#3d4a42] hover:bg-gray-100'
              }`}
              title="Compartir tienda"
              aria-label="Compartir tienda"
            >
              {copiedShare ? (
                <Check size={19} className="text-[#059669]" />
              ) : (
                <Share2 size={19} />
              )}
            </button>
            <Link
              href={`/s/${store.slug}/cart`}
              className={`group flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-sm active:scale-95 ${
                totalCartCount > 0
                  ? normalizedStyle === 'luxe'
                    ? 'bg-[#FAF8F5] border-[#d6c4b2] text-stone-900 hover:border-amber-700/60'
                    : 'bg-white border-emerald-300 text-[#0b1c30] hover:border-emerald-500'
                  : normalizedStyle === 'luxe'
                  ? 'bg-white/80 border-[#E7E2D9] text-stone-700 hover:bg-white hover:border-stone-400'
                  : 'bg-white/90 border-[#bccac0]/40 text-[#3d4a42] hover:bg-white hover:border-slate-400'
              }`}
              title="Ver Carrito de Compras"
            >
              <ShoppingBag
                size={18}
                className={`transition-transform group-hover:scale-110 shrink-0 ${
                  totalCartCount > 0
                    ? normalizedStyle === 'luxe'
                      ? 'text-amber-800'
                      : 'text-emerald-700'
                    : 'text-slate-600'
                }`}
              />
              <span className="text-xs font-bold hidden sm:inline">Carrito</span>
              {totalCartCount > 0 ? (
                <>
                  <span
                    className="px-1.5 py-0.5 rounded-full text-[10px] font-black text-white min-w-4 text-center shadow-2xs"
                    style={{ backgroundColor: store.primaryColor || '#059669' }}
                  >
                    {totalCartCount}
                  </span>
                  <span className="text-xs font-extrabold hidden md:inline border-l border-slate-200/80 pl-2 text-slate-800">
                    {formatCurrency(getTotalPrice())}
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

      {/* Announcement Bar Fijo (Cintillo Promocional Superior) */}
      {store.announcementBar && store.announcementBar.trim() && (
        <div
          className="w-full fixed top-16 z-40 py-2 px-4 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-xs transition-colors"
          style={{
            backgroundColor: store.primaryColor || '#059669',
            color: getContrastTextColor(store.primaryColor),
          }}
        >
          <span>📢</span>
          <span className="truncate max-w-4xl">{store.announcementBar}</span>
        </div>
      )}

      {/* Main Container */}
      <main
        className={`${
          store.announcementBar && store.announcementBar.trim() ? 'pt-24' : 'pt-16'
        } pb-24 min-h-screen transition-colors ${
          normalizedStyle === 'luxe'
            ? 'bg-[#FAF9F6] text-stone-900'
            : normalizedStyle === 'modern'
            ? 'bg-slate-50 text-[#0b1c30]'
            : normalizedStyle === 'fresh'
            ? 'bg-[#FFFDF9] text-stone-900'
            : 'bg-white text-[#0b1c30]'
        }`}
      >
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
              Así verán tus clientes tu tienda online y harán pedidos directos a tu WhatsApp.
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
        {store.slug !== 'panaderia-don-jose' && (!store.whatsappPhone || !store.isWhatsappVerified) && (
          <div className="w-full bg-amber-50/95 border-b border-amber-200/90 text-amber-950 px-4 py-2.5 text-center text-xs font-semibold flex items-center justify-center gap-2 sticky top-0 z-30 shadow-2xs backdrop-blur-xs">
            <span className="text-sm">🛠️</span>
            <span>Esta tienda se está terminando de configurar. Muy pronto disponible para pedidos por WhatsApp.</span>
          </div>
        )}

        <div className="flex flex-col w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          {/* ======================================================== */}
          {/* CABECERA & HERO DE TIENDA (GLASS / SPLIT / BANNER / CLEAN) */}
          {/* ======================================================== */}
          {heroStyle === 'glass' ? (
            /* HERO 1: PORTADA INMERSIVA CON CRISTAL */
            <div className="w-full max-w-4xl mx-auto mb-6 relative">
              <div className="w-full h-44 sm:h-64 md:h-72 rounded-3xl overflow-hidden relative shadow-md">
                <img
                  src={store.bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80'}
                  alt={store.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>

              {/* Floating Frosted Glass Card */}
              <div className="relative z-10 -mt-14 sm:-mt-20 max-w-2xl mx-auto px-4 w-full">
                <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-white/60 shadow-xl flex flex-col items-center text-center gap-2.5">
                  {renderLogo('w-20 h-20')}
                  <div className="flex flex-col items-center gap-1">
                    <h1 className={`text-2xl sm:text-3xl font-black tracking-tight text-slate-900 ${fontConfig.headingsFont}`}>
                      {store.name}
                    </h1>
                    {store.legalTaxId && store.legalBusinessName && (
                      <button
                        type="button"
                        onClick={() => setIsVerifiedModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-[#006c49] border border-emerald-200 shadow-2xs hover:bg-emerald-100 transition-all cursor-pointer"
                      >
                        <ShieldCheck size={14} className="text-[#059669]" />
                        <span>Identidad Oficial Verificada</span>
                      </button>
                    )}
                  </div>
                  {store.description && (
                    <p className="text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed">
                      {store.description}
                    </p>
                  )}
                  {commercialPills}
                </div>
              </div>
            </div>
          ) : heroStyle === 'split' ? (
            /* HERO 2: EDITORIAL DIVIDIDO */
            <div className="w-full max-w-4xl mx-auto mb-6 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 flex flex-col items-start text-left gap-2.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Catálogo Oficial APANA
                </span>
                <div className="flex items-center gap-3">
                  {renderLogo('w-14 h-14')}
                  <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 ${fontConfig.headingsFont}`}>
                    {store.name}
                  </h1>
                </div>
                {store.legalTaxId && store.legalBusinessName && (
                  <button
                    type="button"
                    onClick={() => setIsVerifiedModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-[#006c49] border border-emerald-200 shadow-2xs hover:bg-emerald-100 transition-all cursor-pointer"
                  >
                    <ShieldCheck size={14} className="text-[#059669]" />
                    <span>Identidad Oficial Verificada</span>
                  </button>
                )}
                {store.description && (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {store.description}
                  </p>
                )}
                {commercialPills}
              </div>

              <div className="w-full md:w-72 h-44 sm:h-52 rounded-2xl overflow-hidden shadow-md shrink-0 border border-slate-200 relative">
                <img
                  src={store.bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80'}
                  alt={store.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : heroStyle === 'banner' ? (
            /* HERO 3: PORTADA BANNER CLÁSICA */
            <div className="w-full max-w-4xl mx-auto mb-6">
              <div className="w-full h-36 sm:h-52 md:h-60 rounded-3xl overflow-hidden relative shadow-sm z-0">
                <img
                  src={store.bannerUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80'}
                  alt={store.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />
              </div>
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 -mt-12 sm:-mt-16 relative z-10 max-w-2xl mx-auto flex flex-col items-center text-center gap-2">
                {renderLogo('w-20 h-20')}
                <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 ${fontConfig.headingsFont}`}>
                  {store.name}
                </h1>
                {store.legalTaxId && store.legalBusinessName && (
                  <button
                    type="button"
                    onClick={() => setIsVerifiedModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-[#006c49] border border-emerald-200 shadow-2xs hover:bg-emerald-100 transition-all cursor-pointer"
                  >
                    <ShieldCheck size={14} className="text-[#059669]" />
                    <span>Identidad Oficial Verificada</span>
                  </button>
                )}
                {store.description && (
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed">
                    {store.description}
                  </p>
                )}
                {commercialPills}
              </div>
            </div>
          ) : (
            /* HERO 4: MINIMALISTA DIRECTO */
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-2xs mb-6 max-w-2xl mx-auto flex flex-col items-center text-center gap-2">
              {renderLogo('w-18 h-18')}
              <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 ${fontConfig.headingsFont}`}>
                {store.name}
              </h1>
              {store.legalTaxId && store.legalBusinessName && (
                <button
                  type="button"
                  onClick={() => setIsVerifiedModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-[#006c49] border border-emerald-200 shadow-2xs hover:bg-emerald-100 transition-all cursor-pointer"
                >
                  <ShieldCheck size={14} className="text-[#059669]" />
                  <span>Identidad Oficial Verificada</span>
                </button>
              )}
              {store.description && (
                <p className="text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed">
                  {store.description}
                </p>
              )}
              {commercialPills}
            </div>
          )}

          {/* ======================================================== */}
          {/* BARRA DE 3 PILARES DE CONFIANZA (TRUST BADGES) */}
          {/* ======================================================== */}
          {showTrustBadges && (
            <div className="w-full max-w-2xl mx-auto mb-5 px-1">
              <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-slate-200/80 p-3 shadow-2xs flex items-center justify-around gap-2 text-center flex-wrap">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#059669] flex items-center justify-center shrink-0">
                    <Truck size={15} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[11px] leading-tight">Envíos Seguros</span>
                    <span className="text-[9px] text-slate-400 font-normal">A todo el país</span>
                  </div>
                </div>

                <div className="hidden sm:block w-px h-5 bg-slate-200" />

                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#059669] flex items-center justify-center shrink-0">
                    <MessageCircle size={15} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[11px] leading-tight">Atención Directa</span>
                    <span className="text-[9px] text-slate-400 font-normal">Por WhatsApp</span>
                  </div>
                </div>

                <div className="hidden sm:block w-px h-5 bg-slate-200" />

                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#059669] flex items-center justify-center shrink-0">
                    <Award size={15} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[11px] leading-tight">Garantía</span>
                    <span className="text-[9px] text-slate-400 font-normal">Comercio Verificado</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Buscador de Productos */}
          <div className="mb-4 mt-2 w-full max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6d7a72]" size={18} />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#bccac0]/40 rounded-full py-3 pl-11 pr-4 text-sm text-[#0b1c30] focus:outline-none focus:ring-2 transition-all shadow-xs"
              style={{ borderColor: store.primaryColor ? `${store.primaryColor}60` : undefined }}
            />
          </div>

          {/* Categorías */}
          {(store.plan === 'emprendedor' || store.plan === 'negocio') && store.categories && store.categories.length > 0 && (
            <div className="w-full max-w-xl mx-auto mb-5">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin snap-x snap-mandatory justify-start sm:justify-center">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('todos')}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 snap-start ${
                    selectedCategory === 'todos'
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
                {store.categories.map((cat, idx) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 snap-start ${
                        isSelected
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

          {/* Grid o Lista de Productos Responsivo según catalogLayout y Tema */}
          {(() => {
            const activeListLayout = store.catalogLayout === 'list' || (!store.catalogLayout && normalizedStyle === 'market');
            return (
              <div
                className={`grid gap-3.5 sm:gap-4 lg:gap-6 mb-8 ${
                  activeListLayout
                    ? 'grid-cols-1 md:grid-cols-2'
                    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4'
                }`}
              >
                {filteredProducts.length === 0 ? (
                  <div className="col-span-full py-16 text-center text-[#6d7a72] text-sm flex flex-col items-center gap-2">
                    <span className="text-2xl">🛍️</span>
                    <p className="font-medium">Esta tienda aún no tiene productos disponibles en esta categoría.</p>
                  </div>
                ) : (
                  filteredProducts.map((product) => {
                    const isPaidStore = store.plan === 'emprendedor' || store.plan === 'negocio';
                    const isOutOfStock = product.inStock === false;
                    const hasDiscount = Boolean(isPaidStore && product.compareAtPrice && product.compareAtPrice > product.price);
                    const discountPercent = hasDiscount
                      ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
                      : 0;

                    const badgeText = (isPaidStore && !isOutOfStock && product.badge)
                      ? (product.badge === 'top'
                        ? '🔥 Top Ventas'
                        : product.badge === 'oferta'
                        ? '🏷️ Oferta'
                        : product.badge === 'nuevo'
                        ? '✨ Nuevo'
                        : null)
                      : null;

                    const isJustAdded = recentlyAddedId === product.id;

                    // ==========================================
                    // FORMATO 1: LISTA RÁPIDA (Ideal para Bodegas, Minimarkets, Menús)
                    // ==========================================
                    if (activeListLayout) {
                      return (
                        <article
                          key={product.id}
                          className={`bg-white rounded-2xl border border-slate-200/80 overflow-hidden flex flex-row items-center p-2.5 sm:p-3 group shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative ${
                            isOutOfStock ? 'opacity-70 bg-slate-50' : ''
                          }`}
                        >
                          <Link href={`/s/${store.slug}/p/${product.id}`} className="flex flex-1 flex-row items-center gap-3.5 min-w-0">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shrink-0 overflow-hidden bg-slate-100 relative">
                              <img
                                src={getSafeProductImage(product.imageUrl)}
                                alt={product.title}
                                className={`w-full h-full object-cover transition-transform duration-500 ${
                                  productHoverZoom ? 'group-hover:scale-105' : ''
                                } ${isOutOfStock ? 'grayscale contrast-75' : ''}`}
                                onError={(e) => {
                                  e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                                }}
                              />
                              {badgeText && !isOutOfStock && (
                                <span
                                  className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs"
                                  style={{ backgroundColor: primaryColor, color: contrastColor }}
                                >
                                  {badgeText}
                                </span>
                              )}
                              {hasDiscount && !isOutOfStock && (
                                <span className="absolute bottom-1.5 right-1.5 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs">
                                  -{discountPercent}%
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
                            <div className="flex-1 flex flex-col gap-1 text-left justify-center py-0.5 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3
                                  className={`${fontConfig.headingsFont} text-sm text-[#0b1c30] tracking-wide line-clamp-1 group-hover:opacity-80 transition-opacity ${
                                    isOutOfStock ? 'text-slate-500' : ''
                                  }`}
                                >
                                  {product.title}
                                </h3>
                                {isOutOfStock && (
                                  <span className="text-[9px] font-bold text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded shrink-0">
                                    Agotado
                                  </span>
                                )}
                              </div>
                              {product.description && (
                                <p className="text-xs text-slate-500 line-clamp-1 font-sans">
                                  {product.description}
                                </p>
                              )}
                              <div className="flex items-baseline gap-2 mt-0.5">
                                <span
                                  className="font-extrabold text-base"
                                  style={!isOutOfStock ? { color: primaryColor } : { color: '#94a3b8' }}
                                >
                                  {formatCurrency(product.price)}
                                </span>
                                {hasDiscount && (
                                  <span className="text-xs text-slate-400 line-through font-medium">
                                    {formatCurrency(product.compareAtPrice!)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>

                          {/* Botón de Agregar Rápido al Carrito */}
                          <div className="shrink-0 pl-2">
                            {isOutOfStock ? (
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1.5 rounded-xl select-none">
                                Agotado
                              </span>
                            ) : product.options && product.options.length > 0 ? (
                              <Link
                                href={`/s/${store.slug}/p/${product.id}`}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-all flex items-center gap-1 shadow-2xs"
                                title="Seleccionar opciones"
                              >
                                <span>Elegir</span>
                                <ArrowRight size={12} />
                              </Link>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  addItem(product);
                                  setRecentlyAddedId(product.id);
                                  setTimeout(() => setRecentlyAddedId(null), 1200);
                                }}
                                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-2xs cursor-pointer group"
                                style={{
                                  backgroundColor: primaryColor,
                                  color: contrastColor,
                                }}
                                title="Agregar al carrito"
                                aria-label={`Agregar ${product.title} al carrito`}
                              >
                                {isJustAdded ? (
                                  <Check size={18} className="stroke-[3] animate-scaleUp" />
                                ) : (
                                  <Plus size={18} className="stroke-[3] group-hover:scale-110 transition-transform" />
                                )}
                              </button>
                            )}
                          </div>
                        </article>
                      );
                    }

                    // ==========================================
                    // FORMATO 2: CUADRÍCULA VISUAL (4 VISUAL MOODS)
                    // ==========================================
                    const cardBorderRadius =
                      normalizedStyle === 'fresh'
                        ? 'rounded-3xl border-2 border-amber-100/90 shadow-xs hover:border-amber-300 hover:shadow-md'
                        : normalizedStyle === 'luxe'
                        ? 'rounded-2xl border border-stone-200/90 shadow-2xs hover:border-stone-400/60 hover:shadow-lg'
                        : normalizedStyle === 'market'
                        ? 'rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-500 hover:shadow-md'
                        : 'rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-xs shadow-xs hover:shadow-xl hover:-translate-y-1';

                    const imgAspect = normalizedStyle === 'luxe' ? 'aspect-[4/5]' : 'aspect-square';

                    return (
                      <article
                        key={product.id}
                        className={`bg-white overflow-hidden flex flex-col group cursor-pointer transition-all duration-300 relative ${cardBorderRadius} ${
                          isOutOfStock ? 'opacity-70 bg-slate-50' : ''
                        }`}
                      >
                        <Link href={`/s/${store.slug}/p/${product.id}`} className="flex w-full flex-col">
                          <div className={`${imgAspect} relative overflow-hidden bg-slate-100`}>
                            <img
                              src={getSafeProductImage(product.imageUrl)}
                              alt={product.title}
                              className={`w-full h-full object-cover transition-transform duration-500 ease-out ${
                                productHoverZoom ? 'group-hover:scale-105' : ''
                              } ${isOutOfStock ? 'grayscale contrast-75' : ''}`}
                              onError={(e) => {
                                e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                              }}
                            />
                            {badgeText && !isOutOfStock && (
                              <span
                                className="absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded shadow-xs z-10"
                                style={{ backgroundColor: primaryColor, color: contrastColor }}
                              >
                                {badgeText}
                              </span>
                            )}
                            {hasDiscount && !isOutOfStock && (
                              <span className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-xs z-10">
                                -{discountPercent}%
                              </span>
                            )}
                            {isOutOfStock && (
                              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-10">
                                <span className="bg-white/95 text-slate-900 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider shadow-sm">
                                  Agotado
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="p-3 sm:p-3.5 flex flex-col gap-1 text-left">
                            <h3
                              className={`${fontConfig.headingsFont} text-xs sm:text-sm text-slate-800 line-clamp-1 group-hover:opacity-80 transition-opacity ${
                                isOutOfStock ? 'text-slate-400' : ''
                              }`}
                            >
                              {product.title}
                            </h3>
                            {product.description && (
                              <p className="text-[11px] text-slate-500 line-clamp-1 font-sans">
                                {product.description}
                              </p>
                            )}

                            {/* Precios & Botón de Acción Rápida */}
                            <div className="mt-1 pt-1.5 flex items-center justify-between gap-1.5">
                              <div className="flex items-baseline gap-1.5 min-w-0">
                                <span
                                  className="font-extrabold text-xs sm:text-sm"
                                  style={!isOutOfStock ? { color: primaryColor } : { color: '#94a3b8' }}
                                >
                                  {formatCurrency(product.price)}
                                </span>
                                {hasDiscount && (
                                  <span className="text-[10px] text-slate-400 line-through font-medium">
                                    {formatCurrency(product.compareAtPrice!)}
                                  </span>
                                )}
                              </div>

                              {isOutOfStock ? (
                                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded select-none">
                                  Agotado
                                </span>
                              ) : product.options && product.options.length > 0 ? (
                                <div
                                  className="px-2 py-1 rounded-lg text-[10px] font-bold border border-slate-200 text-slate-700 bg-white shadow-2xs flex items-center gap-1 shrink-0"
                                >
                                  <span>Elegir</span>
                                  <ArrowRight size={10} />
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    addItem(product);
                                    setRecentlyAddedId(product.id);
                                    setTimeout(() => setRecentlyAddedId(null), 1200);
                                  }}
                                  className={`h-7 px-2 sm:px-2.5 rounded-lg flex items-center justify-center gap-1 text-[10px] font-black transition-all active:scale-95 shadow-2xs cursor-pointer shrink-0 ${
                                    normalizedStyle === 'fresh' ? 'rounded-full' : 'rounded-lg'
                                  }`}
                                  style={{
                                    backgroundColor: primaryColor,
                                    color: contrastColor,
                                  }}
                                  title="Agregar al carrito"
                                  aria-label={`Agregar ${product.title} al carrito`}
                                >
                                  {isJustAdded ? (
                                    <>
                                      <Check size={13} className="stroke-[3] animate-scaleUp" />
                                      <span className="hidden sm:inline">Listo</span>
                                    </>
                                  ) : (
                                    <>
                                      <Plus size={13} className="stroke-[3]" />
                                      <span className="hidden sm:inline">Agregar</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </Link>
                      </article>
                    );
                  })
                )}
              </div>
            );
          })()}

          {/* Footer Tienda Pública */}
          <footer className="py-7 px-4 text-center bg-white border-t border-[#bccac0]/20 flex flex-col items-center gap-2.5">

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-[#6d7a72]">
              <Link
                href={`/s/${store.slug}/libro-de-reclamaciones`}
                className="hover:text-[#0b1c30] transition-colors flex items-center gap-1 font-medium"
              >
                <BookOpen size={13} className="text-emerald-700" />
                <span>Libro de Reclamaciones</span>
              </Link>
              <span>•</span>
              <button
                type="button"
                onClick={() => setIsPoliciesOpen(true)}
                className="hover:text-[#0b1c30] transition-colors cursor-pointer font-medium text-[#006c49] hover:underline flex items-center gap-1"
              >
                <FileText size={13} className="text-[#006c49]" />
                <span>Políticas de la Tienda</span>
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setIsTermsOpen(true)}
                className="hover:text-[#0b1c30] transition-colors cursor-pointer text-slate-400 hover:text-slate-600 text-[11px]"
              >
                Términos APANA
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setIsReportOpen(true)}
                className="hover:text-amber-700 transition-colors flex items-center gap-1 text-slate-400 hover:underline cursor-pointer text-[11px]"
              >
                <Flag size={12} className="text-amber-600/80" />
                <span>Reportar</span>
              </button>
            </div>

            {(!store.plan || store.plan === 'gratis') ? (
              <p className="text-xs text-[#6d7a72]">
                © {new Date().getFullYear()} Creado por{' '}
                <Link
                  href="/"
                  target="_blank"
                  className="font-bold text-[#006c49] hover:text-[#059669] hover:underline transition-colors inline-flex items-center gap-0.5"
                >
                  APANA
                </Link>
                . Todos los derechos reservados.
              </p>
            ) : (
              <p className="text-xs text-[#6d7a72]">
                © {new Date().getFullYear()} <strong className="font-semibold text-slate-700">{store.name}</strong>. Todos los derechos reservados.
              </p>
            )}
          </footer>
        </div>
      </main>

      {/* Barra Flotante de Pedido en Curso */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-20 md:bottom-8 left-4 right-4 md:left-1/2 md:-translate-x-1/2 z-40 max-w-[500px] mx-auto animate-in slide-in-from-bottom-5 duration-300">
          <Link
            href={`/s/${store.slug}/cart`}
            className="w-full p-3.5 px-5 rounded-2xl shadow-xl flex items-center justify-between border border-white/20 hover:scale-[1.01] active:scale-[0.99] transition-all backdrop-blur-md"
            style={{
              backgroundColor: primaryColor,
              color: contrastColor,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-2xs"
                style={{
                  backgroundColor: contrastColor === '#ffffff' ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.12)',
                  color: contrastColor,
                }}
              >
                {totalCartCount}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[11px] opacity-85 font-medium">Pedido en curso</span>
                <span className="text-sm font-extrabold">{formatCurrency(getTotalPrice())}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-black">
              <span>Ver mi pedido</span>
              <ArrowRight size={16} />
            </div>
          </Link>
        </div>
      )}

      {/* Botón Flotante Rápido de WhatsApp */}
      {store.whatsappPhone && store.isWhatsappVerified && (
        <a
          href={`https://api.whatsapp.com/send?phone=${store.whatsappPhone}&text=${encodeURIComponent(
            `¡Hola! Tengo una consulta sobre los productos de ${store.name}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={async () => {
            if (store.plan === 'emprendedor') {
              try {
                const { recordAnalyticsEvent } = await import('@/lib/firebase/firestore');
                await recordAnalyticsEvent(store.id, 'click');
              } catch (_) {}
            }
          }}
          className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-30 w-12 h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all animate-in zoom-in-75 duration-300"
          title="Hacer una consulta por WhatsApp"
        >
          <WhatsAppIcon size={26} />
        </a>
      )}

      {/* Floating Bottom Navigation (Solo Móvil) */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-[#f8f9ff]/90 backdrop-blur-xl border-t border-[#bccac0]/30 shadow-[0_-1px_8px_rgba(0,0,0,0.04)]">
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
                <span
                  className="absolute -top-1 -right-2 w-4 h-4 text-white text-[9px] rounded-full flex items-center justify-center font-bold"
                  style={{ backgroundColor: store.primaryColor || '#059669' }}
                >
                  {totalCartCount}
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium">Mi Carrito</span>
          </Link>
        </div>
      </nav>

      {/* Modales */}
      <StorePoliciesModal isOpen={isPoliciesOpen} onClose={() => setIsPoliciesOpen(false)} store={store} />
      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      <ReportStoreModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        storeId={store.id}
        storeSlug={store.slug}
        storeName={store.name}
      />
      <ProductOptionsModal
        product={selectedModalProduct}
        isOpen={!!selectedModalProduct}
        onClose={() => setSelectedModalProduct(null)}
        onAddToCart={(prod, opts) => addItem(prod, opts)}
        primaryColor={store.primaryColor}
        themeStyle={normalizedStyle}
      />

      {/* Modal Informativo: Identidad Oficial Verificada */}
      {isVerifiedModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsVerifiedModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 text-left animate-in zoom-in-95 duration-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsVerifiedModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006c49] border border-emerald-200/80 flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck size={26} className="text-[#059669]" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  Acreditación Oficial
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-[#0b1c30] mt-0.5">
                  Identidad Oficial Verificada
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Esta tienda ha acreditado fehacientemente su identidad formal contrastando sus datos en los registros públicos oficiales del Estado peruano (<strong>{store.legalTaxIdType === 'DNI' || store.legalTaxId?.length === 8 ? 'RENIEC' : 'SUNAT'}</strong>).
            </p>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400">Razón Social / Titular:</span>
                <span className="font-extrabold text-slate-900 text-sm mt-0.5">{store.legalBusinessName}</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                <span className="text-[11px] font-medium text-slate-500">Documento Oficial:</span>
                <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {store.legalTaxIdType || (store.legalTaxId?.length === 11 ? 'RUC' : 'DNI')}: {store.legalTaxId}
                </span>
              </div>

              {(store.legalAddress || store.pickupAddress) && (
                <div className="flex flex-col pt-1 border-t border-slate-200/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Ubicación / Dirección:</span>
                  <span className="text-slate-700 font-medium mt-0.5">{store.legalAddress || store.pickupAddress}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <Link
                href={`/s/${store.slug}/libro-de-reclamaciones`}
                className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-[#006c49] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                onClick={() => setIsVerifiedModalOpen(false)}
              >
                <BookOpen size={14} className="text-[#059669]" />
                <span>Ver Libro de Reclamaciones Oficial ➔</span>
              </Link>

              <p className="text-[10px] text-slate-400 text-center leading-normal pt-1">
                APANA provee la plataforma tecnológica SaaS. Las ventas, entregas y emisión de comprobantes son responsabilidad exclusiva de este comercio.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
