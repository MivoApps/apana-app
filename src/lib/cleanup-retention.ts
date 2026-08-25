import { collection, getDocs, doc, deleteDoc, query, orderBy, where, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Product, Store } from '@/types/store';

/**
 * 🛡️ APANA - Estándar de Retención de Datos de 6 Meses (180 Días)
 * 
 * Regla de Negocio:
 * - Cuando un comercio pasa a Plan Gratis, sus datos Pro (productos excedentes del 26 en adelante,
 *   fotos adicionales y configuraciones) permanecen resguardados de forma segura durante 180 días.
 * - Trascurrido el período de gracia de 6 meses (dataRetentionUntil < now), si el comerciante no
 *   ha reactivado un plan de pago, esta rutina libera memoria eliminando los ítems excedentes.
 */
export async function pruneExpiredStoreData(storeId: string): Promise<{ prunedProductsCount: number }> {
  try {
    const productsRef = collection(db, 'stores', storeId, 'products');
    const q = query(productsRef, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);

    const allProducts: Product[] = [];
    snapshot.forEach((d) => {
      allProducts.push({ id: d.id, ...d.data() } as Product);
    });

    const MAX_FREE_PRODUCTS = 25;
    let prunedProductsCount = 0;

    if (allProducts.length > MAX_FREE_PRODUCTS) {
      const productsToDelete = allProducts.slice(MAX_FREE_PRODUCTS);
      for (const prod of productsToDelete) {
        await deleteDoc(doc(db, 'stores', storeId, 'products', prod.id));
        prunedProductsCount++;
      }
    }

    return { prunedProductsCount };
  } catch (error) {
    console.error(`Error podando datos expirados de la tienda ${storeId}:`, error);
    throw error;
  }
}
