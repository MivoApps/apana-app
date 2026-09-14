'use client';

import React, { useState } from 'react';
import { X, Flag, AlertTriangle, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { createStoreReportInFS } from '@/lib/firebase/firestore';

interface ReportStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  storeSlug: string;
  storeName: string;
}

const REPORT_REASONS = [
  { id: 'fraude_estafa', label: 'Posible fraude o incumplimiento de entrega' },
  { id: 'suplantacion', label: 'Suplantación de identidad o marca no autorizada' },
  { id: 'productos_prohibidos', label: 'Venta de productos ilegales o prohibidos' },
  { id: 'contenido_inapropiado', label: 'Contenido ofensivo, explícito o engañoso' },
  { id: 'otro', label: 'Otro motivo' },
];

export const ReportStoreModal: React.FC<ReportStoreModalProps> = ({
  isOpen,
  onClose,
  storeId,
  storeSlug,
  storeName,
}) => {
  const [reason, setReason] = useState(REPORT_REASONS[0].id);
  const [details, setDetails] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    if (isSubmitting) return;
    setIsSuccess(false);
    setErrorMessage('');
    setDetails('');
    setContact('');
    setReason(REPORT_REASONS[0].id);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim() || details.trim().length < 10) {
      setErrorMessage('Por favor proporciona al menos 10 caracteres explicando el motivo del reporte.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const selectedReasonObj = REPORT_REASONS.find((r) => r.id === reason);
      await createStoreReportInFS({
        storeId,
        storeSlug,
        storeName,
        reason,
        reasonLabel: selectedReasonObj?.label || reason,
        details: details.trim(),
        reporterContact: contact.trim() || undefined,
      });

      setIsSuccess(true);
    } catch (err) {
      console.error('Error al enviar reporte:', err);
      setErrorMessage('No se pudo enviar el reporte en este momento. Inténtalo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#bccac0]/30 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Flag size={16} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#0b1c30]">Reportar Tienda</h3>
              <p className="text-[11px] text-slate-500 truncate max-w-[220px]">{storeName}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors border border-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-600 font-sans">
          {isSuccess ? (
            <div className="py-6 flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#006c49] flex items-center justify-center">
                <CheckCircle2 size={28} />
              </div>
              <h4 className="text-base font-bold text-[#0b1c30]">Reporte recibido</h4>
              <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
                Gracias por ayudarnos a mantener una comunidad segura. El equipo de seguridad y soporte de APANA revisará este reporte con total confidencialidad.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-2 px-6 py-2.5 bg-[#006c49] hover:bg-[#005137] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Info Disclaimer */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-[11px] text-slate-600 leading-relaxed flex items-start gap-2">
                <ShieldCheck size={16} className="text-[#006c49] shrink-0 mt-0.5" />
                <p>
                  Utiliza este canal para alertar sobre conductas sospechosas, posible fraude o infracción a los términos de APANA. Para consultas sobre el envío o estado de un pedido en curso, comunícate primero con la tienda.
                </p>
              </div>

              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 flex items-center gap-2">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Motivo */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0b1c30]">
                  Motivo principal del reporte <span className="text-red-500">*</span>
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs text-[#0b1c30] focus:outline-none focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49]"
                >
                  {REPORT_REASONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Detalle */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0b1c30]">
                  Detalles o evidencias <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Describe brevemente lo ocurrido (ej. realicé el pago y bloquearon el contacto, los productos son falsificados, etc.)..."
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-[#0b1c30] placeholder:text-slate-400 focus:outline-none focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49] resize-none"
                />
              </div>

              {/* Contacto opcional */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0b1c30]">
                  Tu correo o teléfono <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="ejemplo@correo.com o +51 999 999 999"
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs text-[#0b1c30] placeholder:text-slate-400 focus:outline-none focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49]"
                />
                <p className="text-[10px] text-slate-400">
                  Solo lo utilizaremos si nuestro equipo requiere validar información sobre este caso.
                </p>
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <span>Enviar Reporte</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
