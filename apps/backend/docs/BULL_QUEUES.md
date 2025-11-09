# Bull Queue System - Asynchronous Job Processing

## Overview

Viajero Conectado backend uses **Bull** for managing asynchronous jobs and background tasks. Bull is a Redis-based queue system that provides reliable job processing, retry mechanisms, delayed jobs, and priority queues.

## Features

✅ **Asynchronous Processing** - Non-blocking background jobs
✅ **Retry Mechanism** - Automatic retries with exponential backoff
✅ **Delayed Jobs** - Schedule jobs for future execution
✅ **Job Prioritization** - Process important jobs first
✅ **Monitoring UI** - Bull Board for visual queue management
✅ **Production-Ready** - Error handling and logging

## Architecture

### Queues

The system is organized into specialized queues:

1. **Email Queue** - Email sending (welcome, confirmations, reminders)
2. **Notifications Queue** - Push notifications, in-app, SMS
3. **Image Processing Queue** - Image resize, optimize, thumbnails (future)
4. **Reports Queue** - Generate analytics and reports (future)
5. **Cleanup Queue** - Data cleanup and maintenance (future)

### Components

**For each queue:**
- **Processor** - Handles job execution
- **Service** - Provides methods to enqueue jobs
- **Module** - Registers queue and dependencies

## Configuration

### Environment Variables

```bash
# Redis Configuration (shared with cache)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### Bull Configuration

Located in `src/config/bull.config.ts`:

```typescript
{
  redis: {
    host: 'localhost',
    port: 6379,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 100,  // Keep last 100 completed
    removeOnFail: 500,      // Keep last 500 failed
  },
}
```

## Email Queue

### Enqueuing Jobs

```typescript
import { EmailQueueService } from './queues/email/email-queue.service';

@Injectable()
export class AuthService {
  constructor(private emailQueue: EmailQueueService) {}

  async register(data: RegisterDto) {
    const user = await this.createUser(data);

    // Send welcome email asynchronously
    await this.emailQueue.sendWelcomeEmail({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return user;
  }
}
```

### Available Email Jobs

#### Welcome Email
```typescript
await emailQueue.sendWelcomeEmail({
  userId: '123',
  email: 'user@example.com',
  name: 'John Doe',
});
```

#### Booking Confirmation
```typescript
await emailQueue.sendBookingConfirmation({
  userId: '123',
  email: 'user@example.com',
  bookingId: 'booking-123',
  bookingNumber: 'BK-2025-001',
  experienceName: 'City Tour',
  date: '2025-12-01',
  totalAmount: 150.00,
});
```

#### Password Reset
```typescript
await emailQueue.sendPasswordReset({
  userId: '123',
  email: 'user@example.com',
  resetToken: 'secure-token-here',
});
```

#### Scheduled Reminder
```typescript
// Send reminder 24 hours before booking
const reminderDate = new Date(booking.date);
reminderDate.setHours(reminderDate.getHours() - 24);

await emailQueue.scheduleBookingReminder(
  {
    userId: '123',
    email: 'user@example.com',
    bookingId: 'booking-123',
    experienceName: 'City Tour',
    date: booking.date,
  },
  reminderDate,
);
```

#### Review Request
```typescript
// Send review request 3 days after experience
await emailQueue.sendReviewRequest(
  {
    userId: '123',
    email: 'user@example.com',
    bookingId: 'booking-123',
    experienceName: 'City Tour',
  },
  3 * 24 * 60 * 60 * 1000, // 3 days delay
);
```

## Notifications Queue

### Available Notification Jobs

#### Push Notification
```typescript
import { NotificationsQueueService } from './queues/notifications/notifications-queue.service';

await notificationsQueue.sendPushNotification({
  userId: '123',
  title: 'Booking Confirmed',
  body: 'Your booking has been confirmed',
  data: {
    bookingId: 'booking-123',
    type: 'booking_confirmation',
  },
});
```

#### In-App Notification
```typescript
await notificationsQueue.createInAppNotification({
  userId: '123',
  type: 'booking',
  title: 'Booking Confirmed',
  message: 'Your booking has been confirmed',
  link: '/bookings/booking-123',
  metadata: {
    bookingId: 'booking-123',
  },
});
```

#### SMS Notification
```typescript
await notificationsQueue.sendSms({
  userId: '123',
  phoneNumber: '+1234567890',
  message: 'Your booking BK-2025-001 has been confirmed',
});
```

#### Full Notification (Push + In-App)
```typescript
await notificationsQueue.sendFullNotification(
  '123', // userId
  'New Message',
  'You have a new message from the agency',
  { conversationId: 'conv-123' },
);
```

## Job Options

### Retry Configuration

```typescript
await emailQueue.sendBookingConfirmation(data, {
  attempts: 5,  // More retries for critical emails
  backoff: {
    type: 'exponential',
    delay: 3000,  // Start with 3 seconds
  },
});
```

### Delayed Jobs

```typescript
// Delay by milliseconds
await notificationsQueue.sendPushNotification(data, {
  delay: 60000,  // Send in 1 minute
});

// Delay until specific time
const sendAt = new Date('2025-12-01T10:00:00');
const delay = sendAt.getTime() - Date.now();

await emailQueue.sendBookingReminder(data, {
  delay,
});
```

### Job Priority

```typescript
// Higher priority (lower number = higher priority)
await emailQueue.sendPasswordReset(data, {
  priority: 1,  // High priority
});

await emailQueue.sendReviewRequest(data, {
  priority: 10,  // Low priority
});
```

### Remove on Complete

```typescript
await emailQueue.sendPasswordReset(data, {
  removeOnComplete: true,  // Don't keep completed jobs
});

await emailQueue.sendBookingConfirmation(data, {
  removeOnComplete: false,  // Keep for records
});
```

## Bull Board - Monitoring UI

Access the Bull Board dashboard at: `http://localhost:4000/admin/queues`

### Features

- **Real-time Queue Stats** - Waiting, active, completed, failed counts
- **Job Details** - View individual job data and progress
- **Retry Failed Jobs** - Manually retry failed jobs
- **Job History** - View completed and failed jobs
- **Clean Jobs** - Remove old jobs

### Screenshots

The Bull Board provides:
- Queue overview with counts
- Job list with status
- Job details with data and stack traces
- Actions: retry, remove, promote

## Queue Management

### Get Queue Statistics

```typescript
const stats = await emailQueue.getQueueStats();
console.log(stats);
// {
//   waiting: 5,
//   active: 2,
//   completed: 100,
//   failed: 3,
//   delayed: 10,
//   total: 17
// }
```

### Clean Completed Jobs

```typescript
// Remove completed jobs older than 24 hours
const cleaned = await emailQueue.cleanCompleted();
console.log(`Cleaned ${cleaned} jobs`);
```

### Pause/Resume Queue

```typescript
const queue = app.get<Queue>(getQueueToken(QueueName.EMAIL));

await queue.pause();  // Pause processing
await queue.resume(); // Resume processing
```

### Get Queue Status

```typescript
const isPaused = await queue.isPaused();
const jobCounts = await queue.getJobCounts();
```

## Error Handling

### Processor Error Handling

Errors in processors trigger automatic retries:

```typescript
@Process(JobName.EMAIL_WELCOME)
async sendWelcomeEmail(job: Job<WelcomeEmailData>) {
  try {
    await this.emailService.send(job.data);
    return { success: true };
  } catch (error) {
    this.logger.error(`Failed to send email: ${error.message}`);
    throw error;  // Bull will retry based on job options
  }
}
```

### Failed Job Events

Listen to failed jobs:

```typescript
queue.on('failed', (job, error) => {
  logger.error(`Job ${job.id} failed: ${error.message}`);
  // Send alert, log to Sentry, etc.
});
```

### Completed Job Events

```typescript
queue.on('completed', (job, result) => {
  logger.log(`Job ${job.id} completed successfully`);
});
```

## Best Practices

### 1. Use Idempotent Jobs

Ensure jobs can be safely retried:

```typescript
// Bad - may send duplicate emails
async sendEmail(data) {
  await emailService.send(data);
}

// Good - check if already sent
async sendEmail(data) {
  const sent = await emailLogRepository.findOne({ userId: data.userId, type: 'welcome' });
  if (sent) {
    return { skipped: true };
  }

  await emailService.send(data);
  await emailLogRepository.create({ userId: data.userId, type: 'welcome' });
}
```

### 2. Set Appropriate Timeouts

```typescript
await queue.add(JobName.EMAIL_WELCOME, data, {
  timeout: 30000,  // 30 seconds max
});
```

### 3. Use Job Priority

```typescript
// Critical jobs
priority: 1 - Password resets, booking confirmations

// Normal jobs
priority: 5 - Welcome emails, notifications

// Low priority jobs
priority: 10 - Marketing emails, cleanup tasks
```

### 4. Clean Old Jobs Regularly

```typescript
// Cron job to clean old jobs daily
@Cron('0 2 * * *')  // 2 AM daily
async cleanOldJobs() {
  await emailQueue.cleanCompleted();
  await notificationsQueue.cleanCompleted();
}
```

### 5. Monitor Failed Jobs

Set up alerts for failed jobs:

```typescript
queue.on('failed', async (job, error) => {
  const failedCount = await queue.getFailedCount();

  if (failedCount > 100) {
    await alertService.send({
      type: 'queue_alert',
      message: `High failed job count: ${failedCount}`,
    });
  }
});
```

## Integration Examples

### Bookings Module

```typescript
@Injectable()
export class BookingsService {
  constructor(
    private emailQueue: EmailQueueService,
    private notificationsQueue: NotificationsQueueService,
  ) {}

  async createBooking(data: CreateBookingDto, userId: string) {
    const booking = await this.repository.save({
      ...data,
      userId,
      status: 'confirmed',
    });

    // Send confirmation email
    await this.emailQueue.sendBookingConfirmation({
      userId,
      email: user.email,
      bookingId: booking.id,
      bookingNumber: booking.number,
      experienceName: experience.name,
      date: booking.date,
      totalAmount: booking.total,
    });

    // Send push notification
    await this.notificationsQueue.sendFullNotification(
      userId,
      'Booking Confirmed',
      `Your booking ${booking.number} has been confirmed`,
      { bookingId: booking.id },
    );

    // Schedule reminder 24h before
    const reminderDate = new Date(booking.date);
    reminderDate.setHours(reminderDate.getHours() - 24);

    await this.emailQueue.scheduleBookingReminder(
      {
        userId,
        email: user.email,
        bookingId: booking.id,
        experienceName: experience.name,
        date: booking.date,
      },
      reminderDate,
    );

    return booking;
  }
}
```

### Auth Module

```typescript
@Injectable()
export class AuthService {
  constructor(private emailQueue: EmailQueueService) {}

  async register(data: RegisterDto) {
    const user = await this.createUser(data);

    // Send welcome email asynchronously
    await this.emailQueue.sendWelcomeEmail({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return user;
  }

  async forgotPassword(email: string) {
    const user = await this.findByEmail(email);
    const resetToken = this.generateResetToken();

    await this.saveResetToken(user.id, resetToken);

    // Send reset email
    await this.emailQueue.sendPasswordReset({
      userId: user.id,
      email: user.email,
      resetToken,
    });
  }
}
```

## Troubleshooting

### Jobs Not Processing

1. **Check Redis Connection**
   ```bash
   redis-cli ping
   # Should return PONG
   ```

2. **Check Queue Status**
   ```typescript
   const isPaused = await queue.isPaused();
   console.log('Queue paused:', isPaused);
   ```

3. **Check Processor Registration**
   - Ensure processor is in module providers
   - Check `@Processor()` and `@Process()` decorators

### High Failed Job Count

1. **Check Error Logs**
   ```typescript
   const failed = await queue.getFailed();
   failed.forEach(job => {
     console.log(job.failedReason);
   });
   ```

2. **Increase Retry Attempts**
   ```typescript
   attempts: 5,  // More retries
   backoff: {
     type: 'exponential',
     delay: 5000,  // Longer delay between retries
   }
   ```

3. **Fix Root Cause**
   - Check third-party service availability
   - Verify credentials and API keys
   - Check network connectivity

### Memory Issues

1. **Clean Old Jobs**
   ```typescript
   await queue.clean(24 * 60 * 60 * 1000);  // Clean jobs older than 24h
   await queue.empty();  // Remove all waiting jobs
   ```

2. **Reduce Job Retention**
   ```typescript
   removeOnComplete: 50,   // Keep fewer completed jobs
   removeOnFail: 100,      // Keep fewer failed jobs
   ```

## Resources

- [Bull Documentation](https://github.com/OptimalBits/bull)
- [Bull Board](https://github.com/felixmosh/bull-board)
- [@nestjs/bull](https://docs.nestjs.com/techniques/queues)
- [Redis Documentation](https://redis.io/docs/)

## Support

For issues with queues:
1. Check Bull Board at `/admin/queues`
2. Review application logs
3. Check Redis connectivity
4. Verify job data structure
5. Contact development team
