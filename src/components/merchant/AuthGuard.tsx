'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';

// Rutas públicas que no requieren autenticación
const PUBLIC_PATHS = ['/', '/login', '/register', '/forgot-password', '/store-not-found', '/terms'];

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicStorePath = pathname.startsWith('/s/');
  const isPublicDynamicQrPath = pathname.startsWith('/r/') || (pathname.startsWith('/qr/') && pathname !== '/qr');
  const isPublicPath = PUBLIC_PATHS.includes(pathname) || isPublicStorePath || isPublicDynamicQrPath;

  useEffect(() => {
    if (!loading && !user && !isPublicPath) {
      router.push('/login');
    }
  }, [user, loading, isPublicPath, router]);

  if (!isPublicPath) {
    if (loading || !user) {
      return (
        <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#059669] border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
  }

  return <>{children}</>;
};
