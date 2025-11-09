'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout';
import { Button, Card, CardContent, Input } from '@/components/ui';
import { useSocialFeed, useLikePost, useUnlikePost, useCreatePost } from '@/hooks';
import { useAuthStore } from '@/stores/auth-store';
import { formatRelativeTime } from '@/lib/utils';

export default function SocialPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { data, isLoading, fetchNextPage, hasNextPage } = useSocialFeed();
  const { mutate: likePost } = useLikePost();
  const { mutate: unlikePost } = useUnlikePost();
  const { mutate: createPost, isPending: isCreatingPost } = useCreatePost();

  const [newPostContent, setNewPostContent] = useState('');

  const posts = data?.pages.flatMap((page) => page.data) || [];

  const handleCreatePost = () => {
    if (newPostContent.trim()) {
      createPost(
        { content: newPostContent },
        {
          onSuccess: () => {
            setNewPostContent('');
          },
        }
      );
    }
  };

  const handleLike = (postId: string, isLiked: boolean) => {
    if (isLiked) {
      unlikePost(postId);
    } else {
      likePost(postId);
    }
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Feed Social</h1>

          {/* Create post */}
          {isAuthenticated && (
            <Card variant="bordered" padding="lg" className="mb-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold flex-shrink-0">
                  {user?.profile?.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="¿Qué experiencia quieres compartir?"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end mt-3">
                    <Button
                      onClick={handleCreatePost}
                      isLoading={isCreatingPost}
                      disabled={!newPostContent.trim()}
                    >
                      Publicar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Posts feed */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando publicaciones...</p>
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <Card key={post.id} variant="bordered" padding="lg">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold flex-shrink-0">
                      {post.user?.profile?.displayName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {post.user?.profile?.displayName || 'Usuario'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatRelativeTime(post.createdAt)}
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4 whitespace-pre-line">{post.content}</p>

                      {post.images && post.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {post.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`Post image ${idx + 1}`}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}

                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-6 text-sm">
                        <button
                          onClick={() => handleLike(post.id, post.isLiked || false)}
                          className={`flex items-center gap-2 ${
                            post.isLiked ? 'text-red-600' : 'text-gray-600'
                          } hover:text-red-600 transition-colors`}
                        >
                          <span>{post.isLiked ? '❤️' : '🤍'}</span>
                          <span>{post.likeCount || 0}</span>
                        </button>

                        <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                          <span>💬</span>
                          <span>{post.commentCount || 0}</span>
                        </button>

                        <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                          <span>🔗</span>
                          <span>Compartir</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {hasNextPage && (
                <div className="text-center">
                  <Button variant="outline" onClick={() => fetchNextPage()}>
                    Cargar más
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Card variant="bordered" padding="lg">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📱</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No hay publicaciones aún
                </h3>
                <p className="text-gray-600 mb-6">
                  Sé el primero en compartir tu experiencia
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
