import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { WebSocketProvider } from '@/providers/websocket-provider';
import { ToastProvider } from '@/providers/toast-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://viajeroconectado.com'),
  title: {
    default: 'Viajero Conectado - Experiencias auténticas en Colombia',
    template: '%s | Viajero Conectado',
  },
  description:
    'Red social + marketplace de viajes. Descubre y reserva experiencias auténticas en Colombia. Conecta con viajeros locales y expertos. Tours, aventuras, gastronomía y más.',
  keywords: [
    'viajes colombia',
    'turismo colombia',
    'tours colombia',
    'experiencias colombia',
    'aventuras colombia',
    'guías locales',
    'red social viajes',
    'marketplace viajes',
    'bogotá tours',
    'medellín tours',
    'cartagena tours',
    'experiencias auténticas',
  ],
  authors: [{ name: 'Viajero Conectado', url: 'https://viajeroconectado.com' }],
  creator: 'Viajero Conectado',
  publisher: 'Viajero Conectado',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: 'https://viajeroconectado.com',
    siteName: 'Viajero Conectado',
    title: 'Viajero Conectado - Experiencias auténticas en Colombia',
    description:
      'Descubre y reserva experiencias auténticas en Colombia. Conecta con viajeros locales y expertos.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Viajero Conectado',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Viajero Conectado - Experiencias auténticas en Colombia',
    description: 'Red social + marketplace de viajes en Colombia',
    creator: '@viajeroconectado',
    images: ['/images/twitter-image.jpg'],
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
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: 'https://viajeroconectado.com',
  },
  verification: {
    google: 'google-site-verification-code',
    // Add other verification codes as needed
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="antialiased">
        <QueryProvider>
          <WebSocketProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </WebSocketProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
