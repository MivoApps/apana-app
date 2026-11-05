import { StoreStyle, CatalogLayout, HeaderStyle, StoreHeroStyle, FontPairing } from '@/types/store';

// ==========================================
// 1. LOS 4 ESTILOS DE AUTOR (VISUAL MOODS)
// ==========================================
export interface VisualMood {
  id: StoreStyle;
  name: string;
  tagline: string;
  badge: string;
  inspiration: string;
  bestFor: string;
  description: string;
  defaultFont: FontPairing;
  defaultHero: StoreHeroStyle;
  defaultLayout: CatalogLayout;
  previewBg: string;
  previewBorder: string;
  previewAccent: string;
  cardStyle: string;
}

export const VISUAL_MOODS: VisualMood[] = [
  {
    id: 'luxe',
    name: 'Editorial Luxe',
    tagline: 'Alta gama, sofisticación y moda',
    badge: '✨ Alta Costura',
    inspiration: 'Zara / Vogue / Chanel',
    bestFor: 'Boutiques, Moda, Joyería, Perfumería y Marcas de Autor',
    description: 'Tipografía serif refinada, fotos verticales estilizadas, micro-líneas sutiles y botones con elegancia atemporal.',
    defaultFont: 'editorial',
    defaultHero: 'split',
    defaultLayout: 'grid',
    previewBg: 'bg-neutral-900',
    previewBorder: 'border-neutral-800',
    previewAccent: '#831843',
    cardStyle: 'border border-neutral-200/80 bg-white shadow-2xs hover:shadow-md transition-all',
  },
  {
    id: 'modern',
    name: 'Neo Modern',
    tagline: 'Vanguardista, cristal y alta tecnología',
    badge: '⚡ Trending',
    inspiration: 'Apple / Stripe / Linear',
    bestFor: 'Tecnología, Gadgets, Sneakers, Streetwear y Accesorios',
    description: 'Efecto cristal esmerilado (glassmorphism), esquinas redondeadas modernas (rounded-2xl) y sombras de profundidad sutil.',
    defaultFont: 'modern',
    defaultHero: 'glass',
    defaultLayout: 'grid',
    previewBg: 'bg-slate-900',
    previewBorder: 'border-slate-800',
    previewAccent: '#2563EB',
    cardStyle: 'rounded-2xl border border-slate-200/70 bg-white/95 backdrop-blur-xs shadow-xs hover:shadow-lg transition-all',
  },
  {
    id: 'fresh',
    name: 'Fresh & Pop',
    tagline: 'Cálido, amigable y orgánico',
    badge: '🌸 Cercano & Feliz',
    inspiration: 'Glossier / D2C Brands',
    bestFor: 'Belleza, Skincare, Cafeterías, Repostería, Deco y Regalos',
    description: 'Colores orgánicos alegres, bordes redondeados con relieve suave, micro-animaciones táctiles y etiquetas flotantes animadas.',
    defaultFont: 'warm',
    defaultHero: 'glass',
    defaultLayout: 'grid',
    previewBg: 'bg-amber-950',
    previewBorder: 'border-amber-900',
    previewAccent: '#EA580C',
    cardStyle: 'rounded-3xl border-2 border-amber-100 bg-white shadow-xs hover:border-amber-300 transition-all',
  },
  {
    id: 'market',
    name: 'Express Market',
    tagline: 'Compra rápida, ágil y de alto volumen',
    badge: '🛒 Rápido & Fácil',
    inspiration: 'Rappi / Amazon Fresh',
    bestFor: 'Bodegas, Minimarkets, Farmacias, Licorerías y Comida Rápida',
    description: 'Diseñado para compras de múltiples artículos. Lista rápida con botón directo "+" instantáneo y categorías siempre a la vista.',
    defaultFont: 'bold',
    defaultHero: 'clean',
    defaultLayout: 'list',
    previewBg: 'bg-emerald-950',
    previewBorder: 'border-emerald-900',
    previewAccent: '#059669',
    cardStyle: 'rounded-xl border border-slate-200 bg-white hover:border-emerald-500 shadow-2xs transition-all',
  },
];

// Mapeo seguro de estilos legados a nuevos estilos modernos
export function normalizeStoreStyle(style?: string): StoreStyle {
  if (!style) return 'modern';
  if (style === 'elegante') return 'luxe';
  if (style === 'moderna') return 'modern';
  if (style === 'minimalista') return 'market';
  if (['luxe', 'modern', 'fresh', 'market'].includes(style)) {
    return style as StoreStyle;
  }
  return 'modern';
}

// ==========================================
// 2. CABECERA & HERO DE PORTADA
// ==========================================
export interface HeroStyleOption {
  id: StoreHeroStyle;
  name: string;
  tagline: string;
  description: string;
  icon: string;
}

export const HERO_STYLES: HeroStyleOption[] = [
  {
    id: 'glass',
    name: 'Portada Inmersiva con Cristal',
    tagline: 'Impacto visual cinematográfico',
    description: 'Foto panorámica destacada de tu negocio con tarjeta de tienda flotante con efecto cristal esmerilado (frosted glass).',
    icon: '✨',
  },
  {
    id: 'split',
    name: 'Editorial Dividido (Hero Split)',
    tagline: 'Estilo catálogo de revista',
    description: 'Titular de bienvenida a un lado y fotografía principal destacada al otro, invitando a explorar el catálogo.',
    icon: '📖',
  },
  {
    id: 'clean',
    name: 'Minimalista Directo (Sin Portada)',
    tagline: '100% enfocado en los productos',
    description: 'Cabecera compacta y limpia que lleva a tus clientes directo a ver y comprar los productos sin necesidad de hacer scroll.',
    icon: '⚡',
  },
];

// ==========================================
// 3. EMPAREJAMIENTO TIPOGRÁFICO PROFESIONAL
// ==========================================
export interface FontPairingOption {
  id: FontPairing;
  name: string;
  styleName: string;
  headingsFont: string;
  bodyFont: string;
  bestWith: string;
}

export const FONT_PAIRINGS: FontPairingOption[] = [
  {
    id: 'editorial',
    name: 'Editorial Luxury',
    styleName: 'Serif Clásica & Sans Moderna',
    headingsFont: 'font-serif font-bold tracking-tight',
    bodyFont: 'font-sans',
    bestWith: 'Ideal para Moda, Joyas y Productos de Lujo',
  },
  {
    id: 'modern',
    name: 'Neo Clean & Tech',
    styleName: 'Plus Jakarta Sans',
    headingsFont: 'font-sans font-extrabold tracking-tight',
    bodyFont: 'font-sans',
    bestWith: 'Limpio, profesional y ultra legible en celulares',
  },
  {
    id: 'warm',
    name: 'Cálido & Orgánico',
    styleName: 'Outfit / Rounded',
    headingsFont: 'font-sans font-black tracking-normal',
    bodyFont: 'font-sans',
    bestWith: 'Amigable, cercano y perfecto para café o belleza',
  },
  {
    id: 'bold',
    name: 'Comercial de Alto Impacto',
    styleName: 'Clash / Impact Sans',
    headingsFont: 'font-sans font-black uppercase tracking-wide',
    bodyFont: 'font-sans',
    bestWith: 'Enérgico y directo, ideal para bodegas y promociones',
  },
];

// ==========================================
// 4. PALETA DE 12 COLORES CURADOS
// ==========================================
export interface ColorOption {
  id: string;
  hex: string;
  name: string;
  category: string;
}

export const STITCH_COLORS: ColorOption[] = [
  { id: 'apana-green', hex: '#059669', name: 'Esmeralda', category: 'Verdes' },
  { id: 'blue', hex: '#2563EB', name: 'Azul Real', category: 'Azules' },
  { id: 'ocean', hex: '#0284C7', name: 'Celeste Océano', category: 'Azules' },
  { id: 'violet', hex: '#7C3AED', name: 'Violeta', category: 'Púrpuras' },
  { id: 'purple', hex: '#9333EA', name: 'Púrpura', category: 'Púrpuras' },
  { id: 'pink', hex: '#DB2777', name: 'Fucsia', category: 'Rosas' },
  { id: 'red', hex: '#E11D48', name: 'Carmesí', category: 'Rojos' },
  { id: 'orange', hex: '#EA580C', name: 'Naranja Cálido', category: 'Cálidos' },
  { id: 'amber', hex: '#D97706', name: 'Dorado Ámbar', category: 'Cálidos' },
  { id: 'olive', hex: '#4D7C0F', name: 'Verde Olivo', category: 'Verdes' },
  { id: 'wine', hex: '#831843', name: 'Vino Tinto', category: 'Elegantes' },
  { id: 'black', hex: '#171717', name: 'Negro Ébano', category: 'Elegantes' },
];

// ==========================================
// 5. PRESETS INTELIGENTES DE 1 CLIC POR RUBRO
// ==========================================
export interface BusinessPreset {
  id: string;
  name: string;
  rubro: string;
  icon: string;
  description: string;
  themeStyle: StoreStyle;
  primaryColor: string;
  catalogLayout: CatalogLayout;
  headerStyle: HeaderStyle;
  heroStyle: StoreHeroStyle;
  fontPairing: FontPairing;
  showTrustBadges: boolean;
  productHoverZoom: boolean;
  suggestedAnnouncement: string;
}

export const BUSINESS_PRESETS: BusinessPreset[] = [
  {
    id: 'bodega',
    name: 'Bodega & Minimarket',
    rubro: 'Abarrotes y Alimentos',
    icon: '🛒',
    description: 'Lista rápida con botón directo "+" para agregar múltiples productos al instante.',
    themeStyle: 'market',
    primaryColor: '#059669',
    catalogLayout: 'list',
    headerStyle: 'minimal',
    heroStyle: 'clean',
    fontPairing: 'bold',
    showTrustBadges: true,
    productHoverZoom: false,
    suggestedAnnouncement: '🛵 ¡Envíos rápidos a domicilio! Pedidos directos a nuestro WhatsApp.',
  },
  {
    id: 'boutique',
    name: 'Boutique & Moda',
    rubro: 'Ropa, Zapatos y Joyas',
    icon: '👗',
    description: 'Cuadrícula visual con fotos grandes en proporción vertical y estilo de alta costura.',
    themeStyle: 'luxe',
    primaryColor: '#831843',
    catalogLayout: 'grid',
    headerStyle: 'banner',
    heroStyle: 'split',
    fontPairing: 'editorial',
    showTrustBadges: true,
    productHoverZoom: true,
    suggestedAnnouncement: '✨ Nueva Colección de Temporada. Envíos gratis por compras mayores a S/ 150.',
  },
  {
    id: 'cafe-resto',
    name: 'Cafetería & Bakery',
    rubro: 'Comidas y Bebidas',
    icon: '☕',
    description: 'Portada cálida con foto de tu local o platos y formato de carta o menú con pedidos ágiles.',
    themeStyle: 'fresh',
    primaryColor: '#D97706',
    catalogLayout: 'list',
    headerStyle: 'banner',
    heroStyle: 'glass',
    fontPairing: 'warm',
    showTrustBadges: true,
    productHoverZoom: true,
    suggestedAnnouncement: '🥐 ¡Horneados frescos todos los días! Atendemos pedidos de 8:00 am a 8:00 pm.',
  },
  {
    id: 'tech-urban',
    name: 'Tecnología & Gadgets',
    rubro: 'Electrónica y Accesorios',
    icon: '⚡',
    description: 'Estilo moderno con efecto cristal, cuadrícula limpia y badges de garantía destacados.',
    themeStyle: 'modern',
    primaryColor: '#2563EB',
    catalogLayout: 'grid',
    headerStyle: 'card',
    heroStyle: 'glass',
    fontPairing: 'modern',
    showTrustBadges: true,
    productHoverZoom: true,
    suggestedAnnouncement: '⚡ Garantía oficial en todos nuestros equipos y accesorios.',
  },
  {
    id: 'skincare',
    name: 'Belleza & Cosmética',
    rubro: 'Cuidado personal y Salud',
    icon: '🌸',
    description: 'Tonos suaves, estética orgánica y fotos destacadas para productos de cuidado personal.',
    themeStyle: 'fresh',
    primaryColor: '#DB2777',
    catalogLayout: 'grid',
    headerStyle: 'minimal',
    heroStyle: 'glass',
    fontPairing: 'warm',
    showTrustBadges: true,
    productHoverZoom: true,
    suggestedAnnouncement: '🌿 Productos 100% originales y dermatológicamente probados.',
  },
];

// Frases sugeridas para la Barra de Anuncios
export const ANNOUNCEMENT_SUGGESTIONS = [
  '🚚 ¡Envíos gratis en compras mayores a S/ 100!',
  '⚡ Atendemos pedidos por WhatsApp hasta las 8:00 PM',
  '🎁 10% de descuento en tu primera compra escribiéndonos al WhatsApp',
  '📍 También puedes recoger tu pedido en nuestra tienda física',
  '✨ ¡Nuevos productos disponibles! Stock limitado',
  '💳 Aceptamos Yape, Plin, Transferencia y Tarjetas',
];

/**
 * Calcula si el texto sobre un fondo de color HEX debe ser blanco o negro oscuro
 * para asegurar máxima legibilidad y cumplimiento WCAG de accesibilidad.
 */
export function getContrastTextColor(hexColor?: string | null): '#ffffff' | '#0b1c30' {
  if (!hexColor) return '#ffffff';
  let hex = hexColor.trim().replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  if (hex.length !== 6) return '#ffffff';

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) return '#ffffff';

  // Fórmula estándar YIQ de luminancia
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 155 ? '#0b1c30' : '#ffffff';
}

/**
 * Valida si un string es un código Hexadecimal válido (#RGB o #RRGGBB)
 */
export function isValidHexColor(hex: string): boolean {
  if (!hex) return false;
  return /^#([0-9A-Fa-f]{3}){1,2}$/.test(hex.trim());
}
