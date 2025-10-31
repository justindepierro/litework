# Production Monitoring & Analytics Setup Guide

This guide covers the complete setup of production monitoring and analytics for LiteWork, including error tracking, performance monitoring, user analytics, and system health monitoring.

## Overview

Our production monitoring stack includes:
- **Sentry**: Error tracking and performance monitoring
- **Vercel Analytics**: Core web vitals and traffic analytics
- **Custom Analytics**: Application-specific metrics and user behavior
- **Health Checks**: System availability and API monitoring
- **Logging**: Structured logging for debugging and audit trails

## 1. Sentry Integration (Error Tracking)

### Installation

```bash
npm install @sentry/nextjs @sentry/cli
```

### Configuration Files

#### sentry.client.config.ts
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.1,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

#### sentry.server.config.ts
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
});
```

#### sentry.edge.config.ts
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
});
```

### Environment Variables

```env
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ORG=your-org
SENTRY_PROJECT=litework
SENTRY_AUTH_TOKEN=your-auth-token
```

## 2. Vercel Analytics Integration

### Installation

```bash
npm install @vercel/analytics @vercel/speed-insights
```

### Configuration

Add to your root layout:

```typescript
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

## 3. Custom Analytics & Metrics

### Application Events Tracking

Create a comprehensive analytics service:

```typescript
interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: Date;
}

class AnalyticsService {
  // Track user interactions
  track(event: AnalyticsEvent): void;
  
  // Track performance metrics
  trackPerformance(metric: string, value: number): void;
  
  // Track business metrics
  trackWorkoutCompletion(workoutId: string, duration: number): void;
  trackProgressUpdate(athleteId: string, improvement: number): void;
}
```

### Key Metrics to Monitor

#### User Engagement
- Daily/Monthly Active Users
- Session Duration
- Feature Adoption Rates
- User Retention

#### Application Performance
- Page Load Times
- API Response Times
- Error Rates
- Cache Hit Rates

#### Business Metrics
- Workout Completion Rates
- Progress Tracking Usage
- Coach Dashboard Engagement
- Mobile vs Desktop Usage

## 4. Structured Logging

### Logger Configuration

```typescript
enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private logLevel: LogLevel;
  
  constructor(level: LogLevel = LogLevel.INFO) {
    this.logLevel = level;
  }
  
  error(message: string, metadata?: Record<string, any>): void;
  warn(message: string, metadata?: Record<string, any>): void;
  info(message: string, metadata?: Record<string, any>): void;
  debug(message: string, metadata?: Record<string, any>): void;
}
```

### Log Categories

#### Security Events
- Authentication attempts
- Authorization failures
- Suspicious activity
- Data access patterns

#### Performance Events
- Slow database queries
- Large payload requests
- Memory usage spikes
- Cache misses

#### Business Events
- User registrations
- Workout assignments
- Progress achievements
- Feature usage

## 5. Health Checks & Monitoring

### API Health Endpoints

```typescript
// /api/health
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    cache: await checkCache(),
    externalServices: await checkExternalServices(),
    timestamp: new Date().toISOString()
  };
  
  const isHealthy = Object.values(checks).every(
    check => check.status === 'healthy'
  );
  
  return Response.json(
    { status: isHealthy ? 'healthy' : 'unhealthy', checks },
    { status: isHealthy ? 200 : 503 }
  );
}
```

### Monitoring Alerts

#### Critical Alerts (Immediate Response)
- API downtime > 1 minute
- Error rate > 5%
- Database connection failures
- Authentication service issues

#### Warning Alerts (Monitor)
- Response time > 2 seconds
- Error rate > 1%
- High memory usage
- Unusual traffic patterns

#### Info Alerts (Daily Review)
- Performance degradation trends
- User behavior anomalies
- Feature usage statistics
- System resource trends

## 6. Dashboard Configuration

### Monitoring Dashboard

Create comprehensive monitoring dashboards that include:

#### System Health
- Uptime percentage
- Response time trends
- Error rate graphs
- Resource utilization

#### User Analytics
- Active user counts
- Feature adoption
- Geographic distribution
- Device/browser breakdown

#### Business Metrics
- Workout completion rates
- Progress tracking engagement
- Coach activity levels
- Goal achievement rates

## 7. Alert Channels

### Notification Setup

#### Slack Integration
```typescript
const slackWebhook = process.env.SLACK_WEBHOOK_URL;

async function sendSlackAlert(alert: {
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  metadata?: Record<string, any>;
}) {
  // Slack notification implementation
}
```

#### Email Alerts
```typescript
async function sendEmailAlert(alert: {
  recipients: string[];
  subject: string;
  body: string;
  priority: 'high' | 'normal' | 'low';
}) {
  // Email notification implementation
}
```

## 8. Performance Optimization Monitoring

### Core Web Vitals Tracking

Monitor and optimize:
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### Database Performance

Track and alert on:
- Query execution time
- Connection pool usage
- Index effectiveness
- Query frequency patterns

### CDN and Asset Performance

Monitor:
- Cache hit ratios
- Asset load times
- Geographic performance
- Bundle size trends

## 9. Security Monitoring

### Security Events

Track and alert on:
- Multiple failed login attempts
- Unusual access patterns
- Data export activities
- Permission changes

### GDPR and Privacy Compliance

Monitor:
- Data access requests
- Data deletion compliance
- Cookie consent rates
- Privacy policy updates

## 10. Implementation Checklist

### Phase 1: Basic Monitoring (Week 1)
- [ ] Install and configure Sentry
- [ ] Set up Vercel Analytics
- [ ] Implement basic error tracking
- [ ] Create health check endpoints

### Phase 2: Advanced Analytics (Week 2)
- [ ] Implement custom analytics service
- [ ] Set up business metrics tracking
- [ ] Configure performance monitoring
- [ ] Create monitoring dashboards

### Phase 3: Alerts & Optimization (Week 3)
- [ ] Configure alert channels
- [ ] Set up automated notifications
- [ ] Implement security monitoring
- [ ] Performance optimization based on data

### Phase 4: Continuous Improvement
- [ ] Regular performance reviews
- [ ] Alert threshold tuning
- [ ] Dashboard refinements
- [ ] New metric identification

## Environment-Specific Configuration

### Development
- Verbose logging enabled
- All metrics tracked locally
- Sentry debug mode on
- Real-time error reporting

### Staging
- Production-like monitoring
- Reduced sampling rates
- Test alert configurations
- Performance baseline establishment

### Production
- Optimized sampling rates
- Critical alerts only
- Performance-focused metrics
- Business-critical monitoring

## Next Steps

1. **Immediate Setup**: Configure Sentry and Vercel Analytics
2. **Custom Metrics**: Implement application-specific tracking
3. **Alerting**: Set up notification channels and thresholds
4. **Optimization**: Use monitoring data to improve performance
5. **Compliance**: Ensure monitoring meets security and privacy requirements

This monitoring setup provides comprehensive visibility into LiteWork's health, performance, and user engagement while enabling proactive issue resolution and continuous optimization.