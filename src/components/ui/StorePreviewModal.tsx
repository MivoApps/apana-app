'use client';

import React, { useState } from 'react';
import { X, ExternalLink, RefreshCw, Smartphone, Monitor } from 'lucide-react';

interface StorePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeSlug: string;
}

export function StorePreviewModal({ isOpen, onClose, storeSlug }: StorePreviewModalProps) {
  const [iframeKey, setIframeKey] = useState(0);
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');

  if (!isOpen || !storeSlug) return null;

  const publicUrl = `/s/${storeSlug}`;

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className={`bg-[#0b1c30] w-full h-[92vh] max-h-[850px] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-white/10 relative transition-all duration-300 ${
        device === 'desktop' ? 'max-w-[1100px]' : 'max-w-[900px]'
      }`}>
        {/* Header Modal Stitch Dark */}
        <div className="h-14 bg-[#14263b] px-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-full border border-white/10 text-xs text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>/s/{storeSlug}</span>
            </div>
            <button
              onClick={handleRefresh}
              title="Recargar vista previa"
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          {/* Selector de Dispositivo: Móvil vs Desktop */}
          <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10 shadow-inner">
            <button
              type="button"
              onClick={() => setDevice('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                device === 'mobile'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Smartphone size={13} />
              <span>Móvil</span>
            </button>
            <button
              type="button"
              onClick={() => setDevice('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                device === 'desktop'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Monitor size={13} />
              <span>Desktop</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
              title="Abrir en pestaña nueva"
            >
              <ExternalLink size={16} />
              <span className="hidden sm:inline">Pestaña nueva</span>
            </a>
            <button
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body Simulator */}
        <div className="flex-1 bg-[#0b1c30] flex items-center justify-center p-2 sm:p-4 overflow-hidden relative">
          {device === 'mobile' ? (
            /* Simulador Smartphone */
            <div className="w-full max-w-[390px] h-[98%] bg-white rounded-[40px] border-[10px] border-[#1e293b] shadow-2xl overflow-hidden relative flex flex-col items-center animate-fadeIn">
              {/* Mobile Notch Bar */}
              <div className="w-full h-6 bg-[#1e293b] flex justify-center items-center shrink-0 z-20">
                <div className="w-20 h-3.5 bg-black rounded-full" />
              </div>

              <iframe
                key={`${iframeKey}-mobile`}
                src={publicUrl}
                className="w-full h-full border-0 bg-white"
                title="Vista previa móvil de tu tienda"
              />
            </div>
          ) : (
            /* Simulador Pantalla Ancha Desktop / Laptop */
            <div className="w-full h-[98%] bg-white rounded-2xl border-[6px] border-[#1e293b] shadow-2xl overflow-hidden relative flex flex-col animate-fadeIn">
              {/* Desktop Window Title Bar */}
              <div className="w-full h-8 bg-[#1e293b] px-3 flex items-center justify-between shrink-0 z-20 border-b border-[#2d3a4f]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="bg-[#0b1c30] px-4 py-0.5 rounded-md text-[10px] text-slate-300 font-mono flex items-center gap-1.5 border border-white/5">
                  <span className="text-emerald-400">🔒</span>
                  <span>beapana.com/s/{storeSlug}</span>
                </div>
                <div className="w-12" />
              </div>

              <iframe
                key={`${iframeKey}-desktop`}
                src={publicUrl}
                className="w-full h-full border-0 bg-white"
                title="Vista previa escritorio de tu tienda"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
