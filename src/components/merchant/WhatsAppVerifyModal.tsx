'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  ExternalLink, 
  AlertCircle,
  MessageSquare,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { useAuth } from '@/lib/firebase/auth-context';
import { createOtpRequestInFS, verifyOtpCodeInFS } from '@/lib/firebase/firestore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  storeName: string;
  phone: string;
  onSuccess?: () => void;
}

const APANA_OFFICIAL_WHATSAPP = '51920030074';

export const WhatsAppVerifyModal: React.FC<Props> = ({
  isOpen,
  onClose,
  storeId,
  storeName,
  phone,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [hasOpenedWhatsApp, setHasOpenedWhatsApp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const cleanPhone = phone.replace(/\D/g, '');
  const displayPhone = cleanPhone.length > 9 ? cleanPhone.slice(-9) : cleanPhone;
  const fullPhone = cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`;

  // Al abrir el modal, generar código de 6 dígitos y registrar la solicitud en Firestore
  useEffect(() => {
    if (isOpen && user && fullPhone) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      setInputCode('');
      setHasOpenedWhatsApp(false);
      setIsVerifying(false);
      setErrorMessage('');
      setIsSuccess(false);

      // Registrar solicitud pendiente en Firestore
      createOtpRequestInFS(fullPhone, code, storeId, storeName, user.uid);
    }
  }, [isOpen, user, fullPhone, storeId, storeName]);

  if (!isOpen) return null;

  // Mensaje 100% limpio hacia el bot oficial de APANA (+51 920030074)
  const messageText = `Hola equipo de APANA 👋, solicito mi código de activación para mi tienda *${storeName || 'Mi Tienda'}*.`;
  const whatsappUrl = `https://wa.me/${APANA_OFFICIAL_WHATSAPP}?text=${encodeURIComponent(messageText)}`;

  const handleOpenWhatsApp = async () => {
    setHasOpenedWhatsApp(true);
    setErrorMessage('');
    
    // Regenerar un código fresco y renovar la ventana de 15 minutos en Firestore al hacer clic
    if (user && fullPhone) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      await createOtpRequestInFS(fullPhone, code, storeId, storeName, user.uid);
    }

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleValidateCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputCode.trim() || inputCode.trim().length !== 6) {
      setErrorMessage('Ingresa el código de 6 dígitos que te respondió el bot de APANA.');
      return;
    }

    if (!user) return;

    setIsVerifying(true);
    setErrorMessage('');

    try {
      const res = await verifyOtpCodeInFS(fullPhone, inputCode, storeId, user.uid);

      if (!res.success) {
        setErrorMessage(res.error || 'Código incorrecto. Verifica el mensaje en WhatsApp.');
        setIsVerifying(false);
        return;
      }

      setIsSuccess(true);
      if (onSuccess) onSuccess();

      setTimeout(() => {
        onClose();
      }, 2200);
    } catch (err: any) {
      console.error('Error validando código:', err);
      setErrorMessage('Ocurrió un error al validar el código. Inténtalo de nuevo.');
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl p-6 max-w-md w-full relative z-10 border border-slate-100 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {isSuccess ? (
          /* Estado de Éxito */
          <div className="flex flex-col items-center text-center gap-3 py-6 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-100 text-[#059669] rounded-full flex items-center justify-center shadow-xs">
              <CheckCircle2 size={36} />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-extrabold text-xl text-[#0b1c30]">
                ¡WhatsApp Validado con Éxito!
              </h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Tu línea <strong>+51 {displayPhone}</strong> ha sido verificada como titular oficial de <strong>{storeName}</strong>.
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#059669] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full mt-2">
              🛡️ Protección Anti-Fraude Activa
            </span>
          </div>
        ) : (
          /* Flujo de Activación con Bot */
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#059669] flex items-center justify-center shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div className="flex flex-col">
                <h3 className="font-extrabold text-base text-[#0b1c30]">
                  Validar Celular de la Tienda
                </h3>
                <span className="text-xs text-slate-500">
                  Verificación automática por WhatsApp
                </span>
              </div>
            </div>

            {/* Tarjeta Informativa */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-600 leading-relaxed flex flex-col gap-1.5">
              <div className="flex items-center justify-between font-bold text-slate-700">
                <span>Tu número de tienda:</span>
                <span className="text-[#059669] font-extrabold font-mono text-sm">+51 {displayPhone}</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 leading-normal">
                Para evitar fraudes, solicita tu código de activación por WhatsApp. Nuestro bot te responderá tu código de 6 dígitos al instante.
              </p>
            </div>

            {/* PASO 1: Solicitar Código */}
            <div className="flex flex-col gap-1.5 pt-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                Pide tu código por WhatsApp
              </label>

              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className={`w-full h-11 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  hasOpenedWhatsApp
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    : 'bg-[#059669] hover:bg-[#00855d] active:scale-[0.98] text-white shadow-emerald-700/20'
                }`}
              >
                <WhatsAppIcon size={18} />
                <span>{hasOpenedWhatsApp ? 'Volver a abrir chat de WhatsApp' : 'Solicitar código a APANA (+51 920030074)'}</span>
                <ExternalLink size={14} />
              </button>
            </div>

            {/* PASO 2: Ingresar Código Recibido */}
            <form onSubmit={handleValidateCode} className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                Ingresa el código de 6 dígitos que te envió el bot:
              </label>

              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  inputMode="numeric"
                  autoFocus={hasOpenedWhatsApp}
                  placeholder="• • • • • •"
                  value={inputCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setInputCode(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className="w-full h-12 px-4 text-center font-mono text-xl font-bold tracking-[0.4em] rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition-all text-[#0b1c30]"
                />
                <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {errorMessage && (
                <div className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-0.5 animate-in fade-in">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifying || inputCode.length < 6}
                className="w-full h-11 mt-1 bg-[#006948] hover:bg-[#005137] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <CheckCircle2 size={16} />
                <span>{isVerifying ? 'Validando código...' : 'Validar Código'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
