'use client';

import React from 'react';
import Link from 'next/link';
import {
  Home,
  Package,
  Settings,
  Scale,
  Crown,
  ExternalLink,
  LogOut,
  ShieldCheck,
  Store as StoreIcon,
  Sparkles,
  Palette,
} from 'lucide-react';
import { Store } from '@/types/store';
import { isSuperAdminEmail } from '@/lib/auth-helpers';

interface MerchantSidebarProps {
  currentPath: 'dashboard' | 'products' | 'settings' | 'claims' | 'plans' | 'admin' | 'editor' | string;
  store: Store | null;
  userEmail?: string | null;
  onLogout: () => void;
  onNavigate?: (e: React.MouseEvent, href: string) => void;
}

export const MerchantSidebar: React.FC<MerchantSidebarProps> = ({
  currentPath,
  store,
  userEmail,
  onLogout,
  onNavigate,
}) => {
  const storeSlug = store?.slug || '';
  const storeName = store?.name || 'Mi Tienda';
  const plan = store?.plan || 'gratis';
  const isSuperAdmin = isSuperAdminEmail(userEmail);

  const navItems = [
    { id: 'dashboard', href: '/dashboard', label: 'Inicio', icon: Home },
    { id: 'products', href: '/products', label: 'Productos', icon: Package },
    { id: 'editor', href: '/store/editor', label: 'Diseño de Tienda', icon: Palette, badge: 'Nuevo' },
    { id: 'settings', href: '/settings', label: 'Ajustes', icon: Settings },
    { id: 'claims', href: '/claims', label: 'Libro Reclamaciones', icon: Scale },
    { id: 'plans', href: '/plans', label: 'Planes & Beneficios', icon: Crown },
  ];

  if (isSuperAdmin) {
    navItems.push({ id: 'admin', href: '/admin', label: 'SuperAdmin', icon: ShieldCheck });
  }

  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    if (onNavigate) {
      onNavigate(e, href);
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#bccac0]/30 min-h-screen fixed top-0 bottom-0 left-0 z-40 p-4 justify-between shadow-xs select-none">
      <div className="flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-1">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#059669] to-[#006c49] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <span className="font-black text-lg tracking-tight">A</span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-[#0b1c30] leading-none">
                APANA
              </span>
              <span className="text-[10px] text-[#6d7a72] font-semibold tracking-wider uppercase mt-0.5">
                Panel Comercio
              </span>
            </div>
          </Link>

          <span
            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
              plan === 'negocio'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : plan === 'emprendedor'
                ? 'bg-emerald-100 text-[#059669] border border-emerald-200'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {plan === 'negocio' ? 'Pro' : plan === 'emprendedor' ? 'Plus' : 'Gratis'}
          </span>
        </div>

        {/* Store Card / Identity Pill */}
        {store && (
          <div className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200/80 flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                style={store.logoUrl ? undefined : { backgroundColor: store.primaryColor || '#059669' }}
                className="w-9 h-9 rounded-xl overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs text-white shadow-2xs border border-slate-200/70"
              >
                {store.logoUrl ? (
                  <img src={store.logoUrl} alt={storeName} className="w-full h-full object-cover" />
                ) : (
                  <span>{storeName.substring(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold text-[#0b1c30] truncate">{storeName}</span>
                <span className="text-[10px] text-[#6d7a72] font-mono truncate">/s/{storeSlug}</span>
              </div>
            </div>

            {storeSlug && (
              <a
                href={`/s/${storeSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-8 px-2.5 bg-white hover:bg-emerald-50 text-[#006c49] border border-emerald-200/80 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                title="Abrir tu tienda online en una pestaña nueva"
              >
                <span>Ver Tienda Online</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">
            Menú Principal
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={(e) => handleLinkClick(e, item.href)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#059669] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#0b1c30] hover:bg-slate-100/80'
                }`}
              >
                <Icon size={17} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md tracking-tight ${
                      isActive ? 'bg-white text-emerald-800' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Section */}
      <div className="flex flex-col gap-3 pt-3 border-t border-slate-100">
        {/* Trial / Upgrade Banner (si es plan gratis) */}
        {plan === 'gratis' && (
          <Link
            href="/plans"
            onClick={(e) => handleLinkClick(e, '/plans')}
            className="p-3 rounded-xl bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 text-emerald-950 flex flex-col gap-1 group hover:border-[#059669] transition-all"
          >
            <div className="flex items-center gap-1 text-[11px] font-extrabold text-[#006c49]">
              <Sparkles size={13} className="text-amber-500" />
              <span>Prueba 30 Días Gratis</span>
            </div>
            <p className="text-[10px] text-slate-600 leading-tight">
              Desbloquea productos ilimitados, fotos extra y métricas.
            </p>
          </Link>
        )}

        {/* User Account & Logout */}
        <div className="flex items-center justify-between px-1">
          <div className="flex flex-col min-w-0 pr-2">
            <span className="text-[11px] font-bold text-[#0b1c30] truncate">
              {userEmail || 'Comercio'}
            </span>
            <span className="text-[10px] text-[#6d7a72]">Sesión activa</span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            title="Cerrar sesión"
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
