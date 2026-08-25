'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { 
  Sparkles, 
  ArrowRight, 
  Store as StoreIcon, 
  QrCode as QrIcon, 
  Check, 
  Copy,
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
  const [copied, setCopied] = useState(false);
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

  // Generar código QR dinámicamente según el negocio actual
  const currentBusinessName = displayText || SAMPLE_STORES[storeIndex];
  const cleanSlug = slugify(currentBusinessName) || 'mi-tienda';
  const fullUrl = `https://beapana.com/s/${cleanSlug}`;

  useEffect(() => {
    QRCode.toDataURL(fullUrl, {
      width: 250,
      margin: 1,
      color: {
        dark: '#0b1c30',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generando QR:', err));
  }, [fullUrl]);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="py-16 md:py-24 relative overflow-hidden bg-linear-to-b from-[#f8f9ff] via-[#eff4ff]/80 to-[#f8f9ff]">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#85f8c4]/15 blur-3xl rounded-full pointer-events-none -translate-y-1/2 -z-10" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-[#3b82f6]/10 blur-3xl rounded-full pointer-events-none -translate-y-1/2 -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#059669]/10 text-[#00855d] text-xs font-bold mb-3 border border-[#059669]/20 shadow-2xs">
            <Sparkles size={13} className="text-[#059669]" />
            <span>Generación Instantánea</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0b1c30] tracking-tight">
            Tu tienda y tu código QR listos al instante
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#3d4a42]">
            Creamos tu enlace personalizado y tu código QR automáticamente para que empieces a compartir tu catálogo.
          </p>
        </div>

        {/* Simulator Central Card */}
        <div className="max-w-md mx-auto bg-white/85 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white shadow-2xl shadow-slate-200/60 flex flex-col gap-5">
          
          {/* Input Nombre de Tienda + Mini QR integrado lado a lado */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-extrabold text-[#0b1c30] uppercase tracking-wider flex items-center gap-1.5">
              <StoreIcon size={14} className="text-[#059669]" />
              <span>Nombre de tu negocio</span>
            </label>
            
            <div className="flex items-center gap-3">
              {/* Display de Escritura Automática */}
              <div className="flex-1 h-13 px-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center shadow-inner overflow-hidden">
                <span className="text-sm sm:text-base font-bold text-[#0b1c30] tracking-tight truncate">
                  {displayText}
                </span>
                <span className="inline-block w-0.5 h-5 bg-[#059669] ml-1 animate-pulse" />
              </div>

              {/* QR Generado Automáticamente */}
              <div 
                className="w-13 h-13 rounded-2xl p-1.5 bg-white border border-slate-200 shadow-sm shrink-0 flex items-center justify-center relative transition-transform hover:scale-105"
                title="Código QR generado automáticamente"
              >
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR generado"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <QrIcon size={20} className="text-slate-400" />
                )}
              </div>
            </div>
          </div>

          {/* Generated URL Preview Pill with Copy Button */}
          <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-2 overflow-hidden">
              <Smartphone size={15} className="text-[#059669] shrink-0" />
              <span className="text-xs sm:text-sm font-mono text-slate-600 truncate select-all">
                beapana.com/s/<strong className="text-emerald-700 font-bold">{cleanSlug}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0 shadow-2xs flex items-center gap-1.5 text-xs font-bold active:scale-95"
              title="Copiar enlace"
            >
              {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>

          {/* CTA Registro Directo */}
          <div className="pt-2">
            <Link href="/register">
              <Button
                variant="primary"
                fullWidth
                className="h-13 text-sm sm:text-base font-bold bg-[#059669] hover:bg-[#00855d] text-white shadow-xl shadow-[#059669]/25 hover:shadow-2xl hover:shadow-[#059669]/35 flex items-center justify-center gap-2 rounded-2xl transition-all"
              >
                <span>Reclamar mi tienda gratis</span>
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
