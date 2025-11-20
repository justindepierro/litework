"use client";

import { useState, useEffect, useCallback } from "react";
import { useAsyncState } from "@/hooks/use-async-state";
import {
  Search,
  Plus,
  Star,
  Clock,
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
import { EmptySearch, EmptyState } from "@/components/ui/EmptyState";
import { ModalBackdrop, ModalHeader } from "@/components/ui/Modal";

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
    color: "text-accent-orange-500",
    bgColor: "bg-accent-orange-50",
    borderColor: "border-accent-orange-200",
  },
  main: {
    label: "Main Lifts",
    icon: Dumbbell,
    color: "text-primary",
    bgColor: "bg-info-lightest",
    borderColor: "border-info-lighter",
  },
  accessory: {
    label: "Accessory",
    icon: Zap,
    color: "text-accent-purple-500",
    bgColor: "bg-accent-purple-50",
    borderColor: "border-accent-purple-200",
  },
  cooldown: {
    label: "Cool Down",
    icon: Wind,
    color: "text-success",
    bgColor: "bg-success-lightest",
    borderColor: "border-success-lighter",
  },
  custom: {
    label: "Custom",
    icon: Star,
    color: "text-neutral",
    bgColor: "bg-silver-200",
    borderColor: "border-silver-300",
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
  const { isLoading, error, execute } = useAsyncState<void>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "usage" | "recent">("usage");

  // Fetch blocks from API
  const fetchBlocks = useCallback(async () => {
    execute(async () => {
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
    });
  }, [selectedCategory, showFavoritesOnly, execute]);

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
    <ModalBackdrop isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <ModalHeader
          title="Workout Block Library"
          subtitle="Add reusable workout blocks to build your training session"
          onClose={onClose}
          icon={<TrendingUp className="w-7 h-7 text-primary" />}
          headerClassName="bg-gradient-to-r from-accent-blue-600 to-accent-blue-700 text-white border-b-0"
        />

        {/* Search and Filters */}
        <div className="p-4 border-b border-silver-300">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search blocks by name, description, or tags..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border-0 text-navy-900 placeholder-neutral focus:ring-2 focus:ring-white"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  showFavoritesOnly
                    ? "bg-warning text-navy-900"
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
                  className="px-4 py-3 bg-white text-primary rounded-lg font-medium hover:bg-info-lightest transition-colors flex items-center gap-2"
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
        <div className="flex gap-2 p-4 bg-silver-200 border-b overflow-x-auto">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === "all"
                ? "bg-accent-blue-500 text-white"
                : "bg-white text-neutral-darker hover:bg-silver-300"
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
                    : "bg-white text-neutral-darker hover:bg-silver-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {config.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-between px-6 py-3 bg-silver-200 border-b">
          <div className="text-sm text-neutral-dark">
            {filteredBlocks.length} block
            {filteredBlocks.length !== 1 ? "s" : ""} found
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-dark">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "name" | "usage" | "recent")
              }
              className="px-3 py-1 border border-silver-400 rounded-lg text-sm"
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
              <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
              <p className="text-error-dark text-lg font-semibold">{error}</p>
              <button
                onClick={fetchBlocks}
                className="mt-4 px-4 py-2 bg-accent-blue-500 text-white rounded-lg hover:bg-accent-blue-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredBlocks.length === 0 ? (
            blocks.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title="No workout blocks yet"
                description="Create your first workout block to build reusable training templates!"
                action={
                  onCreateBlock
                    ? {
                        label: "Create Your First Block",
                        onClick: onCreateBlock,
                        icon: <Plus className="w-4 h-4" />,
                      }
                    : undefined
                }
              />
            ) : (
              <EmptySearch
                searchTerm={searchQuery || selectedCategory || "your filters"}
                onClearSearch={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              />
            )
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
                        ? "border-primary ring-2 ring-info-lighter"
                        : "border-silver-300 hover:border-info-light"
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
                          <h3 className="font-bold text-navy-900 text-sm">
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
                            ? "text-warning"
                            : "text-neutral hover:text-warning"
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
                      <p className="text-sm text-neutral-dark mb-3 line-clamp-2">
                        {block.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-3 text-xs text-neutral">
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
                          <span className="px-2 py-1 text-neutral text-xs">
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
                          className="flex-1 px-3 py-1.5 text-xs bg-silver-300 hover:bg-silver-400 rounded transition-colors flex items-center justify-center gap-1"
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
                          className="flex-1 px-3 py-1.5 text-xs bg-silver-300 hover:bg-silver-400 rounded transition-colors flex items-center justify-center gap-1"
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
    </ModalBackdrop>
  );
}
