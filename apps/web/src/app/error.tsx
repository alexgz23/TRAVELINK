'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { ROUTES } from '@/lib/constants';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Error boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Algo salió mal
          </h1>
          <p className="text-gray-600">
            Lo sentimos, ocurrió un error inesperado. Nuestro equipo ha sido notificado.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <h3 className="text-sm font-semibold text-red-800 mb-2">Error Details:</h3>
            <pre className="text-xs text-red-700 overflow-auto">
              {error.message}
            </pre>
            {error.digest && (
              <p className="text-xs text-red-600 mt-2">Digest: {error.digest}</p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset} variant="primary">
            Intentar de nuevo
          </Button>
          <Link href={ROUTES.HOME}>
            <Button variant="outline">
              Volver al inicio
            </Button>
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Si el problema persiste, por favor{' '}
          <Link href="/contact" className="text-blue-600 hover:underline">
            contáctanos
          </Link>
        </p>
      </div>
    </div>
  );
}
