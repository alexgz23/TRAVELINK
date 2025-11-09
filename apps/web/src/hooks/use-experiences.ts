import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '@/lib/api-client';
import { API_ENDPOINTS, QUERY_KEYS } from '@/lib/constants';
import { Experience, SearchFilters, SearchResponse, PaginatedResponse } from '@/types';

/**
 * Fetch all experiences with filters
 */
export function useExperiences(filters?: SearchFilters) {
  return useQuery({
    queryKey: [...QUERY_KEYS.EXPERIENCES.ALL, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.q) params.append('q', filters.q);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters?.city) params.append('city', filters.city);
      if (filters?.country) params.append('country', filters.country);
      if (filters?.rating) params.append('rating', filters.rating.toString());
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const queryString = params.toString();
      const url = `${API_ENDPOINTS.EXPERIENCES.BASE}${queryString ? `?${queryString}` : ''}`;

      return get<PaginatedResponse<Experience>>(url);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch single experience by ID
 */
export function useExperience(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.EXPERIENCES.BY_ID(id),
    queryFn: () => get<Experience>(API_ENDPOINTS.EXPERIENCES.BY_ID(id)),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch featured experiences
 */
export function useFeaturedExperiences() {
  return useQuery({
    queryKey: QUERY_KEYS.EXPERIENCES.FEATURED,
    queryFn: () => get<Experience[]>(API_ENDPOINTS.EXPERIENCES.FEATURED),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Search experiences using Typesense
 */
export function useSearchExperiences(filters: SearchFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.EXPERIENCES.SEARCH(filters.q || ''),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.q) params.append('q', filters.q);
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.city) params.append('city', filters.city);
      if (filters.rating) params.append('rating', filters.rating.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      return get<SearchResponse<Experience>>(
        `${API_ENDPOINTS.SEARCH.EXPERIENCES}?${params.toString()}`
      );
    },
    enabled: !!filters.q,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Fetch nearby experiences
 */
export function useNearbyExperiences(latitude: number, longitude: number, radius?: number) {
  return useQuery({
    queryKey: QUERY_KEYS.EXPERIENCES.NEARBY(latitude, longitude),
    queryFn: async () => {
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        ...(radius && { radius: radius.toString() }),
      });
      return get<Experience[]>(`${API_ENDPOINTS.EXPERIENCES.NEARBY}?${params.toString()}`);
    },
    enabled: !!(latitude && longitude),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch experiences by provider
 */
export function useProviderExperiences(providerId: string) {
  return useQuery({
    queryKey: ['experiences', 'provider', providerId],
    queryFn: () => get<Experience[]>(API_ENDPOINTS.EXPERIENCES.BY_PROVIDER(providerId)),
    enabled: !!providerId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Create new experience (for providers)
 */
export function useCreateExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Experience>) => post<Experience>(API_ENDPOINTS.EXPERIENCES.BASE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXPERIENCES.ALL });
    },
  });
}
