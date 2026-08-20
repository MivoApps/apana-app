'use client';

import React from 'react';
import Link from 'next/link';
import { X, ExternalLink, ShieldCheck, Scale, FileText } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#bccac0]/30 flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#006c49] flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#0b1c30]">Términos y Declaración Jurada</h3>
              <p className="text-[11px] text-slate-500">Condiciones de servicio APANA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors border border-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed font-sans scrollbar-thin">
          {/* Declaración Jurada Highlight */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
              <Scale size={16} className="text-amber-700 shrink-0" />
              <span>Declaración Jurada de Titularidad</span>
            </div>
            <p className="text-amber-950/90 text-[11px]">
              Al utilizar APANA, declaras bajo juramento que eres el titular legítimo o representante legal autorizado del número de WhatsApp y del comercio registrado, asumiendo total responsabilidad legal por las actividades del catálogo.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-[#0b1c30] text-xs flex items-center gap-1.5">
              <FileText size={14} className="text-[#059669]" />
              1. Naturaleza de la Plataforma
            </h4>
            <p>
              APANA es una herramienta SaaS de catálogo digital. No intermedia en cobros ni procesa pagos; las transacciones son acuerdos privados entre comerciante y comprador.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-[#0b1c30] text-xs flex items-center gap-1.5">
              <FileText size={14} className="text-[#059669]" />
              2. Prohibición de Suplantación
            </h4>
            <p>
              Está estrictamente prohibido usar números ajenos o marcas registradas no autorizadas. Las cuentas fraudulentas serán suspendidas de inmediato y reportadas.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-[#0b1c30] text-xs flex items-center gap-1.5">
              <FileText size={14} className="text-[#059669]" />
              3. Deslinde de Responsabilidad
            </h4>
            <p>
              APANA no es responsable por los acuerdos comerciales, envíos, entregas o calidad de productos comercializados por los usuarios de la plataforma.
            </p>
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-gray-100 flex items-center justify-between gap-3">
          <Link
            href="/terms"
            target="_blank"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#006c49] hover:underline"
          >
            <span>Leer en pantalla completa</span>
            <ExternalLink size={12} />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#006c49] hover:bg-[#005137] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
