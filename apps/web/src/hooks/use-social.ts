import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { get, post, patch, del } from '@/lib/api-client';
import { API_ENDPOINTS, QUERY_KEYS } from '@/lib/constants';
import { Post, Comment } from '@/types';

interface CreatePostDto {
  content: string;
  images?: string[];
  videoUrl?: string;
  experienceId?: string;
  location?: string;
  tags?: string[];
}

/**
 * Fetch social feed with infinite scroll
 */
export function useSocialFeed() {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.SOCIAL.FEED,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await get<{ data: Post[]; meta: any }>(
        `${API_ENDPOINTS.SOCIAL.FEED}?page=${pageParam}&limit=10`
      );
      return response;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Fetch posts by user
 */
export function useUserPosts(userId: string) {
  return useQuery({
    queryKey: ['social', 'posts', 'user', userId],
    queryFn: () => get<Post[]>(`${API_ENDPOINTS.SOCIAL.POSTS}?userId=${userId}`),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch single post
 */
export function usePost(postId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.SOCIAL.POST_BY_ID(postId),
    queryFn: () => get<Post>(API_ENDPOINTS.SOCIAL.POST_BY_ID(postId)),
    enabled: !!postId,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Create new post
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostDto) => post<Post>(API_ENDPOINTS.SOCIAL.POSTS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOCIAL.FEED });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOCIAL.POSTS });
    },
  });
}

/**
 * Update post
 */
export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePostDto> }) =>
      patch<Post>(API_ENDPOINTS.SOCIAL.POST_BY_ID(id), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOCIAL.POST_BY_ID(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOCIAL.FEED });
    },
  });
}

/**
 * Delete post
 */
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => del(API_ENDPOINTS.SOCIAL.POST_BY_ID(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOCIAL.FEED });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOCIAL.POSTS });
    },
  });
}

/**
 * Like a post
 */
export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => post(API_ENDPOINTS.SOCIAL.LIKE(postId), {}),
    onMutate: async (postId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.SOCIAL.POST_BY_ID(postId) });
      const previousPost = queryClient.getQueryData(QUERY_KEYS.SOCIAL.POST_BY_ID(postId));

      queryClient.setQueryData(QUERY_KEYS.SOCIAL.POST_BY_ID(postId), (old: any) => ({
        ...old,
        isLiked: true,
        likeCount: (old?.likeCount || 0) + 1,
      }));

      return { previousPost };
    },
    onError: (err, postId, context) => {
      queryClient.setQueryData(QUERY_KEYS.SOCIAL.POST_BY_ID(postId), context?.previousPost);
    },
    onSettled: (_, __, postId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOCIAL.POST_BY_ID(postId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOCIAL.FEED });
    },
  });
}

/**
 * Unlike a post
 */
export function useUnlikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => del(API_ENDPOINTS.SOCIAL.UNLIKE(postId)),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.SOCIAL.POST_BY_ID(postId) });
      const previousPost = queryClient.getQueryData(QUERY_KEYS.SOCIAL.POST_BY_ID(postId));

      queryClient.setQueryData(QUERY_KEYS.SOCIAL.POST_BY_ID(postId), (old: any) => ({
        ...old,
        isLiked: false,
        likeCount: Math.max((old?.likeCount || 1) - 1, 0),
      }));

      return { previousPost };
    },
    onError: (err, postId, context) => {
      queryClient.setQueryData(QUERY_KEYS.SOCIAL.POST_BY_ID(postId), context?.previousPost);
    },
    onSettled: (_, __, postId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOCIAL.POST_BY_ID(postId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOCIAL.FEED });
    },
  });
}

/**
 * Fetch comments for a post
 */
export function usePostComments(postId: string) {
  return useQuery({
    queryKey: ['social', 'comments', postId],
    queryFn: () => get<Comment[]>(API_ENDPOINTS.SOCIAL.COMMENT(postId)),
    enabled: !!postId,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Create comment
 */
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      post<Comment>(API_ENDPOINTS.SOCIAL.COMMENT(postId), { content }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['social', 'comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOCIAL.POST_BY_ID(variables.postId) });
    },
  });
}
