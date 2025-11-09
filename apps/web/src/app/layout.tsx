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
  title: 'Viajero Conectado',
  description: 'Red social + marketplace de viajes. Descubre, conecta y viaja con quienes ya estuvieron allí.',
  keywords: ['viajes', 'turismo', 'tours', 'Colombia', 'experiencias', 'red social'],
  authors: [{ name: 'Viajero Conectado' }],
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: 'https://viajeroconectado.com',
    siteName: 'Viajero Conectado',
    title: 'Viajero Conectado - Red social de viajes',
    description: 'Descubre, conecta y viaja con quienes ya estuvieron allí.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Viajero Conectado',
    description: 'Red social + marketplace de viajes',
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
