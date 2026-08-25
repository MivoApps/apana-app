'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Camera, 
  User, 
  Save, 
  Trash2, 
  Home, 
  Package, 
  ShoppingBag, 
  Settings,
  ArrowLeft,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/firebase/auth-context';
import { useAppStore } from '@/lib/app-store';
import { getStoreByUserIdFromFS, getProductByIdFromFS, updateProductInFS, deleteProductFromFS } from '@/lib/firebase/firestore';
import { compressAndCropImage, formatBytes } from '@/lib/image-optimizer';
import { ProductVariantsEditor } from '@/components/merchant/ProductVariantsEditor';
import { ProductOptionGroup } from '@/types/store';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function EditProductPage({ params }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const { stores, activeStoreSlug, updateProduct, deleteProduct } = useAppStore();
  const resolvedParams = React.use(params);
  const productId = resolvedParams.id;

  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [productOptions, setProductOptions] = useState<ProductOptionGroup[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageInfo, setImageInfo] = useState<string | null>(null);
  const [inStock, setInStock] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storeId, setStoreId] = useState<string>('');
  const [storePlan, setStorePlan] = useState<string>('gratis');
  const [storeCategories, setStoreCategories] = useState<string[]>([]);
  const [productCategory, setProductCategory] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [fsStore, setFsStore] = useState<any>(null);

  React.useEffect(() => {
    const loadProductData = async () => {
      if (!user) return;
      setIsLoading(true);

      const activeStore = stores[activeStoreSlug];
      let currentStoreId = activeStore?.id;

      if (!currentStoreId) {
        const storeFromFS = await getStoreByUserIdFromFS(user.uid);
        if (storeFromFS) {
          setFsStore(storeFromFS);
          currentStoreId = storeFromFS.id;
          setStorePlan(storeFromFS.plan || 'gratis');
          setStoreCategories(storeFromFS.categories || []);
        }
      } else {
        const storeFromFS = await getStoreByUserIdFromFS(user.uid);
        if (storeFromFS) {
          setFsStore(storeFromFS);
          setStorePlan(storeFromFS.plan || 'gratis');
          setStoreCategories(storeFromFS.categories || []);
        }
      }

      if (currentStoreId) {
        setStoreId(currentStoreId);
        const productFromFS = await getProductByIdFromFS(currentStoreId, productId);
        if (productFromFS) {
          setProductName(productFromFS.title);
          setProductPrice(productFromFS.price.toString());
          setProductDesc(productFromFS.description || '');
          setProductOptions(productFromFS.options || []);
          const imgs = productFromFS.imageUrls && productFromFS.imageUrls.length > 0
            ? productFromFS.imageUrls
            : [productFromFS.imageUrl || ''];
          setImagePreviews(imgs);
          setInStock(productFromFS.inStock !== false);
          setProductCategory(productFromFS.category || '');
        }
      }
      setIsLoading(false);
    };

    loadProductData();
  }, [user, stores, activeStoreSlug, productId]);

  const handleImageAppend = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxImagesLimit = storePlan === 'gratis' ? 1 : storePlan === 'emprendedor' ? 4 : 8;
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

  const handleCreateCategoryInline = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed || !user || !storeId || !fsStore) return;

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !productPrice) return;
    setIsSubmitting(true);

    const cleanPreviews = imagePreviews.filter(Boolean);

    // Subir imágenes a Firebase Cloud Storage si son base64 (reduce el peso de Firestore en 98%)
    const { uploadImageToStorage, dataURLtoBlob } = await import('@/lib/firebase/storage');
    const uploadedImages: string[] = [];

    for (let i = 0; i < cleanPreviews.length; i++) {
      const img = cleanPreviews[i];
      if (img.startsWith('data:')) {
        try {
          const blob = dataURLtoBlob(img);
          const storagePath = `stores/${storeId}/products/prod_${productId}_${Date.now()}_${i}.webp`;
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

    const priceNum = parseFloat(productPrice);

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
            if ((!v.priceDifference || v.priceDifference === 0) && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+\s+0$/.test(name)) {
              name = name.replace(/\s+0$/, '');
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

    // Actualizar en Firestore exclusivamente
    if (storeId && user) {
      try {
        await updateProductInFS(storeId, productId, {
          title: productName,
          price: priceNum,
          description: productDesc,
          imageUrl: primaryImg,
          imageUrls: allImgs,
          options: cleanOptions.length > 0 ? cleanOptions : [],
          inStock,
          category: (storePlan === 'emprendedor' || storePlan === 'negocio') ? productCategory : '',
        });
        sessionStorage.removeItem(`apana_cache_prods_${user.uid}`);
      } catch (err: any) {
        console.error('Error actualizando producto en Firestore:', err);
        alert(`No se pudieron guardar los cambios: ${err?.message || 'Error de Firestore'}`);
        setIsSubmitting(false);
        return;
      }
    }

    setIsSubmitting(false);
    router.push('/products');
  };

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      setIsSubmitting(true);
      if (storeId && user) {
        await deleteProductFromFS(storeId, productId);
        sessionStorage.removeItem(`apana_cache_prods_${user.uid}`);
      }
      setIsSubmitting(false);
      router.push('/products');
    }
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && document.referrer && document.referrer.includes(window.location.host)) {
      router.back();
    } else {
      router.push('/products');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center text-[#0b1c30] gap-3">
        <div className="w-10 h-10 border-4 border-[#059669] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium text-[#6d7a72]">Cargando producto...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans relative pb-28">
      {/* App Bar Superior Fija Stitch */}
      <header className="fixed top-0 w-full z-40 bg-[#f8f9ff]/80 backdrop-blur-xl border-b border-[#bccac0]/20">
        <div className="h-14 flex items-center justify-between px-4 max-w-[640px] mx-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="p-1.5 rounded-full hover:bg-gray-100 text-[#0b1c30] transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-bold text-lg text-[#0b1c30]">Editar Producto</h1>
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
        {/* Zona de Carga de Imágenes (Soporta múltiples en Emprendedor) */}
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
              </>
            );
          })()}

          {imageInfo && (
            <span className="text-[11px] text-[#059669] font-medium text-center bg-emerald-50 py-1 px-3 rounded-full self-center mt-1">
              ✨ {imageInfo}
            </span>
          )}
        </div>

        {/* Form Details Section Stitch */}
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            {/* Nombre */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="productName" className="text-sm font-semibold text-[#0b1c30]">
                Nombre
              </label>
              <input
                id="productName"
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="h-12 w-full bg-white border border-[#bccac0]/50 rounded-lg px-4 text-sm text-[#0b1c30] focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition-all shadow-xs"
              />
            </div>

            {/* Categoría del Producto (Sólo Plan Emprendedor) */}
            {storePlan === 'emprendedor' && (
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
                  <span className="text-xs text-slate-500">Plan Emprendedor</span>
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

            {/* Precio */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="productPrice" className="text-sm font-semibold text-[#0b1c30]">
                Precio (S/)
              </label>
              <input
                id="productPrice"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                required
                value={productPrice}
                onChange={(e) => {
                  const val = e.target.value;
                  // Evitar que se escriban más de 2 decimales
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
                className="h-12 w-full bg-white border border-[#bccac0]/50 rounded-lg px-4 text-base sm:text-sm text-[#0b1c30] focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition-all shadow-xs"
              />
            </div>

            {/* Descripción */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="productDesc" className="text-sm font-semibold text-[#0b1c30]">
                  Descripción
                </label>
                <span className="text-xs text-[#6d7a72]">Opcional</span>
              </div>
              <textarea
                id="productDesc"
                rows={4}
                value={productDesc}
                onChange={(e) => setProductDesc(e.target.value)}
                className="w-full bg-white border border-[#bccac0]/50 rounded-lg p-3 text-sm text-[#0b1c30] focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition-all resize-none shadow-xs"
              />
            </div>

            {/* Interruptor de Estado (Desactivar / Activar) */}
            <div className="flex items-center justify-between p-3.5 bg-white border border-[#bccac0]/50 rounded-lg shadow-xs">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[#0b1c30]">Estado del producto</span>
                <span className="text-xs text-[#6d7a72]">
                  {inStock ? 'Disponible en tu catálogo' : 'Agotado / Oculto'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={() => setInStock(!inStock)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#059669]" />
              </label>
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
                <span className="font-bold text-base">Guardando Cambios...</span>
                <span className="text-xs text-white/80">Actualizando tu producto en la tienda.</span>
              </div>
            </div>
          )}

          {/* Action Buttons Stitch */}
          <div className="flex flex-col gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isSubmitting}
              className="h-12 rounded-full flex items-center justify-center gap-2 text-base font-semibold bg-[#059669] hover:bg-[#00855d]"
            >
              <Save size={18} />
              Guardar cambios
            </Button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleDelete}
              className="h-12 w-full bg-transparent text-[#ba1a1a] font-semibold text-sm rounded-full hover:bg-red-50 active:bg-red-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Trash2 size={18} />
              Eliminar producto
            </button>
          </div>
        </form>
      </main>

      {/* Bottom Nav Fija Stitch (Inicio, Productos, Ajustes) */}
      <nav className="fixed bottom-0 w-full z-50 bg-[#f8f9ff]/90 backdrop-blur-xl border-t border-[#bccac0]/30 shadow-[0_-1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 flex items-center justify-around max-w-[640px] mx-auto">
          <Link
            href="/dashboard"
            className="flex flex-col items-center gap-1 text-[#6d7a72] hover:text-[#0b1c30]"
          >
            <Home size={20} />
            <span className="text-xs font-medium">Inicio</span>
          </Link>
          <Link
            href="/products"
            className="flex flex-col items-center gap-1 text-[#059669] font-semibold"
          >
            <Package size={20} />
            <span className="text-xs">Productos</span>
          </Link>
          <Link
            href="/settings"
            className="flex flex-col items-center gap-1 text-[#6d7a72] hover:text-[#0b1c30]"
          >
            <Settings size={20} />
            <span className="text-xs font-medium">Ajustes</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
