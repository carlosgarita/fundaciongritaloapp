import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
if (!SITE_URL) throw new Error("NEXT_PUBLIC_SITE_URL is required");

export const metadata: Metadata = {
  title: "Fundación Grítalo - Gestión de Voluntariado",
  description:
    "Sistema de gestión de voluntarios y actividades para la Fundación Grítalo",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Fundación Grítalo - Gestión de Voluntariado",
    description:
      "Sistema de gestión de voluntarios y actividades para la Fundación Grítalo",
    url: SITE_URL,
    siteName: "Fundación Grítalo",
    locale: "es_CR",
    type: "website",
    images: [
      { url: "/logo.png", width: 512, height: 512, alt: "Fundación Grítalo" },
    ],
  },
  twitter: {
    card: "summary",
    title: "Fundación Grítalo",
    description:
      "Sistema de gestión de voluntarios y actividades para la Fundación Grítalo",
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#137FEC",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-[100] focus:bg-primary-500 focus:text-text-inverse focus:px-4 focus:py-2 focus:text-sm"
        >
          Saltar al contenido principal
        </a>
        {children}
      </body>
    </html>
  );
}
