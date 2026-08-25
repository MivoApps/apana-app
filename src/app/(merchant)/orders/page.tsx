'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ShoppingBag, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Home, 
  Package, 
  Settings,
  FileSpreadsheet,
  Sparkles,
  X,
  User,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/firebase/auth-context';
import { getStoreByUserIdFromFS, getStoreOrdersFromFS, StoreOrder } from '@/lib/firebase/firestore';
import { Store } from '@/types/store';
import { exportOrdersToCSV } from '@/lib/excel-export';
import { formatCurrency } from '@/lib/whatsapp';

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showProUpgradeModal, setShowProUpgradeModal] = useState(false);

  useEffect(() => {
    const loadStoreAndOrders = async () => {
      if (authLoading) return;
      if (!user) {
        router.push('/login');
        return;
      }

      setIsLoading(true);
      try {
        const storeFromFS = await getStoreByUserIdFromFS(user.uid);
        if (storeFromFS) {
          setStore(storeFromFS);
          const ordersFromFS = await getStoreOrdersFromFS(storeFromFS.id);
          setOrders(ordersFromFS);
        }
      } catch (err) {
        console.error('Error al cargar pedidos:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoreAndOrders();
  }, [user, authLoading, router]);

  const isProPlan = store?.plan === 'negocio';
  const isSuperAdmin = user?.email && ['angelo@mivo.pe', 'angelocastellanos99@gmail.com'].includes(user.email.toLowerCase().trim());
  const storeSlug = store?.slug || 'mi-tienda';

  const handleExportOrders = () => {
    if (isProPlan || isSuperAdmin) {
      exportOrdersToCSV(orders, store?.name || 'mi-tienda');
    } else {
      setShowProUpgradeModal(true);
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
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="p-1.5 rounded-full hover:bg-gray-100 text-[#0b1c30] transition-colors cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-bold text-lg text-[#0b1c30]">Pedidos</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Botón Exportar Pedidos a Excel (Sólo Plan Negocio Pro) */}
            {(isProPlan || isSuperAdmin) && (
              <button
                type="button"
                onClick={handleExportOrders}
                className="h-8 px-3 rounded-xl bg-white hover:bg-slate-50 border border-amber-200/80 text-amber-900 text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="Exportar pedidos a Excel (.CSV)"
              >
                <FileSpreadsheet size={14} className="text-amber-600" />
                <span>Exportar Excel</span>
              </button>
            )}

            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-[#059669]">
              WhatsApp Directo
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-16 px-4 max-w-[640px] w-full mx-auto flex flex-col gap-4">
        
        {/* Banner Informativo Directo a WhatsApp */}
        <div className="bg-white rounded-2xl p-4 border border-[#bccac0]/40 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center shrink-0 shadow-2xs border border-emerald-100">
            <MessageCircle size={22} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xs font-extrabold text-[#0b1c30]">
              Tus pedidos llegan directo a tu WhatsApp
            </h2>
            <p className="text-[11px] text-[#6d7a72] leading-tight">
              Los clientes envían su carrito a tu número. Aquí verás el registro histórico para control y exportación a Excel.
            </p>
          </div>
        </div>

        {/* Sección de Registro Histórico de Pedidos */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#0b1c30] flex items-center gap-1.5">
              <span>Historial de Pedidos</span>
              <span className="text-xs font-semibold px-2 py-0.2 rounded-full bg-slate-100 text-slate-600">
                {orders.length}
              </span>
            </h3>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-[#059669] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-500">Cargando pedidos...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-7 border border-[#bccac0]/40 text-center flex flex-col items-center gap-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center">
                <ShoppingBag size={24} />
              </div>
              <div className="flex flex-col gap-0.5">
                <h4 className="font-bold text-sm text-[#0b1c30]">Aún no hay pedidos registrados</h4>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Cuando tus clientes completen su pedido desde tu catálogo público, aparecerán automáticamente en esta lista.
                </p>
              </div>
              <Link href={`/s/${storeSlug}`} target="_blank" className="w-full max-w-xs mt-1">
                <Button variant="secondary" fullWidth size="sm" className="flex items-center justify-center gap-1.5 text-xs font-semibold">
                  <ExternalLink size={14} />
                  <span>Probar pedido en mi tienda</span>
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col gap-2.5 hover:border-[#059669]/40 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-xs text-[#0b1c30] flex items-center gap-1">
                        <User size={13} className="text-slate-400" />
                        {ord.customerName || 'Cliente WhatsApp'}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock size={11} />
                        {ord.createdAt?.toDate ? ord.createdAt.toDate().toLocaleString('es-PE') : 'Reciente'}
                      </span>
                    </div>

                    <span className="font-extrabold text-sm text-[#059669] font-mono">
                      {formatCurrency(ord.total)}
                    </span>
                  </div>

                  {/* Resumen de Productos */}
                  <div className="bg-slate-50 rounded-xl p-2.5 text-xs text-slate-700 flex flex-col gap-1 border border-slate-100">
                    {ord.items && ord.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px]">
                        <span className="truncate max-w-[280px]">
                          <strong>{it.quantity}x</strong> {it.title} {it.selectedOption && <span className="text-slate-400">({it.selectedOption})</span>}
                        </span>
                        <span className="font-semibold text-slate-600 shrink-0">
                          {formatCurrency((it.price || 0) * (it.quantity || 1))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

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
                Exporta tus Pedidos a Excel
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Descarga todo tu historial de ventas con clientes, fechas, montos y productos en formato <strong>.CSV / Excel</strong> para tu contabilidad.
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

      {/* Bottom Nav Fija */}
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
            className="flex flex-col items-center gap-1 text-[#6d7a72] hover:text-[#0b1c30]"
          >
            <Package size={20} />
            <span className="text-xs font-medium">Productos</span>
          </Link>
          <Link
            href="/orders"
            className="flex flex-col items-center gap-1 text-[#059669] font-semibold"
          >
            <ShoppingBag size={20} />
            <span className="text-xs">Pedidos</span>
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
