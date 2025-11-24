"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { Heading, Body, Caption } from "@/components/ui/Typography";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface DataPoint {
  date: string;
  weight: number;
  displayDate?: string;
}

interface OneRMProgressChartProps {
  exerciseName: string;
  data: DataPoint[];
  className?: string;
}

export function OneRMProgressChart({
  exerciseName,
  data,
  className = "",
}: OneRMProgressChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card variant="default" padding="lg" className={className}>
        <Heading level="h3" className="mb-2">
          {exerciseName}
        </Heading>
        <Caption variant="muted">1RM Progress</Caption>
        <Body variant="secondary" className="mt-4 text-center py-8">
          No data available yet. Complete more workouts to see your progress!
        </Body>
      </Card>
    );
  }

  // Calculate improvement metrics
  const latestWeight = data[data.length - 1]?.weight || 0;
  const earliestWeight = data[0]?.weight || 0;
  const improvement = latestWeight - earliestWeight;
  const improvementPercent =
    earliestWeight > 0
      ? ((improvement / earliestWeight) * 100).toFixed(1)
      : "0";

  const TrendIcon =
    improvement > 0 ? TrendingUp : improvement < 0 ? TrendingDown : Minus;
  const trendColor =
    improvement > 0
      ? "text-success"
      : improvement < 0
        ? "text-error"
        : "text-navy-600";

  // Format data for chart
  const chartData = data.map((point) => ({
    ...point,
    displayDate:
      point.displayDate ||
      new Date(point.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
  }));

  return (
    <Card variant="default" padding="lg" className={className}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <Heading level="h3" className="mb-1">
            {exerciseName}
          </Heading>
          <Caption variant="muted">1RM Estimated Max</Caption>
        </div>
        {improvement !== 0 && (
          <div className="text-right">
            <div
              className={`flex items-center gap-1 ${trendColor} font-semibold`}
            >
              <TrendIcon className="w-4 h-4" />
              <span>
                {improvement > 0 ? "+" : ""}
                {improvement} lbs
              </span>
            </div>
            <Caption variant="muted">
              {improvement > 0 ? "+" : ""}
              {improvementPercent}%
            </Caption>
          </div>
        )}
      </div>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 10, bottom: 5, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="displayDate"
              stroke="#6B7280"
              fontSize={12}
              tick={{ fill: "#6B7280" }}
            />
            <YAxis
              stroke="#6B7280"
              fontSize={12}
              tick={{ fill: "#6B7280" }}
              domain={["dataMin - 10", "dataMax + 10"]}
              label={{
                value: "Weight (lbs)",
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
              labelFormatter={(value) => `Date: ${value}`}
              formatter={(value: number) => [`${value} lbs`, "Est. 1RM"]}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ fill: "#3B82F6", r: 4 }}
              activeDot={{ r: 6, fill: "#2563EB" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-silver-300">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <Body className="font-semibold text-navy-900">
              {earliestWeight} lbs
            </Body>
            <Caption variant="muted">Starting</Caption>
          </div>
          <div>
            <Body className="font-semibold text-primary">
              {latestWeight} lbs
            </Body>
            <Caption variant="muted">Current</Caption>
          </div>
          <div>
            <Body className="font-semibold text-navy-900">{data.length}</Body>
            <Caption variant="muted">Data Points</Caption>
          </div>
        </div>
      </div>
    </Card>
  );
}
