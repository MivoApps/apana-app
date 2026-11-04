import { StoreStyle, CatalogLayout, HeaderStyle } from '@/types/store';

// 12 Colores de alta conversión y armonía visual
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

// Presets Inteligentes de 1 Clic por Rubro (Ideal para Showcases y Comerciantes)
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
  suggestedAnnouncement: string;
}

export const BUSINESS_PRESETS: BusinessPreset[] = [
  {
    id: 'bodega',
    name: 'Bodega & Minimarket',
    rubro: 'Abarrotes y Alimentos',
    icon: '🛒',
    description: 'Lista rápida con botón directo "+" para agregar múltiples productos al instante.',
    themeStyle: 'minimalista',
    primaryColor: '#059669',
    catalogLayout: 'list',
    headerStyle: 'minimal',
    suggestedAnnouncement: '🛵 ¡Envíos rápidos a domicilio! Pedidos directos a nuestro WhatsApp.',
  },
  {
    id: 'boutique',
    name: 'Boutique & Moda',
    rubro: 'Ropa, Zapatos y Joyas',
    icon: '👗',
    description: 'Cuadrícula visual con fotos grandes en 2 columnas y estilo sofisticado.',
    themeStyle: 'elegante',
    primaryColor: '#831843',
    catalogLayout: 'grid',
    headerStyle: 'banner',
    suggestedAnnouncement: '✨ Nueva Colección de Temporada. Envíos gratis por compras mayores a S/ 150.',
  },
  {
    id: 'cafe-resto',
    name: 'Cafetería & Restaurante',
    rubro: 'Comidas y Bebidas',
    icon: '☕',
    description: 'Portada panorámica con foto de tu local o platos y formato de carta o menú.',
    themeStyle: 'moderna',
    primaryColor: '#D97706',
    catalogLayout: 'list',
    headerStyle: 'banner',
    suggestedAnnouncement: '🥐 ¡Horneados frescos todos los días! Atendemos pedidos de 8:00 am a 8:00 pm.',
  },
  {
    id: 'tech-urban',
    name: 'Tecnología & Gadgets',
    rubro: 'Electrónica y Accesorios',
    icon: '⚡',
    description: 'Estilo moderno con alto contraste, cuadrícula limpia y badges de oferta destacados.',
    themeStyle: 'moderna',
    primaryColor: '#2563EB',
    catalogLayout: 'grid',
    headerStyle: 'card',
    suggestedAnnouncement: '⚡ Garantía oficial en todos nuestros equipos y accesorios.',
  },
  {
    id: 'skincare',
    name: 'Belleza & Cosmética',
    rubro: 'Cuidado personal y Salud',
    icon: '🌸',
    description: 'Tonos suaves, estética limpia y fotos destacadas para productos de cuidado personal.',
    themeStyle: 'minimalista',
    primaryColor: '#DB2777',
    catalogLayout: 'grid',
    headerStyle: 'minimal',
    suggestedAnnouncement: '🌿 Productos 100% originales y dermatológicamente probados.',
  },
];

// Frases sugeridas de 1 clic para la Barra de Anuncios
export const ANNOUNCEMENT_SUGGESTIONS = [
  '🚚 ¡Envíos gratis a todo Lima por compras mayores a S/ 100!',
  '⚡ Atendemos pedidos por WhatsApp de Lunes a Sábado hasta las 8:00 PM',
  '🎁 10% de descuento en tu primera compra escribiéndonos al WhatsApp',
  '📍 También puedes recoger tu pedido en nuestra tienda física sin costo',
  '✨ ¡Nuevos productos disponibles! Stock limitado',
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
