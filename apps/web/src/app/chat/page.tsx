'use client';

import { useState, useEffect, useRef } from 'react';
import { MainLayout } from '@/components/layout';
import { Button, Card, Input } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';
import {
  useConversations,
  useMessages,
  useSendMessage,
  useRealtimeChat,
} from '@/hooks';
import { formatRelativeTime } from '@/lib/utils';
import { Conversation } from '@/types';

export default function ChatPage() {
  const { user } = useAuthStore();
  const { data: conversations, isLoading: loadingConversations } = useConversations();
  const { mutate: sendMessage } = useSendMessage();

  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading: loadingMessages } = useMessages(
    selectedConversation || ''
  );
  const { typingUsers, sendTyping, markAsRead, isConnected } = useRealtimeChat(
    selectedConversation || ''
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when viewing conversation
  useEffect(() => {
    if (selectedConversation && messages) {
      const unreadMessages = messages.filter(
        (msg) => !msg.isRead && msg.senderId !== user?.id
      );
      unreadMessages.forEach((msg) => {
        markAsRead(msg.id);
      });
    }
  }, [selectedConversation, messages, user?.id, markAsRead]);

  const handleSendMessage = () => {
    if (messageText.trim() && selectedConversation) {
      sendMessage(
        {
          conversationId: selectedConversation,
          content: messageText,
        },
        {
          onSuccess: () => {
            setMessageText('');
          },
        }
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants?.find((p) => p.id !== user?.id);
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mensajes</h1>
              {isConnected && (
                <p className="text-sm text-green-600 mt-1">
                  ● Conectado en tiempo real
                </p>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
            {/* Conversations list */}
            <Card className="lg:col-span-1 h-full overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Conversaciones</h2>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loadingConversations ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : conversations && conversations.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {conversations.map((conversation) => {
                      const otherUser = getOtherParticipant(conversation);
                      const isSelected = selectedConversation === conversation.id;

                      return (
                        <button
                          key={conversation.id}
                          onClick={() => setSelectedConversation(conversation.id)}
                          className={`w-full p-4 hover:bg-gray-50 transition-colors text-left ${
                            isSelected ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold flex-shrink-0">
                              {otherUser?.profile?.displayName?.charAt(0).toUpperCase() ||
                                'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-semibold text-gray-900 truncate">
                                  {otherUser?.profile?.displayName || 'Usuario'}
                                </p>
                                {conversation.lastMessage && (
                                  <span className="text-xs text-gray-500">
                                    {formatRelativeTime(conversation.lastMessage.createdAt)}
                                  </span>
                                )}
                              </div>
                              {conversation.lastMessage && (
                                <p className="text-sm text-gray-600 truncate">
                                  {conversation.lastMessage.content}
                                </p>
                              )}
                              {conversation.unreadCount! > 0 && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="text-4xl mb-3">💬</div>
                    <p className="text-gray-600">No tienes conversaciones aún</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Inicia una conversación con un proveedor
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Chat area */}
            <Card className="lg:col-span-2 h-full overflow-hidden flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat header */}
                  <div className="p-4 border-b border-gray-200">
                    {conversations && (
                      (() => {
                        const conversation = conversations.find(
                          (c) => c.id === selectedConversation
                        );
                        const otherUser = conversation
                          ? getOtherParticipant(conversation)
                          : null;

                        return (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                              {otherUser?.profile?.displayName
                                ?.charAt(0)
                                .toUpperCase() || 'U'}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {otherUser?.profile?.displayName || 'Usuario'}
                              </h3>
                              {typingUsers.length > 0 && (
                                <p className="text-sm text-gray-600">Escribiendo...</p>
                              )}
                            </div>
                          </div>
                        );
                      })()
                    )}
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loadingMessages ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      </div>
                    ) : messages && messages.length > 0 ? (
                      <>
                        {messages.map((message) => {
                          const isMine = message.senderId === user?.id;

                          return (
                            <div
                              key={message.id}
                              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[70%] ${
                                  isMine
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-900'
                                } rounded-lg px-4 py-2`}
                              >
                                <p className="text-sm whitespace-pre-line">
                                  {message.content}
                                </p>
                                <div className="flex items-center justify-end gap-2 mt-1">
                                  <span
                                    className={`text-xs ${
                                      isMine ? 'text-blue-100' : 'text-gray-600'
                                    }`}
                                  >
                                    {formatRelativeTime(message.createdAt)}
                                  </span>
                                  {isMine && (
                                    <span className="text-xs text-blue-100">
                                      {message.isRead ? '✓✓' : '✓'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-600">No hay mensajes aún</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Escribe el primer mensaje
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Message input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex gap-3">
                      <textarea
                        value={messageText}
                        onChange={(e) => {
                          setMessageText(e.target.value);
                          sendTyping();
                        }}
                        onKeyPress={handleKeyPress}
                        placeholder="Escribe un mensaje..."
                        rows={2}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                        className="self-end"
                      >
                        Enviar
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Selecciona una conversación
                    </h3>
                    <p className="text-gray-600">
                      Elige una conversación para empezar a chatear
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
