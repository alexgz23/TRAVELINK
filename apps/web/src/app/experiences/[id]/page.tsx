'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MainLayout } from '@/components/layout';
import { Button, Card, CardContent } from '@/components/ui';
import { useExperience, useExperienceReviews } from '@/hooks';
import { ROUTES } from '@/lib/constants';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';

export default function ExperienceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const experienceId = params.id as string;

  const { data: experience, isLoading, error } = useExperience(experienceId);
  const { data: reviews } = useExperienceReviews(experienceId);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>('');

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando experiencia...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !experience) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card variant="bordered" padding="lg">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">😕</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Experiencia no encontrada
              </h2>
              <p className="text-gray-600 mb-6">
                No pudimos encontrar la experiencia que buscas
              </p>
              <Link href={ROUTES.EXPERIENCES}>
                <Button variant="primary">Volver a experiencias</Button>
              </Link>
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const handleBookNow = () => {
    router.push(`/booking/new?experienceId=${experienceId}&date=${selectedDate}`);
  };

  const images = experience.images || [experience.coverImage || 'https://via.placeholder.com/800x600'];
  const averageRating = experience.averageRating || 0;
  const reviewCount = experience.reviewCount || 0;

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center text-sm text-gray-600">
              <Link href={ROUTES.HOME} className="hover:text-blue-600">
                Inicio
              </Link>
              <span className="mx-2">/</span>
              <Link href={ROUTES.EXPERIENCES} className="hover:text-blue-600">
                Experiencias
              </Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900 font-medium truncate">{experience.title}</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content - Left side */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title and basic info */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {experience.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="font-semibold">{averageRating.toFixed(1)}</span>
                        <span>({reviewCount} reseñas)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        📍 {experience.location}
                      </div>
                      <div className="flex items-center gap-1">
                        ⏱️ {experience.duration} {experience.durationUnit === 'HOURS' ? 'horas' : 'días'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category badge */}
                <div className="flex gap-2 mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {experience.category}
                  </span>
                  {experience.isFeatured && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                      ⭐ Destacado
                    </span>
                  )}
                  {experience.difficulty && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      {experience.difficulty}
                    </span>
                  )}
                </div>
              </div>

              {/* Image gallery */}
              <Card variant="bordered" padding="none" className="overflow-hidden">
                <div className="aspect-video relative bg-gray-200">
                  <img
                    src={images[selectedImage]}
                    alt={experience.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {images.length > 1 && (
                  <div className="p-4 flex gap-2 overflow-x-auto">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === idx ? 'border-blue-600' : 'border-gray-200'
                        }`}
                      >
                        <img src={img} alt={`${experience.title} ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </Card>

              {/* Description */}
              <Card variant="bordered" padding="lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Acerca de esta experiencia
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">
                    {experience.longDescription || experience.description}
                  </p>
                </div>

                {experience.tags && experience.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {experience.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </Card>

              {/* What's included / excluded */}
              <div className="grid md:grid-cols-2 gap-6">
                {experience.included && experience.included.length > 0 && (
                  <Card variant="bordered" padding="lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      ✅ Qué incluye
                    </h3>
                    <ul className="space-y-2">
                      {experience.included.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {experience.excluded && experience.excluded.length > 0 && (
                  <Card variant="bordered" padding="lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      ❌ Qué NO incluye
                    </h3>
                    <ul className="space-y-2">
                      {experience.excluded.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-red-600 mt-1">✗</span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>

              {/* Requirements */}
              {experience.requirements && experience.requirements.length > 0 && (
                <Card variant="bordered" padding="lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    📋 Requisitos
                  </h3>
                  <ul className="space-y-2">
                    {experience.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span className="text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                  {experience.minAge && (
                    <p className="mt-4 text-sm text-gray-600">
                      <strong>Edad mínima:</strong> {experience.minAge} años
                    </p>
                  )}
                </Card>
              )}

              {/* Cancellation policy */}
              {experience.cancellationPolicy && (
                <Card variant="bordered" padding="lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    🔄 Política de cancelación
                  </h3>
                  <p className="text-gray-700">{experience.cancellationPolicy}</p>
                </Card>
              )}

              {/* Reviews */}
              <Card variant="bordered" padding="lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Reseñas ({reviewCount})
                  </h3>
                  {averageRating > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-gray-900">
                        {averageRating.toFixed(1)}
                      </span>
                      <div>
                        <div className="flex text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <span key={i}>
                              {i < Math.round(averageRating) ? '★' : '☆'}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-gray-600">{reviewCount} reseñas</p>
                      </div>
                    </div>
                  )}
                </div>

                {reviews && reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.slice(0, 5).map((review) => (
                      <div key={review.id} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                            {review.user?.profile?.displayName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {review.user?.profile?.displayName || 'Usuario'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {formatRelativeTime(review.createdAt)}
                                </p>
                              </div>
                              <div className="flex text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                                ))}
                              </div>
                            </div>
                            {review.title && (
                              <h4 className="font-semibold text-gray-900 mb-1">
                                {review.title}
                              </h4>
                            )}
                            <p className="text-gray-700">{review.comment}</p>
                            {review.isVerifiedBooking && (
                              <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                ✓ Reserva verificada
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Aún no hay reseñas para esta experiencia</p>
                    <p className="text-sm text-gray-500 mt-2">Sé el primero en reservar y dejar tu opinión</p>
                  </div>
                )}
              </Card>
            </div>

            {/* Booking sidebar - Right side */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card variant="elevated" padding="lg">
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 mb-2">
                      {experience.discountPrice ? (
                        <>
                          <span className="text-3xl font-bold text-gray-900">
                            {formatCurrency(experience.discountPrice)}
                          </span>
                          <span className="text-lg text-gray-500 line-through">
                            {formatCurrency(experience.price)}
                          </span>
                        </>
                      ) : (
                        <span className="text-3xl font-bold text-gray-900">
                          {formatCurrency(experience.price)}
                        </span>
                      )}
                      <span className="text-gray-600">/ persona</span>
                    </div>
                    {experience.discountPrice && (
                      <p className="text-sm text-green-600 font-medium">
                        ¡Ahorra {formatCurrency(experience.price - experience.discountPrice)}!
                      </p>
                    )}
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min={new Date().toISOString().split('T')[0]}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de personas
                      </label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {[...Array(Math.min(experience.maxGroupSize, 10))].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1} {i === 0 ? 'persona' : 'personas'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleBookNow}
                    disabled={!selectedDate}
                  >
                    Reservar ahora
                  </Button>

                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span>✓</span>
                      <span>Confirmación inmediata</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>✓</span>
                      <span>Cancelación flexible</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>✓</span>
                      <span>Guía local experto</span>
                    </div>
                  </div>

                  {/* Provider info */}
                  {experience.provider && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-3">Ofrecido por</p>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                          {experience.provider.profile?.displayName?.charAt(0).toUpperCase() || 'P'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {experience.provider.profile?.displayName || 'Proveedor'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {experience.provider.profile?.experienceCount || 0} experiencias
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
