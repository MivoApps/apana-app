'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Rocket, 
  CheckCircle, 
  Stars, 
  User,
  CreditCard,
  Wallet,
  BadgeCheck,
  Zap,
  Sparkles,
  ShieldCheck,
  Calendar,
  Lock,
  AlertTriangle,
  X,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';
import { getStoreByUserIdFromFS } from '@/lib/firebase/firestore';
import { Store } from '@/types/store';

declare global {
  interface Window {
    Culqi?: any;
    culqi?: () => void;
  }
}

export default function PlansPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromPath = searchParams.get('from');
  const { user } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>('gratis');
  const [checkoutTargetPlan, setCheckoutTargetPlan] = useState<'emprendedor' | 'negocio'>('emprendedor');
  const [isProcessing, setIsProcessing] = useState(false);
  const [culqiLoaded, setCulqiLoaded] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Cancel Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const loadStore = async () => {
    if (user) {
      const fsStore = await getStoreByUserIdFromFS(user.uid);
      if (fsStore) {
        setStore(fsStore);
        setCurrentPlan(fsStore.plan || 'gratis');
      }
    }
  };

  useEffect(() => {
    loadStore();
  }, [user]);

  // Configurar Callback global de Culqi
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.culqi = async () => {
        if (window.Culqi?.token) {
          const token = window.Culqi.token;
          window.Culqi.close();
          setIsProcessing(true);
          setErrorMsg('');

          const planToCharge = checkoutTargetPlan;
          const chargeAmount = planToCharge === 'negocio' ? 3990 : 1990;

          try {
            const res = await fetch('/api/culqi/charge', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                tokenId: token.id,
                storeId: store?.id,
                email: user?.email || token.email,
                amount: chargeAmount,
                plan: planToCharge,
              }),
            });

            const data = await res.json();

            if (!res.ok) {
              throw new Error(data.error || 'No se pudo procesar el pago.');
            }

            // Actualizar datos locales
            await loadStore();
            if (user && store) {
              sessionStorage.removeItem(`apana_cache_store_${user.uid}`);
              sessionStorage.removeItem(`apana_public_store_${store.slug}`);
            }

            setPaymentSuccess(true);
            setTimeout(() => setPaymentSuccess(false), 5000);
          } catch (err: any) {
            console.error('Error al cobrar:', err);
            setErrorMsg(err.message || 'Error al procesar el pago con Culqi.');
          } finally {
            setIsProcessing(false);
          }
        } else if (window.Culqi?.error) {
          console.error('Culqi Checkout Error:', window.Culqi.error);
          setErrorMsg(window.Culqi.error.user_message || 'Hubo un inconveniente al validar la tarjeta.');
        }
      };
    }
  }, [store, user, checkoutTargetPlan]);

  const handleOpenCulqiCheckout = (targetPlan: 'emprendedor' | 'negocio' = 'emprendedor') => {
    if (!store) {
      alert('Debes tener una tienda creada para suscribirte.');
      return;
    }

    setCheckoutTargetPlan(targetPlan);
    const amountInCents = targetPlan === 'negocio' ? 3990 : 1990;
    const planName = targetPlan === 'negocio' ? 'Plan Negocio Pro' : 'Plan Emprendedor';

    if (typeof window !== 'undefined' && window.Culqi) {
      const publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY || 'pk_test_demo12345';
      window.Culqi.publicKey = publicKey;
      window.Culqi.settings({
        title: 'APANA SaaS',
        currency: 'PEN',
        amount: amountInCents,
        description: `Suscripción Mensual - ${planName}`,
      });
      window.Culqi.options({
        lang: 'es',
        installments: false,
        paymentMethods: {
          tarjeta: true,
          yape: true,
          billetera: true,
        },
      });
      window.Culqi.open();
    } else {
      // Fallback de desarrollo
      const fakeConfirm = confirm(`Simulación de Culqi Checkout: ¿Deseas autorizar el cobro de S/ ${(amountInCents / 100).toFixed(2)} para activar el ${planName}?`);
      if (fakeConfirm) {
        if (window.culqi) {
          window.Culqi = { token: { id: `tkn_test_${Date.now()}`, email: user?.email } };
          window.culqi();
        }
      }
    }
  };

  const handleCancelSubscription = async () => {
    if (!store) return;
    setIsCancelling(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          action: 'cancel',
          userId: user?.uid,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo procesar la cancelación.');
      }

      setIsCancelModalOpen(false);
      setSuccessMsg('Tu suscripción ha sido cancelada. Mantendrás todos los beneficios hasta el fin de tu ciclo pagado.');
      setTimeout(() => setSuccessMsg(''), 6000);

      if (user) {
        sessionStorage.removeItem(`apana_cache_store_${user.uid}`);
        sessionStorage.removeItem(`apana_public_store_${store.slug}`);
      }
      await loadStore();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al cancelar la suscripción.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!store) return;
    setIsCancelling(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          action: 'reactivate',
          userId: user?.uid,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo reactivar la suscripción.');
      }

      setSuccessMsg('¡Suscripción reactivada con éxito! Tu plan continuará renovándose automáticamente.');
      setTimeout(() => setSuccessMsg(''), 6000);

      if (user) {
        sessionStorage.removeItem(`apana_cache_store_${user.uid}`);
        sessionStorage.removeItem(`apana_public_store_${store.slug}`);
      }
      await loadStore();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al reactivar la suscripción.');
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Próximo ciclo de 30 días';
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleBack = () => {
    if (fromPath && fromPath.startsWith('/')) {
      router.push(fromPath);
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/dashboard');
    }
  };

  const isPaidPlan = currentPlan !== 'gratis';
  const isCancelled = store?.cancelAtPeriodEnd || store?.subscriptionStatus === 'cancelled';
  const planDisplayName = currentPlan === 'emprendedor' ? 'Plan Emprendedor' : `Plan ${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}`;
  const isSuperAdminOrDev = process.env.NODE_ENV === 'development' || user?.email === 'angelo@mivo.pe' || user?.email === 'angelocastellanos99@gmail.com';

  const handleDirectPlanSwitchForTesting = async (targetPlan: 'gratis' | 'emprendedor' | 'negocio') => {
    if (!user || !store) return;
    setIsProcessing(true);
    setErrorMsg('');
    try {
      const { createOrUpdateStoreInFS } = await import('@/lib/firebase/firestore');
      const updated = await createOrUpdateStoreInFS(user.uid, {
        plan: targetPlan,
        subscriptionStatus: targetPlan === 'gratis' ? 'free' : 'active',
        cancelAtPeriodEnd: false,
      });
      setStore(updated);
      setCurrentPlan(targetPlan);
      sessionStorage.setItem(`apana_cache_store_${user.uid}`, JSON.stringify(updated));
      sessionStorage.removeItem(`apana_public_store_${updated.slug}`);
      setSuccessMsg(`🧪 [MODO PRUEBAS] Has cambiado instantáneamente al Plan ${targetPlan.toUpperCase()}.`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setErrorMsg(`Error al cambiar de plan: ${err?.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans relative pb-16">
      {/* Header Fijo */}
      <header className="fixed top-0 w-full z-40 bg-[#f8f9ff]/80 backdrop-blur-xl border-b border-[#bccac0]/20">
        <div className="h-16 px-4 max-w-[640px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="w-10 h-10 flex items-center justify-center text-[#0b1c30] hover:bg-gray-100 transition-colors rounded-full cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-bold text-lg text-[#0b1c30]">Planes y Suscripción</h1>
          </div>
          <Link href="/settings" title="Ir a Ajustes" className="transition-transform active:scale-95">
            <div className="w-8 h-8 rounded-full bg-[#059669] text-white flex items-center justify-center shadow-2xs hover:opacity-90 cursor-pointer">
              <User size={18} />
            </div>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-20 px-4 max-w-[640px] w-full mx-auto flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center gap-2 mt-2">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center mb-1">
            <Rocket size={28} className="animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-[#0b1c30]">
            Elige el plan ideal para tu negocio
          </h2>
          <p className="text-sm text-[#3d4a42] max-w-[340px]">
            Desbloquea herramientas profesionales para hacer crecer tus ventas.
          </p>
        </div>

        {/* Notificaciones */}
        {paymentSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl flex items-center gap-3 shadow-xs animate-in fade-in">
            <CheckCircle size={22} className="text-[#059669] shrink-0" />
            <div className="flex flex-col">
              <span className="font-bold text-sm">¡Pago Exitoso!</span>
              <span className="text-xs">Tu {planDisplayName} ha sido activado por 30 días con renovación automática.</span>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl flex items-center gap-3 shadow-xs animate-in fade-in">
            <CheckCircle size={20} className="text-[#059669] shrink-0" />
            <span className="text-xs font-semibold">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Tarjeta de Gestión de Suscripción Activa (Presente para cualquier plan de pago) */}
        {isPaidPlan && (
          <div className={`p-5 rounded-2xl border shadow-xs flex flex-col gap-3.5 transition-all ${
            isCancelled 
              ? 'bg-amber-50/70 border-amber-200 text-amber-950'
              : 'bg-white border-[#059669]/40 ring-2 ring-[#059669]/10'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isCancelled ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-[#059669]'
                }`}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#0b1c30]">
                    {planDisplayName}
                  </h3>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                    isCancelled ? 'bg-amber-200/60 text-amber-900' : 'bg-emerald-100 text-[#059669]'
                  }`}>
                    {isCancelled ? 'Cancelación Programada' : 'Suscripción Activa'}
                  </span>
                </div>
              </div>

              {/* Botón de Cancelar o Reactivar */}
              {isCancelled ? (
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={handleReactivateSubscription}
                  className="text-xs font-bold text-[#006c49] bg-white border border-[#059669]/30 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  <RefreshCw size={12} className={isCancelling ? 'animate-spin' : ''} />
                  <span>Reactivar renovación</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(true)}
                  className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors underline underline-offset-2 py-1 px-2"
                >
                  Cancelar plan
                </button>
              )}
            </div>

            <div className="text-xs text-[#3d4a42] leading-relaxed pt-2 border-t border-black/5 flex items-center gap-2">
              <Calendar size={14} className="text-slate-400 shrink-0" />
              {isCancelled ? (
                <span>
                  Mantendrás tus beneficios vigentes hasta el <strong>{formatDate(store?.nextBillingDate)}</strong>. Luego volverás al Plan Gratis.
                </span>
              ) : (
                <span>
                  Tu plan se renovará automáticamente el <strong>{formatDate(store?.nextBillingDate)}</strong>.
                </span>
              )}
            </div>
          </div>
        )}

        {/* 3 Plans Container */}
        <div className="flex flex-col gap-5">
          
          {/* 1. Plan Gratis */}
          <div className={`flex flex-col gap-4 bg-white shadow-xs border rounded-2xl p-5 transition-all ${
            currentPlan === 'gratis' ? 'border-[#059669] ring-2 ring-[#059669]/10' : 'border-[#bccac0]/40'
          }`}>
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-0.5">
                <h3 className="font-bold text-xl text-[#0b1c30]">Gratis</h3>
                <p className="text-xs text-[#6d7a72]">Para empezar a vender sin pagar</p>
              </div>
              {currentPlan === 'gratis' && (
                <div className="px-3 py-1 bg-emerald-100 text-[#059669] text-xs font-bold rounded-full">
                  Plan actual
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-[#0b1c30]">S/ 0</span>
              <span className="text-xs text-[#6d7a72]">/ siempre gratis</span>
            </div>

            {/* Features Plan Gratis */}
            <ul className="flex flex-col gap-2.5 pt-2 border-t border-gray-100 text-sm">
              <li className="flex items-center gap-2 text-[#0b1c30]">
                <CheckCircle size={18} className="text-[#059669]" />
                <span>Hasta <strong>25 productos</strong></span>
              </li>
              <li className="flex items-center gap-2 text-[#0b1c30]">
                <CheckCircle size={18} className="text-[#059669]" />
                <span><strong>1 foto</strong> por producto</span>
              </li>
              <li className="flex items-center gap-2 text-[#0b1c30]">
                <CheckCircle size={18} className="text-[#059669]" />
                <span><strong>Checkout inteligente:</strong> captura datos y método de pago</span>
              </li>
              <li className="flex items-center gap-2 text-[#0b1c30]">
                <CheckCircle size={18} className="text-[#059669]" />
                <span><strong>Código QR y enlaces</strong> para compartir</span>
              </li>
              <li className="flex items-center gap-2 text-[#0b1c30]">
                <CheckCircle size={18} className="text-[#059669]" />
                <span>Pedidos directos a tu <strong>WhatsApp</strong></span>
              </li>
              <li className="flex items-center gap-2 text-slate-400 text-xs">
                <span>• Incluye marca "Creado por APANA"</span>
              </li>
            </ul>

            {currentPlan !== 'gratis' && isSuperAdminOrDev && (
              <div className="pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => handleDirectPlanSwitchForTesting('gratis')}
                  disabled={isProcessing}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>🧪 Volver a Plan Gratis (Modo Pruebas)</span>
                </button>
              </div>
            )}
          </div>

          {/* 2. Plan Emprendedor (Highlighted) */}
          <div className={`flex flex-col gap-4 bg-linear-to-b from-[#f5fff7] via-white to-white shadow-sm border rounded-2xl p-5 relative overflow-hidden transition-all ${
            currentPlan === 'emprendedor' ? 'border-[#059669] ring-2 ring-[#059669]/10' : 'border-slate-200'
          }`}>
            {/* Subtle Decorative Background */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#059669]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-start relative z-10">
              <div className="flex flex-col gap-0.5">
                <h3 className="font-bold text-xl text-[#0b1c30]">Emprendedor</h3>
                <p className="text-xs text-[#6d7a72]">Para negocios en crecimiento</p>
              </div>
              <div className="px-3 py-1 bg-[#059669] text-white text-xs font-semibold rounded-full shadow-xs flex items-center gap-1">
                <Stars size={14} />
                Recomendado
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-1 relative z-10">
              <span className="text-3xl font-bold text-[#0b1c30]">S/ 19.90</span>
              <span className="text-xs text-[#6d7a72]">/ mes</span>
            </div>

            {/* Features */}
            <ul className="flex flex-col gap-2.5 pt-2 border-t border-[#bccac0]/30 relative z-10 text-sm">
              <li className="flex items-center gap-2 text-[#0b1c30] font-medium">
                <CheckCircle size={18} className="text-[#059669]" />
                <span>Hasta <strong>150 productos</strong></span>
              </li>
              <li className="flex items-center gap-2 text-[#0b1c30]">
                <CheckCircle size={18} className="text-[#059669]" />
                <span>Hasta <strong>4 imágenes HD</strong> por producto</span>
              </li>
              <li className="flex items-center gap-2 text-[#0b1c30]">
                <CheckCircle size={18} className="text-[#059669]" />
                <span><strong>🔥 Precios de oferta tachados (% OFF)</strong></span>
              </li>
              <li className="flex items-center gap-2 text-[#0b1c30]">
                <CheckCircle size={18} className="text-[#059669]" />
                <span><strong>🏷️ Insignias</strong> (Nuevo / Top Ventas)</span>
              </li>
              <li className="flex items-center gap-2 text-[#0b1c30]">
                <CheckCircle size={18} className="text-[#059669]" />
                <span><strong>Variantes con sobreprecio</strong> (2 grupos)</span>
              </li>
              <li className="flex items-center gap-2 text-[#0b1c30]">
                <CheckCircle size={18} className="text-[#059669]" />
                <span><strong>Categorías de productos</strong> ilimitadas</span>
              </li>
              <li className="flex items-center gap-2 text-[#0b1c30]">
                <CheckCircle size={18} className="text-[#059669]" />
                <span><strong>Métricas de visitas</strong> y clics</span>
              </li>
              <li className="flex items-center gap-2 text-[#0b1c30]">
                <CheckCircle size={18} className="text-[#059669]" />
                <span><strong>Sin marca "Creado por APANA"</strong></span>
              </li>
            </ul>

            {/* Botón de Suscripción con Culqi Checkout */}
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2 relative z-10">
              {currentPlan === 'emprendedor' ? (
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-[#059669]" />
                    <span>Tu Plan Emprendedor está Activo</span>
                  </div>
                  {!isCancelled && (
                    <button
                      type="button"
                      onClick={() => setIsCancelModalOpen(true)}
                      className="text-xs text-slate-500 hover:text-red-600 font-medium underline"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleOpenCulqiCheckout('emprendedor')}
                    className="w-full h-12 bg-[#059669] hover:bg-[#00855d] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock size={16} />
                    <span>{isProcessing && checkoutTargetPlan === 'emprendedor' ? 'Procesando...' : 'Elegir Plan Emprendedor (S/ 19.90)'}</span>
                  </button>
                  {isSuperAdminOrDev && (
                    <button
                      type="button"
                      onClick={() => handleDirectPlanSwitchForTesting('emprendedor')}
                      disabled={isProcessing}
                      className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-[#006c49] border border-emerald-200 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>🧪 Activar Emprendedor (1-Clic Pruebas)</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* 3. Plan Negocio Pro (VIP) */}
          <div className={`flex flex-col gap-4 bg-white shadow-md border-2 rounded-2xl p-5 relative overflow-hidden transition-all ${
            currentPlan === 'negocio' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-amber-200'
          }`}>
            {/* Subtle Decorative Background */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-start relative z-10">
              <div className="flex flex-col gap-0.5">
                <h3 className="font-bold text-xl text-[#0b1c30]">Negocio Pro</h3>
                <p className="text-xs text-[#6d7a72]">Para marcas consolidadas y escala total</p>
              </div>
              <div className="px-3 py-1 bg-amber-600 text-white text-xs font-semibold rounded-full shadow-xs flex items-center gap-1">
                <Sparkles size={14} />
                Escala Total
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-1 relative z-10">
              <span className="text-3xl font-bold text-[#0b1c30]">S/ 39.90</span>
              <span className="text-xs text-[#6d7a72]">/ mes</span>
            </div>

            {/* Features Plan Negocio Pro */}
            <ul className="flex flex-col gap-2.5 pt-2 border-t border-amber-100 relative z-10 text-sm">
              <li className="flex items-center gap-2 text-[#0b1c30] font-medium">
                <CheckCircle size={18} className="text-amber-600" />
                <span><strong>PRODUCTOS ILIMITADOS</strong></span>
              </li>
              <li className="flex items-center gap-2 text-[#0b1c30]">
                <CheckCircle size={18} className="text-amber-600" />
                <span><strong>Todo lo del Plan Emprendedor</strong></span>
              </li>
              <li className="flex items-center gap-2 text-[#0b1c30]">
                <CheckCircle size={18} className="text-amber-600" />
                <span><strong>📊 Exportación a Excel</strong> (Catálogo y Pedidos)</span>
              </li>
              <li className="flex items-center gap-2 text-[#0b1c30]">
                <CheckCircle size={18} className="text-amber-600" />
                <span>Hasta <strong>8 imágenes HD</strong> por producto</span>
              </li>
              <li className="flex items-center gap-2 text-[#0b1c30]">
                <CheckCircle size={18} className="text-amber-600" />
                <span>Soporte prioritario personalizado por WhatsApp</span>
              </li>
            </ul>

            {/* Botón de Suscripción con Culqi Checkout */}
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2 relative z-10">
              {currentPlan === 'negocio' ? (
                <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 font-bold text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-amber-600" />
                    <span>Tu Plan Negocio Pro está Activo</span>
                  </div>
                  {!isCancelled && (
                    <button
                      type="button"
                      onClick={() => setIsCancelModalOpen(true)}
                      className="text-xs text-slate-500 hover:text-red-600 font-medium underline"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleOpenCulqiCheckout('negocio')}
                    className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock size={16} />
                    <span>{isProcessing && checkoutTargetPlan === 'negocio' ? 'Procesando...' : 'Elegir Plan Negocio (S/ 39.90)'}</span>
                  </button>
                  {isSuperAdminOrDev && (
                    <button
                      type="button"
                      onClick={() => handleDirectPlanSwitchForTesting('negocio')}
                      disabled={isProcessing}
                      className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>🧪 Activar Negocio Pro (1-Clic Pruebas)</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* APANA PAGOS (Servicio adicional - PROXIMAMENTE) */}
        <div className="bg-[#eff4ff] border border-[#cbdbf5] rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-800 text-[11px] font-bold mb-1.5 border border-amber-500/20">
              <Sparkles size={13} className="text-amber-600" />
              <span>Próximamente</span>
            </div>
            <h3 className="font-extrabold text-base text-[#0b1c30]">
              Cobros Online con Tarjeta (APANA Pagos)
            </h3>
            <p className="text-xs text-[#3d4a42]">
              Actualmente todas las ventas se procesan por WhatsApp. Muy pronto podrás activar cobros con tarjeta en tu catálogo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white/90 p-3.5 rounded-xl border border-[#bccac0]/40 flex flex-col justify-between gap-2 relative">
              <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                Pronto
              </span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Wallet size={16} className="text-[#059669]" />
                  <h4 className="font-bold text-xs text-[#0b1c30]">APANA Pagos</h4>
                </div>
                <p className="text-[11px] text-[#059669] font-medium italic">
                  "Conecta tu propia cuenta de pagos y cobra online."
                </p>
              </div>
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <BadgeCheck size={12} className="text-[#059669]" /> Directo a tu cuenta
              </span>
            </div>

            <div className="bg-white/90 p-3.5 rounded-xl border border-[#059669]/30 flex flex-col justify-between gap-2 relative">
              <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                Pronto
              </span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard size={16} className="text-[#059669]" />
                  <h4 className="font-bold text-xs text-[#0b1c30]">APANA Pagos Gestionado</h4>
                </div>
                <p className="text-[11px] text-[#059669] font-medium italic">
                  "Cobra online sin preocuparte por la configuración de pagos."
                </p>
              </div>
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <BadgeCheck size={12} className="text-[#059669]" /> Sin configuraciones técnicas
              </span>
            </div>
          </div>
        </div>

      </main>

      {/* Modal de Cancelación de Suscripción */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#bccac0]/30 flex flex-col gap-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#0b1c30]">
                    ¿Deseas cancelar tu plan?
                  </h3>
                  <p className="text-xs text-[#6d7a72]">
                    {planDisplayName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body Info */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex flex-col gap-2 text-xs text-amber-950 leading-relaxed">
              <p>
                Mantendrás <strong>todos los beneficios activos</strong> hasta el <strong>{formatDate(store?.nextBillingDate)}</strong>.
              </p>
              <p className="text-[11px] text-amber-900/80">
                Al llegar esa fecha, no se te cobrará nada adicional y tu catálogo pasará al <strong>Plan Gratis</strong> (límite de 25 productos y 1 imagen por producto).
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="w-full h-11 bg-[#059669] hover:bg-[#00855d] text-white font-bold text-sm rounded-xl transition-all shadow-xs"
              >
                Continuar con mi plan
              </button>

              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancelSubscription}
                className="w-full h-11 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-semibold text-xs rounded-xl transition-all"
              >
                {isCancelling ? 'Procesando...' : 'Confirmar cancelación de renovación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Script Oficial de Culqi Checkout v4 */}
      <Script
        src="https://checkout.culqi.com/js/v4"
        strategy="afterInteractive"
        onLoad={() => setCulqiLoaded(true)}
      />
    </div>
  );
}
