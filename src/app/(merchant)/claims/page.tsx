'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  MessageCircle,
  FileText,
  User,
  Phone,
  Mail,
  Calendar,
  Building2,
  X,
  Send,
  Printer,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/firebase/auth-context';
import { 
  getStoreByUserIdFromFS, 
  getStoreReclamacionesFromFS, 
  updateReclamacionStatusInFS, 
  ReclamacionItem 
} from '@/lib/firebase/firestore';
import { Store } from '@/types/store';
import { MerchantSidebar } from '@/components/merchant/MerchantSidebar';
import { IndecopiClaimSheet, IndecopiClaimData } from '@/components/ui/IndecopiClaimSheet';

function RemainingDaysBadge({ 
  daysInfo 
}: { 
  daysInfo: { days: number; label: string; color: string } 
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md border cursor-pointer select-none transition-all shadow-2xs hover:brightness-95 active:scale-95 ${daysInfo.color}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={(e) => {
          e.stopPropagation();
          setShowTooltip((prev) => !prev);
        }}
        title="Ver cálculo oficial de días hábiles INDECOPI"
      >
        <span>{daysInfo.label}</span>
        <HelpCircle size={12} className="shrink-0 opacity-80 hover:opacity-100" />
      </button>

      {showTooltip && (
        <div
          className="absolute bottom-full left-0 mb-2 z-50 w-72 p-3 bg-slate-900/95 text-white text-[11px] leading-relaxed rounded-xl shadow-2xl border border-slate-700 backdrop-blur-xs animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5 font-bold text-amber-300 pb-1 border-b border-slate-800">
            <span>⚖️ Plazo Legal INDECOPI (15 Días Hábiles)</span>
          </div>
          <p className="mt-1.5 text-slate-200">
            Conforme al <strong>D.S. 011-2011-PCM</strong>, el conteo legal se realiza <strong>únicamente en días hábiles</strong> (lunes a viernes).
          </p>
          <div className="mt-1.5 p-2 rounded-lg bg-slate-800/80 text-[10px] text-slate-300 space-y-1">
            <p>• <strong>Lunes a Viernes:</strong> Se descuenta 1 día al culminar cada jornada laboral.</p>
            <p>• <strong>Sábados, Domingos y Feriados:</strong> No se descuentan días (el conteo queda pausado).</p>
          </div>
          {/* Triángulo indicador */}
          <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-slate-900/95" />
        </div>
      )}
    </div>
  );
}

export default function MerchantClaimsPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [claims, setClaims] = useState<ReclamacionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'todos' | 'pendiente' | 'atendido'>('todos');

  const handleLogout = async () => {
    sessionStorage.clear();
    localStorage.clear();
    await logout();
    window.location.href = '/login';
  };
  
  // Modal de Detalle y Respuesta
  const [selectedClaim, setSelectedClaim] = useState<ReclamacionItem | null>(null);
  const [responseNotes, setResponseNotes] = useState('');
  const [isSavingResponse, setIsSavingResponse] = useState(false);

  // Modal de Impresión / Guardado en PDF Hoja Oficial INDECOPI
  const [printClaimData, setPrintClaimData] = useState<IndecopiClaimData | null>(null);

  const handleOpenPrintForClaim = (claim: ReclamacionItem) => {
    if (!store) return;
    setPrintClaimData({
      claimCode: claim.claimCode,
      createdAt: claim.createdAt,
      storeName: store.name,
      storeLegalName: store.legalBusinessName || store.name,
      storeTaxIdType: store.legalTaxIdType || 'RUC',
      storeTaxId: store.legalTaxId || '',
      storeAddress: store.legalAddress || store.city || 'Perú',
      storePhone: store.whatsappPhone || '',
      fullName: claim.fullName,
      docType: claim.docType,
      docNumber: claim.docNumber,
      phone: claim.phone,
      email: claim.email,
      address: claim.address,
      city: claim.city,
      isMinor: claim.isMinor,
      parentName: claim.parentName,
      contractType: claim.contractType,
      amount: claim.amount,
      goodDescription: claim.goodDescription,
      claimType: claim.claimType,
      detail: claim.detail,
      consumerRequest: claim.consumerRequest,
      status: claim.status,
      responseNotes: claim.responseNotes,
      respondedAt: claim.respondedAt,
    });
  };

  const isStoreLegalConfigured = Boolean(
    store?.legalTaxId &&
    store.legalTaxId.trim().length > 0 &&
    store?.legalBusinessName &&
    store.legalBusinessName.trim().length > 0 &&
    store?.legalAddress &&
    store.legalAddress.trim().length > 0
  );

  const handleOpenBlankSheet = () => {
    if (!store) return;
    if (!isStoreLegalConfigured) {
      alert('Debes registrar tu DNI o RUC y dirección comercial en Ajustes > Legal antes de generar la Hoja Oficial membretada.');
      router.push('/settings?tab=legal');
      return;
    }
    const year = new Date().getFullYear();
    const storePrefix = (store.slug || 'TIENDA').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    setPrintClaimData({
      claimCode: `LR-${storePrefix}-${year}-______`,
      createdAt: Date.now(),
      storeName: store.name,
      storeLegalName: store.legalBusinessName || store.name,
      storeTaxIdType: store.legalTaxIdType || 'RUC',
      storeTaxId: store.legalTaxId || '',
      storeAddress: store.legalAddress || store.city || 'Perú',
      storePhone: store.whatsappPhone || '',
      fullName: '____________________________________________________',
      docType: 'DNI / CE',
      docNumber: '____________',
      phone: '____________',
      email: '______________________________',
      address: '____________________________________________________',
      city: '____________________',
      contractType: 'producto',
      goodDescription: '____________________________________________________________________________________',
      claimType: 'reclamo',
      detail: '\n\n\n\n',
      consumerRequest: '\n\n',
    });
  };

  useEffect(() => {
    const loadStoreAndClaims = async () => {
      if (authLoading) return;
      if (!user) {
        router.push('/login');
        return;
      }

      setIsLoading(true);
      try {
        const storeFromFS = await getStoreByUserIdFromFS(user.uid);
        if (storeFromFS) {
          setStore(storeFromFS);
          const claimsList = await getStoreReclamacionesFromFS(storeFromFS.id, storeFromFS.slug, user.uid);
          setClaims(claimsList);
        }
      } catch (err) {
        console.error('Error cargando reclamaciones de la tienda:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoreAndClaims();
  }, [user, authLoading, router]);

  // Cálculo exacto de plazo legal (15 días hábiles según Ley N° 29571 / D.S. 011-2011-PCM)
  const calculateDaysLeft = (createdAt: number, _deadlineAt?: number) => {
    // 1. Calcular fecha límite agregando exactamente 15 días hábiles (lunes a viernes)
    const start = new Date(createdAt);
    const deadline = new Date(start);
    let added = 0;
    while (added < 15) {
      deadline.setDate(deadline.getDate() + 1);
      const day = deadline.getDay();
      if (day !== 0 && day !== 6) {
        added++;
      }
    }
    deadline.setHours(23, 59, 59, 999);

    const now = new Date();

    // 2. Si ya pasó la fecha límite
    if (now.getTime() > deadline.getTime()) {
      let cur = new Date(deadline);
      let overdueBusinessDays = 0;
      while (cur.getTime() < now.getTime()) {
        cur.setDate(cur.getDate() + 1);
        const day = cur.getDay();
        if (day !== 0 && day !== 6) {
          overdueBusinessDays++;
        }
      }
      return {
        days: 0,
        label: overdueBusinessDays <= 1 ? 'Vence hoy / Vencido' : `Vencido (${overdueBusinessDays}d hábiles)`,
        color: 'text-red-700 bg-red-50 border-red-200 font-bold',
      };
    }

    // 3. Contar días hábiles restantes desde ahora hasta la fecha límite
    let cur = new Date(now);
    let remainingBusinessDays = 0;
    while (cur.getTime() < deadline.getTime()) {
      cur.setDate(cur.getDate() + 1);
      const day = cur.getDay();
      if (day !== 0 && day !== 6) {
        remainingBusinessDays++;
      }
    }

    if (remainingBusinessDays <= 0) {
      return {
        days: 0,
        label: 'Vence hoy (Urgente)',
        color: 'text-red-700 bg-red-50 border-red-300 font-bold',
      };
    }

    if (remainingBusinessDays <= 3) {
      return {
        days: remainingBusinessDays,
        label: `${remainingBusinessDays} día${remainingBusinessDays > 1 ? 's' : ''} hábil${remainingBusinessDays > 1 ? 'es' : ''} (Urgente)`,
        color: 'text-amber-800 bg-amber-50 border-amber-300 font-bold',
      };
    }

    return {
      days: remainingBusinessDays,
      label: `${remainingBusinessDays} días hábiles restantes`,
      color: 'text-emerald-800 bg-emerald-50 border-emerald-200 font-semibold',
    };
  };

  const handleUpdateStatus = async (status: 'pendiente' | 'atendido') => {
    if (!selectedClaim) return;

    if (status === 'atendido' && !responseNotes.trim()) {
      alert('Por favor describe brevemente la respuesta o solución brindada en el campo de texto antes de formalizar la atención.');
      return;
    }

    setIsSavingResponse(true);
    try {
      await updateReclamacionStatusInFS(selectedClaim.id, status, responseNotes.trim());
      
      let emailDispatched = false;
      if (status === 'atendido') {
        try {
          const res = await fetch('/api/legal/claims/respond', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              claim: {
                ...selectedClaim,
                storeName: store?.name || selectedClaim.storeName || 'Comercio Digital',
                storeLegalName: store?.legalBusinessName || store?.name || selectedClaim.storeName || 'Comercio Digital',
                storeTaxId: store?.legalTaxId || '',
                storeTaxIdType: store?.legalTaxIdType || 'RUC',
                storeAddress: store?.legalAddress || '',
              },
              responseNotes: responseNotes.trim(),
            }),
          });
          const data = await res.json();
          emailDispatched = Boolean(data.success);
        } catch (mailErr) {
          console.error('Error enviando correo de respuesta formal:', mailErr);
        }
      }

      // Actualizar estado local
      setClaims((prev) =>
        prev.map((c) =>
          c.id === selectedClaim.id
            ? { ...c, status, responseNotes: responseNotes.trim(), respondedAt: Date.now() }
            : c
        )
      );
      setSelectedClaim((prev) => (prev ? { ...prev, status, responseNotes: responseNotes.trim(), respondedAt: Date.now() } : null));

      if (status === 'atendido') {
        alert(
          emailDispatched
            ? `✓ Reclamación atendida con éxito. Se ha enviado la respuesta oficial por correo a ${selectedClaim.email}.`
            : `✓ Reclamación guardada como atendida.`
        );
      }
    } catch (err) {
      console.error('Error actualizando reclamación:', err);
      alert('Ocurrió un error al actualizar el estado.');
    } finally {
      setIsSavingResponse(false);
    }
  };

  const handleOpenWhatsAppClient = (claim: ReclamacionItem) => {
    const cleanDigits = claim.phone.replace(/\D/g, '');
    const phoneWithCountry = cleanDigits.startsWith('51') ? cleanDigits : `51${cleanDigits}`;
    const message = `Hola ${claim.fullName}, te saludamos de ${store?.name || 'nuestra tienda'}. Nos comunicamos respecto a tu Hoja de Reclamación N° ${claim.claimCode} registrada en nuestro Libro de Reclamaciones. Queremos darte atención y solución a tu solicitud.`;
    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const filteredClaims = claims.filter((c) => {
    if (filter === 'todos') return true;
    return c.status === filter;
  });

  const pendingCount = claims.filter((c) => c.status === 'pendiente').length;

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex font-sans pb-20">
      {/* Sidebar Fija para Desktop */}
      <MerchantSidebar
        currentPath="claims"
        store={store}
        userEmail={user?.email}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        {/* Header Fijo Móvil */}
        <header className="md:hidden sticky top-0 z-40 bg-[#f8f9ff]/90 backdrop-blur-xl border-b border-[#bccac0]/20">
          <div className="h-14 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="p-1.5 rounded-full hover:bg-gray-100 text-[#0b1c30] transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg text-[#0b1c30]">Libro de Reclamaciones</h1>
                {pendingCount > 0 && (
                  <span className="text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </div>
            </div>
            {store?.slug && (
              <Link
                href={`/s/${store.slug}/libro-de-reclamaciones`}
                target="_blank"
                className="text-xs font-semibold text-[#059669] hover:underline flex items-center gap-1"
              >
                <span>Ver Libro</span>
                <ExternalLink size={13} />
              </Link>
            )}
          </div>
        </header>

        {/* Top Header Desktop */}
        <div className="hidden md:flex items-center justify-between px-6 md:px-8 pt-7 pb-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-[#0b1c30] tracking-tight">Libro de Reclamaciones</h1>
              {!isLoading && (
                pendingCount > 0 ? (
                  <span className="text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full animate-in fade-in">
                    {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="text-xs font-extrabold bg-emerald-100 text-[#059669] border border-emerald-300 px-2.5 py-0.5 rounded-full animate-in fade-in">
                    Al día
                  </span>
                )
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Bandeja de quejas y reclamos oficiales de tus clientes bajo normativa INDECOPI
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleOpenBlankSheet}
              className="h-9 px-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
              title="Descargar hoja membretada en blanco para atención presencial en local o taller"
            >
              <Printer size={14} className="text-slate-500" />
              <span>Hoja Física en Blanco</span>
            </button>

            {store?.slug && (
              <Link
                href={`/s/${store.slug}/libro-de-reclamaciones`}
                target="_blank"
                className="h-9 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#059669] text-xs font-bold transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
              >
                <span>Ver mi Libro Público</span>
                <ExternalLink size={14} />
              </Link>
            )}
          </div>
        </div>

        {/* Main Container */}
        <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 md:px-8 pt-2 flex flex-col gap-6">
        
        {/* Banner Legal Informativo */}
        {isLoading ? (
          <div className="bg-slate-100/70 rounded-2xl p-4 sm:p-5 border border-slate-200/70 shadow-2xs animate-pulse flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-200/80 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-200/80 rounded w-48" />
              <div className="h-3 bg-slate-200/70 rounded w-80 max-w-full" />
            </div>
          </div>
        ) : !isStoreLegalConfigured ? (
          <div className="bg-amber-50/90 rounded-2xl p-4 sm:p-5 border border-amber-300 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle size={20} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-amber-950">Libro de Reclamaciones Inactivo — Requiere Configuración</h2>
                <p className="text-xs text-amber-800 leading-relaxed mt-0.5">
                  Conforme a la <strong>Ley N° 29571 (INDECOPI)</strong>, tu tienda debe registrar su <strong>DNI o RUC y dirección comercial</strong> para emitir y recibir hojas de reclamación válidas y abrir tu tienda a pedidos.
                </p>
              </div>
            </div>
            <Link
              href="/settings?tab=legal"
              className="text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 px-4 py-2.5 rounded-xl transition-all shadow-xs shrink-0 whitespace-nowrap active:scale-95"
            >
              Configurar Datos Fiscales Ahora →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                <BookOpen size={20} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#0b1c30]">Cumplimiento Oficial INDECOPI (Ley N° 29571)</h2>
                <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                  Por ley, tienes un plazo máximo de <strong>15 días hábiles</strong> para responder a las reclamaciones o quejas que tus clientes registren en tu tienda.
                </p>
              </div>
            </div>
            <Link
              href="/settings?tab=legal"
              className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl transition-colors border border-emerald-200 shrink-0 whitespace-nowrap"
            >
              Ver Datos Legales Oficiales →
            </Link>
          </div>
        )}

        {/* Filtros de Pestaña */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setFilter('todos')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'todos'
                ? 'bg-[#059669] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todos ({claims.length})
          </button>
          <button
            onClick={() => setFilter('pendiente')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'pendiente'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pendientes ({claims.filter((c) => c.status === 'pendiente').length})
          </button>
          <button
            onClick={() => setFilter('atendido')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'atendido'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Atendidos ({claims.filter((c) => c.status === 'atendido').length})
          </button>
        </div>

        {/* Listado de Reclamaciones */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-[#059669] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium text-slate-500">Cargando reclamaciones...</span>
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-xs flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={30} />
            </div>
            <h3 className="text-base font-bold text-[#0b1c30]">
              {filter === 'todos' 
                ? 'No tienes reclamaciones registradas' 
                : filter === 'pendiente' 
                ? '¡Estás al día! No tienes reclamos pendientes' 
                : 'Aún no hay reclamos atendidos'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Cuando un cliente registre una disconformidad en el Libro de Reclamaciones de tu tienda, aparecerá aquí con su contador de días para respuesta.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredClaims.map((claim) => {
              const daysInfo = calculateDaysLeft(claim.createdAt, claim.deadlineAt);
              const isPending = claim.status === 'pendiente';

              return (
                <div
                  key={claim.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {claim.claimCode}
                      </span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        claim.claimType === 'reclamo' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                      }`}>
                        {claim.claimType}
                      </span>
                      <RemainingDaysBadge daysInfo={daysInfo} />
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isPending ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {isPending ? '⏳ Pendiente' : '✅ Atendido'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#0b1c30] truncate">
                      {claim.fullName} • {claim.docType} {claim.docNumber}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-1">
                      <strong>Bien:</strong> {claim.goodDescription} {claim.amount ? `(S/ ${claim.amount})` : ''}
                    </p>

                    <p className="text-xs text-slate-500 line-clamp-2 bg-slate-50 p-2 rounded-lg mt-0.5 italic">
                      "{claim.detail}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 justify-end">
                    <button
                      type="button"
                      onClick={() => handleOpenWhatsAppClient(claim)}
                      className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#006c49] font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 border border-emerald-200 cursor-pointer"
                      title="Contactar al cliente por WhatsApp"
                    >
                      <MessageCircle size={14} />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenPrintForClaim(claim)}
                      className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl transition-colors border border-slate-200 cursor-pointer shrink-0"
                      title="Imprimir Hoja de Reclamación INDECOPI"
                    >
                      <Printer size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClaim(claim);
                        setResponseNotes(claim.responseNotes || '');
                      }}
                      className="px-3.5 py-2 bg-[#059669] hover:bg-[#00855d] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Atender Hoja
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      </div>

      {/* Modal de Detalle Completo y Respuesta */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-7 shadow-2xl border border-slate-200 flex flex-col gap-5 animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {selectedClaim.claimCode}
                  </span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    selectedClaim.claimType === 'reclamo' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                  }`}>
                    {selectedClaim.claimType}
                  </span>
                  <RemainingDaysBadge daysInfo={calculateDaysLeft(selectedClaim.createdAt, selectedClaim.deadlineAt)} />
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedClaim.status === 'pendiente' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}>
                    {selectedClaim.status === 'pendiente' ? '⏳ Pendiente' : '✅ Atendido'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#0b1c30] mt-1.5">
                  Hoja de Reclamación Virtual
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenPrintForClaim(selectedClaim)}
                  className="h-8 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Imprimir Hoja Oficial INDECOPI"
                >
                  <Printer size={14} />
                  <span className="hidden sm:inline">Imprimir (PDF)</span>
                </button>
                <button
                  onClick={() => setSelectedClaim(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Datos del Consumidor */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <div className="font-bold text-[#0b1c30] flex items-center gap-1.5 border-b border-slate-200 pb-1">
                <User size={14} className="text-[#059669]" />
                <span>Datos del Consumidor</span>
              </div>
              <p><strong>Nombres y Apellidos:</strong> {selectedClaim.fullName}</p>
              <p><strong>Documento:</strong> {selectedClaim.docType} {selectedClaim.docNumber}</p>
              <p><strong>Teléfono / WhatsApp:</strong> {selectedClaim.phone}</p>
              <p><strong>Correo Electrónico:</strong> {selectedClaim.email}</p>
              {selectedClaim.address && <p><strong>Dirección:</strong> {selectedClaim.address}, {selectedClaim.city}</p>}
              {selectedClaim.isMinor && <p><strong>Padre o Apoderado:</strong> {selectedClaim.parentName}</p>}
            </div>

            {/* Detalle del Reclamo */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-bold block mb-0.5">BIEN O SERVICIO CONTRATADO</span>
                <p className="font-semibold text-slate-800 text-sm">
                  {selectedClaim.goodDescription} {selectedClaim.amount ? `• S/ ${selectedClaim.amount}` : ''}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-0.5">HECHOS RECLAMADOS POR EL CLIENTE</span>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed">
                  {selectedClaim.detail}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-0.5">PEDIDO CONCRETO DEL CONSUMIDOR</span>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed">
                  {selectedClaim.consumerRequest}
                </p>
              </div>
            </div>

            {/* Formulario de Respuesta y Acción de la Tienda */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Respuesta Oficial de la Tienda / Acciones Tomadas
              </label>
              <textarea
                rows={3}
                value={responseNotes}
                onChange={(e) => setResponseNotes(e.target.value)}
                placeholder="Indica la solución brindada (ej. Se coordinó cambio del producto o devolución vía Yape y el cliente quedó conforme)..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] leading-relaxed"
              />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenWhatsAppClient(selectedClaim)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#006c49] font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-emerald-200"
                >
                  <MessageCircle size={15} />
                  <span>Responder por WhatsApp</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {selectedClaim.status === 'atendido' ? (
                    <button
                      type="button"
                      disabled={isSavingResponse}
                      onClick={() => handleUpdateStatus('pendiente')}
                      className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                    >
                      Reabrir Reclamo
                    </button>
                  ) : null}

                  <Button
                    variant="primary"
                    disabled={isSavingResponse}
                    onClick={() => handleUpdateStatus('atendido')}
                    className="h-10 px-5 bg-[#059669] hover:bg-[#00855d] text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    {isSavingResponse ? 'Guardando y notificando...' : 'Guardar y Enviar Respuesta por Correo'}
                  </Button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 text-right">
                Al marcar como atendido, se enviará automáticamente un correo formal al cliente ({selectedClaim.email}) cumpliendo la normativa de INDECOPI.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Hoja Oficial INDECOPI para Impresión y PDF */}
      {printClaimData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-y-auto p-4 sm:p-6 shadow-2xl border border-slate-200">
            <IndecopiClaimSheet 
              claim={printClaimData} 
              onClose={() => setPrintClaimData(null)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
