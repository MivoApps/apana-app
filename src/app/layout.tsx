import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans, Space_Grotesk, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#059669",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://beapana.com"),
  title: {
    default: "APANA | Crea tu Tienda online y Vende por WhatsApp en Perú",
    template: "%s | APANA",
  },
  description: "La plataforma líder en Perú para que emprendedores, negocios y bodegas creen su tienda online, la compartan y reciban pedidos directos a WhatsApp.",
  keywords: [
    "catalogo digital",
    "tienda online peru",
    "vender por whatsapp",
    "pedidos whatsapp",
    "apana",
    "beapana",
    "apana app",
    "comercio electronico peru",
    "menu digital qr",
    "catalogo interactivo",
    "software catalogo whatsapp",
  ],
  authors: [{ name: "APANA", url: "https://beapana.com" }],
  creator: "APANA",
  publisher: "APANA",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "APANA",
  },
  alternates: {
    canonical: "https://beapana.com",
  },
  openGraph: {
    title: "APANA | Tu Tienda online en 3 Minutos",
    description: "Crea tu tienda virtual, comparte tus productos y recibe pedidos listos por WhatsApp.",
    url: "https://beapana.com",
    type: "website",
    locale: "es_PE",
    siteName: "APANA",
    images: [
      {
        url: "/apana-real-preview.png",
        width: 1200,
        height: 630,
        alt: "APANA - Tienda online para Vender por WhatsApp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "APANA | Tu Tienda online en 3 Minutos",
    description: "Crea tu tienda virtual, comparte tus productos y recibe pedidos listos por WhatsApp.",
    images: ["/apana-real-preview.png"],
  },
};

import { AuthProvider } from "@/lib/firebase/auth-context";
import { AuthGuard } from "@/components/merchant/AuthGuard";

const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://beapana.com/#organization",
      "name": "APANA",
      "alternateName": ["BeApana", "APANA Perú", "Apana App"],
      "url": "https://beapana.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://beapana.com/icon-512.png",
        "width": 512,
        "height": 512
      },
      "image": "https://beapana.com/icon-512.png",
      "description": "Plataforma líder en Perú para que emprendedores, negocios y marcas creen su tienda online, compartan su catálogo y reciban pedidos por WhatsApp.",
      "sameAs": [
        "https://www.instagram.com/beapana"
      ],
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "PE"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://beapana.com/#website",
      "url": "https://beapana.com",
      "name": "APANA",
      "alternateName": ["BeApana", "APANA Perú"],
      "publisher": {
        "@id": "https://beapana.com/#organization"
      },
      "inLanguage": "es-PE"
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://beapana.com/#software",
      "name": "APANA App",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "url": "https://beapana.com",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "PEN"
      },
      "description": "Plataforma de comercio conversacional que permite a emprendedores crear su tienda online y recibir pedidos automáticos por WhatsApp."
    }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${plusJakartaSans.variable} ${spaceGrotesk.variable} ${playfairDisplay.variable} antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon-48.png" type="image/png" sizes="48x48" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#f8f9ff]">
        <AuthProvider>
          <AuthGuard>
            {children}
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
