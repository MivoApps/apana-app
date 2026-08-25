'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Pencil, 
  Trash2, 
  Plus, 
  Home, 
  Package, 
  Settings,
  Share2,
  Check,
  Zap,
  Filter,
  ExternalLink,
  LayoutGrid,
  List,
  FileSpreadsheet,
  Sparkles,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/whatsapp';
import { useAppStore } from '@/lib/app-store';
import { useAuth } from '@/lib/firebase/auth-context';
import { getStoreByUserIdFromFS, getProductsByStoreIdFromFS, deleteProductFromFS, updateProductInFS } from '@/lib/firebase/firestore';
import { Store, Product } from '@/types/store';
import { exportProductsToCSV } from '@/lib/excel-export';

export default function ProductGalleryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { deleteProduct } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'todos' | 'activos' | 'inactivos'>('todos');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('todas');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isLoading, setIsLoading] = useState(true);
  const [fsStore, setFsStore] = useState<Store | null>(null);
  const [fsProducts, setFsProducts] = useState<Product[]>([]);
  const [copiedProdId, setCopiedProdId] = useState<string | null>(null);

  useEffect(() => {
    // Restaurar preferencia de vista guardada
    const savedView = localStorage.getItem('apana_products_view_mode') as 'list' | 'grid';
    if (savedView) setViewMode(savedView);
  }, []);

  const handleToggleViewMode = (mode: 'list' | 'grid') => {
    setViewMode(mode);
    localStorage.setItem('apana_products_view_mode', mode);
  };

  useEffect(() => {
    const fetchFS = async () => {
      if (authLoading) return;
      if (!user) {
        router.push('/login');
        return;
      }

      // 1. Intentar cargar inmediatamente del caché rápido de sesión si existe (0 ms)
      const cachedStore = sessionStorage.getItem(`apana_cache_store_${user.uid}`);
      const cachedProducts = sessionStorage.getItem(`apana_cache_prods_${user.uid}`);

      if (cachedStore && cachedProducts) {
        try {
          setFsStore(JSON.parse(cachedStore));
          setFsProducts(JSON.parse(cachedProducts));
          setIsLoading(false);
        } catch (e) {}
      } else {
        setIsLoading(true);
      }

      // 2. Traer la verdad actualizada desde Firestore en segundo plano (silenciosamente)
      const storeFromFS = await getStoreByUserIdFromFS(user.uid);
      if (!storeFromFS) {
        router.push('/store/setup');
        return;
      }

      setFsStore(storeFromFS);
      sessionStorage.setItem(`apana_cache_store_${user.uid}`, JSON.stringify(storeFromFS));

      const prods = await getProductsByStoreIdFromFS(storeFromFS.id);
      setFsProducts(prods);
      sessionStorage.setItem(`apana_cache_prods_${user.uid}`, JSON.stringify(prods));

      setIsLoading(false);
    };
    fetchFS();
  }, [user, authLoading, router]);

  const activeStore = fsStore;
  const products = fsProducts;
  const currentPlan = fsStore?.plan || 'gratis';
  const isProPlan = currentPlan === 'negocio';
  const isSuperAdmin = Boolean(user?.email && ['angelo@mivo.pe', 'angelocastellanos99@gmail.com'].includes(user.email.toLowerCase().trim()));
  const isFreePlan = !fsStore?.plan || currentPlan === 'gratis';
  const maxProducts = isFreePlan ? 25 : currentPlan === 'emprendedor' ? 150 : 99999;
  const inStockCount = products.filter((p) => p.inStock).length;
  const pausedCount = products.length - inStockCount;
  const isLimitReached = !isProPlan && products.length >= maxProducts;
  const capacityPercentage = Math.min((products.length / maxProducts) * 100, 100);

  const [showProUpgradeModal, setShowProUpgradeModal] = useState(false);

  const handleExportCatalog = () => {
    const isSuperAdmin = user?.email && ['angelo@mivo.pe', 'angelocastellanos99@gmail.com'].includes(user.email.toLowerCase().trim());
    if (isProPlan || isSuperAdmin) {
      exportProductsToCSV(products, fsStore?.name || 'mi-tienda', fsStore?.slug || 'mi-tienda');
    } else {
      setShowProUpgradeModal(true);
    }
  };

  // Lista de categorías únicas para filtrar
  const availableCategories = Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[];

  const handleToggleStock = async (productId: string, currentStock: boolean) => {
    const newStock = !currentStock;
    // Optimistic UI update
    setFsProducts((prev) => {
      const updated = prev.map((p) => (p.id === productId ? { ...p, inStock: newStock } : p));
      if (user) {
        sessionStorage.setItem(`apana_cache_prods_${user.uid}`, JSON.stringify(updated));
      }
      if (activeStore) {
        sessionStorage.removeItem(`apana_public_prods_${activeStore.slug}`);
      }
      return updated;
    });

    if (activeStore) {
      try {
        await updateProductInFS(activeStore.id, productId, { inStock: newStock });
      } catch (err) {
        console.error('Error al actualizar stock:', err);
      }
    }
  };

  const handleShareProductWhatsApp = (product: Product) => {
    if (!activeStore) return;
    const prodUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/s/${activeStore.slug}/p/${product.id}`
      : `https://apana.app/s/${activeStore.slug}/p/${product.id}`;

    const message = `🛍️ *${product.title}* en *${activeStore.name}*\n💰 Precio: ${formatCurrency(product.price)}\n\n👉 Puedes verlo y pedirlo directamente aquí: ${prodUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      deleteProduct(productId);
      if (activeStore && user) {
        try {
          await deleteProductFromFS(activeStore.id, productId);
          setFsProducts((prev) => {
            const updated = prev.filter((p) => p.id !== productId);
            sessionStorage.setItem(`apana_cache_prods_${user.uid}`, JSON.stringify(updated));
            sessionStorage.removeItem(`apana_public_prods_${activeStore.slug}`);
            return updated;
          });
        } catch (err) {
          console.error('Error al eliminar producto en Firestore:', err);
        }
      }
    }
  };

  const filteredProducts = products
    .filter((p) => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        selectedStatusFilter === 'todos' ||
        (selectedStatusFilter === 'activos' && p.inStock) ||
        (selectedStatusFilter === 'inactivos' && !p.inStock);
      const matchesCategory =
        selectedCategoryFilter === 'todas' || p.category === selectedCategoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a: any, b: any) => {
      const timeA = typeof a.createdAt === 'number' ? a.createdAt : (a.createdAt?.toMillis ? a.createdAt.toMillis() : parseInt(a.id?.replace('prod_', '') || '0') || 0);
      const timeB = typeof b.createdAt === 'number' ? b.createdAt : (b.createdAt?.toMillis ? b.createdAt.toMillis() : parseInt(b.id?.replace('prod_', '') || '0') || 0);
      return timeB - timeA;
    });

  const activeCount = products.filter((p) => p.inStock).length;
  const inactiveCount = products.filter((p) => !p.inStock).length;

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center text-[#0b1c30] gap-3 font-sans">
        <div className="w-10 h-10 border-4 border-[#059669] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium text-[#6d7a72]">Cargando tus productos...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans relative pb-28">
      {/* Top App Header */}
      <header className="fixed top-0 w-full z-40 bg-[#f8f9ff]/80 backdrop-blur-xl border-b border-[#bccac0]/20">
        <div className="h-14 flex items-center justify-between px-4 max-w-[640px] mx-auto">
          <h1 className="font-bold text-lg text-[#0b1c30]">
            {activeStore ? activeStore.name : 'Mis Productos'}
          </h1>
          <Link href="/settings" title="Ir a Ajustes" className="transition-transform active:scale-95">
            <div
              style={{ backgroundColor: activeStore?.primaryColor || '#059669' }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-2xs hover:opacity-90 cursor-pointer"
            >
              {activeStore ? activeStore.name.substring(0, 2).toUpperCase() : 'MI'}
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-16 px-4 max-w-[640px] w-full mx-auto flex flex-col gap-4">
        
        {/* Barra / Tarjeta de Capacidad de Productos o Estatus Pro */}
        {isProPlan ? (
          <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col gap-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-sm shadow-2xs border border-amber-200/60">
                  ♾️
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#0b1c30]">
                    Catálogo Ilimitado Activo
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {products.length} {products.length === 1 ? 'producto' : 'productos'} en total ({inStockCount} activos, {pausedCount} pausados)
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-amber-100/90 text-amber-900 border border-amber-300 shadow-2xs">
                Plan Negocio Pro ✨
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white p-4 rounded-2xl border border-[#bccac0]/40 shadow-xs flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-[#059669]" />
                <span className="text-xs font-bold text-[#0b1c30]">
                  {products.length} / {maxProducts} productos en tu catálogo
                </span>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                isFreePlan ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-[#059669]'
              }`}>
                {isFreePlan ? 'Plan Gratis' : 'Plan Emprendedor'}
              </span>
            </div>

            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isLimitReached ? 'bg-amber-500' : 'bg-[#059669]'
                }`}
                style={{ width: `${capacityPercentage}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] text-[#6d7a72]">
              <span>
                {isLimitReached
                  ? 'Has alcanzado el límite máximo de tu plan.'
                  : `Te quedan ${Math.max(0, maxProducts - products.length)} espacios disponibles.`}
              </span>
              {isLimitReached && (
                <Link href="/plans" className="font-bold text-amber-700 hover:underline">
                  Mejorar plan ↗
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Buscador de Productos */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6d7a72]" size={18} />
          <input
            type="text"
            placeholder="Buscar en mis productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 bg-white border border-[#bccac0]/50 rounded-xl pl-10 pr-4 text-sm text-[#0b1c30] placeholder:text-[#6d7a72]/60 focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition-all shadow-xs"
          />
        </div>

        {/* Píldoras de Filtro por Estado */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedStatusFilter('todos')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              selectedStatusFilter === 'todos'
                ? 'bg-[#0b1c30] text-white shadow-2xs'
                : 'bg-white text-[#6d7a72] border border-[#bccac0]/40 hover:bg-slate-50'
            }`}
          >
            Todos ({products.length})
          </button>
          <button
            onClick={() => setSelectedStatusFilter('activos')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              selectedStatusFilter === 'activos'
                ? 'bg-[#059669] text-white shadow-2xs'
                : 'bg-white text-[#6d7a72] border border-[#bccac0]/40 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Activos ({activeCount})
          </button>
          <button
            onClick={() => setSelectedStatusFilter('inactivos')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              selectedStatusFilter === 'inactivos'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-white text-[#6d7a72] border border-[#bccac0]/40 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Pausados ({inactiveCount})
          </button>
        </div>

        {/* Filtro por Categorías (si existen) */}
        {availableCategories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0 mr-1">Categoría:</span>
            <button
              onClick={() => setSelectedCategoryFilter('todas')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                selectedCategoryFilter === 'todas'
                  ? 'bg-emerald-50 text-[#059669] border border-[#059669]'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Todas
            </button>
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  selectedCategoryFilter === cat
                    ? 'bg-emerald-50 text-[#059669] border border-[#059669]'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Action Header con Selector de Vista (Lista / Cuadrícula) */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-[#0b1c30]">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Producto' : 'Productos'}
            </h2>

            {/* Selector de Vista (Lista / Cuadrícula) */}
            <div className="flex items-center bg-white p-0.5 rounded-lg border border-[#bccac0]/40 shadow-2xs">
              <button
                type="button"
                onClick={() => handleToggleViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'list'
                    ? 'bg-[#059669] text-white shadow-xs'
                    : 'text-[#6d7a72] hover:text-[#0b1c30]'
                }`}
                title="Vista en Lista"
              >
                <List size={15} />
              </button>
              <button
                type="button"
                onClick={() => handleToggleViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'grid'
                    ? 'bg-[#059669] text-white shadow-xs'
                    : 'text-[#6d7a72] hover:text-[#0b1c30]'
                }`}
                title="Vista en Cuadrícula"
              >
                <LayoutGrid size={15} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Botón Exportar Catálogo a Excel (Sólo Plan Negocio Pro) */}
            {(isProPlan || isSuperAdmin) && (
              <button
                type="button"
                onClick={handleExportCatalog}
                className="h-9 px-3 rounded-xl bg-white hover:bg-slate-50 border border-amber-200/80 text-amber-900 text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="Exportar inventario a Excel (.CSV)"
              >
                <FileSpreadsheet size={15} className="text-amber-600" />
                <span className="hidden sm:inline">Exportar Excel</span>
                <span className="sm:hidden">Excel</span>
              </button>
            )}

            <Link href={isLimitReached ? '/plans' : '/products/new'}>
              <button
                className={`text-white text-xs font-semibold px-3.5 h-9 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer ${
                  isLimitReached
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-[#059669] hover:bg-[#00855d]'
                }`}
              >
                {isLimitReached ? <Zap size={16} /> : <Plus size={16} />}
                <span>{isLimitReached ? 'Límite alcanzado' : 'Nuevo Producto'}</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Lista o Cuadrícula de Tarjetas de Productos */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-[#bccac0]/30 flex flex-col items-center gap-3 shadow-xs">
            <Package size={36} className="text-[#6d7a72]" />
            <p className="text-sm font-semibold text-[#0b1c30]">No se encontraron productos</p>
            <p className="text-xs text-[#6d7a72]">
              {products.length === 0
                ? 'Comienza a publicar tu catálogo para recibir pedidos.'
                : 'Intenta con otro término de búsqueda o cambia los filtros.'}
            </p>
            {products.length === 0 && (
              <Link href="/products/new">
                <button className="bg-[#059669] text-white text-xs font-semibold px-4 py-2 rounded-xl mt-1">
                  Publicar mi primer producto
                </button>
              </Link>
            )}
          </div>
        ) : viewMode === 'list' ? (
          /* ========================================================
             VISTA 1: LISTA HORIZONTAL (1 COLUMNA)
             ======================================================== */
          <div className="flex flex-col gap-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden border border-[#bccac0]/40 shadow-xs flex group relative transition-all hover:border-[#059669]/40"
              >
                {/* ÁREA CLICABLE: Abre DETALLE de Producto (/products/[id]) */}
                <Link
                  href={`/products/${product.id}`}
                  className="flex-1 flex min-w-0"
                >
                  {/* Product Thumbnail */}
                  <div className="w-[110px] aspect-square shrink-0 bg-[#e5eeff] overflow-hidden relative">
                    <img
                      src={product.imageUrl || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80'}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    {product.imageUrls && product.imageUrls.length > 1 && (
                      <span className="absolute bottom-1.5 left-1.5 bg-[#0b1c30]/75 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                        📷 {product.imageUrls.length}
                      </span>
                    )}
                  </div>

                  {/* Content Info */}
                  <div className="p-3.5 flex flex-col justify-between w-full min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-2 pr-1">
                        <h3 className="font-bold text-sm text-[#0b1c30] line-clamp-2 leading-snug">
                          {product.title}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                            product.inStock
                              ? 'bg-emerald-50 text-[#059669] border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {product.inStock ? 'Activo' : 'Pausado'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-base font-bold text-[#059669]">
                          {formatCurrency(product.price)}
                        </p>
                        {product.category && (
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {product.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Botones de acción inferiores */}
                <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 z-10 bg-white/95 backdrop-blur-xs p-1 rounded-xl shadow-2xs border border-gray-100">
                  {/* Botón Compartir en WhatsApp */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareProductWhatsApp(product);
                    }}
                    className="h-7 w-7 flex items-center justify-center rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors"
                    title="Compartir ficha en WhatsApp"
                  >
                    <Share2 size={14} />
                  </button>

                  {/* Custom Toggle Switch con sincronización en Firestore */}
                  <label
                    className="relative inline-flex items-center cursor-pointer px-1"
                    onClick={(e) => e.stopPropagation()}
                    title={product.inStock ? 'Pausar producto' : 'Activar producto'}
                  >
                    <input
                      type="checkbox"
                      checked={product.inStock}
                      onChange={() => handleToggleStock(product.id, product.inStock)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[6px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#059669]" />
                  </label>

                  {/* Editar producto */}
                  <Link
                    href={`/products/${product.id}/edit`}
                    className="h-7 w-7 flex items-center justify-center rounded-lg text-[#3d4a42] hover:bg-gray-100 transition-colors"
                    title="Editar producto"
                  >
                    <Pencil size={14} />
                  </Link>

                  {/* Eliminar producto */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProduct(product.id);
                    }}
                    className="h-7 w-7 flex items-center justify-center rounded-lg text-[#ba1a1a] hover:bg-red-50 transition-colors"
                    title="Eliminar producto"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ========================================================
             VISTA 2: CUADRÍCULA / GRID (2 COLUMNAS)
             ======================================================== */
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden border border-[#bccac0]/40 shadow-xs flex flex-col group relative transition-all hover:border-[#059669]/40"
              >
                {/* ÁREA CLICABLE: Abre DETALLE de Producto (/products/[id]) */}
                <Link
                  href={`/products/${product.id}`}
                  className="flex flex-col flex-1"
                >
                  {/* Thumbnail Cuadrado */}
                  <div className="w-full aspect-square bg-[#e5eeff] overflow-hidden relative">
                    <img
                      src={product.imageUrl || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80'}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    {/* Badge de Estado sobre la foto */}
                    <span
                      className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold shadow-xs backdrop-blur-xs ${
                        product.inStock
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-amber-500/90 text-white'
                      }`}
                    >
                      {product.inStock ? 'Activo' : 'Pausado'}
                    </span>

                    {product.imageUrls && product.imageUrls.length > 1 && (
                      <span className="absolute bottom-2 left-2 bg-[#0b1c30]/75 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                        📷 {product.imageUrls.length}
                      </span>
                    )}
                  </div>

                  {/* Informacion */}
                  <div className="p-3 flex flex-col gap-1">
                    <h3 className="font-bold text-xs text-[#0b1c30] line-clamp-1 leading-snug">
                      {product.title}
                    </h3>
                    <p className="text-sm font-bold text-[#059669]">
                      {formatCurrency(product.price)}
                    </p>
                    {product.category && (
                      <span className="text-[9px] text-slate-500 truncate max-w-full">
                        {product.category}
                      </span>
                    )}
                  </div>
                </Link>

                {/* Barra de Acciones en Grid */}
                <div className="p-2 pt-0 mt-auto border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                  {/* Switch de Stock */}
                  <label
                    className="relative inline-flex items-center cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                    title={product.inStock ? 'Pausar' : 'Activar'}
                  >
                    <input
                      type="checkbox"
                      checked={product.inStock}
                      onChange={() => handleToggleStock(product.id, product.inStock)}
                      className="sr-only peer"
                    />
                    <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#059669]" />
                  </label>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareProductWhatsApp(product);
                      }}
                      className="h-7 w-7 flex items-center justify-center rounded-lg text-emerald-700 hover:bg-emerald-100/60 transition-colors"
                      title="Compartir en WhatsApp"
                    >
                      <Share2 size={13} />
                    </button>
                    <Link
                      href={`/products/${product.id}/edit`}
                      className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-700 hover:bg-gray-200 transition-colors"
                      title="Editar"
                    >
                      <Pencil size={13} />
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProduct(product.id);
                      }}
                      className="h-7 w-7 flex items-center justify-center rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Nav Bar (Inicio, Productos, Ajustes) */}
      <nav className="fixed bottom-0 w-full z-50 bg-[#f8f9ff]/90 backdrop-blur-xl border-t border-[#bccac0]/30 shadow-[0_-1px_8px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom)]">
        <div className="h-16 flex items-center justify-around max-w-[640px] mx-auto">
          <Link
            href="/dashboard"
            className="flex flex-col items-center gap-1 text-[#6d7a72] hover:text-[#0b1c30]"
          >
            <Home size={20} />
            <span className="text-xs font-medium">Inicio</span>
          </Link>
          <Link
            href="/products"
            className="flex flex-col items-center gap-1 text-[#059669] font-semibold"
          >
            <Package size={20} />
            <span className="text-xs">Productos</span>
          </Link>
          <Link
            href="/settings"
            className="flex flex-col items-center gap-1 text-[#6d7a72] hover:text-[#0b1c30]"
          >
            <Settings size={20} />
            <span className="text-xs font-medium">Ajustes</span>
          </Link>
        </div>
      </nav>

      {/* Modal de Upgrade a Plan Negocio Pro para Exportar a Excel */}
      {showProUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 flex flex-col gap-4 text-center animate-in zoom-in-95 relative">
            <button
              type="button"
              onClick={() => setShowProUpgradeModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
              <FileSpreadsheet size={28} />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full mx-auto">
                ⭐ Plan Negocio Pro
              </span>
              <h3 className="text-lg font-extrabold text-[#0b1c30]">
                Exporta tu Catálogo a Excel
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Descarga todo tu inventario con precios, variantes, stock y enlaces en formato <strong>.CSV / Excel</strong> con 1 solo clic.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <Link href="/plans" className="w-full">
                <button
                  type="button"
                  className="w-full h-11 bg-[#059669] hover:bg-[#00855d] active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles size={16} />
                  <span>Ver Plan Negocio Pro (S/ 39.90)</span>
                </button>
              </Link>
              <button
                type="button"
                onClick={() => setShowProUpgradeModal(false)}
                className="w-full h-9 text-slate-500 text-xs font-semibold hover:text-slate-800"
              >
                Quizás más tarde
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
