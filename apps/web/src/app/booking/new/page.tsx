'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MainLayout } from '@/components/layout';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { useExperience, useCreateBooking } from '@/hooks';
import { ROUTES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

const bookingSchema = z.object({
  numberOfPeople: z.number().min(1, 'Debe ser al menos 1 persona'),
  contactName: z.string().min(2, 'Nombre requerido'),
  contactEmail: z.string().email('Email inválido'),
  contactPhone: z.string().min(10, 'Teléfono debe tener al menos 10 dígitos'),
  specialRequests: z.string().optional(),
  pointsToUse: z.number().min(0).optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function NewBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const experienceId = searchParams.get('experienceId') || '';
  const selectedDate = searchParams.get('date') || '';

  const [currentStep, setCurrentStep] = useState(1);
  const [numberOfPeople, setNumberOfPeople] = useState(1);

  const { data: experience, isLoading } = useExperience(experienceId);
  const { mutate: createBooking, isPending: isCreating } = useCreateBooking();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      numberOfPeople: 1,
      pointsToUse: 0,
    },
  });

  useEffect(() => {
    if (!experienceId || !selectedDate) {
      router.push(ROUTES.EXPERIENCES);
    }
  }, [experienceId, selectedDate, router]);

  if (isLoading || !experience) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const watchNumberOfPeople = watch('numberOfPeople', 1);
  const watchPointsToUse = watch('pointsToUse', 0);

  const basePrice = experience.discountPrice || experience.price;
  const subtotal = basePrice * watchNumberOfPeople;
  const pointsDiscount = watchPointsToUse || 0;
  const total = Math.max(subtotal - pointsDiscount, 0);

  const onSubmit = (data: BookingFormData) => {
    createBooking(
      {
        experienceId,
        date: selectedDate,
        numberOfPeople: data.numberOfPeople,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        specialRequests: data.specialRequests,
        pointsToUse: data.pointsToUse,
      },
      {
        onSuccess: (booking) => {
          router.push(`/booking/${booking.id}/payment`);
        },
        onError: (error) => {
          console.error('Error creating booking:', error);
          alert('Error al crear la reserva. Por favor intenta de nuevo.');
        },
      }
    );
  };

  const steps = [
    { number: 1, title: 'Detalles' },
    { number: 2, title: 'Contacto' },
    { number: 3, title: 'Confirmación' },
  ];

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              {steps.map((step, idx) => (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                      currentStep >= step.number
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step.number}
                  </div>
                  <div className="ml-2 text-sm font-medium">
                    <span
                      className={
                        currentStep >= step.number ? 'text-blue-600' : 'text-gray-600'
                      }
                    >
                      {step.title}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="w-16 h-0.5 bg-gray-300 mx-4" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card variant="elevated" padding="lg">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                  Completa tu reserva
                </h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Step 1: Booking details */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Detalles de la reserva
                        </h3>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Fecha seleccionada
                            </label>
                            <input
                              type="date"
                              value={selectedDate}
                              disabled
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Número de personas *
                            </label>
                            <input
                              type="number"
                              min="1"
                              max={experience.maxGroupSize}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              {...register('numberOfPeople', { valueAsNumber: true })}
                            />
                            {errors.numberOfPeople && (
                              <p className="text-sm text-red-600 mt-1">
                                {errors.numberOfPeople.message}
                              </p>
                            )}
                            <p className="text-sm text-gray-500 mt-1">
                              Máximo: {experience.maxGroupSize} personas
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Solicitudes especiales (opcional)
                            </label>
                            <textarea
                              rows={4}
                              placeholder="Ej: Requerimientos dietéticos, necesidades especiales, etc."
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              {...register('specialRequests')}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Usar puntos (opcional)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="10000"
                              placeholder="0"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              {...register('pointsToUse', { valueAsNumber: true })}
                            />
                            <p className="text-sm text-gray-500 mt-1">
                              Puntos disponibles: 5,000 (1 punto = $1 COP)
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button type="button" onClick={() => setCurrentStep(2)}>
                          Continuar →
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Contact information */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Información de contacto
                        </h3>

                        <div className="space-y-4">
                          <Input
                            id="contactName"
                            label="Nombre completo"
                            placeholder="Juan Pérez"
                            error={errors.contactName?.message}
                            fullWidth
                            required
                            {...register('contactName')}
                          />

                          <Input
                            id="contactEmail"
                            type="email"
                            label="Correo electrónico"
                            placeholder="juan@ejemplo.com"
                            error={errors.contactEmail?.message}
                            fullWidth
                            required
                            {...register('contactEmail')}
                          />

                          <Input
                            id="contactPhone"
                            type="tel"
                            label="Teléfono"
                            placeholder="3001234567"
                            error={errors.contactPhone?.message}
                            fullWidth
                            required
                            {...register('contactPhone')}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentStep(1)}
                        >
                          ← Atrás
                        </Button>
                        <Button type="button" onClick={() => setCurrentStep(3)}>
                          Continuar →
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Confirmation */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Confirma tu reserva
                        </h3>

                        <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Experiencia:</span>
                            <span className="font-medium text-gray-900">{experience.title}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Fecha:</span>
                            <span className="font-medium text-gray-900">{selectedDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Personas:</span>
                            <span className="font-medium text-gray-900">
                              {watchNumberOfPeople}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Contacto:</span>
                            <span className="font-medium text-gray-900">
                              {watch('contactName')}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 flex items-start gap-3">
                          <input
                            type="checkbox"
                            id="terms"
                            className="mt-1"
                            required
                          />
                          <label htmlFor="terms" className="text-sm text-gray-700">
                            Acepto los{' '}
                            <Link href="/terms" className="text-blue-600 hover:underline">
                              términos y condiciones
                            </Link>{' '}
                            y la{' '}
                            <Link href="/privacy" className="text-blue-600 hover:underline">
                              política de privacidad
                            </Link>
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentStep(2)}
                        >
                          ← Atrás
                        </Button>
                        <Button type="submit" isLoading={isCreating}>
                          Confirmar y pagar
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </Card>
            </div>

            {/* Summary sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card variant="elevated" padding="lg">
                  <h3 className="font-semibold text-gray-900 mb-4">Resumen de reserva</h3>

                  <div className="mb-4">
                    <div className="aspect-video relative bg-gray-200 rounded-lg overflow-hidden mb-3">
                      <img
                        src={experience.coverImage || experience.images?.[0] || 'https://via.placeholder.com/400x300'}
                        alt={experience.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900">{experience.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">📍 {experience.location}</p>
                  </div>

                  <div className="space-y-3 py-4 border-t border-b border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {formatCurrency(basePrice)} x {watchNumberOfPeople} personas
                      </span>
                      <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>

                    {watchPointsToUse > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Descuento por puntos</span>
                        <span className="text-green-600">
                          -{formatCurrency(watchPointsToUse)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(total)}
                    </span>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900">
                      💡 <strong>Reserva segura:</strong> No se realizará ningún cargo hasta que confirmes tu reserva.
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
