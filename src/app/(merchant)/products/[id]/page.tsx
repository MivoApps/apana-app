'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Pencil, 
  Share2, 
  MessageCircle,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/whatsapp';

import { useAuth } from '@/lib/firebase/auth-context';
import { useAppStore } from '@/lib/app-store';
import { getStoreByUserIdFromFS, getProductByIdFromFS } from '@/lib/firebase/firestore';
import { Store, Product } from '@/types/store';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function ProductDetailPage({ params }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const { stores, activeStoreSlug } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [storeSlug, setStoreSlug] = useState<string>('');

  const resolvedParams = React.use(params);
  const productId = resolvedParams.id;

  React.useEffect(() => {
    const fetchProductDetails = async () => {
      if (!user) return;
      setIsLoading(true);

      const activeStore = stores[activeStoreSlug];
      let currentStoreId = activeStore?.id;
      let targetSlug = activeStore?.slug || activeStoreSlug;

      if (!currentStoreId) {
        const storeFromFS = await getStoreByUserIdFromFS(user.uid);
        if (storeFromFS) {
          currentStoreId = storeFromFS.id;
          targetSlug = storeFromFS.slug;
        }
      }

      setStoreSlug(targetSlug);

      if (currentStoreId) {
        const productFromFS = await getProductByIdFromFS(currentStoreId, productId);
        if (productFromFS) {
          setProduct(productFromFS);
        }
      }
      setIsLoading(false);
    };

    fetchProductDetails();
  }, [user, stores, activeStoreSlug, productId]);

  // Generar la URL pública real del producto para que los clientes del comerciante ingresen directo
  const getPublicProductUrl = () => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin;
    return `${origin}/s/${storeSlug || 'mi-tienda'}/p/${productId}`;
  };

  const handleShareLink = () => {
    const publicUrl = getPublicProductUrl();
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!product) return;
    const publicUrl = getPublicProductUrl();
    const message = `🛍️ *¡Mira este producto en nuestra tienda!*\n\n*${product.title}*\n💰 Precio: ${formatCurrency(product.price)}\n\n👉 Compra o mira los detalles aquí:\n${publicUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center text-[#0b1c30] gap-3 font-sans">
        <div className="w-10 h-10 border-4 border-[#059669] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium text-[#6d7a72]">Cargando detalle del producto...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center text-[#0b1c30] p-4 text-center font-sans gap-3">
        <span className="text-4xl">🔍</span>
        <h2 className="font-bold text-lg">Producto no encontrado</h2>
        <p className="text-xs text-[#6d7a72]">El producto que buscas no existe o fue eliminado.</p>
        <Button variant="primary" onClick={() => router.push('/products')} className="mt-2 h-10 px-4 text-sm font-semibold">
          Volver a mis productos
        </Button>
      </div>
    );
  }

  const handleBack = () => {
    if (typeof window !== 'undefined' && document.referrer && document.referrer.includes(window.location.host)) {
      router.back();
    } else {
      router.push('/products');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans relative pb-12">
      {/* Header App Bar Stitch */}
      <header className="fixed top-0 w-full z-50 bg-[#f8f9ff]/80 backdrop-blur-xl border-b border-[#bccac0]/20">
        <div className="h-14 flex items-center px-4 max-w-[640px] mx-auto gap-2">
          <button
            onClick={handleBack}
            className="p-1.5 rounded-full hover:bg-gray-100 text-[#0b1c30] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-lg text-[#0b1c30]">Detalle de Producto</h1>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-14 px-4 max-w-[640px] w-full mx-auto flex flex-col gap-6">
        {/* Imagen del Producto con Botón Editar flotante */}
        <div className="w-full relative h-[320px] rounded-2xl overflow-hidden shadow-xs mt-3 bg-gray-100">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80'}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1c30]/20 via-transparent to-transparent pointer-events-none" />

          {/* Botón flotante Editar exclusivo para el lápiz */}
          <div className="absolute top-3 right-3 z-10">
            <Link href={`/products/${product.id}/edit`}>
              <button className="bg-white/90 backdrop-blur-md text-[#0b1c30] h-10 px-4 rounded-full font-semibold text-sm flex items-center gap-1.5 shadow-md hover:bg-white active:scale-95 transition-all">
                <Pencil size={16} />
                Editar
              </button>
            </Link>
          </div>
        </div>

        {/* Tarjeta de Información */}
        <div className="bg-white rounded-2xl p-5 border border-[#bccac0]/40 shadow-xs flex flex-col gap-3">
          <div className="flex justify-between items-start gap-3">
            <h1 className="text-xl font-bold text-[#0b1c30] leading-tight">
              {product.title}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                product.inStock !== false
                  ? 'bg-[#059669] text-white'
                  : 'bg-gray-200 text-[#6d7a72]'
              }`}
            >
              {product.inStock !== false ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          <div className="text-xl font-bold text-[#059669]">
            {formatCurrency(product.price)}
          </div>

          <p className="text-sm text-[#3d4a42] leading-relaxed pt-1 border-t border-gray-100 mt-1">
            {product.description || 'Sin descripción ingresada.'}
          </p>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col gap-3">
          {/* Compartir Enlace */}
          <Button
            onClick={handleShareLink}
            variant="primary"
            fullWidth
            className="h-12 rounded-xl flex items-center justify-center gap-2 text-base font-semibold bg-[#059669] hover:bg-[#00855d]"
          >
            {copied ? <Check size={18} /> : <Share2 size={18} />}
            {copied ? '¡Enlace Copiado!' : 'Compartir Enlace'}
          </Button>

          {/* Compartir por WhatsApp */}
          <Button
            onClick={handleShareWhatsApp}
            variant="whatsapp"
            fullWidth
            className="h-12 rounded-xl flex items-center justify-center gap-2 text-base font-semibold text-white bg-[#25D366] hover:bg-[#20bd5a]"
          >
            <MessageCircle size={18} />
            Compartir por WhatsApp
          </Button>
        </div>
      </main>
    </div>
  );
}
