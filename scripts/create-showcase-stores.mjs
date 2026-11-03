import { Firestore, FieldValue } from '@google-cloud/firestore';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs';
import os from 'os';

const p = os.homedir() + '/.config/configstore/firebase-tools.json';
if (!fs.existsSync(p)) {
  console.error('firebase-tools config not found at:', p);
  process.exit(1);
}

const configData = JSON.parse(fs.readFileSync(p, 'utf8'));
const client = new OAuth2Client();
client.setCredentials(configData.tokens);

const db = new Firestore({
  projectId: 'apana-app-edf1a',
  authClient: client
});

const SHOWCASE_PASSWORD = '12345678';

async function getAccessToken() {
  const tokenResponse = await client.getAccessToken();
  return tokenResponse.token;
}

async function createOrUpdateAuthUser(email, password, displayName) {
  const token = await getAccessToken();

  // 1. Check if user exists
  const lookupRes = await fetch('https://identitytoolkit.googleapis.com/v1/projects/apana-app-edf1a/accounts:lookup', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: [email] })
  }).then(r => r.json());

  if (lookupRes.users && lookupRes.users.length > 0) {
    const existing = lookupRes.users[0];
    const uid = existing.localId;
    // Update password & displayName
    await fetch('https://identitytoolkit.googleapis.com/v1/projects/apana-app-edf1a/accounts:update', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        localId: uid,
        password: password,
        displayName: displayName,
        emailVerified: true
      })
    });
    console.log(` ✅ Usuario Auth actualizado: ${email} (UID: ${uid})`);
    return uid;
  } else {
    // Create new user
    const createRes = await fetch('https://identitytoolkit.googleapis.com/v1/projects/apana-app-edf1a/accounts', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password,
        displayName: displayName,
        emailVerified: true
      })
    }).then(r => r.json());

    if (!createRes.localId) {
      throw new Error(`Failed to create Auth user: ${JSON.stringify(createRes)}`);
    }
    console.log(` ✨ Usuario Auth creado exitosamente: ${email} (UID: ${createRes.localId})`);
    return createRes.localId;
  }
}

const SHOWCASE_STORES = [
  {
    email: 'demo.moda@apana.pe',
    name: 'Kicks & Street Perú',
    slug: 'kicks-street',
    plan: 'negocio',
    themeStyle: 'moderna',
    primaryColor: '#0f172a',
    category: 'moda',
    description: 'Sneakers exclusivos, zapatillas urbanas y ropa streetwear 100% original con envíos a todo el Perú.',
    whatsappPhone: '51967335264',
    ownerName: 'Carlos Mendoza',
    city: 'Lima',
    department: 'Lima',
    schedule: 'Lunes a Sábado: 10:00 AM - 8:30 PM',
    shippingType: 'coordinar',
    shippingNotes: 'Envíos en Lima en 24h vía motorizado express. A provincias vía Shalom u Olva Courier.',
    pickupAddress: 'Av. Conquistadores 450, Tienda 12, San Isidro, Lima',
    socialLinks: {
      instagram: 'kicksstreet.pe',
      tiktok: 'kicksstreet.pe',
      facebook: 'kicksstreetpe'
    },
    legalBusinessName: 'URBAN KICKS & STREETWEAR S.A.C.',
    legalTaxIdType: 'RUC',
    legalTaxId: '20608945123',
    legalAddress: 'Av. Conquistadores 450, San Isidro, Lima',
    storePolicies: '1. Envíos a todo Lima en 24-48 horas hábiles.\n2. Cambios de talla permitidos dentro de los primeros 7 días con empaque original intacto.\n3. Garantía del 100% en autenticidad de calzado y prendas.\n4. Todos los precios incluyen IGV y se emite boleta o factura electrónica.',
    categories: ['Zapatillas', 'Hoodies & Poleras', 'Accesorios'],
    products: [
      {
        id: 'prod_kicks_1',
        title: "Nike Dunk Low Retro 'Panda'",
        price: 489,
        category: 'Zapatillas',
        description: 'El clásico atemporal en blanco y negro. Cuero prémium resistente, suela de goma con tracción duradera y diseño icónico.',
        inStock: true,
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
        options: [
          {
            name: 'Talla (PE / US)',
            values: [
              { id: 't40', name: '40 PE / 8.5 US', priceDifference: 0 },
              { id: 't41', name: '41 PE / 9.5 US', priceDifference: 0 },
              { id: 't42', name: '42 PE / 10 US', priceDifference: 0 }
            ]
          }
        ]
      },
      {
        id: 'prod_kicks_2',
        title: 'Adidas Samba OG Classic White',
        price: 429,
        category: 'Zapatillas',
        description: 'La silueta más codiciada del año. Capellada de cuero suave con detalles en gamuza beige y suela de caucho caramelo original.',
        inStock: true,
        imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
        options: [
          {
            name: 'Talla',
            values: [
              { id: 's39', name: '39 PE', priceDifference: 0 },
              { id: 's40', name: '40 PE', priceDifference: 0 },
              { id: 's41', name: '41 PE', priceDifference: 0 }
            ]
          }
        ]
      },
      {
        id: 'prod_kicks_3',
        title: 'Hoodie Oversize Street Heavyweight 400 GSM',
        price: 159,
        category: 'Hoodies & Poleras',
        description: 'Algodón peruano pesado de 400 gramos. Corte boxy oversize, capucha doble sin cordones y bolsillo canguro reforzado.',
        inStock: true,
        imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
        options: [
          {
            name: 'Color',
            values: [
              { id: 'c_negro', name: 'Negro Washed', priceDifference: 0 },
              { id: 'c_gris', name: 'Gris Melange', priceDifference: 0 }
            ]
          },
          {
            name: 'Talla',
            values: [
              { id: 't_s', name: 'S', priceDifference: 0 },
              { id: 't_m', name: 'M', priceDifference: 0 },
              { id: 't_l', name: 'L', priceDifference: 0 }
            ]
          }
        ]
      },
      {
        id: 'prod_kicks_4',
        title: 'New Balance 550 White Forest Green',
        price: 459,
        category: 'Zapatillas',
        description: 'Homenaje al baloncesto retro de los 80. Estructura robusta, detalles en verde bosque y máxima amortiguación.',
        inStock: true,
        imageUrl: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop&q=80',
        options: [
          {
            name: 'Talla',
            values: [
              { id: 'nb41', name: '41 PE', priceDifference: 0 },
              { id: 'nb42', name: '42 PE', priceDifference: 0 }
            ]
          }
        ]
      }
    ]
  },
  {
    email: 'demo.cafe@apana.pe',
    name: 'Origen Café & Bakery',
    slug: 'origen-cafe',
    plan: 'emprendedor',
    themeStyle: 'elegante',
    primaryColor: '#854d0e',
    category: 'alimentos',
    description: 'Café de especialidad de origen cusqueño y cajamarquino, repostería artesanal y panes de masa madre recién horneados.',
    whatsappPhone: '51967335264',
    ownerName: 'Renato Salazar',
    city: 'Lima',
    department: 'Lima',
    schedule: 'Lunes a Domingo: 7:30 AM - 9:00 PM',
    shippingType: 'ambos',
    shippingNotes: 'Delivery en Lima en menos de 90 minutos para productos horneados.',
    pickupAddress: 'Calle Berlín 290, Miraflores, Lima',
    socialLinks: {
      instagram: 'origencafe.pe',
      facebook: 'origencafebakery'
    },
    legalBusinessName: 'TOSTADURIA & PANADERIA ORIGEN S.A.C.',
    legalTaxIdType: 'RUC',
    legalTaxId: '20604128901',
    legalAddress: 'Calle Berlín 290, Miraflores, Lima',
    storePolicies: '1. Productos perecibles y de panadería horneados en el día.\n2. Despacho rápido para conservar frescura y temperatura.\n3. Recojo disponible en tienda sin costo adicional.',
    categories: ['Café en Grano & Molido', 'Panadería & Pastelería', 'Bebidas'],
    products: [
      {
        id: 'prod_cafe_1',
        title: 'Café de Especialidad Cusco Quillabamba 250g',
        price: 38,
        category: 'Café en Grano & Molido',
        description: 'Puntaje SCA 86. Notas a chocolate amargo, frutos rojos y miel de chancaca. Altura: 1,850 msnm. Tueste medio artesanal.',
        inStock: true,
        imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80',
        options: [
          {
            name: 'Molienda',
            values: [
              { id: 'm_grano', name: 'Grano Entero (Para Moler en Casa)', priceDifference: 0 },
              { id: 'm_filtro', name: 'Molido para Cafetera / V60', priceDifference: 0 },
              { id: 'm_francesa', name: 'Molido Grueso para Prensa Francesa', priceDifference: 0 }
            ]
          }
        ]
      },
      {
        id: 'prod_cafe_2',
        title: 'Croissant Francés de Mantequilla (Caja x 4)',
        price: 34,
        category: 'Panadería & Pastelería',
        description: 'Hojaldre 100% laminado con mantequilla natural europea. Dorado, crocante por fuera y tierno y alveolado por dentro.',
        inStock: true,
        imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop&q=80',
        options: []
      },
      {
        id: 'prod_cafe_3',
        title: 'Carrot Cake Artesanal con Nuez & Frosting',
        price: 58,
        category: 'Panadería & Pastelería',
        description: 'Bizcocho húmedo de zanahoria fresca, canela y nueces pecán, cubierto con generoso frosting de queso crema Philadelphia.',
        inStock: true,
        imageUrl: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=800&auto=format&fit=crop&q=80',
        options: []
      },
      {
        id: 'prod_cafe_4',
        title: 'Cold Brew Concentrado de Café 500ml',
        price: 26,
        category: 'Bebidas',
        description: 'Extracción en frío durante 18 horas continuas. Suave acidez, dulzor natural y alto contenido de energía limpia.',
        inStock: true,
        imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&auto=format&fit=crop&q=80',
        options: []
      }
    ]
  },
  {
    email: 'demo.tech@apana.pe',
    name: 'Giga Tech Perú',
    slug: 'giga-tech',
    plan: 'negocio',
    themeStyle: 'moderna',
    primaryColor: '#2563eb',
    category: 'tecnologia',
    description: 'Tecnología, audio de alta fidelidad, cargadores certificados y accesorios premium para tu setup y oficina.',
    whatsappPhone: '51967335264',
    ownerName: 'Diego Farfán',
    city: 'Lima',
    department: 'Lima',
    schedule: 'Lunes a Sábado: 9:00 AM - 7:30 PM',
    shippingType: 'coordinar',
    shippingNotes: 'Envíos asegurados a todo el Perú en 24 a 48 horas.',
    pickupAddress: 'Av. Petit Thouars 5356, Miraflores, Lima',
    socialLinks: {
      instagram: 'gigatech.peru',
      tiktok: 'gigatech_pe'
    },
    legalBusinessName: 'GIGA TECH INNOVACIONES S.A.C.',
    legalTaxIdType: 'RUC',
    legalTaxId: '20601234567',
    legalAddress: 'Av. Petit Thouars 5356, Miraflores, Lima',
    storePolicies: '1. Todos nuestros productos cuentan con 12 meses de garantía de fábrica.\n2. Emitimos Boleta y Factura electrónica en todas las compras.\n3. Soporte técnico personalizado vía WhatsApp.',
    categories: ['Audio & Auriculares', 'Carga & Energía', 'Accesorios Setup'],
    products: [
      {
        id: 'prod_tech_1',
        title: 'Auriculares Inalámbricos Over-Ear ANC Pro',
        price: 299,
        category: 'Audio & Auriculares',
        description: 'Cancelación activa de ruido híbrida de 40dB, 45 horas de batería continua, almohadillas viscoelásticas y audio Hi-Res.',
        inStock: true,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        options: [
          {
            name: 'Color',
            values: [
              { id: 'c_black', name: 'Negro Mate', priceDifference: 0 },
              { id: 'c_silver', name: 'Plata Lunar', priceDifference: 0 }
            ]
          }
        ]
      },
      {
        id: 'prod_tech_2',
        title: 'Cargador Rápido GaN 65W Triple Puerto USB-C',
        price: 119,
        category: 'Carga & Energía',
        description: 'Carga ultrarrápida para MacBook, iPhone y dispositivos Android. Tecnología GaN III más pequeña, fría y eficiente.',
        inStock: true,
        imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
        options: []
      },
      {
        id: 'prod_tech_3',
        title: 'Teclado Mecánico Inalámbrico 75% RGB',
        price: 269,
        category: 'Accesorios Setup',
        description: 'Conectividad Bluetooth 5.1 / 2.4GHz / Cable USB-C. Switches mecánicos pre-lubricados y perilla de volumen metálica.',
        inStock: true,
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
        options: [
          {
            name: 'Tipo de Switch',
            values: [
              { id: 'sw_brown', name: 'Brown (Táctil y Silencioso)', priceDifference: 0 },
              { id: 'sw_red', name: 'Red (Lineal y Rápido para Gaming)', priceDifference: 0 }
            ]
          }
        ]
      },
      {
        id: 'prod_tech_4',
        title: 'Power Bank Magnético MagSafe 10,000 mAh',
        price: 139,
        category: 'Carga & Energía',
        description: 'Carga magnética inalámbrica de 15W y salida USB-C Power Delivery de 20W. Soporte plegable integrado para ver videos.',
        inStock: true,
        imageUrl: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=800&auto=format&fit=crop&q=80',
        options: []
      }
    ]
  },
  {
    email: 'demo.joyas@apana.pe',
    name: 'Aura Joyas & Accesorios',
    slug: 'aura-joyas',
    plan: 'emprendedor',
    themeStyle: 'elegante',
    primaryColor: '#be185d',
    category: 'accesorios',
    description: 'Joyas en Plata Ley 925 y baño de oro 18k con piedras naturales. Diseños elegantes y atemporales para cada momento.',
    whatsappPhone: '51967335264',
    ownerName: 'María Fernanda Torres',
    city: 'Lima',
    department: 'Lima',
    schedule: 'Lunes a Sábado: 10:00 AM - 7:00 PM',
    shippingType: 'coordinar',
    shippingNotes: 'Cajita de regalo y certificado de autenticidad incluido en cada pedido.',
    pickupAddress: 'Av. El Polo 670, Santiago de Surco, Lima',
    socialLinks: {
      instagram: 'aurajoyas.pe',
      tiktok: 'aurajoyasperu'
    },
    legalBusinessName: 'MARIA FERNANDA TORRES DEL SOLAR',
    legalTaxIdType: 'DNI',
    legalTaxId: '45678912',
    legalAddress: 'Av. El Polo 670, Santiago de Surco, Lima',
    storePolicies: '1. Todas las joyas están certificadas en Plata 925 auténtica.\n2. Incluye empaque de gamuza y caja de presentación de regalo.\n3. Garantía de 30 días contra desperfectos de fabricación.',
    categories: ['Collares', 'Aretes', 'Anillos & Pulseras'],
    products: [
      {
        id: 'prod_joya_1',
        title: 'Collar Cadena Serpiente Plata 925',
        price: 119,
        category: 'Collares',
        description: 'Cadena plana de tejido serpiente italiano en Plata 925 con acabado espejo. Longitud de 45 cm con extensor de 5 cm.',
        inStock: true,
        imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
        options: []
      },
      {
        id: 'prod_joya_2',
        title: 'Argollas Chunky Baño de Oro 18K',
        price: 89,
        category: 'Aretes',
        description: 'Argollas gruesas con baño triple de oro 18k sobre base hipoalergénica. Cierre de seguridad reforzado y peso ultraliviano.',
        inStock: true,
        imageUrl: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80',
        options: []
      },
      {
        id: 'prod_joya_3',
        title: 'Anillo Solitario Circonita Suiza Ajustable',
        price: 95,
        category: 'Anillos & Pulseras',
        description: 'Anillo en Plata Ley 925 con gema central de circonia suiza calidad AAA. Aro graduable para cualquier dedo.',
        inStock: true,
        imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80',
        options: []
      },
      {
        id: 'prod_joya_4',
        title: 'Pulsera Tennis Crystals Plata 925',
        price: 149,
        category: 'Anillos & Pulseras',
        description: 'Elegancia pura. Pulsera flexible con cristales de brillo diamante engastados en garras individuales de Plata 925.',
        inStock: true,
        imageUrl: 'https://images.unsplash.com/photo-1611591475877-c3763f350c3d?w=800&auto=format&fit=crop&q=80',
        options: []
      }
    ]
  },
  {
    email: 'demo.skincare@apana.pe',
    name: 'Botánica Glow Skincare',
    slug: 'botanica-glow',
    plan: 'gratis',
    themeStyle: 'minimalista',
    primaryColor: '#059669',
    category: 'belleza',
    description: 'Cosmética botánica, ingredientes limpios, cruelty-free y formulaciones suaves para el cuidado diario de tu piel.',
    whatsappPhone: '51967335264',
    ownerName: 'Valeria Paredes',
    city: 'Lima',
    department: 'Lima',
    schedule: 'Lunes a Viernes: 9:00 AM - 6:00 PM',
    shippingType: 'coordinar',
    shippingNotes: 'Envíos a todo Lima Metropolitana y asesoría personalizada de rutina por WhatsApp.',
    pickupAddress: 'Av. San Borja Sur 420, San Borja, Lima',
    socialLinks: {
      instagram: 'botanicaglow.pe',
      tiktok: 'botanicaglow'
    },
    legalBusinessName: 'VALERIA PAREDES RIVAS',
    legalTaxIdType: 'DNI',
    legalTaxId: '71234567',
    legalAddress: 'Av. San Borja Sur 420, San Borja, Lima',
    storePolicies: '1. Productos dermatológicamente probados y libres de crueldad animal.\n2. Formulaciones libres de parabenos y fragancias sintéticas.\n3. Asesoría gratuita previa a tu compra por WhatsApp.',
    categories: ['Cuidado Facial', 'Serums & Tratamientos'],
    products: [
      {
        id: 'prod_skin_1',
        title: 'Serum Facial Niacinamida 10% + Zinc 1% 30ml',
        price: 59,
        category: 'Serums & Tratamientos',
        description: 'Fórmula equilibrante para reducir la apariencia de poros dilatados, regular el sebo y unificar el tono de la piel.',
        inStock: true,
        imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
        options: []
      },
      {
        id: 'prod_skin_2',
        title: 'Gel Limpiador Suave con Ácido Hialurónico 150ml',
        price: 45,
        category: 'Cuidado Facial',
        description: 'Limpieza profunda pero gentil que no reseca la barrera cutánea. Con centella asiática, aloe vera y pantenol.',
        inStock: true,
        imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80',
        options: []
      },
      {
        id: 'prod_skin_3',
        title: 'Protector Solar Fluido Invisible FPS 50+ 50ml',
        price: 68,
        category: 'Cuidado Facial',
        description: 'Textura ligera toque seco sin rastro blanco. Protección de amplio espectro UVA/UVB resistente al agua y sudor.',
        inStock: true,
        imageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80',
        options: []
      },
      {
        id: 'prod_skin_4',
        title: 'Aceite Facial de Rosa Mosqueta Puro 30ml',
        price: 49,
        category: 'Serums & Tratamientos',
        description: '100% puro prensado en frío. Rico en ácidos grasos esenciales y vitamina A para regenerar la piel y atenuar líneas de expresión.',
        inStock: true,
        imageUrl: 'https://images.unsplash.com/photo-1608248597359-2ff96384a287?w=800&auto=format&fit=crop&q=80',
        options: []
      }
    ]
  }
];

async function main() {
  console.log('🚀 Iniciando creación de las 5 tiendas de demostración en producción...');

  for (const storeData of SHOWCASE_STORES) {
    console.log(`\n--------------------------------------------`);
    console.log(`📦 Procesando tienda: ${storeData.name} (${storeData.slug})`);

    // 1. Crear o actualizar Auth User
    const uid = await createOrUpdateAuthUser(storeData.email, SHOWCASE_PASSWORD, storeData.name);
    const storeId = `store_${uid}`;

    // 2. Crear o actualizar documento en /users/{uid}
    await db.collection('users').doc(uid).set({
      uid,
      email: storeData.email,
      displayName: storeData.name,
      role: 'merchant',
      storeId,
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
    console.log(` ✅ Documento /users/${uid} actualizado.`);

    // 3. Crear o actualizar documento en /stores/{storeId}
    const storeDocData = {
      id: storeId,
      ownerId: uid,
      ownerEmail: storeData.email,
      ownerName: storeData.ownerName,
      name: storeData.name,
      slug: storeData.slug,
      plan: storeData.plan,
      status: 'activa',
      themeStyle: storeData.themeStyle,
      primaryColor: storeData.primaryColor,
      category: storeData.category,
      description: storeData.description,
      whatsappPhone: storeData.whatsappPhone,
      isWhatsappVerified: true,
      whatsappVerifiedAt: Date.now(),
      isEmailVerified: true,
      emailVerifiedAt: Date.now(),
      emailVerifiedMethod: 'admin',
      city: storeData.city,
      department: storeData.department,
      schedule: storeData.schedule,
      shippingType: storeData.shippingType,
      shippingNotes: storeData.shippingNotes,
      pickupAddress: storeData.pickupAddress,
      socialLinks: storeData.socialLinks,
      legalBusinessName: storeData.legalBusinessName,
      legalTaxIdType: storeData.legalTaxIdType,
      legalTaxId: storeData.legalTaxId,
      legalAddress: storeData.legalAddress,
      storePolicies: storeData.storePolicies,
      categories: storeData.categories,
      productCount: storeData.products.length,
      subscriptionStatus: storeData.plan === 'gratis' ? 'free' : 'active',
      currency: 'PEN',
      updatedAt: FieldValue.serverTimestamp()
    };

    await db.collection('stores').doc(storeId).set(storeDocData, { merge: true });
    console.log(` ✅ Documento /stores/${storeId} guardado con slug: /s/${storeData.slug}`);

    // 4. Crear productos en subcolección /stores/{storeId}/products
    const prodCol = db.collection('stores').doc(storeId).collection('products');
    
    // Limpiar productos existentes previos si hubieran
    const existingProds = await prodCol.get();
    for (const doc of existingProds.docs) {
      await doc.ref.delete();
    }

    // Insertar productos nuevos
    for (const p of storeData.products) {
      await prodCol.doc(p.id).set({
        ...p,
        storeId,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
      console.log(`    + Producto añadido: ${p.title} (S/ ${p.price})`);
    }

    console.log(` 🎉 Tienda lista: https://beapana.com/s/${storeData.slug}`);
  }

  console.log('\n============================================');
  console.log('✨ ¡Las 5 tiendas de demostración fueron creadas con éxito!');
  console.log('============================================');
}

main().catch(err => {
  console.error('Error creando tiendas:', err);
  process.exit(1);
});
