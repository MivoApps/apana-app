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
  Calendar 
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';
import { getStoreByUserIdFromFS, getStoreAnalyticsLast7Days, getProductsByStoreIdFromFS } from '@/lib/firebase/firestore';
import { Store, Product } from '@/types/store';

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [store, setStore] = useState<Store | null>(null);
  const [analyticsData, setAnalyticsData] = useState<{ date: string; label: string; visits: number; clicks: number }[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeRange, setActiveRange] = useState<'7d' | '30d'>('7d');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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

      // Validar si tiene el plan que lo permite
      if (fsStore.plan !== 'emprendedor') {
        router.push('/dashboard');
        return;
      }

      setStore(fsStore);
      const data = await getStoreAnalyticsLast7Days(fsStore.id);
      setAnalyticsData(data);

      const prods = await getProductsByStoreIdFromFS(fsStore.id);
      setProducts(prods);
      setIsLoading(false);
    };

    loadAnalytics();
  }, [user, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center text-[#0b1c30] gap-3">
        <div className="w-10 h-10 border-4 border-[#059669] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium text-[#6d7a72]">Cargando estadísticas...</span>
      </div>
    );
  }

  // Cálculos de resumen
  const totalVisits = analyticsData.reduce((sum, d) => sum + d.visits, 0);
  const totalClicks = analyticsData.reduce((sum, d) => sum + d.clicks, 0);
  const conversionRate = totalVisits > 0 ? Math.min((totalClicks / totalVisits) * 100, 100).toFixed(1) : '0.0';

  // Buscar el valor máximo para escalar la altura de las barras
  const maxVal = Math.max(...analyticsData.map(d => Math.max(d.visits, d.clicks)), 8);

  const handleRangeChange = (range: '7d' | '30d') => {
    if (range === '30d') {
      setShowUpgradeModal(true);
    } else {
      setActiveRange('7d');
    }
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && document.referrer && document.referrer.includes(window.location.host)) {
      router.back();
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans relative pb-28">
      {/* App Bar Superior */}
      <header className="fixed top-0 w-full z-40 bg-[#f8f9ff]/80 backdrop-blur-xl border-b border-[#bccac0]/20">
        <div className="h-14 flex items-center justify-between px-4 max-w-[640px] mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-[#0b1c30]"
              title="Volver"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-bold text-lg text-[#0b1c30]">Rendimiento</h1>
          </div>
          <Link href="/settings" className="p-2 text-[#6d7a72] hover:text-[#0b1c30]">
            <Settings size={20} />
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-16 px-4 max-w-[640px] w-full mx-auto flex flex-col gap-6">
        
        {/* Selector de Rango Temporal */}
        <div className="bg-white p-1 rounded-xl border border-[#bccac0]/30 shadow-xs flex">
          <button
            onClick={() => handleRangeChange('7d')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeRange === '7d'
                ? 'bg-emerald-50 text-[#059669] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar size={14} />
            Últimos 7 días
          </button>
          <button
            onClick={() => handleRangeChange('30d')}
            className="flex-1 py-2 text-xs font-bold rounded-lg text-slate-400 hover:text-slate-600 transition-all flex items-center justify-center gap-1.5"
          >
            <Lock size={13} className="text-slate-400" />
            Últimos 30 días
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
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Visitas</span>
                <div className="relative group/tooltip flex items-center">
                  <svg className="w-3 h-3 text-slate-400 cursor-help flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover/tooltip:block bg-slate-900/95 text-white text-[9px] leading-relaxed p-2 rounded-lg shadow-md w-36 z-30 font-medium normal-case tracking-normal">
                    Clientes únicos que abrieron tu catálogo.
                  </div>
                </div>
              </div>
              <span className="text-xl font-extrabold text-slate-850 mt-0.5">{totalVisits}</span>
            </div>
          </div>

          {/* Tarjeta Clics */}
          <div className="bg-white p-4 rounded-2xl border border-[#bccac0]/40 shadow-xs flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <MessageSquare size={18} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">WhatsApp</span>
                <div className="relative group/tooltip flex items-center">
                  <svg className="w-3 h-3 text-slate-400 cursor-help flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/tooltip:block bg-slate-900/95 text-white text-[9px] leading-relaxed p-2 rounded-lg shadow-md w-36 z-30 font-medium normal-case tracking-normal text-center">
                    Clics en tu WhatsApp o pedidos enviados.
                  </div>
                </div>
              </div>
              <span className="text-xl font-extrabold text-slate-850 mt-0.5">{totalClicks}</span>
            </div>
          </div>

          {/* Tarjeta Conversión */}
          <div className="bg-white p-4 rounded-2xl border border-[#bccac0]/40 shadow-xs flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#059669] flex items-center justify-center">
              <Percent size={16} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Conversión</span>
                <div className="relative group/tooltip flex items-center">
                  <svg className="w-3 h-3 text-slate-400 cursor-help flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="absolute bottom-full right-0 mb-1.5 hidden group-hover/tooltip:block bg-slate-900/95 text-white text-[9px] leading-relaxed p-2 rounded-lg shadow-md w-40 z-30 font-medium normal-case tracking-normal">
                    Porcentaje de visitas que te contactaron (máx. 100%).
                  </div>
                </div>
              </div>
              <span className="text-xl font-extrabold text-[#059669] mt-0.5">{conversionRate}%</span>
            </div>
          </div>
        </div>

        {/* Gráfico Detallado */}
        <div className="bg-white rounded-2xl p-5 border border-[#bccac0]/40 shadow-xs flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-base text-[#0b1c30]">Flujo de Clientes Diarios</h3>
            <p className="text-xs text-[#6d7a72]">Visualización de visitas vs. contactos por día.</p>
          </div>

          {/* Gráfico de Barras Estilizado */}
          <div className="flex flex-col gap-4">
            <div className="h-64 w-full flex justify-between items-end gap-3 px-1 pt-6 pb-2 border-b border-slate-100 relative">
              
              {/* Líneas horizontales de guía (Grid lines) */}
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
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip con estilos premium */}
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
                    <div className="w-full flex items-end justify-center gap-2 h-full max-w-[48px]">
                      {/* Barra Visitas */}
                      <div 
                        className="w-2.5 bg-[#eff4ff] hover:bg-slate-200 transition-all rounded-t-xs relative h-full flex flex-col justify-end"
                      >
                        <div 
                          className="w-full bg-emerald-600 rounded-t-xs shadow-xs"
                          style={{ height: `${Math.max(visitsPct, 2)}%` }}
                        />
                      </div>
                      
                      {/* Barra Clics */}
                      <div 
                        className="w-2.5 bg-[#fff8eb] hover:bg-slate-200 transition-all rounded-t-xs relative h-full flex flex-col justify-end"
                      >
                        <div 
                          className="w-full bg-amber-500 rounded-t-xs shadow-xs"
                          style={{ height: `${Math.max(clicksPct, 2)}%` }}
                        />
                      </div>
                    </div>

                    {/* Leyenda de Fecha */}
                    <span className="text-[10px] text-slate-500 font-semibold mt-3 text-center whitespace-nowrap">
                      {day.label.split(' ')[0]}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold">
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
                <span>Visitas al catálogo</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-amber-500 rounded-xs inline-block" />
                <span>Clics de WhatsApp</span>
              </div>
            </div>
          </div>
        </div>

        {/* Productos más vistos / populares */}
        <div className="bg-white rounded-2xl p-5 border border-[#bccac0]/40 shadow-xs flex flex-col gap-4">
          <div className="flex flex-col gap-1 pb-2 border-b border-gray-100">
            <h3 className="font-bold text-base text-[#0b1c30]">Productos más Populares</h3>
            <p className="text-xs text-[#6d7a72]">Los artículos con mayor número de visualizaciones en tu catálogo.</p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs font-medium">
              No hay productos registrados para mostrar estadísticas.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {(() => {
                // Ordenar productos por visitas desc y tomar los 3 principales
                const sortedProducts = [...products]
                  .sort((a, b) => (b.views || 0) - (a.views || 0))
                  .slice(0, 3);

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
                        {/* Indicador de puesto (1, 2, 3) */}
                        <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-extrabold ${
                          idx === 0 ? 'bg-amber-100 text-amber-700' :
                          idx === 1 ? 'bg-slate-100 text-slate-600' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {idx + 1}
                        </span>
                        
                        {/* Miniatura de Imagen */}
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200/50 bg-white flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={imageUrl} 
                            alt={product.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Título y Categoría */}
                        <div className="min-w-0 flex flex-col">
                          <span className="text-xs font-bold text-[#0b1c30] truncate">{product.title}</span>
                          <span className="text-[10px] text-slate-400 font-semibold truncate">
                            {product.category || 'Sin categoría'}
                          </span>
                        </div>
                      </div>

                      {/* Contador de vistas */}
                      <div className="flex flex-col items-end flex-shrink-0 pl-3">
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
      </main>

      {/* Modal de Upgrade Teaser Premium */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" 
            onClick={() => setShowUpgradeModal(false)}
          />
          {/* Card */}
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full relative z-10 border border-slate-100 shadow-xl flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shadow-xs">
              <Lock size={28} />
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="font-bold text-lg text-slate-850">¿Quieres ver el mes completo?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                El historial detallado de 30 días, estadísticas avanzadas y el top de productos más vistos estarán disponibles próximamente en nuestro plan corporativo superior.
              </p>
            </div>
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors mt-2"
            >
              Entendido
            </button>
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
