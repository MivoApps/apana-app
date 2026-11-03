'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  BookOpen,
  FileText,
  Sparkles,
  ArrowRight,
  X,
  Laptop,
  CheckCircle2
} from 'lucide-react';

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  storeName: string;
  isLegalConfigured?: boolean;
}

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({
  isOpen,
  onClose,
  storeId,
  storeName,
  isLegalConfigured = false,
}) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleGoToSettings = () => {
    if (typeof window !== 'undefined' && storeId) {
      localStorage.setItem(`apana_whats_new_seen_${storeId}_v1_legal`, 'true');
    }
    onClose();
    router.push('/settings?tab=legal');
  };

  const handleDismiss = () => {
    if (typeof window !== 'undefined' && storeId) {
      localStorage.setItem(`apana_whats_new_seen_${storeId}_v1_legal`, 'true');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Decorativo con Degradado */}
        <div className="relative bg-gradient-to-br from-emerald-600 via-teal-700 to-[#0b1c30] text-white p-5 sm:p-6 shrink-0">
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar novedades"
          >
            <X size={18} />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-200 text-[11px] font-extrabold uppercase tracking-wider mb-2 border border-white/10">
            <Sparkles size={13} className="text-amber-300" />
            <span>Gran Actualización de APANA</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
            Tu tienda ahora está blindada y protegida legalmente 🛡️
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1.5 leading-relaxed">
            Lanzamos nuevas herramientas para que tus clientes compren con total seguridad y formalidad en tu tienda online.
          </p>
        </div>

        {/* Contenido Scrolleable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 divide-y divide-slate-100">

          {/* Novedad 1: Libro de Reclamaciones */}
          <div className="flex items-start gap-3.5 pt-1">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
              <BookOpen size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-[#0b1c30] flex items-center gap-1.5">
                <span>Libro de Reclamaciones Oficial (INDECOPI)</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.2 bg-emerald-100 text-[#006c49] rounded-md">
                  Ley N° 29571
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Tus clientes ya pueden registrar consultas o reclamos formales. Tienes un plazo de <strong className="text-slate-700">15 días hábiles</strong> para atenderlos desde tu nueva bandeja en el menú, con constancia automática por email.
              </p>
            </div>
          </div>

          {/* Novedad 2: Identidad Oficial Verificada */}
          <div className="flex items-start gap-3.5 pt-3.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100 shadow-2xs">
              <ShieldCheck size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-[#0b1c30]">
                Sello de «Identidad Oficial Verificada»
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Valida tu RUC o DNI con SUNAT / RENIEC en segundos. Tus compradores verán una insignia de confianza en tu catálogo y en cada producto, reduciendo el temor a estafas por WhatsApp.
              </p>
            </div>
          </div>

          {/* Novedad 3: Políticas de Tienda Inteligentes */}
          <div className="flex items-start gap-3.5 pt-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100 shadow-2xs">
              <FileText size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-[#0b1c30]">
                Políticas de tu Tienda en 1 Clic
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Activa plantillas oficiales adaptadas a tu rubro (comida, ropa, tecnología, artesanía, etc.) para dejar claras las reglas de cambios, garantías y envíos antes de la compra.
              </p>
            </div>
          </div>

          {/* Novedad 4: Diseño Tienda Responsivo */}
          <div className="flex items-start gap-3.5 pt-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100 shadow-2xs">
              <Laptop size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-[#0b1c30]">
                Nueva Experiencia de Compra para tus Clientes
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Tu catálogo y carrito ahora se adaptan con total fluidez a celulares y computadoras, facilitando que tus clientes agreguen productos y completen su pedido sin dudas.
              </p>
            </div>
          </div>

          {/* Callout de Acción */}
          <div className="pt-3">
            <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${isLegalConfigured
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : 'bg-amber-50/90 border-amber-200 text-amber-950'
              }`}>
              <div className="shrink-0">
                {isLegalConfigured ? (
                  <CheckCircle2 size={20} className="text-[#059669]" />
                ) : (
                  <span className="text-lg">📌</span>
                )}
              </div>
              <div className="text-xs leading-snug">
                {isLegalConfigured ? (
                  <span>
                    <strong>¡Excelente!</strong> Tu tienda <strong className="font-bold">{storeName}</strong> ya tiene sus datos legales configurados.
                  </span>
                ) : (
                  <span>
                    <strong>Paso recomendado:</strong> Entra a <strong className="underline">Ajustes &gt; Legal</strong> y completa tu RUC o DNI para habilitar tu Libro de Reclamaciones con el sello de <strong>Identidad Oficial Verificada.</strong>
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Footer con Botones de Acción */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-center"
          >
            Ver más tarde
          </button>

          <button
            type="button"
            onClick={handleGoToSettings}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#00855d] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>Ir a Ajustes y Configurar</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
