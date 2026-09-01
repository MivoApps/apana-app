'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Home,
  Package,
  Settings,
  Lock,
  Eye,
  MessageSquare,
  Percent,
  Calendar,
  Sparkles,
  Crown,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  Download,
  Clock,
  Flame,
  ShoppingCart,
  CheckCircle2,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';
import { getStoreByUserIdFromFS, getStoreAnalyticsDays, getProductsByStoreIdFromFS, StoreAnalyticsDay } from '@/lib/firebase/firestore';
import { Store, Product } from '@/types/store';

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [store, setStore] = useState<Store | null>(null);
  const [analyticsData, setAnalyticsData] = useState<StoreAnalyticsDay[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeRange, setActiveRange] = useState<'7d' | '30d'>('7d');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const loadDataForRange = async (storeId: string, range: '7d' | '30d') => {
    setIsLoading(true);
    const daysCount = range === '30d' ? 30 : 7;
    const data = await getStoreAnalyticsDays(storeId, daysCount);
    setAnalyticsData(data);
    setIsLoading(false);
  };

  useEffect(() => {
    const loadAnalytics = async () => {
      if (authLoading) return;
      if (!user) {
        router.push('/login');
        return;
      }

      setIsLoading(true);
      const fsStore = await getStoreByUserIdFromFS(user.uid);
      if (!fsStore) {
        router.push('/store/setup');
        return;
      }

      setStore(fsStore);

      // Si tiene plan de pago, cargar analíticas (por defecto 30 días si es Pro, o 7 si es Emprendedor)
      if (fsStore.plan === 'negocio') {
        setActiveRange('30d');
        const data = await getStoreAnalyticsDays(fsStore.id, 30);
        setAnalyticsData(data);
      } else if (fsStore.plan === 'emprendedor') {
        setActiveRange('7d');
        const data = await getStoreAnalyticsDays(fsStore.id, 7);
        setAnalyticsData(data);
      }

      const prods = await getProductsByStoreIdFromFS(fsStore.id);
      setProducts(prods);
      setIsLoading(false);
    };

    loadAnalytics();
  }, [user, authLoading, router]);

  const handleRangeChange = (range: '7d' | '30d') => {
    if (!store) return;

    if (range === '30d') {
      if (store.plan === 'negocio') {
        setActiveRange('30d');
        loadDataForRange(store.id, '30d');
      } else {
        setShowUpgradeModal(true);
      }
    } else {
      setActiveRange('7d');
      loadDataForRange(store.id, '7d');
    }
  };

  // Motor de Exportación a Excel / CSV con UTF-8 BOM
  const handleExportExcel = () => {
    if (!store) return;

    const rows: string[][] = [
      ['REPORTE DE RENDIMIENTO COMERCIAL - APANA'],
      ['Tienda', store.name],
      ['Link público', `https://apana.app/s/${store.slug}`],
      ['Plan', store.plan === 'negocio' ? 'Plan Negocio Pro' : 'Plan Emprendedor'],
      ['Periodo analizado', activeRange === '30d' ? 'Últimos 30 días' : 'Últimos 7 días'],
      ['Fecha de emisión', new Date().toLocaleDateString('es-PE', { dateStyle: 'full' })],
      [],
      ['RESUMEN GENERAL'],
      ['Métrica', 'Valor'],
      ['Visitas totales a la tienda', totalVisits.toString()],
      ['Fichas de productos exploradas', totalProductViews.toString()],
      ['Productos agregados al carrito', totalCartAdds.toString()],
      ['Pedidos enviados a WhatsApp', totalClicks.toString()],
      ['Tasa de conversión global', `${conversionRate}%`],
      [],
      ['HISTORIAL DIARIO DETALLADO'],
      ['Fecha', 'Día', 'Visitas', 'Fichas Vistas', 'Agregados Carrito', 'Pedidos WhatsApp', 'Conversión %'],
      ...analyticsData.map(d => {
        const dConv = d.visits > 0 ? ((d.clicks / d.visits) * 100).toFixed(1) : '0.0';
        return [
          d.date,
          d.label,
          (d.visits || 0).toString(),
          (d.productViews || 0).toString(),
          (d.cartAdds || 0).toString(),
          (d.clicks || 0).toString(),
          `${dConv}%`
        ];
      }),
      [],
      ['PRODUCTOS MÁS POPULARES (RANKING)'],
      ['Posición', 'Producto', 'Categoría', 'Precio (PEN)', 'Vistas registradas'],
      ...products
        .slice()
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .map((p, i) => [
          (i + 1).toString(),
          p.title,
          p.category || 'General',
          p.price.toFixed(2),
          (p.views || 0).toString()
        ])
    ];

    const csvContent = '\uFEFF' + rows.map(r => r.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_apana_${store.slug}_${activeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && document.referrer && document.referrer.includes(window.location.host)) {
      router.back();
    } else {
      router.push('/dashboard');
    }
  };

  if (authLoading || (isLoading && !store)) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center text-[#0b1c30] gap-3">
        <div className="w-10 h-10 border-4 border-[#059669] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium text-[#6d7a72]">Cargando estadísticas...</span>
      </div>
    );
  }

  const currentPlan = store?.plan || 'gratis';
  const isFree = currentPlan === 'gratis';
  const isNegocio = currentPlan === 'negocio';

  // Cálculos de métricas reales
  const totalVisits = analyticsData.reduce((sum, d) => sum + (d.visits || 0), 0);
  const totalClicks = analyticsData.reduce((sum, d) => sum + (d.clicks || 0), 0);
  const rawProductViews = analyticsData.reduce((sum, d) => sum + (d.productViews || 0), 0);
  const rawCartAdds = analyticsData.reduce((sum, d) => sum + (d.cartAdds || 0), 0);

  const productsViewsSum = products.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalProductViews = Math.max(rawProductViews, productsViewsSum);
  const totalCartAdds = Math.max(rawCartAdds, totalClicks);

  const conversionRate = totalVisits > 0 ? Math.min((totalClicks / totalVisits) * 100, 100).toFixed(1) : '0.0';
  const maxVal = Math.max(...analyticsData.map(d => Math.max(d.visits, d.clicks)), 8);

  // Ratios de conversión del embudo comercial
  const pctViews = totalVisits > 0 ? Math.min(100, Math.round((totalProductViews / totalVisits) * 100)) : 0;
  const pctCart = totalProductViews > 0 ? Math.min(100, Math.round((totalCartAdds / totalProductViews) * 100)) : 0;
  const pctClicks = totalCartAdds > 0 ? Math.min(100, Math.round((totalClicks / totalCartAdds) * 100)) : 0;

  // Cálculo de Día y Horario Pico
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const dayActivityMap: number[] = [0, 0, 0, 0, 0, 0, 0];
  const hourActivityMap: Record<number, number> = {};

  analyticsData.forEach((d) => {
    const dayIdx = typeof d.dayOfWeek === 'number' ? d.dayOfWeek : new Date(d.date).getDay();
    dayActivityMap[dayIdx] += (d.visits || 0) + (d.clicks || 0) * 2;

    if (d.hourlyClicks) {
      Object.entries(d.hourlyClicks).forEach(([hr, count]) => {
        const h = parseInt(hr);
        hourActivityMap[h] = (hourActivityMap[h] || 0) + count * 2;
      });
    }
    if (d.hourlyVisits) {
      Object.entries(d.hourlyVisits).forEach(([hr, count]) => {
        const h = parseInt(hr);
        hourActivityMap[h] = (hourActivityMap[h] || 0) + count;
      });
    }
  });

  // Encontrar el día pico
  let peakDayIndex = 5; // Default Viernes
  let maxDayScore = -1;
  dayActivityMap.forEach((score, idx) => {
    if (score > maxDayScore) {
      maxDayScore = score;
      peakDayIndex = idx;
    }
  });
  const peakDayName = dayNames[peakDayIndex];

  // Encontrar el horario pico
  let peakHour = 19; // Default 7pm
  let maxHourScore = -1;
  Object.entries(hourActivityMap).forEach(([hr, score]) => {
    if (score > maxHourScore) {
      maxHourScore = score;
      peakHour = parseInt(hr);
    }
  });
  const peakHourRange = `${peakHour % 12 || 12}:00 ${peakHour >= 12 ? 'PM' : 'AM'} – ${(peakHour + 3) % 12 || 12}:00 ${peakHour + 3 >= 12 ? 'PM' : 'AM'}`;

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans relative pb-28">
      {/* App Bar Superior */}
      <header className="fixed top-0 w-full z-40 bg-[#f8f9ff]/80 backdrop-blur-xl border-b border-[#bccac0]/20">
        <div className="h-14 flex items-center justify-between px-4 max-w-[640px] mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-[#0b1c30] cursor-pointer"
              title="Volver"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-bold text-lg text-[#0b1c30]">Rendimiento</h1>
          </div>

          <div className="flex items-center gap-2">
            {isNegocio ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-900 text-xs font-extrabold shadow-2xs">
                <Crown size={13} className="text-amber-700 fill-amber-500" />
                <span>Negocio Pro</span>
              </span>
            ) : currentPlan === 'emprendedor' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#006c49] text-xs font-bold shadow-2xs">
                <Zap size={13} className="text-[#059669]" />
                <span>Emprendedor</span>
              </span>
            ) : null}

            <Link href="/settings" className="p-2 text-[#6d7a72] hover:text-[#0b1c30]">
              <Settings size={20} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-16 px-4 max-w-[640px] w-full mx-auto flex flex-col gap-6">

        {/* ============================================================ */}
        {/* CASO 1: PLAN GRATIS (PANTALLA DE PREVIEW Y DESBLOQUEO) */}
        {/* ============================================================ */}
        {isFree ? (
          <div className="flex flex-col gap-5 mt-2 animate-in fade-in">
            {/* Banner Principal de Desbloqueo */}
            <div className="bg-linear-to-b from-[#f5fff7] via-white to-white rounded-3xl p-6 sm:p-7 border-2 border-[#059669] shadow-lg flex flex-col items-center text-center gap-4 relative overflow-hidden">
              <div className="w-14 h-14 rounded-2xl bg-[#059669] text-white flex items-center justify-center shadow-md shadow-[#059669]/20">
                <TrendingUp size={28} />
              </div>

              <div className="flex flex-col gap-1.5 max-w-md">
                <span className="text-xs font-extrabold text-[#059669] uppercase tracking-wider">
                  Métricas y Estadísticas
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#0b1c30]">
                  Conoce cuántos clientes visitan tu tienda online
                </h2>
                <p className="text-xs sm:text-sm text-[#3d4a42] leading-relaxed mt-1">
                  Descubre qué días tienes más visitas, cuántos clientes te contactan por WhatsApp y cuáles son tus productos más vistos.
                </p>
              </div>

              <Link href="/plans" className="w-full max-w-xs mt-2">
                <button
                  type="button"
                  className="w-full h-12 bg-[#059669] hover:bg-[#00855d] text-white font-bold text-sm rounded-2xl shadow-md shadow-[#059669]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Sparkles size={16} />
                  <span>Desbloquear con Plan Emprendedor</span>
                </button>
              </Link>

              <span className="text-[11px] text-[#6d7a72]">
                Desde solo S/ 19.90 / mes • Cancela cuando quieras
              </span>
            </div>

            {/* Vista Previa Difuminada (Simulada de Muestra) */}
            <div className="flex flex-col gap-4 opacity-75 grayscale-[20%] pointer-events-none select-none">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-[#bccac0]/40 shadow-xs flex flex-col gap-1">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Eye size={18} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase mt-1">Visitas</span>
                  <span className="text-xl font-extrabold text-slate-850">142</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#bccac0]/40 shadow-xs flex flex-col gap-1">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <MessageSquare size={18} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase mt-1">WhatsApp</span>
                  <span className="text-xl font-extrabold text-slate-850">38</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#bccac0]/40 shadow-xs flex flex-col gap-1">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#059669] flex items-center justify-center">
                    <Percent size={16} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase mt-1">Conversión</span>
                  <span className="text-xl font-extrabold text-[#059669]">26.7%</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-[#bccac0]/40 shadow-xs flex flex-col gap-3">
                <h3 className="font-bold text-sm text-[#0b1c30]">Flujo de Visitas y Clics (Muestra)</h3>
                <div className="h-36 w-full flex justify-between items-end gap-2 px-1 pt-4 pb-2 border-b border-slate-100">
                  {[40, 65, 30, 85, 55, 90, 70].map((h, i) => (
                    <div key={i} className="flex-1 flex items-end justify-center gap-1.5 h-full">
                      <div className="w-3 bg-emerald-500 rounded-t-xs" style={{ height: `${h}%` }} />
                      <div className="w-3 bg-amber-400 rounded-t-xs" style={{ height: `${Math.round(h * 0.35)}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* CASO 2 Y 3: PLAN EMPRENDEDOR Y PLAN NEGOCIO PRO */
          /* ============================================================ */
          <div className="flex flex-col gap-6 animate-in fade-in">
            {/* VIP Banner y Botón de Exportación para Negocio Pro */}
            {isNegocio && (
              <div className="p-3.5 bg-linear-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Crown size={16} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs text-amber-950 truncate">Plan Negocio Pro Activo</span>
                    <span className="text-[10px] text-amber-900/80">Métricas avanzadas de conversión y 30 días desbloqueados.</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <Download size={13} />
                  <span>{exportSuccess ? '¡Descargado!' : 'Exportar a Excel (.csv)'}</span>
                </button>
              </div>
            )}

            {/* Selector de Rango Temporal */}
            <div className="bg-white p-1 rounded-xl border border-[#bccac0]/30 shadow-xs flex">
              <button
                type="button"
                onClick={() => handleRangeChange('7d')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeRange === '7d'
                  ? 'bg-emerald-50 text-[#059669] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                <Calendar size={14} />
                Últimos 7 días
              </button>

              <button
                type="button"
                onClick={() => handleRangeChange('30d')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeRange === '30d'
                  ? 'bg-amber-50 text-amber-900 shadow-xs ring-1 ring-amber-400/40 font-extrabold'
                  : isNegocio
                    ? 'text-slate-600 hover:text-amber-800'
                    : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                {!isNegocio && <Lock size={13} className="text-slate-400" />}
                {isNegocio && <Crown size={13} className="text-amber-600" />}
                <span>Últimos 30 días</span>
                {!isNegocio && (
                  <span className="text-[9px] font-extrabold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-md ml-0.5">
                    PRO
                  </span>
                )}
              </button>
            </div>

            {/* Tarjetas de KPIs */}
            <div className="grid grid-cols-3 gap-3">
              {/* Tarjeta Visitas */}
              <div className="bg-white p-4 rounded-2xl border border-[#bccac0]/40 shadow-xs flex flex-col gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Eye size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Visitas</span>
                  <span className="text-xl font-extrabold text-slate-850 mt-0.5">{totalVisits}</span>
                  <span className="text-[9px] text-slate-400 font-medium">
                    {activeRange === '30d' ? 'En 30 días' : 'En 7 días'}
                  </span>
                </div>
              </div>

              {/* Tarjeta Clics */}
              <div className="bg-white p-4 rounded-2xl border border-[#bccac0]/40 shadow-xs flex flex-col gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <MessageSquare size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">WhatsApp</span>
                  <span className="text-xl font-extrabold text-slate-850 mt-0.5">{totalClicks}</span>
                  <span className="text-[9px] text-slate-400 font-medium">Contactos directos</span>
                </div>
              </div>

              {/* Tarjeta Conversión */}
              <div className="bg-white p-4 rounded-2xl border border-[#bccac0]/40 shadow-xs flex flex-col gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#059669] flex items-center justify-center">
                  <Percent size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Conversión</span>
                  <span className="text-xl font-extrabold text-[#059669] mt-0.5">{conversionRate}%</span>
                  <span className="text-[9px] text-slate-400 font-medium">Visitas a pedidos</span>
                </div>
              </div>
            </div>

            {/* Gráfico Detallado */}
            <div className="bg-white rounded-2xl p-5 border border-[#bccac0]/40 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <h3 className="font-bold text-base text-[#0b1c30]">
                    {activeRange === '30d' ? 'Flujo Completo del Mes (30 días)' : 'Flujo Semanal de Clientes'}
                  </h3>
                  <p className="text-xs text-[#6d7a72]">Visualización de visitas vs. contactos por día.</p>
                </div>
                {activeRange === '30d' && (
                  <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    Mes Completo
                  </span>
                )}
              </div>

              {/* Gráfico de Barras */}
              <div className="flex flex-col gap-4">
                <div className="h-64 w-full flex justify-between items-end gap-1.5 sm:gap-3 px-1 pt-6 pb-2 border-b border-slate-100 relative overflow-x-auto">

                  {/* Líneas horizontales de guía */}
                  <div className="absolute inset-x-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none opacity-[0.07]">
                    <div className="w-full border-t border-slate-700" />
                    <div className="w-full border-t border-slate-700" />
                    <div className="w-full border-t border-slate-700" />
                    <div className="w-full border-t border-slate-700" />
                  </div>

                  {analyticsData.map((day, idx) => {
                    const visitsPct = (day.visits / maxVal) * 100;
                    const clicksPct = (day.clicks / maxVal) * 100;

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative min-w-[18px]">
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 bg-[#0b1c30] text-white text-[10px] py-1.5 px-3 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex flex-col gap-0.5 z-20 whitespace-nowrap">
                          <span className="font-bold border-b border-slate-700 pb-0.5 mb-0.5">{day.label}</span>
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
                            <span>Visitas: <b className="text-white">{day.visits}</b></span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full inline-block" />
                            <span>WhatsApp: <b className="text-white">{day.clicks}</b></span>
                          </div>
                        </div>

                        {/* Columnas de Gráfico */}
                        <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full max-w-[48px]">
                          {/* Barra Visitas */}
                          <div className="w-2 sm:w-2.5 bg-[#eff4ff] hover:bg-slate-200 transition-all rounded-t-xs relative h-full flex flex-col justify-end">
                            <div
                              className="w-full bg-emerald-600 rounded-t-xs shadow-xs transition-all duration-300"
                              style={{ height: `${Math.max(visitsPct, 2)}%` }}
                            />
                          </div>

                          {/* Barra Clics */}
                          <div className="w-2 sm:w-2.5 bg-[#fff8eb] hover:bg-slate-200 transition-all rounded-t-xs relative h-full flex flex-col justify-end">
                            <div
                              className="w-full bg-amber-500 rounded-t-xs shadow-xs transition-all duration-300"
                              style={{ height: `${Math.max(clicksPct, 2)}%` }}
                            />
                          </div>
                        </div>

                        {/* Leyenda de Fecha */}
                        <span className={`text-[9px] text-slate-500 font-semibold mt-2 text-center whitespace-nowrap ${activeRange === '30d' && idx % 3 !== 0 ? 'hidden sm:inline-block' : ''
                          }`}>
                          {day.label.split(' ')[0]}
                        </span>
                        <span className={`text-[8px] text-slate-400 font-bold ${activeRange === '30d' && idx % 3 !== 0 ? 'hidden sm:inline-block' : ''
                          }`}>
                          {day.label.split(' ')[1]}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Leyenda inferior */}
                <div className="flex justify-center gap-6 text-xs text-slate-500 font-medium pt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-emerald-600 rounded-xs inline-block" />
                    <span>Visitas la tienda online</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-amber-500 rounded-xs inline-block" />
                    <span>Clics de WhatsApp</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card: Embudo de Conversión Comercial (Funnel) */}
            <div className="bg-white rounded-2xl p-5 border border-[#bccac0]/40 shadow-xs flex flex-col gap-4 relative overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#059669] flex items-center justify-center">
                    <BarChart3 size={18} />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-bold text-base text-[#0b1c30]">Embudo de Conversión Comercial</h3>
                    <p className="text-xs text-[#6d7a72]">Paso a paso del cliente desde que entra hasta que envía el pedido.</p>
                  </div>
                </div>
                {isNegocio ? (
                  <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                    👑 Pro
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1">
                    <Lock size={10} />
                    Pro
                  </span>
                )}
              </div>

              {!isNegocio ? (
                /* Bloqueado para Emprendedor */
                <div className="flex flex-col gap-3 py-3 text-center items-center">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Lock size={22} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-bold text-slate-850">Función Exclusiva del Plan Negocio Pro</h4>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                      Conoce cuántos clientes pasan de ver tu menú a abrir fichas, agregar al carrito y contactarte por WhatsApp.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowUpgradeModal(true)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-transform active:scale-[0.98] cursor-pointer"
                  >
                    Desbloquear Embudo con Plan Pro
                  </button>
                </div>
              ) : (
                /* Activo para Negocio Pro */
                <div className="flex flex-col gap-4">
                  {/* Pasos del Embudo */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1">
                    {/* Paso 1: Visitas */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                        <span>1. Visitas</span>
                        <span className="text-blue-600">100%</span>
                      </div>
                      <span className="text-lg font-black text-[#0b1c30]">{totalVisits}</span>
                      <span className="text-[10px] text-slate-400">Entraron a la tienda</span>
                    </div>

                    {/* Paso 2: Vistas de Fichas */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                        <span>2. Exploraron</span>
                        <span className="text-emerald-600">{pctViews}%</span>
                      </div>
                      <span className="text-lg font-black text-[#0b1c30]">{totalProductViews}</span>
                      <span className="text-[10px] text-slate-400">Vieron fichas de producto</span>
                    </div>

                    {/* Paso 3: Agregados al Carrito */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                        <span>3. Carrito</span>
                        <span className="text-amber-600">{pctCart}%</span>
                      </div>
                      <span className="text-lg font-black text-[#0b1c30]">{totalCartAdds}</span>
                      <span className="text-[10px] text-slate-400">Agregaron al pedido</span>
                    </div>

                    {/* Paso 4: WhatsApp */}
                    <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/70 flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11px] text-emerald-800 font-bold">
                        <span>4. WhatsApp</span>
                        <span className="text-[#059669] font-extrabold">{conversionRate}%</span>
                      </div>
                      <span className="text-lg font-black text-emerald-950">{totalClicks}</span>
                      <span className="text-[10px] text-emerald-700/80">Pedidos completados</span>
                    </div>
                  </div>

                  {/* Diagnóstico Comercial */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-2.5 text-xs text-slate-600 leading-relaxed">
                    <CheckCircle2 size={16} className="text-[#059669] shrink-0" />
                    <span>
                      {totalVisits === 0
                        ? 'Comparte el link de tu tienda para comenzar a registrar el flujo de tus primeros clientes.'
                        : `El ${pctViews}% de tus visitantes examina tus productos en detalle y tu tasa de cierre final a WhatsApp es del ${conversionRate}%.`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Card: Horarios y Días Pico */}
            <div className="bg-white rounded-2xl p-5 border border-[#bccac0]/40 shadow-xs flex flex-col gap-4 relative overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Clock size={18} />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-bold text-base text-[#0b1c30]">Horarios y Días Pico de Clientes</h3>
                    <p className="text-xs text-[#6d7a72]">Momentos de mayor afluencia de visitas y pedidos a tu tienda.</p>
                  </div>
                </div>
                {isNegocio ? (
                  <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                    👑 Pro
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1">
                    <Lock size={10} />
                    Pro
                  </span>
                )}
              </div>

              {!isNegocio ? (
                /* Bloqueado para Emprendedor */
                <div className="flex flex-col gap-3 py-3 text-center items-center">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Lock size={22} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-bold text-slate-850">Función Exclusiva del Plan Negocio Pro</h4>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                      Descubre con exactitud qué días y a qué horas tus clientes tienen mayor intención de compra para preparar tu stock.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowUpgradeModal(true)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-transform active:scale-[0.98] cursor-pointer"
                  >
                    Desbloquear Horarios Pico con Plan Pro
                  </button>
                </div>
              ) : (
                /* Activo para Negocio Pro */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs font-bold">
                      <Flame size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">Día con Mayor Actividad</span>
                      <span className="text-base font-extrabold text-[#0b1c30]">{peakDayName}</span>
                      <span className="text-[10px] text-slate-500">Mayor volumen de visitas y consultas</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/70 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs font-bold">
                      <Clock size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">Horario Estelar de Pedidos</span>
                      <span className="text-base font-extrabold text-[#0b1c30]">{peakHourRange}</span>
                      <span className="text-[10px] text-slate-500">Horario de mayor conversión de WhatsApp</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Ranking de Productos Populares */}
            <div className="bg-white rounded-2xl p-5 border border-[#bccac0]/40 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex flex-col gap-0.5">
                  <h3 className="font-bold text-base text-[#0b1c30]">Productos más Populares</h3>
                  <p className="text-xs text-[#6d7a72]">Artículos con mayor interés y visualizaciones en tu tienda online.</p>
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  Top Ranking
                </span>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-medium">
                  No hay productos registrados para mostrar estadísticas.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {(() => {
                    const sortedProducts = [...products]
                      .sort((a, b) => (b.views || 0) - (a.views || 0))
                      .slice(0, isNegocio ? 8 : 4);

                    return sortedProducts.map((product, idx) => {
                      const defaultImage = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80';
                      const imageUrl = product.imageUrl || (product.imageUrls && product.imageUrls[0]) || defaultImage;
                      const views = product.views || 0;

                      return (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-[#f8f9ff]/50 hover:bg-[#f8f9ff] transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-extrabold ${idx === 0 ? 'bg-amber-100 text-amber-700' :
                              idx === 1 ? 'bg-slate-100 text-slate-600' :
                                idx === 2 ? 'bg-orange-100 text-orange-700' :
                                  'bg-gray-100 text-gray-500'
                              }`}>
                              {idx + 1}
                            </span>

                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200/50 bg-white shrink-0">
                              <img
                                src={imageUrl}
                                alt={product.title}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="min-w-0 flex flex-col">
                              <span className="text-xs font-bold text-[#0b1c30] truncate">{product.title}</span>
                              <span className="text-[10px] text-slate-400 font-semibold truncate">
                                {product.category || 'Sin categoría'}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end shrink-0 pl-3">
                            <span className="text-xs font-extrabold text-[#0b1c30]">{views}</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">vistas</span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal de Upgrade a Negocio Pro (para 30 días) */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full relative z-10 border border-slate-100 shadow-2xl flex flex-col items-center text-center gap-4 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-xs">
              <Crown size={28} />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full self-center">
                Plan Negocio Pro
              </span>
              <h3 className="font-bold text-lg text-slate-850 mt-1">
                ¿Deseas ver el mes completo?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                El historial detallado de 30 días, analíticas completas del mes y productos ilimitados están disponibles en el <strong>Plan Negocio Pro</strong>.
              </p>
            </div>

            <div className="flex flex-col w-full gap-2 mt-1">
              <Link href="/plans" className="w-full">
                <button
                  type="button"
                  className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-amber-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Mejorar a Plan Negocio (S/ 39.90)</span>
                  <ArrowRight size={14} />
                </button>
              </Link>

              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="w-full h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
              >
                Continuar con 7 días
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav Fija */}
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
