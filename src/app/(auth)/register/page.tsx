'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';

import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase/config';
import { useAuth } from '@/lib/firebase/auth-context';
import { TermsModal } from '@/components/ui/TermsModal';

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const { logout } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  React.useEffect(() => {
    if (user) {
      setRedirecting(true);
      let isMounted = true;

      // Timeout de seguridad para forzar redirección al dashboard si firestore tarda
      const fallbackTimer = setTimeout(() => {
        if (isMounted) router.replace('/dashboard');
      }, 2500);

      import('@/lib/firebase/firestore').then(async ({ getStoreByUserIdFromFS }) => {
        try {
          const store = await getStoreByUserIdFromFS(user.uid);
          if (isMounted) {
            clearTimeout(fallbackTimer);
            if (store) {
              router.replace('/dashboard');
            } else {
              router.replace('/store/setup');
            }
          }
        } catch {
          if (isMounted) {
            clearTimeout(fallbackTimer);
            router.replace('/dashboard');
          }
        }
      });

      return () => {
        isMounted = false;
        clearTimeout(fallbackTimer);
      };
    }
  }, [user, router]);

  if (redirecting) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center text-[#0b1c30] gap-3 font-sans px-4 text-center">
        <div className="w-10 h-10 border-4 border-[#059669] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium text-[#6d7a72]">Ingresando a tu panel...</span>
        <button
          onClick={() => logout()}
          className="mt-4 text-xs text-slate-400 hover:text-red-500 underline"
        >
          Cerrar sesión e ingresar con otra cuenta
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (password !== confirmPassword) {
      setAuthError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setAuthError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (name.trim()) {
        await updateProfile(userCredential.user, { displayName: name });
      }

      // Guardar perfil de usuario en la colección 'users' de Firestore
      const { createUserProfileInFS } = await import('@/lib/firebase/firestore');
      await createUserProfileInFS({
        uid: userCredential.user.uid,
        name: name.trim() || 'Comerciante APANA',
        email: email.trim(),
        role: 'merchant',
        createdAt: Date.now(),
      });

      // Limpiar cualquier paso viejo del Wizard en localStorage para usuarios nuevos
      localStorage.removeItem('apana_wizard_step');

      // Redirigir al comerciante nuevo al Wizard de "Crear Tienda" (Paso 1)
      window.location.href = '/store/setup';
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setAuthError('El correo electrónico ya está registrado.');
      } else if (err.code === 'auth/invalid-email') {
        setAuthError('Ingresa un correo electrónico válido.');
      } else if (err.code === 'auth/weak-password') {
        setAuthError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setAuthError('Error al crear la cuenta. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setAuthError('');
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      localStorage.clear();

      const { getUserProfileFromFS, createUserProfileInFS, getStoreByUserIdFromFS } = await import('@/lib/firebase/firestore');
      let userProfile = await getUserProfileFromFS(userCredential.user.uid);
      if (!userProfile) {
        const newUserProfile = {
          uid: userCredential.user.uid,
          email: userCredential.user.email || '',
          name: userCredential.user.displayName || 'Comerciante APANA',
          role: 'merchant' as const,
        };
        await createUserProfileInFS(newUserProfile);
        userProfile = newUserProfile as any;
      }

      const existingStore = await getStoreByUserIdFromFS(userCredential.user.uid);

      if (existingStore) {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/store/setup';
      }
    } catch (err: any) {
      console.error('Error al iniciar sesión con Google:', err);
      let errorMsg = 'No se pudo iniciar sesión con Google. Reintenta de nuevo.';
      if (err?.code === 'auth/popup-closed-by-user') {
        errorMsg = 'Inicio de sesión cancelado por el usuario.';
      } else if (err?.code === 'auth/network-request-failed') {
        errorMsg = 'Error de red. Verifica tu conexión de internet.';
      }
      setAuthError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col justify-center px-4 py-8 relative overflow-hidden">
      {/* Visual background ambient blobs matching Login design */}
      <div className="fixed top-0 left-0 w-64 h-64 bg-[#85f8c4]/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-80 h-80 bg-[#6ffbbe]/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <main className="w-full max-w-sm mx-auto flex flex-col items-center gap-6 relative z-10">
        {/* Card Component matching Login design */}
        <div className="w-full bg-white rounded-2xl p-6 border border-[#bccac0]/40 shadow-xs flex flex-col gap-6">
          {/* Header & Logo */}
          <div className="text-center flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1 overflow-hidden shadow-xs">
              <Image
                src="/logo.svg"
                alt="APANA Logo"
                width={56}
                height={56}
                priority
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight">Crea tu cuenta</h1>
            <p className="text-sm text-[#3d4a42]">Empieza a vender por WhatsApp hoy mismo.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl text-center">
                {authError}
              </div>
            )}
            {/* Name Field */}
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="name" className="text-sm font-medium text-[#0b1c30]">
                Nombre
              </label>
              <div className="relative w-full group">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3d4a42] group-focus-within:text-[#059669] transition-colors" />
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full h-12 bg-white border border-[#bccac0] rounded-lg pl-10 pr-4 text-base sm:text-sm text-[#0b1c30] placeholder:text-[#6d7a72] focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition-all"
                />
              </div>
            </div>

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
                  inputMode="email"
                  autoComplete="email"
                  placeholder="nombre@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-12 bg-white border border-[#bccac0] rounded-lg pl-10 pr-4 text-base sm:text-sm text-[#0b1c30] placeholder:text-[#6d7a72] focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="password" className="text-sm font-medium text-[#0b1c30]">
                Contraseña
              </label>
              <div className="relative w-full group">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3d4a42] group-focus-within:text-[#059669] transition-colors" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full h-12 bg-white border border-[#bccac0] rounded-lg pl-10 pr-10 text-base sm:text-sm text-[#0b1c30] placeholder:text-[#6d7a72] focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3d4a42] hover:text-[#059669] p-1 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-[#0b1c30]">
                Confirmar contraseña
              </label>
              <div className="relative w-full group">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3d4a42] group-focus-within:text-[#059669] transition-colors" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full h-12 bg-white border border-[#bccac0] rounded-lg pl-10 pr-10 text-base sm:text-sm text-[#0b1c30] placeholder:text-[#6d7a72] focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3d4a42] hover:text-[#059669] p-1 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" variant="primary" fullWidth disabled={loading} className="mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creando cuenta...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Crear cuenta
                  <ArrowRight size={18} />
                </span>
              )}
            </Button>

            {/* Separador */}
            <div className="relative flex items-center justify-center my-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#bccac0]/40"></div>
              </div>
              <span className="relative px-3 bg-white text-xs text-slate-400 font-medium">O continúa con</span>
            </div>

            {/* Google Sign In Button */}
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              variant="secondary"
              fullWidth
              disabled={loading}
              className="h-12 border border-[#bccac0]/60 text-slate-700 font-bold bg-white hover:bg-slate-50 flex items-center justify-center gap-2.5 rounded-lg shadow-2xs transition-colors"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              Google
            </Button>
          </form>
        </div>

        {/* Footer Login Prompt & Terms */}
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-[#0b1c30]">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="font-semibold text-[#059669] hover:underline">
              Iniciar sesión
            </Link>
          </p>

          <p className="text-[11px] text-slate-400 max-w-xs leading-tight">
            Al registrarte, declaras bajo juramento la titularidad de tu información y aceptas nuestros{' '}
            <button
              type="button"
              onClick={() => setIsTermsOpen(true)}
              className="text-[#059669] underline font-medium hover:text-[#006c49]"
            >
              Términos, Condiciones y Declaración Jurada
            </button>
            .
          </p>
        </div>
      </main>

      {/* Modal de Términos y Condiciones */}
      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </div>
  );
}
