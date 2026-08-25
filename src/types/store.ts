export type StoreStatus = 'activa' | 'pausada' | 'pendiente' | 'eliminada';
export type StoreStyle = 'minimalista' | 'moderna' | 'elegante';
export type StorePlan = 'gratis' | 'emprendedor' | 'negocio';

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
  schedule?: string; // ej. "Lun a Sáb: 9:00 am - 8:00 pm"
  shippingType?: 'coordinar' | 'gratis'; // 'coordinar' por defecto
  shippingNotes?: string;
  plan?: StorePlan | string; // Tipo de suscripción: 'gratis' | 'emprendedor' | 'negocio'
  subscriptionStatus?: 'active' | 'cancelled' | 'cancel_at_period_end' | 'expiring_soon' | 'grace_period' | 'expired' | 'free';
  cancelAtPeriodEnd?: boolean;
  subscriptionStartDate?: number;
  nextBillingDate?: number;
  lastPaymentDate?: number;
  lastPaymentAmount?: number;
  lastCulqiChargeId?: string;
  categories?: string[]; // Categorías de productos de la tienda (Plan Emprendedor y Negocio)
  isWhatsappVerified?: boolean; // Validación anti-fraude del WhatsApp del comercio
  whatsappVerificationCode?: string; // Código de 6 dígitos enviado
  whatsappVerifiedAt?: number; // Timestamp de verificación
  downgradedAt?: number; // Timestamp cuando pasó a Plan Gratis
  dataRetentionUntil?: number; // Timestamp fin del período de gracia de 6 meses (180 días)
  createdAt?: any;
  updatedAt?: any;
}

export interface ProductOptionValue {
  id: string;
  name: string; // ej. "250g", "Vainilla", "Negro", "L"
  priceDifference?: number; // Precio diferencial opcional ej. 5.00 (+S/ 5) o 0
  imageUrl?: string; // Foto opcional asociada a la variante (Plan Negocio)
  inStock?: boolean;
}

export interface ProductOptionGroup {
  id: string;
  title: string; // ej. "Talla", "Color", "Presentación", "Fragancia"
  required?: boolean;
  values: ProductOptionValue[];
}

export interface Product {
  id: string;
  storeId: string;
  title: string;
  description?: string;
  price: number;
  compareAtPrice?: number; // Precio anterior / de oferta tachado (ej: 89.00 vs 59.00)
  badge?: 'nuevo' | 'top' | 'oferta' | null; // Insignia para destacar en el catálogo
  imageUrl?: string;
  imageUrls?: string[]; // Lista de hasta 4 imágenes (Emprendedor) u 8 (Negocio)
  category?: string; // Categoría asociada al producto
  options?: ProductOptionGroup[]; // Opciones/Variantes del producto
  inStock: boolean;
  views?: number; // Contador de visitas acumuladas
  createdAt: number;
}

export interface SelectedOption {
  groupTitle: string;
  valueName: string;
  priceDifference?: number;
}

export interface CartItem {
  id: string; // Identificador único (ej. productId o productId + opciones seleccionadas)
  product: Product;
  selectedOptions?: SelectedOption[];
  calculatedPrice: number; // Precio base + diferencias de opciones
  quantity: number;
}
