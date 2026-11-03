'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle2, 
  Printer, 
  Clock, 
  ShieldCheck, 
  Building2, 
  Store as StoreIcon,
  Phone,
  Mail,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getStoreBySlugFromFS, createReclamacionInFS } from '@/lib/firebase/firestore';
import { Store } from '@/types/store';
import StoreNotFoundPage from '@/app/(public)/store-not-found/page';
import { IndecopiClaimSheet, IndecopiClaimData } from '@/components/ui/IndecopiClaimSheet';

interface Props {
  params: Promise<{
    storeSlug: string;
  }>;
}

export default function StoreLibroReclamacionesPage({ params }: Props) {
  const [store, setStore] = useState<Store | null>(null);
  const [isLoadingStore, setIsLoadingStore] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [claimCode, setClaimCode] = useState('');
  const [submissionDate, setSubmissionDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOfficialSheet, setShowOfficialSheet] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Consumidor
    fullName: '',
    docType: 'DNI',
    docNumber: '',
    phone: '',
    email: '',
    address: '',
    city: 'Lima',
    isMinor: false,
    parentName: '',

    // Bien Contratado
    contractType: 'producto', // producto o servicio
    amount: '',
    goodDescription: '',

    // Detalle
    claimType: 'reclamo', // reclamo o queja
    detail: '',
    consumerRequest: '',
    acceptedTerms: false,
  });

  useEffect(() => {
    let isMounted = true;
    params.then(async (resolved) => {
      try {
        const storeData = await getStoreBySlugFromFS(resolved.storeSlug);
        if (isMounted) {
          setStore(storeData);
        }
      } catch (e) {
        console.error('Error cargando tienda para Libro de Reclamaciones:', e);
      } finally {
        if (isMounted) setIsLoadingStore(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [params]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    // Filtros de formato en tiempo real
    if (name === 'docNumber') {
      // Si es DNI o RUC, solo permitir números
      if (formData.docType === 'DNI' || formData.docType === 'RUC') {
        const numeric = value.replace(/\D/g, '');
        const maxLen = formData.docType === 'DNI' ? 8 : 11;
        setFormData((prev) => ({ ...prev, docNumber: numeric.slice(0, maxLen) }));
        return;
      }
      // CE / Pasaporte: alfanumérico max 12
      const alnum = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      setFormData((prev) => ({ ...prev, docNumber: alnum.slice(0, 12) }));
      return;
    }

    if (name === 'phone') {
      // Teléfono Perú: exactamente solo números, máximo 9 dígitos
      const numeric = value.replace(/\D/g, '').slice(0, 9);
      setFormData((prev) => ({ ...prev, phone: numeric }));
      return;
    }

    if (name === 'docType') {
      // Si cambia de tipo de documento, ajustar longitud
      const newType = value;
      let adjustedNum = formData.docNumber;
      if (newType === 'DNI') adjustedNum = adjustedNum.replace(/\D/g, '').slice(0, 8);
      else if (newType === 'RUC') adjustedNum = adjustedNum.replace(/\D/g, '').slice(0, 11);
      else adjustedNum = adjustedNum.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);

      setFormData((prev) => ({ ...prev, docType: newType, docNumber: adjustedNum }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones formales
    if (!formData.acceptedTerms) {
      alert('Debes declarar la veracidad de la información y aceptar las condiciones para enviar la reclamación.');
      return;
    }

    // Validación DNI
    if (formData.docType === 'DNI' && formData.docNumber.length !== 8) {
      alert('El DNI debe contener exactamente 8 dígitos numéricos.');
      return;
    }

    // Validación RUC
    if (formData.docType === 'RUC' && formData.docNumber.length !== 11) {
      alert('El RUC debe contener exactamente 11 dígitos numéricos.');
      return;
    }

    // Validación Teléfono Perú (9 dígitos comenzando con 9)
    if (formData.phone.length !== 9 || !formData.phone.startsWith('9')) {
      alert('El número de teléfono/WhatsApp debe tener exactamente 9 dígitos y comenzar con 9.');
      return;
    }

    // Validación sintaxis Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      alert('Por favor ingresa un correo electrónico válido (ej. usuario@gmail.com).');
      return;
    }

    if (!store) return;

    setLoading(true);
    try {
      // Generar código con acrónimo de la tienda o slug
      const storePrefix = (store.slug || 'TIENDA').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const generatedCode = `LR-${storePrefix}-${year}${month}-${randomNum}`;

      const fullPhone = `+51 ${formData.phone}`;

      await createReclamacionInFS({
        claimCode: generatedCode,
        storeId: store.id,
        storeOwnerId: store.ownerId,
        storeSlug: store.slug,
        storeName: store.name,
        fullName: formData.fullName,
        docType: formData.docType,
        docNumber: formData.docNumber,
        phone: fullPhone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        isMinor: formData.isMinor,
        parentName: formData.parentName,
        contractType: formData.contractType,
        amount: formData.amount,
        goodDescription: formData.goodDescription,
        claimType: formData.claimType as 'reclamo' | 'queja',
        detail: formData.detail,
        consumerRequest: formData.consumerRequest,
      });

      setClaimCode(generatedCode);
      const formattedSubmissionDate = new Date().toLocaleString('es-PE', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      setSubmissionDate(formattedSubmissionDate);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Despachar correos automáticos legales (Consumidor y Comerciante)
      try {
        const claimPayload: IndecopiClaimData = {
          claimCode: generatedCode,
          createdAt: Date.now(),
          storeName: store.name,
          storeLegalName: store.legalBusinessName || store.name,
          storeTaxIdType: store.legalTaxIdType || 'RUC',
          storeTaxId: store.legalTaxId || '',
          storeAddress: store.legalAddress || store.city || 'Perú',
          storePhone: store.whatsappPhone || '',
          fullName: formData.fullName,
          docType: formData.docType,
          docNumber: formData.docNumber,
          phone: fullPhone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          isMinor: formData.isMinor,
          parentName: formData.parentName,
          contractType: formData.contractType,
          amount: formData.amount,
          goodDescription: formData.goodDescription,
          claimType: formData.claimType as 'reclamo' | 'queja',
          detail: formData.detail,
          consumerRequest: formData.consumerRequest,
          status: 'pendiente',
        };

        fetch('/api/legal/claims/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            claim: claimPayload,
            merchantEmail: store.ownerEmail,
            storeSlug: store.slug,
          }),
        }).catch((e) => console.warn('Aviso enviando correo de reclamación:', e));
      } catch (notifyErr) {
        console.warn('Aviso notificando reclamo por correo:', notifyErr);
      }
    } catch (err) {
      console.error('Error enviando reclamación:', err);
      alert('Ocurrió un error al registrar la reclamación. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingStore) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center text-[#0b1c30] gap-3">
        <div className="w-10 h-10 border-4 border-[#059669] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium text-[#6d7a72]">Cargando Libro de Reclamaciones...</span>
      </div>
    );
  }

  if (!store) {
    return <StoreNotFoundPage />;
  }

  // Validación de requisitos legales mínimos del establecimiento (Ley N° 29571 / INDECOPI)
  const isStoreLegalReady = Boolean(
    store.legalTaxId &&
    store.legalTaxId.trim().length > 0 &&
    store.legalBusinessName &&
    store.legalBusinessName.trim().length > 0 &&
    store.legalAddress &&
    store.legalAddress.trim().length > 0
  );

  if (!isStoreLegalReady) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans">
        <header className="bg-white/90 backdrop-blur-md border-b border-[#bccac0]/30 py-3.5 px-4">
          <div className="max-w-5xl lg:max-w-6xl mx-auto flex items-center justify-between">
            <Link 
              href={`/s/${store.slug}`} 
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#059669] hover:text-[#00855d] transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Volver a {store.name}</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 max-w-xl mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col items-center gap-4 w-full">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center shadow-inner">
              <BookOpen size={30} />
            </div>

            <div className="space-y-1.5">
              <span className="inline-block text-[10px] font-black tracking-wider uppercase text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                Configuración en Proceso
              </span>
              <h1 className="text-xl font-bold text-[#0b1c30]">
                Libro de Reclamaciones
              </h1>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed pt-1">
                El establecimiento <strong>{store.name}</strong> se encuentra completando el registro oficial de sus datos fiscales ante INDECOPI (Ley N° 29571).
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                El registro de hojas de reclamación estará disponible automáticamente una vez que la tienda active sus datos oficiales.
              </p>
            </div>

            <div className="flex flex-col w-full gap-2.5 pt-3">
              {store.whatsappPhone && (
                <a
                  href={`https://wa.me/${store.whatsappPhone}?text=${encodeURIComponent(`Hola ${store.name}, tengo una consulta sobre mi compra.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-11 bg-emerald-50 hover:bg-emerald-100 text-[#006c49] font-bold text-xs rounded-xl border border-emerald-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone size={15} />
                  <span>Contactar a la tienda por WhatsApp</span>
                </a>
              )}

              <Link href={`/s/${store.slug}`} className="w-full">
                <Button
                  variant="primary"
                  fullWidth
                  className="h-11 text-xs font-bold bg-[#059669] hover:bg-[#00855d] text-white rounded-xl shadow-xs"
                >
                  Volver a la Tienda
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Datos de identificación del proveedor con fallback inteligente
  const providerBusinessName = store.legalBusinessName || store.name;
  const providerTaxDoc = store.legalTaxId 
    ? `${store.legalTaxIdType || 'RUC'}: ${store.legalTaxId}` 
    : 'Comercio Registrado en APANA';
  const providerAddress = store.legalAddress || store.city || 'Perú';
  const providerPhone = store.whatsappPhone ? `+${store.whatsappPhone}` : 'Contacto vía Tienda Online';

  const currentClaimData: IndecopiClaimData = {
    claimCode,
    createdAt: Date.now(),
    storeName: store.name,
    storeLegalName: store.legalBusinessName || store.name,
    storeTaxIdType: store.legalTaxIdType || 'RUC',
    storeTaxId: store.legalTaxId || '',
    storeAddress: store.legalAddress || store.city || 'Perú',
    storePhone: store.whatsappPhone || '',
    fullName: formData.fullName,
    docType: formData.docType,
    docNumber: formData.docNumber,
    phone: `+51 ${formData.phone}`,
    email: formData.email,
    address: formData.address,
    city: formData.city,
    isMinor: formData.isMinor,
    parentName: formData.parentName,
    contractType: formData.contractType,
    amount: formData.amount,
    goodDescription: formData.goodDescription,
    claimType: formData.claimType as 'reclamo' | 'queja',
    detail: formData.detail,
    consumerRequest: formData.consumerRequest,
    status: 'pendiente',
  };

  // Validación integral en tiempo real para habilitar el botón de envío
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isDocValid =
    formData.docType === 'DNI'
      ? formData.docNumber.length === 8
      : formData.docType === 'RUC'
      ? formData.docNumber.length === 11
      : formData.docNumber.trim().length >= 4;

  const isPhoneValid = formData.phone.length === 9 && formData.phone.startsWith('9');
  const isEmailValid = emailRegex.test(formData.email.trim());
  const isParentValid = !formData.isMinor || Boolean(formData.parentName && formData.parentName.trim().length >= 3);

  const isFormValid = Boolean(
    formData.fullName.trim().length >= 3 &&
    isDocValid &&
    isPhoneValid &&
    isEmailValid &&
    formData.goodDescription.trim().length >= 3 &&
    formData.detail.trim().length >= 5 &&
    formData.consumerRequest.trim().length >= 3 &&
    formData.acceptedTerms &&
    isParentValid
  );

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans">
      {/* Header con enlace a la tienda (Oculto en impresión) */}
      <header className="no-print sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#bccac0]/30 py-3.5 px-4 sm:px-6 md:px-8">
        <div className="max-w-5xl lg:max-w-6xl mx-auto flex items-center justify-between">
          <Link 
            href={`/s/${store.slug}`} 
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#059669] hover:text-[#00855d] transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Volver a {store.name}</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500 hidden sm:inline">Tienda Verificada</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl lg:max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 lg:py-10 w-full">
        {submitted ? (
          showOfficialSheet ? (
            /* Vista Hoja Oficial INDECOPI Formato A4 */
            <div className="w-full">
              <IndecopiClaimSheet 
                claim={currentClaimData} 
                onClose={() => setShowOfficialSheet(false)} 
                showBackToStore 
                storeSlug={store.slug} 
              />
            </div>
          ) : (
            <>
              {/* Hoja de Reclamación Generada Exitosamente (Resumen en Pantalla) */}
              <div className="no-print bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#bccac0]/40 shadow-sm space-y-7 animate-in fade-in duration-300">
                {/* Header Constancia */}
                <div className="border-b border-slate-100 pb-5 text-center space-y-2.5">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 size={30} />
                  </div>
                  <span className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 text-[#006c49] text-[11px] font-extrabold rounded-full uppercase tracking-wider">
                    Reclamación Registrada Exitosamente
                  </span>
                  <h1 className="text-xl sm:text-2xl font-bold text-[#0b1c30]">
                    Hoja de Reclamación Virtual
                  </h1>
                  <p className="text-xs sm:text-sm font-mono font-bold text-emerald-800 bg-emerald-50 py-1.5 px-3 rounded-xl inline-block border border-emerald-200">
                    N° {claimCode}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Fecha y hora de registro: <strong>{submissionDate}</strong>
                  </p>

                  <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-3 flex items-center justify-center gap-2 text-xs text-emerald-950 max-w-md mx-auto shadow-2xs">
                    <Mail size={16} className="text-[#059669] shrink-0" />
                    <span>
                      Copia fiel enviada a: <strong>{formData.email}</strong> (D.S. 011-2011-PCM)
                    </span>
                  </div>
                </div>

                {/* Provider and Consumer Summary (2 columnas en desktop) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1.5">
                    <div className="font-bold text-[#0b1c30] flex items-center gap-1.5 border-b border-slate-200 pb-1.5 text-xs">
                      <Building2 size={14} className="text-[#059669]" />
                      <span>Datos del Proveedor (Establecimiento Virtual)</span>
                    </div>
                    <p><strong>Establecimiento:</strong> {store.name}</p>
                    <p><strong>Titular / Razón Social:</strong> {providerBusinessName}</p>
                    <p><strong>Identificación Fiscal:</strong> {providerTaxDoc}</p>
                    <p><strong>Ubicación / Dirección:</strong> {providerAddress}</p>
                    <p><strong>Contacto Oficial:</strong> {providerPhone}</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1.5">
                    <div className="font-bold text-[#0b1c30] flex items-center gap-1.5 border-b border-slate-200 pb-1.5 text-xs">
                      <ShieldCheck size={14} className="text-[#059669]" />
                      <span>Datos del Consumidor Reclamante</span>
                    </div>
                    <p><strong>Nombre:</strong> {formData.fullName}</p>
                    <p><strong>{formData.docType}:</strong> {formData.docNumber}</p>
                    <p><strong>Correo:</strong> {formData.email}</p>
                    <p><strong>Teléfono:</strong> {formData.phone}</p>
                    {formData.address && <p><strong>Dirección:</strong> {formData.address}, {formData.city}</p>}
                    {formData.isMinor && <p><strong>Padre o Apoderado:</strong> {formData.parentName}</p>}
                  </div>
                </div>

                {/* Claim Content Summary */}
                <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-3.5 text-xs sm:text-sm">
                  <div>
                    <span className="text-slate-500 font-medium block text-[11px]">Tipo de Reclamación:</span>
                    <span className="font-bold text-emerald-800 uppercase text-xs">
                      {formData.claimType === 'reclamo' 
                        ? 'RECLAMO (Disconformidad con los productos adquiridos)' 
                        : 'QUEJA (Malestar o descontento con la atención brindada)'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 font-medium block text-[11px]">Bien o Servicio Contratado:</span>
                    <p className="font-semibold text-slate-800">{formData.goodDescription}</p>
                    {formData.amount && <p className="text-[11px] text-slate-600 mt-0.5">Monto reclamado: S/ {formData.amount}</p>}
                  </div>

                  <div>
                    <span className="text-slate-500 font-medium block text-[11px]">Detalle de los hechos:</span>
                    <p className="text-slate-700 bg-white p-3 rounded-xl border border-slate-200 mt-1 whitespace-pre-wrap leading-relaxed">
                      {formData.detail}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-500 font-medium block text-[11px]">Pedido concreto del consumidor:</span>
                    <p className="text-slate-700 bg-white p-3 rounded-xl border border-slate-200 mt-1 whitespace-pre-wrap leading-relaxed">
                      {formData.consumerRequest}
                    </p>
                  </div>
                </div>

                {/* Botón para abrir vista formato legal oficial */}
                <button
                  type="button"
                  onClick={() => setShowOfficialSheet(true)}
                  className="w-full h-11 bg-emerald-50 hover:bg-emerald-100 text-[#006c49] font-bold text-xs rounded-xl border border-emerald-200/80 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-98"
                >
                  <FileText size={15} />
                  <span>Ver Hoja Oficial INDECOPI (Formato Legal A4)</span>
                </button>

                {/* Legal Notice */}
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
                  <Clock size={18} className="text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-xs">Plazo de atención legal conforme a Ley N° 29571 (INDECOPI):</p>
                    <p className="mt-0.5 text-[11px] text-amber-800">
                      El establecimiento <strong>{store.name}</strong> deberá dar respuesta formal a la presente reclamación en un plazo máximo de <strong>quince (15) días hábiles improrrogables</strong> mediante comunicación dirigida a su correo electrónico <strong>{formData.email}</strong> o a través de su número de contacto.
                    </p>
                  </div>
                </div>

                {/* Cláusula de Deslinde Tecnológico de APANA */}
                <div className="p-2.5 bg-slate-100/70 border border-slate-200 rounded-xl text-[10px] text-slate-500 text-center leading-relaxed">
                  Plataforma tecnológica provista por <strong>APANA (beapana.com)</strong>. La atención, resolución y responsabilidad legal sobre los productos o servicios ofrecidos corresponde con exclusividad al establecimiento <strong>{store.name}</strong>.
                </div>

                {/* Print & Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex-1 h-11 bg-white hover:bg-slate-50 border border-slate-300 text-[#0b1c30] font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Printer size={15} />
                    <span>Imprimir / Guardar en PDF</span>
                  </button>

                  <Link href={`/s/${store.slug}`} className="flex-1">
                    <Button
                      variant="primary"
                      fullWidth
                      className="h-11 text-xs font-bold bg-[#059669] hover:bg-[#00855d] text-white rounded-xl shadow-xs"
                    >
                      Volver a la Tienda
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Hoja oficial oculta en pantalla, visible al imprimir directamente */}
              <div className="hidden print:block w-full">
                <IndecopiClaimSheet claim={currentClaimData} />
              </div>
            </>
          )
        ) : (
          /* Formulario Oficial de Reclamación */
          <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#bccac0]/40 shadow-sm space-y-7">
            {/* Header del Establecimiento */}
            <div className="border-b border-gray-100 pb-5 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-[#006c49] text-[11px] font-bold rounded-full border border-emerald-200/60">
                  <BookOpen size={13} />
                  <span>Conforme a la Ley N° 29571 • INDECOPI</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Hoja de Reclamación Virtual</span>
              </div>

              <div className="flex items-center gap-3 pt-1">
                {store.logoUrl ? (
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60 font-black text-lg">
                    {store.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-[#0b1c30]">
                    Libro de Reclamaciones
                  </h1>
                  <p className="text-xs text-slate-600">
                    Establecimiento: <strong>{store.name}</strong> • {providerTaxDoc}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Sección 1: Identificación del Consumidor */}
              <section className="space-y-3.5">
                <h2 className="text-sm font-bold text-[#0b1c30] flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-5 h-5 rounded-full bg-[#059669] text-white text-[11px] flex items-center justify-center font-bold">1</span>
                  <span>Identificación del Consumidor Reclamante</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                      Nombres y Apellidos completos *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      maxLength={120}
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="ej. María Carmen López Silva"
                      className="w-full h-11 px-3.5 rounded-xl border border-[#bccac0] text-sm text-[#0b1c30] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                      Tipo de Documento *
                    </label>
                    <select
                      name="docType"
                      value={formData.docType}
                      onChange={handleChange}
                      className="w-full h-11 px-3.5 rounded-xl border border-[#bccac0] text-sm text-[#0b1c30] bg-white focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] transition-all"
                    >
                      <option value="DNI">DNI (8 dígitos)</option>
                      <option value="RUC">RUC (11 dígitos)</option>
                      <option value="CE">Carné de Extranjería (máx. 12)</option>
                      <option value="Pasaporte">Pasaporte (máx. 12)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                      Número de Documento *
                    </label>
                    <input
                      type="text"
                      name="docNumber"
                      required
                      inputMode={formData.docType === 'DNI' || formData.docType === 'RUC' ? 'numeric' : 'text'}
                      maxLength={formData.docType === 'DNI' ? 8 : formData.docType === 'RUC' ? 11 : 12}
                      value={formData.docNumber}
                      onChange={handleChange}
                      placeholder={formData.docType === 'DNI' ? '8 dígitos' : formData.docType === 'RUC' ? '11 dígitos' : 'ej. 00123456'}
                      className="w-full h-11 px-3.5 rounded-xl border border-[#bccac0] text-sm text-[#0b1c30] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                      Teléfono / WhatsApp de Contacto *
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 font-mono select-none pointer-events-none flex items-center gap-1.5 border-r border-slate-200 pr-2">
                        <span>🇵🇪</span>
                        <span>+51</span>
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        required
                        inputMode="numeric"
                        maxLength={9}
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="987654321"
                        className="w-full h-11 pl-20 pr-3.5 rounded-xl border border-[#bccac0] text-sm text-[#0b1c30] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] transition-all font-mono"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">9 dígitos (ej. 987 654 321)</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                      Correo Electrónico (para notificación de respuesta) *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      maxLength={100}
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="ej. m.lopez@gmail.com"
                      className="w-full h-11 px-3.5 rounded-xl border border-[#bccac0] text-sm text-[#0b1c30] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                      Dirección (Calle / Urbanización)
                    </label>
                    <input
                      type="text"
                      name="address"
                      maxLength={150}
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="ej. Av. Pardo 540, Dpto 302"
                      className="w-full h-11 px-3.5 rounded-xl border border-[#bccac0] text-sm text-[#0b1c30] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                      Ciudad / Distrito
                    </label>
                    <input
                      type="text"
                      name="city"
                      maxLength={60}
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="ej. Miraflores, Lima"
                      className="w-full h-11 px-3.5 rounded-xl border border-[#bccac0] text-sm text-[#0b1c30] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 select-none">
                      <input
                        type="checkbox"
                        name="isMinor"
                        checked={formData.isMinor}
                        onChange={handleChange}
                        className="w-4 h-4 rounded text-[#059669] focus:ring-[#059669] border-[#bccac0]"
                      />
                      <span>El reclamante es menor de edad (requiere datos del padre o apoderado)</span>
                    </label>
                  </div>

                  {formData.isMinor && (
                    <div className="sm:col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                        Nombre completo del Padre, Madre o Apoderado *
                      </label>
                      <input
                        type="text"
                        name="parentName"
                        required={formData.isMinor}
                        value={formData.parentName}
                        onChange={handleChange}
                        placeholder="ej. Roberto López Mendoza"
                        className="w-full h-11 px-3.5 rounded-xl border border-[#bccac0] text-sm bg-white text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* Sección 2: Identificación del Bien Contratado */}
              <section className="space-y-3.5">
                <h2 className="text-sm font-bold text-[#0b1c30] flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-5 h-5 rounded-full bg-[#059669] text-white text-[11px] flex items-center justify-center font-bold">2</span>
                  <span>Identificación del Bien Contratado</span>
                </h2>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#0b1c30] mb-1.5">
                      Tipo de Bien *
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#0b1c30] select-none">
                        <input
                          type="radio"
                          name="contractType"
                          value="producto"
                          checked={formData.contractType === 'producto'}
                          onChange={handleChange}
                          className="w-4 h-4 text-[#059669] focus:ring-[#059669]"
                        />
                        <span>Producto (Bienes, ropa, comida, etc.)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#0b1c30] select-none">
                        <input
                          type="radio"
                          name="contractType"
                          value="servicio"
                          checked={formData.contractType === 'servicio'}
                          onChange={handleChange}
                          className="w-4 h-4 text-[#059669] focus:ring-[#059669]"
                        />
                        <span>Servicio</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                        Descripción del Producto o Servicio *
                      </label>
                      <input
                        type="text"
                        name="goodDescription"
                        required
                        maxLength={150}
                        value={formData.goodDescription}
                        onChange={handleChange}
                        placeholder="ej. Torta de chocolate 1kg con envío"
                        className="w-full h-11 px-3.5 rounded-xl border border-[#bccac0] text-sm text-[#0b1c30] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                        Monto Reclamado (S/)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="999999"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="ej. 45.00"
                        className="w-full h-11 px-3.5 rounded-xl border border-[#bccac0] text-sm text-[#0b1c30] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] transition-all"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Sección 3: Detalle de la Reclamación */}
              <section className="space-y-3.5">
                <h2 className="text-sm font-bold text-[#0b1c30] flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-5 h-5 rounded-full bg-[#059669] text-white text-[11px] flex items-center justify-center font-bold">3</span>
                  <span>Detalle de la Reclamación</span>
                </h2>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#0b1c30] mb-1.5">
                      Tipo de Discrepancia *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <label className={`p-3 rounded-xl border cursor-pointer flex flex-col gap-1 transition-all select-none ${
                        formData.claimType === 'reclamo' 
                          ? 'border-[#059669] bg-emerald-50/50 ring-1 ring-[#059669]' 
                          : 'border-[#bccac0]/50 hover:border-slate-300'
                      }`}>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="claimType"
                            value="reclamo"
                            checked={formData.claimType === 'reclamo'}
                            onChange={handleChange}
                            className="w-4 h-4 text-[#059669] focus:ring-[#059669]"
                          />
                          <span className="font-bold text-xs text-[#0b1c30]">RECLAMO</span>
                        </div>
                        <span className="text-[11px] text-slate-500 leading-snug pl-6">
                          Disconformidad relacionada directamente a los productos adquiridos.
                        </span>
                      </label>

                      <label className={`p-3 rounded-xl border cursor-pointer flex flex-col gap-1 transition-all select-none ${
                        formData.claimType === 'queja' 
                          ? 'border-[#059669] bg-emerald-50/50 ring-1 ring-[#059669]' 
                          : 'border-[#bccac0]/50 hover:border-slate-300'
                      }`}>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="claimType"
                            value="queja"
                            checked={formData.claimType === 'queja'}
                            onChange={handleChange}
                            className="w-4 h-4 text-[#059669] focus:ring-[#059669]"
                          />
                          <span className="font-bold text-xs text-[#0b1c30]">QUEJA</span>
                        </div>
                        <span className="text-[11px] text-slate-500 leading-snug pl-6">
                          Malestar o descontento respecto a la atención brindada.
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-[#0b1c30]">
                        Detalle de los hechos *
                      </label>
                      <span className="text-[10px] text-slate-400">
                        {formData.detail.length}/1000
                      </span>
                    </div>
                    <textarea
                      name="detail"
                      required
                      maxLength={1000}
                      rows={3}
                      value={formData.detail}
                      onChange={handleChange}
                      placeholder="Describa claramente lo sucedido, fechas o inconvenientes ocurridos..."
                      className="w-full p-3 rounded-xl border border-[#bccac0] text-sm text-[#0b1c30] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] resize-y leading-relaxed transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-[#0b1c30]">
                        Pedido concreto del consumidor *
                      </label>
                      <span className="text-[10px] text-slate-400">
                        {formData.consumerRequest.length}/500
                      </span>
                    </div>
                    <textarea
                      name="consumerRequest"
                      required
                      maxLength={500}
                      rows={2}
                      value={formData.consumerRequest}
                      onChange={handleChange}
                      placeholder="Indique qué solicita para resolver su caso (ej. cambio de producto, reembolso, etc.)..."
                      className="w-full p-3 rounded-xl border border-[#bccac0] text-sm text-[#0b1c30] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] resize-y leading-relaxed transition-all"
                    />
                  </div>
                </div>
              </section>

              {/* Declaración Jurada y Aceptación */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-slate-700 leading-relaxed select-none">
                  <input
                    type="checkbox"
                    name="acceptedTerms"
                    required
                    checked={formData.acceptedTerms}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-[#059669] focus:ring-[#059669] border-[#bccac0] mt-0.5 shrink-0"
                  />
                  <span>
                    Declaro bajo juramento que los datos ingresados son veraces y corresponden a mi persona. Autorizo al establecimiento <strong>{store.name}</strong> a remitir la respuesta formal a mi correo conforme a la Ley N° 29571.
                  </span>
                </label>
              </div>

              {/* Botón de Envío */}
              <div className="pt-1">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={loading || !isFormValid}
                  className={`h-11 font-bold text-xs rounded-xl shadow-xs transition-all ${
                    !isFormValid || loading
                      ? 'opacity-40 bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-300 shadow-none'
                      : 'bg-[#059669] hover:bg-[#00855d] text-white active:scale-[0.99] cursor-pointer'
                  }`}
                >
                  {loading ? 'Registrando Reclamación...' : 'Enviar Hoja de Reclamación'}
                </Button>
                {!isFormValid && (
                  <p className="text-[11px] text-center text-amber-700 bg-amber-50 border border-amber-200/80 rounded-lg py-1.5 px-3 mt-2 font-medium">
                    {!formData.acceptedTerms
                      ? '⚠️ Debes marcar la casilla de declaración jurada para habilitar el envío.'
                      : 'Completa todos los campos obligatorios (*) con datos válidos para habilitar el botón.'}
                  </p>
                )}
                {isFormValid && (
                  <p className="text-[10px] text-center text-slate-400 mt-2">
                    Se generará una Hoja de Reclamación numerada descargable e imprimible de forma inmediata.
                  </p>
                )}
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer Legal */}
      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-white">
        <p>
          © {new Date().getFullYear()} {store.name} • Canal tecnológico provisto por{' '}
          <Link href="/" className="font-bold text-emerald-700 hover:underline">
            APANA
          </Link>
        </p>
      </footer>
    </div>
  );
}
