'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MainLayout } from '@/components/layout';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';
import { useUpdateProfile } from '@/hooks';
import { ROUTES } from '@/lib/constants';

const profileSchema = z.object({
  displayName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bio: z.string().max(500, 'La bio no puede tener más de 500 caracteres').optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  website: z.string().url('URL inválida').or(z.literal('')).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, setUser } = useAuthStore();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.profile?.displayName || '',
      firstName: user?.profile?.firstName || '',
      lastName: user?.profile?.lastName || '',
      bio: user?.profile?.bio || '',
      phone: user?.profile?.phone || '',
      city: user?.profile?.city || '',
      country: user?.profile?.country || 'Colombia',
      website: user?.profile?.website || '',
    },
  });

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push(ROUTES.LOGIN);
    return null;
  }

  const onSubmit = (data: ProfileFormData) => {
    updateProfile(data, {
      onSuccess: (updatedUser) => {
        setUser(updatedUser);
        alert('Perfil actualizado exitosamente');
      },
      onError: (error) => {
        console.error('Error updating profile:', error);
        alert('Error al actualizar el perfil');
      },
    });
  };

  const tabs = [
    { key: 'profile', label: 'Perfil', icon: '👤' },
    { key: 'security', label: 'Seguridad', icon: '🔒' },
    { key: 'notifications', label: 'Notificaciones', icon: '🔔' },
  ];

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Configuración</h1>

          {/* Tabs */}
          <div className="bg-white border border-gray-200 rounded-lg mb-6">
            <div className="flex border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex-1 px-6 py-4 font-medium transition-colors border-b-2 ${
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

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Card variant="bordered" padding="lg">
                <CardHeader>
                  <CardTitle>Información personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold">
                      {user?.profile?.displayName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <Button type="button" variant="outline" size="sm">
                        Cambiar foto
                      </Button>
                      <p className="text-sm text-gray-500 mt-1">
                        JPG, PNG o GIF. Máximo 2MB.
                      </p>
                    </div>
                  </div>

                  <Input
                    id="displayName"
                    label="Nombre para mostrar"
                    placeholder="Juan Pérez"
                    error={errors.displayName?.message}
                    fullWidth
                    required
                    {...register('displayName')}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      id="firstName"
                      label="Nombre"
                      placeholder="Juan"
                      error={errors.firstName?.message}
                      fullWidth
                      {...register('firstName')}
                    />

                    <Input
                      id="lastName"
                      label="Apellido"
                      placeholder="Pérez"
                      error={errors.lastName?.message}
                      fullWidth
                      {...register('lastName')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Biografía
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Cuéntanos sobre ti..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      {...register('bio')}
                    />
                    {errors.bio && (
                      <p className="text-sm text-red-600 mt-1">{errors.bio.message}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      id="phone"
                      type="tel"
                      label="Teléfono"
                      placeholder="3001234567"
                      error={errors.phone?.message}
                      fullWidth
                      {...register('phone')}
                    />

                    <Input
                      id="website"
                      type="url"
                      label="Sitio web"
                      placeholder="https://tu-sitio.com"
                      error={errors.website?.message}
                      fullWidth
                      {...register('website')}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      id="city"
                      label="Ciudad"
                      placeholder="Bogotá"
                      error={errors.city?.message}
                      fullWidth
                      {...register('city')}
                    />

                    <Input
                      id="country"
                      label="País"
                      placeholder="Colombia"
                      error={errors.country?.message}
                      fullWidth
                      {...register('country')}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" isLoading={isPending}>
                  Guardar cambios
                </Button>
              </div>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card variant="bordered" padding="lg">
                <CardHeader>
                  <CardTitle>Cambiar contraseña</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    id="currentPassword"
                    type="password"
                    label="Contraseña actual"
                    placeholder="••••••••"
                    fullWidth
                  />

                  <Input
                    id="newPassword"
                    type="password"
                    label="Nueva contraseña"
                    placeholder="••••••••"
                    helperText="Mínimo 8 caracteres, con mayúsculas, minúsculas y números"
                    fullWidth
                  />

                  <Input
                    id="confirmPassword"
                    type="password"
                    label="Confirmar nueva contraseña"
                    placeholder="••••••••"
                    fullWidth
                  />

                  <Button type="button" variant="primary">
                    Cambiar contraseña
                  </Button>
                </CardContent>
              </Card>

              <Card variant="bordered" padding="lg">
                <CardHeader>
                  <CardTitle>Autenticación de dos factores</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Agrega una capa adicional de seguridad a tu cuenta
                  </p>
                  <Button type="button" variant="outline">
                    Activar 2FA
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card variant="bordered" padding="lg">
              <CardHeader>
                <CardTitle>Preferencias de notificaciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">Notificaciones por email</p>
                    <p className="text-sm text-gray-600">Recibe actualizaciones en tu correo</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 text-blue-600" defaultChecked />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">Notificaciones push</p>
                    <p className="text-sm text-gray-600">Recibe notificaciones en tu navegador</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 text-blue-600" defaultChecked />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">Reservas confirmadas</p>
                    <p className="text-sm text-gray-600">Notificaciones de reservas</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 text-blue-600" defaultChecked />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">Nuevos mensajes</p>
                    <p className="text-sm text-gray-600">Notificaciones de chat</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 text-blue-600" defaultChecked />
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">Newsletter</p>
                    <p className="text-sm text-gray-600">Ofertas y novedades</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 text-blue-600" />
                </div>

                <Button type="button" variant="primary" className="mt-4">
                  Guardar preferencias
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
