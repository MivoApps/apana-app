import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc,
  query, 
  where, 
  deleteDoc, 
  serverTimestamp,
  increment,
  orderBy,
  limit,
  Timestamp,
  writeBatch
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

// Palabras reservadas que no pueden ser slugs de tiendas públicas
const RESERVED_SLUGS = [
  'panaderia-don-jose',
  'admin',
  'login',
  'register',
  'dashboard',
  'products',
  'settings',
  'plans',
  'orders',
  'qr',
  'analytics',
  'forgot-password',
  'store-not-found',
  'libro-de-reclamaciones',
  'terms',
  'api'
];

export const isStoreSlugAvailableInFS = async (slug: string, currentStoreId?: string): Promise<boolean> => {
  const clean = slugify(slug);
  if (!clean || RESERVED_SLUGS.includes(clean)) {
    return false;
  }
  try {
    const storesRef = collection(db, 'stores');
    const q = query(storesRef, where('slug', '==', clean));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return true;
    // Si la única tienda que tiene ese slug es la misma tienda actual, está disponible
    if (currentStoreId && querySnapshot.docs.length === 1 && querySnapshot.docs[0].id === currentStoreId) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error al verificar disponibilidad de slug:', error);
    return false;
  }
};

export const generateUniqueStoreSlugInFS = async (baseNameOrSlug: string, currentStoreId?: string): Promise<string> => {
  let base = slugify(baseNameOrSlug || 'mi-tienda');
  if (!base) base = 'mi-tienda';

  const isAvailable = await isStoreSlugAvailableInFS(base, currentStoreId);
  if (isAvailable) return base;

  let counter = 2;
  while (counter <= 50) {
    const candidate = `${base}-${counter}`;
    const candidateAvailable = await isStoreSlugAvailableInFS(candidate, currentStoreId);
    if (candidateAvailable) return candidate;
    counter++;
  }
  return `${base}-${Math.floor(1000 + Math.random() * 9000)}`;
};

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
  const storeId = storeData.id || `store_${userId}`;
  const storeRef = doc(db, 'stores', storeId);
  const existingSnap = await getDoc(storeRef);
  const isNew = !existingSnap.exists();
  const existingData = existingSnap.exists() ? existingSnap.data() : null;

  // Garantizar Slug 100% Único (Previene colisión o sobreescritura de catálogos ajenos)
  let finalSlug: string;
  if (isNew) {
    finalSlug = await generateUniqueStoreSlugInFS(storeData.slug || storeData.name || 'mi-tienda', storeId);
  } else {
    // Si ya existe la tienda y se especifica un slug diferente al actual, validar unicidad
    if (storeData.slug && storeData.slug !== existingData?.slug) {
      finalSlug = await generateUniqueStoreSlugInFS(storeData.slug, storeId);
    } else {
      finalSlug = existingData?.slug || (await generateUniqueStoreSlugInFS(storeData.name || 'mi-tienda', storeId));
    }
  }

  const fullStore: Store = {
    id: storeId,
    name: storeData.name || (existingData?.name ?? 'Mi Tienda APANA'),
    slug: finalSlug,
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
    schedule: storeData.schedule !== undefined ? storeData.schedule : (existingData?.schedule ?? ''),
    shippingType: storeData.shippingType !== undefined ? storeData.shippingType : (existingData?.shippingType ?? 'coordinar'),
    shippingNotes: storeData.shippingNotes !== undefined ? storeData.shippingNotes : (existingData?.shippingNotes ?? ''),
    socialLinks: storeData.socialLinks !== undefined ? storeData.socialLinks : (existingData?.socialLinks ?? { instagram: '', facebook: '', tiktok: '' }),
    plan: storeData.plan || (existingData?.plan ?? 'gratis'),
    subscriptionStatus: storeData.subscriptionStatus || (existingData?.subscriptionStatus ?? 'free'),
    cancelAtPeriodEnd: storeData.cancelAtPeriodEnd !== undefined ? storeData.cancelAtPeriodEnd : (existingData?.cancelAtPeriodEnd ?? false),
    subscriptionStartDate: storeData.subscriptionStartDate !== undefined ? storeData.subscriptionStartDate : (existingData?.subscriptionStartDate ?? null),
    nextBillingDate: storeData.nextBillingDate !== undefined ? storeData.nextBillingDate : (existingData?.nextBillingDate ?? null),
    lastPaymentDate: storeData.lastPaymentDate !== undefined ? storeData.lastPaymentDate : (existingData?.lastPaymentDate ?? null),
    lastPaymentAmount: storeData.lastPaymentAmount !== undefined ? storeData.lastPaymentAmount : (existingData?.lastPaymentAmount ?? null),
    lastCulqiChargeId: storeData.lastCulqiChargeId !== undefined ? storeData.lastCulqiChargeId : (existingData?.lastCulqiChargeId ?? null),
    categories: storeData.categories !== undefined ? storeData.categories : (existingData?.categories ?? []),
    isWhatsappVerified: storeData.isWhatsappVerified !== undefined ? storeData.isWhatsappVerified : (existingData?.isWhatsappVerified ?? false),
    whatsappVerificationCode: storeData.whatsappVerificationCode !== undefined ? storeData.whatsappVerificationCode : (existingData?.whatsappVerificationCode ?? ''),
    whatsappVerifiedAt: storeData.whatsappVerifiedAt !== undefined ? storeData.whatsappVerifiedAt : (existingData?.whatsappVerifiedAt ?? null),
    downgradedAt: storeData.downgradedAt !== undefined ? storeData.downgradedAt : (existingData?.downgradedAt ?? null),
    dataRetentionUntil: storeData.dataRetentionUntil !== undefined ? storeData.dataRetentionUntil : (existingData?.dataRetentionUntil ?? null),
    createdAt: existingData?.createdAt ?? null,
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

  const cleanPayload: Record<string, any> = {};
  for (const [key, value] of Object.entries(newProduct)) {
    if (value !== undefined) {
      cleanPayload[key] = value;
    }
  }

  await setDoc(productRef, {
    ...cleanPayload,
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
    const cleanUpdates: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }

    await updateDoc(productRef, {
      ...cleanUpdates,
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

export interface StoreAnalyticsDay {
  date: string;
  label: string;
  visits: number;
  clicks: number;
  productViews: number;
  cartAdds: number;
  hourlyVisits?: Record<string, number>;
  hourlyClicks?: Record<string, number>;
  dayOfWeek?: number;
}

export const recordAnalyticsEvent = async (
  storeId: string, 
  eventType: 'visit' | 'click' | 'product_view' | 'cart_add'
) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  const currentHour = today.getHours();

  try {
    const docRef = doc(db, 'stores', storeId, 'analytics', dateStr);
    const updates: Record<string, any> = {};

    if (eventType === 'visit') {
      updates.visits = increment(1);
      updates[`hourlyVisits.${currentHour}`] = increment(1);
    } else if (eventType === 'click') {
      updates.clicks = increment(1);
      updates[`hourlyClicks.${currentHour}`] = increment(1);
    } else if (eventType === 'product_view') {
      updates.productViews = increment(1);
    } else if (eventType === 'cart_add') {
      updates.cartAdds = increment(1);
    }

    await setDoc(docRef, updates, { merge: true });
  } catch (error) {
    console.error('Error logging analytics event:', error);
  }
};

export const getStoreAnalyticsDays = async (storeId: string, daysCount: number = 7): Promise<StoreAnalyticsDay[]> => {
  try {
    const results: StoreAnalyticsDay[] = [];
    const promises = [];
    const dates = [];

    // Generar ultimos N dias
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const weekday = d.toLocaleDateString('es-ES', { weekday: 'short' });
      const dayNum = d.getDate();
      const monthShort = d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
      const cleanLabel = daysCount > 7 
        ? `${dayNum} ${monthShort}`
        : `${(weekday.charAt(0).toUpperCase() + weekday.slice(1)).replace('.', '')} ${dayNum}`;

      dates.push({ dateStr, label: cleanLabel, dayOfWeek: d.getDay() });

      const docRef = doc(db, 'stores', storeId, 'analytics', dateStr);
      promises.push(getDoc(docRef));
    }

    const snapshots = await Promise.all(promises);

    for (let i = 0; i < snapshots.length; i++) {
      const snap = snapshots[i];
      const dateInfo = dates[i];
      let visits = 0;
      let clicks = 0;
      let productViews = 0;
      let cartAdds = 0;
      let hourlyVisits: Record<string, number> = {};
      let hourlyClicks: Record<string, number> = {};

      if (snap.exists()) {
        const data = snap.data();
        visits = data.visits || 0;
        clicks = data.clicks || 0;
        productViews = data.productViews || 0;
        cartAdds = data.cartAdds || 0;
        hourlyVisits = data.hourlyVisits || {};
        hourlyClicks = data.hourlyClicks || {};
      }

      results.push({
        date: dateInfo.dateStr,
        label: dateInfo.label,
        dayOfWeek: dateInfo.dayOfWeek,
        visits,
        clicks,
        productViews,
        cartAdds,
        hourlyVisits,
        hourlyClicks,
      });
    }

    return results;
  } catch (error) {
    console.error('Error fetching store analytics:', error);
    return [];
  }
};

export const getStoreAnalyticsLast7Days = async (storeId: string) => {
  return getStoreAnalyticsDays(storeId, 7);
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

export const adminUpdateStorePlanInFS = async (storeId: string, newPlan: 'gratis' | 'emprendedor' | 'negocio'): Promise<void> => {
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

    // 3. Actualizar rol a 'admin' para los superadmins
    const adminEmails = ['angelo@mivo.pe', 'angelocastellanos99@gmail.com'];
    for (const email of adminEmails) {
      const uRef = doc(db, 'users', email);
      const uSnap = await getDoc(uRef);
      if (uSnap.exists()) {
        await updateDoc(uRef, { role: 'admin' });
      }
    }

    return deleted;
  } catch (error) {
    console.error('Error al limpiar tiendas del superadmin:', error);
    return 0;
  }
};

export const adminUpdateStoreDetailsInFS = async (
  storeId: string, 
  data: { name: string; slug: string; whatsappPhone: string; plan: 'gratis' | 'emprendedor' | 'negocio'; status: 'activa' | 'pausada'; isWhatsappVerified?: boolean }
): Promise<string> => {
  try {
    const validatedSlug = await generateUniqueStoreSlugInFS(data.slug || data.name, storeId);
    const storeRef = doc(db, 'stores', storeId);
    await updateDoc(storeRef, {
      ...data,
      slug: validatedSlug,
      updatedAt: serverTimestamp(),
    });
    return validatedSlug;
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

export const adminToggleWhatsappVerificationInFS = async (storeId: string, isVerified: boolean): Promise<void> => {
  try {
    const storeRef = doc(db, 'stores', storeId);
    await updateDoc(storeRef, {
      isWhatsappVerified: isVerified,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error al cambiar verificación de WhatsApp:', error);
    throw error;
  }
};

export const adminUpdateUserDetailsInFS = async (
  emailOrUid: string,
  data: { name?: string; phone?: string; role?: 'merchant' | 'admin' }
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', emailOrUid.toLowerCase().trim());
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error al actualizar datos de usuario en Firestore:', error);
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

// ==========================================
// SOLICITUDES DE VERIFICACIÓN OTP WHATSAPP
// ==========================================

export interface OtpRequest {
  phone: string; // ej: "51987654321"
  code: string; // 6 dígitos ej: "482910"
  storeId: string;
  storeName: string;
  userId: string;
  status: 'pending' | 'verified' | 'expired';
  createdAt: number;
  expiresAt: number;
  otpSentAt?: number;
}

// Limpieza automática de OTPs expirados o abandonados (> 15 min)
export const cleanupExpiredOtpRequestsInFS = async (): Promise<number> => {
  try {
    const otpRef = collection(db, 'otp_requests');
    const nowTimestamp = Timestamp.now();
    const q = query(otpRef, where('expiresAt', '<', nowTimestamp));
    const snap = await getDocs(q);

    if (snap.empty) return 0;

    let deletedCount = 0;
    const batch = writeBatch(db);
    snap.docs.forEach((d) => {
      batch.delete(d.ref);
      deletedCount++;
    });
    await batch.commit();
    return deletedCount;
  } catch (error) {
    console.warn('Aviso limpiando OTPs expirados:', error);
    return 0;
  }
};

export const createOtpRequestInFS = async (
  rawPhone: string,
  code: string,
  storeId: string,
  storeName: string,
  userId: string
): Promise<boolean> => {
  try {
    // Limpieza pasiva en segundo plano
    cleanupExpiredOtpRequestsInFS().catch(() => {});

    const digitsOnly = rawPhone.replace(/\D/g, '');
    const cleanPhone = digitsOnly.startsWith('51') ? digitsOnly : `51${digitsOnly}`;

    const otpDocRef = doc(db, 'otp_requests', cleanPhone);
    const now = Date.now();
    const expiryMillis = now + 15 * 60 * 1000; // 15 minutos de validez

    await setDoc(otpDocRef, {
      phone: cleanPhone,
      code,
      storeId,
      storeName,
      userId,
      status: 'pending',
      createdAt: Timestamp.fromMillis(now),
      expiresAt: Timestamp.fromMillis(expiryMillis),
    }, { merge: true });

    return true;
  } catch (error) {
    console.error('Error creando solicitud OTP en Firestore:', error);
    return false;
  }
};

export const verifyOtpCodeInFS = async (
  rawPhone: string,
  inputCode: string,
  storeId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const digitsOnly = rawPhone.replace(/\D/g, '');
    const cleanPhone = digitsOnly.startsWith('51') ? digitsOnly : `51${digitsOnly}`;

    const otpDocRef = doc(db, 'otp_requests', cleanPhone);
    const snap = await getDoc(otpDocRef);

    if (!snap.exists()) {
      return { success: false, error: 'No se encontró una solicitud pendiente para este número.' };
    }

    const data = snap.data();

    if (data.code !== inputCode.trim()) {
      return { success: false, error: 'El código ingresado es incorrecto.' };
    }

    const expiresAtMillis = data.expiresAt?.toMillis ? data.expiresAt.toMillis() : Number(data.expiresAt || 0);
    if (Date.now() > expiresAtMillis) {
      return { success: false, error: 'El código ha expirado. Solicita uno nuevo por WhatsApp.' };
    }

    // Eliminar la solicitud de OTP inmediatamente tras su uso exitoso para mantener Firestore 100% limpio
    await deleteDoc(otpDocRef);

    // Actualizar la tienda a verificada
    const storeRef = doc(db, 'stores', storeId);
    await updateDoc(storeRef, {
      isWhatsappVerified: true,
      whatsappPhone: cleanPhone,
      whatsappVerifiedAt: Date.now(),
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error verificando OTP en Firestore:', error);
    return { success: false, error: error?.message || 'Error al validar el código.' };
  }
};

// --- SERVICIOS DE PEDIDOS (ORDERS) ---

export interface StoreOrder {
  id: string;
  storeId: string;
  customerName?: string;
  customerAddress?: string;
  paymentMethod?: string;
  items: Array<{
    id: string;
    title: string;
    price: number;
    quantity: number;
    selectedOption?: string;
  }>;
  total: number;
  status: 'enviado_whatsapp' | 'entregado' | 'cancelado';
  createdAt: any;
}

export const recordStoreOrderInFS = async (
  storeId: string,
  orderData: Omit<StoreOrder, 'id' | 'createdAt'>
): Promise<string> => {
  try {
    const orderId = `ord_${Date.now()}`;
    const orderRef = doc(db, 'stores', storeId, 'orders', orderId);
    await setDoc(orderRef, {
      ...orderData,
      id: orderId,
      createdAt: serverTimestamp(),
    });
    return orderId;
  } catch (error) {
    console.error('Error registrando pedido en Firestore:', error);
    return '';
  }
};

export const getStoreOrdersFromFS = async (storeId: string): Promise<StoreOrder[]> => {
  try {
    const ordersRef = collection(db, 'stores', storeId, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as StoreOrder));
  } catch (error) {
    console.error('Error obteniendo pedidos desde Firestore:', error);
    return [];
  }
};

export interface ReclamacionItem {
  id: string;
  claimCode: string;
  fullName: string;
  docType: string;
  docNumber: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  isMinor: boolean;
  parentName?: string;
  contractType: string;
  amount?: string;
  goodDescription: string;
  claimType: 'reclamo' | 'queja';
  detail: string;
  consumerRequest: string;
  status: 'pendiente' | 'atendido';
  responseNotes?: string;
  createdAt: number;
}

export const createReclamacionInFS = async (data: Omit<ReclamacionItem, 'id' | 'createdAt' | 'status'>): Promise<string> => {
  try {
    const reclamacionesRef = collection(db, 'reclamaciones');
    const newDoc = await addDoc(reclamacionesRef, {
      ...data,
      status: 'pendiente',
      createdAt: Date.now(),
    });
    return newDoc.id;
  } catch (error) {
    console.error('Error guardando reclamación en Firestore:', error);
    return '';
  }
};

export const getAllReclamacionesForAdminFromFS = async (): Promise<ReclamacionItem[]> => {
  try {
    const reclamacionesRef = collection(db, 'reclamaciones');
    const snap = await getDocs(reclamacionesRef);
    const list: ReclamacionItem[] = [];
    snap.docs.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as ReclamacionItem);
    });
    return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (error) {
    console.error('Error obteniendo reclamaciones para SuperAdmin:', error);
    return [];
  }
};

export const adminUpdateReclamacionStatusInFS = async (
  id: string,
  status: 'pendiente' | 'atendido',
  responseNotes?: string
): Promise<void> => {
  try {
    const docRef = doc(db, 'reclamaciones', id);
    await updateDoc(docRef, {
      status,
      responseNotes: responseNotes || '',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error actualizando estado de reclamación:', error);
    throw error;
  }
};

export interface GlobalAnnouncement {
  message: string;
  active: boolean;
  type: 'info' | 'warning' | 'success';
  updatedAt?: number;
}

export const adminSaveGlobalAnnouncementInFS = async (announcement: GlobalAnnouncement): Promise<void> => {
  try {
    const docRef = doc(db, 'system_settings', 'global_announcement');
    await setDoc(docRef, {
      ...announcement,
      updatedAt: Date.now(),
    }, { merge: true });
  } catch (error) {
    console.error('Error guardando anuncio global en Firestore:', error);
    throw error;
  }
};

export const getGlobalAnnouncementFromFS = async (): Promise<GlobalAnnouncement | null> => {
  try {
    const docRef = doc(db, 'system_settings', 'global_announcement');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as GlobalAnnouncement;
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo anuncio global:', error);
    return null;
  }
};


