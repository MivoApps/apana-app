import { CartItem, Store } from '@/types/store';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace('PEN', 'S/.');
}

export interface WhatsAppOrderDetails {
  customerName?: string;
  customerAddress?: string;
  paymentMethod?: string;
  notes?: string;
  isPickup?: boolean;
  pickupAddress?: string;
}

export function generateWhatsAppLink(
  store: Store,
  items: CartItem[],
  detailsOrName?: string | WhatsAppOrderDetails,
  legacyNotes?: string
): string {
  let cleanPhone = store.whatsappPhone.replace(/[^0-9]/g, '');
  
  // Garantizar prefijo internacional peruano 51 si tiene 9 dígitos
  if (cleanPhone.length === 9) {
    cleanPhone = `51${cleanPhone}`;
  }

  // Normalizar detalles del pedido
  let customerName = '';
  let customerAddress = '';
  let paymentMethod = '';
  let notes = '';
  let isPickup = store.shippingType === 'solo_recojo';
  let pickupAddress = store.pickupAddress || store.city || '';

  if (typeof detailsOrName === 'object' && detailsOrName !== null) {
    customerName = detailsOrName.customerName || '';
    customerAddress = detailsOrName.customerAddress || '';
    paymentMethod = detailsOrName.paymentMethod || '';
    notes = detailsOrName.notes || '';
    if (detailsOrName.isPickup !== undefined) {
      isPickup = detailsOrName.isPickup;
    }
    if (detailsOrName.pickupAddress) {
      pickupAddress = detailsOrName.pickupAddress;
    }
  } else {
    customerName = detailsOrName || '';
    notes = legacyNotes || '';
  }

  let message = `🛒 *NUEVO PEDIDO - ${store.name.toUpperCase()}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // Datos del Cliente si existen
  if (isPickup) {
    if (customerName.trim()) {
      message += `👤 *Cliente:* ${customerName.trim()}\n`;
    }
    message += `🏬 *Modalidad:* 📍 Recojo en Tienda\n`;
    if (pickupAddress.trim()) {
      message += `📍 *Punto de Recojo:* ${pickupAddress.trim()}\n`;
    }
    if (paymentMethod.trim()) {
      message += `💳 *Método de Pago:* ${paymentMethod.trim()}\n`;
    }
    message += `\n`;
  } else if (customerName.trim() || customerAddress.trim() || paymentMethod.trim()) {
    if (customerName.trim()) {
      message += `👤 *Cliente:* ${customerName.trim()}\n`;
    }
    if (customerAddress.trim()) {
      message += `📍 *Dirección / Distrito:* ${customerAddress.trim()}\n`;
    }
    if (paymentMethod.trim()) {
      message += `💳 *Método de Pago:* ${paymentMethod.trim()}\n`;
    }
    message += `\n`;
  }
  
  // Detalle de productos
  message += `📦 *Detalle del Pedido:*\n`;
  items.forEach((item) => {
    const itemUnitPrice = item.calculatedPrice ?? item.product.price;
    const subtotal = itemUnitPrice * item.quantity;
    message += `▪️ *${item.product.title}*\n`;
    
    if (item.selectedOptions && item.selectedOptions.length > 0) {
      const optionsText = item.selectedOptions.map(o => `${o.groupTitle}: ${o.valueName}`).join(' / ');
      message += `   _Opción: ${optionsText}_\n`;
    }
    
    message += `   Cantidad: ${item.quantity} x ${formatCurrency(itemUnitPrice)} = *${formatCurrency(subtotal)}*\n\n`;
  });
  
  const total = items.reduce((sum, item) => sum + ((item.calculatedPrice ?? item.product.price) * item.quantity), 0);
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💰 *TOTAL A PAGAR: ${formatCurrency(total)}*\n`;

  if (isPickup) {
    message += `\n💬 _Hola, realicé este pedido para recojo en tienda. Quedo atento(a) a su confirmación de cuándo puedo pasar a retirarlo._\n`;
  }

  if (notes && notes.trim()) {
    message += `\n📝 *Notas del cliente:* ${notes.trim()}\n`;
  }

  message += `\n✨ _Pedido generado desde mi tienda APANA_`;

  const encodedMessage = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;
}

/**
 * Abre WhatsApp o WhatsApp Business de forma inteligente según el dispositivo.
 * En móviles dispara el deep linking nativo para ambas aplicaciones.
 */
export function openUniversalWhatsApp(rawPhone: string, text: string): void {
  let cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  if (cleanPhone.length === 9) {
    cleanPhone = `51${cleanPhone}`;
  }
  const encodedText = encodeURIComponent(text);
  const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isMobile) {
    // Protocolo oficial de Meta que soporta WhatsApp Messenger y WhatsApp Business nativamente
    const mobileUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
    window.open(mobileUrl, '_blank', 'noopener,noreferrer');
  } else {
    // Computadora / Escritorio: usar api.whatsapp.com evita la corrupción de caracteres Unicode de wa.me
    const desktopUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
    window.open(desktopUrl, '_blank', 'noopener,noreferrer');
  }
}
