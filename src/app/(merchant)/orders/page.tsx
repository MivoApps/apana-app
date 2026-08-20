'use client';

import React from 'react';
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
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/firebase/auth-context';
import { useAppStore } from '@/lib/app-store';
import { getStoreByUserIdFromFS } from '@/lib/firebase/firestore';
import { Store } from '@/types/store';

export default function OrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { stores, activeStoreSlug } = useAppStore();
  const currentStore = stores[activeStoreSlug];

  const [fsStore, setFsStore] = React.useState<Store | null>(null);

  React.useEffect(() => {
    const fetchStore = async () => {
      if (user && !currentStore) {
        const storeFromFS = await getStoreByUserIdFromFS(user.uid);
        if (storeFromFS) setFsStore(storeFromFS);
      }
    };
    fetchStore();
  }, [user, currentStore]);

  const activeStore = currentStore || fsStore;
  const storeSlug = activeStore?.slug || activeStoreSlug || 'panaderia-don-jose';

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
              className="p-1.5 rounded-full hover:bg-gray-100 text-[#0b1c30] transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-bold text-lg text-[#0b1c30]">Pedidos</h1>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-[#059669]">
            WhatsApp Directo
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-16 px-4 max-w-[640px] w-full mx-auto flex flex-col gap-6">
        
        {/* Banner Informativo Directo a WhatsApp */}
        <div className="bg-white rounded-2xl p-6 border border-[#bccac0]/40 shadow-xs flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center shadow-xs">
            <MessageCircle size={32} />
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-[#0b1c30]">
              Tus pedidos llegan a tu WhatsApp
            </h2>
            <p className="text-xs text-[#6d7a72] max-w-sm leading-relaxed">
              APANA conecta a tus compradores directamente con tu teléfono. Cuando un cliente completa su carrito, recibes un mensaje estructurado con el resumen listo para coordinar el pago y envío.
            </p>
          </div>

          <div className="w-full bg-[#f8f9ff] p-4 rounded-xl border border-gray-200 text-left flex flex-col gap-2.5">
            <span className="text-xs font-semibold text-[#0b1c30]">Ejemplo de pedido recibido:</span>
            <div className="bg-emerald-100/60 p-3 rounded-lg border border-emerald-200 text-xs font-mono text-[#0b1c30] space-y-1">
              <p>🛍️ <strong>¡Nuevo Pedido en {activeStore?.name || 'Mi Tienda'}!</strong></p>
              <p>• 2x Tarta de Frutas (S/40.00)</p>
              <p>• 1x Baguette (S/6.50)</p>
              <p className="pt-1 font-bold text-[#059669]">Total: S/46.50</p>
            </div>
          </div>

          <div className="w-full pt-1">
            <Link href={`/s/${storeSlug}`} target="_blank">
              <Button variant="secondary" fullWidth className="flex items-center justify-center gap-2 h-11 text-xs font-semibold">
                <ExternalLink size={16} />
                Probar pedido en mi tienda pública
              </Button>
            </Link>
          </div>
        </div>

      </main>

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
