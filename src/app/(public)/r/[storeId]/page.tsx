import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { getStoreByIdFromFS } from '@/lib/firebase/firestore';
import StoreNotFoundPage from '@/app/(public)/store-not-found/page';

interface Props {
  params: Promise<{
    storeId: string;
  }>;
}

export default async function DynamicQrResolverPage({ params }: Props) {
  const { storeId: rawStoreId } = await params;

  if (!rawStoreId) {
    return <StoreNotFoundPage />;
  }

  // Sanitizar storeId (solo alfanuméricos, guiones y guiones bajos)
  const sanitizedStoreId = rawStoreId.trim().replace(/[^a-zA-Z0-9_-]/g, '');
  if (!sanitizedStoreId) {
    return <StoreNotFoundPage />;
  }

  try {
    const store = await getStoreByIdFromFS(sanitizedStoreId);

    if (!store) {
      return <StoreNotFoundPage />;
    }

    // Si la tienda no está activa (por ejemplo: pausada, eliminada, pendiente)
    if (store.status && store.status !== 'activa') {
      return (
        <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col justify-center items-center px-4 py-8 relative font-sans">
          {/* Ambient blobs */}
          <div className="fixed top-0 left-0 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="fixed bottom-0 right-0 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

          <main className="w-full max-w-sm mx-auto flex flex-col items-center text-center gap-6 relative z-10 bg-white p-8 rounded-2xl border border-[#bccac0]/40 shadow-sm">
            {/* Badge icon */}
            <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-xs">
              <AlertCircle size={40} />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-700">
                Código QR Pausado
              </span>
              <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight">
                Tienda no disponible
              </h1>
              <p className="text-sm text-[#3d4a42] leading-relaxed">
                Este código QR ya no está disponible temporalmente o la tienda ha pausado sus actividades.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0b1c30] text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors w-full"
            >
              <ArrowLeft size={16} />
              Volver a APANA
            </Link>
          </main>
        </div>
      );
    }

    // Validar destino seguro: solo paths relativos internos de APANA (Anti Open-Redirect)
    const targetSlug = store.slug ? encodeURIComponent(store.slug) : '';
    if (!targetSlug) {
      return <StoreNotFoundPage />;
    }

    // Redirección HTTP inmediata a nivel servidor (0 ms de JavaScript en el móvil)
    redirect(`/s/${targetSlug}`);
  } catch (err: any) {
    // Si es una redirección intencional de Next.js, volver a lanzarla para que Next.js responda el redirect
    if (err?.digest?.startsWith('NEXT_REDIRECT')) {
      throw err;
    }
    console.error('Error al resolver QR dinámico en servidor:', err);
    return <StoreNotFoundPage />;
  }
}

