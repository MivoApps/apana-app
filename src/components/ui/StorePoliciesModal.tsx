'use client';

import React from 'react';
import Link from 'next/link';
import { X, FileText, ShieldCheck, Scale, BookOpen, Building2, Phone, ExternalLink } from 'lucide-react';
import { Store } from '@/types/store';
import { getPolicyTemplateByCategory } from '@/lib/constants/store-policies-templates';

interface StorePoliciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store;
}

export const StorePoliciesModal: React.FC<StorePoliciesModalProps> = ({ isOpen, onClose, store }) => {
  if (!isOpen) return null;

  const defaultTemplate = getPolicyTemplateByCategory(store.category);
  const policiesContent = (store.storePolicies && store.storePolicies.trim().length > 0)
    ? store.storePolicies
    : defaultTemplate.content;
  const isUsingDefault = !store.storePolicies || store.storePolicies.trim().length === 0;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-[#bccac0]/30 flex flex-col max-h-[88vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#006c49] flex items-center justify-center shrink-0">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#0b1c30]">
                Políticas y Condiciones de Compra
              </h3>
              <p className="text-[11px] text-slate-500">
                {store.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors border border-slate-200 cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed font-sans scrollbar-thin">
          
          {/* Card: Identificación del Proveedor (Cumplimiento D.L. 1524 / INDECOPI) */}
          <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-2xl p-3.5 space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#006c49] flex items-center gap-1.5">
                <Building2 size={14} />
                <span>Datos del Comercio / Proveedor</span>
              </span>
              {store.legalTaxId && (
                <span className="bg-emerald-100 text-[#006c49] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Formal Verificado
                </span>
              )}
            </div>
            <div className="text-slate-700 space-y-0.5 pt-0.5">
              <p>
                <strong>Razón Social o Titular:</strong> {store.legalBusinessName || store.name}
              </p>
              {store.legalTaxId ? (
                <p>
                  <strong>{store.legalTaxIdType || 'RUC'}:</strong> <span className="font-mono">{store.legalTaxId}</span>
                </p>
              ) : null}
              {store.legalAddress && (
                <p>
                  <strong>Dirección:</strong> {store.legalAddress}
                </p>
              )}
              {store.city && !store.legalAddress && (
                <p>
                  <strong>Ciudad / Ubicación:</strong> {store.city}, Perú
                </p>
              )}
              {store.whatsappPhone && (
                <p>
                  <strong>Canal de Atención:</strong> +{store.whatsappPhone}
                </p>
              )}
            </div>
          </div>

          {/* Badge de tipo de política */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60">
            <span className="flex items-center gap-1.5">
              <Scale size={13} className="text-[#059669]" />
              <span>Rubro: <strong>{defaultTemplate.categoryLabel}</strong></span>
            </span>
            <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 text-[10px]">
              {defaultTemplate.badge}
            </span>
          </div>

          {/* Contenido de Políticas */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-2xs space-y-3">
            {policiesContent.split('\n\n').map((paragraph, index) => {
              const lines = paragraph.split('\n');
              const firstLine = lines[0];
              const isHeading = /^\d+\.\s+[A-ZÁÉÍÓÚÑ\s/()\-]+$/.test(firstLine.trim()) || firstLine.startsWith('#');

              if (isHeading) {
                return (
                  <div key={index} className="space-y-1.5 pt-1">
                    <h4 className="font-bold text-[#0b1c30] text-xs text-emerald-950 flex items-center gap-1">
                      {firstLine.replace(/^#+\s*/, '')}
                    </h4>
                    {lines.slice(1).map((line, lIdx) => (
                      <p key={lIdx} className="text-slate-600 leading-relaxed text-[11px] sm:text-xs pl-0.5">
                        {line}
                      </p>
                    ))}
                  </div>
                );
              }

              return (
                <p key={index} className="text-slate-600 leading-relaxed text-[11px] sm:text-xs">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Enlaces legales de la tienda y de la plataforma */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-[11px]">
            <Link
              href={`/s/${store.slug}/libro-de-reclamaciones`}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              <BookOpen size={13} />
              <span>Libro de Reclamaciones Oficial de {store.name} ➔</span>
            </Link>
            
            <Link
              href="/terms"
              target="_blank"
              className="text-slate-500 hover:text-slate-700 hover:underline flex items-center gap-1 text-[10px]"
            >
              <span>Términos Plataforma APANA</span>
              <ExternalLink size={10} />
            </Link>
          </div>

          {/* Deslinde de responsabilidad legal de APANA */}
          <p className="text-[10px] text-slate-600 leading-tight bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/50">
            <strong>Aviso de Transparencia:</strong> Esta tienda opera con la infraestructura SaaS provista por APANA (Mivo E.I.R.L. • RUC: 20616379276). La venta, preparación, despacho, facturación y garantías de los productos son de exclusiva responsabilidad de {store.name}.
          </p>

        </div>

        {/* Footer Modal */}
        <div className="px-6 py-3 border-t border-gray-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
