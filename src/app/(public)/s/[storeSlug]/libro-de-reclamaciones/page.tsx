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
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getStoreBySlugFromFS, createReclamacionInFS } from '@/lib/firebase/firestore';
import { Store } from '@/types/store';
import StoreNotFoundPage from '@/app/(public)/store-not-found/page';

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
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acceptedTerms) {
      alert('Debes declarar la veracidad de la información y aceptar las condiciones para enviar la reclamación.');
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

      await createReclamacionInFS({
        claimCode: generatedCode,
        storeId: store.id,
        storeSlug: store.slug,
        storeName: store.name,
        fullName: formData.fullName,
        docType: formData.docType,
        docNumber: formData.docNumber,
        phone: formData.phone,
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
      setSubmissionDate(new Date().toLocaleString('es-PE', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Datos de identificación del proveedor con fallback inteligente
  const providerBusinessName = store.legalBusinessName || store.name;
  const providerTaxDoc = store.legalTaxId 
    ? `${store.legalTaxIdType || 'RUC'}: ${store.legalTaxId}` 
    : 'Comercio Registrado en APANA';
  const providerAddress = store.legalAddress || store.city || 'Perú';
  const providerPhone = store.whatsappPhone ? `+${store.whatsappPhone}` : 'Contacto vía Tienda Online';

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans">
      {/* Header con enlace a la tienda */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#bccac0]/30 py-3.5 px-4">
        <div className="max-w-[640px] mx-auto flex items-center justify-between">
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
      <main className="flex-1 max-w-[640px] mx-auto px-4 py-6 sm:py-8 w-full">
        {submitted ? (
          /* Hoja de Reclamación Generada Exitosamente */
          <div className="bg-white rounded-2xl p-5 sm:p-7 border border-[#bccac0]/40 shadow-xs space-y-6 animate-in fade-in duration-300">
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
            </div>

            {/* Provider and Consumer Summary */}
            <div className="flex flex-col gap-3 text-xs">
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
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3 text-xs">
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
        ) : (
          /* Formulario Oficial de Reclamación */
          <div className="bg-white rounded-2xl p-5 sm:p-7 border border-[#bccac0]/40 shadow-xs space-y-6">
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
                      <option value="DNI">DNI (Documento Nacional de Identidad)</option>
                      <option value="CE">Carné de Extranjería</option>
                      <option value="Pasaporte">Pasaporte</option>
                      <option value="RUC">RUC</option>
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
                      value={formData.docNumber}
                      onChange={handleChange}
                      placeholder="ej. 72345678"
                      className="w-full h-11 px-3.5 rounded-xl border border-[#bccac0] text-sm text-[#0b1c30] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                      Teléfono / WhatsApp de Contacto *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="ej. 987654321"
                      className="w-full h-11 px-3.5 rounded-xl border border-[#bccac0] text-sm text-[#0b1c30] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                      Correo Electrónico (para notificación de respuesta) *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
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
                    <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                      Detalle de los hechos *
                    </label>
                    <textarea
                      name="detail"
                      required
                      rows={3}
                      value={formData.detail}
                      onChange={handleChange}
                      placeholder="Describa claramente lo sucedido, fechas o inconvenientes ocurridos..."
                      className="w-full p-3 rounded-xl border border-[#bccac0] text-sm text-[#0b1c30] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] resize-y leading-relaxed transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                      Pedido concreto del consumidor *
                    </label>
                    <textarea
                      name="consumerRequest"
                      required
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
                  disabled={loading}
                  className="h-11 bg-[#059669] hover:bg-[#00855d] text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-[0.99]"
                >
                  {loading ? 'Registrando Reclamación...' : 'Enviar Hoja de Reclamación'}
                </Button>
                <p className="text-[10px] text-center text-slate-400 mt-2">
                  Se generará una Hoja de Reclamación numerada descargable e imprimible de forma inmediata.
                </p>
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
