'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Store as StoreIcon, AlertCircle, ArrowLeft } from 'lucide-react';
import { getStoreByIdFromFS } from '@/lib/firebase/firestore';
import StoreNotFoundPage from '@/app/(public)/store-not-found/page';

export default function DynamicQrResolverPage() {
  const router = useRouter();
  const params = useParams();
  const rawStoreId = params?.storeId as string;

  const [status, setStatus] = useState<'loading' | 'active' | 'inactive' | 'not_found'>('loading');

  useEffect(() => {
    let isMounted = true;

    async function resolveQrDestination() {
      if (!rawStoreId) {
        if (isMounted) setStatus('not_found');
        return;
      }

      // Sanitizar storeId (solo alfanuméricos, guiones y guiones bajos)
      const sanitizedStoreId = rawStoreId.trim().replace(/[^a-zA-Z0-9_-]/g, '');
      if (!sanitizedStoreId) {
        if (isMounted) setStatus('not_found');
        return;
      }

      try {
        const store = await getStoreByIdFromFS(sanitizedStoreId);

        if (!isMounted) return;

        if (!store) {
          setStatus('not_found');
          return;
        }

        // Si la tienda no está activa (por ejemplo: pausada, eliminada, pendiente)
        if (store.status && store.status !== 'activa') {
          setStatus('inactive');
          return;
        }

        // Validar destino seguro: solo paths relativos internos de APANA (Anti Open-Redirect)
        const targetSlug = store.slug ? encodeURIComponent(store.slug) : '';
        if (!targetSlug) {
          setStatus('not_found');
          return;
        }

        // Redirección segura a la tienda
        const safeDestination = `/s/${targetSlug}`;
        setStatus('active');
        router.replace(safeDestination);
      } catch (err) {
        console.error('Error al resolver QR dinámico:', err);
        if (isMounted) setStatus('not_found');
      }
    }

    resolveQrDestination();

    return () => {
      isMounted = false;
    };
  }, [rawStoreId, router]);

  // 1. Estado: No encontrado (404 amigable oficial de APANA)
  if (status === 'not_found') {
    return <StoreNotFoundPage />;
  }

  // 2. Estado: Desactivado / Pausado / No disponible
  if (status === 'inactive') {
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
              Catálogo no disponible
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

  // 3. Estado: Cargando / Redirigiendo limpiamente
  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <StoreIcon size={24} />
          </div>
          <div className="absolute -inset-1 border-2 border-emerald-500 border-t-transparent rounded-2xl animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-[#0b1c30]">Conectando con la tienda...</p>
          <p className="text-xs text-[#6d7a72]">Redirigiendo de forma segura</p>
        </div>
      </div>
    </div>
  );
}
