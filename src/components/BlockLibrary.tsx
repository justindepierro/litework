"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Star,
  Clock,
  X,
  Flame,
  Dumbbell,
  Wind,
  Zap,
  TrendingUp,
  Edit2,
  Copy,
  AlertCircle,
} from "lucide-react";
import { WorkoutBlock } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface BlockLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlock: (block: WorkoutBlock) => void;
  onCreateBlock?: () => void;
  selectedBlocks?: string[];
}

const CATEGORY_CONFIG = {
  warmup: {
    label: "Warm-up",
    icon: Flame,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  main: {
    label: "Main Lifts",
    icon: Dumbbell,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  accessory: {
    label: "Accessory",
    icon: Zap,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  cooldown: {
    label: "Cool Down",
    icon: Wind,
    color: "text-green-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  custom: {
    label: "Custom",
    icon: Star,
    color: "text-gray-500",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
  },
};

export default function BlockLibrary({
  isOpen,
  onClose,
  onSelectBlock,
  onCreateBlock,
  selectedBlocks = [],
}: BlockLibraryProps) {
  const [blocks, setBlocks] = useState<WorkoutBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "usage" | "recent">("usage");

  // Fetch blocks from API
  const fetchBlocks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }
      if (showFavoritesOnly) {
        params.append("favorites", "true");
      }

      const url = `/api/blocks${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please sign in to view workout blocks");
        }
        throw new Error(`Failed to fetch blocks: ${response.statusText}`);
      }

      const data = await response.json();
      setBlocks(data.blocks || []);
    } catch (err) {
      console.error("Error fetching blocks:", err);
      setError(err instanceof Error ? err.message : "Failed to load blocks");
      setBlocks([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, showFavoritesOnly]);

  // Fetch blocks when the modal opens or filters change
  useEffect(() => {
    if (isOpen) {
      fetchBlocks();
    }
  }, [isOpen, fetchBlocks]);

  // Toggle favorite status
  const toggleFavorite = async (blockId: string) => {
    try {
      const response = await fetch(`/api/blocks/${blockId}/favorite`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to toggle favorite");
      }

      // Optimistically update UI
      setBlocks((prevBlocks) =>
        prevBlocks.map((block) =>
          block.id === blockId
            ? { ...block, isFavorite: !block.isFavorite }
            : block
        )
      );
    } catch (err) {
      console.error("Error toggling favorite:", err);
      // Could add toast notification here
    }
  };

  // Filter and sort blocks
  const filteredBlocks = blocks
    .filter((block) => {
      if (!searchQuery) return true;

      const query = searchQuery.toLowerCase();
      return (
        block.name.toLowerCase().includes(query) ||
        block.description?.toLowerCase().includes(query) ||
        block.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "usage":
          return (b.usageCount || 0) - (a.usageCount || 0);
        case "recent":
          return (
            new Date(b.lastUsed || b.updatedAt).getTime() -
            new Date(a.lastUsed || a.updatedAt).getTime()
          );
        default:
          return 0;
      }
    });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-overlay z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-primary text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="w-7 h-7" />
                Workout Block Library
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Add reusable workout blocks to build your training session
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              aria-label="Close block library"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search blocks by name, description, or tags..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border-0 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-white"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  showFavoritesOnly
                    ? "bg-yellow-400 text-gray-900"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
                aria-label={
                  showFavoritesOnly ? "Show all blocks" : "Show favorites only"
                }
              >
                <Star
                  className={`w-4 h-4 ${showFavoritesOnly ? "fill-current" : ""}`}
                />
                Favorites
              </button>

              {onCreateBlock && (
                <button
                  onClick={onCreateBlock}
                  className="px-4 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
                  aria-label="Create new block"
                >
                  <Plus className="w-4 h-4" />
                  Create Block
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 p-4 bg-gray-50 border-b overflow-x-auto">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === "all"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            All Blocks ({blocks.length})
          </button>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            const count = blocks.filter((b) => b.category === key).length;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                  selectedCategory === key
                    ? `${config.bgColor} ${config.color} border ${config.borderColor}`
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                {config.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b">
          <div className="text-sm text-gray-600">
            {filteredBlocks.length} block
            {filteredBlocks.length !== 1 ? "s" : ""} found
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "name" | "usage" | "recent")
              }
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="usage">Most Used</option>
              <option value="recent">Recently Used</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        {/* Block Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="md" message="Loading blocks..." />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 text-lg font-semibold">{error}</p>
              <button
                onClick={fetchBlocks}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredBlocks.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No blocks found</p>
              <p className="text-gray-500 text-sm mt-1">
                {blocks.length === 0
                  ? "Create your first workout block to get started!"
                  : "Try adjusting your search or filters"}
              </p>
              {onCreateBlock && blocks.length === 0 && (
                <button
                  onClick={onCreateBlock}
                  className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Create Your First Block
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBlocks.map((block) => {
                const config = CATEGORY_CONFIG[block.category];
                const Icon = config.icon;
                const isSelected = selectedBlocks.includes(block.id);

                return (
                  <div
                    key={block.id}
                    className={`bg-white border-2 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer ${
                      isSelected
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => onSelectBlock(block)}
                  >
                    {/* Block Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-10 h-10 rounded-lg ${config.bgColor} ${config.color} flex items-center justify-center`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">
                            {block.name}
                          </h3>
                          <span
                            className={`text-xs ${config.color} font-medium`}
                          >
                            {config.label}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(block.id);
                        }}
                        className={`p-1 rounded transition-colors ${
                          block.isFavorite
                            ? "text-yellow-500"
                            : "text-gray-400 hover:text-yellow-500"
                        }`}
                        aria-label={
                          block.isFavorite
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                      >
                        <Star
                          className={`w-5 h-5 ${block.isFavorite ? "fill-current" : ""}`}
                        />
                      </button>
                    </div>

                    {/* Description */}
                    {block.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {block.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Dumbbell className="w-3 h-3" />
                        {block.exercises.length} exercises
                      </div>
                      {block.estimatedDuration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {block.estimatedDuration}min
                        </div>
                      )}
                      {block.usageCount !== undefined && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {block.usageCount} uses
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {block.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {block.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="neutral" size="sm">
                            {tag}
                          </Badge>
                        ))}
                        {block.tags.length > 3 && (
                          <span className="px-2 py-1 text-gray-500 text-xs">
                            +{block.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Template Badge */}
                    {block.isTemplate && (
                      <div className="mt-3 pt-3 border-t">
                        <Badge variant="info" size="sm">
                          <Star className="w-3 h-3 mr-1" />
                          Template
                        </Badge>
                      </div>
                    )}

                    {/* Quick Actions for custom blocks */}
                    {!block.isTemplate && (
                      <div className="flex gap-2 mt-3 pt-3 border-t">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle edit - would open block editor
                          }}
                          className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors flex items-center justify-center gap-1"
                          aria-label="Edit block"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle duplicate
                          }}
                          className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors flex items-center justify-center gap-1"
                          aria-label="Duplicate block"
                        >
                          <Copy className="w-3 h-3" />
                          Duplicate
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
