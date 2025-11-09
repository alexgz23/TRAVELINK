'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/auth-store';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { ROUTES, USER_ROLES } from '@/lib/constants';

const registerSchema = z
  .object({
    email: z.string().email('Correo electrónico inválido'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[a-z]/, 'Debe contener al menos una minúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmPassword: z.string(),
    displayName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    role: z.enum([USER_ROLES.VIAJERO, USER_ROLES.PROVEEDOR]),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'Debes aceptar los términos y condiciones',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading, error: authError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: USER_ROLES.VIAJERO,
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { email, password, displayName, role } = data;
      await registerUser({ email, password, displayName, role });
      router.push(ROUTES.DASHBOARD);
    } catch (error) {
      // Error is handled by the store
      console.error('Register error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link href={ROUTES.HOME} className="inline-flex items-center gap-2 mb-4">
            <span className="text-4xl">🌍</span>
            <span className="text-2xl font-bold text-gray-900">Viajero Conectado</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Crea tu cuenta</h1>
          <p className="text-gray-600">Únete a la comunidad de viajeros</p>
        </div>

        <Card variant="elevated" padding="lg">
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Error message */}
              {authError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{authError}</p>
                </div>
              )}

              {/* Role selection */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  ¿Qué tipo de cuenta deseas? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`cursor-pointer p-4 border-2 rounded-lg transition-all ${
                      selectedRole === USER_ROLES.VIAJERO
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      value={USER_ROLES.VIAJERO}
                      className="sr-only"
                      {...register('role')}
                    />
                    <div className="text-center">
                      <div className="text-3xl mb-2">🎒</div>
                      <div className="font-semibold text-gray-900">Viajero</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Explora y reserva experiencias
                      </div>
                    </div>
                  </label>

                  <label
                    className={`cursor-pointer p-4 border-2 rounded-lg transition-all ${
                      selectedRole === USER_ROLES.PROVEEDOR
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      value={USER_ROLES.PROVEEDOR}
                      className="sr-only"
                      {...register('role')}
                    />
                    <div className="text-center">
                      <div className="text-3xl mb-2">🏢</div>
                      <div className="font-semibold text-gray-900">Proveedor</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Ofrece experiencias
                      </div>
                    </div>
                  </label>
                </div>
                {errors.role && (
                  <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>
                )}
              </div>

              {/* Display Name */}
              <Input
                id="displayName"
                type="text"
                label="Nombre completo"
                placeholder="Juan Pérez"
                error={errors.displayName?.message}
                fullWidth
                required
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                }
                {...register('displayName')}
              />

              {/* Email field */}
              <Input
                id="email"
                type="email"
                label="Correo electrónico"
                placeholder="tu@email.com"
                error={errors.email?.message}
                fullWidth
                required
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
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                }
                {...register('email')}
              />

              {/* Password field */}
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                label="Contraseña"
                placeholder="••••••••"
                error={errors.password?.message}
                helperText="Mínimo 8 caracteres, con mayúsculas, minúsculas y números"
                fullWidth
                required
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                }
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                }
                {...register('password')}
              />

              {/* Confirm Password field */}
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirmar contraseña"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                fullWidth
                required
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                }
                {...register('confirmPassword')}
              />

              {/* Terms acceptance */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  {...register('acceptTerms')}
                />
                <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-700">
                  Acepto los{' '}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-800">
                    términos y condiciones
                  </Link>{' '}
                  y la{' '}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
                    política de privacidad
                  </Link>
                </label>
              </div>
              {errors.acceptTerms && (
                <p className="text-sm text-red-600">{errors.acceptTerms.message}</p>
              )}

              {/* Submit button */}
              <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
                Crear cuenta
              </Button>

              {/* Login link */}
              <p className="text-center text-sm text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <Link
                  href={ROUTES.LOGIN}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Inicia sesión aquí
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link href={ROUTES.HOME} className="text-sm text-gray-600 hover:text-gray-900">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
