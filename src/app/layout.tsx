import type { Metadata, Viewport } from "next";
import { Vazirmatn, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { JsonLd } from "@/components/portfolio/json-ld";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazirmatn",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'JEFF studio — Mostafa Jafari, Architect & 3D Visualization Artist',
    template: '%s | JEFF studio',
  },
  description: 'Portfolio of Mostafa Jafari — Architecture, Interior Design, 3D Visualization, Furniture Design & AI Architecture. Professional architectural services based in Mashhad, Iran.',
  keywords: [
    'architecture', 'interior design', '3D visualization', '3D rendering',
    'furniture design', 'AI architecture', 'Mostafa Jafari', 'JEFF studio',
    'معماری', 'طراحی داخلی', 'رندر سه‌بعدی', 'طراحی مبلان', 'هوش مصنوعی معماری',
    'architectural design', 'V-Ray', 'Corona renderer', 'photorealistic rendering',
    'طراحی معماری', 'مصطفی جعفری', 'جف استودیو',
  ],
  authors: [{ name: 'Mostafa Jafari', url: 'https://jeffstudio.ir' }],
  creator: 'Mostafa Jafari',
  publisher: 'JEFF studio',
  metadataBase: new URL('https://jeffstudio.ir'),
  alternates: {
    canonical: 'https://jeffstudio.ir',
    languages: {
      'en': 'https://jeffstudio.ir?lang=en',
      'fa': 'https://jeffstudio.ir?lang=fa',
      'x-default': 'https://jeffstudio.ir',
    },
  },
  openGraph: {
    title: 'JEFF studio — Mostafa Jafari, Architect & 3D Visualization Artist',
    description: 'Architecture, Interior Design, 3D Visualization, Furniture Design & AI Architecture. Professional services by Mostafa Jafari.',
    url: 'https://jeffstudio.ir',
    siteName: 'JEFF studio',
    locale: 'en_US',
    alternateLocale: 'fa_IR',
    type: 'website',
    images: [
      {
        url: '/uploads/logo.jpg',
        width: 1200,
        height: 630,
        alt: 'JEFF studio — Architecture & 3D Visualization Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JEFF studio — Mostafa Jafari',
    description: 'Architecture, 3D Visualization, Furniture Design & AI Architecture',
    images: ['/uploads/logo.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  category: 'Architecture & Design',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.instagram.com" />
        <link rel="preconnect" href="https://www.behance.net" />
        <link rel="preconnect" href="https://www.linkedin.com" />
        <link rel="dns-prefetch" href="https://www.pinterest.com" />
        <link rel="icon" href="/uploads/logo.jpg" type="image/jpeg" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${vazirmatn.variable} ${inter.variable} antialiased bg-background text-foreground`}
        style={{ fontFamily: 'var(--font-vazirmatn), var(--font-inter), sans-serif' }}
      >
        <ThemeProvider>
          <JsonLd />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}