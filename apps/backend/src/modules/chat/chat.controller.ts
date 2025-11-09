import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';

/**
 * Controlador REST para Chat
 * Proporciona endpoints para gestionar conversaciones y mensajes
 */
@ApiTags('chat')
@ApiBearerAuth()
@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * Crear una nueva conversación
   */
  @Post('conversations')
  @ApiOperation({ summary: 'Crear una nueva conversación' })
  async createConversation(
    @Body() createConversationDto: CreateConversationDto,
    @CurrentUser() user: any,
  ) {
    return this.chatService.createConversation(createConversationDto, user.sub);
  }

  /**
   * Obtener todas las conversaciones del usuario
   */
  @Get('conversations')
  @ApiOperation({ summary: 'Obtener todas las conversaciones del usuario' })
  async getUserConversations(@CurrentUser() user: any) {
    return this.chatService.getUserConversations(user.sub);
  }

  /**
   * Obtener una conversación específica
   */
  @Get('conversations/:id')
  @ApiOperation({ summary: 'Obtener detalles de una conversación' })
  async getConversation(@Param('id') id: string, @CurrentUser() user: any) {
    return this.chatService.getConversationById(id, user.sub);
  }

  /**
   * Obtener mensajes de una conversación
   */
  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Obtener mensajes de una conversación' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Límite de mensajes (default: 50)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset para paginación (default: 0)' })
  async getMessages(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.chatService.getMessages(
      id,
      user.sub,
      limit ? parseInt(limit.toString()) : 50,
      offset ? parseInt(offset.toString()) : 0,
    );
  }

  /**
   * Enviar un mensaje (también disponible vía WebSocket)
   */
  @Post('messages')
  @ApiOperation({ summary: 'Enviar un mensaje' })
  async sendMessage(@Body() createMessageDto: CreateMessageDto, @CurrentUser() user: any) {
    return this.chatService.createMessage(createMessageDto, user.sub);
  }

  /**
   * Marcar conversación como leída
   */
  @Patch('conversations/:id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Marcar todos los mensajes de una conversación como leídos' })
  async markConversationAsRead(@Param('id') id: string, @CurrentUser() user: any) {
    await this.chatService.markConversationAsRead(id, user.sub);
  }

  /**
   * Marcar mensaje como leído
   */
  @Patch('messages/:id/read')
  @ApiOperation({ summary: 'Marcar un mensaje como leído' })
  async markMessageAsRead(@Param('id') id: string, @CurrentUser() user: any) {
    return this.chatService.markAsRead(id, user.sub);
  }

  /**
   * Marcar mensaje como entregado
   */
  @Patch('messages/:id/delivered')
  @ApiOperation({ summary: 'Marcar un mensaje como entregado' })
  async markMessageAsDelivered(@Param('id') id: string, @CurrentUser() user: any) {
    return this.chatService.markAsDelivered(id, user.sub);
  }

  /**
   * Editar un mensaje
   */
  @Patch('messages/:id')
  @ApiOperation({ summary: 'Editar un mensaje' })
  async editMessage(
    @Param('id') id: string,
    @Body() body: { content: string },
    @CurrentUser() user: any,
  ) {
    return this.chatService.editMessage(id, user.sub, body.content);
  }

  /**
   * Eliminar un mensaje (soft delete)
   */
  @Delete('messages/:id')
  @ApiOperation({ summary: 'Eliminar un mensaje' })
  async deleteMessage(@Param('id') id: string, @CurrentUser() user: any) {
    return this.chatService.deleteMessage(id, user.sub);
  }
}
