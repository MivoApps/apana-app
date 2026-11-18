import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDfKAZ_wXMNGDf8Q0kKye3_m7dQMs1auIg',
  authDomain: 'apana-app-edf1a.firebaseapp.com',
  projectId: 'apana-app-edf1a',
  storageBucket: 'apana-app-edf1a.firebasestorage.app',
  messagingSenderId: '181478704106',
  appId: '1:181478704106:web:b08e995ff3524039d32893',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const SHOWCASE_PASSWORD = '12345678';
const STORE_EMAIL = 'elrincondulce@apana.pe';
const STORE_SLUG = 'el-rincon-dulce';

async function getOrCreateMerchantUser() {
  let user;
  try {
    const cred = await signInWithEmailAndPassword(auth, STORE_EMAIL, SHOWCASE_PASSWORD);
    user = cred.user;
    console.log(` ✅ Usuario Auth autenticado: ${STORE_EMAIL} (UID: ${user.uid})`);
  } catch (err) {
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      const cred = await createUserWithEmailAndPassword(auth, STORE_EMAIL, SHOWCASE_PASSWORD);
      user = cred.user;
      console.log(` ✨ Usuario Auth CREADO: ${STORE_EMAIL} (UID: ${user.uid})`);
    } else {
      throw err;
    }
  }

  await updateProfile(user, { displayName: 'El rincón dulce' }).catch(() => {});
  return user.uid;
}

async function seedElRinconDulce() {
  console.log('🍰 Iniciando creación de "El rincón dulce" en Producción (apana-app-edf1a)...');

  const uid = await getOrCreateMerchantUser();
  const storeId = 'store_' + uid;

  // 1. Guardar perfil de usuario en /users/{email}
  await setDoc(
    doc(db, 'users', STORE_EMAIL),
    {
      uid,
      name: 'El rincón dulce',
      email: STORE_EMAIL,
      role: 'merchant',
      country: 'PE',
      city: 'Lima',
      docId: STORE_EMAIL,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
  console.log(` ✅ Perfil de merchant guardado en /users/${STORE_EMAIL}`);

  // 2. Guardar datos de la tienda
  const storeData = {
    id: storeId,
    ownerId: uid,
    name: 'El rincón dulce',
    slug: STORE_SLUG,
    category: 'comida',
    status: 'activa',
    plan: 'emprendedor',
    description:
      'Pastelería artesanal y repostería fina. Brownies melosos, cheesecakes cremosos y tartaletas recién horneadas con ingredientes 100% naturales.',
    city: 'Lima',
    department: 'Lima',
    country: 'PE',
    primaryColor: '#D97706',
    themeStyle: 'fresh',
    headerStyle: 'card',
    heroStyle: 'glass',
    catalogLayout: 'grid',
    fontPairing: 'modern',
    shippingType: 'coordinar',
    whatsappPhone: '51987654321',
    isWhatsappVerified: true,
    showTrustBadges: true,
    productHoverZoom: true,
    announcementBar: '🧁 ¡Horneamos todos los días! Pide hoy o programa la fecha de tu evento por WhatsApp.',
    logoUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=80',
    schedule: 'Mar a Dom: 9:00 AM - 8:00 PM',
    socialLinks: {
      instagram: '@elrincondulce.pe',
      tiktok: '@elrincondulce.pe',
    },
    ownerEmail: STORE_EMAIL,
    ownerName: 'El rincón dulce',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'stores', storeId), storeData, { merge: true });
  console.log(` ✅ Tienda guardada en Firestore: ${storeData.name} (/s/${STORE_SLUG})`);

  // 3. Crear 12 productos de repostería
  const products = [
    {
      id: `${storeId}_prod_1`,
      storeId,
      title: 'Cheesecake Clásico de Frutos Rojos',
      price: 75.0,
      compareAtPrice: 85.0,
      description:
        'Delicioso cheesecake estilo New York horneado lentamente, base de galleta con mantequilla y abundante coulis artesanal de fresas, frambuesas y arándanos frescos.',
      category: 'Cheesecakes',
      badge: 'Más Vendido ⭐',
      imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80',
      imageUrls: [
        'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=80',
      ],
      inStock: true,
      featured: true,
      createdAt: Date.now() - 10000,
    },
    {
      id: `${storeId}_prod_2`,
      storeId,
      title: 'Brownies Fudge Melosos (Caja x6)',
      price: 36.0,
      compareAtPrice: 42.0,
      description:
        'Caja de 6 brownies ultra chocolatados con capa crocante superior y corazón meloso elaborado con 70% cacao orgánico peruano y trozos de nueces tostadas.',
      category: 'Brownies & Barras',
      badge: 'Favorito 🍫',
      imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
      imageUrls: [
        'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
      ],
      inStock: true,
      featured: true,
      createdAt: Date.now() - 20000,
    },
    {
      id: `${storeId}_prod_3`,
      storeId,
      title: 'Tartaleta de Fresas & Crema Pastelera',
      price: 48.0,
      description:
        'Masa sablée crocante de pura mantequilla, rellena con suave crema pastelera a la vainilla de Madagascar y cubierta de frescas fresas seleccionadas con brillo natural.',
      category: 'Tartaletas',
      badge: 'Recién Horneado',
      imageUrl: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=600&q=80',
      imageUrls: [
        'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=600&q=80',
      ],
      inStock: true,
      featured: true,
      createdAt: Date.now() - 30000,
    },
    {
      id: `${storeId}_prod_4`,
      storeId,
      title: 'Torta Carrot Cake con Frosting de Queso',
      price: 68.0,
      compareAtPrice: 78.0,
      description:
        'Bizcocho especiado súper húmedo de zanahoria con canela, nueces tostadas y relleno/cubierto de un sedoso frosting de queso crema con toque cítrico.',
      category: 'Tortas',
      badge: 'Especialidad',
      imageUrl: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=600&q=80',
      imageUrls: [
        'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=600&q=80',
      ],
      inStock: true,
      featured: true,
      createdAt: Date.now() - 40000,
    },
    {
      id: `${storeId}_prod_5`,
      storeId,
      title: 'Tartaleta de Limón Merengada (Lemon Pie)',
      price: 45.0,
      description:
        'Base crocante rellena de cuajada cremosa de limón criollo de balance perfecto entre dulce y ácido, coronada con suave merengue italiano flameado.',
      category: 'Tartaletas',
      badge: 'Clásico Cítrico',
      imageUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80',
      imageUrls: [
        'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80',
      ],
      inStock: true,
      featured: false,
      createdAt: Date.now() - 50000,
    },
    {
      id: `${storeId}_prod_6`,
      storeId,
      title: 'Cheesecake de Maracuyá',
      price: 72.0,
      description:
        'Delicada combinación de suave crema de queso sobre base crocante, decorado con una intensa reducción de pulpa de maracuyá fresca con sus semillas.',
      category: 'Cheesecakes',
      badge: 'Tropical',
      imageUrl: 'https://images.unsplash.com/photo-1567327613485-fbc7bf196198?auto=format&fit=crop&w=600&q=80',
      imageUrls: [
        'https://images.unsplash.com/photo-1567327613485-fbc7bf196198?auto=format&fit=crop&w=600&q=80',
      ],
      inStock: true,
      featured: false,
      createdAt: Date.now() - 60000,
    },
    {
      id: `${storeId}_prod_7`,
      storeId,
      title: 'Alfajores Finos de Maicena (Caja x12)',
      price: 28.0,
      description:
        'Delicadísimos alfajores tradicionales que se deshacen suavemente en el paladar, rellenos de auténtico manjar blanco de olla y espolvoreados con azúcar flor.',
      category: 'Bocaditos',
      badge: 'Para Compartir',
      imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80',
      imageUrls: [
        'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80',
      ],
      inStock: true,
      featured: false,
      createdAt: Date.now() - 70000,
    },
    {
      id: `${storeId}_prod_8`,
      storeId,
      title: 'Torta Selva Negra Tradicional',
      price: 85.0,
      compareAtPrice: 95.0,
      description:
        'Tres capas de suave bizcochuelo de chocolate embebidas en almíbar de cerezas, rellenas de crema chantilly fresca, cerezas negras y virutas de chocolate bitter.',
      category: 'Tortas',
      badge: 'Elegante',
      imageUrl: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=600&q=80',
      imageUrls: [
        'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=600&q=80',
      ],
      inStock: true,
      featured: false,
      createdAt: Date.now() - 80000,
    },
    {
      id: `${storeId}_prod_9`,
      storeId,
      title: 'Brookie Box (Mitad Brownie, Mitad Cookie x6)',
      price: 42.0,
      description:
        'Lo mejor de dos mundos: base de brownie fudge coronada con masa de galleta crujiente con chispas de chocolate semiamargo. Caja de 6 porciones.',
      category: 'Brownies & Barras',
      badge: 'Tendencia 🍪',
      imageUrl: 'https://images.unsplash.com/photo-1589218436045-ee320057f443?auto=format&fit=crop&w=600&q=80',
      imageUrls: [
        'https://images.unsplash.com/photo-1589218436045-ee320057f443?auto=format&fit=crop&w=600&q=80',
      ],
      inStock: true,
      featured: false,
      createdAt: Date.now() - 90000,
    },
    {
      id: `${storeId}_prod_10`,
      storeId,
      title: 'Tartaleta de Manzana Rústica con Canela',
      price: 46.0,
      description:
        'Finas láminas de manzana caramelizadas al horno con mantequilla dorada, canela aromática y láminas de almendras sobre crujiente masa quebrada.',
      category: 'Tartaletas',
      badge: 'Casera',
      imageUrl: 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?auto=format&fit=crop&w=600&q=80',
      imageUrls: [
        'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?auto=format&fit=crop&w=600&q=80',
      ],
      inStock: true,
      featured: false,
      createdAt: Date.now() - 100000,
    },
    {
      id: `${storeId}_prod_11`,
      title: 'Torta Red Velvet Suave con Vainilla',
      price: 78.0,
      description:
        'Exquisito bizcocho terciopelo rojo con notas sutiles de cacao puro, alternado con capas generosas de frosting de crema batida y vainilla natural.',
      category: 'Tortas',
      badge: 'Celebración',
      imageUrl: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=600&q=80',
      imageUrls: [
        'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=600&q=80',
      ],
      inStock: true,
      featured: false,
      createdAt: Date.now() - 110000,
    },
    {
      id: `${storeId}_prod_12`,
      storeId,
      title: 'Cinnamon Rolls con Glaseado de Queso (Pack x4)',
      price: 32.0,
      description:
        'Rollos de canela extra tiernos y esponjosos horneados diariamente con mantequilla y abundante canela, bañados en glaseado de queso crema.',
      category: 'Bocaditos',
      badge: 'Recién Salido del Horno',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      imageUrls: [
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      ],
      inStock: true,
      featured: false,
      createdAt: Date.now() - 120000,
    },
  ];

  const batch = writeBatch(db);
  for (const prod of products) {
    const prodRef = doc(db, 'stores', storeId, 'products', prod.id);
    batch.set(prodRef, prod, { merge: true });
  }

  await batch.commit();
  console.log(` ✅ ${products.length} productos de repostería agregados exitosamente.`);
  console.log(`\n🎉 TIENDA LISTA EN PRODUCCIÓN:`);
  console.log(`   🔗 Enlace Público: https://beapana.com/s/${STORE_SLUG}`);
  console.log(`   👤 Credenciales Merchant: ${STORE_EMAIL} / ${SHOWCASE_PASSWORD}\n`);

  process.exit(0);
}

seedElRinconDulce().catch((err) => {
  console.error('Error al sembrar tienda en prod:', err);
  process.exit(1);
});
