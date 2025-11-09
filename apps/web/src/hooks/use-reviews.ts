import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del } from '@/lib/api-client';
import { API_ENDPOINTS, QUERY_KEYS } from '@/lib/constants';
import { Review } from '@/types';

interface CreateReviewDto {
  experienceId: string;
  bookingId?: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
}

/**
 * Fetch reviews for an experience
 */
export function useExperienceReviews(experienceId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.REVIEWS.BY_EXPERIENCE(experienceId),
    queryFn: () => get<Review[]>(API_ENDPOINTS.REVIEWS.BY_EXPERIENCE(experienceId)),
    enabled: !!experienceId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch reviews by user
 */
export function useUserReviews(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.REVIEWS.BY_USER(userId),
    queryFn: () => get<Review[]>(API_ENDPOINTS.REVIEWS.BY_USER(userId)),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Create new review
 */
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewDto) => post<Review>(API_ENDPOINTS.REVIEWS.BASE, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.REVIEWS.BY_EXPERIENCE(variables.experienceId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.EXPERIENCES.BY_ID(variables.experienceId),
      });
    },
  });
}

/**
 * Update review
 */
export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateReviewDto> }) =>
      patch<Review>(`${API_ENDPOINTS.REVIEWS.BASE}/${id}`, data),
    onSuccess: (updatedReview) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.REVIEWS.BY_EXPERIENCE(updatedReview.experienceId),
      });
    },
  });
}

/**
 * Delete review
 */
export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => del(`${API_ENDPOINTS.REVIEWS.BASE}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

/**
 * Like a review
 */
export function useLikeReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => post(`${API_ENDPOINTS.REVIEWS.BASE}/${reviewId}/like`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}
