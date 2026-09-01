'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Camera,
  User,
  Save,
  ArrowLeft,
  AlertTriangle,
  Zap,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

import { compressAndCropImage, formatBytes } from '@/lib/image-optimizer';
import { useAuth } from '@/lib/firebase/auth-context';
import { addProductToFS } from '@/lib/firebase/firestore';
import { ProductVariantsEditor } from '@/components/merchant/ProductVariantsEditor';
import { ProductOptionGroup } from '@/types/store';

const DEMO_IMAGES = [
  {
    id: 'bakery',
    name: 'Panadería',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'dessert',
    name: 'Postres',
    url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'fashion',
    name: 'Moda/Ropa',
    url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'food',
    name: 'Comida',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'beverage',
    name: 'Bebidas',
    url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=500&q=80',
  },
];

export default function CreateProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFromWizard = searchParams.get('from') === 'wizard';

  const handleBackClick = () => {
    router.replace('/dashboard');
  };

  const { user, loading: authLoading } = useAuth();
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCompareAtPrice, setProductCompareAtPrice] = useState('');
  const [productBadge, setProductBadge] = useState<'nuevo' | 'top' | 'oferta' | ''>('');
  const [productDesc, setProductDesc] = useState('');
  const [productOptions, setProductOptions] = useState<ProductOptionGroup[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageInfo, setImageInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicialización instantánea con caché de sesión (0ms)
  const [fsStore, setFsStore] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem('apana_active_store');
        if (cached) return JSON.parse(cached);
      } catch (_) {}
    }
    return null;
  });

  const [storePlan, setStorePlan] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem('apana_active_store');
        if (cached) {
          const parsed = JSON.parse(cached);
          return parsed?.plan || 'gratis';
        }
      } catch (_) {}
    }
    return 'gratis';
  });

  const [storeCategories, setStoreCategories] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem('apana_active_store');
        if (cached) {
          const parsed = JSON.parse(cached);
          return parsed?.categories || [];
        }
      } catch (_) {}
    }
    return [];
  });

  const [productsCount, setProductsCount] = useState<number>(0);
  const [productCategory, setProductCategory] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Si ya tenemos datos en caché, no bloqueamos la vista con un spinner
  const [checkingLimit, setCheckingLimit] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('apana_active_store');
    }
    return true;
  });

  React.useEffect(() => {
    let isMounted = true;
    const safetyTimer = setTimeout(() => {
      if (isMounted) setCheckingLimit(false);
    }, 1000);

    const fetchStoreAndProducts = async () => {
      if (authLoading) return;
      if (!user) {
        if (isMounted) setCheckingLimit(false);
        return;
      }

      try {
        const { getStoreByUserIdFromFS, getProductsByStoreIdFromFS } = await import('@/lib/firebase/firestore');
        const storeFromFS = await getStoreByUserIdFromFS(user.uid);
        if (storeFromFS && isMounted) {
          setFsStore(storeFromFS);
          setStorePlan(storeFromFS.plan || 'gratis');
          setStoreCategories(storeFromFS.categories || []);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('apana_active_store', JSON.stringify(storeFromFS));
            sessionStorage.setItem(`apana_cache_store_${user.uid}`, JSON.stringify(storeFromFS));
          }
          const prods = await getProductsByStoreIdFromFS(storeFromFS.id);
          if (isMounted) setProductsCount(prods.length);
        }
      } catch (e) {
        console.warn('Aviso verificando límites:', e);
      } finally {
        if (isMounted) {
          clearTimeout(safetyTimer);
          setCheckingLimit(false);
        }
      }
    };

    fetchStoreAndProducts();

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, [user, authLoading]);

  const maxImagesLimit = storePlan === 'gratis' ? 1 : storePlan === 'emprendedor' ? 4 : 8;
  const productLimit = storePlan === 'gratis' ? 25 : storePlan === 'emprendedor' ? 150 : 999999;
  const isLimitReached = productsCount >= productLimit;

  const handleImageAppend = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const result = await compressAndCropImage(file, {
          maxWidth: 500,
          maxHeight: 500,
          quality: 0.55,
          outputFormat: 'image/webp',
        });
        setImagePreviews((prev) => {
          const cleanPrev = prev.filter(Boolean);
          if (maxImagesLimit === 1) {
            return [result.dataUrl];
          }
          if (cleanPrev.length >= maxImagesLimit) {
            return [...cleanPrev.slice(0, maxImagesLimit - 1), result.dataUrl];
          }
          return [...cleanPrev, result.dataUrl];
        });
        setImageInfo(
          `Imagen optimizada (${formatBytes(result.originalSize)} ➔ ${formatBytes(result.optimizedSize)})`
        );
      } catch (error) {
        console.error('Error optimizando imagen:', error);
        const url = URL.createObjectURL(file);
        setImagePreviews((prev) => {
          const cleanPrev = prev.filter(Boolean);
          if (maxImagesLimit === 1) {
            return [url];
          }
          if (cleanPrev.length >= maxImagesLimit) {
            return [...cleanPrev.slice(0, maxImagesLimit - 1), url];
          }
          return [...cleanPrev, url];
        });
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageInfo(null);
  };

  const handleSelectDemoImage = (url: string) => {
    setImagePreviews((prev) => {
      const cleanPrev = prev.filter(Boolean);
      // Si el plan permite 1 sola imagen (o ya tiene 1), reemplazarla automáticamente sin alertas
      if (maxImagesLimit === 1) {
        return [url];
      }
      if (cleanPrev.includes(url)) return prev;
      if (cleanPrev.length >= maxImagesLimit) {
        return [...cleanPrev.slice(0, maxImagesLimit - 1), url];
      }
      return [...cleanPrev, url];
    });
    setImageInfo('Imagen seleccionada.');
  };

  const handleCreateCategoryInline = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed || !user || !fsStore) return;

    if (storeCategories.includes(trimmed)) {
      alert('Esta categoría ya existe.');
      return;
    }

    const updatedCategories = [...storeCategories, trimmed];
    setStoreCategories(updatedCategories);
    setProductCategory(trimmed);
    setNewCategoryName('');
    setShowNewCategoryInput(false);

    try {
      const { createOrUpdateStoreInFS } = await import('@/lib/firebase/firestore');
      await createOrUpdateStoreInFS(user.uid, {
        ...fsStore,
        categories: updatedCategories
      });
      sessionStorage.removeItem(`apana_cache_store_${user.uid}`);
    } catch (error) {
      console.error('Error saving new category inline:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLimitReached) {
      alert('Has alcanzado el límite de productos de tu plan.');
      return;
    }
    if (!productName.trim() || !productPrice || !user) return;
    setIsSubmitting(true);

    const { getStoreByUserIdFromFS } = await import('@/lib/firebase/firestore');
    let realStore = fsStore || await getStoreByUserIdFromFS(user.uid);
    const storeId = realStore?.id || `store_${user.uid}`;
    const targetSlug = realStore?.slug || 'mi-tienda';

    // Limpiar urls vacias
    const cleanPreviews = imagePreviews.filter(Boolean);
    
    // Subir imágenes a Firebase Cloud Storage si son base64 (reduce el peso de Firestore en 98%)
    const { uploadImageToStorage, dataURLtoBlob } = await import('@/lib/firebase/storage');
    const uploadedImages: string[] = [];

    for (let i = 0; i < cleanPreviews.length; i++) {
      const img = cleanPreviews[i];
      if (img.startsWith('data:')) {
        try {
          const blob = dataURLtoBlob(img);
          const storagePath = `stores/${storeId}/products/prod_${Date.now()}_${i}.webp`;
          const cdnUrl = await uploadImageToStorage(blob, storagePath);
          uploadedImages.push(cdnUrl);
        } catch (uploadErr) {
          console.error('Error subiendo imagen a Storage, fallback a dataUrl:', uploadErr);
          uploadedImages.push(img);
        }
      } else {
        uploadedImages.push(img);
      }
    }

    const defaultImage = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80';
    const primaryImg = uploadedImages[0] || defaultImage;
    const allImgs = uploadedImages.length > 0 ? uploadedImages : [defaultImage];

    // Validar opciones obligatorias si se añadieron grupos
    if (productOptions.length > 0) {
      const unnamedGroup = productOptions.find(g => !g.title.trim());
      if (unnamedGroup) {
        alert('Por favor ingresa un nombre para todos los grupos de opciones (ej: Talla, Color, Sabor, etc.).');
        setIsSubmitting(false);
        return;
      }
      const emptyValuesGroup = productOptions.find(
        g => g.values.filter(v => v.name.trim() !== '').length === 0
      );
      if (emptyValuesGroup) {
        alert(`El grupo "${emptyValuesGroup.title}" debe tener al menos una opción con nombre.`);
        setIsSubmitting(false);
        return;
      }
    }

    // Limpiar grupos de opciones vacíos y auto-corregir nombres con 0 accidental
    const cleanOptions = productOptions
      .map(group => ({
        ...group,
        title: group.title.trim(),
        values: group.values
          .map(v => {
            let name = v.name.trim();
            // Si no tiene precio diferencial o es 0, quitar cualquier " 0" accidental al final
            if (!v.priceDifference || v.priceDifference === 0) {
              name = name.replace(/\s+0+(\.0+)?$/, '').trim();
            }
            return {
              ...v,
              name,
              priceDifference: v.priceDifference && v.priceDifference > 0 ? v.priceDifference : 0,
            };
          })
          .filter(v => v.name.trim() !== '')
      }))
      .filter(group => group.values.length > 0);

    try {
      const parsedCompare = productCompareAtPrice ? parseFloat(productCompareAtPrice) : null;
      const validCompare = parsedCompare && !isNaN(parsedCompare) && parsedCompare > 0 ? parsedCompare : null;

      const newProduct: any = {
        id: `prod_${Date.now()}`,
        storeId,
        title: productName,
        price: parseFloat(productPrice),
        description: productDesc,
        imageUrl: primaryImg,
        imageUrls: allImgs,
        category: (storePlan === 'emprendedor' || storePlan === 'negocio') ? productCategory : '',
        options: cleanOptions.length > 0 ? cleanOptions : [],
        inStock: true,
        createdAt: Date.now(),
      };

      if (storePlan !== 'gratis' && validCompare) {
        newProduct.compareAtPrice = validCompare;
      }
      if (storePlan !== 'gratis' && productBadge) {
        newProduct.badge = productBadge;
      }

      await addProductToFS(storeId, newProduct);

      const rawCached = sessionStorage.getItem(`apana_cache_prods_${user.uid}`);
      let cachedProds = [];
      if (rawCached) {
        try { cachedProds = JSON.parse(rawCached); } catch (e) {}
      }
      sessionStorage.setItem(`apana_cache_prods_${user.uid}`, JSON.stringify([newProduct, ...cachedProds]));
    } catch (err: any) {
      console.error('Error al guardar producto en Firestore:', err);
      alert(`No se pudo publicar el producto: ${err?.message || 'Error de almacenamiento'}`);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);

    const storePhone = realStore?.whatsappPhone || '';
    const hasPhoneConfigured = storePhone.trim() !== '';
    const isWhatsappVerified = Boolean(realStore?.isWhatsappVerified);

    if (!hasPhoneConfigured || !isWhatsappVerified) {
      window.location.href = '/dashboard?verifyWhatsapp=true';
    } else {
      router.replace('/products');
    }
  };

  if (checkingLimit) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center text-[#0b1c30] gap-3">
        <div className="w-10 h-10 border-4 border-[#059669] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium text-[#6d7a72]">Verificando límites...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans relative pb-8">
      {/* App Bar Superior Fija */}
      <header className="fixed top-0 w-full z-40 bg-[#f8f9ff]/80 backdrop-blur-xl border-b border-[#bccac0]/20">
        <div className="h-14 flex items-center justify-between px-4 max-w-[640px] mx-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBackClick}
              className="p-1.5 rounded-full hover:bg-gray-100 text-[#0b1c30] transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-bold text-lg text-[#0b1c30]">Crear Producto</h1>
          </div>
          <Link href="/settings" title="Ir a Ajustes" className="transition-transform active:scale-95">
            <div className="w-8 h-8 rounded-full bg-[#059669] flex items-center justify-center text-white hover:opacity-90 cursor-pointer shadow-2xs">
              <User size={18} />
            </div>
          </Link>
        </div>
      </header>

      {/* Main Container Form */}
      <main className="pt-16 px-4 max-w-[640px] w-full mx-auto flex flex-col gap-6">
        
        {/* Límite Alcanzado Banner */}
        {isLimitReached ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 flex flex-col gap-4 text-center items-center shadow-xs mt-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle size={26} />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold text-red-950">Límite de productos alcanzado</h2>
              <p className="text-xs text-red-800 leading-relaxed max-w-sm">
                Tu plan actual es **{storePlan === 'gratis' ? 'Gratis' : 'Emprendedor' }**, el cual tiene un límite de **{productLimit} productos** y actualmente tienes **{productsCount}** publicados.
              </p>
            </div>
            <Link href="/plans?from=/products/new" className="w-full">
              <Button variant="primary" fullWidth className="bg-emerald-600 text-white font-bold flex items-center justify-center gap-2">
                <Zap size={16} />
                Mejorar mi Plan
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-2">
            
            {/* Zona de Carga de Imágenes (Diseño escalable y dinámico) */}
            <div className="flex flex-col gap-2">
              {(() => {
                const maxImagesLimit = storePlan === 'gratis' ? 1 : storePlan === 'emprendedor' ? 4 : 8;
                const cleanPreviews = imagePreviews.filter(Boolean);
                
                return (
                  <>
                    <label className="text-sm font-semibold text-[#0b1c30] ml-1">
                      Imágenes del Producto ({cleanPreviews.length} / {maxImagesLimit})
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {/* Renderizar imágenes cargadas */}
                      {cleanPreviews.map((imgUrl, index) => (
                        <div
                          key={index}
                          className="relative aspect-square bg-[#eff4ff] rounded-xl border border-[#bccac0]/40 overflow-hidden group shadow-2xs"
                        >
                          <img
                            src={imgUrl}
                            alt={`Foto ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          
                          {/* Badge Portada/Adicional */}
                          {index === 0 ? (
                            <span className="absolute bottom-2 left-2 bg-[#059669] text-white text-[9px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-xs">
                              Portada
                            </span>
                          ) : (
                            <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
                              Foto {index + 1}
                            </span>
                          )}

                          {/* Botón de Eliminar */}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white transition-all shadow-xs z-10"
                            title="Eliminar foto"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}

                      {/* Botón para Añadir Nueva Foto */}
                      {cleanPreviews.length < maxImagesLimit && (
                        <label className="relative aspect-square bg-[#eff4ff] hover:bg-[#e4ecfc] border-2 border-dashed border-[#059669]/40 hover:border-[#059669] rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageAppend}
                            className="hidden"
                          />
                          <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#059669] flex items-center justify-center">
                            <Camera size={20} />
                          </div>
                          <span className="text-xs font-bold text-[#059669]">Agregar Foto</span>
                          <span className="text-[9px] text-[#6d7a72] text-center px-1">
                            {storePlan === 'gratis'
                              ? 'Plan Gratis'
                              : storePlan === 'emprendedor'
                                ? 'Plan Emprendedor (Máx 4)'
                                : 'Plan Negocio Pro (Hasta 8)'}
                          </span>
                        </label>
                      )}
                    </div>
                    {/* Selector de imágenes demo */}
                    <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-dashed border-[#bccac0]/30 w-full">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">¿No tienes fotos? Elige una de muestra:</span>
                      <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
                        {DEMO_IMAGES.map((img) => (
                          <button
                            key={img.id}
                            type="button"
                            onClick={() => handleSelectDemoImage(img.url)}
                            className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#bccac0]/30 hover:border-[#059669] hover:scale-105 active:scale-95 transition-all flex-shrink-0"
                            title={`Usar foto de ${img.name}`}
                          >
                            <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/15 hover:bg-transparent transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}

              {imageInfo && (
                <span className="text-[11px] text-[#059669] font-medium text-center bg-emerald-50 py-1 px-3 rounded-full self-center mt-1">
                  ✨ {imageInfo}
                </span>
              )}
            </div>

            {/* Form Fields */}
            <div className="flex flex-col gap-4">
              
              {/* Nombre del Producto */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="productName" className="text-sm font-semibold text-[#0b1c30] ml-1">
                  Nombre del Producto
                </label>
                <input
                  id="productName"
                  type="text"
                  required
                  placeholder="ej., Zapatillas de Cuero Blancas"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full h-12 px-4 bg-white border border-[#bccac0]/50 rounded-lg text-sm text-[#0b1c30] placeholder:text-[#6d7a72]/60 focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition-all shadow-xs"
                />
              </div>

              {/* Precios: Validación según Plan */}
              {storePlan === 'gratis' ? (
                <div className="flex flex-col gap-3">
                  {/* Precio de Venta (Único en Plan Gratis) */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="productPrice" className="text-sm font-semibold text-[#0b1c30] ml-1">
                      Precio
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#6d7a72] font-semibold">
                        S/
                      </span>
                      <input
                        id="productPrice"
                        type="number"
                        inputMode="decimal"
                        required
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={productPrice}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.includes('.')) {
                            const parts = val.split('.');
                            if (parts[1] && parts[1].length > 2) {
                              setProductPrice(`${parts[0]}.${parts[1].slice(0, 2)}`);
                              return;
                            }
                          }
                          setProductPrice(val);
                        }}
                        onBlur={() => {
                          if (productPrice && !isNaN(parseFloat(productPrice))) {
                            setProductPrice(parseFloat(productPrice).toFixed(2));
                          }
                        }}
                        className="w-full h-12 pl-8 pr-4 bg-white border border-[#bccac0]/50 rounded-xl text-base sm:text-sm text-[#0b1c30] placeholder:text-[#6d7a72]/60 focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Banner Explicativo de Plan Emprendedor */}
                  <div className="p-3 bg-linear-to-r from-emerald-50/80 to-teal-50/80 border border-emerald-200/80 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#059669] flex items-center justify-center font-bold text-xs shrink-0">
                        🔥
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#0b1c30]">
                          Precios de Oferta e Insignias
                        </span>
                        <span className="text-[11px] text-[#6d7a72]">
                          Desbloquea precios tachados (-% OFF) e insignias destacadas en el Plan Emprendedor.
                        </span>
                      </div>
                    </div>
                    <Link href="/plans?from=/products/new">
                      <button
                        type="button"
                        className="text-xs font-bold text-[#059669] hover:text-[#00855d] bg-white border border-emerald-300 px-2.5 py-1.5 rounded-lg shadow-2xs shrink-0 cursor-pointer"
                      >
                        Mejorar ↗
                      </button>
                    </Link>
                  </div>
                </div>
              ) : (
                (() => {
                  const currentP = parseFloat(productPrice) || 0;
                  const compareP = parseFloat(productCompareAtPrice) || 0;
                  const discountPct = (compareP > currentP && currentP > 0)
                    ? Math.round(((compareP - currentP) / compareP) * 100)
                    : 0;

                  return (
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Precio Actual */}
                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="productPrice" className="text-sm font-semibold text-[#0b1c30] ml-1 flex items-center justify-between">
                            <span>Precio de Venta</span>
                            <span className="text-[10px] text-[#059669] font-bold">Principal</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#6d7a72] font-semibold">
                              S/
                            </span>
                            <input
                              id="productPrice"
                              type="number"
                              inputMode="decimal"
                              required
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={productPrice}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val.includes('.')) {
                                  const parts = val.split('.');
                                  if (parts[1] && parts[1].length > 2) {
                                    setProductPrice(`${parts[0]}.${parts[1].slice(0, 2)}`);
                                    return;
                                  }
                                }
                                setProductPrice(val);
                              }}
                              onBlur={() => {
                                if (productPrice && !isNaN(parseFloat(productPrice))) {
                                  setProductPrice(parseFloat(productPrice).toFixed(2));
                                }
                              }}
                              className="w-full h-12 pl-8 pr-4 bg-white border border-[#bccac0]/50 rounded-xl text-base sm:text-sm text-[#0b1c30] placeholder:text-[#6d7a72]/60 focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition-all shadow-xs"
                            />
                          </div>
                        </div>

                        {/* Precio Antes / Tachado (Opcional) */}
                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="productCompareAtPrice" className="text-sm font-semibold text-[#0b1c30] ml-1 flex items-center justify-between">
                            <span>Precio Antes (Tachado)</span>
                            <span className="text-[10px] text-slate-400 font-medium">Opcional</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-semibold">
                              S/
                            </span>
                            <input
                              id="productCompareAtPrice"
                              type="number"
                              inputMode="decimal"
                              step="0.01"
                              min="0"
                              placeholder="ej: 89.00"
                              value={productCompareAtPrice}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val.includes('.')) {
                                  const parts = val.split('.');
                                  if (parts[1] && parts[1].length > 2) {
                                    setProductCompareAtPrice(`${parts[0]}.${parts[1].slice(0, 2)}`);
                                    return;
                                  }
                                }
                                setProductCompareAtPrice(val);
                              }}
                              onBlur={() => {
                                if (productCompareAtPrice && !isNaN(parseFloat(productCompareAtPrice))) {
                                  setProductCompareAtPrice(parseFloat(productCompareAtPrice).toFixed(2));
                                }
                              }}
                              className="w-full h-12 pl-8 pr-4 bg-white border border-[#bccac0]/50 rounded-xl text-base sm:text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition-all shadow-xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Descuento automático calculado */}
                      {discountPct > 0 && (
                        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold flex items-center justify-between">
                          <span>🔥 Etiqueta de descuento en tienda:</span>
                          <span className="bg-red-600 text-white px-2.5 py-0.5 rounded-full text-xs">
                            -{discountPct}% OFF
                          </span>
                        </div>
                      )}

                      {/* Selector de Insignia de Producto */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-700 ml-1">
                          Insignia en la Tienda (Opcional)
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { id: '', label: 'Ninguna', icon: '⚪' },
                            { id: 'nuevo', label: 'Nuevo', icon: '✨' },
                            { id: 'top', label: 'Top Ventas', icon: '🔥' },
                            { id: 'oferta', label: 'Oferta', icon: '🏷️' },
                          ].map((b) => (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => setProductBadge(b.id as any)}
                              className={`h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                                productBadge === b.id
                                  ? 'bg-[#059669]/10 border-[#059669] text-[#059669] shadow-2xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <span>{b.icon}</span>
                              <span>{b.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* Categoría del Producto (Sólo Plan Emprendedor y Negocio) */}
              {storePlan !== 'gratis' && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <div className="flex items-center gap-2">
                      <label htmlFor="productCategory" className="text-sm font-semibold text-[#0b1c30]">
                        Categoría del Producto
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowNewCategoryInput(!showNewCategoryInput)}
                        className="text-xs font-extrabold text-[#059669] hover:underline transition-all"
                      >
                        {showNewCategoryInput ? 'Cancelar' : '+ Nueva'}
                      </button>
                    </div>
                    <span className="text-xs text-slate-500">
                      {storePlan === 'negocio' ? 'Plan Negocio Pro' : 'Plan Emprendedor'}
                    </span>
                  </div>

                  {showNewCategoryInput ? (
                    <div className="flex gap-2 pt-0.5">
                      <input
                        type="text"
                        placeholder="Nombre de la categoría (ej: Bebidas)"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="h-11 flex-1 bg-white border border-[#bccac0]/50 rounded-lg px-3.5 text-sm text-[#0b1c30] focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition-all shadow-xs"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCreateCategoryInline();
                          }
                        }}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleCreateCategoryInline}
                        className="px-4 bg-[#059669] text-white rounded-lg font-bold text-xs hover:bg-[#00855d] transition-colors"
                      >
                        Crear
                      </button>
                    </div>
                  ) : (
                    <select
                      id="productCategory"
                      value={productCategory}
                      onChange={(e) => setProductCategory(e.target.value)}
                      className="w-full h-12 px-4 bg-white border border-[#bccac0]/50 rounded-lg text-sm text-[#0b1c30] focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition-all shadow-xs"
                    >
                      <option value="">Ninguna (Sin Categoría)</option>
                      {storeCategories.map((cat, idx) => (
                        <option key={idx} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Descripción (Opcional) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label htmlFor="productDesc" className="text-sm font-semibold text-[#0b1c30]">
                    Descripción
                  </label>
                  <span className="text-xs text-[#6d7a72]">Opcional</span>
                </div>
                <textarea
                  id="productDesc"
                  rows={3}
                  placeholder="Añade algunos detalles sobre este producto..."
                  value={productDesc}
                  onChange={(e) => setProductDesc(e.target.value)}
                  className="w-full p-3 bg-white border border-[#bccac0]/50 rounded-lg text-sm text-[#0b1c30] placeholder:text-[#6d7a72]/60 focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition-all resize-none shadow-xs"
                />
              </div>

              {/* Editor de Variantes / Opciones */}
              <ProductVariantsEditor
                options={productOptions}
                onChange={setProductOptions}
                storePlan={storePlan}
                basePrice={parseFloat(productPrice) || 0}
                availableImages={imagePreviews.filter(Boolean)}
              />
            </div>

            {/* Overlay de carga cuando isSubmitting está activo */}
            {isSubmitting && (
              <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-3 p-4">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin shadow-lg" />
                <div className="flex flex-col items-center text-center gap-1">
                  <span className="font-bold text-base">Optimizando y Publicando...</span>
                  <span className="text-xs text-white/80">Guardando tu producto en la tienda.</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isSubmitting}
              className="h-12 flex items-center justify-center gap-2 text-base font-semibold mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Guardar Producto</span>
                </>
              )}
            </Button>
          </form>
        )}
      </main>
    </div>
  );
}
