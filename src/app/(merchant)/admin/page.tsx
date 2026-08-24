'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Store as StoreIcon, 
  Package, 
  Crown, 
  Search, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle, 
  PauseCircle, 
  PlayCircle,
  Phone,
  Sparkles,
  Users,
  Zap,
  TrendingUp,
  Sliders,
  LogOut,
  Edit2,
  Trash2,
  X,
  Mail,
  UserCheck,
  Calendar,
  AlertTriangle,
  ChevronDown,
  DollarSign,
  CreditCard,
  Clock,
  MessageCircle,
  PlusCircle,
  QrCode,
  Printer,
  Download,
  Copy,
  Check
} from 'lucide-react';
import QRCode from 'qrcode';
import { useAuth } from '@/lib/firebase/auth-context';
import { 
  getAllStoresForAdminFromFS, 
  adminUpdateStorePlanInFS, 
  adminUpdateStoreStatusInFS, 
  adminCleanSuperAdminStoresInFS,
  adminUpdateStoreDetailsInFS,
  adminDeleteStoreAndProductsFromFS,
  getAllUsersForAdminFromFS,
  adminDeleteUserFromFS,
  getAllPaymentRecordsForAdminFromFS,
  adminExtendStoreSubscriptionInFS,
  AdminStoreItem,
  AdminUserItem,
  PaymentRecord
} from '@/lib/firebase/firestore';

const SUPERADMIN_EMAILS = [
  'angelo@mivo.pe',
  'angelocastellanos99@gmail.com'
];

export default function SuperAdminPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  
  // Estado Principal (3 Pestañas)
  const [activeTab, setActiveTab] = useState<'stores' | 'subscriptions' | 'users'>('stores');
  const [stores, setStores] = useState<AdminStoreItem[]>([]);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  
  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<'todos' | 'gratis' | 'emprendedor'>('todos');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'activa' | 'pausada'>('todos');
  
  // Feedback
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Modales
  const [editingStore, setEditingStore] = useState<AdminStoreItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    slug: '',
    whatsappPhone: '',
    plan: 'gratis' as 'gratis' | 'emprendedor',
    status: 'activa' as 'activa' | 'pausada',
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [deletingStore, setDeletingStore] = useState<AdminStoreItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [deletingUser, setDeletingUser] = useState<AdminUserItem | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Estados para Modal de Sticker QR (5x5 cm)
  const [stickerStore, setStickerStore] = useState<AdminStoreItem | null>(null);
  const [stickerQrUrl, setStickerQrUrl] = useState<string>('');
  const [stickerCopied, setStickerCopied] = useState(false);

  const handleOpenSticker = async (store: AdminStoreItem) => {
    setStickerStore(store);
    const storeUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/s/${store.slug}`
      : `https://bealiados.com/s/${store.slug}`;
    try {
      const url = await QRCode.toDataURL(storeUrl, {
        width: 1024,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: { dark: '#0b1c30', light: '#ffffff' }
      });
      setStickerQrUrl(url);
    } catch (e) {
      console.error('Error generating admin sticker QR:', e);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (user?.uid) {
        await adminCleanSuperAdminStoresInFS(user.uid);
      }
      const [storesData, usersData, paymentsData] = await Promise.all([
        getAllStoresForAdminFromFS(),
        getAllUsersForAdminFromFS(),
        getAllPaymentRecordsForAdminFromFS(),
      ]);
      setStores(storesData);
      setUsers(usersData);
      setPayments(paymentsData);
    } catch (err) {
      console.error('Error al cargar datos de admin:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const userEmail = user.email?.toLowerCase().trim() || '';
    if (!SUPERADMIN_EMAILS.includes(userEmail)) {
      setIsAuthorized(false);
      setIsLoading(false);
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
      return;
    }

    setIsAuthorized(true);
    loadData();
  }, [user, authLoading, router]);

  // Acciones Rápidas
  const handleTogglePlan = async (store: AdminStoreItem) => {
    const nextPlan = store.plan === 'emprendedor' ? 'gratis' : 'emprendedor';
    if (!confirm(`¿Cambiar plan de "${store.name}" a ${nextPlan.toUpperCase()}?`)) return;

    setActionLoadingId(store.id);
    try {
      await adminUpdateStorePlanInFS(store.id, nextPlan);
      setStores((prev) => prev.map((s) => (s.id === store.id ? { ...s, plan: nextPlan } : s)));
      setSuccessMsg(`Plan de "${store.name}" actualizado a ${nextPlan}.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      alert('Error al actualizar el plan.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleStatus = async (store: AdminStoreItem) => {
    const nextStatus = store.status === 'pausada' ? 'activa' : 'pausada';
    if (!confirm(`¿Cambiar estado de "${store.name}" a ${nextStatus.toUpperCase()}?`)) return;

    setActionLoadingId(store.id);
    try {
      await adminUpdateStoreStatusInFS(store.id, nextStatus);
      setStores((prev) => prev.map((s) => (s.id === store.id ? { ...s, status: nextStatus } : s)));
      setSuccessMsg(`Estado de "${store.name}" cambiado a ${nextStatus}.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      alert('Error al actualizar el estado.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Extender Suscripción (+30 días)
  const handleExtendSubscription = async (store: AdminStoreItem, days: number = 30) => {
    setActionLoadingId(store.id);
    try {
      const newExpiry = await adminExtendStoreSubscriptionInFS(store.id, days);
      setStores((prev) =>
        prev.map((s) =>
          s.id === store.id
            ? { ...s, plan: 'emprendedor', subscriptionStatus: 'active', nextBillingDate: newExpiry }
            : s
        )
      );
      const dateStr = new Date(newExpiry).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
      setSuccessMsg(`Suscripción de "${store.name}" extendida +${days} días (Vence: ${dateStr}).`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      alert('Error al extender la suscripción.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Guardar Edición de Tienda
  const handleOpenEdit = (store: AdminStoreItem) => {
    setEditingStore(store);
    const cleanPhone = (store.whatsappPhone || '').replace(/\D/g, '').slice(-9);
    setEditForm({
      name: store.name || '',
      slug: store.slug || '',
      whatsappPhone: cleanPhone,
      plan: (store.plan as any) || 'gratis',
      status: (store.status as any) || 'activa',
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore) return;
    setIsSavingEdit(true);
    try {
      const fullPhone = editForm.whatsappPhone ? `51${editForm.whatsappPhone}` : '';
      await adminUpdateStoreDetailsInFS(editingStore.id, {
        name: editForm.name,
        slug: editForm.slug.toLowerCase().trim().replace(/\s+/g, '-'),
        whatsappPhone: fullPhone,
        plan: editForm.plan,
        status: editForm.status,
      });

      setStores((prev) =>
        prev.map((s) =>
          s.id === editingStore.id
            ? {
                ...s,
                name: editForm.name,
                slug: editForm.slug.toLowerCase().trim().replace(/\s+/g, '-'),
                whatsappPhone: fullPhone,
                plan: editForm.plan,
                status: editForm.status,
              }
            : s
        )
      );

      setEditingStore(null);
      setSuccessMsg(`Datos de la tienda actualizados exitosamente.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      alert('Error guardando cambios de la tienda.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Eliminar Tienda y Productos
  const handleConfirmDeleteStore = async () => {
    if (!deletingStore) return;
    setIsDeleting(true);
    try {
      await adminDeleteStoreAndProductsFromFS(deletingStore.id);
      setStores((prev) => prev.filter((s) => s.id !== deletingStore.id));
      setDeletingStore(null);
      setSuccessMsg(`Tienda y productos eliminados permanentemente.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      alert('Error eliminando la tienda.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Eliminar Usuario
  const handleConfirmDeleteUser = async () => {
    if (!deletingUser) return;
    setIsDeletingUser(true);
    try {
      await adminDeleteUserFromFS(deletingUser.email || deletingUser.uid);
      setUsers((prev) => prev.filter((u) => u.uid !== deletingUser.uid));
      setDeletingUser(null);
      setSuccessMsg(`Usuario eliminado de Firestore.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      alert('Error eliminando usuario.');
    } finally {
      setIsDeletingUser(false);
    }
  };

  // Métricas Globales
  const totalStores = stores.length;
  const totalProStores = stores.filter((s) => s.plan === 'emprendedor').length;
  const totalFreeStores = totalStores - totalProStores;
  const totalActiveStores = stores.filter((s) => s.status !== 'pausada').length;
  const totalProducts = stores.reduce((sum, s) => sum + (s.productCount || 0), 0);
  const totalRegisteredUsers = users.length;
  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Helper de cálculo de días de suscripción
  const getSubscriptionInfo = (store: AdminStoreItem) => {
    if (store.plan !== 'emprendedor') {
      return { label: 'Plan Gratis', color: 'text-slate-400 bg-slate-800 border-slate-700', daysLeft: 0, status: 'free' };
    }
    if (!store.nextBillingDate) {
      return { label: 'Pro (Sin corte)', color: 'text-amber-400 bg-amber-950/60 border-amber-800', daysLeft: 30, status: 'active' };
    }
    const diffMs = store.nextBillingDate - Date.now();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysLeft > 5) {
      return { label: `🟢 Al Día (${daysLeft}d)`, color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800', daysLeft, status: 'active' };
    } else if (daysLeft > 0) {
      return { label: `🟡 Vence en ${daysLeft}d`, color: 'text-amber-400 bg-amber-950/60 border-amber-800', daysLeft, status: 'expiring_soon' };
    } else if (daysLeft >= -3) {
      return { label: `🟠 En Gracia (${Math.abs(daysLeft)}d vencido)`, color: 'text-orange-400 bg-orange-950/60 border-orange-800', daysLeft, status: 'grace_period' };
    } else {
      return { label: `🔴 Vencido (${Math.abs(daysLeft)}d)`, color: 'text-red-400 bg-red-950/60 border-red-800', daysLeft, status: 'expired' };
    }
  };

  // Filtrados
  const filteredStores = stores.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.whatsappPhone && s.whatsappPhone.includes(searchQuery));
    const matchesPlan =
      planFilter === 'todos' ||
      (planFilter === 'emprendedor' && s.plan === 'emprendedor') ||
      (planFilter === 'gratis' && s.plan !== 'emprendedor');
    const matchesStatus =
      statusFilter === 'todos' ||
      (statusFilter === 'activa' && s.status !== 'pausada') ||
      (statusFilter === 'pausada' && s.status === 'pausada');

    return matchesSearch && matchesPlan && matchesStatus;
  });

  const filteredUsers = users.filter((u) => {
    const term = searchQuery.toLowerCase();
    return (
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.storeName && u.storeName.toLowerCase().includes(term)) ||
      (u.storeSlug && u.storeSlug.toLowerCase().includes(term))
    );
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#071220] flex flex-col items-center justify-center text-white gap-3 font-sans">
        <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium text-slate-300">Cargando consola de administración...</span>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-[#071220] flex flex-col items-center justify-center text-white p-6 text-center font-sans gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-800 text-red-400 flex items-center justify-center shadow-lg">
          <ShieldCheck size={36} />
        </div>
        <div className="flex flex-col gap-1 max-w-sm">
          <h2 className="text-xl font-bold text-white">Acceso Restringido (403)</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Esta sección es de uso exclusivo para el propietario de la plataforma APANA ({SUPERADMIN_EMAILS[0]}).
          </p>
        </div>
        <span className="text-[11px] text-slate-500">Redirigiendo a tu panel en unos segundos...</span>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl transition-all border border-slate-700 mt-2"
        >
          Volver a mi Tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071220] text-slate-100 font-sans pb-20">
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-40 bg-[#071220]/90 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-xs">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  SuperAdmin
                </span>
                <span className="text-xs text-slate-400">APANA Core</span>
              </div>
              <h1 className="text-base font-bold text-white tracking-tight">
                Panel del Propietario
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold border border-slate-700"
              title="Refrescar datos"
            >
              <RefreshCw size={14} />
              <span>Refrescar</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-red-200 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <LogOut size={14} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Alerta de Éxito */}
      {successMsg && (
        <div className="max-w-6xl mx-auto px-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 bg-emerald-900/60 border border-emerald-600/60 text-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 pt-6 flex flex-col gap-6">

        {/* 📊 Métricas Globales del SaaS */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* Total Tiendas */}
          <div className="bg-[#0e1e33] border border-slate-800 p-4 rounded-2xl flex flex-col gap-1 shadow-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Total Tiendas</span>
              <StoreIcon size={18} className="text-blue-400" />
            </div>
            <p className="text-2xl font-black text-white mt-1">{totalStores}</p>
            <span className="text-[11px] text-emerald-400 font-medium">
              🟢 {totalActiveStores} activas • {totalStores - totalActiveStores} pausadas
            </span>
          </div>

          {/* Planes Emprendedor */}
          <div className="bg-[#0e1e33] border border-slate-800 p-4 rounded-2xl flex flex-col gap-1 shadow-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Plan Emprendedor</span>
              <Crown size={18} className="text-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-400 mt-1">{totalProStores}</p>
            <span className="text-[11px] text-slate-400 font-medium">
              {totalFreeStores} en Plan Gratis
            </span>
          </div>

          {/* Total Productos */}
          <div className="bg-[#0e1e33] border border-slate-800 p-4 rounded-2xl flex flex-col gap-1 shadow-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Total Productos</span>
              <Package size={18} className="text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-white mt-1">{totalProducts}</p>
            <span className="text-[11px] text-slate-400 font-medium">
              {totalRegisteredUsers} usuarios registrados
            </span>
          </div>

          {/* MRR Estimado y Recaudación */}
          <div className="bg-[#0e1e33] border border-slate-800 p-4 rounded-2xl flex flex-col gap-1 shadow-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">MRR Recaudado</span>
              <TrendingUp size={18} className="text-purple-400" />
            </div>
            <p className="text-2xl font-black text-emerald-400 mt-1">
              S/ {(totalProStores * 19.9).toFixed(2)}
            </p>
            <span className="text-[11px] text-slate-400 font-medium">
              Culqi: {payments.length} cobros procesados
            </span>
          </div>
        </section>

        {/* 📑 Selector de Pestañas (Tiendas vs Suscripciones vs Usuarios) */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('stores')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'stores'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <StoreIcon size={16} />
            <span>Directorio de Tiendas ({stores.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'subscriptions'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <DollarSign size={16} />
            <span>Suscripciones & Cobros ({totalProStores} Pro)</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Users size={16} />
            <span>Usuarios & Comerciantes ({users.length})</span>
          </button>
        </div>

        {/* 🔍 Barra de Búsqueda y Dropdowns 100% Alineados */}
        <section className="bg-[#0e1e33] border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="text"
              placeholder={
                activeTab === 'stores'
                  ? "Buscar por nombre, slug o teléfono..."
                  : activeTab === 'subscriptions'
                  ? "Buscar por tienda o ID de pago Culqi..."
                  : "Buscar por correo, nombre o tienda..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 bg-[#071220] border border-slate-700/80 rounded-xl pl-10 pr-4 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          {activeTab === 'stores' && (
            <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
              {/* Dropdown 1: Plan */}
              <div className="relative flex-1 md:w-44">
                <select
                  value={planFilter}
                  onChange={(e: any) => setPlanFilter(e.target.value)}
                  className="w-full h-11 appearance-none bg-[#071220] border border-slate-700/80 text-xs text-slate-200 rounded-xl pl-3.5 pr-9 focus:outline-none focus:border-emerald-500 font-semibold cursor-pointer"
                >
                  <option value="todos">Todos los Planes</option>
                  <option value="emprendedor">Plan Emprendedor</option>
                  <option value="gratis">Plan Gratis</option>
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Dropdown 2: Estado */}
              <div className="relative flex-1 md:w-44">
                <select
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  className="w-full h-11 appearance-none bg-[#071220] border border-slate-700/80 text-xs text-slate-200 rounded-xl pl-3.5 pr-9 focus:outline-none focus:border-emerald-500 font-semibold cursor-pointer"
                >
                  <option value="todos">Todos los Estados</option>
                  <option value="activa">Tiendas Activas</option>
                  <option value="pausada">Tiendas Pausadas</option>
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          )}
        </section>

        {/* 🏢 TAB 1: DIRECTORIO DE TIENDAS */}
        {activeTab === 'stores' && (
          <section className="bg-[#0e1e33] border border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
            {filteredStores.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <Package size={32} className="text-slate-600" />
                <span>No se encontraron tiendas con los criterios de búsqueda.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#071220] text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800 text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Tienda / Negocio</th>
                      <th className="py-3 px-4">WhatsApp</th>
                      <th className="py-3 px-4">Plan Actual</th>
                      <th className="py-3 px-4">Productos</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Acciones de Propietario</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredStores.map((store) => {
                      const isPro = store.plan === 'emprendedor';
                      const isActive = store.status !== 'pausada';
                      const isBusy = actionLoadingId === store.id;

                      return (
                        <tr key={store.id} className="hover:bg-[#162a45]/50 transition-colors">
                          {/* Tienda */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                style={{ backgroundColor: store.primaryColor || '#059669' }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-xs"
                              >
                                {store.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-white truncate text-sm">
                                  {store.name}
                                </span>
                                <Link
                                  href={`/s/${store.slug}`}
                                  target="_blank"
                                  className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-mono"
                                >
                                  /s/{store.slug}
                                  <ExternalLink size={11} />
                                </Link>
                              </div>
                            </div>
                          </td>

                          {/* WhatsApp */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {store.whatsappPhone ? (
                              <a
                                href={`https://wa.me/${store.whatsappPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 font-mono"
                              >
                                <Phone size={13} className="text-emerald-500" />
                                +{store.whatsappPhone}
                              </a>
                            ) : (
                              <span className="text-slate-500 italic">No configurado</span>
                            )}
                          </td>

                          {/* Plan */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                isPro
                                  ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                                  : 'bg-slate-700/60 text-slate-300 border border-slate-600/40'
                              }`}
                            >
                              {isPro ? <Crown size={11} /> : <Zap size={11} />}
                              {isPro ? 'Emprendedor (Pro)' : 'Gratis'}
                            </span>
                          </td>

                          {/* Productos */}
                          <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-200">
                            📦 {store.productCount || 0} / {isPro ? 250 : 25}
                          </td>

                          {/* Estado */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                isActive
                                  ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800'
                                  : 'text-amber-400 bg-amber-950/60 border border-amber-800'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                              {isActive ? 'Activa' : 'Pausada'}
                            </span>
                          </td>

                          {/* Acciones */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Sticker QR (5x5 cm) */}
                              <button
                                type="button"
                                onClick={() => handleOpenSticker(store)}
                                className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 border border-emerald-800/60 transition-all cursor-pointer"
                                title="Ver, Descargar e Imprimir Sticker QR (5x5 cm)"
                              >
                                <QrCode size={15} />
                              </button>

                              {/* Editar Datos */}
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(store)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                                title="Editar Datos de la Tienda"
                              >
                                <Edit2 size={15} />
                              </button>

                              {/* Toggle Plan */}
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleTogglePlan(store)}
                                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                                  isPro
                                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                    : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                                }`}
                                title={isPro ? 'Bajar a Plan Gratis' : 'Ascender a Plan Emprendedor'}
                              >
                                {isPro ? 'Bajar a Gratis' : '⭐ Ascender a Pro'}
                              </button>

                              {/* Toggle Estado */}
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleToggleStatus(store)}
                                className={`p-1.5 rounded-lg transition-all ${
                                  isActive
                                    ? 'text-amber-400 hover:bg-amber-950/40'
                                    : 'text-emerald-400 hover:bg-emerald-950/40'
                                }`}
                                title={isActive ? 'Pausar Tienda' : 'Activar Tienda'}
                              >
                                {isActive ? <PauseCircle size={17} /> : <PlayCircle size={17} />}
                              </button>

                              {/* Eliminar Tienda */}
                              <button
                                type="button"
                                onClick={() => setDeletingStore(store)}
                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/50 transition-all ml-1"
                                title="Eliminar Tienda y Productos"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* 💰 TAB 2: CONTROL DE SUSCRIPCIONES Y COBROS RECURRENTES */}
        {activeTab === 'subscriptions' && (
          <section className="bg-[#0e1e33] border border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
            <div className="p-4 px-5 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard size={17} className="text-emerald-400" />
                Control de Membresías & Vencimientos
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#071220] text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800 text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Tienda</th>
                    <th className="py-3 px-4">Plan Actual</th>
                    <th className="py-3 px-4">Próximo Débito / Vencimiento</th>
                    <th className="py-3 px-4">Estado del Cobro</th>
                    <th className="py-3 px-4 text-right">Acciones de Cobro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {stores.map((store) => {
                    const sub = getSubscriptionInfo(store);
                    const isBusy = actionLoadingId === store.id;
                    const dateStr = store.nextBillingDate
                      ? new Date(store.nextBillingDate).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
                      : 'No fijada';

                    return (
                      <tr key={store.id} className="hover:bg-[#162a45]/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">
                          <div className="flex flex-col">
                            <span>{store.name}</span>
                            <span className="text-[11px] font-mono text-slate-400">/s/{store.slug}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-amber-300">
                            {store.plan === 'emprendedor' ? '⭐ Plan Emprendedor' : 'Plan Gratis'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {dateStr}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${sub.color}`}>
                            {sub.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Extender +30 Días */}
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleExtendSubscription(store, 30)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-[11px] font-bold transition-all flex items-center gap-1"
                              title="Extender 30 días adicionales"
                            >
                              <PlusCircle size={13} />
                              <span>+30 Días</span>
                            </button>

                            {/* Recordar por WhatsApp */}
                            {store.whatsappPhone && (
                              <a
                                href={`https://wa.me/${store.whatsappPhone}?text=${encodeURIComponent(
                                  `Hola ${store.name}, te saludamos de APANA. Tu suscripción al Plan Emprendedor vence el ${dateStr}. Recuerda mantener tu método de pago activo para seguir disfrutando de tus beneficios.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-all"
                                title="Enviar recordatorio de cobro por WhatsApp"
                              >
                                <MessageCircle size={15} />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* 👤 TAB 3: DIRECTORIO DE USUARIOS */}
        {activeTab === 'users' && (
          <section className="bg-[#0e1e33] border border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
            {filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <Users size={32} className="text-slate-600" />
                <span>No se encontraron usuarios registrados.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#071220] text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800 text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Usuario / Nombre</th>
                      <th className="py-3 px-4">Correo Electrónico</th>
                      <th className="py-3 px-4">Rol en APANA</th>
                      <th className="py-3 px-4">Tienda Asociada</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.map((u) => {
                      const isAdmin = u.role === 'admin';
                      return (
                        <tr key={u.uid || u.email} className="hover:bg-[#162a45]/50 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-white">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs">
                                {(u.name || u.email || 'U').charAt(0).toUpperCase()}
                              </div>
                              <span>{u.name || 'Sin nombre'}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-300">
                            {u.email}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isAdmin
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}>
                              {isAdmin ? '👑 SuperAdmin' : '🏬 Comerciante'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {u.storeName ? (
                              <Link
                                href={`/s/${u.storeSlug}`}
                                target="_blank"
                                className="text-emerald-400 hover:underline font-bold flex items-center gap-1"
                              >
                                {u.storeName}
                                <ExternalLink size={11} />
                              </Link>
                            ) : (
                              <span className="text-slate-500 italic">Sin tienda activa</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {!isAdmin && (
                              <button
                                type="button"
                                onClick={() => setDeletingUser(u)}
                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/50 transition-all"
                                title="Eliminar Registro de Usuario"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

      </main>

      {/* ✏️ Modal de Edición de Tienda */}
      {editingStore && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1e33] border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 relative animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Edit2 size={18} className="text-emerald-400" />
                Editar Datos de la Tienda
              </h3>
              <button
                onClick={() => setEditingStore(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-300">Nombre Comercial</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="h-10 bg-[#071220] border border-slate-700 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-300">Enlace Público (Slug)</label>
                <input
                  type="text"
                  required
                  value={editForm.slug}
                  onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                  className="h-10 bg-[#071220] border border-slate-700 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-300">WhatsApp para Pedidos (Perú)</label>
                <div className="flex items-center bg-[#071220] border border-slate-700 rounded-xl overflow-hidden">
                  <span className="px-3 text-xs text-slate-400 border-r border-slate-800">+51</span>
                  <input
                    type="tel"
                    placeholder="9XXXXXXXX"
                    value={editForm.whatsappPhone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                      setEditForm({ ...editForm, whatsappPhone: val });
                    }}
                    className="h-10 w-full bg-transparent px-3 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-300">Plan</label>
                  <select
                    value={editForm.plan}
                    onChange={(e: any) => setEditForm({ ...editForm, plan: e.target.value })}
                    className="h-10 bg-[#071220] border border-slate-700 rounded-xl px-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="gratis">Gratis</option>
                    <option value="emprendedor">Emprendedor (Pro)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-300">Estado</label>
                  <select
                    value={editForm.status}
                    onChange={(e: any) => setEditForm({ ...editForm, status: e.target.value })}
                    className="h-10 bg-[#071220] border border-slate-700 rounded-xl px-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="activa">Activa</option>
                    <option value="pausada">Pausada</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingStore(null)}
                  className="flex-1 h-10 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                >
                  {isSavingEdit ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🗑️ Modal de Confirmación para Eliminar Tienda */}
      {deletingStore && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1e33] border border-red-900/60 rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4 text-center animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-red-950/60 border border-red-800 text-red-400 flex items-center justify-center mx-auto shadow-md">
              <AlertTriangle size={28} />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-bold text-white">¿Eliminar Tienda Definitivamente?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Estás a punto de borrar <strong className="text-white">"{deletingStore.name}"</strong> y todos sus productos ({deletingStore.productCount || 0}). Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingStore(null)}
                className="flex-1 h-10 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteStore}
                className="flex-1 h-10 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                {isDeleting ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🗑️ Modal de Confirmación para Eliminar Usuario */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1e33] border border-red-900/60 rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4 text-center animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-red-950/60 border border-red-800 text-red-400 flex items-center justify-center mx-auto shadow-md">
              <Trash2 size={28} />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-bold text-white">¿Eliminar Registro de Usuario?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Se eliminará el perfil de <strong className="text-white">{deletingUser.email}</strong>.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="flex-1 h-10 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeletingUser}
                onClick={handleConfirmDeleteUser}
                className="flex-1 h-10 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                {isDeletingUser ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🏷️ Modal de Sticker QR (5x5 cm) para SuperAdmin */}
      {stickerStore && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          {/* Estilo para Impresión Aislada */}
          <style jsx global>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #admin-sticker-print-area, #admin-sticker-print-area * {
                visibility: visible;
              }
              #admin-sticker-print-area {
                position: fixed;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                width: 5cm !important;
                height: 5cm !important;
                padding: 0 !important;
                margin: 0 !important;
                border: 1px dashed #ccc !important;
                box-shadow: none !important;
              }
            }
          `}</style>

          <div className="bg-[#0e1e33] border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 text-center animate-in zoom-in-95 relative">
            <button
              type="button"
              onClick={() => setStickerStore(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 justify-center text-xs font-bold text-emerald-400">
              <QrCode size={18} />
              <span>Plantilla de Sticker Físico (5x5 cm)</span>
            </div>

            {/* PLANTILLA DE STICKER (5x5 cm / Troquel 4x4 cm) */}
            <div
              id="admin-sticker-print-area"
              className="w-64 h-64 bg-white rounded-3xl p-4 border-2 border-dashed border-slate-300 flex flex-col items-center justify-between shadow-xs mx-auto text-slate-900"
            >
              {/* Cabecera */}
              <div className="flex flex-col items-center gap-0.5">
                <h2 className="font-extrabold text-sm text-[#0b1c30] tracking-tight truncate max-w-[190px]">
                  {stickerStore.name}
                </h2>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  Catálogo Digital
                </span>
              </div>

              {/* Imagen QR HD */}
              {stickerQrUrl ? (
                <div className="p-1.5 bg-white rounded-xl border border-slate-100 shadow-2xs">
                  <img src={stickerQrUrl} alt={`QR ${stickerStore.name}`} className="w-36 h-36 object-contain" />
                </div>
              ) : (
                <div className="w-36 h-36 bg-slate-100 rounded-xl flex items-center justify-center animate-pulse">
                  <QrCode size={32} className="text-slate-400" />
                </div>
              )}

              {/* Pie */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-extrabold text-[#059669]">
                  📲 Escanea y Pide por WhatsApp
                </span>
                <span className="text-[8px] text-slate-400 font-mono">
                  /s/{stickerStore.slug}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-tight">
              Diseño cuadrado para impresión en papel sticker <strong>5x5 cm</strong> (área troquelada <strong>4x4 cm</strong>).
            </p>

            {/* Enlace y Copiar */}
            <div className="w-full bg-[#071220] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2 text-left">
              <span className="text-xs text-slate-300 font-mono truncate">
                {typeof window !== 'undefined' ? `${window.location.origin}/s/${stickerStore.slug}` : `/s/${stickerStore.slug}`}
              </span>
              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}/s/${stickerStore.slug}`;
                  navigator.clipboard.writeText(url);
                  setStickerCopied(true);
                  setTimeout(() => setStickerCopied(false), 2000);
                }}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Copiar enlace"
              >
                {stickerCopied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
              </button>
            </div>

            {/* Botones de Acción */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => window.print()}
                className="h-10 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <Printer size={15} />
                <span>Imprimir Sticker</span>
              </button>

              {stickerQrUrl && (
                <a
                  href={stickerQrUrl}
                  download={`sticker-qr-${stickerStore.slug}-1024px.png`}
                  className="h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <Download size={15} />
                  <span>Descargar HD</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
