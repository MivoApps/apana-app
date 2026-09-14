export interface StoreReport {
  id?: string;
  storeId: string;
  storeSlug: string;
  storeName: string;
  reason: 'fraude_estafa' | 'productos_prohibidos' | 'suplantacion' | 'contenido_inapropiado' | 'otro';
  reasonLabel: string;
  details: string;
  reporterContact?: string;
  status: 'pendiente' | 'revisado' | 'descartado' | 'accion_tomada';
  createdAt: number;
}
