'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { useUserMap, useAuthStore } from '@/hooks';
import { formatDate } from '@/lib/utils';

export default function MapPage() {
  const { user } = useAuthStore();
  const { data: mapData, isLoading } = useUserMap(user?.id || '');

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando tu mapa de viajes...</p>
      </div>
    );
  }

  if (!mapData?.available) {
    return (
      <Card variant="bordered" padding="lg">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Mapa no disponible
          </h3>
          <p className="text-gray-600">
            {mapData?.message || 'El mapa de viajes está deshabilitado'}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Mapa de Viajes</h2>
        <p className="text-gray-600 mt-1">
          Explora todos los lugares que has visitado
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="bordered">
          <CardContent className="p-6 text-center">
            <p className="text-4xl font-bold text-blue-600">
              {mapData.totalCountries}
            </p>
            <p className="text-sm text-gray-600 mt-2">Países visitados</p>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="p-6 text-center">
            <p className="text-4xl font-bold text-blue-600">
              {mapData.totalCities}
            </p>
            <p className="text-sm text-gray-600 mt-2">Ciudades exploradas</p>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="p-6 text-center">
            <p className="text-4xl font-bold text-blue-600">
              {mapData.locations?.length || 0}
            </p>
            <p className="text-sm text-gray-600 mt-2">Experiencias</p>
          </CardContent>
        </Card>
      </div>

      {/* Map Placeholder */}
      <Card variant="bordered" padding="lg">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Mapa interactivo
          </h3>
          <p className="text-gray-600 mb-4">
            Próximamente: Mapa interactivo con tus ubicaciones visitadas
          </p>
          <p className="text-sm text-gray-500">
            Integración con Leaflet/Google Maps en desarrollo
          </p>
        </div>
      </Card>

      {/* Countries Visited */}
      {mapData.countriesVisited && mapData.countriesVisited.length > 0 && (
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <CardTitle>Países que has visitado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {mapData.countriesVisited.map((country) => (
                <span
                  key={country}
                  className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  🌍 {country}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Locations Timeline */}
      {mapData.locations && mapData.locations.length > 0 && (
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <CardTitle>Tus experiencias por ubicación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mapData.locations.map((location, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {location.image && (
                    <div className="flex-shrink-0">
                      <img
                        src={location.image}
                        alt={location.experienceTitle}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {location.experienceTitle}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      📍 {location.city}, {location.country}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(location.visitedAt)}
                    </p>
                    {location.latitude && location.longitude && (
                      <p className="text-xs text-gray-400 mt-1">
                        Coordenadas: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {(!mapData.locations || mapData.locations.length === 0) && (
        <Card variant="bordered" padding="lg">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✈️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Comienza tu aventura
            </h3>
            <p className="text-gray-600">
              Completa tus primeras experiencias y aparecerán en tu mapa
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
