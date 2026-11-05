'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  Smartphone,
  Monitor,
  ExternalLink,
  Save,
  RotateCcw,
  Check,
  Palette,
  Image as ImageIcon,
  LayoutGrid,
  List,
  ShieldCheck,
  Megaphone,
  Wand2,
  X,
  Plus,
  Eye,
  ShoppingBag,
  Search,
  Truck,
  MessageCircle,
  Award,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';
import { getStoreByUserIdFromFS, createOrUpdateStoreInFS, getProductsByStoreIdFromFS } from '@/lib/firebase/firestore';
import { Store, StoreStyle, CatalogLayout, HeaderStyle, StoreHeroStyle, FontPairing, Product } from '@/types/store';
import {
  VISUAL_MOODS,
  HERO_STYLES,
  FONT_PAIRINGS,
  STITCH_COLORS,
  BUSINESS_PRESETS,
  ANNOUNCEMENT_SUGGESTIONS,
  normalizeStoreStyle,
  getContrastTextColor,
  isValidHexColor,
} from '@/lib/design-system';

export default function StoreEditorPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  // Device preview state
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');

  // Control tabs
  const [activeTab, setActiveTab] = useState<'moods' | 'colors' | 'hero' | 'catalog' | 'trust'>('moods');

  // Design state
  const [themeStyle, setThemeStyle] = useState<StoreStyle>('modern');
  const [primaryColor, setPrimaryColor] = useState<string>('#059669');
  const [catalogLayout, setCatalogLayout] = useState<CatalogLayout>('grid');
  const [headerStyle, setHeaderStyle] = useState<HeaderStyle>('banner');
  const [heroStyle, setHeroStyle] = useState<StoreHeroStyle>('glass');
  const [fontPairing, setFontPairing] = useState<FontPairing>('modern');
  const [showTrustBadges, setShowTrustBadges] = useState<boolean>(true);
  const [productHoverZoom, setProductHoverZoom] = useState<boolean>(true);
  const [announcementBar, setAnnouncementBar] = useState<string>('');
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);

  // Custom color input state
  const [customHex, setCustomHex] = useState<string>('#059669');

  // Save & notification state
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initial reference to track changes & reset
  const initialRef = useRef<{
    themeStyle: StoreStyle;
    primaryColor: string;
    catalogLayout: CatalogLayout;
    headerStyle: HeaderStyle;
    heroStyle: StoreHeroStyle;
    fontPairing: FontPairing;
    showTrustBadges: boolean;
    productHoverZoom: boolean;
    announcementBar: string;
    bannerUrl: string | null;
  } | null>(null);

  // Carga inicial de datos
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        const storeData = await getStoreByUserIdFromFS(user.uid);
        if (storeData) {
          setStore(storeData);
          const normalizedStyle = normalizeStoreStyle(storeData.themeStyle);
          const color = storeData.primaryColor || '#059669';
          const layout = storeData.catalogLayout || 'grid';
          const hStyle = storeData.headerStyle || 'banner';
          const heroSt = storeData.heroStyle || (hStyle === 'card' ? 'glass' : hStyle === 'minimal' ? 'clean' : 'glass');
          const fonts = storeData.fontPairing || (normalizedStyle === 'luxe' ? 'editorial' : 'modern');
          const trust = storeData.showTrustBadges !== undefined ? storeData.showTrustBadges : true;
          const zoom = storeData.productHoverZoom !== undefined ? storeData.productHoverZoom : true;
          const announcement = storeData.announcementBar || '';
          const banner = storeData.bannerUrl || null;

          setThemeStyle(normalizedStyle);
          setPrimaryColor(color);
          setCustomHex(color);
          setCatalogLayout(layout);
          setHeaderStyle(hStyle);
          setHeroStyle(heroSt);
          setFontPairing(fonts);
          setShowTrustBadges(trust);
          setProductHoverZoom(zoom);
          setAnnouncementBar(announcement);
          setBannerUrl(banner);

          initialRef.current = {
            themeStyle: normalizedStyle,
            primaryColor: color,
            catalogLayout: layout,
            headerStyle: hStyle,
            heroStyle: heroSt,
            fontPairing: fonts,
            showTrustBadges: trust,
            productHoverZoom: zoom,
            announcementBar: announcement,
            bannerUrl: banner,
          };

          // Intentar cargar productos reales para la vista previa
          try {
            const storeProducts = await getProductsByStoreIdFromFS(storeData.id);
            setProducts(storeProducts || []);
          } catch (e) {
            console.error('Error cargando productos para previsualización:', e);
          }
        }
      } catch (err) {
        console.error('Error al cargar la tienda en el editor:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, authLoading, router]);

  // Detección de cambios
  useEffect(() => {
    if (!initialRef.current) return;
    const init = initialRef.current;
    const changed =
      themeStyle !== init.themeStyle ||
      primaryColor !== init.primaryColor ||
      catalogLayout !== init.catalogLayout ||
      heroStyle !== init.heroStyle ||
      fontPairing !== init.fontPairing ||
      showTrustBadges !== init.showTrustBadges ||
      productHoverZoom !== init.productHoverZoom ||
      announcementBar !== init.announcementBar ||
      bannerUrl !== init.bannerUrl;

    setHasChanges(changed);
  }, [
    themeStyle,
    primaryColor,
    catalogLayout,
    heroStyle,
    fontPairing,
    showTrustBadges,
    productHoverZoom,
    announcementBar,
    bannerUrl,
  ]);

  // Aplicar Preset de 1 Clic
  const handleApplyPreset = (preset: typeof BUSINESS_PRESETS[0]) => {
    setThemeStyle(preset.themeStyle);
    setPrimaryColor(preset.primaryColor);
    setCustomHex(preset.primaryColor);
    setCatalogLayout(preset.catalogLayout);
    setHeaderStyle(preset.headerStyle);
    setHeroStyle(preset.heroStyle);
    setFontPairing(preset.fontPairing);
    setShowTrustBadges(preset.showTrustBadges);
    setProductHoverZoom(preset.productHoverZoom);
    if (!announcementBar.trim()) {
      setAnnouncementBar(preset.suggestedAnnouncement);
    }
  };

  // Restablecer cambios
  const handleReset = () => {
    if (!initialRef.current) return;
    const init = initialRef.current;
    setThemeStyle(init.themeStyle);
    setPrimaryColor(init.primaryColor);
    setCustomHex(init.primaryColor);
    setCatalogLayout(init.catalogLayout);
    setHeaderStyle(init.headerStyle);
    setHeroStyle(init.heroStyle);
    setFontPairing(init.fontPairing);
    setShowTrustBadges(init.showTrustBadges);
    setProductHoverZoom(init.productHoverZoom);
    setAnnouncementBar(init.announcementBar);
    setBannerUrl(init.bannerUrl);
  };

  // Guardar y Publicar
  const handleSave = async () => {
    if (!user || !store) return;
    try {
      setIsSaving(true);
      await createOrUpdateStoreInFS(user.uid, {
        id: store.id,
        themeStyle,
        primaryColor,
        catalogLayout,
        headerStyle,
        heroStyle,
        fontPairing,
        showTrustBadges,
        productHoverZoom,
        announcementBar,
        bannerUrl,
      });

      initialRef.current = {
        themeStyle,
        primaryColor,
        catalogLayout,
        headerStyle,
        heroStyle,
        fontPairing,
        showTrustBadges,
        productHoverZoom,
        announcementBar,
        bannerUrl,
      };
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Error al guardar personalización de tienda:', err);
      alert('Hubo un error al guardar los cambios. Por favor intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Mock de productos para preview si la tienda no tiene productos
  const displayProducts: Product[] = products.length > 0 ? products.slice(0, 4) : [
    {
      id: 'mock-1',
      storeId: store?.id || '',
      title: 'Artículo Especial de Selección',
      price: 69.0,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
      description: 'Producto destacado de la mejor calidad con envío garantizado.',
      category: 'Destacados',
      inStock: true,
      createdAt: Date.now(),
    },
    {
      id: 'mock-2',
      storeId: store?.id || '',
      title: 'Edición Limitada Colección',
      price: 119.0,
      imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=400&q=80',
      description: 'Elaborado con materiales seleccionados para máxima duración.',
      category: 'Destacados',
      inStock: true,
      createdAt: Date.now(),
    },
    {
      id: 'mock-3',
      storeId: store?.id || '',
      title: 'Pack Esencial Apana',
      price: 45.0,
      imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80',
      description: 'Favorito de nuestros clientes frecuentes.',
      category: 'Destacados',
      inStock: true,
      createdAt: Date.now(),
    },
    {
      id: 'mock-4',
      storeId: store?.id || '',
      title: 'Línea Clásica Artesanal',
      price: 89.0,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
      description: 'Acabados finos y presentación impecable.',
      category: 'Destacados',
      inStock: true,
      createdAt: Date.now(),
    },
  ];

  const contrastColor = getContrastTextColor(primaryColor);
  const currentMood = VISUAL_MOODS.find((m) => m.id === themeStyle) || VISUAL_MOODS[1];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-300">Cargando Estudio de Diseño de tu Tienda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased">
      {/* ======================================================== */}
      {/* 1. TOP APP BAR (SHOPIFY STYLE) */}
      {/* ======================================================== */}
      <header className="h-16 bg-[#0b1c30] text-white px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-50 shadow-md">
        {/* Left: Exit to Dashboard + Store Name */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/dashboard"
            className="p-2 -ml-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            title="Volver al Panel Principal"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-white truncate">
                {store?.name || 'Mi Tienda'}
              </span>
              <span className="hidden sm:inline-flex text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Estudio de Diseño
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono truncate hidden sm:inline">
              /s/{store?.slug}
            </span>
          </div>
        </div>

        {/* Center: Device Switcher (Mobile / Desktop) */}
        <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 shadow-inner">
          <button
            type="button"
            onClick={() => setPreviewDevice('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              previewDevice === 'mobile'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Smartphone size={15} />
            <span className="hidden md:inline">Celular</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewDevice('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              previewDevice === 'desktop'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Monitor size={15} />
            <span className="hidden md:inline">Computadora</span>
          </button>
        </div>

        {/* Right: Reset, View Live Store & Save Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {hasChanges && (
            <button
              type="button"
              onClick={handleReset}
              className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
              title="Deshacer cambios no guardados"
            >
              <RotateCcw size={14} />
              <span>Deshacer</span>
            </button>
          )}

          {store?.slug && (
            <a
              href={`/s/${store.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 transition-all cursor-pointer"
            >
              <Eye size={14} />
              <span>Ver Tienda</span>
              <ExternalLink size={12} className="text-slate-400" />
            </a>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer shadow-md ${
              hasChanges
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95 ring-2 ring-emerald-400/50 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check size={16} strokeWidth={3} />
                <span>¡Publicado!</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Publicar Cambios</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Banner de éxito animado */}
      {saveSuccess && (
        <div className="bg-emerald-500 text-slate-950 px-4 py-2 text-center text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs z-40 animate-in fade-in slide-in-from-top-2">
          <Check size={16} strokeWidth={3} />
          <span>¡Tu tienda ha sido actualizada exitosamente! Los cambios ya son visibles para tus clientes.</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. MAIN SPLIT WORKSPACE */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* ======================================================== */}
        {/* LEFT PANEL: CONTROLS & SECTIONS (WIDTH 460px) */}
        {/* ======================================================== */}
        <aside className="w-full lg:w-[460px] xl:w-[490px] bg-white border-r border-slate-200/90 flex flex-col shrink-0 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto shadow-xs">
          {/* Sub Tabs Bar */}
          <div className="p-3 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto bg-slate-50/60 sticky top-0 z-20">
            <button
              type="button"
              onClick={() => setActiveTab('moods')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'moods'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Sparkles size={14} className={activeTab === 'moods' ? 'text-amber-400' : 'text-slate-400'} />
              <span>Estilos</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('colors')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'colors'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Palette size={14} className={activeTab === 'colors' ? 'text-emerald-400' : 'text-slate-400'} />
              <span>Colores</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('hero')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'hero'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <ImageIcon size={14} className={activeTab === 'hero' ? 'text-blue-400' : 'text-slate-400'} />
              <span>Portada</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'catalog'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <LayoutGrid size={14} className={activeTab === 'catalog' ? 'text-purple-400' : 'text-slate-400'} />
              <span>Catálogo</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('trust')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'trust'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <ShieldCheck size={14} className={activeTab === 'trust' ? 'text-emerald-400' : 'text-slate-400'} />
              <span>Confianza</span>
            </button>
          </div>

          {/* TAB CONTENT */}
          <div className="p-5 flex flex-col gap-6">
            {/* ==================================================== */}
            {/* TAB 1: ESTILOS DE AUTOR (VISUAL MOODS) */}
            {/* ==================================================== */}
            {activeTab === 'moods' && (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500" />
                    <span>Estilos de Autor (Identidad en 1 Clic)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Cada estilo redefine la tipografía, bordes, sombras y sensación táctil de tu tienda de forma profesional y armoniosa.
                  </p>
                </div>

                {/* Grid of 4 Visual Mood Cards */}
                <div className="grid grid-cols-1 gap-3.5">
                  {VISUAL_MOODS.map((mood) => {
                    const isSelected = themeStyle === mood.id;
                    return (
                      <button
                        key={mood.id}
                        type="button"
                        onClick={() => {
                          setThemeStyle(mood.id);
                          setFontPairing(mood.defaultFont);
                          setHeroStyle(mood.defaultHero);
                          setCatalogLayout(mood.defaultLayout);
                          setProductHoverZoom(mood.id !== 'market');
                        }}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/80 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-col gap-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-slate-900">{mood.name}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                {mood.badge}
                              </span>
                            </div>
                            <span className="text-[11px] font-semibold text-emerald-700">{mood.tagline}</span>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{mood.description}</p>
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                              <span>Inspiración: <strong className="text-slate-600">{mood.inspiration}</strong></span>
                              <span>•</span>
                              <span>Ideal: <strong className="text-slate-600">{mood.bestFor}</strong></span>
                            </div>
                          </div>

                          <div className="shrink-0 pt-0.5">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                isSelected ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check size={14} strokeWidth={3} />}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* 1-Click Business Presets */}
                <div className="mt-2 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Wand2 size={14} className="text-emerald-600" />
                      <span>Configuraciones Rápidas por Rubro</span>
                    </span>
                    <span className="text-[10px] text-slate-400">1 Clic</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {BUSINESS_PRESETS.map((bp) => (
                      <button
                        key={bp.id}
                        type="button"
                        onClick={() => handleApplyPreset(bp)}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-2xs transition-all flex items-center gap-2 text-left cursor-pointer group"
                      >
                        <span className="text-xl group-hover:scale-110 transition-transform">{bp.icon}</span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] font-bold text-slate-800 truncate">{bp.name}</span>
                          <span className="text-[9px] text-slate-400 truncate">{bp.rubro}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* TAB 2: COLORES & DESIGN SYSTEM */}
            {/* ==================================================== */}
            {activeTab === 'colors' && (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Palette size={16} className="text-emerald-600" />
                    <span>Color de Marca & Contraste Inteligente</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Elige el color representativo de tu negocio. El sistema calcula automáticamente la legibilidad del texto en botones y checkout según normas WCAG.
                  </p>
                </div>

                {/* 12 Swatches Curados */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-bold text-slate-700">Paleta de 12 Tonos Curados</label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                    {STITCH_COLORS.map((col) => {
                      const isSelected = primaryColor.toLowerCase() === col.hex.toLowerCase();
                      return (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => {
                            setPrimaryColor(col.hex);
                            setCustomHex(col.hex);
                          }}
                          className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-slate-900 ring-2 ring-slate-900/80 shadow-xs scale-105 bg-slate-50'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <span
                            className="w-7 h-7 rounded-lg shadow-2xs flex items-center justify-center text-white"
                            style={{ backgroundColor: col.hex }}
                          >
                            {isSelected && <Check size={14} strokeWidth={3} />}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-700 truncate w-full text-center">
                            {col.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selector Libre / Rueda de Color & HEX Directo */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-3">
                  <label className="text-xs font-bold text-slate-800">¿Tienes un código exacto de tu logo?</label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => {
                          setPrimaryColor(e.target.value);
                          setCustomHex(e.target.value);
                        }}
                        className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 bg-white p-0.5 shadow-2xs"
                        title="Abrir selector de color nativo"
                      />
                    </div>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        maxLength={7}
                        value={customHex}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomHex(val);
                          if (isValidHexColor(val)) {
                            setPrimaryColor(val);
                          }
                        }}
                        placeholder="#059669"
                        className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 uppercase focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>

                  {/* Contrast Verification Badge */}
                  <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Contraste de Botón:</span>
                    <div
                      className="px-3 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1.5 shadow-2xs"
                      style={{ backgroundColor: primaryColor, color: contrastColor }}
                    >
                      <Check size={13} strokeWidth={3} />
                      <span>Legible y Seguro</span>
                    </div>
                  </div>
                </div>

                {/* Tipografía Emparejada */}
                <div className="flex flex-col gap-2.5 pt-2">
                  <label className="text-xs font-bold text-slate-800">Combinación Tipográfica</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {FONT_PAIRINGS.map((fp) => (
                      <button
                        key={fp.id}
                        type="button"
                        onClick={() => setFontPairing(fp.id)}
                        className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                          fontPairing === fp.id
                            ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/60'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-900">{fp.name}</span>
                        <span className="text-[10px] text-slate-500">{fp.styleName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* TAB 3: PORTADA & CABECERA */}
            {/* ==================================================== */}
            {activeTab === 'hero' && (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <ImageIcon size={16} className="text-blue-600" />
                    <span>Estilo de Portada & Cabecera</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    La primera impresión de tus clientes. Elige cómo recibir a las personas cuando entran a tu tienda online.
                  </p>
                </div>

                {/* 3 Hero Options */}
                <div className="flex flex-col gap-3">
                  {HERO_STYLES.map((hero) => {
                    const isSelected = heroStyle === hero.id;
                    return (
                      <button
                        key={hero.id}
                        type="button"
                        onClick={() => {
                          setHeroStyle(hero.id);
                          if (hero.id === 'clean') setHeaderStyle('minimal');
                          if (hero.id === 'glass') setHeaderStyle('card');
                          if (hero.id === 'split') setHeaderStyle('banner');
                        }}
                        className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/80 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-2xl pt-0.5">{hero.icon}</span>
                        <div className="flex-1 flex flex-col gap-0.5">
                          <span className="font-bold text-xs text-slate-900">{hero.name}</span>
                          <span className="text-[11px] font-semibold text-emerald-700">{hero.tagline}</span>
                          <span className="text-[11px] text-slate-500 mt-0.5">{hero.description}</span>
                        </div>
                        <div className="shrink-0 pt-0.5">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              isSelected ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                            }`}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Banner Image URL (Opcional) */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-2.5">
                  <label className="text-xs font-bold text-slate-800">Foto o Imagen de Portada (URL)</label>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Si tienes una fotografía de tu local, vitrina o productos, ingresa su enlace para mostrarla en la cabecera:
                  </p>
                  <input
                    type="url"
                    value={bannerUrl || ''}
                    onChange={(e) => setBannerUrl(e.target.value.trim() || null)}
                    placeholder="https://ejemplo.com/foto-portada.jpg"
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  {bannerUrl && (
                    <div className="relative mt-1 rounded-xl overflow-hidden aspect-video border border-slate-200">
                      <img src={bannerUrl} alt="Vista previa de portada" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setBannerUrl(null)}
                        className="absolute top-2 right-2 p-1 rounded-lg bg-black/70 text-white hover:bg-red-600 transition-colors"
                        title="Quitar foto de portada"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* TAB 4: CATÁLOGO & PRODUCTOS */}
            {/* ==================================================== */}
            {activeTab === 'catalog' && (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <LayoutGrid size={16} className="text-purple-600" />
                    <span>Disposición del Catálogo & Tarjetas</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Configura la estructura en que tus clientes ven, exploran y agregan tus productos al carrito.
                  </p>
                </div>

                {/* Layout Switcher: Grid vs List */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-bold text-slate-700">Formato de Visualización</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCatalogLayout('grid')}
                      className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        catalogLayout === 'grid'
                          ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/70 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          catalogLayout === 'grid' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <LayoutGrid size={18} />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-slate-900">Cuadrícula Visual</span>
                        <span className="text-[10px] text-slate-500">2 Columnas. Fotos grandes para moda y accesorios.</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCatalogLayout('list')}
                      className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        catalogLayout === 'list'
                          ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/70 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          catalogLayout === 'list' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <List size={18} />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-slate-900">Lista Rápida (Menú)</span>
                        <span className="text-[10px] text-slate-500">Fila horizontal con botón "+" directo para bodegas.</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Hover Zoom Toggle */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-slate-800">Efecto Zoom al Pasar el Mouse</span>
                    <span className="text-[11px] text-slate-500">
                      Agranda suavemente la foto al interactuar, dando sensación de catálogo de alta gama.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProductHoverZoom(!productHoverZoom)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      productHoverZoom ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                        productHoverZoom ? 'left-6.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* TAB 5: CONFIANZA & BARRA DE ANUNCIOS */}
            {/* ==================================================== */}
            {activeTab === 'trust' && (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    <span>Sellos de Confianza & Barra de Anuncios</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Elementos probados de comercio electrónico que aumentan las ventas dando seguridad al comprador.
                  </p>
                </div>

                {/* Switch Sellos de Confianza */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-slate-800">Mostrar Barra de 3 Pilares de Confianza</span>
                      <span className="text-[11px] text-slate-500">
                        Destaca Envíos Seguros, Atención por WhatsApp y Garantía de satisfacción.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowTrustBadges(!showTrustBadges)}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        showTrustBadges ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                          showTrustBadges ? 'left-6.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {showTrustBadges && (
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/70 text-[10px] text-slate-600 font-semibold text-center">
                      <div className="p-2 rounded-xl bg-white border border-slate-200 flex flex-col items-center gap-1">
                        <Truck size={14} className="text-emerald-600" />
                        <span>Envíos Seguros</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-slate-200 flex flex-col items-center gap-1">
                        <MessageCircle size={14} className="text-emerald-600" />
                        <span>Chat WhatsApp</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-slate-200 flex flex-col items-center gap-1">
                        <Award size={14} className="text-emerald-600" />
                        <span>Garantía Apana</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Barra de Anuncios Superior */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Megaphone size={14} className="text-emerald-600" />
                    <span>Barra de Anuncios Fija (Franja Superior)</span>
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Muestra ofertas especiales, envíos gratis o avisos importantes en el borde superior de la tienda:
                  </p>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={120}
                      value={announcementBar}
                      onChange={(e) => setAnnouncementBar(e.target.value)}
                      placeholder="Ej: ¡Envíos gratis en compras mayores a S/ 100! • Pedidos al WhatsApp"
                      className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                    {announcementBar && (
                      <button
                        type="button"
                        onClick={() => setAnnouncementBar('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title="Borrar anuncio"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Sugerencias en 1 clic */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                      Sugerencias:
                    </span>
                    {ANNOUNCEMENT_SUGGESTIONS.map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAnnouncementBar(sug)}
                        className="text-[10px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full transition-all cursor-pointer truncate max-w-[220px]"
                        title={sug}
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ======================================================== */}
        {/* RIGHT CANVAS: RESPONSIVE LIVE INTERACTIVE PREVIEW */}
        {/* ======================================================== */}
        <main className="flex-1 bg-slate-200/70 p-4 sm:p-6 lg:p-8 flex items-center justify-center overflow-y-auto">
          {previewDevice === 'mobile' ? (
            /* ==================================================== */
            /* MOCKUP 1: IPHONE 15 PRO FRAME (MOBILE) */
            /* ==================================================== */
            <div className="w-[375px] h-[750px] max-h-[85vh] bg-white rounded-[44px] shadow-2xl border-[9px] border-slate-900 overflow-hidden flex flex-col relative transition-all duration-300 ring-1 ring-slate-900/10">
              {/* Dynamic Island */}
              <div className="h-6 bg-slate-900 w-full flex items-center justify-center shrink-0 z-30">
                <div className="w-24 h-4 bg-black rounded-full" />
              </div>

              {/* Inner Store Screen (Scrollable) */}
              <div className="flex-1 overflow-y-auto bg-slate-50 flex flex-col relative text-slate-900">
                {/* 1. Announcement Bar */}
                {announcementBar.trim() && (
                  <div
                    className="py-1.5 px-3 text-[10px] font-bold text-center tracking-tight shrink-0 shadow-2xs"
                    style={{ backgroundColor: primaryColor, color: contrastColor }}
                  >
                    <span>{announcementBar}</span>
                  </div>
                )}

                {/* 2. Top Navigation Bar */}
                <div className="px-4 py-3 bg-white/95 backdrop-blur-md border-b border-slate-100 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-2xs overflow-hidden"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {store?.logoUrl ? (
                        <img src={store.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        (store?.name || 'AP').substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <span className="font-extrabold text-xs text-slate-900 truncate max-w-[150px]">
                      {store?.name || 'Mi Tienda'}
                    </span>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                    <Search size={14} />
                  </div>
                </div>

                {/* 3. Hero Section (According to heroStyle) */}
                {heroStyle === 'glass' && (
                  <div className="relative p-4 bg-linear-to-b from-slate-900 to-slate-800 text-white overflow-hidden">
                    <div
                      className="absolute inset-0 opacity-40 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80'})`,
                      }}
                    />
                    <div className="relative z-10 p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col gap-1.5 shadow-lg">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                        {themeStyle === 'luxe' ? 'Colección Exclusiva' : 'Bienvenido'}
                      </span>
                      <h4 className="font-extrabold text-sm text-white leading-tight">
                        {store?.description || 'Encuentra lo mejor y pide directamente por WhatsApp.'}
                      </h4>
                      <span className="text-[10px] text-slate-200">
                        ✓ Envíos inmediatos • WhatsApp Oficial
                      </span>
                    </div>
                  </div>
                )}

                {heroStyle === 'split' && (
                  <div className="p-4 bg-white border-b border-slate-100 flex items-center gap-3">
                    <div className="flex-1 flex flex-col gap-1">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                        Catálogo Oficial
                      </span>
                      <h4 className="font-serif font-bold text-sm text-slate-900 leading-tight">
                        {store?.name || 'Mi Tienda'}
                      </h4>
                      <p className="text-[10px] text-slate-500 line-clamp-2">
                        {store?.description || 'Colección de temporada lista para ordenar.'}
                      </p>
                    </div>
                    <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-slate-200 shadow-2xs">
                      <img
                        src={bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=300&q=80'}
                        alt="Hero"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* 4. Trust Badges Bar */}
                {showTrustBadges && (
                  <div className="py-2 px-3 bg-white border-b border-slate-100 flex items-center justify-around text-[9px] text-slate-600 font-bold">
                    <span className="flex items-center gap-1">
                      <Truck size={12} className="text-emerald-600" />
                      <span>Envíos Seguros</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={12} className="text-emerald-600" />
                      <span>WhatsApp Directo</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Award size={12} className="text-emerald-600" />
                      <span>Garantía</span>
                    </span>
                  </div>
                )}

                {/* 5. Products Section */}
                <div className="p-3.5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900">Nuestros Productos</span>
                    <span className="text-[10px] font-bold text-slate-400">{displayProducts.length} artículos</span>
                  </div>

                  {catalogLayout === 'grid' ? (
                    /* Cuadrícula Visual */
                    <div className="grid grid-cols-2 gap-2.5">
                      {displayProducts.map((p) => (
                        <div
                          key={p.id}
                          className={`rounded-2xl border bg-white overflow-hidden flex flex-col shadow-2xs transition-all ${
                            currentMood.cardStyle
                          }`}
                        >
                          <div className="aspect-square bg-slate-100 overflow-hidden relative">
                            <img
                              src={p.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80'}
                              alt={p.title}
                              className={`w-full h-full object-cover ${productHoverZoom ? 'hover:scale-105 transition-transform duration-500' : ''}`}
                            />
                            <div className="absolute top-1.5 right-1.5 bg-white/90 backdrop-blur-xs px-1.5 py-0.5 rounded-md text-[9px] font-black text-slate-800 shadow-2xs">
                              S/ {p.price.toFixed(2)}
                            </div>
                          </div>
                          <div className="p-2 flex flex-col gap-1.5">
                            <span className="text-[10px] font-bold text-slate-800 line-clamp-1">{p.title}</span>
                            <button
                              type="button"
                              className="w-full py-1 rounded-lg text-[9px] font-extrabold flex items-center justify-center gap-1 shadow-2xs"
                              style={{ backgroundColor: primaryColor, color: contrastColor }}
                            >
                              <Plus size={11} strokeWidth={3} />
                              <span>Agregar</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Lista Rápida (Menú) */
                    <div className="flex flex-col gap-2">
                      {displayProducts.map((p) => (
                        <div
                          key={p.id}
                          className="p-2.5 rounded-xl border border-slate-200/90 bg-white flex items-center justify-between gap-2.5 shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                              <img
                                src={p.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'}
                                alt={p.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex flex-col min-w-0 text-left">
                              <span className="text-[11px] font-bold text-slate-800 truncate">{p.title}</span>
                              <span className="text-xs font-black" style={{ color: primaryColor }}>
                                S/ {p.price.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                            style={{ backgroundColor: primaryColor, color: contrastColor }}
                          >
                            <Plus size={14} strokeWidth={3} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Floating Bottom Cart Pill */}
                <div className="sticky bottom-3 mx-auto px-4 w-full z-20">
                  <div
                    className="w-full py-2.5 px-4 rounded-2xl shadow-xl flex items-center justify-between text-xs font-extrabold backdrop-blur-md"
                    style={{ backgroundColor: primaryColor, color: contrastColor }}
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingBag size={15} />
                      <span>Ver Carrito (1)</span>
                    </div>
                    <span>S/ 69.00</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ==================================================== */
            /* MOCKUP 2: DESKTOP BROWSER WINDOW (DESKTOP) */
            /* ==================================================== */
            <div className="w-full max-w-[920px] h-[720px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col transition-all duration-300">
              {/* Browser Window Chrome */}
              <div className="h-10 bg-slate-800 px-4 flex items-center gap-3 shrink-0 select-none">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="flex-1 max-w-sm mx-auto bg-slate-900/90 text-slate-300 text-[11px] font-mono py-1 px-3 rounded-lg flex items-center justify-center gap-1.5 truncate border border-slate-700/60">
                  <span>🔒</span>
                  <span>apana.pe/s/{store?.slug || 'tienda'}</span>
                </div>
              </div>

              {/* Desktop Store Canvas */}
              <div className="flex-1 overflow-y-auto bg-slate-50 flex flex-col text-slate-900">
                {/* 1. Announcement Bar */}
                {announcementBar.trim() && (
                  <div
                    className="py-2 px-6 text-xs font-bold text-center tracking-tight shrink-0 shadow-2xs"
                    style={{ backgroundColor: primaryColor, color: contrastColor }}
                  >
                    <span>{announcementBar}</span>
                  </div>
                )}

                {/* 2. Desktop Navigation Bar */}
                <header className="px-8 py-4 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between sticky top-0 z-20">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-2xs overflow-hidden"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {store?.logoUrl ? (
                        <img src={store.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        (store?.name || 'AP').substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-extrabold text-base text-slate-900">{store?.name || 'Mi Tienda'}</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">✓ Tienda Verificada</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        placeholder="Buscar producto..."
                        className="text-xs bg-slate-100 rounded-xl pl-8 pr-3 py-1.5 border border-slate-200 text-slate-700 w-48"
                      />
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    <div
                      className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      style={{ backgroundColor: primaryColor, color: contrastColor }}
                    >
                      <ShoppingBag size={14} />
                      <span>Carrito (0)</span>
                    </div>
                  </div>
                </header>

                {/* 3. Desktop Hero Section */}
                {heroStyle === 'glass' && (
                  <div className="relative p-8 bg-slate-900 text-white overflow-hidden min-h-[180px] flex items-center">
                    <div
                      className="absolute inset-0 opacity-40 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80'})`,
                      }}
                    />
                    <div className="relative z-10 max-w-lg p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col gap-2 shadow-xl">
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                        {themeStyle === 'luxe' ? 'Colección Exclusiva' : 'Bienvenidos a Nuestra Tienda'}
                      </span>
                      <h3 className="font-extrabold text-xl text-white leading-tight">
                        {store?.description || 'Encuentra los mejores productos y haz tus pedidos al instante por WhatsApp.'}
                      </h3>
                    </div>
                  </div>
                )}

                {heroStyle === 'split' && (
                  <div className="px-8 py-6 bg-white border-b border-slate-200/80 flex items-center justify-between gap-6">
                    <div className="max-w-md flex flex-col gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                        Catálogo Exclusivo
                      </span>
                      <h2 className="font-serif font-black text-2xl text-slate-900 leading-tight">
                        {store?.name || 'Mi Tienda'}
                      </h2>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {store?.description || 'Explora nuestras colecciones seleccionadas y ordena con un solo clic.'}
                      </p>
                    </div>
                    <div className="w-56 h-32 rounded-2xl overflow-hidden shrink-0 border border-slate-200 shadow-md">
                      <img
                        src={bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80'}
                        alt="Hero"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* 4. Trust Badges */}
                {showTrustBadges && (
                  <div className="py-3 px-8 bg-white border-b border-slate-200/60 flex items-center justify-center gap-8 text-xs text-slate-600 font-bold">
                    <span className="flex items-center gap-2">
                      <Truck size={15} className="text-emerald-600" />
                      <span>Envíos Seguros a Todo el País</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-2">
                      <MessageCircle size={15} className="text-emerald-600" />
                      <span>Atención Personalizada 1 a 1</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-2">
                      <Award size={15} className="text-emerald-600" />
                      <span>Garantía de Satisfacción</span>
                    </span>
                  </div>
                )}

                {/* 5. Desktop Products Grid */}
                <div className="p-8 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-base text-slate-900">Catálogo de Productos</h3>
                    <span className="text-xs text-slate-500 font-semibold">{displayProducts.length} productos disponibles</span>
                  </div>

                  {catalogLayout === 'grid' ? (
                    <div className="grid grid-cols-4 gap-4">
                      {displayProducts.map((p) => (
                        <div
                          key={p.id}
                          className={`rounded-2xl border bg-white overflow-hidden flex flex-col shadow-2xs transition-all ${
                            currentMood.cardStyle
                          }`}
                        >
                          <div className="aspect-square bg-slate-100 overflow-hidden relative">
                            <img
                              src={p.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'}
                              alt={p.title}
                              className={`w-full h-full object-cover ${productHoverZoom ? 'hover:scale-105 transition-transform duration-500' : ''}`}
                            />
                          </div>
                          <div className="p-3 flex flex-col gap-2">
                            <span className="text-xs font-bold text-slate-800 line-clamp-1">{p.title}</span>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-extrabold" style={{ color: primaryColor }}>
                                S/ {p.price.toFixed(2)}
                              </span>
                              <button
                                type="button"
                                className="px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 shadow-2xs"
                                style={{ backgroundColor: primaryColor, color: contrastColor }}
                              >
                                <Plus size={12} strokeWidth={3} />
                                <span>Agregar</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {displayProducts.map((p) => (
                        <div
                          key={p.id}
                          className="p-3 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                              <img
                                src={p.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'}
                                alt={p.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-slate-800 truncate">{p.title}</span>
                              <span className="text-sm font-black" style={{ color: primaryColor }}>
                                S/ {p.price.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                            style={{ backgroundColor: primaryColor, color: contrastColor }}
                          >
                            <Plus size={16} strokeWidth={3} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Bar */}
                <div className="py-4 px-8 bg-white border-t border-slate-200 mt-auto flex items-center justify-between text-xs text-slate-400">
                  <span>© {store?.name || 'Mi Tienda'} • Libro de Reclamaciones • Políticas</span>
                  <span className="font-semibold text-emerald-600">Tienda impulsada por Apana</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
