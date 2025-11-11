'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { useAuthStore, useUpdateExtendedProfile, useUpdatePrivacy } from '@/hooks';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const updateExtendedProfile = useUpdateExtendedProfile();
  const updatePrivacy = useUpdatePrivacy();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPrivacy, setIsEditingPrivacy] = useState(false);

  // Extended Profile Form
  const [profileForm, setProfileForm] = useState({
    bio: user?.bio || '',
    country: user?.country || '',
    city: user?.city || '',
    languages: user?.languages || [],
    travelStyle: user?.travelStyle || [],
    budgetRange: user?.budgetRange || 'medium',
    dreamDestinations: user?.dreamDestinations || [],
  });

  // Privacy Form
  const [privacyForm, setPrivacyForm] = useState({
    isProfilePublic: user?.isProfilePublic ?? true,
    showMap: user?.showMap ?? true,
    showTrips: user?.showTrips ?? true,
  });

  const handleSaveProfile = async () => {
    try {
      await updateExtendedProfile.mutateAsync(profileForm);
      setIsEditingProfile(false);
      alert('Perfil actualizado correctamente');
    } catch (error) {
      alert('Error al actualizar perfil');
    }
  };

  const handleSavePrivacy = async () => {
    try {
      await updatePrivacy.mutateAsync(privacyForm);
      setIsEditingPrivacy(false);
      alert('Configuración de privacidad actualizada');
    } catch (error) {
      alert('Error al actualizar privacidad');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Mi Perfil</h2>
        <p className="text-gray-600 mt-1">
          Gestiona tu información personal y preferencias
        </p>
      </div>

      {/* Basic Info Card */}
      <Card variant="bordered" padding="lg">
        <CardHeader>
          <CardTitle>Información básica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-3">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-600">Nombre:</span>
                <span className="font-medium">{user?.name}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-600">Rol:</span>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {user?.role}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nivel:</span>
                <span className="font-medium">{user?.level || 'EXPLORER'}</span>
              </div>
            </div>
          </div>

          <Button variant="outline" className="mt-6" disabled>
            Editar información básica
          </Button>
        </CardContent>
      </Card>

      {/* Extended Profile */}
      <Card variant="bordered" padding="lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Perfil de viajero</CardTitle>
            {!isEditingProfile ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingProfile(true)}
              >
                Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingProfile(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveProfile}
                  disabled={updateExtendedProfile.isPending}
                >
                  Guardar
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              {isEditingProfile ? (
                <textarea
                  value={profileForm.bio}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, bio: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Cuéntanos sobre ti y tus pasiones de viaje..."
                  maxLength={500}
                />
              ) : (
                <p className="text-gray-600">{profileForm.bio || 'No configurado'}</p>
              )}
            </div>

            {/* Location */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  País
                </label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={profileForm.country}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, country: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-600">{profileForm.country || 'No configurado'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad
                </label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={profileForm.city}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, city: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-600">{profileForm.city || 'No configurado'}</p>
                )}
              </div>
            </div>

            {/* Budget Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rango de presupuesto preferido
              </label>
              {isEditingProfile ? (
                <select
                  value={profileForm.budgetRange}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, budgetRange: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Económico</option>
                  <option value="medium">Moderado</option>
                  <option value="high">Alto</option>
                  <option value="luxury">Lujo</option>
                </select>
              ) : (
                <p className="text-gray-600">
                  {profileForm.budgetRange === 'low' && 'Económico'}
                  {profileForm.budgetRange === 'medium' && 'Moderado'}
                  {profileForm.budgetRange === 'high' && 'Alto'}
                  {profileForm.budgetRange === 'luxury' && 'Lujo'}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card variant="bordered" padding="lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Configuración de privacidad</CardTitle>
            {!isEditingPrivacy ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingPrivacy(true)}
              >
                Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingPrivacy(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSavePrivacy}
                  disabled={updatePrivacy.isPending}
                >
                  Guardar
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Perfil público</p>
                <p className="text-sm text-gray-600">
                  Permite que otros usuarios vean tu perfil
                </p>
              </div>
              {isEditingPrivacy ? (
                <input
                  type="checkbox"
                  checked={privacyForm.isProfilePublic}
                  onChange={(e) =>
                    setPrivacyForm({
                      ...privacyForm,
                      isProfilePublic: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-blue-600"
                />
              ) : (
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    privacyForm.isProfilePublic
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {privacyForm.isProfilePublic ? 'Público' : 'Privado'}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Mostrar mapa</p>
                <p className="text-sm text-gray-600">
                  Muestra los países que has visitado
                </p>
              </div>
              {isEditingPrivacy ? (
                <input
                  type="checkbox"
                  checked={privacyForm.showMap}
                  onChange={(e) =>
                    setPrivacyForm({ ...privacyForm, showMap: e.target.checked })
                  }
                  className="w-5 h-5 text-blue-600"
                />
              ) : (
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    privacyForm.showMap
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {privacyForm.showMap ? 'Visible' : 'Oculto'}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Mostrar viajes</p>
                <p className="text-sm text-gray-600">
                  Muestra tus experiencias completadas
                </p>
              </div>
              {isEditingPrivacy ? (
                <input
                  type="checkbox"
                  checked={privacyForm.showTrips}
                  onChange={(e) =>
                    setPrivacyForm({ ...privacyForm, showTrips: e.target.checked })
                  }
                  className="w-5 h-5 text-blue-600"
                />
              ) : (
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    privacyForm.showTrips
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {privacyForm.showTrips ? 'Visible' : 'Oculto'}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
