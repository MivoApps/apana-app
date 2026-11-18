/**
 * APANA Analytics & Marketing Attribution Module
 *
 * Soporte unificado para:
 * - Google Analytics 4 (GA4)
 * - Meta Pixel (Facebook & Instagram Ads)
 * - Captura y persistencia de UTMs (atribución de campañas)
 *
 * Si los IDs no están definidos en las variables de entorno, los eventos
 * se registran de forma segura en consola para depuración durante el desarrollo.
 */

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  ref?: string;
  landing_page?: string;
  captured_at?: number;
}

const UTM_STORAGE_KEY = 'apana_utm_params';

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

/**
 * Guarda los parámetros UTM de la URL en almacenamiento local/sesión.
 * Se preservan durante toda la sesión de navegación del usuario hasta su registro.
 */
export function captureUtmParams(searchParams?: URLSearchParams | null): UtmParams | null {
  if (typeof window === 'undefined') return null;

  try {
    const params = searchParams || new URLSearchParams(window.location.search);
    const source = params.get('utm_source');
    const medium = params.get('utm_medium');
    const campaign = params.get('utm_campaign');
    const content = params.get('utm_content');
    const term = params.get('utm_term');
    const ref = params.get('ref');

    // Solo guardar si hay al menos un parámetro de campaña o referencia
    if (source || medium || campaign || content || term || ref) {
      const utmData: UtmParams = {
        ...(source ? { utm_source: source } : {}),
        ...(medium ? { utm_medium: medium } : {}),
        ...(campaign ? { utm_campaign: campaign } : {}),
        ...(content ? { utm_content: content } : {}),
        ...(term ? { utm_term: term } : {}),
        ...(ref ? { ref } : {}),
        landing_page: window.location.pathname,
        captured_at: Date.now(),
      };

      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmData));
      localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmData));

      if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics] UTMs capturados con éxito:', utmData);
      }

      return utmData;
    }
  } catch (err) {
    console.warn('[Analytics] Error capturando UTMs:', err);
  }

  return getStoredUtmParams();
}

/**
 * Recupera los parámetros UTM previamente guardados en la sesión actual.
 */
export function getStoredUtmParams(): UtmParams | null {
  if (typeof window === 'undefined') return null;

  try {
    const sessionData = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (sessionData) return JSON.parse(sessionData);

    const localData = localStorage.getItem(UTM_STORAGE_KEY);
    if (localData) return JSON.parse(localData);
  } catch {
    // Silencioso en caso de error de parseo
  }

  return null;
}

/**
 * Registra una vista de página en GA4 y Meta Pixel
 */
export function trackPageView(url?: string): void {
  if (typeof window === 'undefined') return;
  const pagePath = url || window.location.pathname + window.location.search;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] PageView -> ${pagePath}`);
  }

  // Google Analytics 4
  if (window.gtag && GA_TRACKING_ID) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: pagePath,
    });
  }

  // Meta Pixel
  if (window.fbq && META_PIXEL_ID) {
    window.fbq('track', 'PageView');
  }
}

/**
 * Evento: Registro completado (CompleteRegistration)
 * Disparado al crearse la cuenta del comerciante (Email o Google)
 */
export function trackCompleteRegistration(method = 'email'): void {
  if (typeof window === 'undefined') return;
  const utms = getStoredUtmParams() || {};

  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] CompleteRegistration:', { method, ...utms });
  }

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', 'sign_up', {
      method,
      ...utms,
    });
  }

  // Meta Pixel
  if (window.fbq) {
    window.fbq('track', 'CompleteRegistration', {
      content_name: 'Merchant Signup',
      status: true,
      method,
      ...utms,
    });
  }
}

/**
 * Evento personalizado: Tienda creada (StoreCreated)
 * Disparado al finalizar el Wizard inicial de creación de tienda
 */
export function trackStoreCreated(data: {
  storeId: string;
  storeName: string;
  category?: string;
  plan?: string;
}): void {
  if (typeof window === 'undefined') return;
  const utms = getStoredUtmParams() || {};

  const payload = {
    store_id: data.storeId,
    store_name: data.storeName,
    category: data.category || 'general',
    plan: data.plan || 'gratis',
    ...utms,
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] StoreCreated (Custom Event):', payload);
  }

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', 'store_created', payload);
  }

  // Meta Pixel (Evento Personalizado para optimización de campañas de anuncios)
  if (window.fbq) {
    window.fbq('trackCustom', 'StoreCreated', payload);
  }
}

/**
 * Evento personalizado: Tienda activada con productos (StoreActivated)
 * Disparado cuando el comerciante publica su primer producto activo
 */
export function trackStoreActivated(data: {
  storeId: string;
  productName?: string;
  price?: number;
}): void {
  if (typeof window === 'undefined') return;
  const utms = getStoredUtmParams() || {};

  const payload = {
    store_id: data.storeId,
    product_name: data.productName || 'Producto Inicial',
    price: data.price || 0,
    ...utms,
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] StoreActivated (Custom Event):', payload);
  }

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', 'store_activated', payload);
  }

  // Meta Pixel
  if (window.fbq) {
    window.fbq('trackCustom', 'StoreActivated', payload);
  }
}
