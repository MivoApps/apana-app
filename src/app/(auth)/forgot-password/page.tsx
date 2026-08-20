'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

import { useAuth } from '@/lib/firebase/auth-context';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  if (authLoading || user) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center text-[#0b1c30] gap-3 font-sans">
        <div className="w-10 h-10 border-4 border-[#059669] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium text-[#6d7a72]">Comprobando sesión...</span>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col justify-center px-4 py-8 relative overflow-hidden">
      {/* Visual background ambient blobs matching Stitch design */}
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

          {sent ? (
            <div className="flex flex-col items-center text-center gap-3 py-4">
              <div className="w-12 h-12 bg-emerald-100 text-[#059669] rounded-full flex items-center justify-center">
                <CheckCircle2 size={28} />
              </div>
              <h2 className="font-semibold text-lg text-[#0b1c30]">Correo enviado</h2>
              <p className="text-sm text-[#3d4a42]">
                Te enviamos un enlace a <span className="font-medium text-[#0b1c30]">{email}</span> para restablecer tu contraseña.
              </p>
              <Link href="/login" className="w-full mt-2">
                <Button variant="primary" fullWidth>
                  Volver al inicio de sesión
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <p className="text-sm text-[#3d4a42]">
                Ingresa el correo electrónico asociado a tu cuenta y te enviaremos instrucciones.
              </p>

              {/* Email Field */}
              <div className="flex flex-col gap-1.5 w-full">
                <label htmlFor="email" className="text-sm font-medium text-[#0b1c30]">
                  Email
                </label>
                <div className="relative w-full group">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3d4a42] group-focus-within:text-[#059669] transition-colors" />
                  <input
                    id="email"
                    type="email"
                    placeholder="nombre@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-12 bg-white border border-[#bccac0] rounded-lg pl-10 pr-4 text-sm text-[#0b1c30] placeholder:text-[#6d7a72] focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" variant="primary" fullWidth disabled={loading} className="mt-2">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enviando...
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
