'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function StoreNotFoundPage() {
  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col justify-center items-center px-4 py-8 relative font-sans">
      {/* Background ambient blobs */}
      <div className="fixed top-0 left-0 w-64 h-64 bg-[#85f8c4]/15 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-80 h-80 bg-[#d3e4fe]/40 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <main className="w-full max-w-sm mx-auto flex flex-col items-center text-center gap-6 relative z-10 bg-white p-8 rounded-2xl border border-[#bccac0]/40 shadow-xs">
        {/* Icon Container */}
        <div className="w-20 h-20 bg-red-50 text-[#ba1a1a] rounded-2xl flex items-center justify-center shadow-xs">
          <AlertCircle size={40} />
        </div>

        {/* Text Details */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight">
            Tienda no encontrada
          </h1>
          <p className="text-sm text-[#3d4a42] leading-relaxed">
            La tienda a la que intentas acceder no existe, ha sido desactivada o el enlace ingresado es incorrecto.
          </p>
        </div>
      </main>
    </div>
  );
}
