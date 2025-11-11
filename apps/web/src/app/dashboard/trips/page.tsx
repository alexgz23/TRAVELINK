'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, Button } from '@/components/ui';
import { useMyBookings } from '@/hooks';
import { ROUTES } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';

type TabType = 'active' | 'upcoming' | 'past' | 'cancelled';

export default function TripsPage() {
  const { data: bookings, isLoading } = useMyBookings();
  const [activeTab, setActiveTab] = useState<TabType>('active');

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando tus viajes...</p>
      </div>
    );
  }

  // Filter bookings by status
  const activeBookings = bookings?.filter(
    (b) => ['CONFIRMED', 'IN_PROGRESS'].includes(b.status) && new Date(b.startDate) > new Date()
  ) || [];

  const upcomingBookings = bookings?.filter(
    (b) => b.status === 'PENDING' && new Date(b.startDate) > new Date()
  ) || [];

  const pastBookings = bookings?.filter(
    (b) => b.status === 'COMPLETED' || (b.status === 'CONFIRMED' && new Date(b.endDate || b.startDate) < new Date())
  ) || [];

  const cancelledBookings = bookings?.filter(
    (b) => ['CANCELLED', 'REJECTED'].includes(b.status)
  ) || [];

  const tabs = [
    { key: 'active' as TabType, label: 'Activas', count: activeBookings.length },
    { key: 'upcoming' as TabType, label: 'Pendientes', count: upcomingBookings.length },
    { key: 'past' as TabType, label: 'Completadas', count: pastBookings.length },
    { key: 'cancelled' as TabType, label: 'Canceladas', count: cancelledBookings.length },
  ];

  const getCurrentBookings = () => {
    switch (activeTab) {
      case 'active':
        return activeBookings;
      case 'upcoming':
        return upcomingBookings;
      case 'past':
        return pastBookings;
      case 'cancelled':
        return cancelledBookings;
      default:
        return [];
    }
  };

  const currentBookings = getCurrentBookings();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mis Viajes</h2>
          <p className="text-gray-600 mt-1">
            Gestiona todas tus reservas y experiencias
          </p>
        </div>
        <Link href={ROUTES.EXPERIENCES}>
          <Button variant="primary">+ Nueva reserva</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Bookings List */}
      {currentBookings.length > 0 ? (
        <div className="space-y-4">
          {currentBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      ) : (
        <Card variant="bordered" padding="lg">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              {activeTab === 'active' && '✈️'}
              {activeTab === 'upcoming' && '⏳'}
              {activeTab === 'past' && '✅'}
              {activeTab === 'cancelled' && '❌'}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No tienes viajes {tabs.find((t) => t.key === activeTab)?.label.toLowerCase()}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'active' && '¡Es hora de planear tu próxima aventura!'}
              {activeTab === 'upcoming' && 'Todas tus reservas confirmadas aparecerán aquí'}
              {activeTab === 'past' && 'Tus experiencias completadas aparecerán aquí'}
              {activeTab === 'cancelled' && 'No tienes reservas canceladas'}
            </p>
            {(activeTab === 'active' || activeTab === 'upcoming') && (
              <Link href={ROUTES.EXPERIENCES}>
                <Button variant="primary">Explorar experiencias</Button>
              </Link>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

// Booking Card Component
function BookingCard({ booking }: { booking: any }) {
  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-green-100 text-green-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-gray-100 text-gray-700',
    CANCELLED: 'bg-red-100 text-red-700',
    REJECTED: 'bg-red-100 text-red-700',
  };

  const statusLabels = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmada',
    IN_PROGRESS: 'En progreso',
    COMPLETED: 'Completada',
    CANCELLED: 'Cancelada',
    REJECTED: 'Rechazada',
  };

  return (
    <Link href={ROUTES.BOOKING_DETAIL(booking.id)}>
      <Card hoverable variant="bordered">
        <CardContent className="p-6">
          <div className="flex gap-4">
            {/* Image */}
            {booking.experience?.images?.[0] && (
              <div className="flex-shrink-0">
                <img
                  src={booking.experience.images[0]}
                  alt={booking.experience.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {booking.experience?.title || 'Experiencia'}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    📍 {booking.experience?.city}, {booking.experience?.country}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>📅 {formatDate(booking.startDate)}</span>
                    {booking.endDate && (
                      <span>→ {formatDate(booking.endDate)}</span>
                    )}
                    <span>👥 {booking.numberOfPeople} personas</span>
                    <span className="font-medium text-gray-900">
                      💳 {formatCurrency(booking.totalPrice)}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    statusColors[booking.status as keyof typeof statusColors]
                  }`}
                >
                  {statusLabels[booking.status as keyof typeof statusLabels]}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
