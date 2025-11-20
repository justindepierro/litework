"use client";

import React, { useState, useEffect } from "react";
import {
  usePerformanceMonitor,
  WebVitalMetric,
} from "@/lib/performance-monitor";
import {
  Activity,
  Zap,
  Clock,
  Gauge,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Heading, Body } from "@/components/ui/Typography";

interface WebVitalDisplayProps {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  unit: string;
  description: string;
  threshold: { good: number; poor: number };
}

const WebVitalCard: React.FC<WebVitalDisplayProps> = ({
  name,
  value,
  rating,
  unit,
  description,
  threshold,
}) => {
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "good":
        return "text-(--status-success) bg-(--status-success-light) border-(--status-success)";
      case "needs-improvement":
        return "text-(--status-warning) bg-(--status-warning-light) border-(--status-warning)";
      case "poor":
        return "text-(--status-error) bg-(--status-error-light) border-(--status-error)";
      default:
        return "text-(--text-secondary) bg-(--bg-secondary) border-(--border-primary)";
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case "good":
        return <CheckCircle className="w-5 h-5" />;
      case "needs-improvement":
        return <AlertTriangle className="w-5 h-5" />;
      case "poor":
        return <TrendingDown className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const formatValue = (val: number) => {
    if (unit === "ms") {
      return val < 1000
        ? `${Math.round(val)}ms`
        : `${(val / 1000).toFixed(1)}s`;
    }
    if (unit === "score") {
      return val.toFixed(3);
    }
    return `${Math.round(val)}${unit}`;
  };

  return (
    <div className={`border rounded-lg p-4 ${getRatingColor(rating)}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getRatingIcon(rating)}
          <span className="font-medium text-sm">{name}</span>
        </div>
        <span className="text-xs uppercase font-medium">
          {rating.replace("-", " ")}
        </span>
      </div>

      <div className="mb-2">
        <span className="text-2xl font-bold">{formatValue(value)}</span>
      </div>

      <p className="text-xs opacity-75 mb-2">{description}</p>

      <div className="flex justify-between text-xs opacity-60">
        <span>Good: ≤{formatValue(threshold.good)}</span>
        <span>Poor: &gt;{formatValue(threshold.poor)}</span>
      </div>
    </div>
  );
};

const PerformanceScore: React.FC<{ score: number }> = ({ score }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-(--status-success)";
    if (score >= 50) return "text-(--status-warning)";
    return "text-(--status-error)";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 90) return "from-accent-green-500 to-accent-green-600";
    if (score >= 50) return "from-accent-orange-500 to-accent-orange-600";
    return "from-error to-error-dark";
  };

  return (
    <div className="bg-surface rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <Gauge className="w-6 h-6 text-(--text-secondary)" />
        <h3 className="text-lg font-semibold text-(--text-primary)">
          Performance Score
        </h3>
      </div>

      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="rgb(var(--color-silver-200))"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2.51 * score} 251.2`}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop
                  offset="0%"
                  className={`stop-color-current ${getScoreGradient(score).split(" ")[0].replace("from-", "")}`}
                />
                <stop
                  offset="100%"
                  className={`stop-color-current ${getScoreGradient(score).split(" ")[1].replace("to-", "")}`}
                />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
                {score}
              </div>
              <div className="text-xs text-(--text-secondary) font-medium">
                SCORE
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-(--text-secondary) flex items-center gap-1">
          {score >= 90 && (
            <>
              <Zap className="w-4 h-4" />
              Excellent performance!
            </>
          )}
          {score >= 50 && score < 90 && (
            <>
              <TrendingUp className="w-4 h-4" />
              Good performance with room for improvement
            </>
          )}
          {score < 50 && (
            <>
              <AlertTriangle className="w-4 h-4" />
              Performance needs attention
            </>
          )}
        </p>
      </div>
    </div>
  );
};

const PerformanceDashboard: React.FC = () => {
  const { metrics, score, trackCustomMetric } = usePerformanceMonitor();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [webVitalsHistory, setWebVitalsHistory] = useState<WebVitalMetric[]>(
    []
  );

  // Fetch historical data
  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const response = await fetch(
          "/api/analytics/web-vitals?timeframe=24h&limit=50"
        );
        if (response.ok) {
          const data = await response.json();
          setWebVitalsHistory(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch historical data:", error);
      }
    };

    fetchHistoricalData();
  }, []);

  // Track page load time as custom metric
  useEffect(() => {
    const trackPageLoad = () => {
      if (performance.timing) {
        const loadTime =
          performance.timing.loadEventEnd - performance.timing.navigationStart;
        if (loadTime > 0) {
          trackCustomMetric("page_load_time", loadTime, {
            page: window.location.pathname,
          });
        }
      }
    };

    // Track after a short delay to ensure timing is complete
    setTimeout(trackPageLoad, 1000);
  }, [trackCustomMetric]);

  const handleRefresh = async () => {
    setIsRefreshing(true);

    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
      window.location.reload();
    }, 1000);
  };

  const webVitalsThresholds = {
    FCP: {
      good: 1800,
      poor: 3000,
      unit: "ms",
      description: "Time to first paint",
    },
    LCP: {
      good: 2500,
      poor: 4000,
      unit: "ms",
      description: "Largest content paint",
    },
    CLS: {
      good: 0.1,
      poor: 0.25,
      unit: "score",
      description: "Cumulative layout shift",
    },
    TTFB: {
      good: 800,
      poor: 1800,
      unit: "ms",
      description: "Time to first byte",
    },
    INP: {
      good: 200,
      poor: 500,
      unit: "ms",
      description: "Interaction to next paint",
    },
  };

  const getLatestWebVitals = () => {
    if (!metrics) return [];

    const latest = metrics.webVitals.reduce(
      (acc, vital) => {
        const existing = acc.find((v) => v.name === vital.name);
        if (!existing || vital.timestamp > existing.timestamp) {
          acc = acc.filter((v) => v.name !== vital.name);
          acc.push(vital);
        }
        return acc;
      },
      [] as typeof metrics.webVitals
    );

    return latest;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Heading level="h1" className="mb-2">
              Performance Dashboard
            </Heading>
            <Body variant="secondary">
              Monitor Core Web Vitals and application performance metrics
            </Body>
          </div>

          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="primary"
            isLoading={isRefreshing}
            loadingText="Refreshing..."
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
        </div>

        {/* Performance Score */}
        <PerformanceScore score={score} />

        {/* Core Web Vitals */}
        <div>
          <Heading level="h2" className="mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-(--accent-blue-600)" />
            Core Web Vitals
          </Heading>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getLatestWebVitals().map((vital) => {
              const threshold =
                webVitalsThresholds[
                  vital.name as keyof typeof webVitalsThresholds
                ];
              if (!threshold) return null;

              return (
                <WebVitalCard
                  key={vital.name}
                  name={vital.name}
                  value={vital.value}
                  rating={vital.rating}
                  unit={threshold.unit}
                  description={threshold.description}
                  threshold={threshold}
                />
              );
            })}
          </div>

          {getLatestWebVitals().length === 0 && (
            <div className="bg-(--bg-secondary) border border-silver-300 rounded-lg p-8 text-center">
              <Activity className="w-12 h-12 text-(--text-tertiary) mx-auto mb-4" />
              <h3 className="text-lg font-medium text-(--text-primary) mb-2">
                No Web Vitals Data Yet
              </h3>
              <Body variant="secondary">
                Performance metrics will appear as you interact with the
                application.
              </Body>
            </div>
          )}
        </div>

        {/* Resource Performance */}
        {metrics && metrics.resourceTiming.length > 0 && (
          <div>
            <Heading level="h2" className="mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-(--status-success)" />
              Resource Performance
            </Heading>

            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="p-4 border-b border-silver-300">
                <h3 className="font-medium text-(--text-primary)">
                  Resource Loading Times
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-(--bg-secondary)">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-(--text-secondary) uppercase">
                        Resource
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-(--text-secondary) uppercase">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-(--text-secondary) uppercase">
                        Duration
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-(--text-secondary) uppercase">
                        Size
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-(--text-secondary) uppercase">
                        Cached
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {metrics.resourceTiming
                      .slice(0, 10)
                      .map((resource, index) => (
                        <tr
                          key={index}
                          className="hover:bg-(--interactive-hover)"
                        >
                          <td className="px-4 py-3 text-sm text-(--text-primary) truncate max-w-xs">
                            {resource.name.split("/").pop()}
                          </td>
                          <td className="px-4 py-3 text-sm text-(--text-secondary)">
                            <Badge variant="info" size="sm">
                              {resource.type}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-(--text-primary)">
                            {Math.round(resource.duration)}ms
                          </td>
                          <td className="px-4 py-3 text-sm text-(--text-primary)">
                            {resource.size > 0
                              ? `${(resource.size / 1024).toFixed(1)}KB`
                              : "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {resource.cached ? (
                              <CheckCircle className="w-4 h-4 text-(--status-success)" />
                            ) : (
                              <span className="text-(--text-tertiary)">No</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Timing */}
        {metrics && (
          <div>
            <Heading level="h2" className="mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-(--accent-purple-600)" />
              Navigation Timing
            </Heading>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-(--accent-blue-500) rounded-full"></div>
                  <span className="font-medium text-(--text-primary)">
                    DOM Content Loaded
                  </span>
                </div>
                <span className="text-2xl font-bold text-(--accent-blue-600)">
                  {Math.round(metrics.navigationTiming.domContentLoaded)}ms
                </span>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-(--accent-green-500) rounded-full"></div>
                  <span className="font-medium text-(--text-primary)">
                    Load Complete
                  </span>
                </div>
                <span className="text-2xl font-bold text-(--status-success)">
                  {Math.round(metrics.navigationTiming.loadComplete)}ms
                </span>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-(--accent-orange-500) rounded-full"></div>
                  <span className="font-medium text-(--text-primary)">
                    First Paint
                  </span>
                </div>
                <span className="text-2xl font-bold text-(--accent-orange-600)">
                  {Math.round(metrics.navigationTiming.firstPaint)}ms
                </span>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-(--accent-purple-500) rounded-full"></div>
                  <span className="font-medium text-(--text-primary)">
                    Time to Interactive
                  </span>
                </div>
                <span className="text-2xl font-bold text-(--accent-purple-600)">
                  {Math.round(metrics.navigationTiming.timeToInteractive)}ms
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Memory Usage */}
        {metrics && metrics.memoryInfo && (
          <div>
            <Heading level="h2" className="mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-(--status-error)" />
              Memory Usage
            </Heading>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-(--status-error) mb-1">
                    {(metrics.memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(
                      1
                    )}
                    MB
                  </div>
                  <div className="text-sm text-(--text-secondary)">
                    Used Heap Size
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-(--accent-blue-600) mb-1">
                    {(metrics.memoryInfo.totalJSHeapSize / 1024 / 1024).toFixed(
                      1
                    )}
                    MB
                  </div>
                  <div className="text-sm text-(--text-secondary)">
                    Total Heap Size
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-(--status-success) mb-1">
                    {(metrics.memoryInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(
                      1
                    )}
                    MB
                  </div>
                  <div className="text-sm text-(--text-secondary)">
                    Heap Size Limit
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="bg-(--bg-tertiary) rounded-full h-2">
                  <div
                    className="bg-(--status-error) h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(metrics.memoryInfo.usedJSHeapSize / metrics.memoryInfo.jsHeapSizeLimit) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-(--text-secondary) mt-1">
                  <span>0MB</span>
                  <span>
                    {(metrics.memoryInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(
                      0
                    )}
                    MB
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {webVitalsHistory.length > 0 && (
          <div>
            <Heading level="h2" className="mb-4">
              Recent Activity
            </Heading>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="space-y-3">
                {webVitalsHistory.slice(0, 5).map((vital, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-silver-300 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-(--text-primary)">
                        {vital.name}
                      </span>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          vital.rating === "good"
                            ? "bg-(--status-success-light) text-(--status-success)"
                            : vital.rating === "needs-improvement"
                              ? "bg-(--status-warning-light) text-(--status-warning)"
                              : "bg-(--status-error-light) text-(--status-error)"
                        }`}
                      >
                        {vital.rating}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-(--text-primary)">
                        {vital.name === "CLS"
                          ? vital.value.toFixed(3)
                          : `${Math.round(vital.value)}ms`}
                      </div>
                      <div className="text-xs text-(--text-secondary)">
                        {formatTimestamp(vital.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceDashboard;
