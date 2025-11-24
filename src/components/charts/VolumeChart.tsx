"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { Heading, Body, Caption } from "@/components/ui/Typography";
import { TrendingUp, TrendingDown } from "lucide-react";

interface VolumeDataPoint {
  week: string;
  volume: number;
  displayWeek?: string;
}

interface VolumeChartProps {
  data: VolumeDataPoint[];
  className?: string;
}

export function VolumeChart({ data, className = "" }: VolumeChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card variant="default" padding="lg" className={className}>
        <Heading level="h3" className="mb-2">
          Training Volume
        </Heading>
        <Caption variant="muted">Weekly Total Volume</Caption>
        <Body variant="secondary" className="mt-4 text-center py-8">
          No volume data available yet. Complete more workouts to track your
          training volume!
        </Body>
      </Card>
    );
  }

  // Calculate trends
  const recentWeeks = data.slice(-4); // Last 4 weeks
  const olderWeeks = data.slice(-8, -4); // Previous 4 weeks
  const recentAvg =
    recentWeeks.reduce((sum, d) => sum + d.volume, 0) / recentWeeks.length;
  const olderAvg =
    olderWeeks.length > 0
      ? olderWeeks.reduce((sum, d) => sum + d.volume, 0) / olderWeeks.length
      : recentAvg;
  const trend = recentAvg - olderAvg;
  const trendPercent =
    olderAvg > 0 ? ((trend / olderAvg) * 100).toFixed(1) : "0";

  // Format data
  const chartData = data.map((point) => ({
    ...point,
    displayWeek: point.displayWeek || point.week,
    volumeInThousands: Math.round(point.volume / 1000),
  }));

  const maxVolume = Math.max(...data.map((d) => d.volume));
  const avgVolume = Math.round(
    data.reduce((sum, d) => sum + d.volume, 0) / data.length
  );

  return (
    <Card variant="default" padding="lg" className={className}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <Heading level="h3" className="mb-1">
            Training Volume
          </Heading>
          <Caption variant="muted">
            Total weight lifted per week (sets × reps × weight)
          </Caption>
        </div>
        {trend !== 0 && (
          <div className="text-right">
            <div
              className={`flex items-center gap-1 font-semibold ${
                trend > 0 ? "text-success" : "text-warning"
              }`}
            >
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>
                {trend > 0 ? "+" : ""}
                {trendPercent}%
              </span>
            </div>
            <Caption variant="muted">vs previous 4 weeks</Caption>
          </div>
        )}
      </div>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 10, bottom: 5, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5E7EB"
              vertical={false}
            />
            <XAxis
              dataKey="displayWeek"
              stroke="#6B7280"
              fontSize={12}
              tick={{ fill: "#6B7280" }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              stroke="#6B7280"
              fontSize={12}
              tick={{ fill: "#6B7280" }}
              label={{
                value: "Volume (1000 lbs)",
                angle: -90,
                position: "insideLeft",
                style: { fill: "#6B7280", fontSize: 12 },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                padding: "8px 12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
              labelFormatter={(value) => `Week of ${value}`}
              formatter={(value: number) => [
                `${(value * 1000).toLocaleString()} lbs`,
                "Volume",
              ]}
            />
            <Bar
              dataKey="volumeInThousands"
              fill="#3B82F6"
              radius={[8, 8, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-silver-300">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <Body className="font-semibold text-navy-900">
              {Math.round(avgVolume / 1000)}k
            </Body>
            <Caption variant="muted">Avg/Week</Caption>
          </div>
          <div>
            <Body className="font-semibold text-primary">
              {Math.round(maxVolume / 1000)}k
            </Body>
            <Caption variant="muted">Peak Week</Caption>
          </div>
          <div>
            <Body className="font-semibold text-navy-900">{data.length}</Body>
            <Caption variant="muted">Weeks</Caption>
          </div>
        </div>
      </div>
    </Card>
  );
}
