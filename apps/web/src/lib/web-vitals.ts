/**
 * Web Vitals Tracking
 *
 * Tracks Core Web Vitals and sends metrics to analytics
 */

import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals';

// Analytics endpoint (replace with your analytics service)
const ANALYTICS_ENDPOINT = process.env.NEXT_PUBLIC_ANALYTICS_URL || '/api/analytics';

interface AnalyticsData {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

/**
 * Send metrics to analytics service
 */
function sendToAnalytics(metric: Metric) {
  const body: AnalyticsData = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  };

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', body);
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production' && navigator.sendBeacon) {
    navigator.sendBeacon(
      ANALYTICS_ENDPOINT,
      new Blob([JSON.stringify(body)], { type: 'application/json' })
    );
  } else if (process.env.NODE_ENV === 'production') {
    // Fallback to fetch if sendBeacon is not available
    fetch(ANALYTICS_ENDPOINT, {
      body: JSON.stringify(body),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      keepalive: true,
    }).catch((error) => {
      console.error('[Web Vitals] Error sending metrics:', error);
    });
  }
}

/**
 * Report Web Vitals
 * Call this in _app.tsx or layout.tsx
 */
export function reportWebVitals() {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}

/**
 * Get performance thresholds
 */
export const PERFORMANCE_THRESHOLDS = {
  // Largest Contentful Paint (LCP)
  LCP: {
    good: 2500,
    needsImprovement: 4000,
  },
  // First Input Delay (FID)
  FID: {
    good: 100,
    needsImprovement: 300,
  },
  // Cumulative Layout Shift (CLS)
  CLS: {
    good: 0.1,
    needsImprovement: 0.25,
  },
  // First Contentful Paint (FCP)
  FCP: {
    good: 1800,
    needsImprovement: 3000,
  },
  // Time to First Byte (TTFB)
  TTFB: {
    good: 800,
    needsImprovement: 1800,
  },
};

/**
 * Performance monitoring utilities
 */
export const PerformanceMonitor = {
  /**
   * Mark a custom performance metric
   */
  mark(name: string) {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(name);
    }
  },

  /**
   * Measure time between two marks
   */
  measure(name: string, startMark: string, endMark: string) {
    if (typeof window !== 'undefined' && window.performance) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        return measure.duration;
      } catch (error) {
        console.error('[Performance] Error measuring:', error);
        return 0;
      }
    }
    return 0;
  },

  /**
   * Get navigation timing
   */
  getNavigationTiming() {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      return {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        ttfb: navigation.responseStart - navigation.requestStart,
        download: navigation.responseEnd - navigation.responseStart,
        domInteractive: navigation.domInteractive - navigation.fetchStart,
        domComplete: navigation.domComplete - navigation.fetchStart,
        loadComplete: navigation.loadEventEnd - navigation.fetchStart,
      };
    }
    return null;
  },

  /**
   * Get resource timing
   */
  getResourceTiming() {
    if (typeof window !== 'undefined' && window.performance) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

      return resources.map((resource) => ({
        name: resource.name,
        type: resource.initiatorType,
        duration: resource.duration,
        size: resource.transferSize,
      }));
    }
    return [];
  },

  /**
   * Clear all performance marks and measures
   */
  clear() {
    if (typeof window !== 'undefined' && window.performance) {
      performance.clearMarks();
      performance.clearMeasures();
    }
  },
};

/**
 * Log performance summary
 */
export function logPerformanceSummary() {
  const navigation = PerformanceMonitor.getNavigationTiming();

  if (navigation) {
    console.group('📊 Performance Summary');
    console.log(`DNS Lookup: ${navigation.dns.toFixed(2)}ms`);
    console.log(`TCP Connection: ${navigation.tcp.toFixed(2)}ms`);
    console.log(`TTFB: ${navigation.ttfb.toFixed(2)}ms`);
    console.log(`Download: ${navigation.download.toFixed(2)}ms`);
    console.log(`DOM Interactive: ${navigation.domInteractive.toFixed(2)}ms`);
    console.log(`DOM Complete: ${navigation.domComplete.toFixed(2)}ms`);
    console.log(`Load Complete: ${navigation.loadComplete.toFixed(2)}ms`);
    console.groupEnd();
  }
}
