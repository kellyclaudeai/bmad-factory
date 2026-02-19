import * as Sentry from "@sentry/nextjs";
import {
  onCLS,
  onFCP,
  onINP,
  onLCP,
  onTTFB,
  type Metric,
} from "web-vitals";

type MetricUnit = "millisecond" | "none";
type MetricTagValue = string | number | boolean | null | undefined;
type MetricTags = Record<string, MetricTagValue>;

interface SentryMetricOptions {
  unit?: string;
  tags?: Record<string, string>;
}

interface SentryMetricsApi {
  distribution?: (
    metricName: string,
    value: number,
    options?: SentryMetricOptions,
  ) => void;
}

type SentryWithMetrics = typeof Sentry & {
  metrics?: SentryMetricsApi;
};

interface PerformanceMetricEventDetail {
  metric: string;
  value: number;
  unit: MetricUnit;
  status: "ok" | "degraded";
  target?: number;
  tags: MetricTags;
  timestamp: number;
}

interface CustomMetricOptions {
  metricName: string;
  analyticsEventName: string;
  value: number;
  target: number;
  tags?: MetricTags;
}

const WEB_VITAL_ANALYTICS_EVENT = "web_vital";
const MESSAGE_LATENCY_TARGET_MS = 500;
const CHANNEL_SWITCH_TARGET_MS = 200;
const AUTH_TARGET_MS = 1000;
const MAX_TRACKABLE_MESSAGE_AGE_MS = 60_000;

const WEB_VITAL_TARGETS: Partial<Record<Metric["name"], number>> = {
  FCP: 1800,
  LCP: 2500,
  CLS: 0.1,
  INP: 200,
  TTFB: 800,
};

const pendingChannelSwitches = new Map<string, number>();
let monitoringInitialized = false;

function normalizeDurationMs(startTime: number, endTime: number): number {
  const duration = endTime - startTime;

  if (!Number.isFinite(duration)) {
    return 0;
  }

  return Math.max(0, Math.round(duration));
}

function getSentryTags(tags: MetricTags | undefined): Record<string, string> {
  if (!tags) {
    return {};
  }

  return Object.entries(tags).reduce<Record<string, string>>(
    (result, [key, value]) => {
      if (value === undefined || value === null) {
        return result;
      }

      result[key] = String(value);
      return result;
    },
    {},
  );
}

function emitPerformanceMetricEvent(detail: PerformanceMetricEventDetail): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<PerformanceMetricEventDetail>(
      "slacklite:performance-metric",
      { detail },
    ),
  );
}

function sendToVercelAnalytics(
  eventName: string,
  data: Record<string, MetricTagValue>,
): void {
  if (typeof window === "undefined" || typeof window.va !== "function") {
    return;
  }

  window.va("event", {
    name: eventName,
    data,
  });
}

function sendToSentryMetric(
  metricName: string,
  value: number,
  unit: MetricUnit,
  tags?: MetricTags,
): void {
  const sentryTags = getSentryTags(tags);
  const sentryClient = Sentry as SentryWithMetrics;

  if (typeof sentryClient.metrics?.distribution === "function") {
    sentryClient.metrics.distribution(metricName, value, {
      unit,
      tags: sentryTags,
    });
    return;
  }

  Sentry.captureMessage(`performance.metric:${metricName}`, {
    level: "info",
    tags: {
      feature: "performance-monitoring",
      metric: metricName,
      ...sentryTags,
    },
    extra: {
      value,
      unit,
    },
  });
}

function capturePerformanceWarning(
  warningMessage: string,
  metricName: string,
  value: number,
  target: number,
  tags?: MetricTags,
): void {
  Sentry.captureMessage(warningMessage, {
    level: "warning",
    tags: {
      feature: "performance-monitoring",
      metric: metricName,
      ...getSentryTags(tags),
    },
    extra: {
      value,
      target,
    },
  });
}

function publishCustomMetric({
  metricName,
  analyticsEventName,
  value,
  target,
  tags,
}: CustomMetricOptions): number {
  sendToVercelAnalytics(analyticsEventName, {
    metric: metricName,
    value,
    target,
    ...tags,
  });
  sendToSentryMetric(metricName, value, "millisecond", tags);
  emitPerformanceMetricEvent({
    metric: metricName,
    value,
    unit: "millisecond",
    status: value > target ? "degraded" : "ok",
    target,
    tags: tags ?? {},
    timestamp: Date.now(),
  });

  return value;
}

function trackWebVital(metric: Metric): void {
  const value = Number(metric.value);

  if (!Number.isFinite(value)) {
    return;
  }

  const normalizedName = metric.name.toLowerCase();
  const metricName = `webvital.${normalizedName}`;
  const unit: MetricUnit = metric.name === "CLS" ? "none" : "millisecond";
  const target = WEB_VITAL_TARGETS[metric.name];
  const tags: MetricTags = {
    rating: metric.rating,
    id: metric.id,
  };

  sendToVercelAnalytics(WEB_VITAL_ANALYTICS_EVENT, {
    metric: metric.name,
    value,
    rating: metric.rating,
    id: metric.id,
    delta: metric.delta,
  });
  sendToSentryMetric(metricName, value, unit, tags);
  emitPerformanceMetricEvent({
    metric: metricName,
    value,
    unit,
    status: metric.rating === "poor" ? "degraded" : "ok",
    target,
    tags,
    timestamp: Date.now(),
  });

  if (metric.rating === "poor") {
    capturePerformanceWarning(
      `Poor ${metric.name}: ${value}`,
      metricName,
      value,
      target ?? value,
      tags,
    );
    return;
  }

  if (typeof target === "number" && value > target) {
    capturePerformanceWarning(
      `${metric.name} exceeded target: ${value} (target <${target})`,
      metricName,
      value,
      target,
      tags,
    );
  }
}

export function initPerformanceMonitoring(): void {
  if (monitoringInitialized || typeof window === "undefined") {
    return;
  }

  monitoringInitialized = true;

  onCLS(trackWebVital);
  onFCP(trackWebVital);
  onINP(trackWebVital);
  onLCP(trackWebVital);
  onTTFB(trackWebVital);
}

export function trackMessageLatency(
  sendTime: number,
  receiveTime: number,
  tags?: MetricTags,
): number {
  const latencyMs = normalizeDurationMs(sendTime, receiveTime);

  // Avoid false alerts for older backlog messages replayed by the listener.
  if (latencyMs > MAX_TRACKABLE_MESSAGE_AGE_MS) {
    return latencyMs;
  }

  const value = publishCustomMetric({
    metricName: "message.delivery.latency",
    analyticsEventName: "message_delivery_latency",
    value: latencyMs,
    target: MESSAGE_LATENCY_TARGET_MS,
    tags,
  });

  if (value > MESSAGE_LATENCY_TARGET_MS) {
    capturePerformanceWarning(
      `Message latency exceeded threshold: ${value}ms`,
      "message.delivery.latency",
      value,
      MESSAGE_LATENCY_TARGET_MS,
      tags,
    );
  }

  return value;
}

export function trackChannelSwitch(
  startTime: number,
  endTime: number,
  tags?: MetricTags,
): number {
  const durationMs = normalizeDurationMs(startTime, endTime);
  const value = publishCustomMetric({
    metricName: "channel.switch.duration",
    analyticsEventName: "channel_switch_duration",
    value: durationMs,
    target: CHANNEL_SWITCH_TARGET_MS,
    tags,
  });

  if (value > CHANNEL_SWITCH_TARGET_MS) {
    capturePerformanceWarning(
      `Channel switch exceeded threshold: ${value}ms`,
      "channel.switch.duration",
      value,
      CHANNEL_SWITCH_TARGET_MS,
      tags,
    );
  }

  return value;
}

export function trackAuthTime(
  startTime: number,
  endTime: number,
  tags?: MetricTags,
): number {
  const durationMs = normalizeDurationMs(startTime, endTime);
  const value = publishCustomMetric({
    metricName: "auth.signin.duration",
    analyticsEventName: "auth_duration",
    value: durationMs,
    target: AUTH_TARGET_MS,
    tags,
  });

  if (value > AUTH_TARGET_MS) {
    capturePerformanceWarning(
      `Authentication exceeded threshold: ${value}ms`,
      "auth.signin.duration",
      value,
      AUTH_TARGET_MS,
      tags,
    );
  }

  return value;
}

export function startChannelSwitchTracking(
  channelId: string,
  startTime: number = Date.now(),
): void {
  const normalizedChannelId = channelId.trim();

  if (normalizedChannelId.length === 0 || !Number.isFinite(startTime)) {
    return;
  }

  pendingChannelSwitches.set(normalizedChannelId, startTime);
}

export function consumeChannelSwitchStart(channelId: string): number | null {
  const normalizedChannelId = channelId.trim();

  if (normalizedChannelId.length === 0) {
    return null;
  }

  const startTime = pendingChannelSwitches.get(normalizedChannelId);

  if (startTime === undefined) {
    return null;
  }

  pendingChannelSwitches.delete(normalizedChannelId);
  return startTime;
}
