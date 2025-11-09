# Sentry Integration - Error Monitoring

## Overview

Sentry has been integrated into Viajero Conectado backend for comprehensive error tracking and performance monitoring in production.

## Features

✅ **Automatic Error Capture**
- All unhandled exceptions are automatically sent to Sentry
- Stack traces with full context
- Request and response data

✅ **Performance Monitoring**
- Transaction tracing for API endpoints
- Performance metrics and profiling
- Slow request detection

✅ **User Context**
- Automatic user identification
- Role-based context
- Request metadata

✅ **Error Filtering**
- Validation errors excluded (expected behavior)
- Authentication errors excluded (not bugs)
- Health check endpoints ignored

✅ **Security**
- Sensitive data sanitization (passwords, tokens)
- Header redaction
- Body sanitization

## Configuration

### Environment Variables

```bash
# Required
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Optional
SENTRY_RELEASE=viajero-conectado@1.0.0
SENTRY_DEBUG=false  # Enable for debugging
NODE_ENV=production  # Sentry behavior changes by environment
```

### Sentry Dashboard

1. Create a project at [sentry.io](https://sentry.io)
2. Copy the DSN from Project Settings
3. Add DSN to `.env` file
4. Deploy and errors will start flowing to Sentry

## Usage

### Automatic Capture

Most errors are captured automatically:

```typescript
// Throws will be caught by SentryExceptionFilter
throw new Error('Something went wrong');
throw new HttpException('Not Found', 404);
```

### Manual Capture

```typescript
import { captureException, captureMessage } from './common/sentry/sentry.config';

// Capture exception with context
try {
  await dangerousOperation();
} catch (error) {
  captureException(error, {
    operation: 'dangerousOperation',
    userId: user.id,
  });
  throw error;
}

// Capture message
captureMessage('Important business event occurred', 'info');
```

### User Context

```typescript
import { setUser, clearUser } from './common/sentry/sentry.config';

// Set user context
setUser({
  id: user.id,
  email: user.email,
  role: user.role,
});

// Clear user context
clearUser();
```

### Custom Tags

```typescript
import { setTag } from './common/sentry/sentry.config';

setTag('payment_provider', 'stripe');
setTag('feature_flag', 'new_ui');
```

### Breadcrumbs

```typescript
import { addBreadcrumb } from './common/sentry/sentry.config';

addBreadcrumb({
  category: 'auth',
  message: 'User logged in',
  level: 'info',
  data: {
    userId: user.id,
    method: 'email',
  },
});
```

## Testing

### Test Endpoint

```bash
# Development only - throws test error
GET /api/v1/health/sentry-test
```

This endpoint will:
1. Send a test message to Sentry
2. Throw a test error
3. Verify full integration

### Expected Sentry Event

The event in Sentry should include:
- Error message: "This is a test error for Sentry monitoring"
- Stack trace
- Request context (method, URL, headers)
- Environment: development
- Tags: http.method, http.url, http.status_code

## Sample Rates

### Development
- Traces: 100% (all requests)
- Profiles: 100% (all requests)

### Production
- Traces: 10% (to reduce quota usage)
- Profiles: 10% (to reduce quota usage)

Adjust in `src/common/sentry/sentry.config.ts`:

```typescript
tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
profilesSampleRate: environment === 'production' ? 0.1 : 1.0,
```

## Excluded Errors

The following errors are NOT sent to Sentry (expected behavior):

- Validation errors (`validation failed`)
- Authentication errors (`Unauthorized`, `Invalid token`)
- 4xx errors (client errors, not bugs)

## Graceful Shutdown

Sentry is properly closed on application shutdown:

```typescript
// SIGTERM and SIGINT handlers
process.on('SIGTERM', async () => {
  await closeSentry();
  await app.close();
  process.exit(0);
});
```

## Architecture

### Components

1. **sentry.config.ts** - Core configuration and utilities
2. **SentryInterceptor** - Adds context to each request
3. **SentryExceptionFilter** - Captures unhandled exceptions
4. **LoggerService** - Logs errors before sending to Sentry

### Flow

```
Request → SentryInterceptor (add context)
       → Controller/Service
       → Error thrown
       → SentryExceptionFilter (capture + log)
       → Sentry Dashboard
       → Response to client
```

## Best Practices

### DO ✅

- Let most errors be caught automatically
- Add context when manually capturing
- Use appropriate severity levels
- Sanitize sensitive data
- Test in staging before production

### DON'T ❌

- Don't send expected errors (validation, auth)
- Don't send PII without sanitizing
- Don't capture in every catch block
- Don't set 100% sample rate in production
- Don't commit DSN to repository

## Monitoring

### Key Metrics in Sentry

- Error rate by endpoint
- Affected users count
- Error frequency trends
- Response time percentiles
- Most common error types

### Alerts

Configure Sentry alerts for:
- Error rate spikes
- New error types
- Performance degradation
- Specific endpoints failing

## Troubleshooting

### No Events in Sentry

1. Check `SENTRY_DSN` is set
2. Check `NODE_ENV` (some errors filtered in dev)
3. Check Sentry quota (free tier limits)
4. Check firewall/network (can reach sentry.io)
5. Enable `SENTRY_DEBUG=true` for logs

### Too Many Events

1. Increase filtering in `beforeSend`
2. Reduce sample rates
3. Add more error types to ignore list
4. Check for error loops

### Missing Context

1. Verify SentryInterceptor is global
2. Check user context is set
3. Ensure request data not sanitized too aggressively

## Resources

- [Sentry Docs](https://docs.sentry.io/)
- [Node.js SDK](https://docs.sentry.io/platforms/node/)
- [Performance Monitoring](https://docs.sentry.io/platforms/node/performance/)
- [Best Practices](https://docs.sentry.io/platforms/node/best-practices/)

## Support

For issues with Sentry integration:
1. Check this documentation
2. Review Sentry debug logs
3. Check Sentry status page
4. Contact team lead
