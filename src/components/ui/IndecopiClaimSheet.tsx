'use client';

import React from 'react';
import { Printer, Download, ArrowLeft, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface IndecopiClaimData {
  claimCode: string;
  createdAt: number;
  
  // Proveedor
  storeName: string;
  storeLegalName?: string;
  storeTaxIdType?: string;
  storeTaxId?: string;
  storeAddress?: string;
  storePhone?: string;

  // Consumidor
  fullName: string;
  docType: string;
  docNumber: string;
  phone: string;
  email: string;
  address?: string;
  city?: string;
  isMinor?: boolean;
  parentName?: string;

  // Bien
  contractType: string; // 'producto' | 'servicio'
  amount?: string;
  goodDescription: string;

  // Detalle
  claimType: 'reclamo' | 'queja';
  detail: string;
  consumerRequest: string;

  // Respuesta del comercio (si aplica)
  status?: 'pendiente' | 'atendido';
  responseNotes?: string;
  respondedAt?: number;
}

interface Props {
  claim: IndecopiClaimData;
  onClose?: () => void;
  showBackToStore?: boolean;
  storeSlug?: string;
}

export function IndecopiClaimSheet({ claim, onClose, showBackToStore, storeSlug }: Props) {
  const dateObj = new Date(claim.createdAt || Date.now());
  const formattedDay = String(dateObj.getDate()).padStart(2, '0');
  const formattedMonth = String(dateObj.getMonth() + 1).padStart(2, '0');
  const formattedYear = String(dateObj.getFullYear());
  const formattedTime = dateObj.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

  const handlePrint = () => {
    window.print();
  };

  const providerLegalName = claim.storeLegalName || claim.storeName;
  const providerTaxDoc = claim.storeTaxId 
    ? `${claim.storeTaxIdType || 'RUC'}: ${claim.storeTaxId}` 
    : 'No registrado';
  const providerAddress = claim.storeAddress || 'Perú';

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 font-sans text-slate-900">
      {/* Botones de Acción (Ocultos al imprimir) */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>Cerrar</span>
            </button>
          )}
          <div>
            <h2 className="text-sm font-bold text-[#0b1c30]">Hoja Oficial de Reclamación INDECOPI</h2>
            <p className="text-[11px] text-slate-500">Conforme a la Ley N° 29571 y D.S. N° 011-2011-PCM</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="h-10 px-5 bg-[#059669] hover:bg-[#00855d] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Printer size={16} />
            <span>Imprimir / Guardar en PDF</span>
          </button>
        </div>
      </div>

      {/* DOCUMENTO OFICIAL A4 PARA PANTALLA E IMPRESIÓN */}
      <div className="indecopi-print-sheet bg-white p-6 sm:p-10 border border-slate-300 rounded-xl shadow-sm text-[12px] leading-snug print:p-0 print:border-none print:shadow-none print:text-[11px]">
        {/* Estilos específicos de impresión */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body {
              background: #ffffff !important;
              color: #000000 !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .no-print, header, nav, footer, .sidebar {
              display: none !important;
            }
            .indecopi-print-sheet {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 10mm 12mm !important;
              border: none !important;
              box-shadow: none !important;
            }
            @page {
              size: A4 portrait;
              margin: 8mm;
            }
          }
        `}} />

        {/* ENCABEZADO OFICIAL */}
        <div className="border border-slate-800 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Datos del Proveedor */}
          <div className="p-3.5 md:col-span-2 space-y-1">
            <h1 className="text-sm font-extrabold tracking-wide uppercase text-slate-900">
              {claim.storeName}
            </h1>
            <p className="text-[11px] text-slate-700">
              <strong>Titular / Razón Social:</strong> {providerLegalName}
            </p>
            <p className="text-[11px] text-slate-700">
              <strong>Identificación Fiscal:</strong> {providerTaxDoc}
            </p>
            <p className="text-[11px] text-slate-700">
              <strong>Dirección del Establecimiento:</strong> {providerAddress}
            </p>
            {claim.storePhone && (
              <p className="text-[11px] text-slate-700">
                <strong>Teléfono de Contacto:</strong> +{claim.storePhone}
              </p>
            )}
          </div>

          {/* Caja Oficial INDECOPI */}
          <div className="p-3.5 bg-slate-50 md:bg-white flex flex-col justify-center items-center text-center space-y-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-600">
              Libro de Reclamaciones
            </span>
            <span className="text-xs font-extrabold uppercase text-slate-900 border-b border-slate-800 pb-0.5">
              Hoja de Reclamación
            </span>
            <div className="text-[11px] font-mono font-bold pt-1 text-slate-900">
              N° {claim.claimCode}
            </div>
            <div className="text-[10px] text-slate-600 pt-0.5">
              Fecha: <strong>{formattedDay}/{formattedMonth}/{formattedYear}</strong> {formattedTime}
            </div>
          </div>
        </div>

        {/* SECCIÓN 1: IDENTIFICACIÓN DEL CONSUMIDOR RECLAMANTE */}
        <div className="border-x border-b border-slate-800">
          <div className="bg-slate-100 px-3 py-1 font-bold text-[11px] uppercase tracking-wider text-slate-800 border-b border-slate-800">
            1. Identificación del Consumidor Reclamante
          </div>
          <div className="p-3 space-y-1.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <strong>Nombre / Razón Social:</strong> {claim.fullName}
              </div>
              <div>
                <strong>{claim.docType}:</strong> {claim.docNumber}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <strong>Domicilio:</strong> {claim.address || 'No especificado'}, {claim.city || 'Perú'}
              </div>
              <div>
                <strong>Teléfono:</strong> {claim.phone || 'No especificado'}
              </div>
            </div>
            <div>
              <strong>E-mail:</strong> {claim.email}
            </div>
            {claim.isMinor && (
              <div className="pt-1 text-slate-700 border-t border-slate-200 mt-1">
                <strong>Padre, Madre o Representante Legal (en caso de menor):</strong> {claim.parentName || 'No especificado'}
              </div>
            )}
          </div>
        </div>

        {/* SECCIÓN 2: IDENTIFICACIÓN DEL BIEN CONTRATADO */}
        <div className="border-x border-b border-slate-800">
          <div className="bg-slate-100 px-3 py-1 font-bold text-[11px] uppercase tracking-wider text-slate-800 border-b border-slate-800 flex items-center justify-between">
            <span>2. Identificación del Bien Contratado</span>
            <div className="flex items-center gap-4 text-[10px] font-bold">
              <span>
                [{claim.contractType === 'producto' ? 'X' : ' '}] PRODUCTO
              </span>
              <span>
                [{claim.contractType === 'servicio' ? 'X' : ' '}] SERVICIO
              </span>
            </div>
          </div>
          <div className="p-3 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <strong>Descripción del bien:</strong> {claim.goodDescription}
              </div>
              {claim.amount && (
                <div className="shrink-0 bg-slate-50 px-2 py-0.5 rounded border border-slate-300 font-bold">
                  Monto Reclamado: S/ {claim.amount}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: DETALLE DE LA RECLAMACIÓN Y PEDIDO DEL CONSUMIDOR */}
        <div className="border-x border-b border-slate-800">
          <div className="bg-slate-100 px-3 py-1 font-bold text-[11px] uppercase tracking-wider text-slate-800 border-b border-slate-800 flex items-center justify-between">
            <span>3. Detalle de la Reclamación y Pedido del Consumidor</span>
            <div className="flex items-center gap-4 text-[10px] font-bold">
              <span>
                [{claim.claimType === 'reclamo' ? 'X' : ' '}] RECLAMO (1)
              </span>
              <span>
                [{claim.claimType === 'queja' ? 'X' : ' '}] QUEJA (2)
              </span>
            </div>
          </div>
          <div className="p-3 space-y-2.5">
            <div>
              <div className="text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                Detalle de los hechos:
              </div>
              <p className="bg-slate-50/50 p-2.5 rounded border border-slate-300 whitespace-pre-wrap min-h-[60px] leading-relaxed">
                {claim.detail}
              </p>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                Pedido concreto del consumidor:
              </div>
              <p className="bg-slate-50/50 p-2.5 rounded border border-slate-300 whitespace-pre-wrap min-h-[45px] leading-relaxed">
                {claim.consumerRequest}
              </p>
            </div>
          </div>
        </div>

        {/* SECCIÓN 4: ACCIONES ADOPTADAS POR EL PROVEEDOR */}
        <div className="border-x border-b border-slate-800">
          <div className="bg-slate-100 px-3 py-1 font-bold text-[11px] uppercase tracking-wider text-slate-800 border-b border-slate-800 flex items-center justify-between">
            <span>4. Observaciones y Acciones Adoptadas por el Proveedor</span>
            {claim.respondedAt && (
              <span className="text-[10px] text-slate-600 font-semibold">
                Fecha respuesta: {new Date(claim.respondedAt).toLocaleDateString('es-PE')}
              </span>
            )}
          </div>
          <div className="p-3">
            {claim.responseNotes ? (
              <div className="bg-emerald-50/50 border border-emerald-200 p-2.5 rounded text-slate-800 leading-relaxed whitespace-pre-wrap min-h-[50px]">
                {claim.responseNotes}
              </div>
            ) : (
              <div className="border border-dashed border-slate-300 p-2.5 rounded text-slate-400 italic min-h-[50px] flex items-center justify-center text-[11px]">
                (Espacio reservado para la respuesta formal y propuesta de solución del proveedor en un plazo máx. de 15 días hábiles)
              </div>
            )}
          </div>
        </div>

        {/* FIRMAS LEGALES */}
        <div className="border-x border-b border-slate-800 grid grid-cols-2 divide-x divide-slate-800 text-center py-6 px-4 bg-slate-50/30">
          <div className="flex flex-col justify-end items-center px-4">
            <div className="w-48 border-b border-slate-800 mb-1.5"></div>
            <span className="text-[10px] font-bold uppercase text-slate-800">Firma del Consumidor</span>
            <span className="text-[9px] text-slate-500">{claim.fullName}</span>
          </div>

          <div className="flex flex-col justify-end items-center px-4">
            <div className="w-48 border-b border-slate-800 mb-1.5"></div>
            <span className="text-[10px] font-bold uppercase text-slate-800">Firma del Proveedor / Representante</span>
            <span className="text-[9px] text-slate-500">{providerLegalName}</span>
          </div>
        </div>

        {/* NOTAS LEGALES INDECOPI */}
        <div className="pt-3 text-[9px] text-slate-500 space-y-0.5 leading-tight">
          <p>
            <strong>(1) RECLAMO:</strong> Disconformidad relacionada a los productos o servicios expendidos o suministrados.
          </p>
          <p>
            <strong>(2) QUEJA:</strong> Malestar o descontento respecto a la atención al público brindada por el establecimiento comercial.
          </p>
          <p>
            * La formulación del reclamo no excluye el recurso a otros medios de solución de controversias ni es vía previa para presentar una denuncia formal ante el <strong>INDECOPI</strong>.
          </p>
          <p>
            * Conforme a la Ley N° 29571 (Código de Protección y Defensa del Consumidor), el proveedor deberá dar respuesta formal al reclamo en un plazo máximo e improrrogable de <strong>quince (15) días hábiles</strong>.
          </p>
          <p className="pt-1 text-slate-400 text-center">
            Plataforma tecnológica provista por <strong>APANA (beapana.com)</strong>. La atención y responsabilidad legal del presente reclamo corresponde con exclusividad al establecimiento comercial identificado.
          </p>
        </div>
      </div>
    </div>
  );
}
