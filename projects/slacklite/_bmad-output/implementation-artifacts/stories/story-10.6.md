# Story 10.6: Implement Performance Monitoring

**Epic:** Epic 10 - Testing & Quality Assurance

**Description:**
Implement client-side performance monitoring for key Web Vitals metrics (FCP, LCP, TTI, CLS, FID/INP) and custom application metrics (message delivery latency, channel switch time). Integrate with Vercel Analytics and Sentry for performance tracking and alerting.

**Acceptance Criteria:**
- [x] Install web-vitals library: `pnpm add web-vitals`
- [x] Create `lib/monitoring/performance.ts` with Web Vitals tracking
- [x] Track core Web Vitals:
  - [x] First Contentful Paint (FCP) - Target: <1.8s
  - [x] Largest Contentful Paint (LCP) - Target: <2.5s
  - [x] Cumulative Layout Shift (CLS) - Target: <0.1
  - [x] Interaction to Next Paint (INP) - Target: <200ms
- [x] Track custom metrics:
  - [x] Message delivery latency - Target: <500ms
  - [x] Channel switch duration - Target: <200ms
  - [x] Authentication time - Target: <1s
- [x] Integrate with Vercel Analytics (already installed via @vercel/analytics)
- [x] Send metrics to Sentry for performance monitoring
- [x] Add performance monitoring to root layout
- [x] Create performance dashboard component (optional, for debugging)
- [x] Add performance tests to verify metrics are being tracked
- [x] Document performance monitoring in README

**Dependencies:**
dependsOn: ["4.4", "11.3"]

**Technical Notes:**
- Web Vitals implementation (lib/monitoring/performance.ts):
  ```typescript
  import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
  import * as Sentry from '@sentry/nextjs';

  export function initPerformanceMonitoring() {
    onCLS((metric) => {
      sendToAnalytics(metric);
    });

    onFCP((metric) => {
      sendToAnalytics(metric);
    });

    onINP((metric) => {
      sendToAnalytics(metric);
    });

    onLCP((metric) => {
      sendToAnalytics(metric);
    });

    onTTFB((metric) => {
      sendToAnalytics(metric);
    });
  }

  function sendToAnalytics(metric: Metric) {
    // Send to Vercel Analytics
    if (window.va) {
      window.va('event', {
        name: 'web-vitals',
        data: {
          metric: metric.name,
          value: metric.value,
          rating: metric.rating,
          id: metric.id,
        },
      });
    }

    // Send to Sentry
    Sentry.metrics.distribution(
      `webvital.${metric.name.toLowerCase()}`,
      metric.value,
      {
        unit: 'millisecond',
        tags: { rating: metric.rating },
      }
    );

    // Alert if performance degrades
    if (metric.rating === 'poor') {
      Sentry.captureMessage(
        `Poor ${metric.name}: ${metric.value}`,
        'warning'
      );
    }
  }

  // Custom metrics
  export function trackMessageLatency(sendTime: number, receiveTime: number) {
    const latency = receiveTime - sendTime;
    
    Sentry.metrics.distribution('message.delivery.latency', latency, {
      unit: 'millisecond',
    });
    
    if (latency > 500) {
      Sentry.captureMessage(
        `Message latency exceeded threshold: ${latency}ms`,
        'warning'
      );
    }
  }

  export function trackChannelSwitch(startTime: number, endTime: number) {
    const duration = endTime - startTime;
    
    Sentry.metrics.distribution('channel.switch.duration', duration, {
      unit: 'millisecond',
    });
    
    if (duration > 200) {
      Sentry.captureMessage(
        `Channel switch exceeded threshold: ${duration}ms`,
        'warning'
      );
    }
  }

  export function trackAuthTime(startTime: number, endTime: number) {
    const duration = endTime - startTime;
    
    Sentry.metrics.distribution('auth.signin.duration', duration, {
      unit: 'millisecond',
    });
  }
  ```

- Root layout integration (app/layout.tsx):
  ```typescript
  'use client';

  import { useEffect } from 'react';
  import { initPerformanceMonitoring } from '@/lib/monitoring/performance';

  export default function RootLayout({ children }) {
    useEffect(() => {
      initPerformanceMonitoring();
    }, []);

    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  }
  ```

- Usage in message sending (hooks/useMessages.ts):
  ```typescript
  import { trackMessageLatency } from '@/lib/monitoring/performance';

  async function sendMessage(text: string) {
    const sendTime = Date.now();
    
    // Send message...
    await writeToFirebase(text);
    
    // Track when received
    const receiveTime = Date.now();
    trackMessageLatency(sendTime, receiveTime);
  }
  ```

- Performance tests (tests/unit/monitoring/performance.test.ts):
  ```typescript
  import { describe, it, expect, vi } from 'vitest';
  import { trackMessageLatency, trackChannelSwitch } from '@/lib/monitoring/performance';

  describe('Performance Monitoring', () => {
    it('tracks message latency', () => {
      const sendTime = Date.now();
      const receiveTime = sendTime + 250;
      
      trackMessageLatency(sendTime, receiveTime);
      
      // Verify Sentry was called
      expect(mockSentry.metrics.distribution).toHaveBeenCalledWith(
        'message.delivery.latency',
        250,
        expect.any(Object)
      );
    });

    it('alerts on slow message delivery', () => {
      const sendTime = Date.now();
      const receiveTime = sendTime + 600; // >500ms
      
      trackMessageLatency(sendTime, receiveTime);
      
      expect(mockSentry.captureMessage).toHaveBeenCalledWith(
        'Message latency exceeded threshold: 600ms',
        'warning'
      );
    });
  });
  ```

**Estimated Effort:** 3 hours

**Status:** DONE
