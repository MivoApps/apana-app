'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { ArrowLeft, Download, Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/lib/firebase/auth-context';
import { useAppStore } from '@/lib/app-store';
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

  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const storeUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/s/${targetSlug}`
    : `https://apana.app/s/${targetSlug}`;

  useEffect(() => {
    QRCode.toDataURL(storeUrl, { width: 300, margin: 2 })
      .then(setQrUrl)
      .catch(console.error);
  }, [storeUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] px-4 py-6 max-w-md mx-auto flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <Link href="/dashboard" className="p-2 rounded-full hover:bg-gray-100 text-[#0b1c30]">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-[#0b1c30]">Código QR de la Tienda</h1>
      </header>

      <Card className="flex flex-col items-center text-center p-6 gap-4">
        <h2 className="font-semibold text-lg text-[#0b1c30]">{storeName}</h2>
        <p className="text-xs text-[#6d7a72]">Escanea con el celular para abrir la tienda pública</p>

        {qrUrl && (
          <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm my-2">
            <img src={qrUrl} alt="Código QR Tienda" className="w-56 h-56" />
          </div>
        )}

        <div className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center justify-between gap-2">
          <span className="text-xs text-[#0b1c30] font-mono truncate">{storeUrl}</span>
          <button onClick={handleCopy} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600">
            {copied ? <Check size={16} className="text-[#059669]" /> : <Copy size={16} />}
          </button>
        </div>

        <div className="flex flex-col w-full gap-2 mt-2">
          {qrUrl && (
            <a href={qrUrl} download={`qr-${targetSlug}.png`} className="w-full">
              <Button variant="primary" fullWidth className="flex items-center justify-center gap-2">
                <Download size={18} />
                Descargar Imagen QR
              </Button>
            </a>
          )}
          <Button variant="secondary" fullWidth onClick={handleCopy} className="flex items-center justify-center gap-2">
            <Share2 size={18} />
            {copied ? '¡Enlace Copiado!' : 'Copiar Enlace Directo'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
