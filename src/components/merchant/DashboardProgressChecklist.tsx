'use client';

import React from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Plus, 
  ShieldCheck, 
  Mail, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  PartyPopper,
  ExternalLink
} from 'lucide-react';
import { User, sendEmailVerification } from 'firebase/auth';
import { Store, Product } from '@/types/store';

interface Props {
  user: User | null;
  store: Store | null;
  products: Product[];
  onOpenVerifyModal: () => void;
  onResendEmail: () => Promise<void>;
  isResendingEmail: boolean;
}

export const DashboardProgressChecklist: React.FC<Props> = ({
  user,
  store,
  products,
  onOpenVerifyModal,
  onResendEmail,
  isResendingEmail
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [showCelebration, setShowCelebration] = React.useState(false);
  const [isFullyDismissed, setIsFullyDismissed] = React.useState(false);

  // 1. Validar los 4 pasos esenciales
  const step1StoreCreated = Boolean(store?.name && store?.slug);
  const step2EmailVerified = Boolean(user?.emailVerified);
  const step3Whatsapp = Boolean(store?.whatsappPhone && store?.isWhatsappVerified);
  const step4Product = products.length > 0;

  const completedCount = [
    step1StoreCreated, 
    step2EmailVerified, 
    step3Whatsapp, 
    step4Product
  ].filter(Boolean).length;

  const totalSteps = 4;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);
  const isComplete = completedCount === totalSteps;

  // Manejo de animación de celebración cuando se completan los 4 pasos
  React.useEffect(() => {
    if (isComplete && !isFullyDismissed) {
      setShowCelebration(true);
      const timer = setTimeout(() => {
        setIsFullyDismissed(true);
      }, 4500); // 4.5 segundos de celebración con fade-out elegante
      return () => clearTimeout(timer);
    }
  }, [isComplete, isFullyDismissed]);

  if (isFullyDismissed) return null;

  // Modal / Card de Celebración Festiva
  if (showCelebration) {
    return (
      <div className="bg-linear-to-r from-emerald-600 via-[#059669] to-teal-700 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/15 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10 text-center sm:text-left flex-col sm:flex-row">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shrink-0 shadow-lg text-2xl animate-bounce">
            🎉
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="font-black text-lg sm:text-xl text-white tracking-tight">
                ¡Felicitaciones! Tu tienda está 100% activa
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1">
              Has completado todos los pasos iniciales. Tu tienda ya está lista para recibir pedidos por WhatsApp. 🚀
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
          <span className="text-xs font-black bg-white text-emerald-900 px-4 py-2 rounded-xl shadow-xs">
            100% Completado ✨
          </span>
        </div>
      </div>
    );
  }

  const steps = [
    {
      id: 1,
      title: 'Crear tu tienda online',
      completed: step1StoreCreated,
      actionText: 'Listo',
      href: null,
      onClick: null,
      description: 'Nombre comercial y enlace único asignado.',
    },
    {
      id: 2,
      title: 'Confirmar tu correo electrónico',
      completed: step2EmailVerified,
      actionText: step2EmailVerified ? 'Verificado' : (isResendingEmail ? 'Enviando...' : 'Reenviar confirmación'),
      href: null,
      onClick: step2EmailVerified ? null : onResendEmail,
      description: user?.email ? `Enviado a ${user.email} (revisa bandeja/spam)` : 'Protege y asegura tu cuenta de comerciante.',
    },
    {
      id: 3,
      title: 'Conectar tu WhatsApp de pedidos',
      completed: step3Whatsapp,
      actionText: step3Whatsapp ? 'Conectado' : (store?.whatsappPhone ? 'Verificar línea' : 'Conectar WhatsApp'),
      href: null,
      onClick: step3Whatsapp ? null : onOpenVerifyModal,
      description: 'Tus clientes te enviarán el pedido listo para despachar.',
    },
    {
      id: 4,
      title: 'Subir tu primer producto',
      completed: step4Product,
      actionText: step4Product ? `${products.length} productos` : 'Agregar producto',
      href: step4Product ? null : '/products/new',
      onClick: null,
      description: 'Sube fotos claras, precio y variantes de tu producto.',
    },
  ];

  return (
    <div className="bg-linear-to-b from-[#0b1c30] to-[#071220] rounded-3xl p-5 sm:p-6 text-white border border-slate-700/80 shadow-lg relative overflow-hidden animate-in fade-in duration-300">
      {/* Fondo sutil con brillo esmeralda */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Cabecera del Checklist */}
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                Primeros pasos para activar tu tienda
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30">
                {progressPercent}% Completado
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Completa estos 4 pasos para empezar a recibir pedidos por WhatsApp hoy mismo.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer shrink-0"
          title={isCollapsed ? 'Desplegar' : 'Minimizar'}
        >
          {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      {/* Barra de Progreso Visual */}
      <div className="w-full bg-slate-800 rounded-full h-2 mt-4 overflow-hidden relative z-10">
        <div 
          className="bg-linear-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.max(progressPercent, 8)}%` }}
        />
      </div>

      {/* Lista de Pasos */}
      {!isCollapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 relative z-10">
          {steps.map((s) => (
            <div
              key={s.id}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                s.completed
                  ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                  : 'bg-slate-800/80 border-slate-700/80 hover:border-emerald-500/50 text-white shadow-xs'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0">
                  {s.completed ? (
                    <CheckCircle2 size={18} className="text-emerald-400" />
                  ) : (
                    <Circle size={18} className="text-slate-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className={`text-xs font-bold ${s.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                    {s.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug truncate sm:whitespace-normal">
                    {s.description}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                {s.completed ? (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Listo
                  </span>
                ) : s.href ? (
                  <Link href={s.href} className="w-full sm:w-auto">
                    <button
                      type="button"
                      className="w-full sm:w-auto px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>{s.actionText}</span>
                      <ArrowRight size={13} />
                    </button>
                  </Link>
                ) : s.onClick ? (
                  <button
                    type="button"
                    onClick={s.onClick}
                    disabled={isResendingEmail}
                    className="w-full sm:w-auto px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span>{s.actionText}</span>
                    <ArrowRight size={13} />
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
