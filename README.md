<div align="center">
  <img src="public/logo_lockup.svg" alt="APANA" width="220" />
  <br /><br />
  <p align="center">
    <strong>La plataforma más rápida y completa para crear catálogos móviles, generar códigos QR y recibir pedidos estructurados directos a WhatsApp en Perú.</strong>
  </p>

  <p align="center">
    <a href="https://beapana.com"><strong>🌐 beapana.com</strong></a>
  </p>

  <p align="center">
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
    <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react" alt="React" /></a>
    <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" /></a>
    <a href="https://firebase.google.com"><img src="https://img.shields.io/badge/Firebase-v12-FFCA28?style=for-the-badge&logo=firebase" alt="Firebase" /></a>
    <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" /></a>
  </p>
</div>

---

## 🌟 Descripción General

**APANA** (`beapana.com`) es una plataforma SaaS móvil de comercio conversacional de alto rendimiento, diseñada específicamente para emprendedores, marcas de moda, restaurantes, cafeterías, bodegas y negocios de retail.

Permite a los comerciantes crear su catálogo digital en menos de 2 minutos, personalizar su identidad visual, exhibir variantes complejas de producto y recibir pedidos directos a su **WhatsApp** con cálculo automático de totales y entrega, cobrando el **100% de las ventas sin comisiones por intermediación** (vía Yape, Plin, Efectivo o Transferencia).

---

## ✨ Características Principales

### 🛍️ Para los Clientes (Experiencia de Compra)
- **Cero descargas**: Experiencia web ultrarrápida sin requerir instalar aplicaciones móviles pesadas.
- **Catálogo interactivo con selector de estilos**: Lookbook Minimalista, Vista Moderna dinámica o Estilo Elegante según el rubro.
- **Variantes y opciones de producto**: Selección intuitiva de tallas, colores, sabores, toppings y extras con ajuste de precio en tiempo real.
- **Carrito inteligente y cálculo automático**: Desglose transparente de subtotales y opciones de envío.
- **Checkout conversacional a WhatsApp**: Genera un mensaje formateado con la lista de productos, total exacto y datos de despacho.

### 💼 Para los Comerciantes (Panel de Gestión)
- **Onboarding asistido**: Creación y personalización de la tienda en 4 sencillos pasos con previsualizador móvil interactivo.
- **Editor de variantes de producto**: Soporte para hasta 4 imágenes optimizadas por producto, control de inventario y opciones personalizables.
- **Validación Anti-Fraude de WhatsApp**: Sistema de verificación asistida y autenticación de titularidad enlazado a la línea oficial (`+51 920030074`).
- **Analíticas y Embudo de Conversión Comercial**: Métricas en tiempo real con gráfico de embudo (Vistas de Catálogo ➔ Productos Explorados ➔ Carritos ➔ Pedidos WhatsApp) y exportación de reportes a **Excel (.xlsx)**.
- **Generador y Descarga de Código QR**: QR exclusivo de alta resolución listo para imprimir en vitrinas, mesas o compartir en redes sociales.
- **Suscripciones y Planes**: Plan Gratis, Plan Emprendedor y Plan Negocio Pro con pasarela de pago Culqi integrada.

### 🛡️ Panel de Control SuperAdmin (`/admin`)
- **Gestión centralizada de comercios**: Búsqueda global, cambio inmediato de planes, pausa o eliminación de tiendas.
- **Directorio de usuarios y audit de pagos**: Monitoreo de ingresos recurrentes, historial de transacciones y estados de suscripción.

### 📱 Optimización Móvil & PWA
- **Soporte PWA nativo**: Instalable como app en pantalla de inicio de iOS y Android (`manifest.webmanifest`).
- **Anti-Zoom en iOS**: Formularios calibrados para prevenir el zoom brusco en navegadores WebKit/Safari.
- **Safe Area Insets**: Adaptación total a pantallas notch y barras de gestos modernas de iPhone y Android.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **Framework Web** | [Next.js 16 (App Router)](https://nextjs.org/) con motor Turbopack |
| **Librería UI** | [React 19](https://react.dev/) |
| **Tipado** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Estilos & Diseño** | [Tailwind CSS v4](https://tailwindcss.com/) + Tokens de Diseño Stitch |
| **Autenticación** | Firebase Authentication (Email/Contraseña + Google Auth) |
| **Base de Datos** | Cloud Firestore (Reglas de seguridad granulares desplegadas) |
| **Almacenamiento** | Cloud Firestore / WebP Base64 y Firebase Storage |
| **Estado Global** | Zustand |
| **Iconografía** | Lucide React + SVGs a medida |
| **Exportación** | SheetJS (`xlsx`) para reportes ejecutivos |
| **Pasarela de Pago** | Integración nativa con Culqi Checkout v4 |

---

## 📂 Estructura del Código

```text
apana-app/
├── public/                     # Activos estáticos (Logos SVG, previews, manifiestos)
│   ├── icon.svg
│   ├── logo.svg
│   ├── logo_lockup.svg
│   └── apana-real-preview.png
├── src/
│   ├── app/                    # Rutas de Next.js App Router
│   │   ├── (auth)/             # Login, Registro y Recuperación de Contraseña
│   │   ├── (merchant)/         # Panel privado (Dashboard, Productos, Analíticas, Admin, QR, Planes, Ajustes)
│   │   ├── (public)/           # Catálogo del cliente (/s/[storeSlug]), Carrito y Términos Legales
│   │   ├── api/                # API Routes (Culqi charges, cancelación y webhooks)
│   │   ├── globals.css         # Tokens de diseño y utilidades CSS móviles
│   │   ├── layout.tsx          # Layout raíz con AuthProvider y Metadata SEO
│   │   ├── manifest.ts         # Manifiesto PWA para instalación móvil
│   │   └── page.tsx            # Landing Page comercial de alta conversión
│   ├── components/             # Componentes modulares
│   │   ├── landing/            # Secciones de la Landing (Hero, DevicePreview, FAQ, Pricing, Matrix)
│   │   ├── merchant/           # Componentes de gestión (ProductVariantsEditor, LiveStorePreview, WhatsAppVerifyModal)
│   │   ├── public/             # Modales de opciones de producto y vistas públicas
│   │   └── ui/                 # Botones, Cards, Tabs y Primitivas accesibles
│   ├── lib/                    # Lógica de negocio y utilidades
│   │   ├── firebase/           # Configuración Singleton, Auth Context y Métodos de Firestore
│   │   ├── image-optimizer.ts  # Compresión de imágenes WebP en el navegador
│   │   └── whatsapp.ts         # Formateador de mensajes estructurados para WhatsApp
│   └── types/                  # Modelos TypeScript (Store, Product, Order, Analytics, User)
├── firestore.rules             # Reglas de seguridad de Cloud Firestore
└── next.config.ts              # Configuración de Next.js
```

---

## 🚀 Instalación y Desarrollo Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/MivoApps/apana-app.git
cd apana-app
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=apana-app-edf1a.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=apana-app-edf1a
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=apana-app-edf1a.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id

# Pasarela de pagos Culqi (Opcional en desarrollo)
NEXT_PUBLIC_CULQI_PUBLIC_KEY=pk_test_...
CULQI_SECRET_KEY=sk_test_...
```

### 4. Iniciar el servidor
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## ☁️ Despliegue en Producción (Vercel + Spaceship)

El proyecto cuenta con integración continua (**CI/CD**) en **Vercel**:

1. Importa el repositorio desde GitHub en [Vercel](https://vercel.com).
2. Añade las variables de entorno de Firebase en **Settings > Environment Variables**.
3. En **Settings > Domains**, añade `beapana.com`.
4. En el panel de **Spaceship (Advanced DNS)**, configura:
   - **Registro A:** `@` ➔ `76.76.21.21`
   - **Registro CNAME:** `www` ➔ `cname.vercel-dns.com`

---

## 🔒 Seguridad y Cumplimiento

- **Reglas Granulares en Firestore**: Acceso público exclusivamente de lectura a tiendas y productos activos; modificaciones restringidas estrictamente por token de autenticación (`request.auth.uid == ownerId`).
- **Verificación de Titularidad de WhatsApp**: Protección anti-suplantación con tokens OTP temporales de 6 dígitos.
- **Declaración Jurada Digital**: Registro de aceptación de titularidad y términos de servicio para comercio electrónico en Perú.

---

## 📄 Licencia y Créditos

Desarrollado por **[MIVO](https://mivo.pe)**.  
Todos los derechos reservados © 2026 **APANA** (`beapana.com`).
