import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";

interface WebVitalData {
  name: string;
  value: number;
  rating: string;
  delta: number;
  id: string;
  timestamp: number;
  url: string;
  userAgent: string;
  connectionType?: string;
}

// In-memory storage for demo (replace with database in production)
const webVitalsData: WebVitalData[] = [];

export async function POST(request: NextRequest) {
  const { user, error: authError } = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: authError || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const webVital: WebVitalData = await request.json();

    // Validate the data
    if (!webVital.name || typeof webVital.value !== "number") {
      return NextResponse.json(
        { error: "Invalid web vital data" },
        { status: 400 }
      );
    }

    // Add metadata
    const enrichedVital = {
      ...webVital,
      userId: user.id,
      timestamp: Date.now(),
    };

    // Store the metric (in production, save to database)
    webVitalsData.push(enrichedVital);

    // Keep only the last 1000 entries to prevent memory issues
    if (webVitalsData.length > 1000) {
      webVitalsData.splice(0, webVitalsData.length - 1000);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error storing web vital:", error);
    return NextResponse.json(
      { error: "Failed to store web vital" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { user, error: authError } = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: authError || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const url = new URL(request.url);
    const metric = url.searchParams.get("metric");
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
      timeFilters[timeframe as keyof typeof timeFilters] || timeFilters["24h"];

    // Filter data
    let filteredData = webVitalsData.filter(
      (vital) => vital.timestamp >= timeFilter
    );

    if (metric) {
      filteredData = filteredData.filter((vital) => vital.name === metric);
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
          ? filteredData.reduce((sum, vital) => sum + vital.value, 0) /
            filteredData.length
          : 0,
      ratings: {
        good: filteredData.filter((v) => v.rating === "good").length,
        "needs-improvement": filteredData.filter(
          (v) => v.rating === "needs-improvement"
        ).length,
        poor: filteredData.filter((v) => v.rating === "poor").length,
      },
    };

    return NextResponse.json({
      data: filteredData,
      stats,
      timeframe,
      metric: metric || "all",
    });
  } catch (error) {
    console.error("Error retrieving web vitals:", error);
    return NextResponse.json(
      { error: "Failed to retrieve web vitals" },
      { status: 500 }
    );
  }
}
