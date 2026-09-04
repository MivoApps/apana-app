import React from 'react';
import { ShoppingBag, ArrowLeft, Share2 } from 'lucide-react';

/**
 * Skeleton Shimmer de carga para la Tienda Pública (/s/[storeSlug])
 * Reemplaza la pantalla blanca inicial con una estructura visual idéntica
 * para dar percepción de velocidad instantánea al cliente.
 */
export function StoreSkeleton() {
  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans relative pb-28 animate-pulse">
      {/* Header Fijo Skeleton */}
      <header className="fixed top-0 w-full z-50 bg-[#f8f9ff]/90 backdrop-blur-xl border-b border-slate-200/60">
        <div className="h-16 px-4 max-w-[640px] mx-auto flex items-center justify-between">
          <div className="h-5 w-36 bg-slate-200/90 rounded-md" />
          <div className="w-10 h-10 rounded-full bg-slate-200/90 flex items-center justify-center text-slate-300">
            <ShoppingBag size={20} />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-16 pb-24 min-h-screen">
        <div className="flex flex-col w-full max-w-[640px] mx-auto">
          {/* Header Tienda Info Skeleton */}
          <div className="bg-white border-b border-slate-100 px-4 py-7 flex flex-col items-center gap-3 text-center">
            {/* Logo Circular */}
            <div className="w-20 h-20 rounded-full bg-slate-200 shadow-sm flex items-center justify-center" />
            
            {/* Nombre de Tienda */}
            <div className="h-7 w-48 bg-slate-200 rounded-lg mt-1" />
            
            {/* Descripción */}
            <div className="space-y-1.5 w-full flex flex-col items-center">
              <div className="h-3.5 w-64 bg-slate-200/80 rounded-md" />
              <div className="h-3.5 w-44 bg-slate-200/60 rounded-md" />
            </div>

            {/* Píldoras de Envíos, Ubicación y Horario */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              <div className="h-6 w-36 bg-emerald-50/80 border border-emerald-100 rounded-full" />
              <div className="h-6 w-24 bg-slate-100 rounded-full" />
              <div className="h-6 w-28 bg-slate-100 rounded-full" />
            </div>
          </div>

          {/* Buscador Skeleton */}
          <div className="px-4 py-3.5">
            <div className="w-full h-11 bg-white border border-slate-200/80 rounded-xl shadow-2xs" />
          </div>

          {/* Categorías Skeleton */}
          <div className="px-4 pb-4 flex gap-2 overflow-x-hidden">
            <div className="h-9 w-20 bg-emerald-600/30 rounded-full shrink-0" />
            <div className="h-9 w-24 bg-white border border-slate-200/80 rounded-full shrink-0" />
            <div className="h-9 w-28 bg-white border border-slate-200/80 rounded-full shrink-0" />
            <div className="h-9 w-20 bg-white border border-slate-200/80 rounded-full shrink-0" />
          </div>

          {/* Grid de Productos Skeleton */}
          <div className="px-4 grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/60 flex flex-col justify-between shadow-2xs"
              >
                <div>
                  {/* Foto del Producto */}
                  <div className="w-full aspect-square bg-slate-100 rounded-xl mb-3 relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-tr from-slate-200/50 via-slate-100/30 to-slate-200/50" />
                  </div>
                  {/* Título */}
                  <div className="h-4 w-5/6 bg-slate-200 rounded mb-1.5" />
                  <div className="h-3.5 w-1/2 bg-slate-200/70 rounded mb-2.5" />
                </div>
                {/* Precio y Botón */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <div className="h-5 w-16 bg-emerald-100/80 rounded" />
                  <div className="w-8 h-8 rounded-full bg-slate-100" />
                </div>
              </div>
            ))}
          </div>

          {/* Footer Skeleton */}
          <div className="mt-12 text-center pb-8 opacity-40">
            <div className="h-3 w-32 bg-slate-300 rounded mx-auto mb-1" />
            <div className="h-2.5 w-24 bg-slate-200 rounded mx-auto" />
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Skeleton Shimmer de carga para el Detalle de Producto (/s/[storeSlug]/p/[productId])
 */
export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white text-[#0b1c30] flex flex-col font-sans relative pb-32 animate-pulse">
      {/* Top Bar Skeleton */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="h-14 px-4 max-w-[640px] mx-auto flex items-center justify-between">
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
            <ArrowLeft size={18} />
          </div>
          <div className="h-4 w-28 bg-slate-200 rounded" />
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
            <Share2 size={16} />
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="max-w-[640px] w-full mx-auto px-4 py-4 space-y-6">
        {/* Foto Principal */}
        <div className="w-full aspect-square bg-slate-100 rounded-3xl border border-slate-100 overflow-hidden relative shadow-2xs">
          <div className="absolute inset-0 bg-linear-to-tr from-slate-200/60 via-slate-100/40 to-slate-200/60" />
        </div>

        {/* Indicadores de Galería */}
        <div className="flex justify-center gap-1.5">
          <div className="w-5 h-1.5 bg-slate-300 rounded-full" />
          <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
          <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
        </div>

        {/* Info del Producto */}
        <div className="space-y-3">
          <div className="h-4 w-20 bg-emerald-100/80 rounded-full" />
          <div className="h-7 w-4/5 bg-slate-200 rounded-lg" />
          <div className="h-8 w-28 bg-emerald-600/20 rounded-xl" />
        </div>

        {/* Separador */}
        <div className="border-t border-slate-100" />

        {/* Descripción */}
        <div className="space-y-2">
          <div className="h-4 w-28 bg-slate-200 rounded mb-1" />
          <div className="h-3.5 w-full bg-slate-200/70 rounded" />
          <div className="h-3.5 w-5/6 bg-slate-200/70 rounded" />
          <div className="h-3.5 w-3/4 bg-slate-200/70 rounded" />
        </div>

        {/* Variantes / Opciones Skeleton */}
        <div className="space-y-2.5 pt-2">
          <div className="h-4 w-24 bg-slate-200 rounded" />
          <div className="flex gap-2">
            <div className="h-10 w-20 bg-slate-100 border border-slate-200/80 rounded-xl" />
            <div className="h-10 w-20 bg-slate-100 border border-slate-200/80 rounded-xl" />
            <div className="h-10 w-20 bg-slate-100 border border-slate-200/80 rounded-xl" />
          </div>
        </div>
      </main>

      {/* Sticky Bottom Floating Bar Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 p-3.5">
        <div className="max-w-[640px] mx-auto flex gap-2.5">
          <div className="h-12 flex-1 bg-slate-100 border border-slate-200 rounded-2xl" />
          <div className="h-12 flex-1 bg-emerald-600/30 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
