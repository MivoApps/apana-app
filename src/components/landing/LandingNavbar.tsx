'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Menu, X, Sparkles, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/firebase/auth-context';

export const LandingNavbar: React.FC = () => {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || mobileMenuOpen
          ? 'bg-white/85 backdrop-blur-xl shadow-xs border-b border-[#bccac0]/30 py-1'
          : 'bg-white/40 sm:bg-transparent backdrop-blur-xs border-b border-transparent py-2'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo Lockup */}
        <Link
          href="/"
          onClick={(e) => {
            if (typeof window !== 'undefined' && window.location.pathname === '/') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="flex items-center group transition-transform hover:opacity-90 cursor-pointer"
        >
          <Image
            src="/logo_lockup.svg"
            alt="APANA"
            width={145}
            height={32}
            priority
            className="h-8 sm:h-9 w-auto object-contain"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-white/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-200/60 shadow-2xs text-xs font-semibold text-[#3d4a42]">
          <a
            href="/#como-funciona"
            className="px-3.5 py-1.5 rounded-full hover:text-[#059669] hover:bg-emerald-50/60 transition-all cursor-pointer"
          >
            Cómo funciona
          </a>
          <a
            href="/#simulador"
            className="px-3.5 py-1.5 rounded-full hover:text-[#059669] hover:bg-emerald-50/60 transition-all cursor-pointer flex items-center gap-1"
          >
            <Sparkles size={12} className="text-[#059669]" />
            <span>Simulador</span>
          </a>
          <a
            href="/#funciones"
            className="px-3.5 py-1.5 rounded-full hover:text-[#059669] hover:bg-emerald-50/60 transition-all cursor-pointer"
          >
            Funciones
          </a>
          <a
            href="/#planes"
            className="px-3.5 py-1.5 rounded-full hover:text-[#059669] hover:bg-emerald-50/60 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Planes</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
          </a>
          <a
            href="/#preguntas"
            className="px-3.5 py-1.5 rounded-full hover:text-[#059669] hover:bg-emerald-50/60 transition-all cursor-pointer"
          >
            Preguntas
          </a>
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/s/panaderia-don-jose"
            target="_blank"
            className="text-xs font-semibold text-[#059669] hover:bg-[#059669]/10 px-3.5 py-2 rounded-xl border border-[#059669]/25 transition-all flex items-center gap-1.5"
          >
            <Sparkles size={14} />
            <span>Demo en Vivo</span>
          </Link>
          <Link href={user ? '/dashboard' : '/login'}>
            <Button
              variant="primary"
              size="md"
              className="font-bold shadow-md shadow-[#059669]/20 hover:shadow-lg hover:shadow-[#059669]/30 transition-all flex items-center gap-1.5 text-xs rounded-xl px-4 py-2"
            >
              {user ? (
                <>
                  <LayoutDashboard size={15} />
                  <span>Ir a mi Panel</span>
                </>
              ) : (
                <>
                  <span>Ingresar como emprendedor</span>
                  <ArrowRight size={15} />
                </>
              )}
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="md:hidden p-2 rounded-xl text-[#0b1c30] hover:bg-black/5 active:bg-black/10 transition-colors cursor-pointer touch-manipulation relative z-50 select-none"
          aria-label="Abrir menú de navegación"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-xl border-b border-[#bccac0]/30 px-6 py-6 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-4 text-base font-medium text-[#0b1c30]">
            <a
              href="/#como-funciona"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#059669] transition-colors"
            >
              Cómo funciona
            </a>
            <a
              href="/#simulador"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#059669] transition-colors flex items-center gap-1.5"
            >
              <Sparkles size={16} className="text-[#059669]" />
              <span>Simulador de Tienda</span>
            </a>
            <a
              href="/#funciones"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#059669] transition-colors"
            >
              Funcionalidades
            </a>
            <a
              href="/#planes"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#059669] transition-colors flex items-center justify-between"
            >
              <span>Planes y Precios</span>
              <span className="text-xs bg-[#059669]/10 text-[#059669] font-bold px-2 py-0.5 rounded-full">
                Gratis y Pro
              </span>
            </a>
            <a
              href="/#preguntas"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#059669] transition-colors"
            >
              Preguntas Frecuentes
            </a>

            <div className="pt-4 border-t border-[#bccac0]/20 flex flex-col gap-3">
              <Link
                href="/s/panaderia-don-jose"
                target="_blank"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center text-sm font-semibold text-[#059669] bg-[#059669]/10 py-3 rounded-xl border border-[#059669]/20"
              >
                Ver Tienda Demo Pública
              </Link>
              <Link
                href={user ? '/dashboard' : '/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full"
              >
                <Button variant="primary" fullWidth size="lg" className="h-12 font-bold flex items-center justify-center gap-2 rounded-xl">
                  {user ? (
                    <>
                      <LayoutDashboard size={18} />
                      <span>Ir a mi Panel</span>
                    </>
                  ) : (
                    <>
                      <span>Ingresar como emprendedor</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
