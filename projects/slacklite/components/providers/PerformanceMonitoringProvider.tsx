"use client";

import { useEffect } from "react";
import { initPerformanceMonitoring } from "@/lib/monitoring/performance";

export function PerformanceMonitoringProvider() {
  useEffect(() => {
    initPerformanceMonitoring();
  }, []);

  return null;
}

export default PerformanceMonitoringProvider;
