'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import { useAuthStore } from '@/stores/auth-store';
import { useUserStats, usePointsBalance } from '@/hooks';
import { ROUTES } from '@/lib/constants';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { data: stats } = useUserStats();
  const { data: pointsBalance } = usePointsBalance();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push(ROUTES.LOGIN);
    return null;
  }

  const navigationItems = [
    { href: '/dashboard', label: 'Resumen', icon: '📊' },
    { href: '/dashboard/trips', label: 'Mis Viajes', icon: '✈️' },
    { href: '/dashboard/captured', label: 'Capturado en Ruta', icon: '📸' },
    { href: '/dashboard/map', label: 'Mapa de Viajes', icon: '🗺️' },
    { href: '/dashboard/profile', label: 'Mi Perfil', icon: '👤' },
    { href: '/dashboard/points', label: 'Mis Puntos', icon: '⭐' },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(href);
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  ¡Hola, {user?.name || 'Usuario'}! 👋
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Nivel: {pointsBalance?.currentLevel?.name || 'Explorador'} •
                  {stats?.countriesVisited || 0} países visitados
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-600">Tus puntos</p>
                  <p className="text-xl font-bold text-blue-600">
                    {pointsBalance?.currentPoints?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex gap-1 overflow-x-auto scrollbar-hide">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 whitespace-nowrap transition-colors ${
                    isActive(item.href)
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </div>
    </MainLayout>
  );
}
