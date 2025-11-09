'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MainLayout } from '@/components/layout';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { useBooking } from '@/hooks';
import { ROUTES } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';

const paymentSchema = z.object({
  cardNumber: z
    .string()
    .regex(/^\d{16}$/, 'Número de tarjeta inválido (16 dígitos)'),
  cardName: z.string().min(2, 'Nombre del titular requerido'),
  expiryDate: z
    .string()
    .regex(/^\d{2}\/\d{2}$/, 'Formato inválido (MM/YY)'),
  cvv: z.string().regex(/^\d{3,4}$/, 'CVV inválido (3-4 dígitos)'),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const { data: booking, isLoading } = useBooking(bookingId);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pse'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

  const onSubmit = async (data: PaymentFormData) => {
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      alert('¡Pago procesado exitosamente!');
      router.push(ROUTES.BOOKING_DETAIL(bookingId));
    }, 2000);
  };

  if (isLoading || !booking) {
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

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href={ROUTES.BOOKING_DETAIL(bookingId)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ← Volver a la reserva
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">Realizar pago</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Payment form */}
            <div className="lg:col-span-2">
              <Card variant="elevated" padding="lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Método de pago
                </h2>

                {/* Payment method selector */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === 'card'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">💳</div>
                      <div className="font-semibold text-gray-900">
                        Tarjeta de crédito/débito
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pse')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === 'pse'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">🏦</div>
                      <div className="font-semibold text-gray-900">PSE</div>
                    </div>
                  </button>
                </div>

                {/* Card payment form */}
                {paymentMethod === 'card' && (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                      id="cardNumber"
                      label="Número de tarjeta"
                      placeholder="1234 5678 9012 3456"
                      error={errors.cardNumber?.message}
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
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                      }
                      {...register('cardNumber')}
                    />

                    <Input
                      id="cardName"
                      label="Nombre del titular"
                      placeholder="JUAN PEREZ"
                      error={errors.cardName?.message}
                      fullWidth
                      required
                      {...register('cardName')}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        id="expiryDate"
                        label="Fecha de expiración"
                        placeholder="MM/YY"
                        error={errors.expiryDate?.message}
                        fullWidth
                        required
                        {...register('expiryDate')}
                      />

                      <Input
                        id="cvv"
                        label="CVV"
                        placeholder="123"
                        error={errors.cvv?.message}
                        fullWidth
                        required
                        type="password"
                        {...register('cvv')}
                      />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <span className="text-blue-600 text-xl">🔒</span>
                        <div>
                          <p className="text-sm font-medium text-blue-900">
                            Pago seguro
                          </p>
                          <p className="text-sm text-blue-700">
                            Tu información está protegida con encriptación SSL
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      fullWidth
                      isLoading={isProcessing}
                    >
                      Pagar {formatCurrency(booking.finalPrice)}
                    </Button>

                    <p className="text-xs text-center text-gray-500">
                      Al confirmar el pago, aceptas los{' '}
                      <Link href="/terms" className="text-blue-600 hover:underline">
                        términos y condiciones
                      </Link>
                    </p>
                  </form>
                )}

                {/* PSE payment */}
                {paymentMethod === 'pse' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selecciona tu banco
                      </label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Seleccionar banco...</option>
                        <option value="bancolombia">Bancolombia</option>
                        <option value="davivienda">Davivienda</option>
                        <option value="bbva">BBVA</option>
                        <option value="banco-de-bogota">Banco de Bogotá</option>
                        <option value="nequi">Nequi</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de persona
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-600">
                          <input type="radio" name="personType" value="natural" className="mr-3" />
                          <span>Persona natural</span>
                        </label>
                        <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-600">
                          <input type="radio" name="personType" value="juridica" className="mr-3" />
                          <span>Persona jurídica</span>
                        </label>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={() => {
                        alert('Redirigiendo a PSE...');
                      }}
                    >
                      Continuar con PSE
                    </Button>
                  </div>
                )}
              </Card>
            </div>

            {/* Booking summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card variant="elevated" padding="lg">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Resumen de la reserva
                  </h3>

                  <div className="mb-4">
                    <div className="aspect-video relative bg-gray-200 rounded-lg overflow-hidden mb-3">
                      <img
                        src={
                          booking.experience?.coverImage ||
                          booking.experience?.images?.[0] ||
                          'https://via.placeholder.com/400x300'
                        }
                        alt={booking.experience?.title || 'Experiencia'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900">
                      {booking.experience?.title || 'Experiencia'}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      📍 {booking.experience?.location}
                    </p>
                  </div>

                  <div className="space-y-3 py-4 border-t border-b border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Fecha</span>
                      <span className="font-medium">{formatDate(booking.date)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Personas</span>
                      <span className="font-medium">{booking.numberOfPeople}</span>
                    </div>

                    {booking.pointsUsed > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Descuento (puntos)</span>
                        <span className="text-green-600">
                          -{formatCurrency(booking.pointsUsed)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(booking.finalPrice)}
                    </span>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                    <p>
                      💡 <strong>Nota:</strong> Recibirás un correo de confirmación
                      inmediatamente después del pago.
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
