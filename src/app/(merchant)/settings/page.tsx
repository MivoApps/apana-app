'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Store as StoreIcon,
  Palette,
  Phone,
  Crown,
  Check,
  Save,
  ExternalLink,
  Home,
  Package,
  ShoppingBag,
  Settings as SettingsIcon,
  Lock,
  X,
  LogOut,
  ShieldCheck,
  AlertCircle,
  Mail
} from 'lucide-react';
import { sendEmailVerification } from 'firebase/auth';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/app-store';
import { Store, StoreStyle } from '@/types/store';
import { LiveStorePreview } from '@/components/merchant/LiveStorePreview';
import { TermsModal } from '@/components/ui/TermsModal';
import { WhatsAppVerifyModal } from '@/components/merchant/WhatsAppVerifyModal';

// Paleta de colores oficiales
const STITCH_COLORS = [
  { id: 'apana-green', hex: '#059669', name: 'Esmeralda' },
  { id: 'blue', hex: '#2563EB', name: 'Azul Real' },
  { id: 'amber', hex: '#D97706', name: 'Dorado' },
  { id: 'wine', hex: '#831843', name: 'Vino' },
  { id: 'black', hex: '#171717', name: 'Negro' },
  { id: 'pink', hex: '#DB2777', name: 'Fucsia' },
  { id: 'orange', hex: '#EA580C', name: 'Naranja' },
  { id: 'purple', hex: '#9333EA', name: 'Púrpura' },
];

import { useAuth } from '@/lib/firebase/auth-context';
import { createOrUpdateStoreInFS, getStoreByUserIdFromFS } from '@/lib/firebase/firestore';
import { compressAndCropImage, formatBytes } from '@/lib/image-optimizer';
import {
  Upload,
  Image as ImageIcon,
  Clock,
  MapPin,
  Truck,
  Trash2,
} from 'lucide-react';
import { InstagramIcon } from '@/components/ui/InstagramIcon';

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const { createOrUpdateStore } = useAppStore();

  const handleLogout = async () => {
    sessionStorage.clear();
    localStorage.clear();
    await logout();
    window.location.href = '/login';
  };

  const [isLoading, setIsLoading] = useState(true);
  const [fsStore, setFsStore] = useState<Store | null>(null);

  // Form State
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState('');

  // Nuevos campos comerciales opcionales
  const [city, setCity] = useState('');
  const [schedule, setSchedule] = useState('');
  const [shippingType, setShippingType] = useState<'coordinar' | 'gratis'>('coordinar');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');

  const cleanInitialPhone = (phoneStr: string) => {
    const digitsOnly = phoneStr.replace(/\D/g, '');
    return digitsOnly.length > 9 ? digitsOnly.slice(-9) : digitsOnly;
  };

  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<StoreStyle>('minimalista');
  const [selectedColorHex, setSelectedColorHex] = useState('#059669');
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Estados para Modal Seguro de Cambio de WhatsApp
  const [showChangePhoneModal, setShowChangePhoneModal] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [newPhoneInput, setNewPhoneInput] = useState('');
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);
  const [acceptTermsChecked, setAcceptTermsChecked] = useState(false);
  const [phoneChangeError, setPhoneChangeError] = useState('');
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [emailSentToast, setEmailSentToast] = useState(false);

  const handleResendEmail = async () => {
    if (!user) return;
    setIsResendingEmail(true);
    try {
      await sendEmailVerification(user);
      setEmailSentToast(true);
      setTimeout(() => setEmailSentToast(false), 5000);
    } catch (err: any) {
      console.warn('Error reenviando verificación:', err);
      alert('Ya enviamos un correo recientemente. Por favor revisa tu bandeja de entrada o spam.');
    } finally {
      setIsResendingEmail(false);
    }
  };

  // Manejo de Subida y Optimización de Logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación de tamaño máximo previo (5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      setLogoError('La imagen seleccionada supera el límite máximo de 5MB.');
      return;
    }

    setLogoError('');
    setIsUploadingLogo(true);

    try {
      // Optimizar en el navegador: recortar centrado a 400x400 WebP ultraligero
      const result = await compressAndCropImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.85,
        outputFormat: 'image/webp',
      });
      setLogoUrl(result.dataUrl);
    } catch (err: any) {
      console.error('Error optimizando logo:', err);
      setLogoError('No se pudo procesar la imagen. Intenta con otro archivo.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl(null);
  };

  const handleConfirmChangePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhoneInput.startsWith('9') || newPhoneInput.length !== 9) {
      setPhoneChangeError('El número debe tener 9 dígitos y comenzar obligatoriamente con 9.');
      return;
    }
    if (!acceptTermsChecked) {
      setPhoneChangeError('Debes aceptar la declaración jurada de titularidad.');
      return;
    }

    setIsUpdatingPhone(true);
    setPhoneChangeError('');

    try {
      const fullPhone = `51${newPhoneInput}`;
      if (user) {
        const updatedStore = await createOrUpdateStoreInFS(user.uid, {
          name: storeName,
          whatsappPhone: fullPhone,
          isWhatsappVerified: false,
          themeStyle: selectedStyle,
          primaryColor: selectedColorHex,
          description: storeDescription,
          categories: categories,
          logoUrl: logoUrl,
          city: city,
          schedule: schedule,
          shippingType: shippingType,
          socialLinks: {
            instagram: instagram,
            tiktok: tiktok,
          },
        });
        setFsStore(updatedStore);
        setWhatsappPhone(newPhoneInput);
        sessionStorage.setItem(`apana_cache_store_${user.uid}`, JSON.stringify(updatedStore));
        sessionStorage.removeItem(`apana_public_store_${updatedStore.slug}`);
      }
      setShowChangePhoneModal(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
      setIsVerifyModalOpen(true);
    } catch (err: any) {
      setPhoneChangeError(err?.message || 'Error al actualizar el número.');
    } finally {
      setIsUpdatingPhone(false);
    }
  };

  // Cargar datos reales desde Firestore con caché híbrido
  React.useEffect(() => {
    const loadSettings = async () => {
      if (authLoading) return;
      if (!user) {
        router.push('/login');
        return;
      }

      // 1. Intentar cargar inmediatamente del caché rápido de sesión si existe (0 ms)
      const cachedStore = sessionStorage.getItem(`apana_cache_store_${user.uid}`);
      if (cachedStore) {
        try {
          const parsed = JSON.parse(cachedStore);
          setFsStore(parsed);
          setStoreName(parsed.name || '');
          setStoreDescription(parsed.description || '');
          setLogoUrl(parsed.logoUrl || null);
          setCity(parsed.city || '');
          setSchedule(parsed.schedule || '');
          setShippingType(parsed.shippingType || 'coordinar');
          setInstagram(parsed.socialLinks?.instagram || '');
          setTiktok(parsed.socialLinks?.tiktok || '');
          setWhatsappPhone(cleanInitialPhone(parsed.whatsappPhone || ''));
          setSelectedStyle(parsed.themeStyle || 'minimalista');
          setSelectedColorHex(parsed.primaryColor || '#059669');
          setCategories(parsed.categories || []);
          setIsLoading(false);
        } catch (e) { }
      } else {
        setIsLoading(true);
      }

      // 2. Traer la verdad actualizada desde Firestore en segundo plano
      const storeFromFS = await getStoreByUserIdFromFS(user.uid);
      if (storeFromFS) {
        setFsStore(storeFromFS);
        setStoreName(storeFromFS.name || '');
        setStoreDescription(storeFromFS.description || '');
        setLogoUrl(storeFromFS.logoUrl || null);
        setCity(storeFromFS.city || '');
        setSchedule(storeFromFS.schedule || '');
        setShippingType(storeFromFS.shippingType || 'coordinar');
        setInstagram(storeFromFS.socialLinks?.instagram || '');
        setTiktok(storeFromFS.socialLinks?.tiktok || '');
        setWhatsappPhone(cleanInitialPhone(storeFromFS.whatsappPhone || ''));
        setSelectedStyle(storeFromFS.themeStyle || 'minimalista');
        setSelectedColorHex(storeFromFS.primaryColor || '#059669');
        setCategories(storeFromFS.categories || []);
        sessionStorage.setItem(`apana_cache_store_${user.uid}`, JSON.stringify(storeFromFS));
      }
      setIsLoading(false);
    };

    loadSettings();
  }, [user, authLoading, router]);

  const currentStore = fsStore;
  const isFreePlan = !fsStore?.plan || fsStore.plan === 'gratis';

  // Detectar si hay cambios con relación al valor guardado en Firestore
  const hasChanges = Boolean(
    currentStore && (
      storeName !== (currentStore.name || '') ||
      storeDescription !== (currentStore.description || '') ||
      logoUrl !== (currentStore.logoUrl || null) ||
      city !== (currentStore.city || '') ||
      schedule !== (currentStore.schedule || '') ||
      shippingType !== (currentStore.shippingType || 'coordinar') ||
      instagram !== (currentStore.socialLinks?.instagram || '') ||
      tiktok !== (currentStore.socialLinks?.tiktok || '') ||
      whatsappPhone !== cleanInitialPhone(currentStore.whatsappPhone || '') ||
      selectedStyle !== (currentStore.themeStyle || 'minimalista') ||
      selectedColorHex !== (currentStore.primaryColor || '#059669') ||
      JSON.stringify(categories) !== JSON.stringify(currentStore.categories || [])
    )
  );

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 9);
    setWhatsappPhone(value);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newCategoryInput.trim();
    if (!clean) return;
    if (categories.includes(clean)) {
      alert('Esta categoría ya existe.');
      return;
    }
    setCategories([...categories, clean]);
    setNewCategoryInput('');
  };

  const handleRemoveCategory = (catName: string) => {
    setCategories(categories.filter((c) => c !== catName));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges || isSubmitting) return;
    setIsSubmitting(true);

    const fullPhone = `51${whatsappPhone}`;

    if (user) {
      try {
        let finalLogoUrl = logoUrl;

        // Subir logo a Firebase Cloud Storage si es una nueva imagen en base64
        if (logoUrl && logoUrl.startsWith('data:')) {
          try {
            const { uploadImageToStorage, dataURLtoBlob } = await import('@/lib/firebase/storage');
            const blob = dataURLtoBlob(logoUrl);
            const storeId = fsStore?.id || `store_${user.uid}`;
            const storagePath = `stores/${storeId}/logo_${Date.now()}.webp`;
            finalLogoUrl = await uploadImageToStorage(blob, storagePath);
            setLogoUrl(finalLogoUrl);
          } catch (uploadErr) {
            console.error('Error subiendo logo a Storage, fallback a dataUrl:', uploadErr);
          }
        }

        const fullPhone = whatsappPhone ? (whatsappPhone.startsWith('51') ? whatsappPhone : `51${whatsappPhone}`) : (fsStore?.whatsappPhone || '');

        const updatedStore = await createOrUpdateStoreInFS(user.uid, {
          id: fsStore?.id,
          name: storeName,
          slug: fsStore?.slug,
          whatsappPhone: fullPhone,
          themeStyle: selectedStyle,
          primaryColor: selectedColorHex,
          description: storeDescription,
          categories: categories,
          logoUrl: finalLogoUrl,
          city: city,
          schedule: schedule,
          shippingType: shippingType,
          plan: fsStore?.plan,
          isWhatsappVerified: fsStore?.isWhatsappVerified,
          socialLinks: {
            instagram: instagram,
            tiktok: tiktok,
          },
        });
        setFsStore(updatedStore);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(`apana_cache_store_${user.uid}`, JSON.stringify(updatedStore));
          sessionStorage.setItem('apana_active_store', JSON.stringify(updatedStore));
          sessionStorage.removeItem(`apana_public_store_${updatedStore.slug}`);
        }
      } catch (err) {
        console.error('Error guardando ajustes en Firestore:', err);
      }
    }

    setIsSubmitting(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && document.referrer && document.referrer.includes(window.location.host)) {
      router.back();
    } else {
      router.push('/dashboard');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center text-[#0b1c30] gap-3 font-sans">
        <div className="w-10 h-10 border-4 border-[#059669] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium text-[#6d7a72]">Cargando ajustes...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans relative pb-28">
      {/* Header Fijo */}
      <header className="fixed top-0 w-full z-40 bg-[#f8f9ff]/80 backdrop-blur-xl border-b border-[#bccac0]/20">
        <div className="h-14 flex items-center justify-between px-4 max-w-[640px] mx-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="p-1.5 rounded-full hover:bg-gray-100 text-[#0b1c30] transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-bold text-lg text-[#0b1c30]">Ajustes de la Tienda</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
              fsStore?.plan === 'negocio'
                ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold'
                : fsStore?.plan === 'emprendedor'
                  ? 'bg-emerald-100 text-[#059669] border border-emerald-200'
                  : 'bg-slate-100 text-slate-700'
            }`}>
              {fsStore?.plan === 'negocio' ? 'Plan Negocio Pro' : fsStore?.plan === 'emprendedor' ? 'Plan Emprendedor' : 'Plan Gratis'}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              title="Cerrar Sesión"
              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-16 px-4 max-w-[640px] w-full mx-auto flex flex-col gap-6">
        <form onSubmit={handleSave} className="flex flex-col gap-6">

          {/* Card 1: Información Básica e Identidad */}
          <section className="bg-white rounded-2xl p-5 border border-[#bccac0]/40 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#059669] flex items-center justify-center">
                <StoreIcon size={18} />
              </div>
              <div className="flex flex-col">
                <h2 className="font-bold text-base text-[#0b1c30]">Identidad del Negocio</h2>
                <p className="text-[11px] text-[#6d7a72]">Logo, nombre y contacto oficial de tu tienda</p>
              </div>
            </div>

            {/* Subida y Optimización de Logo */}
            <div className="flex flex-col gap-2 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#0b1c30] flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-[#059669]" />
                  Logo Oficial de la Marca
                </label>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                  ✨ Todos los planes
                </span>
              </div>

              <div className="flex items-center gap-4 pt-1">
                {/* Visualizador de Logo / Avatar */}
                <div
                  className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-200 bg-white shadow-xs flex items-center justify-center shrink-0 relative group"
                  style={!logoUrl ? { backgroundColor: selectedColorHex } : undefined}
                >
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo de la tienda" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-black text-xl font-sans">
                      {storeName ? storeName.substring(0, 2).toUpperCase() : 'AP'}
                    </span>
                  )}
                  {isUploadingLogo && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Acciones de Carga */}
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="cursor-pointer px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5">
                      <Upload size={13} />
                      <span>{logoUrl ? 'Cambiar Logo' : 'Subir Logo'}</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp, image/svg+xml"
                        className="hidden"
                        onChange={handleLogoUpload}
                        disabled={isUploadingLogo}
                      />
                    </label>

                    {logoUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="px-3 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200/80 font-bold text-xs rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>Eliminar</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Recomendado: Imagen cuadrada (PNG, JPG, WebP o SVG, máx 5MB). Se optimizará automáticamente.
                  </p>
                  {logoError && (
                    <span className="text-[11px] text-red-600 font-medium">{logoError}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="storeName" className="text-xs font-semibold text-[#0b1c30]">
                Nombre de la Tienda
              </label>
              <input
                id="storeName"
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="h-11 w-full bg-white border border-[#bccac0]/50 rounded-xl px-4 text-sm text-[#0b1c30] focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition-all shadow-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="storeDescription" className="text-xs font-semibold text-[#0b1c30]">
                  Descripción de la Tienda
                </label>
                <span className="text-[11px] text-[#6d7a72]">Opcional</span>
              </div>
              <textarea
                id="storeDescription"
                rows={3}
                placeholder="Describe brevemente qué vende tu tienda..."
                value={storeDescription}
                onChange={(e) => setStoreDescription(e.target.value)}
                className="w-full bg-white border border-[#bccac0]/50 rounded-xl p-3 text-sm text-[#0b1c30] placeholder:text-[#6d7a72]/50 focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition-all resize-none shadow-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label htmlFor="whatsappPhone" className="text-xs font-semibold text-[#0b1c30]">
                    Número de WhatsApp para Pedidos
                  </label>
                  {fsStore?.isWhatsappVerified ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#059669] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <ShieldCheck size={12} />
                      Verificado
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsVerifyModalOpen(true)}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                    >
                      <AlertCircle size={12} className="text-amber-600" />
                      Validar con APANA ➔
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setNewPhoneInput(whatsappPhone);
                      setShowChangePhoneModal(true);
                    }}
                    className="text-[11px] font-bold text-[#059669] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    ✏️ Cambiar Número
                  </button>
                  <span className="text-slate-300 text-xs">|</span>
                  <button
                    type="button"
                    onClick={() => setIsTermsOpen(true)}
                    className="text-[11px] text-slate-500 hover:text-[#059669] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Declaración Jurada
                  </button>
                </div>
              </div>
              
              <div className="relative flex items-center bg-gray-50 border border-[#bccac0]/40 rounded-xl overflow-hidden shadow-xs">
                {/* Prefix Estático Perú con Bandera y +51 */}
                <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-gray-100 border-r border-gray-200 select-none shrink-0">
                  <span className="text-lg leading-none" role="img" aria-label="Bandera de Perú">🇵🇪</span>
                  <span className="text-sm font-bold text-[#0b1c30]">+51</span>
                </div>
                <input
                  id="whatsappPhone"
                  type="tel"
                  readOnly
                  value={whatsappPhone}
                  className="h-11 w-full bg-transparent px-3.5 text-sm font-semibold text-[#0b1c30] tracking-wide focus:outline-none cursor-default"
                />
                <button
                  type="button"
                  onClick={() => {
                    setNewPhoneInput(whatsappPhone);
                    setShowChangePhoneModal(true);
                  }}
                  className="px-3 py-1.5 mr-2 text-xs font-semibold text-[#059669] bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors shrink-0 cursor-pointer"
                >
                  Modificar
                </button>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                El número de WhatsApp está respaldado por tu declaración jurada de titularidad y validación anti-fraude.
              </p>
            </div>

            {currentStore && (
              <div className="pt-2">
                <Link
                  href={`/s/${currentStore.slug}`}
                  target="_blank"
                  className="text-xs font-semibold text-[#059669] hover:underline flex items-center gap-1"
                >
                  <ExternalLink size={14} />
                  Ver mi link público: /s/{currentStore.slug}
                </Link>
              </div>
            )}
          </section>

          {/* Card 2: Información Comercial, Redes y Envíos (Opcional) */}
          <section className="bg-white rounded-2xl p-5 border border-[#bccac0]/40 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#059669] flex items-center justify-center">
                <Truck size={18} />
              </div>
              <div className="flex flex-col">
                <h2 className="font-bold text-base text-[#0b1c30]">Ubicación, Horarios y Envíos</h2>
                <p className="text-[11px] text-[#6d7a72]">Campos opcionales para orientar a tus clientes</p>
              </div>
            </div>

            {/* Ubicación / Ciudad */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="city" className="text-xs font-semibold text-[#0b1c30] flex items-center gap-1.5">
                <MapPin size={13} className="text-[#059669]" />
                Ubicación / Ciudad o Distrito
              </label>
              <input
                id="city"
                type="text"
                placeholder="ej. Miraflores, Lima o Envíos a todo el Perú"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-11 w-full bg-white border border-[#bccac0]/50 rounded-xl px-4 text-sm text-[#0b1c30] placeholder:text-[#6d7a72]/50 focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition-all shadow-xs"
              />
            </div>

            {/* Horario y Días de Atención */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="schedule" className="text-xs font-semibold text-[#0b1c30] flex items-center gap-1.5">
                <Clock size={13} className="text-[#059669]" />
                Horario y Días de Atención
              </label>
              <input
                id="schedule"
                type="text"
                placeholder="ej. Lun a Sáb: 9:00 am - 8:00 pm"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="h-11 w-full bg-white border border-[#bccac0]/50 rounded-xl px-4 text-sm text-[#0b1c30] placeholder:text-[#6d7a72]/50 focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition-all shadow-xs"
              />
            </div>

            {/* Modalidad de Envío (Radio Buttons) */}
            <div className="flex flex-col gap-2 pt-1">
              <label className="text-xs font-semibold text-[#0b1c30]">
                Modalidad de Envío para tus Clientes
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Opción 1: A coordinar por interno (POR DEFECTO) */}
                <label
                  onClick={() => setShippingType('coordinar')}
                  className={`p-3.5 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all ${
                    shippingType === 'coordinar'
                      ? 'bg-emerald-50/80 border-[#059669] ring-2 ring-[#059669] shadow-xs'
                      : 'bg-gray-50/70 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#0b1c30]">🤝 A coordinar</span>
                    <input
                      type="radio"
                      name="shippingType"
                      checked={shippingType === 'coordinar'}
                      onChange={() => setShippingType('coordinar')}
                      className="accent-[#059669]"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium leading-tight">
                    Por defecto: Costo y entrega se pactan por WhatsApp.
                  </span>
                </label>

                {/* Opción 2: Envío Gratis */}
                <label
                  onClick={() => setShippingType('gratis')}
                  className={`p-3.5 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all ${
                    shippingType === 'gratis'
                      ? 'bg-emerald-50/80 border-[#059669] ring-2 ring-[#059669] shadow-xs'
                      : 'bg-gray-50/70 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#0b1c30]">🎁 Envío Gratis</span>
                    <input
                      type="radio"
                      name="shippingType"
                      checked={shippingType === 'gratis'}
                      onChange={() => setShippingType('gratis')}
                      className="accent-[#059669]"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium leading-tight">
                    Se muestra "Envío Gratis" en tu tienda y carrito.
                  </span>
                </label>
              </div>
            </div>

            {/* Redes Sociales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="instagram" className="text-xs font-semibold text-[#0b1c30] flex items-center gap-1.5">
                  <InstagramIcon size={13} className="text-pink-600" />
                  Instagram
                </label>
                <input
                  id="instagram"
                  type="text"
                  placeholder="ej. @mitienda o instagram.com/mitienda"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="h-11 w-full bg-white border border-[#bccac0]/50 rounded-xl px-4 text-sm text-[#0b1c30] placeholder:text-[#6d7a72]/50 focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition-all shadow-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="tiktok" className="text-xs font-semibold text-[#0b1c30] flex items-center gap-1.5">
                  <span className="font-bold text-xs">🎵</span>
                  TikTok
                </label>
                <input
                  id="tiktok"
                  type="text"
                  placeholder="ej. @mitienda o tiktok.com/@mitienda"
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                  className="h-11 w-full bg-white border border-[#bccac0]/50 rounded-xl px-4 text-sm text-[#0b1c30] placeholder:text-[#6d7a72]/50 focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition-all shadow-xs"
                />
              </div>
            </div>
          </section>

          {/* Card 3: Personalización Visual */}
          <section className="bg-white rounded-2xl p-5 border border-[#bccac0]/40 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#059669] flex items-center justify-center">
                <Palette size={18} />
              </div>
              <h2 className="font-bold text-base text-[#0b1c30]">Apariencia y Estilo</h2>
            </div>

            {/* Estilo Visual */}
            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-semibold text-[#0b1c30]">Estilo de Plantilla</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'minimalista', name: '🍃 Minimalista', desc: 'Lookbook sin marcos, Moda y Ropa' },
                  { id: 'moderna', name: '⚡ Moderna', desc: 'Lista horizontal, Comida y Delivery' },
                  { id: 'elegante', name: '⚜️ Elegante', desc: 'Boutique marfil, Joyería y Gourmet' },
                ].map((styleItem) => {
                  const isSelected = selectedStyle === styleItem.id;
                  return (
                    <button
                      key={styleItem.id}
                      type="button"
                      onClick={() => setSelectedStyle(styleItem.id as StoreStyle)}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${isSelected
                          ? 'bg-emerald-50/80 border-[#059669] ring-2 ring-[#059669] shadow-xs'
                          : 'bg-gray-50/70 text-[#0b1c30] border-gray-200 hover:bg-gray-100'
                        }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-xs text-[#0b1c30]">{styleItem.name}</span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-[#059669] flex items-center justify-center">
                            <Check size={10} className="text-white" />
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium leading-tight">
                        {styleItem.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selector de Color */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#0b1c30]">Color Principal de tu Marca</label>
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {STITCH_COLORS.map((col) => {
                  const isSelected = selectedColorHex === col.hex;
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setSelectedColorHex(col.hex)}
                      title={col.name}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-all ${isSelected ? 'scale-110 ring-2 ring-offset-2 ring-[#059669] shadow-md' : 'opacity-85 hover:opacity-100 hover:scale-105'
                        }`}
                      style={{ backgroundColor: col.hex }}
                    >
                      {isSelected && <Check size={16} className="text-white stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Preview en Ajustes */}
            <div className="w-full pt-3 border-t border-slate-100 flex flex-col items-center">
              <LiveStorePreview
                storeName={storeName || 'Mi Tienda'}
                themeStyle={selectedStyle}
                primaryColor={selectedColorHex}
                categoryName={categories[0] || 'General'}
                logoUrl={logoUrl}
              />
            </div>
          </section>

          {/* Card 4: Categorías de Productos (Desbloqueado para Emprendedor y Negocio Pro) */}
          <section className="bg-white rounded-2xl p-5 border border-[#bccac0]/40 shadow-xs flex flex-col gap-4 relative overflow-hidden">
            <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#059669] flex items-center justify-center">
                <Package size={18} />
              </div>
              <h2 className="font-bold text-base text-[#0b1c30]">Categorías de Productos</h2>
              {isFreePlan && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 ml-auto flex items-center gap-1">
                  <Lock size={10} />
                  Top
                </span>
              )}
            </div>

            {isFreePlan ? (
              /* ESTADO BLOQUEADO (Plan Gratis) */
              <div className="flex flex-col gap-3 py-2 text-center items-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                  <Lock size={22} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-bold text-slate-800">Función del Plan Emprendedor y Pro</h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                    Las categorías te permiten agrupar tus productos (ej: Panes, Postres, Bebidas) para que tus clientes puedan filtrar tus productos ágilmente en tu tienda online.
                  </p>
                </div>
                <Link href="/plans">
                  <span className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-transform active:scale-[0.98] inline-block cursor-pointer">
                    Mejorar al Plan Emprendedor
                  </span>
                </Link>
              </div>
            ) : (
              /* ESTADO ACTIVO (Plan Emprendedor y Negocio Pro) */
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="newCategory" className="text-xs font-semibold text-[#0b1c30]">
                    Crear Nueva Categoría
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="newCategory"
                      type="text"
                      placeholder="ej., Postres, Bebidas, Pizzas"
                      value={newCategoryInput}
                      onChange={(e) => setNewCategoryInput(e.target.value)}
                      className="h-11 flex-1 bg-white border border-[#bccac0]/50 rounded-xl px-4 text-sm text-[#0b1c30] focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition-all shadow-xs"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
                          handleAddCategory(fakeEvent);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="px-4 bg-[#059669] hover:bg-[#00855d] text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                    >
                      Agregar
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-[#0b1c30]">Mis Categorías Creadas</span>
                  {categories.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">
                      Aún no has agregado categorías. Crea una arriba para organizar tu tienda.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {categories.map((cat, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#eff4ff] border border-[#cbdbf5] text-[#006c49] text-xs font-bold rounded-full shadow-2xs"
                        >
                          <span>{cat}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCategory(cat)}
                            className="p-0.5 rounded-full hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors ml-0.5 flex items-center justify-center"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Card 5: Plan Actual y Ver Todos los Planes */}
          <section className="bg-white rounded-2xl p-5 border border-[#bccac0]/40 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center font-bold">
                <Crown size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-[#6d7a72]">Tipo de Plan</span>
                <span className={`text-sm font-bold ${
                  fsStore?.plan === 'negocio'
                    ? 'text-amber-900 font-extrabold'
                    : fsStore?.plan === 'emprendedor'
                    ? 'text-emerald-800 font-extrabold'
                    : 'text-[#0b1c30]'
                }`}>
                  {fsStore?.plan === 'negocio' ? 'Plan Negocio Pro' : fsStore?.plan === 'emprendedor' ? 'Plan Emprendedor' : 'Plan Gratis'}
                </span>
              </div>
            </div>

            <Link href="/plans">
              <button
                type="button"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#0b1c30] text-xs font-semibold rounded-xl transition-colors whitespace-nowrap"
              >
                Ver todos los planes
              </button>
            </Link>
          </section>

          {/* Card 4: Sesión y Cuenta */}
          <section className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-[#6d7a72]">Sesión Iniciada</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-bold text-[#0b1c30] truncate">
                  {user?.email || 'Comerciante'}
                </span>
                {user?.emailVerified ? (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0">
                    <ShieldCheck size={11} className="text-emerald-700" />
                    <span>Verificado</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0">
                    <Mail size={11} className="text-amber-700" />
                    <span>No verificado</span>
                  </span>
                )}
              </div>
              {!user?.emailVerified && (
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={isResendingEmail}
                  className="text-left text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline mt-1 cursor-pointer disabled:opacity-50"
                >
                  {isResendingEmail ? 'Enviando correo...' : 'Reenviar enlace de verificación ➔'}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/60 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              <LogOut size={14} />
              <span>Cerrar Sesión</span>
            </button>
          </section>

          {/* Toast Flotante de Correo Enviado */}
          {emailSentToast && (
            <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
              <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
              <span>Enlace de verificación enviado. Revisa tu bandeja de entrada o spam.</span>
            </div>
          )}

          {/* Botón Guardar Cambios */}
          <div className="pt-1">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={!hasChanges || isSubmitting}
              className={`h-12 rounded-xl flex items-center justify-center gap-2 text-base font-semibold transition-all ${!hasChanges || isSubmitting
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-0'
                  : 'bg-[#059669] hover:bg-[#00855d] text-white shadow-xs'
                }`}
            >
              {savedSuccess ? <Check size={20} /> : <Save size={20} />}
              {savedSuccess ? '¡Ajustes Guardados!' : 'Guardar Cambios'}
            </Button>
          </div>

        </form>
      </main>

      {/* Bottom Nav Fija */}
      <nav className="fixed bottom-0 w-full z-50 bg-[#f8f9ff]/90 backdrop-blur-xl border-t border-[#bccac0]/30 shadow-[0_-1px_8px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom)]">
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
            className="flex flex-col items-center gap-1 text-[#6d7a72] hover:text-[#0b1c30]"
          >
            <Package size={20} />
            <span className="text-xs font-medium">Productos</span>
          </Link>
          <Link
            href="/settings"
            className="flex flex-col items-center gap-1 text-[#059669] font-semibold"
          >
            <SettingsIcon size={20} />
            <span className="text-xs">Ajustes</span>
          </Link>
        </div>
      </nav>

      {/* Modal Seguro de Cambio de WhatsApp */}
      {showChangePhoneModal && (
        <div className="fixed inset-0 z-50 bg-[#0b1c30]/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300 pointer-events-auto">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4 relative border border-[#bccac0]/30 animate-in zoom-in-95 duration-300">
            {/* Botón Cerrar */}
            <button
              type="button"
              onClick={() => {
                setShowChangePhoneModal(false);
                setPhoneChangeError('');
                setAcceptTermsChecked(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Header Modal */}
            <div className="flex flex-col items-center text-center gap-1.5 pt-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center shadow-xs">
                <Phone size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#0b1c30]">
                Cambiar Número de WhatsApp
              </h3>
              <p className="text-xs text-[#6d7a72] leading-relaxed">
                Ingresa el nuevo celular donde recibirás los pedidos y consultas de tu tienda.
              </p>
            </div>

            {/* Form Modal */}
            <form onSubmit={handleConfirmChangePhone} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#0b1c30] ml-1">
                  Nuevo Número Celular (Perú)
                </label>
                <div className={`relative flex items-center bg-white border rounded-xl overflow-hidden shadow-xs transition-all ${
                  newPhoneInput && !newPhoneInput.startsWith('9')
                    ? 'border-red-500 ring-2 ring-red-500/10'
                    : 'border-[#bccac0] focus-within:border-[#059669] focus-within:ring-2 focus-within:ring-[#059669]/10'
                }`}>
                  <div className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 border-r border-gray-200 select-none shrink-0">
                    <span className="text-base leading-none" role="img" aria-label="Bandera de Perú">🇵🇪</span>
                    <span className="text-xs font-bold text-[#0b1c30]">+51</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                    autoFocus
                    placeholder="9XXXXXXXX"
                    value={newPhoneInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                      setNewPhoneInput(val);
                      if (phoneChangeError) setPhoneChangeError('');
                    }}
                    className="h-11 w-full bg-transparent px-3 text-base sm:text-sm text-[#0b1c30] placeholder:text-gray-400 focus:outline-none font-medium tracking-wide"
                  />
                </div>
                {newPhoneInput && !newPhoneInput.startsWith('9') && (
                  <p className="text-[11px] font-semibold text-red-600 ml-1">
                    ⚠️ El número celular debe comenzar obligatoriamente con 9.
                  </p>
                )}
              </div>

              {/* Declaración Jurada Checkbox */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex flex-col gap-2">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptTermsChecked}
                    onChange={(e) => setAcceptTermsChecked(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#059669] focus:ring-[#059669] border-gray-300"
                  />
                  <span className="text-[11px] text-[#3d4a42] leading-tight">
                    Declaro bajo juramento ser el titular legítimo de esta línea celular y acepto los{' '}
                    <button
                      type="button"
                      onClick={() => setIsTermsOpen(true)}
                      className="text-[#059669] font-bold underline"
                    >
                      Términos de APANA
                    </button>.
                  </span>
                </label>
              </div>

              {phoneChangeError && (
                <p className="text-xs text-red-600 font-semibold text-center">
                  {phoneChangeError}
                </p>
              )}

              {/* Botones de Acción */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePhoneModal(false);
                    setPhoneChangeError('');
                  }}
                  className="flex-1 h-11 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={
                    newPhoneInput.length !== 9 ||
                    !newPhoneInput.startsWith('9') ||
                    !acceptTermsChecked ||
                    isUpdatingPhone
                  }
                  className={`flex-1 h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                    newPhoneInput.length === 9 && newPhoneInput.startsWith('9') && acceptTermsChecked && !isUpdatingPhone
                      ? 'bg-[#059669] hover:bg-[#00855d] text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isUpdatingPhone ? 'Actualizando...' : 'Confirmar Cambio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Validación Anti-Fraude de WhatsApp */}
      {fsStore && (
        <WhatsAppVerifyModal
          isOpen={isVerifyModalOpen}
          onClose={() => setIsVerifyModalOpen(false)}
          storeId={fsStore.id}
          storeName={fsStore.name}
          phone={fsStore.whatsappPhone || ''}
          onSuccess={async () => {
            if (user) {
              const updated = await getStoreByUserIdFromFS(user.uid);
              if (updated) setFsStore(updated);
            }
          }}
        />
      )}

      {/* Modal de Términos y Condiciones */}
      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </div>
  );
}
