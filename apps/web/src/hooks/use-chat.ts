import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { get, post } from '@/lib/api-client';
import { API_ENDPOINTS, QUERY_KEYS } from '@/lib/constants';
import { Conversation, Message } from '@/types';
import { useWebSocket } from '@/providers/websocket-provider';

/**
 * Fetch user's conversations
 */
export function useConversations() {
  return useQuery({
    queryKey: QUERY_KEYS.CHAT.CONVERSATIONS,
    queryFn: () => get<Conversation[]>(API_ENDPOINTS.CHAT.CONVERSATIONS),
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Fetch single conversation
 */
export function useConversation(conversationId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.CHAT.CONVERSATION_BY_ID(conversationId),
    queryFn: () => get<Conversation>(API_ENDPOINTS.CHAT.CONVERSATION_BY_ID(conversationId)),
    enabled: !!conversationId,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Fetch messages for a conversation
 */
export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.CHAT.MESSAGES(conversationId),
    queryFn: () => get<Message[]>(API_ENDPOINTS.CHAT.MESSAGES(conversationId)),
    enabled: !!conversationId,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Send message
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      post<Message>(API_ENDPOINTS.CHAT.SEND_MESSAGE(conversationId), { content }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CHAT.MESSAGES(variables.conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CHAT.CONVERSATIONS,
      });
    },
  });
}

/**
 * Create new conversation
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (participantIds: string[]) =>
      post<Conversation>(API_ENDPOINTS.CHAT.CONVERSATIONS, { participantIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHAT.CONVERSATIONS });
    },
  });
}

/**
 * Real-time chat hook with WebSocket
 */
export function useRealtimeChat(conversationId: string) {
  const { socket, isConnected } = useWebSocket();
  const queryClient = useQueryClient();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!socket || !isConnected || !conversationId) return;

    // Join conversation room
    socket.emit('chat:join', conversationId);

    // Listen for new messages
    socket.on('chat:message', (message: Message) => {
      if (message.conversationId === conversationId) {
        // Add new message to cache
        queryClient.setQueryData<Message[]>(
          QUERY_KEYS.CHAT.MESSAGES(conversationId),
          (old) => (old ? [...old, message] : [message])
        );

        // Update conversation list
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHAT.CONVERSATIONS });
      }
    });

    // Listen for typing events
    socket.on('chat:typing', ({ userId }: { userId: string }) => {
      setTypingUsers((prev) => (prev.includes(userId) ? prev : [...prev, userId]));

      // Clear typing after 3 seconds
      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((id) => id !== userId));
      }, 3000);
    });

    // Listen for message read events
    socket.on('chat:messageRead', ({ messageId }: { messageId: string }) => {
      queryClient.setQueryData<Message[]>(
        QUERY_KEYS.CHAT.MESSAGES(conversationId),
        (old) =>
          old?.map((msg) =>
            msg.id === messageId ? { ...msg, isRead: true } : msg
          ) || []
      );
    });

    // Cleanup
    return () => {
      socket.emit('chat:leave', conversationId);
      socket.off('chat:message');
      socket.off('chat:typing');
      socket.off('chat:messageRead');
    };
  }, [socket, isConnected, conversationId, queryClient]);

  const sendTyping = () => {
    if (socket && isConnected) {
      socket.emit('chat:typing', { conversationId });
    }
  };

  const markAsRead = (messageId: string) => {
    if (socket && isConnected) {
      socket.emit('chat:markRead', { conversationId, messageId });
    }
  };

  return {
    typingUsers,
    sendTyping,
    markAsRead,
    isConnected,
  };
}
