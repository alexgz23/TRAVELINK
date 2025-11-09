import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { Message, MessageDocument, MessageStatus } from './schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { LoggerService } from '../../common/logger/logger.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Crear una nueva conversación
   */
  async createConversation(createConversationDto: CreateConversationDto, creatorId: string): Promise<ConversationDocument> {
    this.logger.log(`Creating conversation for user ${creatorId}`, 'ChatService');

    // Verificar que el creador esté en los participantes
    if (!createConversationDto.participants.includes(creatorId)) {
      createConversationDto.participants.push(creatorId);
    }

    // Para conversaciones 1-on-1, verificar si ya existe
    if (!createConversationDto.isGroup && createConversationDto.participants.length === 2) {
      const existingConversation = await this.conversationModel.findOne({
        isGroup: false,
        participants: { $all: createConversationDto.participants, $size: 2 },
      });

      if (existingConversation) {
        this.logger.log(`Found existing conversation: ${existingConversation._id}`, 'ChatService');
        return existingConversation;
      }
    }

    const conversation = new this.conversationModel({
      ...createConversationDto,
      groupAdmin: createConversationDto.isGroup ? creatorId : undefined,
    });

    const savedConversation = await conversation.save();
    this.logger.log(`Conversation created: ${savedConversation._id}`, 'ChatService');

    return savedConversation;
  }

  /**
   * Obtener conversaciones de un usuario
   */
  async getUserConversations(userId: string): Promise<ConversationDocument[]> {
    this.logger.log(`Fetching conversations for user ${userId}`, 'ChatService');

    const conversations = await this.conversationModel
      .find({ participants: userId })
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 })
      .exec();

    return conversations;
  }

  /**
   * Obtener una conversación por ID
   */
  async getConversationById(conversationId: string, userId: string): Promise<ConversationDocument> {
    if (!Types.ObjectId.isValid(conversationId)) {
      throw new BadRequestException('Invalid conversation ID');
    }

    const conversation = await this.conversationModel.findById(conversationId);

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Verificar que el usuario sea participante
    if (!conversation.participants.includes(userId)) {
      throw new BadRequestException('User is not a participant in this conversation');
    }

    return conversation;
  }

  /**
   * Crear un nuevo mensaje
   */
  async createMessage(createMessageDto: CreateMessageDto, senderId: string): Promise<MessageDocument> {
    this.logger.log(`Creating message in conversation ${createMessageDto.conversationId}`, 'ChatService');

    // Verificar que la conversación existe y el usuario es participante
    const conversation = await this.getConversationById(createMessageDto.conversationId, senderId);

    const message = new this.messageModel({
      ...createMessageDto,
      conversationId: new Types.ObjectId(createMessageDto.conversationId),
      senderId,
      replyTo: createMessageDto.replyTo ? new Types.ObjectId(createMessageDto.replyTo) : undefined,
    });

    const savedMessage = await message.save();

    // Actualizar la conversación con el último mensaje
    await this.conversationModel.findByIdAndUpdate(
      createMessageDto.conversationId,
      {
        lastMessage: savedMessage._id,
        lastMessageAt: new Date(),
      },
    );

    this.logger.log(`Message created: ${savedMessage._id}`, 'ChatService');

    return savedMessage;
  }

  /**
   * Obtener mensajes de una conversación
   */
  async getMessages(conversationId: string, userId: string, limit = 50, offset = 0): Promise<MessageDocument[]> {
    // Verificar acceso a la conversación
    await this.getConversationById(conversationId, userId);

    const messages = await this.messageModel
      .find({ conversationId: new Types.ObjectId(conversationId), isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate('replyTo')
      .exec();

    return messages.reverse(); // Retornar en orden cronológico
  }

  /**
   * Marcar mensaje como entregado
   */
  async markAsDelivered(messageId: string, userId: string): Promise<MessageDocument> {
    if (!Types.ObjectId.isValid(messageId)) {
      throw new BadRequestException('Invalid message ID');
    }

    const message = await this.messageModel.findById(messageId);

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // No marcar mensajes propios como entregados
    if (message.senderId === userId) {
      return message;
    }

    // Agregar a la lista de entregados si no está
    if (!message.deliveredTo.includes(userId)) {
      message.deliveredTo.push(userId);
      message.deliveredAt = new Date();

      // Actualizar estado si aún está en "sent"
      if (message.status === MessageStatus.SENT) {
        message.status = MessageStatus.DELIVERED;
      }

      await message.save();
      this.logger.log(`Message ${messageId} marked as delivered by ${userId}`, 'ChatService');
    }

    return message;
  }

  /**
   * Marcar mensaje como leído
   */
  async markAsRead(messageId: string, userId: string): Promise<MessageDocument> {
    if (!Types.ObjectId.isValid(messageId)) {
      throw new BadRequestException('Invalid message ID');
    }

    const message = await this.messageModel.findById(messageId);

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // No marcar mensajes propios como leídos
    if (message.senderId === userId) {
      return message;
    }

    // Agregar a la lista de leídos si no está
    if (!message.readBy.includes(userId)) {
      message.readBy.push(userId);
      message.readAt = new Date();
      message.status = MessageStatus.READ;

      // También marcar como entregado si no lo estaba
      if (!message.deliveredTo.includes(userId)) {
        message.deliveredTo.push(userId);
        message.deliveredAt = new Date();
      }

      await message.save();
      this.logger.log(`Message ${messageId} marked as read by ${userId}`, 'ChatService');

      // Actualizar la conversación
      await this.conversationModel.findByIdAndUpdate(
        message.conversationId,
        { [`readBy.${userId}`]: new Date() },
      );
    }

    return message;
  }

  /**
   * Marcar todos los mensajes de una conversación como leídos
   */
  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    await this.getConversationById(conversationId, userId);

    const messages = await this.messageModel.find({
      conversationId: new Types.ObjectId(conversationId),
      senderId: { $ne: userId },
      readBy: { $ne: userId },
    });

    const readTime = new Date();

    for (const message of messages) {
      message.readBy.push(userId);
      message.readAt = readTime;
      message.status = MessageStatus.READ;

      if (!message.deliveredTo.includes(userId)) {
        message.deliveredTo.push(userId);
        message.deliveredAt = readTime;
      }

      await message.save();
    }

    await this.conversationModel.findByIdAndUpdate(
      conversationId,
      { [`readBy.${userId}`]: readTime },
    );

    this.logger.log(`Conversation ${conversationId} marked as read by ${userId}`, 'ChatService');
  }

  /**
   * Eliminar mensaje (soft delete)
   */
  async deleteMessage(messageId: string, userId: string): Promise<MessageDocument> {
    if (!Types.ObjectId.isValid(messageId)) {
      throw new BadRequestException('Invalid message ID');
    }

    const message = await this.messageModel.findById(messageId);

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Solo el remitente puede eliminar el mensaje
    if (message.senderId !== userId) {
      throw new BadRequestException('You can only delete your own messages');
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    message.content = 'Este mensaje fue eliminado';

    await message.save();
    this.logger.log(`Message ${messageId} deleted by ${userId}`, 'ChatService');

    return message;
  }

  /**
   * Editar mensaje
   */
  async editMessage(messageId: string, userId: string, newContent: string): Promise<MessageDocument> {
    if (!Types.ObjectId.isValid(messageId)) {
      throw new BadRequestException('Invalid message ID');
    }

    const message = await this.messageModel.findById(messageId);

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Solo el remitente puede editar el mensaje
    if (message.senderId !== userId) {
      throw new BadRequestException('You can only edit your own messages');
    }

    // No se pueden editar mensajes eliminados
    if (message.isDeleted) {
      throw new BadRequestException('Cannot edit deleted messages');
    }

    message.content = newContent;
    message.isEdited = true;
    message.editedAt = new Date();

    await message.save();
    this.logger.log(`Message ${messageId} edited by ${userId}`, 'ChatService');

    return message;
  }
}
