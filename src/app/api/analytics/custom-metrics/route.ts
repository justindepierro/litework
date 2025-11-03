import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from '@/lib/auth-server';

interface CustomMetricData {
  name: string;
  value: number;
  timestamp: number;
  context?: Record<string, string | number | boolean>;
}

// In-memory storage for demo (replace with database in production)
const customMetricsData: (CustomMetricData & { userId: string })[] = [];

export async function POST(request: NextRequest) {
  const { user, error: authError } = await getAuthenticatedUser();
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: authError || 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const metric: CustomMetricData = await request.json();

      // Validate the data
      if (!metric.name || typeof metric.value !== "number") {
        return NextResponse.json(
          { error: "Invalid custom metric data" },
          { status: 400 }
        );
      }

      // Add metadata
      const enrichedMetric = {
        ...metric,
        userId: user.id,
        timestamp: Date.now(),
      };

      // Store the metric
      customMetricsData.push(enrichedMetric);

      // Keep only the last 1000 entries
      if (customMetricsData.length > 1000) {
        customMetricsData.splice(0, customMetricsData.length - 1000);
      }
      
      return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error storing custom metric:", error);
    return NextResponse.json(
      { error: "Failed to store custom metric" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { user, error: authError } = await getAuthenticatedUser();
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: authError || 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const url = new URL(request.url);
    const metricName = url.searchParams.get("name");
    const limit = parseInt(url.searchParams.get("limit") || "100");
    const timeframe = url.searchParams.get("timeframe") || "24h";

      // Calculate time filter
      const now = Date.now();
      const timeFilters = {
        "1h": now - 1 * 60 * 60 * 1000,
        "24h": now - 24 * 60 * 60 * 1000,
        "7d": now - 7 * 24 * 60 * 60 * 1000,
        "30d": now - 30 * 24 * 60 * 60 * 1000,
      };

      const timeFilter =
        timeFilters[timeframe as keyof typeof timeFilters] ||
        timeFilters["24h"];

      // Filter data
      let filteredData = customMetricsData.filter(
        (metric) => metric.timestamp >= timeFilter
      );

      if (metricName) {
        filteredData = filteredData.filter(
          (metric) => metric.name === metricName
        );
      }

      // Limit results
      filteredData = filteredData
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);

      // Calculate statistics
      const stats = {
        count: filteredData.length,
        averageValue:
          filteredData.length > 0
            ? filteredData.reduce((sum, metric) => sum + metric.value, 0) /
              filteredData.length
            : 0,
        minValue:
          filteredData.length > 0
            ? Math.min(...filteredData.map((m) => m.value))
            : 0,
        maxValue:
          filteredData.length > 0
            ? Math.max(...filteredData.map((m) => m.value))
            : 0,
      };

      return NextResponse.json({
        data: filteredData,
        stats,
        timeframe,
        metric: metricName || "all",
      });
    } catch (error) {
      console.error("Error retrieving custom metrics:", error);
      return NextResponse.json(
        { error: "Failed to retrieve custom metrics" },
        { status: 500 }
      );
    }
}
