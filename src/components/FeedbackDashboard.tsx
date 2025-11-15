"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Heading, Body, Label } from "@/components/ui/Typography";
import { useAsyncState } from "@/hooks/use-async-state";
import {
  MessageSquare,
  TrendingUp,
  Activity,
  Zap,
  Download,
  User,
  Search,
} from "lucide-react";

interface FeedbackItem {
  id: string;
  session_id: string;
  difficulty_rating: number;
  soreness_rating: number;
  energy_level: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  athlete: {
    id: string;
    name: string;
    email: string;
  };
  workout: {
    name: string;
    completed_at: string;
  };
}

interface FeedbackDashboardProps {
  athleteId?: string; // Optional: filter by specific athlete
}

const RatingBadge = ({
  rating,
  type,
}: {
  rating: number;
  type: "difficulty" | "soreness" | "energy";
}) => {
  const getVariant = (): "primary" | "success" | "warning" | "neutral" => {
    if (type === "energy") {
      // Energy: higher is better
      if (rating >= 4) return "success";
      if (rating === 3) return "neutral";
      return "warning";
    } else {
      // Difficulty & Soreness: middle is better
      if (rating === 3) return "success";
      if (rating === 2 || rating === 4) return "neutral";
      return "warning";
    }
  };

  const getLabel = () => {
    if (type === "difficulty") {
      const labels = ["Too Easy", "Easy", "Just Right", "Hard", "Too Hard"];
      return labels[rating - 1];
    }
    if (type === "soreness") {
      const labels = ["None", "Mild", "Moderate", "Sore", "Very Sore"];
      return labels[rating - 1];
    }
    // energy
    const labels = ["Very Low", "Low", "Normal", "High", "Very High"];
    return labels[rating - 1];
  };

  return (
    <Badge variant={getVariant()}>
      {rating} - {getLabel()}
    </Badge>
  );
};

export function FeedbackDashboard({ athleteId }: FeedbackDashboardProps) {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<FeedbackItem[]>([]);
  const { isLoading, error, execute } = useAsyncState<FeedbackItem[]>();

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAthlete, setSelectedAthlete] = useState<string>(
    athleteId || ""
  );
  const [dateRange, setDateRange] = useState<"all" | "week" | "month">("all");

  // Fetch feedback from API
  useEffect(() => {
    const fetchFeedback = () =>
      execute(async () => {
        const params = new URLSearchParams();
        if (selectedAthlete) {
          params.append("athleteId", selectedAthlete);
        }

        // Add date filters
        if (dateRange === "week") {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          params.append("startDate", weekAgo.toISOString());
        } else if (dateRange === "month") {
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          params.append("startDate", monthAgo.toISOString());
        }

        const response = await fetch(`/api/feedback?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch feedback");
        }

        const feedbackData = data.feedback || [];
        setFeedback(feedbackData);
        setFilteredFeedback(feedbackData);
        return feedbackData;
      });

    fetchFeedback();
  }, [selectedAthlete, dateRange, execute]);

  // Apply search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFeedback(feedback);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = feedback.filter(
      (item) =>
        item.athlete.name.toLowerCase().includes(query) ||
        item.workout.name.toLowerCase().includes(query) ||
        item.notes?.toLowerCase().includes(query)
    );
    setFilteredFeedback(filtered);
  }, [searchQuery, feedback]);

  // Get unique athletes for filter
  const uniqueAthletes = Array.from(
    new Map(feedback.map((item) => [item.athlete.id, item.athlete])).values()
  );

  // Calculate summary stats
  const avgDifficulty =
    feedback.length > 0
      ? (
          feedback.reduce((sum, item) => sum + item.difficulty_rating, 0) /
          feedback.length
        ).toFixed(1)
      : "N/A";

  const avgSoreness =
    feedback.length > 0
      ? (
          feedback.reduce((sum, item) => sum + item.soreness_rating, 0) /
          feedback.length
        ).toFixed(1)
      : "N/A";

  const avgEnergy =
    feedback.length > 0
      ? (
          feedback.reduce((sum, item) => sum + item.energy_level, 0) /
          feedback.length
        ).toFixed(1)
      : "N/A";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="p-6 text-center">
          <Body variant="error">{error}</Body>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h2">Workout Feedback</Heading>
          <Body variant="secondary">
            Review athlete feedback to adjust training programs
          </Body>
        </div>
        <Button variant="secondary" size="sm">
          <Download size={16} className="mr-2" />
          Export
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-primary-50 rounded-lg">
              <TrendingUp className="text-primary" size={24} />
            </div>
            <div>
              <Body variant="tertiary" size="sm">
                Avg Difficulty
              </Body>
              <Heading level="h3">{avgDifficulty} / 5</Heading>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-warning-50 rounded-lg">
              <Activity className="text-warning-600" size={24} />
            </div>
            <div>
              <Body variant="tertiary" size="sm">
                Avg Soreness
              </Body>
              <Heading level="h3">{avgSoreness} / 5</Heading>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 bg-success-50 rounded-lg">
              <Zap className="text-success-600" size={24} />
            </div>
            <div>
              <Body variant="tertiary" size="sm">
                Avg Energy
              </Body>
              <Heading level="h3">{avgEnergy} / 5</Heading>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-silver-400"
                size={16}
              />
              <Input
                id="search"
                type="text"
                placeholder="Search athlete, workout, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {!athleteId && (
            <div>
              <Label htmlFor="athlete">Athlete</Label>
              <Select
                id="athlete"
                value={selectedAthlete}
                onChange={(e) => setSelectedAthlete(e.target.value)}
                options={[
                  { value: "", label: "All Athletes" },
                  ...uniqueAthletes.map((athlete) => ({
                    value: athlete.id,
                    label: athlete.name,
                  })),
                ]}
              />
            </div>
          )}

          <div>
            <Label htmlFor="dateRange">Date Range</Label>
            <Select
              id="dateRange"
              value={dateRange}
              onChange={(e) =>
                setDateRange(e.target.value as "all" | "week" | "month")
              }
              options={[
                { value: "all", label: "All Time" },
                { value: "week", label: "Last 7 Days" },
                { value: "month", label: "Last 30 Days" },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.length === 0 ? (
          <Card>
            <div className="p-12 text-center">
              <MessageSquare
                className="mx-auto mb-4 text-silver-400"
                size={48}
              />
              <Heading level="h3" className="mb-2">
                No Feedback Yet
              </Heading>
              <Body variant="secondary">
                {searchQuery
                  ? "No feedback matches your search."
                  : "Athletes haven't submitted any feedback yet."}
              </Body>
            </div>
          </Card>
        ) : (
          filteredFeedback.map((item) => (
            <Card key={item.id}>
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User size={16} className="text-silver-400" />
                      <Heading level="h4">{item.athlete.name}</Heading>
                    </div>
                    <Body variant="secondary" size="sm">
                      {item.workout.name}
                    </Body>
                  </div>
                  <div className="text-right">
                    <Body variant="tertiary" size="sm">
                      {new Date(item.workout.completed_at).toLocaleDateString()}
                    </Body>
                    <Body variant="tertiary" size="xs">
                      {new Date(item.workout.completed_at).toLocaleTimeString(
                        [],
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                    </Body>
                  </div>
                </div>

                {/* Ratings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label className="mb-2">Difficulty</Label>
                    <RatingBadge
                      rating={item.difficulty_rating}
                      type="difficulty"
                    />
                  </div>
                  <div>
                    <Label className="mb-2">Soreness</Label>
                    <RatingBadge
                      rating={item.soreness_rating}
                      type="soreness"
                    />
                  </div>
                  <div>
                    <Label className="mb-2">Energy</Label>
                    <RatingBadge rating={item.energy_level} type="energy" />
                  </div>
                </div>

                {/* Notes */}
                {item.notes && (
                  <div className="mt-4 p-4 bg-silver-50 rounded-lg border border-silver-200">
                    <Label className="mb-2">Notes</Label>
                    <Body>{item.notes}</Body>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
