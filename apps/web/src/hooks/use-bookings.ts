import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch } from '@/lib/api-client';
import { API_ENDPOINTS, QUERY_KEYS } from '@/lib/constants';
import { Booking, BookingStatus } from '@/types';

interface CreateBookingDto {
  experienceId: string;
  availabilityId?: string;
  date: string;
  startTime?: string;
  numberOfPeople: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  specialRequests?: string;
  pointsToUse?: number;
}

/**
 * Fetch user's bookings
 */
export function useMyBookings(status?: BookingStatus) {
  return useQuery({
    queryKey: [...QUERY_KEYS.BOOKINGS.MY_BOOKINGS, status],
    queryFn: async () => {
      const url = status
        ? `${API_ENDPOINTS.BOOKINGS.MY_BOOKINGS}?status=${status}`
        : API_ENDPOINTS.BOOKINGS.MY_BOOKINGS;
      return get<Booking[]>(url);
    },
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Fetch single booking by ID
 */
export function useBooking(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.BOOKINGS.BY_ID(id),
    queryFn: () => get<Booking>(API_ENDPOINTS.BOOKINGS.BY_ID(id)),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Create new booking
 */
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingDto) => post<Booking>(API_ENDPOINTS.BOOKINGS.BASE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS.MY_BOOKINGS });
    },
  });
}

/**
 * Cancel booking
 */
export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      patch<Booking>(API_ENDPOINTS.BOOKINGS.CANCEL(id), { cancellationReason: reason }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS.BY_ID(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS.MY_BOOKINGS });
    },
  });
}

/**
 * Get booking statistics (for providers)
 */
export function useBookingStats() {
  return useQuery({
    queryKey: ['bookings', 'stats'],
    queryFn: () => get<{ total: number; confirmed: number; pending: number; revenue: number }>(
      `${API_ENDPOINTS.BOOKINGS.BASE}/stats`
    ),
    staleTime: 1000 * 60 * 5,
  });
}
