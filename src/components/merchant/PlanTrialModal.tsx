'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { auth } from '@/lib/firebase/config';
import {
  X,
  Check,
  CreditCard,
  Lock,
  Gift,
  Bell,
  Crown,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

declare global {
  interface Window {
    Culqi?: any;
    culqi?: () => void;
  }
}

export interface TrialActivationResult {
  plan: 'emprendedor' | 'negocio';
  subscriptionStatus: 'trial';
  hasUsedTrial: boolean;
  trialEndDate: number;
  nextBillingDate: number;
  billingCycle: 'mensual' | 'anual';
  cardLastFour?: string;
  cardBrand?: string;
}

interface PlanTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId?: string;
  storeName: string;
  userEmail?: string;
  userPhone?: string;
  onSuccess?: (result?: TrialActivationResult) => void;
  onSelectTrial?: (plan: 'emprendedor' | 'negocio') => void;
  onContinueFree: () => void;
  isProcessing?: boolean;
  initialPlan?: 'emprendedor' | 'negocio';
}

/**
 * Preconecta con checkout.culqi.com y carga dinámicamente el script oficial de Culqi Checkout v4.
 */
function preconnectCulqi() {
  if (typeof document === 'undefined') return;
  const origins = ['https://checkout.culqi.com', 'https://secure.culqi.com'];
  origins.forEach((href) => {
    if (!document.querySelector(`link[rel="preconnect"][href="${href}"]`)) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  });
}

function ensureCulqiCheckoutScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Entorno de navegador no disponible.'));
      return;
    }
    preconnectCulqi();
    if (window.Culqi) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.culqi.com/js/v4"]'
    );
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('No se pudo cargar Culqi Checkout.')), { once: true });
      // Fallback si ya había cargado antes de registrar el listener
      setTimeout(() => {
        if (window.Culqi) resolve();
      }, 600);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.culqi.com/js/v4';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar la pasarela de pagos Culqi.'));
    document.head.appendChild(script);
  });
}

export const PlanTrialModal: React.FC<PlanTrialModalProps> = ({
  isOpen,
  onClose,
  storeId,
  storeName,
  userEmail = '',
  userPhone = '',
  onSuccess,
  onSelectTrial,
  onContinueFree,
  initialPlan = 'emprendedor',
}) => {
  // Step progression: 1 = Plan & Features (+ Culqi Checkout v4), 3 = Success Celebration
  const [step, setStep] = useState<1 | 3>(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Plan Selection State
  const [selectedPlanTier, setSelectedPlanTier] = useState<'emprendedor' | 'negocio'>(initialPlan);
  const [billingCycle, setBillingCycle] = useState<'mensual' | 'anual'>('mensual');

  // Processing & Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpeningCheckout, setIsOpeningCheckout] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activatedInfo, setActivatedInfo] = useState<{
    cardLastFour?: string;
    cardBrand?: string;
    trialEndDate?: number;
    planName?: string;
  }>({});

  // Precargar Culqi Checkout v4 + preconnect en segundo plano apenas se monta el componente
  useEffect(() => {
    ensureCulqiCheckoutScript().catch(() => {});
  }, []);

  // Resetear estado al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setErrorMessage('');
      setIsSubmitting(false);
      setIsOpeningCheckout(false);
      if (initialPlan) setSelectedPlanTier(initialPlan);
      ensureCulqiCheckoutScript().catch(() => {});
    }
  }, [isOpen, initialPlan]);

  // Dynamic Dates Calculation (Reverse-trial logic with APANA WhatsApp reminders)
  const { todayStr, reminderDateStr, renewalDateStr, renewalTimestamp } = useMemo(() => {
    const now = new Date();
    const reminderDate = new Date(now.getTime() + 23 * 24 * 60 * 60 * 1000);
    const renewalDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const formatDate = (d: Date) =>
      d
        .toLocaleDateString('es-PE', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
        .replace('.', '');

    return {
      todayStr: 'Hoy',
      reminderDateStr: formatDate(reminderDate),
      renewalDateStr: formatDate(renewalDate),
      renewalTimestamp: renewalDate.getTime(),
    };
  }, []);

  // Pricing data
  const pricing = useMemo(() => {
    if (selectedPlanTier === 'emprendedor') {
      return {
        name: 'Plan Emprendedor',
        tier: 'emprendedor' as const,
        monthlyPrice: 'S/ 19.90',
        annualTotal: 'S/ 139.90',
        annualMonthlyEquiv: 'S/ 11.66',
        annualSavings: 'Ahorra S/ 98.90',
        displayRenewalPrice: billingCycle === 'anual' ? 'S/ 139.90 / año' : 'S/ 19.90 / mes',
        features: [
          'Hasta 150 productos activos (vs 25 en el plan gratis)',
          'Hasta 4 fotos en alta resolución por producto',
          'Precios de oferta tachados (% OFF en tu catálogo)',
          'Métricas en tiempo real: visitas y clics de WhatsApp',
          'Sin marca de agua "Creado por APANA" en tu tienda',
        ],
      };
    }
    return {
      name: 'Plan Negocio Pro',
      tier: 'negocio' as const,
      monthlyPrice: 'S/ 39.90',
      annualTotal: 'S/ 219.90',
      annualMonthlyEquiv: 'S/ 18.33',
      annualSavings: 'Ahorra S/ 258.90',
      displayRenewalPrice: billingCycle === 'anual' ? 'S/ 219.90 / año' : 'S/ 39.90 / mes',
      features: [
        'PRODUCTOS ILIMITADOS en tu catálogo sin restricciones',
        'Todo lo del Plan Emprendedor incluido',
        'Hasta 8 fotos por producto para máxima conversión',
        'Exportación a Excel de catálogo de productos y pedidos',
        'Soporte prioritario personalizado directo por WhatsApp',
      ],
    };
  }, [selectedPlanTier, billingCycle]);

  // Enviar token certificado de Culqi Checkout v4 al backend de APANA
  const submitTrialToken = async (tokenId: string, tokenEmail?: string) => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const targetStoreId =
        storeId ||
        (typeof window !== 'undefined' ? localStorage.getItem('apana_active_store_id') || '' : '');
      const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : '';

      const res = await fetch('/api/culqi/register-trial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({
          tokenId,
          storeId: targetStoreId,
          plan: selectedPlanTier,
          billingCycle,
          email: (tokenEmail || userEmail || auth.currentUser?.email || '').trim(),
          customerName: storeName,
          phone: userPhone,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo activar la prueba gratuita.');
      }

      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }

      if (onSelectTrial) {
        onSelectTrial(selectedPlanTier);
      }

      setActivatedInfo({
        cardLastFour: data.cardLastFour || '••••',
        cardBrand: data.cardBrand || 'Tarjeta',
        trialEndDate: data.trialEndDate || renewalTimestamp,
        planName: pricing.name,
      });

      setStep(3);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
      }
    } catch (err: any) {
      console.error('Error activando prueba en APANA:', err);
      setErrorMessage(
        err.message || 'Ocurrió un error al vincular tu tarjeta. Por favor intenta nuevamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Abrir Culqi Checkout v4 oficial (PCI-DSS + 3DS + branding APANA)
  const handleOpenCulqiTrialCheckout = async () => {
    setErrorMessage('');
    setIsOpeningCheckout(true);

    const culqiPublicKey = (process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY || '').trim();
    const isRealCulqiKey = Boolean(
      culqiPublicKey &&
        !culqiPublicKey.includes('xxxxxxxx') &&
        !culqiPublicKey.includes('demo') &&
        (culqiPublicKey.startsWith('pk_live_') || culqiPublicKey.startsWith('pk_test_'))
    );
    const isDevEnv = process.env.NODE_ENV === 'development';

    if (!isRealCulqiKey) {
      setIsOpeningCheckout(false);
      if (isDevEnv) {
        await submitTrialToken(`tkn_dev_mock_${Date.now()}`, userEmail);
        return;
      }
      setErrorMessage(
        'La pasarela de pagos aún no está habilitada en producción. Contáctanos por WhatsApp para activar tu prueba.'
      );
      return;
    }

    try {
      await ensureCulqiCheckoutScript();
    } catch (scriptErr: any) {
      setIsOpeningCheckout(false);
      setErrorMessage(
        scriptErr?.message || 'No se pudo cargar la pasarela de pagos Culqi. Recarga e intenta de nuevo.'
      );
      return;
    }

    if (typeof window === 'undefined' || !window.Culqi) {
      setIsOpeningCheckout(false);
      setErrorMessage('La pasarela Culqi no está disponible en este momento. Recarga la página.');
      return;
    }

    // Guardar callback previo (ej. de /plans) para restaurarlo al finalizar
    const previousCulqiCallback = window.culqi;

    window.culqi = async () => {
      setIsOpeningCheckout(false);
      try {
        if (window.Culqi?.token?.id) {
          const token = window.Culqi.token;
          window.Culqi.close();
          await submitTrialToken(token.id, token.email);
        } else if (window.Culqi?.error) {
          console.error('Culqi Checkout v4 Error:', window.Culqi.error);
          setErrorMessage(
            window.Culqi.error.user_message ||
              window.Culqi.error.merchant_message ||
              'Hubo un inconveniente al validar tu tarjeta.'
          );
        }
      } finally {
        window.culqi = previousCulqiCallback;
      }
    };

    window.Culqi.publicKey = culqiPublicKey;
    window.Culqi.settings({
      title: 'APANA • 30 Días Gratis',
      currency: 'PEN',
      amount: 0, // Tokenización sin cobro hoy (S/ 0.00)
    });
    window.Culqi.options({
      lang: 'es',
      installments: false,
      paymentMethods: {
        tarjeta: true,
        yape: false,
        bancaMovil: false,
        agente: false,
        billetera: false,
        cuotealo: false,
      },
      style: {
        logo: 'https://www.beapana.com/icon-192.png',
        bannerColor: '#059669',
        buttonBackground: '#059669',
        menuColor: '#0b1c30',
        links: '#059669',
      },
    });

    window.Culqi.open();

    // Quitar el spinner una vez que el iframe de Culqi terminó de aparecer (o si el usuario lo cierra sin pagar)
    setTimeout(() => {
      setIsOpeningCheckout(false);
    }, 2200);
  };

  // Finalizar paso 3 de celebración y propagar resultado actualizado
  const handleFinishStep3 = () => {
    const result: TrialActivationResult = {
      plan: selectedPlanTier,
      subscriptionStatus: 'trial',
      hasUsedTrial: true,
      trialEndDate: activatedInfo.trialEndDate || renewalTimestamp,
      nextBillingDate: activatedInfo.trialEndDate || renewalTimestamp,
      billingCycle,
      cardLastFour: activatedInfo.cardLastFour,
      cardBrand: activatedInfo.cardBrand,
    };
    if (onSuccess) {
      onSuccess(result);
    } else {
      onClose();
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-xs font-sans animate-in fade-in duration-200">
      {/* APANA Modal Container */}
      <div
        className="w-full max-w-4xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92dvh] sm:max-h-[88vh] overflow-hidden relative animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* APANA Modal Top Bar */}
        <header className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-500/20 text-[#059669] text-xs font-extrabold">
            <Sparkles size={13} className="text-amber-500" />
            <span>Beneficio de Bienvenida APANA</span>
          </div>

          <button
            type="button"
            onClick={step === 3 ? handleFinishStep3 : onContinueFree}
            disabled={isSubmitting}
            aria-label="Cerrar modal"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </header>

        {/* Modal Scrollable Body */}
        <div ref={scrollContainerRef} className="overflow-y-auto p-4 sm:p-6 flex-1 flex flex-col">
          {/* STEP 3: CELEBRATION SUCCESS STATE */}
          {step === 3 ? (
            <div className="my-auto py-8 max-w-md mx-auto w-full text-center flex flex-col items-center gap-5 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center shadow-inner">
                <CheckCircle2 size={36} className="stroke-[2.5]" />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-[#059669] bg-emerald-50 px-3 py-1 rounded-full self-center">
                  Prueba de 30 Días Activada
                </span>
                <h2 className="text-2xl font-black text-[#0b1c30]">
                  ¡Bienvenido a {activatedInfo.planName || 'tu Plan Pro'}!
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Tu tienda ya cuenta con todas las herramientas profesionales activas y listas para usar.
                </p>
              </div>

              <div className="w-full bg-[#f8f9ff] border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-2.5 text-xs text-left">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">A pagar hoy:</span>
                  <span className="font-extrabold text-[#059669] bg-emerald-100/70 px-2 py-0.5 rounded-full">
                    S/ 0.00
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Fecha de renovación:</span>
                  <span className="font-bold text-[#0b1c30]">{renewalDateStr}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Método guardado:</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <CreditCard size={14} className="text-[#059669]" />
                    {activatedInfo.cardBrand || 'Tarjeta'} •••• {activatedInfo.cardLastFour || '••••'}
                  </span>
                </div>
                <div className="flex items-start gap-2 pt-2 border-t border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                  <Bell size={13} className="text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    Te avisaremos por WhatsApp el {reminderDateStr} (7 días antes). Puedes cancelar cuando quieras en 1 clic.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFinishStep3}
                className="w-full h-12 rounded-xl bg-[#059669] hover:bg-[#00855d] text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <span>Comenzar a vender con APANA Pro</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            /* TWO-COLUMN APANA EXPERIENCE */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: Plan Selection */}
              <div className="md:col-span-7 flex flex-col gap-4 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#0b1c30] tracking-tight">
                    30 Días Gratis para hacer crecer tu tienda
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Disfruta de todas las herramientas avanzadas sin costo hoy. Cancela con un solo clic cuando quieras.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                    <AlertCircle size={16} className="shrink-0 text-red-500 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Selector de Plan: Emprendedor vs Negocio Pro */}
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setSelectedPlanTier('emprendedor')}
                    className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition-all cursor-pointer relative ${
                      selectedPlanTier === 'emprendedor'
                        ? 'bg-white shadow-xs text-[#059669] font-bold ring-1 ring-emerald-500/30'
                        : 'text-slate-600 hover:text-slate-900 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Zap
                        size={14}
                        className={selectedPlanTier === 'emprendedor' ? 'text-[#059669]' : 'text-slate-400'}
                      />
                      <span className="text-xs sm:text-sm">Emprendedor</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold mt-0.5">S/ 19.90 /mes</span>
                    {selectedPlanTier === 'emprendedor' && (
                      <span className="absolute -top-2 bg-[#059669] text-white text-[8px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider shadow-2xs">
                        Más elegido
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPlanTier('negocio')}
                    className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition-all cursor-pointer relative ${
                      selectedPlanTier === 'negocio'
                        ? 'bg-white shadow-xs text-amber-700 font-bold ring-1 ring-amber-500/30'
                        : 'text-slate-600 hover:text-slate-900 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Crown
                        size={14}
                        className={selectedPlanTier === 'negocio' ? 'text-amber-500' : 'text-slate-400'}
                      />
                      <span className="text-xs sm:text-sm">Negocio Pro</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold mt-0.5">S/ 39.90 /mes</span>
                    <span className="absolute -top-2 bg-amber-600 text-white text-[8px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider shadow-2xs">
                      Ilimitado
                    </span>
                  </button>
                </div>

                {/* Frecuencia de Renovación: Mensual vs Anual */}
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Frecuencia al finalizar la prueba:
                  </span>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div
                      onClick={() => setBillingCycle('mensual')}
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                        billingCycle === 'mensual'
                          ? 'border-[#059669] bg-emerald-50/20 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div
                        className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          billingCycle === 'mensual' ? 'border-[#059669]' : 'border-slate-300'
                        }`}
                      >
                        {billingCycle === 'mensual' && <div className="w-2.5 h-2.5 rounded-full bg-[#059669]" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#0b1c30]">Mensual</span>
                        <span className="text-[11px] text-slate-500">{pricing.monthlyPrice}</span>
                      </div>
                    </div>

                    <div
                      onClick={() => setBillingCycle('anual')}
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 relative ${
                        billingCycle === 'anual'
                          ? 'border-[#059669] bg-emerald-50/20 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div
                        className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          billingCycle === 'anual' ? 'border-[#059669]' : 'border-slate-300'
                        }`}
                      >
                        {billingCycle === 'anual' && <div className="w-2.5 h-2.5 rounded-full bg-[#059669]" />}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#0b1c30]">Anual</span>
                          <span className="text-[9px] font-extrabold text-[#059669] bg-emerald-100 px-1.5 py-0.2 rounded-full">
                            {pricing.annualSavings}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">{pricing.annualMonthlyEquiv} /mes</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Beneficios Incluidos del Plan */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    selectedPlanTier === 'emprendedor'
                      ? 'bg-linear-to-b from-emerald-50/30 via-white to-white border-emerald-200/70'
                      : 'bg-linear-to-b from-amber-50/30 via-white to-white border-amber-200/70'
                  }`}
                >
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block mb-2.5">
                    Beneficios que tendrás activos hoy:
                  </span>
                  <ul className="flex flex-col gap-2 text-xs text-[#0b1c30]">
                    {pricing.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            selectedPlanTier === 'emprendedor'
                              ? 'bg-emerald-100 text-[#059669]'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          <Check size={11} className="stroke-[3]" />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200/70 rounded-xl p-3 flex items-start gap-2">
                  <ShieldCheck size={15} className="text-[#059669] shrink-0 mt-0.5" />
                  <span>
                    Validación segura con <strong>Culqi Checkout (PCI-DSS)</strong>. No se realizará ningún cobro hoy (<strong>S/ 0.00</strong>).
                  </span>
                </div>
              </div>

              {/* RIGHT COLUMN: APANA Timeline Roadmap & Order Summary */}
              <div className="md:col-span-5 flex flex-col gap-3.5 sm:sticky sm:top-2">
                {/* CARD 1: APANA REVERSE-TRIAL ROADMAP */}
                <div className="bg-[#f8f9ff] rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col gap-3.5">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    ¿Cómo funciona tu prueba gratis?
                  </span>

                  <div className="flex items-start gap-3 relative">
                    <div className="absolute left-3.5 top-7 bottom-0 w-0.5 bg-emerald-500/40" />
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center shrink-0 z-10">
                      <Gift size={14} />
                    </div>
                    <div className="flex flex-col gap-0.5 pt-0.5">
                      <span className="font-extrabold text-xs text-[#0b1c30]">{todayStr}</span>
                      <span className="text-[11px] text-slate-500 leading-snug">
                        Accede de inmediato a todos los beneficios de {pricing.name}.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 relative pt-1.5">
                    <div className="absolute left-3.5 top-7 bottom-0 w-0.5 bg-slate-200" />
                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 z-10">
                      <Bell size={14} />
                    </div>
                    <div className="flex flex-col gap-0.5 pt-0.5">
                      <span className="font-extrabold text-xs text-[#0b1c30]">{reminderDateStr}</span>
                      <span className="text-[11px] text-slate-500 leading-snug">
                        Te avisaremos por WhatsApp 7 días antes de culminar tu prueba.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 relative pt-1.5">
                    <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 z-10">
                      <Crown size={14} />
                    </div>
                    <div className="flex flex-col gap-0.5 pt-0.5">
                      <span className="font-extrabold text-xs text-[#0b1c30]">{renewalDateStr}</span>
                      <span className="text-[11px] text-slate-500 leading-snug">
                        Se renovará automáticamente solo si decides continuar. Puedes cancelar antes en 1 clic.
                      </span>
                    </div>
                  </div>
                </div>

                {/* CARD 2: SUMMARY & PRIMARY CTA */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col gap-3 shadow-xs">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm text-[#0b1c30]">A pagar hoy</span>
                      <span className="bg-emerald-100 text-[#059669] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        30 días gratis
                      </span>
                    </div>
                    <span className="text-xl font-black text-[#059669]">S/ 0.00</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Próximo cobro ({renewalDateStr}):</span>
                    <span className="font-bold text-[#0b1c30]">{pricing.displayRenewalPrice}</span>
                  </div>

                  <button
                    type="button"
                    disabled={isSubmitting || isOpeningCheckout}
                    onClick={handleOpenCulqiTrialCheckout}
                    className="w-full h-11 sm:h-12 rounded-xl bg-[#059669] hover:bg-[#00855d] disabled:bg-emerald-400 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Activando tu prueba gratis...</span>
                      </span>
                    ) : isOpeningCheckout ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Abriendo pasarela segura...</span>
                      </span>
                    ) : (
                      <>
                        <Lock size={15} />
                        <span>Vincular tarjeta (S/ 0.00 hoy)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={onContinueFree}
                    disabled={isSubmitting}
                    className="text-[11px] text-slate-400 hover:text-slate-600 text-center transition-colors cursor-pointer py-0.5 underline underline-offset-2"
                  >
                    No por ahora, continuar con el Plan Gratis básico
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={11} className="text-[#059669]" /> Sin cobros hoy
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Lock size={10} /> Cancela cuando quieras
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
