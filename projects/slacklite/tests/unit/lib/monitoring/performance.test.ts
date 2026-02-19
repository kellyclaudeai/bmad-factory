import { beforeEach, describe, expect, it, vi } from "vitest";

const webVitalsMocks = vi.hoisted(() => ({
  callbacks: {
    cls: null as ((metric: unknown) => void) | null,
    fcp: null as ((metric: unknown) => void) | null,
    inp: null as ((metric: unknown) => void) | null,
    lcp: null as ((metric: unknown) => void) | null,
    ttfb: null as ((metric: unknown) => void) | null,
  },
  onCLSMock: vi.fn((callback: (metric: unknown) => void) => {
    webVitalsMocks.callbacks.cls = callback;
  }),
  onFCPMock: vi.fn((callback: (metric: unknown) => void) => {
    webVitalsMocks.callbacks.fcp = callback;
  }),
  onINPMock: vi.fn((callback: (metric: unknown) => void) => {
    webVitalsMocks.callbacks.inp = callback;
  }),
  onLCPMock: vi.fn((callback: (metric: unknown) => void) => {
    webVitalsMocks.callbacks.lcp = callback;
  }),
  onTTFBMock: vi.fn((callback: (metric: unknown) => void) => {
    webVitalsMocks.callbacks.ttfb = callback;
  }),
}));

const sentryMocks = vi.hoisted(() => ({
  captureMessageMock: vi.fn(),
  distributionMock: vi.fn(),
}));

vi.mock("web-vitals", () => ({
  onCLS: webVitalsMocks.onCLSMock,
  onFCP: webVitalsMocks.onFCPMock,
  onINP: webVitalsMocks.onINPMock,
  onLCP: webVitalsMocks.onLCPMock,
  onTTFB: webVitalsMocks.onTTFBMock,
}));

vi.mock("@sentry/nextjs", () => ({
  captureMessage: sentryMocks.captureMessageMock,
  metrics: {
    distribution: sentryMocks.distributionMock,
  },
}));

describe("performance monitoring", () => {
  beforeEach(() => {
    vi.resetModules();

    webVitalsMocks.onCLSMock.mockClear();
    webVitalsMocks.onFCPMock.mockClear();
    webVitalsMocks.onINPMock.mockClear();
    webVitalsMocks.onLCPMock.mockClear();
    webVitalsMocks.onTTFBMock.mockClear();
    webVitalsMocks.callbacks.cls = null;
    webVitalsMocks.callbacks.fcp = null;
    webVitalsMocks.callbacks.inp = null;
    webVitalsMocks.callbacks.lcp = null;
    webVitalsMocks.callbacks.ttfb = null;

    sentryMocks.captureMessageMock.mockClear();
    sentryMocks.distributionMock.mockClear();

    const windowWithAnalytics = window as Window & {
      va?: ReturnType<typeof vi.fn>;
    };
    windowWithAnalytics.va = vi.fn();
  });

  it("registers web-vitals callbacks once and forwards FCP to analytics + Sentry", async () => {
    const { initPerformanceMonitoring } = await import(
      "@/lib/monitoring/performance"
    );

    initPerformanceMonitoring();
    initPerformanceMonitoring();

    expect(webVitalsMocks.onCLSMock).toHaveBeenCalledTimes(1);
    expect(webVitalsMocks.onFCPMock).toHaveBeenCalledTimes(1);
    expect(webVitalsMocks.onINPMock).toHaveBeenCalledTimes(1);
    expect(webVitalsMocks.onLCPMock).toHaveBeenCalledTimes(1);
    expect(webVitalsMocks.onTTFBMock).toHaveBeenCalledTimes(1);

    webVitalsMocks.callbacks.fcp?.({
      name: "FCP",
      value: 400,
      rating: "good",
      id: "metric-1",
      delta: 400,
    });

    const analyticsMock = (
      window as Window & {
        va?: ReturnType<typeof vi.fn>;
      }
    ).va;

    expect(analyticsMock).toHaveBeenCalledWith(
      "event",
      expect.objectContaining({
        name: "web_vital",
        data: expect.objectContaining({
          metric: "FCP",
          value: 400,
          rating: "good",
        }),
      }),
    );
    expect(sentryMocks.distributionMock).toHaveBeenCalledWith(
      "webvital.fcp",
      400,
      expect.objectContaining({
        unit: "millisecond",
      }),
    );
  });

  it("captures warning-level events for poor web-vitals", async () => {
    const { initPerformanceMonitoring } = await import(
      "@/lib/monitoring/performance"
    );

    initPerformanceMonitoring();

    webVitalsMocks.callbacks.lcp?.({
      name: "LCP",
      value: 3200,
      rating: "poor",
      id: "metric-2",
      delta: 3200,
    });

    expect(sentryMocks.captureMessageMock).toHaveBeenCalledWith(
      expect.stringContaining("Poor LCP"),
      expect.objectContaining({
        level: "warning",
      }),
    );
  });

  it("tracks message delivery latency and warns when latency exceeds 500ms", async () => {
    const { trackMessageLatency } = await import("@/lib/monitoring/performance");

    expect(trackMessageLatency(1000, 1250)).toBe(250);
    expect(sentryMocks.distributionMock).toHaveBeenCalledWith(
      "message.delivery.latency",
      250,
      expect.objectContaining({
        unit: "millisecond",
      }),
    );

    trackMessageLatency(1000, 1600);

    expect(sentryMocks.captureMessageMock).toHaveBeenCalledWith(
      expect.stringContaining("Message latency exceeded threshold"),
      expect.objectContaining({
        level: "warning",
      }),
    );
  });

  it("tracks channel switch and auth duration thresholds", async () => {
    const { trackAuthTime, trackChannelSwitch } = await import(
      "@/lib/monitoring/performance"
    );

    expect(trackChannelSwitch(100, 250)).toBe(150);
    expect(trackAuthTime(100, 700)).toBe(600);
    expect(sentryMocks.captureMessageMock).not.toHaveBeenCalled();

    trackChannelSwitch(100, 400);
    trackAuthTime(100, 1300);

    expect(sentryMocks.captureMessageMock).toHaveBeenCalledWith(
      expect.stringContaining("Channel switch exceeded threshold"),
      expect.objectContaining({
        level: "warning",
      }),
    );
    expect(sentryMocks.captureMessageMock).toHaveBeenCalledWith(
      expect.stringContaining("Authentication exceeded threshold"),
      expect.objectContaining({
        level: "warning",
      }),
    );
  });

  it("stores and consumes channel-switch start markers", async () => {
    const { consumeChannelSwitchStart, startChannelSwitchTracking } =
      await import("@/lib/monitoring/performance");

    startChannelSwitchTracking("general", 1234);

    expect(consumeChannelSwitchStart("general")).toBe(1234);
    expect(consumeChannelSwitchStart("general")).toBeNull();
  });
});
