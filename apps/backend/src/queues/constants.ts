/**
 * Nombres de las colas (queues)
 */
export enum QueueName {
  EMAIL = 'email',
  NOTIFICATIONS = 'notifications',
  IMAGE_PROCESSING = 'image-processing',
  REPORTS = 'reports',
  CLEANUP = 'cleanup',
}

/**
 * Nombres de los jobs en cada cola
 */
export const JobName = {
  // Email jobs
  EMAIL_WELCOME: 'email:welcome',
  EMAIL_BOOKING_CONFIRMATION: 'email:booking-confirmation',
  EMAIL_PASSWORD_RESET: 'email:password-reset',
  EMAIL_BOOKING_REMINDER: 'email:booking-reminder',
  EMAIL_REVIEW_REQUEST: 'email:review-request',

  // Notification jobs
  NOTIFICATION_PUSH: 'notification:push',
  NOTIFICATION_IN_APP: 'notification:in-app',
  NOTIFICATION_SMS: 'notification:sms',

  // Image processing jobs
  IMAGE_PROCESS: 'image:process', // Main job for processing uploaded images
  IMAGE_RESIZE: 'image:resize',
  IMAGE_OPTIMIZE: 'image:optimize',
  IMAGE_THUMBNAIL: 'image:thumbnail',

  // Report jobs
  REPORT_BOOKING: 'report:booking',
  REPORT_REVENUE: 'report:revenue',
  REPORT_ANALYTICS: 'report:analytics',

  // Cleanup jobs
  CLEANUP_OLD_LOGS: 'cleanup:old-logs',
  CLEANUP_EXPIRED_TOKENS: 'cleanup:expired-tokens',
  CLEANUP_TEMP_FILES: 'cleanup:temp-files',
} as const;
