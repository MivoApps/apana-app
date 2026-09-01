import { Product } from '@/types/store';

/**
 * Escapa valores para formato CSV compatible con Microsoft Excel en español (punto y coma o comas).
 */
function escapeCSV(field: any): string {
  if (field === null || field === undefined) return '""';
  const str = String(field).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Exporta el listado completo de productos a formato CSV optimizado para Microsoft Excel (UTF-8 con BOM).
 */
export function exportProductsToCSV(products: Product[], storeName: string, storeSlug: string) {
  if (!products || products.length === 0) {
    alert('No hay productos para exportar.');
    return;
  }

  // Encabezados en español para Excel
  const headers = [
    'ID Producto',
    'Nombre del Producto',
    'Precio (PEN)',
    'Categoría',
    'Estado Stock',
    'Variantes / Opciones',
    'Descripción',
    'URL Imagen Principal',
    'Enlace Público',
  ];

  const rows = products.map((p) => {
    const optionsSummary = p.options && p.options.length > 0
      ? p.options.map(g => `${g.title}: [${g.values.map(v => v.priceDifference ? `${v.name} (+S/${v.priceDifference})` : v.name).join(', ')}]`).join(' | ')
      : 'Sin variantes';

    const publicUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/s/${storeSlug}/p/${p.id}`
      : `https://bealiados.com/s/${storeSlug}/p/${p.id}`;

    return [
      escapeCSV(p.id),
      escapeCSV(p.title),
      escapeCSV(p.price.toFixed(2)),
      escapeCSV(p.category || 'General'),
      escapeCSV(p.inStock ? 'Disponible' : 'Agotado'),
      escapeCSV(optionsSummary),
      escapeCSV(p.description || ''),
      escapeCSV(p.imageUrl || (p as any).image || ''),
      escapeCSV(publicUrl),
    ].join(';');
  });

  // UTF-8 BOM (\uFEFF) garantiza que Excel reconozca tildes, caracteres latinos y la 'ñ'
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const cleanStoreName = (storeName || 'tienda').toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
  const dateStr = new Date().toISOString().split('T')[0];

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `catalogo-${cleanStoreName}-${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exporta el historial de pedidos de la tienda a formato CSV para Excel.
 */
export function exportOrdersToCSV(orders: any[], storeName: string) {
  if (!orders || orders.length === 0) {
    alert('Aún no tienes pedidos registrados para exportar.');
    return;
  }

  const headers = [
    'ID Pedido',
    'Fecha',
    'Cliente',
    'Distrito / Ubicación',
    'Total (PEN)',
    'Método Pago',
    'Productos',
    'Estado',
  ];

  const rows = orders.map((o) => {
    const itemsSummary = o.items && Array.isArray(o.items)
      ? o.items.map((it: any) => `${it.quantity}x ${it.title} (${it.selectedOption || 'Estándar'})`).join(' | ')
      : 'Sin detalle';

    const dateStr = o.createdAt?.toDate ? o.createdAt.toDate().toLocaleString('es-PE') : o.date || 'Reciente';

    return [
      escapeCSV(o.id || ''),
      escapeCSV(dateStr),
      escapeCSV(o.customerName || 'Cliente WhatsApp'),
      escapeCSV(o.customerAddress || 'Por coordinar'),
      escapeCSV(typeof o.total === 'number' ? o.total.toFixed(2) : o.total || '0.00'),
      escapeCSV(o.paymentMethod || 'WhatsApp / Yape'),
      escapeCSV(itemsSummary),
      escapeCSV(o.status || 'Recibido por WhatsApp'),
    ].join(';');
  });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const cleanStoreName = (storeName || 'tienda').toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
  const dateStr = new Date().toISOString().split('T')[0];

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `pedidos-${cleanStoreName}-${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
