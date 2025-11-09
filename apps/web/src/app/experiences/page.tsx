'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Button, Card, CardContent, Input } from '@/components/ui';
import { useExperiences } from '@/hooks';
import { ROUTES, EXPERIENCE_CATEGORIES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

export default function ExperiencesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);

  // TODO: Replace with actual data from API
  const mockExperiences = [
    {
      id: '1',
      title: 'Tour por Ciudad Perdida',
      location: 'Santa Marta, Magdalena',
      price: 450000,
      rating: 4.8,
      reviewCount: 124,
      category: 'ADVENTURE',
      image: 'https://via.placeholder.com/400x300',
      duration: 4,
      durationUnit: 'DAYS',
    },
    {
      id: '2',
      title: 'Experiencia cafetera en Salento',
      location: 'Salento, Quindío',
      price: 85000,
      rating: 4.9,
      reviewCount: 89,
      category: 'CULTURE',
      image: 'https://via.placeholder.com/400x300',
      duration: 6,
      durationUnit: 'HOURS',
    },
    {
      id: '3',
      title: 'Snorkeling en Islas del Rosario',
      location: 'Cartagena, Bolívar',
      price: 120000,
      rating: 4.7,
      reviewCount: 156,
      category: 'BEACH',
      image: 'https://via.placeholder.com/400x300',
      duration: 8,
      durationUnit: 'HOURS',
    },
    {
      id: '4',
      title: 'Trekking al Valle del Cocora',
      location: 'Salento, Quindío',
      price: 75000,
      rating: 4.9,
      reviewCount: 203,
      category: 'NATURE',
      image: 'https://via.placeholder.com/400x300',
      duration: 7,
      durationUnit: 'HOURS',
    },
    {
      id: '5',
      title: 'Tour gastronómico en Bogotá',
      location: 'Bogotá, Cundinamarca',
      price: 95000,
      rating: 4.6,
      reviewCount: 67,
      category: 'GASTRONOMY',
      image: 'https://via.placeholder.com/400x300',
      duration: 4,
      durationUnit: 'HOURS',
    },
    {
      id: '6',
      title: 'Parapente en San Gil',
      location: 'San Gil, Santander',
      price: 180000,
      rating: 5.0,
      reviewCount: 145,
      category: 'EXTREME',
      image: 'https://via.placeholder.com/400x300',
      duration: 3,
      durationUnit: 'HOURS',
    },
  ];

  const filteredExperiences = mockExperiences.filter((exp) => {
    const matchesSearch =
      !searchQuery ||
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || exp.category === selectedCategory;
    const matchesPrice = exp.price >= priceRange[0] && exp.price <= priceRange[1];
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Experiencias en Colombia</h1>
            <p className="text-gray-600 mb-6">
              Descubre {mockExperiences.length}+ experiencias únicas en todo el país
            </p>

            {/* Search bar */}
            <div className="max-w-2xl">
              <Input
                type="text"
                placeholder="Buscar experiencias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
                leftIcon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                }
              />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Filters sidebar */}
            <div className="lg:col-span-1">
              <Card variant="bordered" padding="lg">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>

                {/* Categories */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Categoría</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        !selectedCategory
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Todas
                    </button>
                    {EXPERIENCE_CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setSelectedCategory(cat.value)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === cat.value
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price range */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Rango de precio</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{formatCurrency(priceRange[0])}</span>
                      <span>{formatCurrency(priceRange[1])}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1000000"
                      step="50000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                      className="w-full"
                    />
                  </div>
                </div>

                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setSelectedCategory(null);
                    setPriceRange([0, 1000000]);
                    setSearchQuery('');
                  }}
                >
                  Limpiar filtros
                </Button>
              </Card>
            </div>

            {/* Experiences grid */}
            <div className="lg:col-span-3">
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">
                  {filteredExperiences.length} experiencia(s) encontrada(s)
                </p>
                <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Más relevantes</option>
                  <option>Precio: menor a mayor</option>
                  <option>Precio: mayor a menor</option>
                  <option>Mejor valoradas</option>
                </select>
              </div>

              {filteredExperiences.length === 0 ? (
                <Card variant="bordered" padding="lg">
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No se encontraron experiencias
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Intenta ajustar tus filtros o realiza una búsqueda diferente
                    </p>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setSelectedCategory(null);
                        setPriceRange([0, 1000000]);
                        setSearchQuery('');
                      }}
                    >
                      Limpiar filtros
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredExperiences.map((experience) => (
                    <Link key={experience.id} href={ROUTES.EXPERIENCE_DETAIL(experience.id)}>
                      <Card hoverable className="h-full overflow-hidden">
                        <div className="aspect-video relative bg-gray-200">
                          <img
                            src={experience.image}
                            alt={experience.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-sm font-semibold">
                            {formatCurrency(experience.price)}
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                            {experience.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">📍 {experience.location}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-500">⭐</span>
                              <span className="font-semibold">{experience.rating}</span>
                              <span className="text-sm text-gray-600">
                                ({experience.reviewCount})
                              </span>
                            </div>
                            <span className="text-sm text-gray-600">
                              ⏱️ {experience.duration}{' '}
                              {experience.durationUnit === 'HOURS' ? 'horas' : 'días'}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination - TODO: Implement real pagination */}
              {filteredExperiences.length > 0 && (
                <div className="mt-8 flex justify-center gap-2">
                  <Button variant="outline">← Anterior</Button>
                  <Button variant="primary">1</Button>
                  <Button variant="outline">2</Button>
                  <Button variant="outline">3</Button>
                  <Button variant="outline">Siguiente →</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
