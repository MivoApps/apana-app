'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/firebase/auth-context';
import { useRouter } from 'next/navigation';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  if (authLoading || user) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center text-[#0b1c30] gap-3 font-sans">
        <div className="w-10 h-10 border-4 border-[#059669] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium text-[#6d7a72]">Comprobando sesión...</span>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      setSent(true);
      setCooldown(60); // 60 segundos de espera para reintentar
    } catch (err: any) {
      console.error('Error al enviar restablecimiento de contraseña:', err);
      const code = err?.code;
      if (code === 'auth/user-not-found') {
        setErrorMsg('No encontramos ninguna cuenta registrada con este correo.');
      } else if (code === 'auth/invalid-email') {
        setErrorMsg('El formato del correo electrónico no es válido.');
      } else if (code === 'auth/too-many-requests') {
        setErrorMsg('Demasiados intentos. Por favor espera unos minutos antes de intentar de nuevo.');
      } else {
        setErrorMsg('Ocurrió un error al enviar las instrucciones. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    setLoading(true);
    setErrorMsg('');
    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      setCooldown(60);
    } catch (err: any) {
      console.error('Error al reenviar:', err);
      setErrorMsg('No se pudo reenviar el correo en este momento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col justify-center px-4 py-8 relative overflow-hidden">
      {/* Visual background ambient blobs */}
      <div className="fixed top-0 left-0 w-64 h-64 bg-[#85f8c4]/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-80 h-80 bg-[#6ffbbe]/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <main className="w-full max-w-sm mx-auto flex flex-col items-center gap-6 relative z-10">
        <div className="w-full bg-white rounded-2xl p-6 border border-[#bccac0]/40 shadow-xs flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Link href="/login" className="p-2 rounded-full hover:bg-gray-100 text-[#0b1c30] transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold text-[#0b1c30] tracking-tight">Recuperar Contraseña</h1>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {sent ? (
            <div className="flex flex-col items-center text-center gap-3 py-3 animate-in fade-in">
              <div className="w-14 h-14 bg-emerald-100 text-[#059669] rounded-2xl flex items-center justify-center shadow-xs">
                <CheckCircle2 size={32} />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="font-bold text-lg text-[#0b1c30]">Correo de recuperación enviado</h2>
                <p className="text-xs text-[#3d4a42] leading-relaxed">
                  Hemos enviado un enlace seguro a <strong className="text-[#0b1c30]">{email}</strong> para restablecer tu contraseña.
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  💡 Si no lo encuentras en unos minutos, revisa tu carpeta de <strong>Spam</strong> o <strong>Correos no deseados</strong>.
                </p>
              </div>

              <div className="w-full flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || loading}
                  className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  <span>
                    {cooldown > 0 ? `Reenviar en ${cooldown}s` : '¿No llegó? Reenviar correo'}
                  </span>
                </button>

                <Link href="/login" className="w-full">
                  <Button variant="primary" fullWidth>
                    Volver al inicio de sesión
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <p className="text-xs text-[#3d4a42] leading-relaxed">
                Ingresa el correo electrónico asociado a tu cuenta de APANA y te enviaremos un enlace seguro para crear una nueva contraseña.
              </p>

              {/* Email Field */}
              <div className="flex flex-col gap-1.5 w-full">
                <label htmlFor="email" className="text-sm font-semibold text-[#0b1c30]">
                  Correo Electrónico
                </label>
                <div className="relative w-full group">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3d4a42] group-focus-within:text-[#059669] transition-colors" />
                  <input
                    id="email"
                    type="email"
                    placeholder="ejemplo@tutienda.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full h-12 bg-white border border-[#bccac0]/60 rounded-xl pl-10 pr-4 text-sm text-[#0b1c30] placeholder:text-[#6d7a72]/60 focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" variant="primary" fullWidth disabled={loading} className="mt-1">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enviando enlace...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Enviar Instrucciones
                    <Send size={16} />
                  </span>
                )}
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
