'use client';

import { useState } from 'react';
import { Card, CardContent, Button } from '@/components/ui';
import { useMyBookings } from '@/hooks';
import { formatDate } from '@/lib/utils';

export default function CapturedPage() {
  const { data: bookings, isLoading } = useMyBookings();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando tu galería...</p>
      </div>
    );
  }

  // Get completed bookings with images
  const completedTrips = bookings?.filter(
    (b) => b.status === 'COMPLETED' && b.experience?.images?.length > 0
  ) || [];

  // Flatten all images from trips
  const allPhotos = completedTrips.flatMap((booking) =>
    booking.experience.images.map((image: string, idx: number) => ({
      id: `${booking.id}-${idx}`,
      url: image,
      bookingId: booking.id,
      experienceTitle: booking.experience.title,
      city: booking.experience.city,
      country: booking.experience.country,
      date: booking.completedAt || booking.startDate,
    }))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Capturado en Ruta</h2>
          <p className="text-gray-600 mt-1">
            Tus mejores momentos de viaje • {allPhotos.length} fotos
          </p>
        </div>
        <Button variant="primary" disabled>
          + Subir fotos
        </Button>
      </div>

      {/* Gallery */}
      {allPhotos.length > 0 ? (
        <>
          {/* Timeline view by trip */}
          <div className="space-y-8">
            {completedTrips.map((trip) => (
              <div key={trip.id}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {trip.experience.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      📍 {trip.experience.city}, {trip.experience.country} •{' '}
                      {formatDate(trip.completedAt || trip.startDate)}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {trip.experience.images.length} fotos
                  </span>
                </div>

                {/* Photo Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {trip.experience.images.map((image: string, idx: number) => (
                    <div
                      key={idx}
                      className="aspect-square cursor-pointer group relative overflow-hidden rounded-lg"
                      onClick={() => setSelectedImage(image)}
                    >
                      <img
                        src={image}
                        alt={`${trip.experience.title} - Foto ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Lightbox Modal */}
          {selectedImage && (
            <div
              className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedImage(null)}
            >
              <button
                className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </button>
              <img
                src={selectedImage}
                alt="Foto ampliada"
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </>
      ) : (
        <Card variant="bordered" padding="lg">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aún no tienes fotos
            </h3>
            <p className="text-gray-600 mb-6">
              Completa tus primeras experiencias y captura momentos increíbles
            </p>
          </div>
        </Card>
      )}

      {/* Stats */}
      {allPhotos.length > 0 && (
        <Card variant="bordered" padding="lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-600">{allPhotos.length}</p>
              <p className="text-sm text-gray-600 mt-1">Fotos totales</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">{completedTrips.length}</p>
              <p className="text-sm text-gray-600 mt-1">Experiencias capturadas</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">
                {new Set(completedTrips.map((t) => t.experience.country)).size}
              </p>
              <p className="text-sm text-gray-600 mt-1">Países visitados</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
