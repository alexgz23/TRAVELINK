import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { TypingIndicatorDto } from './dto/typing-indicator.dto';
import { LoggerService } from '../../common/logger/logger.service';

/**
 * Gateway de WebSockets para Chat en Tiempo Real
 * Maneja la comunicación bidireccional para mensajería instantánea
 */
@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Mapa de usuarios conectados: userId -> socketId
  private connectedUsers: Map<string, string> = new Map();
  // Mapa de sockets: socketId -> userId
  private socketToUser: Map<string, string> = new Map();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Manejar nueva conexión de cliente
   */
  async handleConnection(client: Socket) {
    try {
      // Extraer token del handshake
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn(`Connection rejected: No token provided`, 'ChatGateway');
        client.disconnect();
        return;
      }

      // Verificar y decodificar el token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      const userId = payload.sub;

      // Guardar la conexión
      this.connectedUsers.set(userId, client.id);
      this.socketToUser.set(client.id, userId);

      // Unir al cliente a su sala personal (para mensajes directos)
      client.join(`user:${userId}`);

      // Obtener y unir a las salas de conversaciones del usuario
      const conversations = await this.chatService.getUserConversations(userId);
      conversations.forEach((conversation) => {
        client.join(`conversation:${conversation._id}`);
      });

      this.logger.log(`User ${userId} connected to chat (socket: ${client.id})`, 'ChatGateway');

      // Notificar a otros que el usuario está en línea
      client.broadcast.emit('user:online', { userId });

    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`, error.stack, 'ChatGateway');
      client.disconnect();
    }
  }

  /**
   * Manejar desconexión de cliente
   */
  handleDisconnect(client: Socket) {
    const userId = this.socketToUser.get(client.id);

    if (userId) {
      this.connectedUsers.delete(userId);
      this.socketToUser.delete(client.id);

      this.logger.log(`User ${userId} disconnected from chat (socket: ${client.id})`, 'ChatGateway');

      // Notificar a otros que el usuario está offline
      client.broadcast.emit('user:offline', { userId });
    }
  }

  /**
   * Enviar un mensaje
   */
  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() createMessageDto: CreateMessageDto,
  ) {
    try {
      const userId = this.socketToUser.get(client.id);

      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Crear el mensaje
      const message = await this.chatService.createMessage(createMessageDto, userId);

      // Emitir el mensaje a todos los participantes de la conversación
      this.server
        .to(`conversation:${createMessageDto.conversationId}`)
        .emit('message:new', {
          message,
          conversationId: createMessageDto.conversationId,
        });

      this.logger.log(
        `Message sent in conversation ${createMessageDto.conversationId} by user ${userId}`,
        'ChatGateway',
      );

      return { success: true, message };
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`, error.stack, 'ChatGateway');
      return { success: false, error: error.message };
    }
  }

  /**
   * Indicador de escritura
   */
  @SubscribeMessage('message:typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() typingDto: TypingIndicatorDto,
  ) {
    try {
      const userId = this.socketToUser.get(client.id);

      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Verificar acceso a la conversación
      await this.chatService.getConversationById(typingDto.conversationId, userId);

      // Emitir el estado de escritura a otros participantes (excepto el emisor)
      client.to(`conversation:${typingDto.conversationId}`).emit('user:typing', {
        userId,
        conversationId: typingDto.conversationId,
        isTyping: typingDto.isTyping,
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Error handling typing indicator: ${error.message}`, error.stack, 'ChatGateway');
      return { success: false, error: error.message };
    }
  }

  /**
   * Marcar mensaje como entregado
   */
  @SubscribeMessage('message:delivered')
  async handleMessageDelivered(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string },
  ) {
    try {
      const userId = this.socketToUser.get(client.id);

      if (!userId) {
        throw new Error('User not authenticated');
      }

      const message = await this.chatService.markAsDelivered(data.messageId, userId);

      // Notificar al remitente
      const senderSocketId = this.connectedUsers.get(message.senderId);
      if (senderSocketId) {
        this.server.to(senderSocketId).emit('message:status', {
          messageId: message._id,
          status: message.status,
          deliveredTo: message.deliveredTo,
        });
      }

      return { success: true };
    } catch (error) {
      this.logger.error(`Error marking message as delivered: ${error.message}`, error.stack, 'ChatGateway');
      return { success: false, error: error.message };
    }
  }

  /**
   * Marcar mensaje como leído
   */
  @SubscribeMessage('message:read')
  async handleMessageRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string },
  ) {
    try {
      const userId = this.socketToUser.get(client.id);

      if (!userId) {
        throw new Error('User not authenticated');
      }

      const message = await this.chatService.markAsRead(data.messageId, userId);

      // Notificar al remitente
      const senderSocketId = this.connectedUsers.get(message.senderId);
      if (senderSocketId) {
        this.server.to(senderSocketId).emit('message:status', {
          messageId: message._id,
          status: message.status,
          readBy: message.readBy,
        });
      }

      return { success: true };
    } catch (error) {
      this.logger.error(`Error marking message as read: ${error.message}`, error.stack, 'ChatGateway');
      return { success: false, error: error.message };
    }
  }

  /**
   * Marcar conversación completa como leída
   */
  @SubscribeMessage('conversation:read')
  async handleConversationRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    try {
      const userId = this.socketToUser.get(client.id);

      if (!userId) {
        throw new Error('User not authenticated');
      }

      await this.chatService.markConversationAsRead(data.conversationId, userId);

      // Notificar a los participantes de la conversación
      client.to(`conversation:${data.conversationId}`).emit('conversation:read', {
        conversationId: data.conversationId,
        userId,
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Error marking conversation as read: ${error.message}`, error.stack, 'ChatGateway');
      return { success: false, error: error.message };
    }
  }

  /**
   * Unirse a una conversación
   */
  @SubscribeMessage('conversation:join')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    try {
      const userId = this.socketToUser.get(client.id);

      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Verificar acceso
      await this.chatService.getConversationById(data.conversationId, userId);

      // Unir a la sala
      client.join(`conversation:${data.conversationId}`);

      this.logger.log(`User ${userId} joined conversation ${data.conversationId}`, 'ChatGateway');

      return { success: true };
    } catch (error) {
      this.logger.error(`Error joining conversation: ${error.message}`, error.stack, 'ChatGateway');
      return { success: false, error: error.message };
    }
  }

  /**
   * Salir de una conversación
   */
  @SubscribeMessage('conversation:leave')
  async handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    try {
      const userId = this.socketToUser.get(client.id);

      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Salir de la sala
      client.leave(`conversation:${data.conversationId}`);

      this.logger.log(`User ${userId} left conversation ${data.conversationId}`, 'ChatGateway');

      return { success: true };
    } catch (error) {
      this.logger.error(`Error leaving conversation: ${error.message}`, error.stack, 'ChatGateway');
      return { success: false, error: error.message };
    }
  }
}
