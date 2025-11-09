// Notification Enums

export enum NotificationType {
  // Booking notifications
  BOOKING_CREATED = 'booking_created',
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_CANCELLED = 'booking_cancelled',
  BOOKING_REMINDER = 'booking_reminder',

  // Payment notifications
  PAYMENT_SUCCESSFUL = 'payment_successful',
  PAYMENT_FAILED = 'payment_failed',
  PAYMENT_REFUND = 'payment_refund',

  // Social notifications
  POST_LIKE = 'post_like',
  POST_COMMENT = 'post_comment',
  NEW_FOLLOWER = 'new_follower',
  MENTION = 'mention',

  // B2B notifications
  ALLIANCE_REQUEST = 'alliance_request',
  ALLIANCE_ACCEPTED = 'alliance_accepted',
  ALLIANCE_REJECTED = 'alliance_rejected',
  CONTRACT_SIGNED = 'contract_signed',
  TRANSACTION_PAID = 'transaction_paid',

  // Points notifications
  POINTS_EARNED = 'points_earned',
  LEVEL_UP = 'level_up',
  REWARD_AVAILABLE = 'reward_available',
  REWARD_REDEEMED = 'reward_redeemed',

  // Experience notifications
  NEW_EXPERIENCE = 'new_experience',
  EXPERIENCE_UPDATED = 'experience_updated',
  EXPERIENCE_REVIEW = 'experience_review',

  // Admin notifications
  CAMPAIGN_PENDING_APPROVAL = 'campaign_pending_approval',
  REPORT_RECEIVED = 'report_received',

  // General
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  WELCOME = 'welcome',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationChannel {
  IN_APP = 'in_app',         // Notificación en la app
  EMAIL = 'email',           // Email
  PUSH = 'push',             // Push notification
  SMS = 'sms',               // SMS
}

export enum NotificationStatus {
  PENDING = 'pending',       // Pendiente de enviar
  SENT = 'sent',             // Enviada
  DELIVERED = 'delivered',   // Entregada
  READ = 'read',             // Leída
  FAILED = 'failed',         // Falló el envío
}
