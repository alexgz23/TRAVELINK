import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import {
  CreateNotificationDto,
  FilterNotificationsDto,
  UpdatePreferencesDto,
  BulkActionDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { CurrentUser, Roles } from '../../common/decorators';
import { UserRole, NotificationType, NotificationChannel } from '@travelink/types';

interface User {
  id: string;
  email: string;
  role: UserRole;
}

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ==================== NOTIFICATIONS ====================

  /**
   * Crear nueva notificación (admin/sistema)
   */
  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateNotificationDto) {
    return await this.notificationsService.create(dto);
  }

  /**
   * Crear múltiples notificaciones en batch
   */
  @Post('bulk')
  @Roles(UserRole.ADMIN)
  async createBulk(@Body() dtos: CreateNotificationDto[]) {
    return await this.notificationsService.createBulk(dtos);
  }

  /**
   * Obtener mis notificaciones
   */
  @Get('my-notifications')
  async getMyNotifications(
    @CurrentUser() user: User,
    @Query() filters: FilterNotificationsDto,
  ) {
    return await this.notificationsService.getNotifications(user.id, filters);
  }

  /**
   * Obtener notificación por ID
   */
  @Get(':id')
  async getNotificationById(@Param('id') id: string) {
    return await this.notificationsService.getNotificationById(id);
  }

  /**
   * Marcar notificación como leída
   */
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.notificationsService.markAsRead(id, user.id);
  }

  /**
   * Marcar notificación como no leída
   */
  @Patch(':id/unread')
  async markAsUnread(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.notificationsService.markAsUnread(id, user.id);
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  @Post('read-all')
  async markAllAsRead(@CurrentUser() user: User) {
    return await this.notificationsService.markAllAsRead(user.id);
  }

  /**
   * Archivar notificación
   */
  @Patch(':id/archive')
  async archive(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.notificationsService.archive(id, user.id);
  }

  /**
   * Desarchivar notificación
   */
  @Patch(':id/unarchive')
  async unarchive(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.notificationsService.unarchive(id, user.id);
  }

  /**
   * Eliminar notificación
   */
  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    await this.notificationsService.delete(id, user.id);
    return { message: 'Notificación eliminada exitosamente' };
  }

  /**
   * Eliminar todas las notificaciones
   */
  @Delete()
  async deleteAll(@CurrentUser() user: User) {
    return await this.notificationsService.deleteAll(user.id);
  }

  /**
   * Acción en masa sobre notificaciones
   */
  @Post('bulk-action')
  async bulkAction(@CurrentUser() user: User, @Body() dto: BulkActionDto) {
    return await this.notificationsService.bulkAction(user.id, dto);
  }

  /**
   * Obtener contador de notificaciones no leídas
   */
  @Get('unread/count')
  async getUnreadCount(@CurrentUser() user: User) {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return { unreadCount: count };
  }

  /**
   * Obtener notificaciones agrupadas
   */
  @Get('grouped/list')
  async getGroupedNotifications(@CurrentUser() user: User) {
    return await this.notificationsService.getGroupedNotifications(user.id);
  }

  // ==================== PREFERENCES ====================

  /**
   * Obtener preferencias de notificaciones
   */
  @Get('preferences/me')
  async getMyPreferences(@CurrentUser() user: User) {
    return await this.notificationsService.getOrCreatePreferences(user.id);
  }

  /**
   * Actualizar preferencias de notificaciones
   */
  @Patch('preferences/me')
  async updatePreferences(
    @CurrentUser() user: User,
    @Body() dto: UpdatePreferencesDto,
  ) {
    return await this.notificationsService.updatePreferences(user.id, dto);
  }

  /**
   * Actualizar preferencia de un tipo específico de notificación
   */
  @Patch('preferences/type/:type')
  async updateTypePreference(
    @CurrentUser() user: User,
    @Param('type') type: NotificationType,
    @Body('enabled') enabled: boolean,
    @Body('channels') channels?: NotificationChannel[],
  ) {
    return await this.notificationsService.updateTypePreference(
      user.id,
      type,
      enabled,
      channels,
    );
  }

  // ==================== HELPER ENDPOINTS (para testing) ====================

  /**
   * Enviar notificación de prueba
   */
  @Post('test/booking-created')
  @Roles(UserRole.ADMIN)
  async testBookingNotification(@CurrentUser() user: User) {
    return await this.notificationsService.notifyBookingCreated(
      user.id,
      'test-booking-id',
      'Tour de prueba',
    );
  }

  /**
   * Enviar notificación de pago de prueba
   */
  @Post('test/payment-successful')
  @Roles(UserRole.ADMIN)
  async testPaymentNotification(@CurrentUser() user: User) {
    return await this.notificationsService.notifyPaymentSuccessful(
      user.id,
      'test-payment-id',
      1500.0,
    );
  }
}
