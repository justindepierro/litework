"use client";

import dynamic from "next/dynamic";

// Lazy load analytics components to improve initial load time
const Analytics = dynamic(
  () => import("@vercel/analytics/react").then((mod) => mod.Analytics),
  { ssr: false }
);

const SpeedInsights = dynamic(
  () => import("@vercel/speed-insights/next").then((mod) => mod.SpeedInsights),
  { ssr: false }
);

const WebVitalsTracker = dynamic(
  () =>
    import("@/components/WebVitalsTracker").then((mod) => mod.WebVitalsTracker),
  { ssr: false }
);

/**
 * Client-side analytics wrapper
 * Lazy loads analytics scripts to improve initial page load performance
 */
export function AnalyticsWrapper() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
      <WebVitalsTracker />
    </>
  );
}
