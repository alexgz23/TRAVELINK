'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';
import { useMyBookings } from '@/hooks';
import { ROUTES } from '@/lib/constants';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { data: bookings, isLoading } = useMyBookings();

  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'profile' | 'points'>('overview');

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push(ROUTES.LOGIN);
    return null;
  }

  const tabs = [
    { key: 'overview', label: 'Vista general', icon: '📊' },
    { key: 'bookings', label: 'Mis reservas', icon: '🎫' },
    { key: 'profile', label: 'Perfil', icon: '👤' },
    { key: 'points', label: 'Puntos', icon: '⭐' },
  ];

  const upcomingBookings = bookings?.filter(b => b.status === 'CONFIRMED' && new Date(b.date) > new Date()) || [];
  const pastBookings = bookings?.filter(b => b.status === 'COMPLETED' || new Date(b.date) < new Date()) || [];
  const pendingBookings = bookings?.filter(b => b.status === 'PENDING') || [];

  const totalPoints = user?.profile?.totalPoints || 0;

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  ¡Hola, {user?.profile?.displayName || 'Usuario'}! 👋
                </h1>
                <p className="text-gray-600">
                  Bienvenido a tu panel de control
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Tus puntos</p>
                  <p className="text-2xl font-bold text-blue-600">{totalPoints.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                    activeTab === tab.key
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Quick stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card variant="bordered">
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600 mb-1">Próximas reservas</p>
                    <p className="text-3xl font-bold text-gray-900">{upcomingBookings.length}</p>
                  </CardContent>
                </Card>

                <Card variant="bordered">
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600 mb-1">Experiencias completadas</p>
                    <p className="text-3xl font-bold text-gray-900">{pastBookings.length}</p>
                  </CardContent>
                </Card>

                <Card variant="bordered">
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600 mb-1">Puntos acumulados</p>
                    <p className="text-3xl font-bold text-blue-600">{totalPoints}</p>
                  </CardContent>
                </Card>

                <Card variant="bordered">
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600 mb-1">Seguidores</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {user?.profile?.followerCount || 0}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Upcoming bookings */}
              {upcomingBookings.length > 0 && (
                <Card variant="bordered" padding="lg">
                  <CardHeader>
                    <CardTitle>Próximas experiencias</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingBookings.slice(0, 3).map((booking) => (
                        <Link
                          key={booking.id}
                          href={ROUTES.BOOKING_DETAIL(booking.id)}
                          className="block hover:bg-gray-50 p-4 rounded-lg transition-colors border border-gray-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">
                                {booking.experience?.title || 'Experiencia'}
                              </h4>
                              <p className="text-sm text-gray-600">
                                📅 {formatDate(booking.date)} • 👥 {booking.numberOfPeople} personas
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">
                                {formatCurrency(booking.finalPrice)}
                              </p>
                              <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full mt-1">
                                {booking.status}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {upcomingBookings.length > 3 && (
                      <Button
                        variant="outline"
                        fullWidth
                        className="mt-4"
                        onClick={() => setActiveTab('bookings')}
                      >
                        Ver todas las reservas →
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Quick actions */}
              <div className="grid md:grid-cols-3 gap-6">
                <Link href={ROUTES.EXPERIENCES}>
                  <Card hoverable className="h-full">
                    <CardContent className="p-6 text-center">
                      <div className="text-5xl mb-4">🌍</div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Explorar experiencias
                      </h3>
                      <p className="text-sm text-gray-600">
                        Descubre nuevas aventuras
                      </p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href={ROUTES.SOCIAL}>
                  <Card hoverable className="h-full">
                    <CardContent className="p-6 text-center">
                      <div className="text-5xl mb-4">📱</div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Ver feed social
                      </h3>
                      <p className="text-sm text-gray-600">
                        Comparte tus experiencias
                      </p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href={ROUTES.CHAT}>
                  <Card hoverable className="h-full">
                    <CardContent className="p-6 text-center">
                      <div className="text-5xl mb-4">💬</div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Mensajes
                      </h3>
                      <p className="text-sm text-gray-600">
                        Chatea con proveedores
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Mis reservas</h2>
                <Link href={ROUTES.EXPERIENCES}>
                  <Button variant="primary">+ Nueva reserva</Button>
                </Link>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando reservas...</p>
                </div>
              ) : bookings && bookings.length > 0 ? (
                <div className="space-y-6">
                  {/* Pending */}
                  {pendingBookings.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Pendientes ({pendingBookings.length})</h3>
                      <div className="space-y-4">
                        {pendingBookings.map((booking) => (
                          <BookingCard key={booking.id} booking={booking} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upcoming */}
                  {upcomingBookings.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Próximas ({upcomingBookings.length})</h3>
                      <div className="space-y-4">
                        {upcomingBookings.map((booking) => (
                          <BookingCard key={booking.id} booking={booking} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Past */}
                  {pastBookings.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Completadas ({pastBookings.length})</h3>
                      <div className="space-y-4">
                        {pastBookings.map((booking) => (
                          <BookingCard key={booking.id} booking={booking} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Card variant="bordered" padding="lg">
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎫</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No tienes reservas aún
                    </h3>
                    <p className="text-gray-600 mb-6">
                      ¡Explora experiencias increíbles y haz tu primera reserva!
                    </p>
                    <Link href={ROUTES.EXPERIENCES}>
                      <Button variant="primary">Explorar experiencias</Button>
                    </Link>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Mi perfil</h2>

              <div className="grid md:grid-cols-3 gap-6">
                <Card variant="bordered" padding="lg" className="md:col-span-1">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                      {user?.profile?.displayName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {user?.profile?.displayName}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">{user?.email}</p>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {user?.role}
                    </span>
                  </div>
                </Card>

                <Card variant="bordered" padding="lg" className="md:col-span-2">
                  <h3 className="font-semibold text-gray-900 mb-4">Información personal</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-gray-200 pb-3">
                      <span className="text-gray-600">Nombre:</span>
                      <span className="font-medium">{user?.profile?.displayName || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-3">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{user?.email}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-3">
                      <span className="text-gray-600">Teléfono:</span>
                      <span className="font-medium">{user?.profile?.phone || 'No configurado'}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-3">
                      <span className="text-gray-600">Ciudad:</span>
                      <span className="font-medium">{user?.profile?.city || 'No configurado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bio:</span>
                      <span className="font-medium">{user?.profile?.bio || 'Sin bio'}</span>
                    </div>
                  </div>

                  <Button variant="primary" className="mt-6">
                    Editar perfil
                  </Button>
                </Card>
              </div>
            </div>
          )}

          {/* Points Tab */}
          {activeTab === 'points' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Mis puntos</h2>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total de puntos</p>
                  <p className="text-3xl font-bold text-blue-600">{totalPoints.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Card variant="bordered" padding="lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Ganados</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {(user?.profile?.totalPoints || 0).toLocaleString()}
                  </p>
                </Card>

                <Card variant="bordered" padding="lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Canjeados</h4>
                  <p className="text-2xl font-bold text-orange-600">0</p>
                </Card>

                <Card variant="bordered" padding="lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Disponibles</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {totalPoints.toLocaleString()}
                  </p>
                </Card>
              </div>

              <Card variant="bordered" padding="lg">
                <h3 className="font-semibold text-gray-900 mb-4">Cómo ganar puntos</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <span className="text-2xl">✅</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">Completar reservas</h4>
                      <p className="text-sm text-gray-600">Gana el 5% del valor en puntos</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <span className="text-2xl">⭐</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">Dejar reseñas</h4>
                      <p className="text-sm text-gray-600">100 puntos por reseña</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <span className="text-2xl">👥</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">Referir amigos</h4>
                      <p className="text-sm text-gray-600">500 puntos por referido</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <span className="text-2xl">📱</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">Publicar en social</h4>
                      <p className="text-sm text-gray-600">50 puntos por publicación</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

// Booking Card Component
function BookingCard({ booking }: { booking: any }) {
  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
    COMPLETED: 'bg-blue-100 text-blue-700',
    REFUNDED: 'bg-gray-100 text-gray-700',
  };

  return (
    <Link href={ROUTES.BOOKING_DETAIL(booking.id)}>
      <Card hoverable variant="bordered">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">
                {booking.experience?.title || 'Experiencia'}
              </h4>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span>📅 {formatDate(booking.date)}</span>
                <span>👥 {booking.numberOfPeople} personas</span>
                <span>💳 {formatCurrency(booking.finalPrice)}</span>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[booking.status as keyof typeof statusColors]}`}>
                {booking.status}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
