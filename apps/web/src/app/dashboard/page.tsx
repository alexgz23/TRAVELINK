'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { useUserStats, useMyBookings, usePointsBalance } from '@/hooks';
import { ROUTES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const { data: bookings, isLoading: bookingsLoading } = useMyBookings();
  const { data: pointsBalance } = usePointsBalance();

  const upcomingTrip = stats?.upcomingTrip;

  if (statsLoading || bookingsLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando tu dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Trip */}
      {upcomingTrip && (
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-blue-100 text-sm mb-1">Próximo viaje</p>
                <h3 className="text-2xl font-bold mb-2">
                  {upcomingTrip.experience?.title}
                </h3>
                <p className="text-blue-100">
                  📍 {upcomingTrip.experience?.city}, {upcomingTrip.experience?.country}
                </p>
                <p className="text-blue-100 mt-2">
                  📅 {formatDate(upcomingTrip.startDate)}
                </p>
              </div>
              <Link href={ROUTES.BOOKING_DETAIL(upcomingTrip.id)}>
                <Button variant="outline" className="bg-white text-blue-600 hover:bg-blue-50">
                  Ver detalles
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="bordered">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Viajes completados</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.completedBookings || 0}</p>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Países visitados</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.countriesVisited || 0}</p>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Puntos acumulados</p>
            <p className="text-3xl font-bold text-blue-600">{stats?.points?.toLocaleString() || 0}</p>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Reseñas</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.reviewsCount || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      {pointsBalance?.currentLevel && (
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <CardTitle>Tu nivel actual: {pointsBalance.currentLevel.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Progreso al siguiente nivel</span>
                  <span className="font-medium">
                    {pointsBalance.currentPoints.toLocaleString()} / {pointsBalance.nextLevel?.minPoints?.toLocaleString() || '∞'} pts
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(pointsBalance.currentLevel.progress, 100)}%` }}
                  ></div>
                </div>
              </div>

              {pointsBalance.nextLevel && (
                <div className="text-sm">
                  <p className="text-gray-600">
                    Te faltan <span className="font-bold text-blue-600">{pointsBalance.pointsToNextLevel.toLocaleString()}</span> puntos
                    para alcanzar el nivel <span className="font-bold">{pointsBalance.nextLevel.name}</span>
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                {pointsBalance.currentLevel.benefits.map((benefit, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href={ROUTES.EXPERIENCES}>
          <Card hoverable className="h-full">
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-3">🌍</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Explorar experiencias
              </h3>
              <p className="text-sm text-gray-600">
                Descubre nuevas aventuras
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/trips">
          <Card hoverable className="h-full">
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-3">✈️</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Mis viajes
              </h3>
              <p className="text-sm text-gray-600">
                {stats?.activeBookings || 0} reservas activas
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/points">
          <Card hoverable className="h-full">
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-3">⭐</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Mis puntos
              </h3>
              <p className="text-sm text-gray-600">
                {pointsBalance?.currentPoints?.toLocaleString() || 0} puntos disponibles
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      {stats?.reviewsCount > 0 && (
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">⭐</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Has escrito {stats.reviewsCount} reseñas</p>
                  <p className="text-sm text-gray-600">Comparte tus experiencias</p>
                </div>
              </div>

              {stats?.postsCount > 0 && (
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">📱</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{stats.postsCount} publicaciones en social</p>
                    <p className="text-sm text-gray-600">Sigue compartiendo</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
