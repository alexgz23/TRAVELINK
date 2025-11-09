import Link from 'next/link';
import { Button } from '@/components/ui';
import { ROUTES } from '@/lib/constants';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-blue-600 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Página no encontrada
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>

        <div className="mb-12">
          <div className="text-8xl mb-4">🗺️</div>
          <p className="text-gray-600">
            Parece que te has perdido en tu viaje...
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href={ROUTES.HOME}>
            <Button variant="primary" size="lg">
              Volver al inicio
            </Button>
          </Link>
          <Link href={ROUTES.EXPERIENCES}>
            <Button variant="outline" size="lg">
              Explorar experiencias
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h3 className="font-semibold text-gray-900 mb-4">
            ¿Necesitas ayuda?
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <Link href={ROUTES.HOME} className="p-4 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="text-2xl mb-2">🏠</div>
              <div className="font-medium text-gray-900">Inicio</div>
              <div className="text-gray-600">Volver al principio</div>
            </Link>
            <Link href={ROUTES.SEARCH} className="p-4 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="text-2xl mb-2">🔍</div>
              <div className="font-medium text-gray-900">Buscar</div>
              <div className="text-gray-600">Encuentra experiencias</div>
            </Link>
            <Link href="/help" className="p-4 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="text-2xl mb-2">❓</div>
              <div className="font-medium text-gray-900">Ayuda</div>
              <div className="text-gray-600">Centro de soporte</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
