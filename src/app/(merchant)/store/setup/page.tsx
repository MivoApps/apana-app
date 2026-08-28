'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Store,
  CheckCircle2,
  PackagePlus,
  QrCode,
  ExternalLink,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { slugify } from '@/lib/app-store';
import { StoreStyle } from '@/types/store';
import { LiveStorePreview } from '@/components/merchant/LiveStorePreview';
import { TermsModal } from '@/components/ui/TermsModal';

// Categorías oficiales de Stitch
const STITCH_CATEGORIES = [
  { id: 'ropa', name: 'Ropa' },
  { id: 'accesorios', name: 'Accesorios' },
  { id: 'comida', name: 'Comida' },
  { id: 'mascotas', name: 'Mascotas' },
  { id: 'cosmeticos', name: 'Cosméticos' },
  { id: 'tecnologia', name: 'Tecnología' },
  { id: 'hogar', name: 'Hogar' },
  { id: 'artesanias', name: 'Artesanías' },
  { id: 'otro', name: 'Otro' },
];

// Colores oficiales
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
import { createOrUpdateStoreInFS } from '@/lib/firebase/firestore';

export default function OnboardingWizardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [step, setStep] = useState(1);

  // Form State
  const [businessName, setBusinessName] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [category, setCategory] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<'minimalist' | 'modern' | 'elegant'>('minimalist');
  const [selectedColorHex, setSelectedColorHex] = useState('#059669');
  const [createdSlug, setCreatedSlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Estado de validación de unicidad de nombre de tienda
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);

  React.useEffect(() => {
    const cleanSlug = slugify(businessName);
    if (!cleanSlug || cleanSlug.length < 2) {
      setIsSlugAvailable(null);
      setIsCheckingSlug(false);
      return;
    }

    setIsCheckingSlug(true);
    const timer = setTimeout(async () => {
      try {
        const { isStoreSlugAvailableInFS } = await import('@/lib/firebase/firestore');
        const available = await isStoreSlugAvailableInFS(cleanSlug);
        setIsSlugAvailable(available);
      } catch (_) {
        setIsSlugAvailable(true);
      } finally {
        setIsCheckingSlug(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [businessName]);

  const TOTAL_STEPS = 4;
  const router = useRouter();
  const [isVerifyingStore, setIsVerifyingStore] = useState(true);

  const handleLogout = async () => {
    localStorage.clear();
    await logout();
    window.location.href = '/login';
  };

  // Verificar Auth, Perfil y Tienda en Firestore al cargar la página
  React.useEffect(() => {
    let isMounted = true;

    const verifyUser = async () => {
      if (authLoading) return;
      if (!user) {
        window.location.href = '/login';
        return;
      }

      // Temporizador de seguridad de 1.5 segundos: desbloquear de inmediato el Wizard si Firestore tarda
      const safetyTimeout = setTimeout(() => {
        if (isMounted) {
          setIsVerifyingStore(false);
        }
      }, 1500);

      try {
        const { getUserProfileFromFS, createUserProfileInFS, getStoreByUserIdFromFS } = await import('@/lib/firebase/firestore');

        // Ejecutar consultas en paralelo
        const [existingStore, userProfile] = await Promise.all([
          getStoreByUserIdFromFS(user.uid),
          getUserProfileFromFS(user.uid),
        ]);

        if (!isMounted) return;
        clearTimeout(safetyTimeout);

        if (existingStore) {
          sessionStorage.setItem(`apana_cache_store_${user.uid}`, JSON.stringify(existingStore));
          sessionStorage.setItem('apana_active_store', JSON.stringify(existingStore));
          window.location.href = '/dashboard';
          return;
        }

        // Si no hay tienda creada en Firestore ➔ Limpiar cualquier residuo de caché obsoleto
        sessionStorage.removeItem(`apana_cache_store_${user.uid}`);
        sessionStorage.removeItem('apana_active_store');
        sessionStorage.removeItem('apana_active_products');
        sessionStorage.removeItem(`apana_cache_prods_${user.uid}`);

        // Crear perfil en segundo plano sin frenar al usuario
        if (!userProfile && user.email) {
          createUserProfileInFS({
            uid: user.uid,
            name: user.displayName || 'Comerciante APANA',
            email: user.email,
            role: 'merchant',
          }).catch((e) => console.warn('Error auto-creando perfil:', e));
        }

        // Resetear todos los campos a vacíos y forzar Paso 1
        localStorage.removeItem('apana_wizard_step');
        setBusinessName('');
        setWhatsappPhone('');
        setCategory('');
        setStep(1);
      } catch (err) {
        console.warn('Aviso verificando tienda:', err);
      } finally {
        if (isMounted) {
          clearTimeout(safetyTimeout);
          setIsVerifyingStore(false);
        }
      }
    };

    verifyUser();

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  const [isNavigatingStep, setIsNavigatingStep] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  // Guardar el paso actual cada vez que cambia
  const updateStep = (newStep: number) => {
    setStep(newStep);
    localStorage.setItem('apana_wizard_step', newStep.toString());
  };

  const handleFinishSetup = async () => {
    setIsSubmitting(true);
    const styleMap: Record<string, StoreStyle> = {
      minimalist: 'minimalista',
      modern: 'moderna',
      elegant: 'elegante',
    };
    const targetStyle = styleMap[selectedStyle] || 'minimalista';

    // Guardar de forma persistente en Firestore si el usuario está autenticado
    let createdFsStore = null;
    if (user) {
      try {
        createdFsStore = await createOrUpdateStoreInFS(user.uid, {
          name: businessName,
          category,
          themeStyle: targetStyle,
          primaryColor: selectedColorHex,
          whatsappPhone: '',
          isWhatsappVerified: false,
          ownerEmail: user.email || '',
          ownerName: user.displayName || businessName,
        });
      } catch (err) {
        console.error('Error guardando tienda en Firestore:', err);
      }
    }

    const finalSlug = createdFsStore?.slug || slugify(businessName) || 'mi-tienda';
    setCreatedSlug(finalSlug);
    setIsSubmitting(false);
    updateStep(5);
  };

  const nextStep = async () => {
    if (isNavigatingStep || isSubmitting) return;
    setIsNavigatingStep(true);

    if (step === 4) {
      await handleFinishSetup();
      setIsNavigatingStep(false);
    } else {
      updateStep(Math.min(step + 1, 5));
      setTimeout(() => {
        setIsNavigatingStep(false);
      }, 350);
    }
  };
  const prevStep = () => {
    if (isNavigatingStep || isSubmitting) return;
    updateStep(Math.max(step - 1, 1));
  };

  if (authLoading || isVerifyingStore) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center text-[#0b1c30] gap-3 font-sans">
        <div className="w-10 h-10 border-4 border-[#059669] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium text-[#6d7a72]">Verificando tu tienda...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col justify-between px-4 py-6 relative overflow-hidden font-sans">
      {/* Background ambient blobs */}
      <div className="fixed top-0 left-0 w-64 h-64 bg-[#85f8c4]/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-80 h-80 bg-[#6ffbbe]/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* Top Bar Navigation */}
      <header className="w-full max-w-sm mx-auto flex flex-col gap-3 relative z-10">
        <div className="flex items-center justify-between min-h-[36px]">
          {step > 1 && step < 5 ? (
            <button
              onClick={prevStep}
              className="p-2 rounded-full hover:bg-gray-100 text-[#0b1c30] transition-colors"
              title="Atrás"
            >
              <ArrowLeft size={20} />
            </button>
          ) : (
            <div className="w-9" />
          )}

          {/* Botón Salir / Cerrar Sesión durante todos los pasos del Wizard */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-all border border-red-200/50 shadow-2xs"
            title="Cerrar sesión"
          >
            <LogOut size={13} />
            <span>Salir</span>
          </button>
        </div>

        {/* Progress Bar Header */}
        {step < 5 && (
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#059669] transition-all duration-300 ease-out rounded-full"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        )}
      </header>

      {/* Área Principal de Pasos */}
      <main className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-center my-4 relative z-10">
        <div className="w-full bg-[#f8f9ff] rounded-2xl p-4 flex flex-col gap-6">

          {/* PASO 1: Bienvenido */}
          {step === 1 && (
            <div className="flex flex-col items-center text-center gap-6 p-6 pt-8 pb-8 bg-white rounded-2xl border border-[#bccac0]/40 shadow-xs">
              <div className="w-20 h-20 bg-white border border-[#bccac0]/40 rounded-3xl p-3.5 flex items-center justify-center shadow-md mt-1">
                <img src="/logo.svg" alt="APANA Logo" className="w-full h-full object-contain" />
              </div>

              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight">
                  ¡Bienvenido a APANA!
                </h1>
                <p className="text-sm text-[#3d4a42]">
                  Estás a pocos pasos de crear tu tienda digital sencilla y comenzar a recibir pedidos por WhatsApp.
                </p>
              </div>

              <div className="w-full bg-[#eff4ff] p-4 rounded-xl flex flex-col items-start text-left gap-2 border border-[#d3e4fe]">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#059669]">
                  <Sparkles size={16} className="shrink-0" />
                  <span>Sin comisiones ni configuraciones complejas</span>
                </div>
                <p className="text-xs text-[#3d4a42] text-center w-full leading-normal">
                  Crea tu catálogo, comparte tu QR físico y recibe pedidos directamente a tu celular.
                </p>
              </div>

              <Button
                onClick={nextStep}
                variant="primary"
                fullWidth
                disabled={isNavigatingStep}
                className="h-12 text-base mt-2"
              >
                {isNavigatingStep ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Iniciando...
                  </span>
                ) : (
                  <>
                    Comenzar ahora
                    <ArrowRight size={18} className="ml-2" />
                  </>
                )}
              </Button>

              <p className="text-[11px] text-slate-400 text-center leading-tight">
                Al continuar, declaras bajo juramento la veracidad de tus datos y aceptas los{' '}
                <button
                  type="button"
                  onClick={() => setIsTermsOpen(true)}
                  className="text-[#059669] underline font-medium hover:text-[#006c49]"
                >
                  Términos, Condiciones y Declaración Jurada
                </button>
                .
              </p>
            </div>
          )}

          {/* PASO 2: Nombre de Tienda */}
          {step === 2 && (
            <div className="flex flex-col gap-5 bg-white p-6 rounded-2xl border border-[#bccac0]/40 shadow-xs">
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight">
                  Nombre de tu Tienda
                </h1>
                <p className="text-xs text-[#3d4a42]">
                  Elige el nombre comercial con el que tus clientes te reconocerán.
                </p>
              </div>

              {/* Campo Nombre */}
              <div className="flex flex-col gap-2">
                <label htmlFor="business-name" className="text-xs font-bold text-slate-700">
                  Nombre de tu tienda o marca *
                </label>
                <div className="relative">
                  <input
                    id="business-name"
                    type="text"
                    placeholder="Ej. Joyas Andrea"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                    className={`w-full h-12 px-4 rounded-xl bg-white border text-[#0b1c30] text-sm font-semibold placeholder:text-[#6d7a72] focus:outline-none transition-all shadow-xs ${
                      isSlugAvailable === false
                        ? 'border-red-500 ring-2 ring-red-500/10'
                        : isSlugAvailable === true
                        ? 'border-[#059669] ring-2 ring-[#059669]/10'
                        : 'border-[#bccac0] focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10'
                    }`}
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
                    {isCheckingSlug && (
                      <span className="w-4 h-4 border-2 border-[#059669] border-t-transparent rounded-full animate-spin" />
                    )}
                    {!isCheckingSlug && isSlugAvailable === true && (
                      <CheckCircle2 size={18} className="text-[#059669]" />
                    )}
                    {!isCheckingSlug && isSlugAvailable === false && (
                      <AlertCircle size={18} className="text-red-500" />
                    )}
                  </div>
                </div>

                {/* Feedback Dinámico de Disponibilidad */}
                {businessName.trim() && !isCheckingSlug && isSlugAvailable === false && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 font-semibold bg-red-50 p-2.5 rounded-xl border border-red-200/80 animate-in fade-in">
                    <AlertCircle size={15} className="shrink-0 text-red-500" />
                    <span>El nombre ya está registrado. Por favor elige otro nombre.</span>
                  </div>
                )}

                {businessName.trim() && isSlugAvailable === true && (
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#006c49] bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200/80 animate-in fade-in">
                    <span className="truncate mr-2">🔗 Enlace: <strong>beapana.com/s/{slugify(businessName)}</strong></span>
                    <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full shrink-0">¡Disponible!</span>
                  </div>
                )}
              </div>

              <Button
                onClick={nextStep}
                variant="primary"
                fullWidth
                disabled={!businessName.trim() || isCheckingSlug || isSlugAvailable === false || isNavigatingStep}
                className="h-12 text-base mt-2"
              >
                {isNavigatingStep ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Cargando...
                  </span>
                ) : (
                  <>
                    Siguiente
                    <ArrowRight size={18} className="ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* PASO 3: Categoría */}
          {step === 3 && (
            <div className="flex flex-col gap-5 bg-white p-6 rounded-2xl border border-[#bccac0]/40 shadow-xs">
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight">
                  ¿Qué tipo de negocio tienes?
                </h1>
                <p className="text-sm text-[#3d4a42]">
                  Esto nos ayuda a configurar tu tienda con las mejores herramientas para tu sector.
                </p>
              </div>

              {/* Grid 2 Columnas de Stitch */}
              <div className="grid grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
                {STITCH_CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border text-center transition-all ${isSelected
                        ? 'bg-[#00855d] text-white border-[#059669] shadow-sm'
                        : 'bg-white text-[#0b1c30] border-[#bccac0]/40 hover:bg-gray-50'
                        }`}
                    >
                      <span className="font-semibold text-sm">{cat.name}</span>
                    </button>
                  );
                })}
              </div>

              <Button
                onClick={nextStep}
                variant="primary"
                fullWidth
                disabled={!category || isNavigatingStep}
                className="h-12 flex items-center justify-center gap-2 mt-2"
              >
                {isNavigatingStep ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Cargando...
                  </span>
                ) : (
                  <>
                    Siguiente
                    <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* PASO 4: Estilos App (Con Smart Badges y LiveStorePreview) */}
          {step === 4 && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight">
                  ¿Cómo quieres que se vea tu tienda?
                </h1>
                <p className="text-sm text-[#3d4a42]">
                  Selecciona el diseño y color que mejor representen la identidad de tu marca.
                </p>
              </div>

              {/* Contenedores visuales de plantillas con Smart Badges */}
              <div className="flex flex-col gap-3.5">
                {/* Minimalista */}
                <button
                  type="button"
                  onClick={() => setSelectedStyle('minimalist')}
                  className={`w-full rounded-2xl p-4 border transition-all text-left flex flex-col gap-2 ${selectedStyle === 'minimalist'
                      ? 'border-[#059669] bg-emerald-50/60 ring-2 ring-[#059669] shadow-sm'
                      : 'border-[#bccac0]/40 bg-white hover:bg-slate-50'
                    }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-base text-[#0b1c30] flex items-center gap-2">
                      🍃 Minimalista
                    </span>
                    {selectedStyle === 'minimalist' && (
                      <div className="w-5 h-5 rounded-full bg-[#059669] flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-emerald-800 bg-emerald-100/70 py-0.5 px-2.5 rounded-full self-start">
                    ✨ Recomendado para Moda, Ropa y Accesorios
                  </span>
                  <p className="text-xs text-slate-500">
                    Estilo lookbook limpio sin marcos de caja, fotos flotantes y tipografía nórdica.
                  </p>
                </button>

                {/* Moderna */}
                <button
                  type="button"
                  onClick={() => setSelectedStyle('modern')}
                  className={`w-full rounded-2xl p-4 border transition-all text-left flex flex-col gap-2 ${selectedStyle === 'modern'
                      ? 'border-[#059669] bg-emerald-50/60 ring-2 ring-[#059669] shadow-sm'
                      : 'border-[#bccac0]/40 bg-white hover:bg-slate-50'
                    }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-base text-[#0b1c30] flex items-center gap-2">
                      ⚡ Moderna
                    </span>
                    {selectedStyle === 'modern' && (
                      <div className="w-5 h-5 rounded-full bg-[#059669] flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-blue-800 bg-blue-100/70 py-0.5 px-2.5 rounded-full self-start">
                    🍔 Recomendado para Comida Rápida y Cafeterías
                  </span>
                  <p className="text-xs text-slate-500">
                    Vista en lista horizontal dinámica de 1 columna con tarjetas amplias de gran impacto.
                  </p>
                </button>

                {/* Elegante */}
                <button
                  type="button"
                  onClick={() => setSelectedStyle('elegant')}
                  className={`w-full rounded-2xl p-4 border transition-all text-left flex flex-col gap-2 ${selectedStyle === 'elegant'
                      ? 'border-[#059669] bg-emerald-50/60 ring-2 ring-[#059669] shadow-sm'
                      : 'border-[#bccac0]/40 bg-white hover:bg-slate-50'
                    }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-base text-[#0b1c30] flex items-center gap-2">
                      ⚜️ Elegante
                    </span>
                    {selectedStyle === 'elegant' && (
                      <div className="w-5 h-5 rounded-full bg-[#059669] flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-amber-800 bg-amber-100/70 py-0.5 px-2.5 rounded-full self-start">
                    💎 Recomendado para Joyería, Postres Finos y Regalos
                  </span>
                  <p className="text-xs text-slate-500">
                    Fondo cálido marfil, tipografía con serifa refinada y detalles visuales de alta gama.
                  </p>
                </button>
              </div>

              {/* Selector de Color Principal */}
              <div className="flex flex-col gap-3 mt-1 bg-white p-4 rounded-2xl border border-[#bccac0]/30 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#0b1c30]">Color de tu Marca</h3>
                  <span className="text-xs text-slate-500">Personaliza botones y detalles</span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  {STITCH_COLORS.map((col) => {
                    const isSelected = selectedColorHex === col.hex;
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => setSelectedColorHex(col.hex)}
                        title={col.name}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all ${isSelected
                            ? 'scale-110 shadow-md ring-2 ring-offset-2 ring-[#059669]'
                            : 'opacity-85 hover:opacity-100 hover:scale-105'
                          }`}
                        style={{ backgroundColor: col.hex }}
                      >
                        {isSelected && <Check size={18} className="text-white stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Device Preview del catálogo */}
              <div className="w-full pt-2 flex flex-col items-center">
                <LiveStorePreview
                  storeName={businessName || 'Mi Tienda'}
                  themeStyle={selectedStyle}
                  primaryColor={selectedColorHex}
                  categoryName={STITCH_CATEGORIES.find((c) => c.id === category)?.name || 'General'}
                />
              </div>

              <Button
                onClick={nextStep}
                variant="primary"
                fullWidth
                disabled={isSubmitting || isNavigatingStep}
                className="h-14 rounded-full text-base font-bold bg-[#006948] hover:bg-[#005137] mt-2 shadow-xs"
              >
                {isSubmitting || isNavigatingStep ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creando tu tienda...
                  </span>
                ) : (
                  'Crear mi tienda'
                )}
              </Button>
            </div>
          )}

          {/* PASO 5: ¡Listo! (Exacto Stitch) */}
          {step === 5 && (
            <div className="flex flex-col items-center text-center gap-6 py-2">
              <div className="w-16 h-16 bg-emerald-100 text-[#059669] rounded-full flex items-center justify-center shadow-xs">
                <Check size={36} />
              </div>

              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-[#0b1c30]">¡Tu tienda está lista!</h1>
                <p className="text-sm text-[#3d4a42]">
                  Hemos creado tu tienda <span className="font-semibold text-[#0b1c30]">{businessName || 'APANA'}</span>.
                </p>
              </div>

              <div className="w-full flex flex-col gap-3 mt-2">
                <Button
                  onClick={() => {
                    setIsFinishing(true);
                    localStorage.removeItem('apana_wizard_step');
                    window.location.href = '/products/new';
                  }}
                  variant="primary"
                  fullWidth
                  disabled={isFinishing}
                  className="h-12 flex items-center justify-center gap-2 bg-[#059669] hover:bg-[#00855d] cursor-pointer"
                >
                  {isFinishing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Abriendo catálogo...
                    </span>
                  ) : (
                    <>
                      <PackagePlus size={18} />
                      Publicar Mi Primer Producto
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Modal de Términos y Condiciones */}
      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </div>
  );
}
