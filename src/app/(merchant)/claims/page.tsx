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
  Printer
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

export default function MerchantClaimsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [claims, setClaims] = useState<ReclamacionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'todos' | 'pendiente' | 'atendido'>('todos');
  
  // Modal de Detalle y Respuesta
  const [selectedClaim, setSelectedClaim] = useState<ReclamacionItem | null>(null);
  const [responseNotes, setResponseNotes] = useState('');
  const [isSavingResponse, setIsSavingResponse] = useState(false);

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
          const claimsList = await getStoreReclamacionesFromFS(storeFromFS.id);
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

  // Cálculo de plazo legal (15 días hábiles = aprox 21 días calendario)
  const calculateDaysLeft = (createdAt: number, deadlineAt?: number) => {
    const deadline = deadlineAt || (createdAt + 21 * 24 * 60 * 60 * 1000);
    const now = Date.now();
    const diffMs = deadline - now;
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) {
      return { days: 0, label: `Vencido (${Math.abs(daysLeft)}d)`, color: 'text-red-600 bg-red-50 border-red-200' };
    }
    if (daysLeft <= 5) {
      return { days: daysLeft, label: `${daysLeft} días restantes (Urgente)`, color: 'text-amber-700 bg-amber-50 border-amber-300' };
    }
    return { days: daysLeft, label: `${daysLeft} días restantes`, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  };

  const handleUpdateStatus = async (status: 'pendiente' | 'atendido') => {
    if (!selectedClaim) return;
    setIsSavingResponse(true);
    try {
      await updateReclamacionStatusInFS(selectedClaim.id, status, responseNotes);
      
      // Actualizar estado local
      setClaims((prev) =>
        prev.map((c) =>
          c.id === selectedClaim.id
            ? { ...c, status, responseNotes, respondedAt: Date.now() }
            : c
        )
      );
      setSelectedClaim((prev) => (prev ? { ...prev, status, responseNotes, respondedAt: Date.now() } : null));
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
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans pb-20">
      {/* Header Fijo */}
      <header className="sticky top-0 z-40 bg-[#f8f9ff]/90 backdrop-blur-xl border-b border-[#bccac0]/20">
        <div className="h-14 flex items-center justify-between px-4 max-w-4xl mx-auto">
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
                  {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
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
              <span>Ver mi Libro Público</span>
              <ExternalLink size={13} />
            </Link>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl w-full mx-auto px-4 pt-6 flex flex-col gap-6">
        
        {/* Banner Legal Informativo */}
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
            href="/settings"
            className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl transition-colors border border-emerald-200 shrink-0 whitespace-nowrap"
          >
            Configurar RUC / Datos Legales →
          </Link>
        </div>

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
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${daysInfo.color}`}>
                        {daysInfo.label}
                      </span>
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

      {/* Modal de Detalle Completo y Respuesta */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-7 shadow-2xl border border-slate-200 flex flex-col gap-5 animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {selectedClaim.claimCode}
                  </span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    selectedClaim.claimType === 'reclamo' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                  }`}>
                    {selectedClaim.claimType}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#0b1c30] mt-1">
                  Hoja de Reclamación Virtual
                </h3>
              </div>
              <button
                onClick={() => setSelectedClaim(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
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
                    {isSavingResponse ? 'Guardando...' : 'Marcar como Atendido'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
