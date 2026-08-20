'use client';

import React, { useState } from 'react';
import { X, ExternalLink, RefreshCw } from 'lucide-react';

interface StorePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeSlug: string;
}

export function StorePreviewModal({ isOpen, onClose, storeSlug }: StorePreviewModalProps) {
  const [iframeKey, setIframeKey] = useState(0);

  if (!isOpen || !storeSlug) return null;

  const publicUrl = `/s/${storeSlug}`;

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="bg-[#0b1c30] w-full max-w-[900px] h-[92vh] max-h-[850px] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-white/10 relative">
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
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <RefreshCw size={16} />
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
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body Simulator - Vista Móvil Fija */}
        <div className="flex-1 bg-[#0b1c30] flex items-center justify-center p-2 sm:p-4 overflow-hidden relative">
          <div className="w-full max-w-[390px] h-[98%] bg-white rounded-[40px] border-[10px] border-[#1e293b] shadow-2xl overflow-hidden relative flex flex-col items-center">
            {/* Mobile Notch Bar */}
            <div className="w-full h-6 bg-[#1e293b] flex justify-center items-center shrink-0 z-20">
              <div className="w-20 h-3.5 bg-black rounded-full" />
            </div>

            <iframe
              key={iframeKey}
              src={publicUrl}
              className="w-full h-full border-0 bg-white"
              title="Vista previa de tu tienda"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
