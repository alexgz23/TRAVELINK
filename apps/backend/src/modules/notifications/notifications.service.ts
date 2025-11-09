import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
  NotificationPreferences,
  NotificationPreferencesDocument,
} from './schemas';
import {
  CreateNotificationDto,
  FilterNotificationsDto,
  UpdatePreferencesDto,
  BulkActionDto,
  BulkAction,
} from './dto';
import {
  NotificationStatus,
  NotificationChannel,
  NotificationType,
} from '@travelink/types';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    @InjectModel(NotificationPreferences.name)
    private preferencesModel: Model<NotificationPreferencesDocument>,
  ) {}

  // ==================== NOTIFICATIONS ====================

  async create(dto: CreateNotificationDto): Promise<Notification> {
    // Verificar preferencias del usuario
    const preferences = await this.getUserPreferences(dto.userId);

    // Verificar si el usuario ha deshabilitado este tipo de notificación
    if (preferences) {
      const typePref = preferences.typePreferences?.get(dto.type);
      if (typePref && !typePref.enabled) {
        // No crear la notificación si el usuario la tiene deshabilitada
        return null;
      }

      // Usar canales preferidos si están configurados
      if (typePref && typePref.channels.length > 0) {
        dto.channels = typePref.channels;
      }
    }

    const notification = new this.notificationModel({
      ...dto,
      status: dto.scheduledFor
        ? NotificationStatus.PENDING
        : NotificationStatus.SENT,
      sentAt: dto.scheduledFor ? null : new Date(),
    });

    return await notification.save();
  }

  async createBulk(dtos: CreateNotificationDto[]): Promise<Notification[]> {
    const notifications = await Promise.all(
      dtos.map((dto) => this.create(dto)),
    );
    return notifications.filter((n) => n !== null);
  }

  async getNotifications(
    userId: string,
    filters: FilterNotificationsDto,
  ): Promise<{
    items: Notification[];
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20, ...where } = filters;
    const skip = (page - 1) * limit;

    const query: any = { userId, ...where };

    // No mostrar notificaciones archivadas por defecto
    if (filters.isArchived === undefined) {
      query.isArchived = false;
    }

    const [items, total, unreadCount] = await Promise.all([
      this.notificationModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.notificationModel.countDocuments(query),
      this.notificationModel.countDocuments({
        userId,
        isRead: false,
        isArchived: false,
      }),
    ]);

    return {
      items,
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getNotificationById(id: string): Promise<Notification> {
    const notification = await this.notificationModel.findById(id);
    if (!notification) {
      throw new NotFoundException('Notificación no encontrada');
    }
    return notification;
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationModel.findOneAndUpdate(
      { _id: id, userId },
      {
        isRead: true,
        readAt: new Date(),
        status: NotificationStatus.READ,
      },
      { new: true },
    );

    if (!notification) {
      throw new NotFoundException('Notificación no encontrada');
    }

    return notification;
  }

  async markAsUnread(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationModel.findOneAndUpdate(
      { _id: id, userId },
      {
        isRead: false,
        readAt: null,
        status: NotificationStatus.DELIVERED,
      },
      { new: true },
    );

    if (!notification) {
      throw new NotFoundException('Notificación no encontrada');
    }

    return notification;
  }

  async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {
    const result = await this.notificationModel.updateMany(
      { userId, isRead: false },
      {
        isRead: true,
        readAt: new Date(),
        status: NotificationStatus.READ,
      },
    );

    return { modifiedCount: result.modifiedCount };
  }

  async archive(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationModel.findOneAndUpdate(
      { _id: id, userId },
      { isArchived: true },
      { new: true },
    );

    if (!notification) {
      throw new NotFoundException('Notificación no encontrada');
    }

    return notification;
  }

  async unarchive(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationModel.findOneAndUpdate(
      { _id: id, userId },
      { isArchived: false },
      { new: true },
    );

    if (!notification) {
      throw new NotFoundException('Notificación no encontrada');
    }

    return notification;
  }

  async delete(id: string, userId: string): Promise<void> {
    const result = await this.notificationModel.deleteOne({ _id: id, userId });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Notificación no encontrada');
    }
  }

  async deleteAll(userId: string): Promise<{ deletedCount: number }> {
    const result = await this.notificationModel.deleteMany({ userId });
    return { deletedCount: result.deletedCount };
  }

  async bulkAction(
    userId: string,
    dto: BulkActionDto,
  ): Promise<{ modifiedCount: number }> {
    const query = dto.all
      ? { userId }
      : { userId, _id: { $in: dto.notificationIds } };

    let result;

    switch (dto.action) {
      case BulkAction.MARK_AS_READ:
        result = await this.notificationModel.updateMany(query, {
          isRead: true,
          readAt: new Date(),
          status: NotificationStatus.READ,
        });
        break;

      case BulkAction.MARK_AS_UNREAD:
        result = await this.notificationModel.updateMany(query, {
          isRead: false,
          readAt: null,
          status: NotificationStatus.DELIVERED,
        });
        break;

      case BulkAction.ARCHIVE:
        result = await this.notificationModel.updateMany(query, {
          isArchived: true,
        });
        break;

      case BulkAction.UNARCHIVE:
        result = await this.notificationModel.updateMany(query, {
          isArchived: false,
        });
        break;

      case BulkAction.DELETE:
        result = await this.notificationModel.deleteMany(query);
        return { modifiedCount: result.deletedCount };

      default:
        throw new Error('Acción no válida');
    }

    return { modifiedCount: result.modifiedCount };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationModel.countDocuments({
      userId,
      isRead: false,
      isArchived: false,
    });
  }

  async getGroupedNotifications(userId: string): Promise<
    Array<{
      groupKey: string;
      count: number;
      latestNotification: Notification;
    }>
  > {
    const grouped = await this.notificationModel.aggregate([
      {
        $match: {
          userId,
          isArchived: false,
          groupKey: { $exists: true, $ne: null },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: '$groupKey',
          count: { $sum: 1 },
          latestNotification: { $first: '$$ROOT' },
        },
      },
    ]);

    return grouped.map((g) => ({
      groupKey: g._id,
      count: g.count,
      latestNotification: g.latestNotification,
    }));
  }

  // ==================== PREFERENCES ====================

  async getUserPreferences(
    userId: string,
  ): Promise<NotificationPreferences | null> {
    return await this.preferencesModel.findOne({ userId });
  }

  async getOrCreatePreferences(
    userId: string,
  ): Promise<NotificationPreferences> {
    let preferences = await this.getUserPreferences(userId);

    if (!preferences) {
      preferences = new this.preferencesModel({
        userId,
        enableInApp: true,
        enableEmail: true,
        enablePush: false,
        enableSms: false,
        typePreferences: new Map(),
      });
      await preferences.save();
    }

    return preferences;
  }

  async updatePreferences(
    userId: string,
    dto: UpdatePreferencesDto,
  ): Promise<NotificationPreferences> {
    const preferences = await this.getOrCreatePreferences(userId);

    Object.assign(preferences, dto);

    return await preferences.save();
  }

  async updateTypePreference(
    userId: string,
    type: NotificationType,
    enabled: boolean,
    channels?: NotificationChannel[],
  ): Promise<NotificationPreferences> {
    const preferences = await this.getOrCreatePreferences(userId);

    preferences.typePreferences.set(type, {
      enabled,
      channels: channels || [NotificationChannel.IN_APP],
    });

    return await preferences.save();
  }

  // ==================== HELPER METHODS ====================

  /**
   * Método auxiliar para crear notificaciones de booking
   */
  async notifyBookingCreated(
    userId: string,
    bookingId: string,
    experienceName: string,
  ): Promise<Notification> {
    return await this.create({
      userId,
      type: NotificationType.BOOKING_CREATED,
      title: 'Reserva creada',
      message: `Tu reserva para "${experienceName}" ha sido creada exitosamente.`,
      data: {
        entityId: bookingId,
        entityType: 'booking',
        actionUrl: `/bookings/${bookingId}`,
      },
    });
  }

  /**
   * Método auxiliar para crear notificaciones de pago
   */
  async notifyPaymentSuccessful(
    userId: string,
    paymentId: string,
    amount: number,
  ): Promise<Notification> {
    return await this.create({
      userId,
      type: NotificationType.PAYMENT_SUCCESSFUL,
      title: 'Pago exitoso',
      message: `Tu pago de $${amount} ha sido procesado exitosamente.`,
      data: {
        entityId: paymentId,
        entityType: 'payment',
        actionUrl: `/payments/${paymentId}`,
      },
    });
  }

  /**
   * Método auxiliar para crear notificaciones de alianza
   */
  async notifyAllianceRequest(
    providerId: string,
    allianceId: string,
    agencyName: string,
  ): Promise<Notification> {
    return await this.create({
      userId: providerId,
      type: NotificationType.ALLIANCE_REQUEST,
      title: 'Nueva solicitud de alianza',
      message: `${agencyName} ha solicitado una alianza contigo.`,
      data: {
        entityId: allianceId,
        entityType: 'alliance',
        actionUrl: `/b2b/alliances/${allianceId}`,
      },
    });
  }

  /**
   * Método auxiliar para crear notificaciones de red social
   */
  async notifyNewFollower(
    userId: string,
    followerId: string,
    followerName: string,
  ): Promise<Notification> {
    return await this.create({
      userId,
      type: NotificationType.NEW_FOLLOWER,
      title: 'Nuevo seguidor',
      message: `${followerName} ha comenzado a seguirte.`,
      data: {
        entityId: followerId,
        entityType: 'user',
        actorId: followerId,
        actorName: followerName,
        actionUrl: `/profile/${followerId}`,
      },
      groupKey: `new_followers_${userId}`,
    });
  }

  /**
   * Método auxiliar para crear notificaciones de puntos
   */
  async notifyPointsEarned(
    userId: string,
    points: number,
    reason: string,
  ): Promise<Notification> {
    return await this.create({
      userId,
      type: NotificationType.POINTS_EARNED,
      title: '¡Ganaste puntos!',
      message: `Has ganado ${points} puntos por ${reason}.`,
      data: {
        entityType: 'points',
        actionUrl: '/profile/points',
      },
    });
  }

  /**
   * Método auxiliar para crear notificaciones de nivel
   */
  async notifyLevelUp(
    userId: string,
    newLevel: string,
  ): Promise<Notification> {
    return await this.create({
      userId,
      type: NotificationType.LEVEL_UP,
      title: '¡Subiste de nivel!',
      message: `¡Felicidades! Ahora eres ${newLevel}.`,
      data: {
        entityType: 'level',
        actionUrl: '/profile/achievements',
      },
    });
  }
}
