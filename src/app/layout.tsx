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
  title: "APANA | Crea tu Catálogo Digital y Vende por WhatsApp en Perú",
  description: "La plataforma más rápida para que emprendedores y comerciantes creen su tienda online, gestionen su catálogo y reciban pedidos directos a WhatsApp.",
  keywords: ["catalogo digital", "tienda online peru", "vender por whatsapp", "pedidos whatsapp", "apana app", "comercio electronico peru"],
  authors: [{ name: "APANA" }],
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "APANA",
  },
  openGraph: {
    title: "APANA | Tu Catálogo Digital en 2 Minutos",
    description: "Crea tu tienda virtual, comparte tus productos y recibe pedidos listos por WhatsApp.",
    type: "website",
    locale: "es_PE",
    siteName: "APANA",
  },
};

import { AuthProvider } from "@/lib/firebase/auth-context";
import { AuthGuard } from "@/components/merchant/AuthGuard";

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
