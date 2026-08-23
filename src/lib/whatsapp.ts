import { CartItem, Store } from '@/types/store';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace('PEN', 'S/.');
}

export function generateWhatsAppLink(store: Store, items: CartItem[], customerName?: string, notes?: string): string {
  let cleanPhone = store.whatsappPhone.replace(/[^0-9]/g, '');
  
  // Garantizar prefijo internacional peruano 51 si tiene 9 dígitos
  if (cleanPhone.length === 9) {
    cleanPhone = `51${cleanPhone}`;
  }

  let message = `🛒 *NUEVO PEDIDO - ${store.name.toUpperCase()}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
  
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
  message += `💰 *TOTAL A PAGAR: ${formatCurrency(total)}*\n\n`;

  if (customerName && customerName.trim()) {
    message += `👤 *Cliente:* ${customerName.trim()}\n`;
  }
  if (notes && notes.trim()) {
    message += `📝 *Dirección / Notas:* ${notes.trim()}\n`;
  }

  message += `\n✨ _Enviado desde mi tienda APANA_`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}
