<div align="center">
  <img src="public/logo_lockup.svg" alt="APANA" width="220" />
  <br /><br />
  <p align="center">
    <strong>La plataforma más rápida para crear tu catálogo digital, generar tu código QR y recibir pedidos directos a WhatsApp en Perú.</strong>
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

**APANA** es una solución web moderna y ligera diseñada para emprendedores, comerciantes y negocios gastronómicos o de retail en Perú y Latinoamérica. Permite crear una tienda online en 1 minuto, compartir un catálogo interactivo con código QR y recibir pedidos con cálculo exacto listos para despachar por WhatsApp, cobrando el 100% de las ventas directamente por Yape, Plin o transferencia bancaria.

---

## ✨ Características Principales

### 🛍️ Para los Clientes (Experiencia de Compra)
- **Cero descargas**: Los clientes no instalan apps pesadas; compran directamente desde Safari, Chrome o cualquier navegador móvil.
- **Catálogo interactivo**: Búsqueda en tiempo real, filtros por categorías, fotos de alta resolución y precios claros.
- **Carrito inteligente y cálculo automático**: Suma de subtotales, envío y cantidades con un solo toque.
- **Checkout directo a WhatsApp**: Redirige al cliente con un mensaje estructurado con el desglose del pedido, total a pagar y datos de entrega.

### 💼 Para los Comerciantes (Panel de Control)
- **Onboarding express**: Configuración completa de la tienda en 4 sencillos pasos.
- **Personalización de marca**: Selección de estilos (Minimalista, Moderna, Elegante) y paletas de color con vista previa en vivo.
- **Gestión de productos**: Carga optimizada de imágenes con compresión automática en el navegador, control de stock y precios en Soles (PEN).
- **Generador de Código QR**: Código QR único listo para descargar e imprimir en vitrinas, cartas o redes sociales.
- **Métricas e historial de pedidos**: Seguimiento de visitas y conversión.
- **Planes dinámicos**: Plan Gratis (hasta 25 productos) y Plan Emprendedor (hasta 250 productos, 4 fotos por producto, estadísticas y soporte).

### 📱 Experiencia Móvil & PWA
- **Soporte PWA nativo**: Opción de *"Agregar a la pantalla de inicio"* en iOS y Android.
- **Anti-Zoom en iOS**: Formularios optimizados para evitar el auto-zoom brusco de Safari.
- **Teclados inteligentes**: Detección automática de teclado numérico (`inputMode="tel"`, `inputMode="decimal"`) en teléfonos y precios.
- **Safe Area Insets**: Respeto total a la barra de gestos inferior de iPhone y dispositivos modernos.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) con Turbopack |
| **Librería UI** | [React 19](https://react.dev/) |
| **Lenguaje** | [TypeScript](https://www.typescriptlang.org/) |
| **Estilos** | [Tailwind CSS v4](https://tailwindcss.com/) + Stitch Design Tokens |
| **Autenticación** | Firebase Auth (Email/Password + Google Sign-In) |
| **Base de Datos** | Cloud Firestore (Reglas de seguridad granulares) |
| **Almacenamiento** | Firebase Cloud Storage |
| **Estado Global** | Zustand |
| **Iconografía** | Lucide React + SVGs personalizados |
| **Pagos / Suscripciones** | Integración preparada con Culqi API |

---

## 📂 Estructura del Proyecto

```text
apana-app/
├── public/                     # Activos estáticos (Logos SVG, iconos, favicon)
│   ├── icon.svg
│   ├── logo.svg
│   └── logo_lockup.svg
├── src/
│   ├── app/                    # Rutas de Next.js App Router
│   │   ├── (auth)/             # Login, Registro y Recuperación de Contraseña
│   │   ├── (merchant)/         # Panel privado (Dashboard, Productos, QR, Planes, Ajustes)
│   │   ├── (public)/           # Tienda pública del cliente (/s/[storeSlug]) y Legales
│   │   ├── api/                # API Routes (Culqi charges, cancelación de suscripciones)
│   │   ├── globals.css         # Tokens de diseño y utilidades CSS móviles
│   │   ├── layout.tsx          # Layout raíz con AuthProvider y Metadata SEO
│   │   ├── manifest.ts         # Manifiesto PWA para instalación móvil
│   │   └── page.tsx            # Landing Page de conversión
│   ├── components/             # Componentes modulares
│   │   ├── landing/            # Secciones de la Landing (Hero, DevicePreview, FAQ, etc.)
│   │   ├── merchant/           # Componentes de gestión (AuthGuard, LiveStorePreview)
│   │   └── ui/                 # Botones, Cards, Modales y Primitivas accesibles
│   ├── lib/                    # Lógica de negocio y clientes externos
│   │   ├── firebase/           # Configuración Singleton, Auth Context y Firestore helpers
│   │   ├── image-optimizer.ts  # Compresión de imágenes WebP/JPEG en el navegador
│   │   └── whatsapp.ts         # Generador de enlaces estructurados para WhatsApp
│   └── types/                  # Definiciones de tipos TypeScript (Store, Product, Order)
├── firestore.rules             # Reglas de seguridad de Cloud Firestore
└── next.config.ts              # Configuración de Next.js
```

---

## 🚀 Inicio Rápido en Desarrollo Local

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
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id

# Opcional (Pasarela de pagos Culqi)
NEXT_PUBLIC_CULQI_PUBLIC_KEY=pk_test_...
CULQI_SECRET_KEY=sk_test_...
```

### 4. Ejecutar el servidor de desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## ☁️ Despliegue en Producción (Vercel)

El proyecto está 100% optimizado para desplegarse en **Vercel** con integración continua (CI/CD):

1. Conecta tu repositorio de GitHub en [Vercel](https://vercel.com).
2. Agrega las variables de entorno de Firebase en la sección **Environment Variables**.
3. Haz clic en **Deploy**. Cada vez que hagas `git push origin main`, Vercel compilará y actualizará el sitio automáticamente.

---

## 🔒 Seguridad y Privacidad

- **Declaración Jurada y Verificación**: Cumplimiento normativo para la verificación y titularidad de líneas telefónicas comerciales en Perú.
- **Reglas de Firestore**: Restricciones de lectura pública para catálogos activos y permisos estrictos de escritura autenticada por `ownerId`.
- **Protección de Datos**: Las contraseñas y credenciales sensibles nunca tocan los servidores de frontend.

---

## 📄 Licencia y Créditos

Desarrollado por **[Mivo Apps](https://github.com/MivoApps)**.  
Todos los derechos reservados © 2026 APANA.
