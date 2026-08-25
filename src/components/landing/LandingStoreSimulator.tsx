'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { 
  Sparkles, 
  ArrowRight, 
  Store as StoreIcon, 
  Palette, 
  QrCode as QrIcon, 
  Check, 
  Eye, 
  Copy,
  ExternalLink
} from 'lucide-react';
import { slugify } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/Button';

export const LandingStoreSimulator: React.FC = () => {
  const [storeName, setStoreName] = useState('Panadería Don José');
  const [selectedStyle, setSelectedStyle] = useState<'minimalista' | 'moderna' | 'elegante'>('moderna');
  const [selectedColor, setSelectedColor] = useState('#059669');
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const cleanSlug = slugify(storeName || 'mi-tienda') || 'mi-tienda';
  const fullUrl = `https://beapana.com/s/${cleanSlug}`;

  useEffect(() => {
    QRCode.toDataURL(fullUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0b1c30',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generando QR:', err));
  }, [fullUrl]);

  const colors = [
    { name: 'Esmeralda', hex: '#059669' },
    { name: 'Índigo', hex: '#4f46e5' },
    { name: 'Borgoña / Vino', hex: '#9f1239' },
    { name: 'Ámbar / Dorado', hex: '#d97706' },
    { name: 'Azul Marino', hex: '#0284c7' },
  ];

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
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#85f8c4]/15 blur-3xl rounded-full pointer-events-none -translate-y-1/2 -z-10" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-[#3b82f6]/10 blur-3xl rounded-full pointer-events-none -translate-y-1/2 -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#059669]/10 text-[#00855d] text-xs font-bold mb-3 border border-[#059669]/20 shadow-2xs">
            <Sparkles size={13} className="text-[#059669]" />
            <span>Simulador en Tiempo Real</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0b1c30] tracking-tight">
            Prueba cómo se verá tu tienda antes de crearla
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#3d4a42]">
            Escribe el nombre de tu negocio y mira cómo generamos al instante tu enlace y tu código QR listos para compartir.
          </p>
        </div>

        {/* Simulator Interactive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
          {/* Controls Panel */}
          <div className="lg:col-span-6 bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white shadow-xl shadow-slate-200/50 flex flex-col gap-6">
            {/* Input Nombre de Tienda */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-1.5">
                <StoreIcon size={14} className="text-[#059669]" />
                <span>Nombre de tu negocio</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="ej. Pastelería Dolce Vita"
                  maxLength={40}
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] transition-all"
                />
              </div>
            </div>

            {/* Selector de Estilo Visual */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-1.5">
                <Palette size={14} className="text-[#059669]" />
                <span>Elige tu estilo visual</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'minimalista', label: 'Minimalista', desc: 'Limpio y claro' },
                  { id: 'moderna', label: 'Moderna', desc: 'Vibrante y fresco' },
                  { id: 'elegante', label: 'Elegante', desc: 'Tonos cálidos' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStyle(st.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedStyle === st.id
                        ? 'bg-emerald-50 border-[#059669] ring-2 ring-[#059669]/20 shadow-2xs'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/80'
                    }`}
                  >
                    <p className="text-xs font-bold text-[#0b1c30]">{st.label}</p>
                    <p className="text-[10px] text-slate-500">{st.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de Color de Marca */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider">
                Color de Acento
              </label>
              <div className="flex items-center gap-3">
                {colors.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setSelectedColor(c.hex)}
                    title={c.name}
                    className={`w-8 h-8 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                      selectedColor === c.hex ? 'scale-110 ring-3 ring-offset-2 ring-[#059669]' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {selectedColor === c.hex && <Check size={14} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Registro */}
            <div className="pt-2 border-t border-slate-100">
              <Link href="/register">
                <Button
                  variant="primary"
                  fullWidth
                  className="h-12 text-sm font-bold shadow-md shadow-[#059669]/20 hover:shadow-lg hover:shadow-[#059669]/30 flex items-center justify-center gap-2"
                >
                  <span>Reclamar mi tienda gratis</span>
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Interactive Live Card & QR Preview */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl shadow-slate-300/40 relative overflow-hidden flex flex-col items-center text-center">
              {/* Decorative Header Bar */}
              <div
                className="w-full h-3 rounded-full mb-6 transition-colors duration-300"
                style={{ backgroundColor: selectedColor }}
              />

              {/* Dynamic QR Code */}
              <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-inner relative group mb-4">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR de ${storeName}`}
                    className="w-44 h-44 object-contain rounded-xl"
                  />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center bg-slate-50 text-slate-400 text-xs">
                    Generando QR...
                  </div>
                )}
                <div className="absolute inset-0 bg-white/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <QrIcon size={28} style={{ color: selectedColor }} />
                  <span className="text-xs font-bold text-slate-800">Escanear para abrir</span>
                </div>
              </div>

              {/* Store Identity */}
              <h3 className="font-extrabold text-lg text-[#0b1c30] line-clamp-1 mb-1">
                {storeName || 'Tu Tienda'}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Estilo <span className="font-semibold text-slate-700 capitalize">{selectedStyle}</span> • Catálogo Web Activo
              </p>

              {/* Generated URL Pill with Copy */}
              <div className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex items-center justify-between gap-2 mb-4">
                <span className="text-xs font-mono text-slate-600 truncate text-left select-all">
                  beapana.com/s/<strong className="text-emerald-700">{cleanSlug}</strong>
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-600 transition-colors cursor-pointer shrink-0"
                  title="Copiar enlace"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>

              {/* Interactive Demo Link */}
              <Link
                href={`/s/panaderia-don-jose`}
                target="_blank"
                className="text-xs font-bold flex items-center gap-1.5 hover:underline transition-colors"
                style={{ color: selectedColor }}
              >
                <Eye size={14} />
                <span>Ver catálogo en vivo de muestra</span>
                <ExternalLink size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
