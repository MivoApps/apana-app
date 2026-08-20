import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  deleteDoc, 
  serverTimestamp,
  increment,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './config';
import { Store, Product } from '@/types/store';

// Helper para Sanitizar Slugs
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

// --- SERVICIOS DE USUARIOS (USERS) ---

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'merchant' | 'admin';
  createdAt: number;
}

export const createUserProfileInFS = async (userProfile: Omit<UserProfile, 'createdAt'> & { createdAt?: any }): Promise<void> => {
  try {
    // Usar el email como ID del documento en Firestore para fácil identificación visual en la consola
    const docId = userProfile.email ? userProfile.email.toLowerCase().trim() : userProfile.uid;
    const userRef = doc(db, 'users', docId);
    await setDoc(userRef, {
      ...userProfile,
      docId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error al crear perfil de usuario en Firestore:', error);
  }
};

export const getUserProfileFromFS = async (uidOrEmail: string): Promise<UserProfile | null> => {
  try {
    // Buscar por ID exacto (email/docId)
    const userRef = doc(db, 'users', uidOrEmail.toLowerCase().trim());
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }

    // Fallback: Buscar por UID en el campo uid
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('uid', '==', uidOrEmail));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as UserProfile;
    }

    return null;
  } catch (error) {
    console.error('Error al obtener perfil de usuario desde Firestore:', error);
    return null;
  }
};

// --- SERVICIOS DE TIENDA (STORES) ---

export const getStoreBySlugFromFS = async (slug: string): Promise<Store | null> => {
  // Manejo de la tienda demo oficial de muestra
  if (slug === 'panaderia-don-jose') {
    const { DEMO_STORE } = await import('@/lib/mock-demo-store');
    return DEMO_STORE;
  }

  try {
    const storesRef = collection(db, 'stores');
    const q = query(storesRef, where('slug', '==', slug));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docData = querySnapshot.docs[0].data();
      return {
        id: querySnapshot.docs[0].id,
        ...docData,
      } as Store;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener tienda por slug desde Firestore:', error);
    return null;
  }
};

export const getStoreByUserIdFromFS = async (userId: string): Promise<Store | null> => {
  try {
    // 1. Intentar consulta por documento directo store_${userId} (instantáneo O(1))
    const directDocRef = doc(db, 'stores', `store_${userId}`);
    const directSnap = await getDoc(directDocRef);
    
    if (directSnap.exists()) {
      return {
        id: directSnap.id,
        ...directSnap.data(),
      } as Store;
    }

    // 2. Fallback por si la tienda fue creada con otro ID
    const storesRef = collection(db, 'stores');
    const q = query(storesRef, where('ownerId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docData = querySnapshot.docs[0].data();
      return {
        id: querySnapshot.docs[0].id,
        ...docData,
      } as Store;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener tienda por userId desde Firestore:', error);
    return null;
  }
};

export const createOrUpdateStoreInFS = async (
  userId: string, 
  storeData: Partial<Store>
): Promise<Store> => {
  const baseSlug = storeData.slug || slugify(storeData.name || 'mi-tienda');
  const storeId = storeData.id || `store_${userId}`;

  const storeRef = doc(db, 'stores', storeId);
  const existingSnap = await getDoc(storeRef);
  const isNew = !existingSnap.exists();
  const existingData = existingSnap.exists() ? existingSnap.data() : null;

  const fullStore: Store = {
    id: storeId,
    name: storeData.name || (existingData?.name ?? 'Mi Tienda APANA'),
    slug: baseSlug,
    category: storeData.category || (existingData?.category ?? 'General'),
    whatsappPhone: storeData.whatsappPhone !== undefined ? storeData.whatsappPhone : (existingData?.whatsappPhone ?? ''),
    themeStyle: storeData.themeStyle || (existingData?.themeStyle ?? 'minimalista'),
    primaryColor: storeData.primaryColor || (existingData?.primaryColor ?? '#059669'),
    currency: storeData.currency || (existingData?.currency ?? 'PEN'),
    description: storeData.description !== undefined ? storeData.description : (existingData?.description ?? `Bienvenidos a ${storeData.name || 'nuestra tienda'}. Encuentra nuestros mejores productos y haz tu pedido directamente por WhatsApp.`),
    status: storeData.status || (existingData?.status ?? 'activa'),
    ownerId: userId,
    ownerEmail: storeData.ownerEmail !== undefined ? storeData.ownerEmail : (existingData?.ownerEmail ?? ''),
    ownerName: storeData.ownerName !== undefined ? storeData.ownerName : (existingData?.ownerName ?? ''),
    logoUrl: storeData.logoUrl !== undefined ? storeData.logoUrl : (existingData?.logoUrl ?? null),
    bannerUrl: storeData.bannerUrl !== undefined ? storeData.bannerUrl : (existingData?.bannerUrl ?? null),
    city: storeData.city !== undefined ? storeData.city : (existingData?.city ?? ''),
    department: storeData.department !== undefined ? storeData.department : (existingData?.department ?? ''),
    socialLinks: storeData.socialLinks !== undefined ? storeData.socialLinks : (existingData?.socialLinks ?? { instagram: '', facebook: '', tiktok: '' }),
    plan: storeData.plan || (existingData?.plan ?? 'gratis'),
    subscriptionStatus: storeData.subscriptionStatus || (existingData?.subscriptionStatus ?? 'free'),
    cancelAtPeriodEnd: storeData.cancelAtPeriodEnd !== undefined ? storeData.cancelAtPeriodEnd : (existingData?.cancelAtPeriodEnd ?? false),
    categories: storeData.categories !== undefined ? storeData.categories : (existingData?.categories ?? []),
    createdAt: existingData?.createdAt ?? undefined,
  };

  const payload: any = {
    ...fullStore,
    updatedAt: serverTimestamp(),
  };

  if (isNew || !existingData?.createdAt) {
    payload.createdAt = serverTimestamp();
  }

  await setDoc(storeRef, payload, { merge: true });

  return fullStore;
};

export const cancelSubscriptionInFS = async (storeId: string): Promise<void> => {
  const storeRef = doc(db, 'stores', storeId);
  await updateDoc(storeRef, {
    cancelAtPeriodEnd: true,
    subscriptionStatus: 'cancelled',
    updatedAt: serverTimestamp(),
  });
};

export const reactivateSubscriptionInFS = async (storeId: string): Promise<void> => {
  const storeRef = doc(db, 'stores', storeId);
  await updateDoc(storeRef, {
    cancelAtPeriodEnd: false,
    subscriptionStatus: 'active',
    updatedAt: serverTimestamp(),
  });
};

// --- SERVICIOS DE PRODUCTOS (PRODUCTS) ---

export const getProductsByStoreIdFromFS = async (storeId: string): Promise<Product[]> => {
  // Manejo de productos de la tienda demo oficial
  if (storeId === 'demo_panaderia_don_jose') {
    const { DEMO_PRODUCTS } = await import('@/lib/mock-demo-store');
    return DEMO_PRODUCTS;
  }

  try {
    const productsRef = collection(db, 'stores', storeId, 'products');
    const querySnapshot = await getDocs(productsRef);

    const products: Product[] = [];
    querySnapshot.forEach((docSnap) => {
      products.push({
        id: docSnap.id,
        ...docSnap.data(),
      } as Product);
    });

    // Ordenar de más reciente a más antiguo (createdAt descendente)
    products.sort((a: any, b: any) => {
      const timeA = typeof a.createdAt === 'number' ? a.createdAt : (a.createdAt?.toMillis ? a.createdAt.toMillis() : parseInt(a.id.replace('prod_', '')) || 0);
      const timeB = typeof b.createdAt === 'number' ? b.createdAt : (b.createdAt?.toMillis ? b.createdAt.toMillis() : parseInt(b.id.replace('prod_', '')) || 0);
      return timeB - timeA;
    });

    return products;
  } catch (error) {
    console.error('Error al obtener productos de tienda desde Firestore:', error);
    return [];
  }
};

export const addProductToFS = async (
  storeId: string, 
  productData: Omit<Product, 'id' | 'storeId'>
): Promise<Product> => {
  const productId = `prod_${Date.now()}`;
  const productRef = doc(db, 'stores', storeId, 'products', productId);

  const newProduct: Product = {
    id: productId,
    storeId,
    ...productData,
  };

  await setDoc(productRef, {
    ...newProduct,
    createdAt: serverTimestamp(),
  });

  return newProduct;
};

export const getProductByIdFromFS = async (storeId: string, productId: string): Promise<Product | null> => {
  try {
    const productRef = doc(db, 'stores', storeId, 'products', productId);
    const docSnap = await getDoc(productRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener producto por id de Firestore:', error);
    return null;
  }
};

export const updateProductInFS = async (
  storeId: string, 
  productId: string, 
  updates: Partial<Product>
): Promise<void> => {
  try {
    const productRef = doc(db, 'stores', storeId, 'products', productId);
    await updateDoc(productRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error al actualizar producto en Firestore:', error);
  }
};

export const deleteProductFromFS = async (storeId: string, productId: string): Promise<void> => {
  const productRef = doc(db, 'stores', storeId, 'products', productId);
  await deleteDoc(productRef);
};

export const recordAnalyticsEvent = async (storeId: string, eventType: 'visit' | 'click') => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  try {
    const docRef = doc(db, 'stores', storeId, 'analytics', dateStr);
    await setDoc(docRef, {
      visits: eventType === 'visit' ? increment(1) : increment(0),
      clicks: eventType === 'click' ? increment(1) : increment(0),
    }, { merge: true });
  } catch (error) {
    console.error('Error logging analytics event:', error);
  }
};

export const getStoreAnalyticsLast7Days = async (storeId: string) => {
  try {
    const results = [];
    const promises = [];
    const dates = [];

    // Generar ultimos 7 dias
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const weekday = d.toLocaleDateString('es-ES', { weekday: 'short' });
      const dayNum = d.getDate();
      const cleanLabel = (weekday.charAt(0).toUpperCase() + weekday.slice(1)).replace('.', '');

      dates.push({ dateStr, label: `${cleanLabel} ${dayNum}` });

      const docRef = doc(db, 'stores', storeId, 'analytics', dateStr);
      promises.push(getDoc(docRef));
    }

    const snapshots = await Promise.all(promises);

    for (let i = 0; i < snapshots.length; i++) {
      const snap = snapshots[i];
      const dateInfo = dates[i];
      let visits = 0;
      let clicks = 0;

      if (snap.exists()) {
        const data = snap.data();
        visits = data.visits || 0;
        clicks = data.clicks || 0;
      }

      results.push({
        date: dateInfo.dateStr,
        label: dateInfo.label,
        visits,
        clicks
      });
    }

    return results;
  } catch (error) {
    console.error('Error fetching store analytics:', error);
    return [];
  }
};

// --- SERVICIOS DE SUPERADMIN (OWNER APANA) ---

export interface AdminStoreItem extends Store {
  productCount?: number;
  ownerEmail?: string;
}

export const getAllStoresForAdminFromFS = async (): Promise<AdminStoreItem[]> => {
  try {
    const storesRef = collection(db, 'stores');
    const querySnapshot = await getDocs(storesRef);
    const stores: AdminStoreItem[] = [];

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data() as Store;
      
      // Contar productos de la subcolección
      let prodCount = 0;
      try {
        const prodsRef = collection(db, 'stores', docSnap.id, 'products');
        const prodsSnap = await getDocs(prodsRef);
        prodCount = prodsSnap.size;
      } catch (e) {}

      stores.push({
        ...data,
        id: docSnap.id,
        productCount: prodCount,
      });
    }

    // Ordenar tiendas por más recientes primero
    return stores.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (error) {
    console.error('Error al obtener todas las tiendas para SuperAdmin:', error);
    return [];
  }
};

export const adminUpdateStorePlanInFS = async (storeId: string, newPlan: 'gratis' | 'emprendedor'): Promise<void> => {
  try {
    const storeRef = doc(db, 'stores', storeId);
    await updateDoc(storeRef, {
      plan: newPlan,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error actualizando plan desde admin:', error);
    throw error;
  }
};

export const adminUpdateStoreStatusInFS = async (storeId: string, newStatus: 'activa' | 'pausada'): Promise<void> => {
  try {
    const storeRef = doc(db, 'stores', storeId);
    await updateDoc(storeRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error actualizando estado de tienda desde admin:', error);
    throw error;
  }
};

export const adminDeleteStoreAndProductsFromFS = async (storeId: string): Promise<void> => {
  try {
    // 1. Eliminar todos los productos de la subcolección
    const prodsRef = collection(db, 'stores', storeId, 'products');
    const prodsSnap = await getDocs(prodsRef);
    for (const pDoc of prodsSnap.docs) {
      await deleteDoc(doc(db, 'stores', storeId, 'products', pDoc.id));
    }

    // 2. Eliminar analíticas si existen
    const analyticsRef = collection(db, 'stores', storeId, 'analytics');
    const analyticsSnap = await getDocs(analyticsRef);
    for (const aDoc of analyticsSnap.docs) {
      await deleteDoc(doc(db, 'stores', storeId, 'analytics', aDoc.id));
    }

    // 3. Eliminar el documento de la tienda
    await deleteDoc(doc(db, 'stores', storeId));
  } catch (error) {
    console.error('Error al eliminar tienda y productos:', error);
    throw error;
  }
};

export const adminCleanSuperAdminStoresInFS = async (adminUid: string): Promise<number> => {
  try {
    let deleted = 0;
    // 1. Buscar tiendas asociadas a este UID (ownerId o userId)
    const storesRef = collection(db, 'stores');
    const q1 = query(storesRef, where('ownerId', '==', adminUid));
    const snap1 = await getDocs(q1);
    for (const sDoc of snap1.docs) {
      await adminDeleteStoreAndProductsFromFS(sDoc.id);
      deleted++;
    }

    const q2 = query(storesRef, where('userId', '==', adminUid));
    const snap2 = await getDocs(q2);
    for (const sDoc of snap2.docs) {
      if (!snap1.docs.some((d) => d.id === sDoc.id)) {
        await adminDeleteStoreAndProductsFromFS(sDoc.id);
        deleted++;
      }
    }

    // 2. Documento directo si existe
    const directRef = doc(db, 'stores', `store_${adminUid}`);
    const directSnap = await getDoc(directRef);
    if (directSnap.exists()) {
      await adminDeleteStoreAndProductsFromFS(`store_${adminUid}`);
      deleted++;
    }

    // 3. Actualizar rol en users/angelocastellanos99@gmail.com a 'admin'
    const userRef = doc(db, 'users', 'angelocastellanos99@gmail.com');
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      await updateDoc(userRef, { role: 'admin' });
    }

    return deleted;
  } catch (error) {
    console.error('Error al limpiar tiendas del superadmin:', error);
    return 0;
  }
};

export const adminUpdateStoreDetailsInFS = async (
  storeId: string, 
  data: { name: string; slug: string; whatsappPhone: string; plan: 'gratis' | 'emprendedor'; status: 'activa' | 'pausada' }
): Promise<void> => {
  try {
    const storeRef = doc(db, 'stores', storeId);
    await updateDoc(storeRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error al actualizar datos de tienda desde admin:', error);
    throw error;
  }
};

export interface AdminUserItem extends UserProfile {
  storeName?: string;
  storeSlug?: string;
  storePlan?: string;
}

export const getAllUsersForAdminFromFS = async (): Promise<AdminUserItem[]> => {
  try {
    const usersRef = collection(db, 'users');
    const usersSnap = await getDocs(usersRef);
    const usersList: AdminUserItem[] = [];

    // Traer tiendas para hacer el match
    const storesRef = collection(db, 'stores');
    const storesSnap = await getDocs(storesRef);
    const storesMap = new Map<string, Store>();
    storesSnap.docs.forEach((d) => {
      const s = d.data() as Store;
      const uidKey = s.ownerId || (s as any).userId;
      if (uidKey) storesMap.set(uidKey, { ...s, id: d.id });
    });

    for (const uDoc of usersSnap.docs) {
      const uData = uDoc.data() as UserProfile;
      const associatedStore = storesMap.get(uData.uid);
      usersList.push({
        ...uData,
        storeName: associatedStore?.name,
        storeSlug: associatedStore?.slug,
        storePlan: associatedStore?.plan,
      });
    }

    return usersList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (error) {
    console.error('Error al obtener lista de usuarios para SuperAdmin:', error);
    return [];
  }
};

export const adminDeleteUserFromFS = async (emailOrUid: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', emailOrUid.toLowerCase().trim());
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error al eliminar usuario en Firestore:', error);
    throw error;
  }
};

export interface PaymentRecord {
  id: string;
  storeId: string;
  amount: number;
  currency: string;
  email?: string;
  culqiChargeId?: string;
  status: 'approved' | 'rejected' | 'pending';
  plan: 'emprendedor';
  createdAt: number;
}

export const getAllPaymentRecordsForAdminFromFS = async (): Promise<PaymentRecord[]> => {
  try {
    const paymentsRef = collection(db, 'payment_records');
    const snap = await getDocs(paymentsRef);
    const list: PaymentRecord[] = [];
    snap.docs.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as PaymentRecord);
    });
    return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (error) {
    console.error('Error al obtener registros de pago:', error);
    return [];
  }
};

export const adminExtendStoreSubscriptionInFS = async (storeId: string, daysToAdd: number = 30): Promise<number> => {
  try {
    const storeRef = doc(db, 'stores', storeId);
    const snap = await getDoc(storeRef);
    if (!snap.exists()) throw new Error('Tienda no encontrada');

    const data = snap.data() as Store;
    const now = Date.now();
    const currentExpiry = (data.nextBillingDate && data.nextBillingDate > now) ? data.nextBillingDate : now;
    const newBillingDate = currentExpiry + (daysToAdd * 24 * 60 * 60 * 1000);

    await updateDoc(storeRef, {
      plan: 'emprendedor',
      subscriptionStatus: 'active',
      nextBillingDate: newBillingDate,
      lastPaymentDate: now,
      updatedAt: serverTimestamp(),
    });

    return newBillingDate;
  } catch (error) {
    console.error('Error al extender suscripción:', error);
    throw error;
  }
};
