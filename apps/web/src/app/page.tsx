'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import { Button, Card, CardContent } from '@/components/ui';
import { ROUTES, EXPERIENCE_CATEGORIES } from '@/lib/constants';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`${ROUTES.EXPERIENCES}?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const featuredCategories = EXPERIENCE_CATEGORIES.slice(0, 6);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Descubre Colombia
              <br />
              <span className="text-blue-200">con quienes ya estuvieron allí</span>
            </h1>

            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Red social + marketplace de viajes. Conecta, explora y vive experiencias únicas
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto mt-8">
              <div className="flex gap-2 bg-white rounded-full shadow-2xl p-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="¿A dónde quieres ir? (ej: Cartagena, Eje Cafetero...)"
                  className="flex-1 px-6 py-4 text-gray-900 placeholder-gray-500 rounded-full focus:outline-none"
                />
                <Button type="submit" variant="primary" size="lg">
                  🔍 Buscar
                </Button>
              </div>
            </form>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-12">
              <div>
                <div className="text-3xl font-bold">500+</div>
                <div className="text-blue-200 text-sm">Experiencias</div>
              </div>
              <div>
                <div className="text-3xl font-bold">10K+</div>
                <div className="text-blue-200 text-sm">Viajeros</div>
              </div>
              <div>
                <div className="text-3xl font-bold">50+</div>
                <div className="text-blue-200 text-sm">Destinos</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explora por categoría
            </h2>
            <p className="text-lg text-gray-600">
              Encuentra la experiencia perfecta para tu próxima aventura
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredCategories.map((category) => (
              <Link
                key={category.value}
                href={`${ROUTES.EXPERIENCES}?category=${category.value}`}
              >
                <Card hoverable className="text-center cursor-pointer h-full">
                  <CardContent className="py-6">
                    <div className="text-4xl mb-3">
                      {getCategoryEmoji(category.value)}
                    </div>
                    <h3 className="font-semibold text-gray-900">{category.label}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href={ROUTES.EXPERIENCES}>
              <Button variant="outline" size="lg">
                Ver todas las categorías →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué Viajero Conectado?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card variant="elevated">
              <CardContent className="text-center py-8">
                <div className="text-5xl mb-4">🌍</div>
                <h3 className="text-xl font-semibold mb-3">Marketplace completo</h3>
                <p className="text-gray-600">
                  Tours, hoteles, guías locales y experiencias únicas en un solo lugar
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="text-center py-8">
                <div className="text-5xl mb-4">📱</div>
                <h3 className="text-xl font-semibold mb-3">Red social de viajeros</h3>
                <p className="text-gray-600">
                  Comparte tus viajes, conecta con otros viajeros y descubre tips reales
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="text-center py-8">
                <div className="text-5xl mb-4">⭐</div>
                <h3 className="text-xl font-semibold mb-3">Sistema de puntos</h3>
                <p className="text-gray-600">
                  Gana recompensas por cada viaje, reseña y actividad en la plataforma
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para tu próxima aventura?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a miles de viajeros que ya están explorando Colombia
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={ROUTES.REGISTER}>
              <Button variant="secondary" size="lg">
                Crear cuenta gratis
              </Button>
            </Link>
            <Link href={ROUTES.EXPERIENCES}>
              <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600">
                Explorar experiencias
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

function getCategoryEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    ADVENTURE: '🏔️',
    CULTURE: '🎭',
    GASTRONOMY: '🍽️',
    NATURE: '🌿',
    BEACH: '🏖️',
    CITY: '🏙️',
    RURAL: '🌾',
    EXTREME: '🪂',
    RELAX: '🧘',
    FAMILY: '👨‍👩‍👧‍👦',
  };
  return emojiMap[category] || '🌍';
}
