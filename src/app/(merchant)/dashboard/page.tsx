'use client';

import React from 'react';
import Link from 'next/link';
import {
  Store as StoreIcon,
  QrCode,
  ExternalLink,
  Settings,
  Package,
  Plus,
  ShoppingBag,
  Home,
  Copy,
  Check,
  Share2,
  Sparkles,
  Power,
  TrendingUp,
  Crown,
  ShieldCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';
import { useAppStore } from '@/lib/app-store';
import { getStoreByUserIdFromFS, getProductsByStoreIdFromFS, createOrUpdateStoreInFS } from '@/lib/firebase/firestore';
import { StorePreviewModal } from '@/components/ui/StorePreviewModal';
import { Store, Product } from '@/types/store';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const { stores, activeStoreSlug } = useAppStore();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [fsStore, setFsStore] = React.useState<Store | null>(null);
  const [fsProducts, setFsProducts] = React.useState<Product[]>([]);
  const [analyticsData, setAnalyticsData] = React.useState<{ label: string; visits: number; clicks: number }[]>([]);
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = React.useState(false);

  React.useEffect(() => {
    const checkAuthAndSync = async () => {
      if (authLoading) return;

      // 1. Si no hay usuario autenticado en Firebase ➔ Redirigir a Login
      if (!user) {
        router.push('/login');
        return;
      }

      // Si es el SuperAdmin (Dueño de APANA) ➔ Redirigir automáticamente a la consola de administración
      if (user.email?.toLowerCase().trim() === 'angelocastellanos99@gmail.com') {
        router.push('/admin');
        return;
      }

      setIsLoading(true);
      // 2. Consultar si tiene tienda creada en Firestore
      const storeFromFS = await getStoreByUserIdFromFS(user.uid);

      if (!storeFromFS) {
        // Si el usuario existe pero borró/no tiene tienda ➔ Redirigir al Wizard de Setup
        router.push('/store/setup');
        return;
      }

      setFsStore(storeFromFS);
      const productsFromFS = await getProductsByStoreIdFromFS(storeFromFS.id);
      setFsProducts(productsFromFS);

      // Cargar analíticas de los últimos 7 días si es Plan Emprendedor
      if (storeFromFS.plan === 'emprendedor') {
        const { getStoreAnalyticsLast7Days } = await import('@/lib/firebase/firestore');
        const data = await getStoreAnalyticsLast7Days(storeFromFS.id);
        setAnalyticsData(data);
      }

      setIsLoading(false);
    };

    checkAuthAndSync();
  }, [user, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center text-[#0b1c30] gap-3">
        <div className="w-10 h-10 border-4 border-[#059669] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium text-[#6d7a72]">Cargando panel...</span>
      </div>
    );
  }

  const activeStore = fsStore;
  const storeName = activeStore?.name || '';
  const storeSlug = activeStore?.slug || '';
  const isStoreActive = activeStore?.status !== 'pausada';
  const activeProductsCount = fsProducts.length;
  const isFreePlan = fsStore?.plan !== 'emprendedor';
  const maxProducts = isFreePlan ? 25 : 250;
  const productsPercentage = Math.min((activeProductsCount / maxProducts) * 100, 100);

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/s/${storeSlug}`
    : `https://apana.app/s/${storeSlug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = `¡Hola! Te invito a visitar mi tienda digital en APANA y hacer tus pedidos directamente aquí: ${publicUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleToggleStoreStatus = async () => {
    if (!user || !fsStore || isTogglingStatus) return;
    setIsTogglingStatus(true);
    const newStatus = isStoreActive ? 'pausada' : 'activa';
    try {
      const updated = await createOrUpdateStoreInFS(user.uid, {
        name: fsStore.name,
        slug: fsStore.slug,
        whatsappPhone: fsStore.whatsappPhone,
        themeStyle: fsStore.themeStyle,
        primaryColor: fsStore.primaryColor,
        description: fsStore.description,
        categories: fsStore.categories,
        status: newStatus
      });
      setFsStore(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans relative pb-28">
      {/* App Bar Superior */}
      <header className="fixed top-0 w-full z-40 bg-[#f8f9ff]/80 backdrop-blur-xl border-b border-[#bccac0]/20">
        <div className="h-14 flex items-center justify-between px-4 max-w-[640px] mx-auto">
          <h1 className="font-bold text-lg text-[#0b1c30]">Inicio</h1>
          <div className="flex items-center gap-1">
            {/* Solo visible para el Propietario SuperAdmin */}
            {user?.email?.toLowerCase().trim() === 'angelocastellanos99@gmail.com' && (
              <Link
                href="/admin"
                title="Panel SuperAdmin (Propietario)"
                className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1"
              >
                <ShieldCheck size={20} className="text-[#059669]" />
              </Link>
            )}
            <Link href="/settings" className="p-2 text-[#6d7a72] hover:text-[#0b1c30]">
              <Settings size={20} />
            </Link>
            {user && (
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="p-2 text-red-500 hover:text-red-700 transition-colors"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-16 px-4 max-w-[640px] w-full mx-auto flex flex-col gap-5">
        {/* Card Principal de la Tienda */}
        <div className="bg-white p-5 rounded-2xl border border-[#bccac0]/40 shadow-xs flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                style={{ backgroundColor: activeStore?.primaryColor || '#059669' }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-xs shrink-0"
              >
                <StoreIcon size={24} />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-lg text-[#0b1c30] leading-tight truncate">{storeName}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-[#6d7a72] font-mono">/s/{storeSlug}</span>
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#059669] hover:underline"
                  >
                    {copiedLink ? <Check size={12} /> : <Copy size={12} />}
                    {copiedLink ? '¡Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>
            </div>

            {/* Toggle de Estado: Activa / Pausada */}
            <button
              onClick={handleToggleStoreStatus}
              disabled={isTogglingStatus}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs border ${
                isStoreActive
                  ? 'bg-emerald-50 text-[#059669] border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              }`}
              title={isStoreActive ? 'Hacer clic para pausar tienda' : 'Hacer clic para activar tienda'}
            >
              <span className={`w-2 h-2 rounded-full ${isStoreActive ? 'bg-[#059669] animate-pulse' : 'bg-amber-500'}`} />
              {isStoreActive ? 'Tienda Abierta' : 'En Pausa'}
            </button>
          </div>

          {/* Acciones de Difusión Rápida */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
            <Button
              variant="secondary"
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center justify-center gap-1.5 h-10 text-xs font-semibold px-2"
            >
              <ExternalLink size={15} />
              Ver Tienda
            </Button>
            <Link href="/qr" className="w-full">
              <Button variant="secondary" fullWidth className="flex items-center justify-center gap-1.5 h-10 text-xs font-semibold px-2">
                <QrCode size={15} />
                Código QR
              </Button>
            </Link>
            <Button
              variant="secondary"
              onClick={handleShareWhatsApp}
              className="flex items-center justify-center gap-1.5 h-10 text-xs font-semibold px-2 bg-emerald-50 text-[#006c49] border-emerald-200 hover:bg-emerald-100"
            >
              <Share2 size={15} />
              Compartir
            </Button>
          </div>
        </div>

        {/* Modal de Previsualización en Vivo de la Tienda */}
        <StorePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          storeSlug={storeSlug}
        />

        {/* Métrica / Resumen de Capacidad del Catálogo */}
        <div className="bg-white p-5 rounded-2xl border border-[#bccac0]/40 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#e5eeff] text-[#059669] rounded-xl flex items-center justify-center">
                <Package size={20} />
              </div>
              <div>
                <span className="text-xs font-medium text-[#6d7a72]">Productos en Catálogo</span>
                <p className="text-lg font-bold text-[#0b1c30]">
                  {activeProductsCount} / {maxProducts} disponibles
                </p>
              </div>
            </div>
            <Link href="/products">
              <span className="text-xs font-bold text-[#059669] hover:underline flex items-center gap-1">
                Gestionar →
              </span>
            </Link>
          </div>

          {/* Barra de Progreso de Capacidad */}
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  activeProductsCount >= maxProducts ? 'bg-amber-500' : 'bg-[#059669]'
                }`}
                style={{ width: `${productsPercentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-[#6d7a72]">
              <span>{isFreePlan ? 'Plan Gratis (Hasta 25 productos)' : 'Plan Emprendedor (Hasta 250 productos)'}</span>
              {activeProductsCount >= maxProducts ? (
                <Link href="/plans" className="font-bold text-amber-700 hover:underline">
                  Límite alcanzado • Mejorar plan ↗
                </Link>
              ) : (
                <span>Quedan {Math.max(maxProducts - activeProductsCount, 0)} espacios</span>
              )}
            </div>
          </div>
        </div>

        {/* Sección de Estadísticas (Últimos 7 días) */}
        <section className="bg-white rounded-2xl p-5 border border-[#bccac0]/40 shadow-xs flex flex-col gap-4 relative overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#059669] flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2" />
                </svg>
              </div>
              <h3 className="font-bold text-base text-[#0b1c30]">Estadísticas de la Tienda</h3>
            </div>
            {fsStore?.plan !== 'emprendedor' ? (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1">
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Top
              </span>
            ) : (
              <Link href="/analytics" className="text-xs font-semibold text-[#059669] hover:underline">
                Ver más →
              </Link>
            )}
          </div>

          {fsStore?.plan !== 'emprendedor' ? (
            /* ESTADO BLOQUEADO (Plan Gratis) */
            <div className="relative py-4 flex flex-col items-center text-center">
              {/* Gráfico difuminado de fondo */}
              <div className="absolute inset-0 flex justify-around items-end opacity-[0.06] blur-[2px] px-8 pb-10 pointer-events-none">
                <div className="w-5 bg-emerald-600 h-24 rounded-t-sm" />
                <div className="w-5 bg-amber-500 h-10 rounded-t-sm" />
                <div className="w-5 bg-emerald-600 h-36 rounded-t-sm" />
                <div className="w-5 bg-amber-500 h-16 rounded-t-sm" />
                <div className="w-5 bg-emerald-600 h-28 rounded-t-sm" />
                <div className="w-5 bg-amber-500 h-8 rounded-t-sm" />
                <div className="w-5 bg-emerald-600 h-44 rounded-t-sm" />
              </div>

              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="flex flex-col gap-1 px-4">
                  <h4 className="text-sm font-bold text-slate-800">Estadísticas de Visitas y Clics</h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                    Monitorea cuántas personas entran a tu tienda digital y cuántos clientes hacen clic en tu botón de WhatsApp para contactarte.
                  </p>
                </div>
                <Link href="/plans">
                  <span className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-transform active:scale-[0.98] inline-block cursor-pointer">
                    Mejorar al Plan Emprendedor
                  </span>
                </Link>
              </div>
            </div>
          ) : (
            /* ESTADO ACTIVO (Plan Emprendedor) */
            <div className="flex flex-col gap-5">
              {/* Resumen numérico */}
              {(() => {
                const totalVisits = analyticsData.reduce((sum, d) => sum + d.visits, 0);
                const totalClicks = analyticsData.reduce((sum, d) => sum + d.clicks, 0);
                const convRate = totalVisits > 0 ? Math.min((totalClicks / totalVisits) * 100, 100).toFixed(1) : '0.0';

                return (
                  <div className="grid grid-cols-3 gap-2 bg-[#f8f9ff] p-3 rounded-xl border border-slate-100">
                    <div className="flex flex-col text-center">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase">Visitas</span>
                      <span className="text-base font-bold text-slate-800">{totalVisits}</span>
                    </div>
                    <div className="flex flex-col text-center border-x border-slate-200">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase">WhatsApp</span>
                      <span className="text-base font-bold text-slate-800">{totalClicks}</span>
                    </div>
                    <div className="flex flex-col text-center">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase">Conversión</span>
                      <span className="text-base font-bold text-[#059669]">{convRate}%</span>
                    </div>
                  </div>
                );
              })()}

              {/* Gráfico */}
              {(() => {
                const maxVal = Math.max(...analyticsData.map(d => Math.max(d.visits, d.clicks)), 8);

                return (
                  <div className="flex flex-col gap-3">
                    <div className="h-44 w-full flex justify-between items-end gap-2 px-1 pt-4 pb-2 border-b border-slate-100">
                      {analyticsData.map((day, idx) => {
                        const visitsPct = (day.visits / maxVal) * 100;
                        const clicksPct = (day.clicks / maxVal) * 100;

                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                            {/* Tooltip on hover */}
                            <div className="absolute bottom-full mb-1 bg-[#0b1c30] text-white text-[9px] py-1 px-2 rounded-md shadow-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex flex-col gap-0.5 z-20 whitespace-nowrap">
                              <span className="font-bold">{day.label}</span>
                              <span>Visitas: {day.visits}</span>
                              <span>Clics: {day.clicks}</span>
                            </div>

                            {/* Las dos columnas */}
                            <div className="w-full flex items-end justify-center gap-1.5 h-full max-w-[44px]">
                              {/* Columna Visitas */}
                              <div
                                className="w-2 bg-[#eff4ff] hover:bg-slate-200 transition-all rounded-t-sm relative h-full flex flex-col justify-end"
                                title={`Visitas: ${day.visits}`}
                              >
                                <div
                                  className="w-full bg-emerald-600 rounded-t-sm"
                                  style={{ height: `${Math.max(visitsPct, 2)}%` }}
                                />
                              </div>
                              {/* Columna Clics */}
                              <div
                                className="w-2 bg-[#fff8eb] hover:bg-slate-200 transition-all rounded-t-sm relative h-full flex flex-col justify-end"
                                title={`WhatsApp: ${day.clicks}`}
                              >
                                <div
                                  className="w-full bg-amber-500 rounded-t-sm"
                                  style={{ height: `${Math.max(clicksPct, 2)}%` }}
                                />
                              </div>
                            </div>

                            {/* Etiqueta del día */}
                            <span className="text-[9px] text-slate-500 font-semibold mt-2 text-center whitespace-nowrap">
                              {day.label.split(' ')[0]}
                            </span>
                            <span className="text-[8px] text-slate-400 font-bold">
                              {day.label.split(' ')[1]}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Leyenda */}
                    <div className="flex justify-center gap-4 text-[10px] text-slate-500 font-semibold pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-emerald-600 rounded-xs inline-block" />
                        <span>Visitas</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-amber-500 rounded-xs inline-block" />
                        <span>Clics de WhatsApp</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </section>

        {/* Accesos Rápidos de Gestión */}
        <div className="flex flex-col gap-3">
          <h3 className="font-bold text-base text-[#0b1c30]">Acciones Frecuentes</h3>
          <div className="grid grid-cols-3 gap-2.5">
            <Link href="/products/new" className="bg-white p-3.5 rounded-2xl border border-[#bccac0]/40 hover:border-[#059669] transition-all flex flex-col gap-1.5 shadow-2xs group">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus size={18} />
              </div>
              <span className="text-xs font-bold text-[#0b1c30] leading-tight">Nuevo Producto</span>
              <span className="text-[10px] text-[#6d7a72] leading-tight">Publicar catálogo</span>
            </Link>

            <Link href="/settings" className="bg-white p-3.5 rounded-2xl border border-[#bccac0]/40 hover:border-[#059669] transition-all flex flex-col gap-1.5 shadow-2xs group">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Settings size={18} />
              </div>
              <span className="text-xs font-bold text-[#0b1c30] leading-tight">Personalizar</span>
              <span className="text-[10px] text-[#6d7a72] leading-tight">Estilo y colores</span>
            </Link>

            <Link href="/plans" className="bg-white p-3.5 rounded-2xl border border-[#bccac0]/40 hover:border-amber-500 transition-all flex flex-col gap-1.5 shadow-2xs group">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Crown size={18} />
              </div>
              <span className="text-xs font-bold text-[#0b1c30] leading-tight">Planes</span>
              <span className="text-[10px] text-amber-800 font-medium leading-tight">
                {fsStore?.plan === 'emprendedor' ? 'Plan Activo' : 'Ver Beneficios'}
              </span>
            </Link>
          </div>
        </div>
      </main>

      {/* Bottom Nav Fija (Inicio, Productos, Ajustes) */}
      <nav className="fixed bottom-0 w-full z-50 bg-[#f8f9ff]/90 backdrop-blur-xl border-t border-[#bccac0]/30 shadow-[0_-1px_8px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom)]">
        <div className="h-16 flex items-center justify-around max-w-[640px] mx-auto">
          <Link
            href="/dashboard"
            className="flex flex-col items-center gap-1 text-[#059669] font-semibold"
          >
            <Home size={20} />
            <span className="text-xs">Inicio</span>
          </Link>
          <Link
            href="/products"
            className="flex flex-col items-center gap-1 text-[#6d7a72] hover:text-[#0b1c30]"
          >
            <Package size={20} />
            <span className="text-xs font-medium">Productos</span>
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
    </div>
  );
}
