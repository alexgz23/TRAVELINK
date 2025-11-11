import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del } from '@/lib/api-client';
import { API_ENDPOINTS, QUERY_KEYS } from '@/lib/constants';
import { User, Follow } from '@/types';

/**
 * Fetch user by ID
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.USERS.BY_ID(id),
    queryFn: () => get<User>(API_ENDPOINTS.USERS.BY_ID(id)),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch user profile
 */
export function useUserProfile(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.USERS.PROFILE(id),
    queryFn: () => get<User>(API_ENDPOINTS.USERS.PROFILE(id)),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<User['profile']>) =>
      patch<User>(`${API_ENDPOINTS.USERS.BASE}/profile`, data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(QUERY_KEYS.AUTH.ME, updatedUser);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.BY_ID(updatedUser.id) });
    },
  });
}

/**
 * Fetch user's followers
 */
export function useFollowers(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.USERS.FOLLOWERS(userId),
    queryFn: () => get<Follow[]>(API_ENDPOINTS.USERS.FOLLOWERS(userId)),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch users that the user is following
 */
export function useFollowing(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.USERS.FOLLOWING(userId),
    queryFn: () => get<Follow[]>(API_ENDPOINTS.USERS.FOLLOWING(userId)),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Follow a user
 */
export function useFollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => post(API_ENDPOINTS.USERS.FOLLOW(userId), {}),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.FOLLOWING(userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.BY_ID(userId) });
    },
  });
}

/**
 * Unfollow a user
 */
export function useUnfollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => del(API_ENDPOINTS.USERS.UNFOLLOW(userId)),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.FOLLOWING(userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.BY_ID(userId) });
    },
  });
}

/**
 * Search users
 */
export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: () => get<User[]>(`${API_ENDPOINTS.SEARCH.USERS}?q=${query}`),
    enabled: query.length > 2,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Fetch user statistics (Dashboard)
 */
export function useUserStats(userId?: string) {
  return useQuery({
    queryKey: userId ? QUERY_KEYS.USERS.STATS(userId) : QUERY_KEYS.USERS.STATS('me'),
    queryFn: () => get<any>(API_ENDPOINTS.USERS.STATS),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch user travel map
 */
export function useUserMap(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.USERS.MAP(userId),
    queryFn: () => get<any>(API_ENDPOINTS.USERS.MAP(userId)),
    enabled: !!userId,
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Update extended profile (bio, travel preferences)
 */
export function useUpdateExtendedProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) =>
      patch<User>(API_ENDPOINTS.USERS.UPDATE_EXTENDED_PROFILE, data),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.ME });
      if (updatedUser?.id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.BY_ID(updatedUser.id) });
      }
    },
  });
}

/**
 * Update privacy settings
 */
export function useUpdatePrivacy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) =>
      patch<User>(API_ENDPOINTS.USERS.UPDATE_PRIVACY, data),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.ME });
      if (updatedUser?.id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.BY_ID(updatedUser.id) });
      }
    },
  });
}
