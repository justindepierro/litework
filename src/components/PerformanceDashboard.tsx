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
        return "text-green-600 bg-green-50 border-green-200";
      case "needs-improvement":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "poor":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-silver-300";
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
    if (score >= 90) return "text-green-600";
    if (score >= 50) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 90) return "from-green-500 to-green-600";
    if (score >= 50) return "from-orange-500 to-orange-600";
    return "from-red-500 to-red-600";
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <Gauge className="w-6 h-6 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">
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
              stroke="#f3f4f6"
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
              <div className="text-xs text-gray-500 font-medium">SCORE</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 flex items-center gap-1">
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Performance Dashboard
            </h1>
            <p className="text-gray-600">
              Monitor Core Web Vitals and application performance metrics
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Performance Score */}
        <PerformanceScore score={score} />

        {/* Core Web Vitals */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-600" />
            Core Web Vitals
          </h2>

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
            <div className="bg-gray-50 border border-silver-300 rounded-lg p-8 text-center">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Web Vitals Data Yet
              </h3>
              <p className="text-gray-600">
                Performance metrics will appear as you interact with the
                application.
              </p>
            </div>
          )}
        </div>

        {/* Resource Performance */}
        {metrics && metrics.resourceTiming.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-green-600" />
              Resource Performance
            </h2>

            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="p-4 border-b border-silver-300">
                <h3 className="font-medium text-gray-900">
                  Resource Loading Times
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Resource
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Duration
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Size
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Cached
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {metrics.resourceTiming
                      .slice(0, 10)
                      .map((resource, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900 truncate max-w-xs">
                            {resource.name.split("/").pop()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <Badge variant="info" size="sm">
                              {resource.type}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {Math.round(resource.duration)}ms
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {resource.size > 0
                              ? `${(resource.size / 1024).toFixed(1)}KB`
                              : "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {resource.cached ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <span className="text-gray-400">No</span>
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-purple-600" />
              Navigation Timing
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">
                    DOM Content Loaded
                  </span>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {Math.round(metrics.navigationTiming.domContentLoaded)}ms
                </span>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">
                    Load Complete
                  </span>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {Math.round(metrics.navigationTiming.loadComplete)}ms
                </span>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">First Paint</span>
                </div>
                <span className="text-2xl font-bold text-orange-600">
                  {Math.round(metrics.navigationTiming.firstPaint)}ms
                </span>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">
                    Time to Interactive
                  </span>
                </div>
                <span className="text-2xl font-bold text-purple-600">
                  {Math.round(metrics.navigationTiming.timeToInteractive)}ms
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Memory Usage */}
        {metrics && metrics.memoryInfo && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-red-600" />
              Memory Usage
            </h2>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 mb-1">
                    {(metrics.memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(
                      1
                    )}
                    MB
                  </div>
                  <div className="text-sm text-gray-600">Used Heap Size</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {(metrics.memoryInfo.totalJSHeapSize / 1024 / 1024).toFixed(
                      1
                    )}
                    MB
                  </div>
                  <div className="text-sm text-gray-600">Total Heap Size</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {(metrics.memoryInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(
                      1
                    )}
                    MB
                  </div>
                  <div className="text-sm text-gray-600">Heap Size Limit</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(metrics.memoryInfo.usedJSHeapSize / metrics.memoryInfo.jsHeapSizeLimit) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Recent Activity
            </h2>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="space-y-3">
                {webVitalsHistory.slice(0, 5).map((vital, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-silver-300 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">
                        {vital.name}
                      </span>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          vital.rating === "good"
                            ? "bg-green-100 text-green-800"
                            : vital.rating === "needs-improvement"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {vital.rating}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {vital.name === "CLS"
                          ? vital.value.toFixed(3)
                          : `${Math.round(vital.value)}ms`}
                      </div>
                      <div className="text-xs text-gray-500">
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
