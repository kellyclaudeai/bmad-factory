"use client";

import { useEffect, useState } from "react";

interface PerformanceMetricEventDetail {
  metric: string;
  value: number;
  unit: "millisecond" | "none";
  status: "ok" | "degraded";
  target?: number;
  tags: Record<string, string | number | boolean | null | undefined>;
  timestamp: number;
}

function formatValue(value: number, unit: PerformanceMetricEventDetail["unit"]): string {
  if (unit === "none") {
    return value.toFixed(3);
  }

  return `${Math.round(value)}ms`;
}

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetricEventDetail[]>([]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    const handleMetric = (event: Event): void => {
      const customEvent = event as CustomEvent<PerformanceMetricEventDetail>;
      const detail = customEvent.detail;

      if (!detail || typeof detail !== "object") {
        return;
      }

      setMetrics((previousMetrics) => [detail, ...previousMetrics].slice(0, 8));
    };

    window.addEventListener("slacklite:performance-metric", handleMetric);

    return () => {
      window.removeEventListener("slacklite:performance-metric", handleMetric);
    };
  }, []);

  if (process.env.NODE_ENV !== "development" || metrics.length === 0) {
    return null;
  }

  return (
    <aside
      className="fixed bottom-3 right-3 z-[9999] w-80 rounded border border-gray-400 bg-white/95 p-3 text-xs shadow-lg backdrop-blur"
      aria-label="Performance dashboard"
    >
      <h2 className="font-semibold text-gray-900">Performance Monitor</h2>
      <ul className="mt-2 space-y-1.5">
        {metrics.map((metric) => (
          <li
            key={`${metric.metric}-${metric.timestamp}-${metric.value}`}
            className="rounded border border-gray-300 bg-gray-50 px-2 py-1"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-medium text-gray-900">{metric.metric}</span>
              <span
                className={`font-semibold ${
                  metric.status === "degraded" ? "text-error" : "text-success"
                }`}
              >
                {formatValue(metric.value, metric.unit)}
              </span>
            </div>
            {typeof metric.target === "number" ? (
              <p className="text-[11px] text-gray-600">
                target: {formatValue(metric.target, metric.unit)}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default PerformanceDashboard;
