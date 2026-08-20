export type StoreStatus = 'activa' | 'pausada' | 'pendiente' | 'eliminada';
export type StoreStyle = 'minimalista' | 'moderna' | 'elegante';

export interface Store {
  id: string;
  slug: string; // URL amigable ej. "panaderia-don-jose"
  name: string;
  category?: string;
  description?: string;
  whatsappPhone: string; // Número con código de país p.ej. "51951212121"
  ownerId: string;
  ownerEmail?: string; // Email del dueño para búsqueda y contacto
  ownerName?: string; // Nombre del comerciante
  status: StoreStatus; // Estado de la tienda: 'activa' | 'pausada' | 'pendiente' | 'eliminada'
  themeStyle?: StoreStyle; // Estilo visual: 'minimalista' | 'moderna' | 'elegante'
  primaryColor?: string; // Color principal Hex ej. "#059669"
  currency?: string; // 'PEN' por defecto
  logoUrl?: string | null;
  bannerUrl?: string | null;
  city?: string;
  department?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
  plan?: 'gratis' | 'emprendedor' | string; // Tipo de suscripción de la tienda
  subscriptionStatus?: 'active' | 'cancelled' | 'cancel_at_period_end' | 'expiring_soon' | 'grace_period' | 'expired' | 'free';
  cancelAtPeriodEnd?: boolean;
  subscriptionStartDate?: number;
  nextBillingDate?: number;
  lastPaymentDate?: number;
  lastPaymentAmount?: number;
  lastCulqiChargeId?: string;
  categories?: string[]; // Categorías de productos de la tienda (Plan Emprendedor)
  createdAt?: any;
  updatedAt?: any;
}

export interface Product {
  id: string;
  storeId: string;
  title: string;
  description?: string;
  price: number;
  imageUrl?: string;
  imageUrls?: string[]; // Lista de hasta 4 imágenes (Plan Emprendedor)
  category?: string; // Categoría asociada al producto (Plan Emprendedor)
  inStock: boolean;
  views?: number; // Contador de visitas acumuladas (Plan Emprendedor)
  createdAt: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
