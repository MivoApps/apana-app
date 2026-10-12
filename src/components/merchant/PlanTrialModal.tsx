'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  X,
  Check,
  CreditCard,
  Calendar,
  Lock,
  Mail,
  User,
  Gift,
  Bell,
  Crown,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';

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
  isProcessing: externalProcessing = false,
  initialPlan = 'emprendedor'
}) => {
  // Step progression: 1 = Plan & Features, 2 = Inline Card Validation, 3 = Success Celebration
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  useEffect(() => {
    scrollToTop();
  }, [step]);

  // Plan Selection State
  const [selectedPlanTier, setSelectedPlanTier] = useState<'emprendedor' | 'negocio'>(initialPlan);
  const [billingCycle, setBillingCycle] = useState<'mensual' | 'anual'>('mensual');

  // Inline Card Form Fields (APANA Design System)
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [email, setEmail] = useState(userEmail || '');

  // Refs & Smart UX State for Card Inputs
  const cardNumberInputRef = React.useRef<HTMLInputElement>(null);
  const expiryInputRef = React.useRef<HTMLInputElement>(null);
  const cvcInputRef = React.useRef<HTMLInputElement>(null);
  const [showCvc, setShowCvc] = useState(false);
  const [pasteNotice, setPasteNotice] = useState<string | null>(null);

  // Processing & Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activatedInfo, setActivatedInfo] = useState<{
    cardLastFour?: string;
    cardBrand?: string;
    trialEndDate?: number;
    planName?: string;
  }>({});

  // Reset form and sync email/name when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setErrorMessage('');
      setIsSubmitting(false);
      if (initialPlan) setSelectedPlanTier(initialPlan);
      if (userEmail && !email) setEmail(userEmail);
    }
  }, [isOpen, userEmail, initialPlan]);

  // Dynamic Dates Calculation (Reverse-trial logic with APANA WhatsApp reminders)
  const { todayStr, reminderDateStr, renewalDateStr, renewalTimestamp } = useMemo(() => {
    const now = new Date();
    // 23 days from today = 7 days before 30-day trial expires
    const reminderDate = new Date(now.getTime() + 23 * 24 * 60 * 60 * 1000);
    // 30 days from today
    const renewalDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const formatDate = (d: Date) => {
      return d.toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).replace('.', '');
    };

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
        chargeAmount: billingCycle === 'anual' ? 13990 : 1990,
        features: [
          'Hasta 150 productos activos (vs 25 en el plan gratis)',
          'Hasta 4 fotos en alta resolución por producto',
          'Precios de oferta tachados (% OFF en tu catálogo)',
          'Métricas en tiempo real: visitas y clics de WhatsApp',
          'Sin marca de agua "Creado por APANA" en tu tienda'
        ]
      };
    } else {
      return {
        name: 'Plan Negocio Pro',
        tier: 'negocio' as const,
        monthlyPrice: 'S/ 39.90',
        annualTotal: 'S/ 219.90',
        annualMonthlyEquiv: 'S/ 18.33',
        annualSavings: 'Ahorra S/ 258.90',
        displayRenewalPrice: billingCycle === 'anual' ? 'S/ 219.90 / año' : 'S/ 39.90 / mes',
        chargeAmount: billingCycle === 'anual' ? 21990 : 3990,
        features: [
          'PRODUCTOS ILIMITADOS en tu catálogo sin restricciones',
          'Todo lo del Plan Emprendedor incluido',
          'Hasta 8 fotos por producto para máxima conversión',
          'Exportación a Excel de catálogo de productos y pedidos',
          'Soporte prioritario personalizado directo por WhatsApp'
        ]
      };
    }
  }, [selectedPlanTier, billingCycle]);

  // Card brand detection (Visa, Mastercard, Amex)
  const detectedCardBrand = useMemo(() => {
    const cleanNumber = cardNumber.replace(/\s+/g, '');
    if (cleanNumber.startsWith('4')) return 'Visa';
    if (/^(5[1-5]|2[2-7])/.test(cleanNumber)) return 'Mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'Amex';
    return 'Tarjeta';
  }, [cardNumber]);

  // Parser inteligente para procesar portapapeles (número individual o lote completo: tarjeta + vencimiento + CVC)
  const parseAndApplyCardData = (rawText: string): boolean => {
    if (!rawText) return false;
    const text = rawText.trim();

    // 1. Detectar si contiene número de tarjeta de 15 o 16 dígitos
    const cardMatch = text.match(/(?:^|[^\d])(\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{3,4}|\d{15,16})(?:[^\d]|$)/);
    // Detectar vencimiento: MM/YY, MM/YYYY, MM-YY, MM-YYYY, MM.YY
    const expMatch = text.match(/(?:^|[^\d])(0[1-9]|1[0-2])[\s\/\-\.](20\d{2}|\d{2})(?:[^\d]|$)/);

    if (cardMatch) {
      const rawCard = cardMatch[1].replace(/\D/g, '');
      if (rawCard.length >= 15 && rawCard.length <= 16) {
        const formatted = rawCard.replace(/(\d{4})(?=\d)/g, '$1 ');
        setCardNumber(formatted);

        // Si también vino la fecha de expiración
        if (expMatch) {
          const month = expMatch[1];
          let year = expMatch[2];
          if (year.length === 4) year = year.slice(2);
          setCardExpiry(`${month}/${year}`);

          // Extraer CVC buscando 3 o 4 dígitos restantes
          const remainder = text
            .replace(cardMatch[0], ' ')
            .replace(expMatch[0], ' ');
          const cvcMatch = remainder.match(/\b\d{3,4}\b/);
          if (cvcMatch) {
            setCardCvc(cvcMatch[0]);
          }

          setPasteNotice('✨ Datos de tarjeta autocompletados desde el portapapeles');
          setTimeout(() => setPasteNotice(null), 4000);
          return true;
        } else {
          // Solo vino el número de tarjeta
          setPasteNotice('✨ Tarjeta pegada con éxito');
          setTimeout(() => setPasteNotice(null), 3000);
          setTimeout(() => expiryInputRef.current?.focus(), 60);
          return true;
        }
      }
    }

    // 2. Si es solo una secuencia de números continuos o separados
    const onlyDigits = text.replace(/\D/g, '');
    if (onlyDigits.length >= 15) {
      const cardDigits = onlyDigits.slice(0, 16);
      setCardNumber(cardDigits.replace(/(\d{4})(?=\d)/g, '$1 '));
      setPasteNotice('✨ Tarjeta pegada con éxito');
      setTimeout(() => setPasteNotice(null), 3000);
      setTimeout(() => expiryInputRef.current?.focus(), 60);
      return true;
    }

    return false;
  };

  const handleCardNumberPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    if (text) {
      const handled = parseAndApplyCardData(text);
      if (handled) {
        e.preventDefault();
      }
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = rawVal.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
    if (rawVal.length >= 16) {
      expiryInputRef.current?.focus();
    }
  };

  const handleExpiryPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text').trim();
    if (!text) return;

    // Detectar MM/YYYY o MM-YYYY
    const longMatch = text.match(/(0[1-9]|1[0-2])[\s\/\-\.](20\d{2})/);
    if (longMatch) {
      e.preventDefault();
      setCardExpiry(`${longMatch[1]}/${longMatch[2].slice(2)}`);
      setTimeout(() => cvcInputRef.current?.focus(), 60);
      return;
    }

    // Detectar MM/YY o MM-YY
    const shortMatch = text.match(/(0[1-9]|1[0-2])[\s\/\-\.]?(\d{2})/);
    if (shortMatch) {
      e.preventDefault();
      setCardExpiry(`${shortMatch[1]}/${shortMatch[2]}`);
      setTimeout(() => cvcInputRef.current?.focus(), 60);
      return;
    }

    const digits = text.replace(/\D/g, '');
    if (digits.length === 4) {
      e.preventDefault();
      setCardExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`);
      setTimeout(() => cvcInputRef.current?.focus(), 60);
    } else if (digits.length === 6) {
      e.preventDefault();
      setCardExpiry(`${digits.slice(0, 2)}/${digits.slice(4, 6)}`);
      setTimeout(() => cvcInputRef.current?.focus(), 60);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawVal = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (rawVal.length >= 2) {
      rawVal = `${rawVal.slice(0, 2)}/${rawVal.slice(2)}`;
    }
    setCardExpiry(rawVal);
    if (rawVal.length === 5) {
      cvcInputRef.current?.focus();
    }
  };

  const handleCvcPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    const digits = text.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      e.preventDefault();
      setCardCvc(digits);
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardCvc(rawVal);
  };

  // Navigation handlers
  const handleGoToStep2 = () => {
    setStep(2);
    setErrorMessage('');
    scrollToTop();
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setErrorMessage('');
      scrollToTop();
    } else {
      onContinueFree();
    }
  };

  // Submit trial activation
  const handleCompleteTrial = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    // Validations
    const cleanCard = cardNumber.replace(/\s+/g, '');
    if (cleanCard.length < 15) {
      setErrorMessage('Ingresa un número de tarjeta válido (15 o 16 dígitos).');
      return;
    }

    if (!cardExpiry.includes('/') || cardExpiry.length < 5) {
      setErrorMessage('Ingresa una fecha de vencimiento válida (MM/AA).');
      return;
    }

    const [monthStr, yearStr] = cardExpiry.split('/');
    const month = parseInt(monthStr, 10);
    if (isNaN(month) || month < 1 || month > 12) {
      setErrorMessage('El mes de expiración debe estar entre 01 y 12.');
      return;
    }

    if (cardCvc.length < 3) {
      setErrorMessage('Ingresa el código de seguridad (CVC) de tu tarjeta.');
      return;
    }

    if (!email || !email.includes('@')) {
      setErrorMessage('Ingresa un correo electrónico válido para tu comprobante.');
      return;
    }

    setIsSubmitting(true);

    try {
      const culqiPublicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY || '';
      const isRealCulqiKey = culqiPublicKey && !culqiPublicKey.includes('xxxxxxxx') && !culqiPublicKey.includes('demo');

      let tokenId = `tkn_test_sandbox_${Date.now()}`;

      // 1. Culqi Tokenization (Official CORS-enabled API)
      if (isRealCulqiKey) {
        const fullYear = yearStr.length === 2 ? `20${yearStr}` : yearStr;

        const tokenRes = await fetch('https://api.culqi.com/v2/tokens', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${culqiPublicKey}`,
          },
          body: JSON.stringify({
            card_number: cleanCard,
            cvv: cardCvc.trim(),
            expiration_month: monthStr.trim(),
            expiration_year: fullYear.trim(),
            email: email.trim(),
          }),
        });

        const tokenData = await tokenRes.json();

        if (!tokenRes.ok || !tokenData.id) {
          let userMsg = tokenData.user_message || tokenData.merchant_message || 'No pudimos validar tu tarjeta. Revisa los datos ingresados.';
          if (tokenData.merchant_message?.includes('Bin') || userMsg === 'Contactáte con soporte') {
            userMsg = 'Número de tarjeta no reconocido por Culqi. En modo prueba usa las tarjetas de test oficiales de Culqi (ej. Visa: 4111 1100 0000 0021, CVV: 123).';
          }
          throw new Error(userMsg);
        }

        tokenId = tokenData.id;
      }

      // 2. Register Trial in APANA Backend
      const targetStoreId = storeId || (typeof window !== 'undefined' ? localStorage.getItem('apana_active_store_id') || '' : '');

      const res = await fetch('/api/culqi/register-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenId,
          storeId: targetStoreId,
          plan: selectedPlanTier,
          billingCycle,
          email: email.trim(),
          customerName: cardHolder.trim() || storeName,
          phone: userPhone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo activar la prueba gratuita.');
      }

      // Limpiar caché de sesión
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }

      if (onSelectTrial) {
        onSelectTrial(selectedPlanTier);
      }

      setActivatedInfo({
        cardLastFour: data.cardLastFour || cleanCard.slice(-4),
        cardBrand: data.cardBrand || detectedCardBrand,
        trialEndDate: data.trialEndDate || renewalTimestamp,
        planName: pricing.name,
      });

      // Switch to Step 3 (Celebratory state)
      setStep(3);
    } catch (err: any) {
      console.error('Error procesando prueba en APANA:', err);
      setErrorMessage(err.message || 'Ocurrió un error al validar la tarjeta. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
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
          <div className="flex items-center gap-2">
            {step === 2 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#059669] hover:text-[#00855d] transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-emerald-50"
              >
                <ChevronLeft size={16} />
                <span>Volver a elegir plan</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-500/20 text-[#059669] text-xs font-extrabold">
                <Sparkles size={13} className="text-amber-500" />
                <span>Beneficio de Bienvenida APANA</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {step < 3 && (
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                Paso {step} de 2
              </span>
            )}
            <button
              type="button"
              onClick={step === 3 ? handleFinishStep3 : onContinueFree}
              disabled={isSubmitting}
              aria-label="Cerrar modal"
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
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
                  <span className="font-extrabold text-[#059669] bg-emerald-100/70 px-2 py-0.5 rounded-full">S/ 0.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Fecha de renovación:</span>
                  <span className="font-bold text-[#0b1c30]">{renewalDateStr}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Método guardado:</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <CreditCard size={14} className="text-[#059669]" />
                    {activatedInfo.cardBrand || 'Tarjeta'} •••• {activatedInfo.cardLastFour || '4242'}
                  </span>
                </div>
                <div className="flex items-start gap-2 pt-2 border-t border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                  <Bell size={13} className="text-amber-500 shrink-0 mt-0.5" />
                  <span>Te avisaremos por WhatsApp el {reminderDateStr} (7 días antes). Puedes cancelar cuando quieras en 1 clic.</span>
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

              {/* LEFT COLUMN: Plan Selection (Step 1) OR Card Form (Step 2) */}
              <div className="md:col-span-7 flex flex-col gap-5">

                {/* STEP 1: SELECCIONAR PLAN */}
                {step === 1 && (
                  <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-[#0b1c30] tracking-tight">
                        30 Días Gratis para hacer crecer tu tienda
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Disfruta de todas las herramientas avanzadas sin costo hoy. Cancela con un solo clic cuando quieras.
                      </p>
                    </div>

                    {/* Selector de Plan: Emprendedor vs Negocio Pro (Stitch Design System) */}
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
                          <Zap size={14} className={selectedPlanTier === 'emprendedor' ? 'text-[#059669]' : 'text-slate-400'} />
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
                          <Crown size={14} className={selectedPlanTier === 'negocio' ? 'text-amber-500' : 'text-slate-400'} />
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
                        {/* Opción Mensual */}
                        <div
                          onClick={() => setBillingCycle('mensual')}
                          className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                            billingCycle === 'mensual'
                              ? 'border-[#059669] bg-emerald-50/20 shadow-2xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            billingCycle === 'mensual' ? 'border-[#059669]' : 'border-slate-300'
                          }`}>
                            {billingCycle === 'mensual' && <div className="w-2.5 h-2.5 rounded-full bg-[#059669]" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-[#0b1c30]">Mensual</span>
                            <span className="text-[11px] text-slate-500">{pricing.monthlyPrice}</span>
                          </div>
                        </div>

                        {/* Opción Anual con Descuento */}
                        <div
                          onClick={() => setBillingCycle('anual')}
                          className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 relative ${
                            billingCycle === 'anual'
                              ? 'border-[#059669] bg-emerald-50/20 shadow-2xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            billingCycle === 'anual' ? 'border-[#059669]' : 'border-slate-300'
                          }`}>
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
                    <div className={`p-4 rounded-2xl border transition-all ${
                      selectedPlanTier === 'emprendedor'
                        ? 'bg-linear-to-b from-emerald-50/30 via-white to-white border-emerald-200/70'
                        : 'bg-linear-to-b from-amber-50/30 via-white to-white border-amber-200/70'
                    }`}>
                      <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block mb-2.5">
                        Beneficios que tendrás activos hoy:
                      </span>
                      <ul className="flex flex-col gap-2 text-xs text-[#0b1c30]">
                        {pricing.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              selectedPlanTier === 'emprendedor' ? 'bg-emerald-100 text-[#059669]' : 'bg-amber-100 text-amber-700'
                            }`}>
                              <Check size={11} className="stroke-[3]" />
                            </div>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* STEP 2: METODO DE PAGO CON DISEÑO APANA */}
                {step === 2 && (
                  <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-[#0b1c30] tracking-tight">
                        Vincula tu tarjeta para la prueba gratis
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Hoy pagarás <strong className="text-[#059669] font-bold">S/ 0.00</strong>. Tu tarjeta solo se validará de forma segura y no recibirás cobros sorpresa.
                      </p>
                    </div>

                    {/* Banner de ayuda para modo de prueba Culqi */}
                    {process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY?.startsWith('pk_test_') && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-[#059669]">🧪 Tarjeta Test Culqi:</span>
                          <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-200">4111 1100 0000 0021</code>
                          <span className="text-[11px] text-emerald-700">• Venc: 12/30 • CVC: 123</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (!cardHolder) setCardHolder('Angelo Acosta');
                            setCardNumber('4111 1100 0000 0021');
                            setCardExpiry('12/30');
                            setCardCvc('123');
                          }}
                          className="self-start sm:self-auto px-2.5 py-1 bg-white hover:bg-emerald-100 text-[#059669] font-bold rounded-lg border border-emerald-300 text-[11px] cursor-pointer transition-colors shadow-2xs"
                        >
                          Autocompletar
                        </button>
                      </div>
                    )}

                    {errorMessage && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                        <AlertCircle size={16} className="shrink-0 text-red-500" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* Formulario de Tarjeta APANA */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col gap-3.5 shadow-xs">
                      
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-[#0b1c30] flex items-center gap-1.5">
                          <CreditCard size={15} className="text-[#059669]" />
                          Tarjeta de crédito o débito
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                if (typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
                                  const clipText = await navigator.clipboard.readText();
                                  const handled = parseAndApplyCardData(clipText);
                                  if (!handled) {
                                    setErrorMessage('No se detectaron datos válidos en el portapapeles. Puedes pegarlos directamente en el campo.');
                                  } else {
                                    setErrorMessage('');
                                  }
                                } else {
                                  cardNumberInputRef.current?.focus();
                                }
                              } catch {
                                setErrorMessage('Para pegar, haz clic derecho o usa Ctrl+V / Cmd+V en el campo de tarjeta.');
                              }
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#059669] text-[11px] font-bold transition-colors cursor-pointer border border-emerald-200/60"
                            title="Pegar datos de tarjeta desde portapapeles"
                          >
                            <Copy size={12} />
                            <span>Pegar datos</span>
                          </button>
                          <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-slate-400">
                            <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">Visa</span>
                            <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">Mastercard</span>
                            <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">Amex</span>
                          </div>
                        </div>
                      </div>

                      {pasteNotice && (
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
                          <Sparkles size={14} className="text-emerald-600 shrink-0" />
                          <span className="font-semibold text-[11px]">{pasteNotice}</span>
                        </div>
                      )}

                      {/* 1. Nombre del Titular */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-slate-700">
                          Nombre y apellido en la tarjeta
                        </label>
                        <div className="relative flex items-center">
                          <User size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                          <input
                            type="text"
                            name="ccname"
                            autoComplete="cc-name"
                            autoCorrect="off"
                            spellCheck={false}
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            placeholder="Como figura en tu tarjeta"
                            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-[#0b1c30] placeholder:text-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all"
                          />
                        </div>
                      </div>

                      {/* 2. Número de Tarjeta */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-700">
                            Número de la tarjeta
                          </label>
                          <span className="text-[10px] text-slate-400">Permite copiar y pegar</span>
                        </div>
                        <div className="relative flex items-center">
                          <CreditCard size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                          <input
                            ref={cardNumberInputRef}
                            type="text"
                            name="cardnumber"
                            autoComplete="cc-number"
                            autoCorrect="off"
                            spellCheck={false}
                            inputMode="numeric"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            onPaste={handleCardNumberPaste}
                            placeholder="•••• •••• •••• ••••"
                            className="w-full h-10 pl-9 pr-14 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-mono text-[#0b1c30] placeholder:text-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all"
                          />
                          <span className="absolute right-2.5 text-[10px] font-black text-slate-600 uppercase px-1.5 py-0.5 rounded bg-slate-100">
                            {detectedCardBrand}
                          </span>
                        </div>
                      </div>

                      {/* 3. Vencimiento y CVC */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-bold text-slate-700">
                            Vencimiento (MM/AA)
                          </label>
                          <div className="relative flex items-center">
                            <Calendar size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                            <input
                              ref={expiryInputRef}
                              type="text"
                              name="ccexp"
                              autoComplete="cc-exp"
                              autoCorrect="off"
                              spellCheck={false}
                              inputMode="numeric"
                              value={cardExpiry}
                              onChange={handleExpiryChange}
                              onPaste={handleExpiryPaste}
                              placeholder="MM/AA"
                              className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-mono text-[#0b1c30] placeholder:text-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-bold text-slate-700">
                            Código CVC
                          </label>
                          <div className="relative flex items-center">
                            <Lock size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                            <input
                              ref={cvcInputRef}
                              type={showCvc ? 'text' : 'password'}
                              name="cvc"
                              autoComplete="cc-csc"
                              autoCorrect="off"
                              spellCheck={false}
                              inputMode="numeric"
                              value={cardCvc}
                              onChange={handleCvcChange}
                              onPaste={handleCvcPaste}
                              placeholder="123"
                              className="w-full h-10 pl-9 pr-8 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-mono text-[#0b1c30] placeholder:text-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCvc(!showCvc)}
                              tabIndex={-1}
                              aria-label={showCvc ? 'Ocultar código CVC' : 'Mostrar código CVC'}
                              className="absolute right-2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                            >
                              {showCvc ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 4. Correo electrónico */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-slate-700">
                          Correo electrónico para notificaciones
                        </label>
                        <div className="relative flex items-center">
                          <Mail size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                          <input
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@correo.com"
                            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-[#0b1c30] placeholder:text-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all"
                          />
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400 leading-relaxed pt-1 flex items-start gap-1.5">
                        <ShieldCheck size={14} className="text-[#059669] shrink-0 mt-0.5" />
                        <span>Validación segura procesada con Culqi. No se cobrará nada hoy (S/ 0.00). Podrás cancelar tu suscripción con 1 clic en cualquier momento.</span>
                      </div>

                    </div>
                  </div>
                )}

              </div>

              {/* RIGHT COLUMN: APANA Timeline Roadmap & Order Summary */}
              <div className="md:col-span-5 flex flex-col gap-3.5 sm:sticky sm:top-2">

                {/* CARD 1: APANA REVERSE-TRIAL ROADMAP */}
                <div className="bg-[#f8f9ff] rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col gap-3.5">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    ¿Cómo funciona tu prueba gratis?
                  </span>

                  {/* 1. Hoy */}
                  <div className="flex items-start gap-3 relative">
                    <div className="absolute left-3.5 top-7 bottom-0 w-0.5 bg-emerald-500/40" />
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center shrink-0 z-10">
                      <Gift size={14} />
                    </div>
                    <div className="flex flex-col gap-0.5 pt-0.5">
                      <span className="font-extrabold text-xs text-[#0b1c30]">
                        {todayStr}
                      </span>
                      <span className="text-[11px] text-slate-500 leading-snug">
                        Accede de inmediato a todos los beneficios de {pricing.name}.
                      </span>
                    </div>
                  </div>

                  {/* 2. Día 23 (Recordatorio WhatsApp) */}
                  <div className="flex items-start gap-3 relative pt-1.5">
                    <div className="absolute left-3.5 top-7 bottom-0 w-0.5 bg-slate-200" />
                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 z-10">
                      <Bell size={14} />
                    </div>
                    <div className="flex flex-col gap-0.5 pt-0.5">
                      <span className="font-extrabold text-xs text-[#0b1c30]">
                        {reminderDateStr}
                      </span>
                      <span className="text-[11px] text-slate-500 leading-snug">
                        Te avisaremos por WhatsApp 7 días antes de culminar tu prueba.
                      </span>
                    </div>
                  </div>

                  {/* 3. Día 30 (Renovación o Cancelación) */}
                  <div className="flex items-start gap-3 relative pt-1.5">
                    <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 z-10">
                      <Crown size={14} />
                    </div>
                    <div className="flex flex-col gap-0.5 pt-0.5">
                      <span className="font-extrabold text-xs text-[#0b1c30]">
                        {renewalDateStr}
                      </span>
                      <span className="text-[11px] text-slate-500 leading-snug">
                        Se renovará automáticamente solo si decides continuar. Puedes cancelar antes en 1 clic.
                      </span>
                    </div>
                  </div>
                </div>

                {/* CARD 2: SUMMARY & PRIMARY CTA */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col gap-3 shadow-xs">
                  
                  {/* A pagar hoy */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm text-[#0b1c30]">A pagar hoy</span>
                      <span className="bg-emerald-100 text-[#059669] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        30 días gratis
                      </span>
                    </div>
                    <span className="text-xl font-black text-[#059669]">
                      S/ 0.00
                    </span>
                  </div>

                  {/* Próximo cobro */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Próximo cobro ({renewalDateStr}):
                    </span>
                    <span className="font-bold text-[#0b1c30]">
                      {pricing.displayRenewalPrice}
                    </span>
                  </div>

                  {/* Botón Principal APANA */}
                  {step === 1 ? (
                    <button
                      type="button"
                      onClick={handleGoToStep2}
                      className="w-full h-11 sm:h-12 rounded-xl bg-[#059669] hover:bg-[#00855d] text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                    >
                      <span>Continuar con 30 días gratis</span>
                      <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleCompleteTrial()}
                      className="w-full h-11 sm:h-12 rounded-xl bg-[#059669] hover:bg-[#00855d] disabled:bg-emerald-300 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Validando tarjeta y activando...</span>
                        </span>
                      ) : (
                        <>
                          <Lock size={15} />
                          <span>Comenzar prueba gratis (S/ 0.00)</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Cancel Option Link */}
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
