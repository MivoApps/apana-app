'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { ArrowLeft, Download, Share2, Copy, Check, Printer, Sparkles, QrCode, Store as StoreIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/lib/firebase/auth-context';
import { getStoreByUserIdFromFS } from '@/lib/firebase/firestore';
import { Store } from '@/types/store';

export default function QRPage() {
  const { user, loading: authLoading } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStore = async () => {
      if (authLoading) return;
      if (!user) return;

      setIsLoading(true);
      const storeFromFS = await getStoreByUserIdFromFS(user.uid);
      if (storeFromFS) {
        setStore(storeFromFS);
      }
      setIsLoading(false);
    };
    fetchStore();
  }, [user, authLoading]);

  const storeName = store?.name || 'Mi Tienda APANA';
  const targetSlug = store?.slug || 'mi-tienda';
  const brandColor = store?.primaryColor || '#059669';

  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const storeUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/s/${targetSlug}`
    : `https://bealiados.com/s/${targetSlug}`;

  useEffect(() => {
    // Generar en Ultra Alta Definición (1024x1024 px con Nivel de Corrección 'H' para 300 DPI en impresión)
    QRCode.toDataURL(storeUrl, {
      width: 1024,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#0b1c30',
        light: '#ffffff',
      },
    })
      .then(setQrUrl)
      .catch(console.error);
  }, [storeUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] px-4 py-6 max-w-lg mx-auto flex flex-col gap-6">
      {/* Estilos para Impresión Calibrada de Stickers 5x5 cm */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #sticker-print-area, #sticker-print-area * {
            visibility: visible;
          }
          #sticker-print-area {
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 5cm !important;
            height: 5cm !important;
            padding: 0 !important;
            margin: 0 !important;
            border: 1px dashed #ccc !important;
            box-shadow: none !important;
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Header */}
      <header className="flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-full hover:bg-gray-100 text-[#0b1c30] transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#0b1c30]">Código QR y Sticker</h1>
            <p className="text-xs text-[#6d7a72]">Listo para imprimir en vitrinas, cartas o stickers</p>
          </div>
        </div>
      </header>

      {/* Card de Previsualización de Sticker 5x5 cm */}
      <Card className="flex flex-col items-center text-center p-6 gap-4 bg-white border border-[#bccac0]/40 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between w-full no-print">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Sparkles size={16} className="text-[#059669]" />
            <span>Plantilla de Sticker (5x5 cm)</span>
          </div>
          <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
            Troquel 4x4 cm
          </span>
        </div>

        {/* PLANTILLA DE STICKER FÍSICO (Área que se imprime) */}
        <div
          id="sticker-print-area"
          className="w-64 h-64 sm:w-72 sm:h-72 bg-white rounded-3xl p-4 border-2 border-dashed border-slate-300 flex flex-col items-center justify-between shadow-xs relative transition-all"
        >
          {/* Cabecera del Sticker */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-1.5">
              {store?.logoUrl ? (
                <img src={store.logoUrl} alt={storeName} className="w-5 h-5 rounded-full object-cover shadow-2xs" />
              ) : (
                <div
                  style={{ backgroundColor: brandColor }}
                  className="w-4 h-4 rounded-full text-white flex items-center justify-center text-[9px] font-bold"
                >
                  {storeName.substring(0, 1).toUpperCase()}
                </div>
              )}
              <h2 className="font-extrabold text-sm text-[#0b1c30] tracking-tight truncate max-w-[190px]">
                {storeName}
              </h2>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Catálogo Digital
            </span>
          </div>

          {/* Imagen QR de Alta Definición */}
          {qrUrl ? (
            <div className="p-2 bg-white rounded-2xl border border-slate-100 shadow-2xs">
              <img src={qrUrl} alt={`QR ${storeName}`} className="w-36 h-36 sm:w-40 sm:h-40 object-contain" />
            </div>
          ) : (
            <div className="w-36 h-36 bg-slate-100 rounded-2xl flex items-center justify-center animate-pulse">
              <QrCode size={32} className="text-slate-400" />
            </div>
          )}

          {/* Pie del Sticker */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-extrabold text-[#059669] flex items-center gap-1">
              <span>📲 Escanea y Pide por WhatsApp</span>
            </span>
            <span className="text-[8px] text-slate-400 font-mono">
              /s/{targetSlug}
            </span>
          </div>
        </div>

        {/* Guía Informativa de Impresión */}
        <p className="text-[11px] text-slate-500 leading-snug no-print max-w-sm">
          💡 <strong>Guía de Impresión:</strong> Diseñado en formato cuadrado 1:1. Imprime en papel sticker de <strong>5x5 cm</strong> con área útil para troquelado/corte de <strong>4x4 cm</strong>.
        </p>

        {/* Enlace y Copia */}
        <div className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2 no-print">
          <span className="text-xs text-[#0b1c30] font-mono truncate">{storeUrl}</span>
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
            title="Copiar enlace"
          >
            {copied ? <Check size={16} className="text-[#059669]" /> : <Copy size={16} />}
          </button>
        </div>

        {/* Botones de Acción */}
        <div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-2.5 pt-1 no-print">
          <button
            type="button"
            onClick={handlePrint}
            className="h-11 bg-slate-900 hover:bg-black active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Printer size={16} />
            <span>Imprimir Sticker</span>
          </button>

          {qrUrl && (
            <a href={qrUrl} download={`qr-sticker-${targetSlug}-hd.png`} className="w-full">
              <Button variant="primary" fullWidth className="h-11 flex items-center justify-center gap-2 text-xs font-bold">
                <Download size={16} />
                <span>Descargar HD (1024px)</span>
              </Button>
            </a>
          )}
        </div>
      </Card>
    </div>
  );
}
