'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle2, 
  FileText, 
  Printer, 
  Send, 
  AlertCircle,
  Clock,
  ShieldCheck,
  Building2,
  Mail,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LibroReclamacionesPage() {
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
    contractType: 'servicio', // servicio o producto
    amount: '',
    goodDescription: '',

    // Detalle
    claimType: 'reclamo', // reclamo o queja
    detail: '',
    consumerRequest: '',
    acceptedTerms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acceptedTerms) {
      alert('Debes declarar la veracidad de la información y aceptar las condiciones para enviar la reclamación.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const randomCode = `LR-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(100000 + Math.random() * 900000)}`;
      setClaimCode(randomCode);
      setSubmissionDate(new Date().toLocaleString('es-PE', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
      setLoading(false);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#bccac0]/30 py-4 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-[#006c49] hover:text-[#00855d] transition-colors">
            <ArrowLeft size={18} />
            <span>Volver a APANA</span>
          </Link>
          <Link href="/" className="flex items-center transition-opacity hover:opacity-90">
            <Image
              src="/logo_lockup.svg"
              alt="APANA"
              width={125}
              height={28}
              className="h-7 w-auto object-contain"
            />
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
        {submitted ? (
          /* Hoja de Reclamación Generada Exitosamente */
          <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-emerald-500/40 shadow-xl space-y-8 animate-in fade-in duration-300">
            {/* Header Constancia */}
            <div className="border-b border-slate-100 pb-6 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={36} />
              </div>
              <span className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 text-[#006c49] text-xs font-extrabold rounded-full uppercase tracking-wider">
                Reclamación Registrada
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0b1c30]">
                Hoja de Reclamación Virtual N° {claimCode}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Fecha y hora de registro: <strong>{submissionDate}</strong>
              </p>
            </div>

            {/* Provider and Consumer Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="font-bold text-[#0b1c30] flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                  <Building2 size={15} className="text-[#059669]" />
                  <span>Datos del Proveedor</span>
                </div>
                <p><strong>Razón Social:</strong> Mivo E.I.R.L.</p>
                <p><strong>Nombre Comercial:</strong> APANA</p>
                <p><strong>Ubicación:</strong> Lima, Perú</p>
                <p><strong>Correo:</strong> soporte@beapana.com</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="font-bold text-[#0b1c30] flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                  <ShieldCheck size={15} className="text-[#059669]" />
                  <span>Datos del Consumidor</span>
                </div>
                <p><strong>Nombre:</strong> {formData.fullName}</p>
                <p><strong>{formData.docType}:</strong> {formData.docNumber}</p>
                <p><strong>Correo:</strong> {formData.email}</p>
                <p><strong>Teléfono:</strong> {formData.phone}</p>
              </div>
            </div>

            {/* Claim Content Summary */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4 text-xs sm:text-sm">
              <div>
                <span className="text-slate-500 font-medium block text-xs">Tipo de Reclamación:</span>
                <span className="font-bold text-emerald-800 uppercase text-sm">
                  {formData.claimType === 'reclamo' ? 'RECLAMO (Disconformidad con el bien o servicio)' : 'QUEJA (Malestar o descontento con la atención)'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 font-medium block text-xs">Bien o Servicio Contratado:</span>
                <p className="font-semibold text-slate-800">{formData.goodDescription || 'Suscripción a la plataforma APANA SaaS'}</p>
                {formData.amount && <p className="text-xs text-slate-600 mt-0.5">Monto reclamado: S/ {formData.amount}</p>}
              </div>

              <div>
                <span className="text-slate-500 font-medium block text-xs">Detalle de los hechos:</span>
                <p className="text-slate-700 bg-white p-3 rounded-xl border border-slate-200 mt-1 whitespace-pre-wrap leading-relaxed">
                  {formData.detail}
                </p>
              </div>

              <div>
                <span className="text-slate-500 font-medium block text-xs">Pedido concreto del consumidor:</span>
                <p className="text-slate-700 bg-white p-3 rounded-xl border border-slate-200 mt-1 whitespace-pre-wrap leading-relaxed">
                  {formData.consumerRequest}
                </p>
              </div>
            </div>

            {/* Legal Notice */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
              <Clock size={20} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Plazo de atención conforme a Ley (INDECOPI):</p>
                <p className="mt-0.5">
                  Conforme a lo establecido en la Ley N° 29571 (Código de Protección y Defensa del Consumidor), el proveedor deberá dar respuesta a la presente reclamación en un plazo no mayor a <strong>quince (15) días hábiles improrrogables</strong> mediante comunicación dirigida a su correo electrónico <strong>{formData.email}</strong>.
                </p>
              </div>
            </div>

            {/* Print & Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 h-12 bg-white hover:bg-slate-50 border border-slate-300 text-[#0b1c30] font-bold text-sm rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer size={16} />
                <span>Imprimir / Guardar en PDF</span>
              </button>

              <Link href="/" className="flex-1">
                <Button
                  variant="primary"
                  fullWidth
                  className="h-12 text-sm font-bold bg-[#059669] hover:bg-[#00855d] text-white rounded-2xl shadow-md"
                >
                  Volver al Inicio
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Formulario Oficial de Reclamación */
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#bccac0]/30 shadow-xs space-y-8">
            {/* Header */}
            <div className="border-b border-gray-100 pb-6 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[#006c49] text-xs font-bold rounded-full border border-emerald-200/60">
                <BookOpen size={14} />
                <span>Conforme a la Ley N° 29571 • INDECOPI</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0b1c30] tracking-tight">
                Libro de Reclamaciones Virtual
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                <strong>Mivo E.I.R.L.</strong> • Razón social operadora de la plataforma APANA • Lima, Perú.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Sección 1: Identificación del Consumidor */}
              <section className="space-y-4">
                <h2 className="text-base sm:text-lg font-bold text-[#0b1c30] flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-full bg-[#059669] text-white text-xs flex items-center justify-center font-black">1</span>
                  <span>Identificación del Consumidor Reclamante</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nombres y Apellidos completos *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="ej. Juan Carlos Pérez Rojas"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tipo de Documento *
                    </label>
                    <select
                      name="docType"
                      value={formData.docType}
                      onChange={handleChange}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
                    >
                      <option value="DNI">DNI (Documento Nacional de Identidad)</option>
                      <option value="CE">Carné de Extranjería</option>
                      <option value="Pasaporte">Pasaporte</option>
                      <option value="RUC">RUC (Persona Natural con Negocio)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Número de Documento *
                    </label>
                    <input
                      type="text"
                      name="docNumber"
                      required
                      value={formData.docNumber}
                      onChange={handleChange}
                      placeholder="ej. 72345678"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="ej. 987654321"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Correo Electrónico (para notificación) *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="ej. contacto@tuemail.com"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Domicilio (Dirección, Distrito y Ciudad) *
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="ej. Av. Javier Prado Este 123, San Isidro, Lima"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
                    />
                  </div>
                </div>
              </section>

              {/* Sección 2: Identificación del Bien Contratado */}
              <section className="space-y-4">
                <h2 className="text-base sm:text-lg font-bold text-[#0b1c30] flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-full bg-[#059669] text-white text-xs flex items-center justify-center font-black">2</span>
                  <span>Identificación del Bien Contratado</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tipo de Bien *
                    </label>
                    <div className="flex gap-4 pt-1">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                        <input
                          type="radio"
                          name="contractType"
                          value="servicio"
                          checked={formData.contractType === 'servicio'}
                          onChange={handleChange}
                          className="accent-[#059669]"
                        />
                        <span>Servicio (Suscripción / Software)</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                        <input
                          type="radio"
                          name="contractType"
                          value="producto"
                          checked={formData.contractType === 'producto'}
                          onChange={handleChange}
                          className="accent-[#059669]"
                        />
                        <span>Producto</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Monto Reclamado en Soles (S/ opcional)
                    </label>
                    <input
                      type="number"
                      name="amount"
                      step="0.01"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="ej. 19.90"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Descripción del bien o servicio contratado *
                    </label>
                    <input
                      type="text"
                      name="goodDescription"
                      required
                      value={formData.goodDescription}
                      onChange={handleChange}
                      placeholder="ej. Suscripción mensual Plan Emprendedor / Catálogo virtual"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
                    />
                  </div>
                </div>
              </section>

              {/* Sección 3: Detalle de la Reclamación */}
              <section className="space-y-4">
                <h2 className="text-base sm:text-lg font-bold text-[#0b1c30] flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-full bg-[#059669] text-white text-xs flex items-center justify-center font-black">3</span>
                  <span>Detalle de la Reclamación y Pedido del Consumidor</span>
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Tipo de Reclamación *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        formData.claimType === 'reclamo' ? 'bg-emerald-50 border-[#059669] ring-2 ring-[#059669]/20' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex items-start gap-2.5">
                          <input
                            type="radio"
                            name="claimType"
                            value="reclamo"
                            checked={formData.claimType === 'reclamo'}
                            onChange={handleChange}
                            className="mt-0.5 accent-[#059669]"
                          />
                          <div>
                            <span className="font-extrabold text-xs text-[#0b1c30] block">RECLAMO</span>
                            <span className="text-[11px] text-slate-500 leading-tight block">
                              Disconformidad relacionada a los productos o servicios adquiridos.
                            </span>
                          </div>
                        </div>
                      </label>

                      <label className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        formData.claimType === 'queja' ? 'bg-emerald-50 border-[#059669] ring-2 ring-[#059669]/20' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex items-start gap-2.5">
                          <input
                            type="radio"
                            name="claimType"
                            value="queja"
                            checked={formData.claimType === 'queja'}
                            onChange={handleChange}
                            className="mt-0.5 accent-[#059669]"
                          />
                          <div>
                            <span className="font-extrabold text-xs text-[#0b1c30] block">QUEJA</span>
                            <span className="text-[11px] text-slate-500 leading-tight block">
                              Malestar o descontento respecto a la atención al público.
                            </span>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Detalle de los hechos / Motivo del reclamo o queja *
                    </label>
                    <textarea
                      name="detail"
                      required
                      rows={4}
                      value={formData.detail}
                      onChange={handleChange}
                      placeholder="Explica con claridad y detalle lo sucedido..."
                      className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Pedido concreto del consumidor *
                    </label>
                    <textarea
                      name="consumerRequest"
                      required
                      rows={3}
                      value={formData.consumerRequest}
                      onChange={handleChange}
                      placeholder="Indica qué solución solicitas a Mivo E.I.R.L. / APANA..."
                      className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
                    />
                  </div>
                </div>
              </section>

              {/* Declaración de veracidad y envío */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="acceptedTerms"
                    checked={formData.acceptedTerms}
                    onChange={handleChange}
                    className="mt-1 accent-[#059669] w-4 h-4 rounded-sm"
                  />
                  <span className="text-xs text-slate-700 leading-relaxed">
                    Declaro bajo juramento que toda la información consignada en este formulario es verídica y acepto recibir la respuesta a mi reclamación mediante el correo electrónico consignado conforme a la Ley N° 29571.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                disabled={loading}
                className="h-13 font-bold bg-[#059669] hover:bg-[#00855d] text-white rounded-2xl shadow-lg shadow-[#059669]/25 flex items-center justify-center gap-2"
              >
                <Send size={18} />
                <span>{loading ? 'Enviando reclamación...' : 'Enviar Hoja de Reclamación'}</span>
              </Button>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-500 border-t border-[#bccac0]/20 bg-white">
        © {new Date().getFullYear()} APANA • Operado por Mivo E.I.R.L. • Lima, Perú.
      </footer>
    </div>
  );
}
