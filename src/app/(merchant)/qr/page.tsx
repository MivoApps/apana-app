'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { generateQrWithLogo } from '@/lib/qr-generator';
import { ArrowLeft, Download, Share2, Copy, Check, Printer, Sparkles, QrCode, Store as StoreIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/lib/firebase/auth-context';
import { getStoreByUserIdFromFS } from '@/lib/firebase/firestore';
import { Store } from '@/types/store';

export default function QRPage() {
  const { user, loading: authLoading } = useAuth();
  const [store, setStore] = useState<Store | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem('apana_active_store');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.name) return parsed;
        }
      } catch (_) {}
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchStore = async () => {
      if (authLoading) return;
      if (!user) {
        setIsLoading(false);
        return;
      }

      // 1. Intentar cargar de sessionStorage para renderizado instantáneo sin parpadeo
      if (typeof window !== 'undefined' && !store) {
        try {
          const userCache = sessionStorage.getItem(`apana_cache_store_${user.uid}`) || sessionStorage.getItem('apana_active_store');
          if (userCache) {
            const parsed = JSON.parse(userCache);
            if (parsed?.name && isMounted) {
              setStore(parsed);
              setIsLoading(false);
            }
          }
        } catch (_) {}
      }

      try {
        const storeFromFS = await getStoreByUserIdFromFS(user.uid);
        if (storeFromFS && isMounted) {
          setStore(storeFromFS);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('apana_active_store', JSON.stringify(storeFromFS));
            sessionStorage.setItem(`apana_cache_store_${user.uid}`, JSON.stringify(storeFromFS));
          }
        }
      } catch (err) {
        console.error('Error al obtener tienda para QR:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchStore();

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  const storeName = store?.name || '';
  const targetSlug = store?.slug || '';
  const storeId = store?.id || (user ? `store_${user.uid}` : '');
  const brandColor = store?.primaryColor || '#059669';

  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // URL dinámica e inmutable en el QR (permite cambiar de nombre/slug sin reimprimir)
  const qrDynamicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/r/${storeId || targetSlug}`
    : `https://beapana.com/r/${storeId || targetSlug}`;

  // URL pública directa
  const publicStoreUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/s/${targetSlug}`
    : `https://beapana.com/s/${targetSlug}`;

  useEffect(() => {
    if (!storeId && !targetSlug) return;

    // Generar en Ultra Alta Definición (1024x1024 px con Logo APANA en el centro)
    generateQrWithLogo(qrDynamicUrl, {
      width: 1024,
      margin: 2,
      darkColor: '#0b1c30',
      lightColor: '#ffffff',
      logoSizeRatio: 0.22,
    })
      .then(setQrUrl)
      .catch(console.error);
  }, [qrDynamicUrl, storeId, targetSlug]);

  const handleCopy = () => {
    navigator.clipboard.writeText(publicStoreUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    // Si el navegador soporta Web Share API con imagen o archivo (especialmente en móviles Android / iOS)
    if (typeof window !== 'undefined') {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // En móviles, abrir ventana limpia enfocada únicamente en el sticker para diálogo nativo de impresión / guardar PDF
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Sticker QR APANA</title>
                <style>
                  @page {
                    size: 5cm 5cm;
                    margin: 0;
                  }
                  body {
                    margin: 0;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background-color: #ffffff;
                  }
                  .sticker-card {
                    width: 5cm;
                    height: 5cm;
                    box-sizing: border-box;
                    padding: 0.35cm;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: space-between;
                    text-align: center;
                    border: 1px dashed #cbd5e1;
                    border-radius: 12px;
                    color: #0b1c30;
                  }
                  .header-eyebrow {
                    font-size: 8px;
                    font-weight: 800;
                    color: #475569;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                  }
                  .header-eyebrow span {
                    display: inline-block;
                    width: 12px;
                    height: 1px;
                    background: #cbd5e1;
                  }
                  .header-title {
                    font-size: 13px;
                    font-weight: 900;
                    color: #020617;
                    margin-top: 1px;
                    max-width: 4.2cm;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                  }
                  .qr-image {
                    width: 3.1cm;
                    height: 3.1cm;
                    object-fit: contain;
                  }
                  .footer-cta {
                    font-size: 9px;
                    font-weight: 900;
                    color: #020617;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                  }
                  .footer-brand {
                    font-size: 7.5px;
                    font-weight: 600;
                    color: #64748b;
                    margin-top: 1px;
                  }
                  .footer-brand strong {
                    color: #020617;
                    font-weight: 900;
                  }
                </style>
              </head>
              <body>
                <div class="sticker-card">
                  <div>
                    <div class="header-eyebrow">
                      <span></span>MIRA Y PIDE AQUÍ<span></span>
                    </div>
                    <div class="header-title">${storeName || 'Mi Tienda'}</div>
                  </div>
                  <img src="${qrUrl}" class="qr-image" alt="QR" />
                  <div>
                    <div class="footer-cta">
                      📱 Escanea para pedir
                    </div>
                    <div class="footer-brand">
                      Una tienda online de <strong>APANA</strong>
                    </div>
                  </div>
                </div>
                <script>
                  window.onload = function() {
                    setTimeout(function() {
                      window.print();
                    }, 300);
                  };
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
          return;
        }
      }
      
      // En Desktop ejecutar print nativo
      window.print();
    }
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
            padding: 0.35cm !important;
            margin: 0 !important;
            border: 1px dashed #ccc !important;
            box-shadow: none !important;
            page-break-inside: avoid;
            background: white !important;
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
            <span>Plantilla de Sticker Reutilizable (5x5 cm)</span>
          </div>
          <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
            Troquel 4x4 cm
          </span>
        </div>

        {/* PLANTILLA DE STICKER FÍSICO (Área que se imprime) */}
        <div
          id="sticker-print-area"
          className="w-64 h-64 sm:w-72 sm:h-72 bg-white rounded-3xl p-3 sm:p-4 border-2 border-dashed border-slate-300 flex flex-col items-center justify-between shadow-xs relative transition-all text-slate-900"
        >
          {/* Cabecera del Sticker */}
          <div className="flex flex-col items-center gap-0.5 text-center w-full">
            <div className="flex items-center justify-center gap-1.5 w-full">
              <span className="h-[1px] w-5 bg-slate-300 inline-block" />
              <span className="text-[10px] font-extrabold tracking-wider text-slate-700 uppercase">
                MIRA Y PIDE AQUÍ
              </span>
              <span className="h-[1px] w-5 bg-slate-300 inline-block" />
            </div>
            <h2 className="font-extrabold text-base sm:text-lg text-slate-950 tracking-tight truncate max-w-[210px] leading-tight">
              {storeName || 'Mi Tienda'}
            </h2>
          </div>

          {/* Imagen QR Dinámico con Logo de APANA en el centro */}
          {qrUrl ? (
            <div className="p-1.5 bg-white rounded-2xl border border-slate-100 shadow-2xs">
              <img src={qrUrl} alt={`QR ${storeName}`} className="w-32 h-32 sm:w-36 sm:h-36 object-contain" />
            </div>
          ) : (
            <div className="w-32 h-32 sm:w-36 sm:h-36 bg-slate-100 rounded-2xl flex flex-col items-center justify-center gap-2 animate-pulse">
              <QrCode size={32} className="text-slate-300" />
              <span className="text-[10px] text-slate-400 font-medium">Generando QR...</span>
            </div>
          )}

          {/* Pie del Sticker */}
          <div className="flex flex-col items-center gap-0.5 w-full text-center">
            <div className="inline-flex items-center justify-center gap-1.5 text-slate-950 font-extrabold text-xs sm:text-sm">
              <div className="w-5 h-5 rounded-full bg-slate-950 text-white flex items-center justify-center text-[10px]">
                📱
              </div>
              <span>Escanea para pedir</span>
            </div>
            <div className="w-8 h-[1px] bg-slate-200 my-0.5" />
            <span className="text-[8px] sm:text-[9px] font-semibold text-slate-500">
              Una tienda online de <strong className="text-slate-900 font-black tracking-tight">APANA</strong>
            </span>
          </div>
        </div>

        {/* Guía Informativa de Impresión */}
        <p className="text-[11px] text-slate-500 leading-snug no-print max-w-sm">
          💡 <strong>QR Dinámico & Permanente:</strong> Puedes cambiar el nombre o productos de tu tienda en cualquier momento; este QR nunca quedará obsoleto.
        </p>

        {/* Enlace y Copia */}
        <div className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2 no-print">
          <span className="text-xs text-[#0b1c30] font-mono truncate">{publicStoreUrl}</span>
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
            <a href={qrUrl} download={`qr-apana-${targetSlug || 'tienda'}-hd.png`} className="w-full">
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
