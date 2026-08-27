'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { 
  Sparkles, 
  ArrowRight, 
  Store as StoreIcon, 
  QrCode as QrIcon, 
  Smartphone
} from 'lucide-react';
import { slugify } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/Button';

const SAMPLE_STORES = [
  'Panadería Don José',
  'Decoraciones Julita',
  'Café & Postres Aroma',
  'Moda Urbana Chic',
  'Burgers & Alitas Criollas'
];

export const LandingStoreSimulator: React.FC = () => {
  const [storeIndex, setStoreIndex] = useState(0);
  const [displayText, setDisplayText] = useState(SAMPLE_STORES[0]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Efecto Máquina de Escribir (Typewriter)
  useEffect(() => {
    const currentFullText = SAMPLE_STORES[storeIndex];
    let timer: NodeJS.Timeout;

    if (!isDeleting && displayText === currentFullText) {
      // Pausar 2.5 segundos cuando la palabra está completa
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, 2500);
    } else if (isDeleting && displayText === '') {
      // Pasar a la siguiente palabra cuando se termina de borrar
      setIsDeleting(false);
      setStoreIndex((prev) => (prev + 1) % SAMPLE_STORES.length);
    } else {
      // Escribir o borrar letra por letra
      const speed = isDeleting ? 45 : 90;
      timer = setTimeout(() => {
        setDisplayText((prev) => {
          if (isDeleting) {
            return currentFullText.substring(0, prev.length - 1);
          } else {
            return currentFullText.substring(0, prev.length + 1);
          }
        });
      }, speed);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, storeIndex]);

  // Generar código QR en alta resolución dinámicamente según el negocio actual
  const currentBusinessName = displayText || SAMPLE_STORES[storeIndex];
  const cleanSlug = slugify(currentBusinessName) || 'mi-tienda';
  const fullUrl = `https://beapana.com/s/${cleanSlug}`;

  useEffect(() => {
    QRCode.toDataURL(fullUrl, {
      width: 400,
      margin: 1,
      color: {
        dark: '#0b1c30',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generando QR:', err));
  }, [fullUrl]);

  return (
    <section className="py-16 md:py-28 relative overflow-hidden bg-linear-to-b from-[#f8f9ff] via-[#eff4ff]/80 to-[#f8f9ff]">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#85f8c4]/15 blur-3xl rounded-full pointer-events-none -translate-y-1/2 -z-10" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-[#3b82f6]/10 blur-3xl rounded-full pointer-events-none -translate-y-1/2 -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#059669]/10 text-[#00855d] text-xs font-bold mb-3 border border-[#059669]/20 shadow-2xs">
            <Sparkles size={13} className="text-[#059669]" />
            <span>Generación Instantánea</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#0b1c30] tracking-tight">
            Tu tienda y tu código QR listos al instante
          </h2>
          <p className="mt-3 text-sm sm:text-base md:text-lg text-[#3d4a42]">
            Creamos tu enlace personalizado y tu código QR automáticamente para que empieces a compartir tu catálogo.
          </p>
        </div>

        {/* Simulator Card: Mobile (compacto) & Desktop (amplio con QR destacado) */}
        <div className="max-w-md md:max-w-2xl lg:max-w-3xl mx-auto bg-white/90 backdrop-blur-xl p-6 sm:p-8 md:p-10 rounded-3xl border border-white shadow-2xl shadow-slate-200/70 flex flex-col gap-5 md:gap-7 transition-all">
          
          {/* Nombre de Tienda + QR destacado */}
          <div className="flex flex-col gap-2 md:gap-3">
            <label className="text-xs md:text-sm font-extrabold text-[#0b1c30] uppercase tracking-wider flex items-center gap-1.5">
              <StoreIcon size={16} className="text-[#059669]" />
              <span>Nombre de tu negocio</span>
            </label>
            
            <div className="flex items-center gap-3 md:gap-5">
              {/* Display de Escritura Automática */}
              <div className="flex-1 h-13 md:h-28 lg:h-32 px-4 md:px-7 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center shadow-inner overflow-hidden">
                <span className="text-sm sm:text-base md:text-2xl lg:text-3xl font-black text-[#0b1c30] tracking-tight truncate">
                  {displayText}
                </span>
                <span className="inline-block w-0.5 md:w-1 h-5 md:h-8 bg-[#059669] ml-1.5 animate-pulse" />
              </div>

              {/* QR Generado Automáticamente (Ampliado en Desktop) */}
              <div 
                className="w-13 h-13 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-2xl p-1.5 md:p-2.5 bg-white border border-slate-200 shadow-md shrink-0 flex items-center justify-center relative transition-transform hover:scale-105"
                title="Código QR generado en vivo"
              >
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR generado"
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <QrIcon size={24} className="text-slate-400" />
                )}
              </div>
            </div>
          </div>

          {/* Generated URL Preview Pill (Solo lectura / Ilustrativo) */}
          <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-3 md:p-4 flex items-center justify-center gap-2 md:gap-2.5 shadow-inner">
            <Smartphone size={16} className="text-[#059669] shrink-0" />
            <span className="text-xs sm:text-sm md:text-base font-mono text-slate-600 truncate">
              beapana.com/s/<strong className="text-emerald-700 font-bold">{cleanSlug}</strong>
            </span>
          </div>

          {/* CTA Registro Directo */}
          <div className="pt-2">
            <Link href="/register">
              <Button
                variant="primary"
                fullWidth
                className="h-13 md:h-16 text-sm sm:text-base md:text-lg font-black bg-[#059669] hover:bg-[#00855d] text-white shadow-xl shadow-[#059669]/25 hover:shadow-2xl hover:shadow-[#059669]/35 flex items-center justify-center gap-2 rounded-2xl transition-all"
              >
                <span>Reclamar mi tienda gratis</span>
                <ArrowRight size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
