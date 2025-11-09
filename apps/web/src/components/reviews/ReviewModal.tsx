'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input } from '@/components/ui';
import { useCreateReview } from '@/hooks';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Selecciona una calificación').max(5),
  title: z.string().optional(),
  comment: z.string().min(10, 'El comentario debe tener al menos 10 caracteres'),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewModalProps {
  experienceId: string;
  bookingId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ReviewModal({
  experienceId,
  bookingId,
  onClose,
  onSuccess,
}: ReviewModalProps) {
  const [hoveredRating, setHoveredRating] = useState(0);
  const { mutate: createReview, isPending } = useCreateReview();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
    },
  });

  const selectedRating = watch('rating');

  const onSubmit = (data: ReviewFormData) => {
    createReview(
      {
        experienceId,
        bookingId,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
      },
      {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Escribe tu reseña</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Star rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calificación *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setValue('rating', star, { shouldValidate: true })}
                    className="text-4xl transition-transform hover:scale-110"
                  >
                    <span
                      className={
                        star <= (hoveredRating || selectedRating)
                          ? 'text-yellow-500'
                          : 'text-gray-300'
                      }
                    >
                      ★
                    </span>
                  </button>
                ))}
              </div>
              {errors.rating && (
                <p className="text-sm text-red-600 mt-1">{errors.rating.message}</p>
              )}
              {selectedRating > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {selectedRating === 5 && '¡Excelente!'}
                  {selectedRating === 4 && 'Muy bueno'}
                  {selectedRating === 3 && 'Bueno'}
                  {selectedRating === 2 && 'Regular'}
                  {selectedRating === 1 && 'Malo'}
                </p>
              )}
            </div>

            {/* Title */}
            <Input
              id="title"
              label="Título (opcional)"
              placeholder="Resume tu experiencia en una línea"
              error={errors.title?.message}
              fullWidth
              {...register('title')}
            />

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentario *
              </label>
              <textarea
                rows={6}
                placeholder="Cuéntanos sobre tu experiencia..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                {...register('comment')}
              />
              {errors.comment && (
                <p className="text-sm text-red-600 mt-1">{errors.comment.message}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Mínimo 10 caracteres. Comparte detalles sobre tu experiencia.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" isLoading={isPending}>
                Publicar reseña
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
