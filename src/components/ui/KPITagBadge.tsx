import React from "react";

/**
 * KPITagBadge Component
 * 
 * Displays a KPI tag badge with custom color and styling.
 * Used to show which KPI an exercise is associated with.
 * 
 * Example: <KPITagBadge name="BENCH" displayName="Bench Press" color="#EF4444" />
 */

interface KPITagBadgeProps {
  name: string; // Uppercase identifier (e.g., "BENCH")
  displayName: string; // Human-readable name (e.g., "Bench Press")
  color: string; // Hex color
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}

export function KPITagBadge({
  name,
  displayName,
  color,
  size = "md",
  showTooltip = true,
  onClick,
  onRemove,
}: KPITagBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const badge = (
    <span
      className={`
        inline-flex items-center gap-1.5 
        ${sizeClasses[size]}
        rounded-full font-medium
        transition-all duration-200
        ${onClick ? "cursor-pointer hover:opacity-80" : ""}
      `}
      style={{
        backgroundColor: `${color}20`, // 20% opacity background
        color: color,
        border: `1.5px solid ${color}`,
      }}
      onClick={onClick}
      title={showTooltip ? displayName : undefined}
    >
      <span className="font-bold">{name}</span>
      
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
          aria-label={`Remove ${displayName} tag`}
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  );

  return badge;
}

/**
 * KPITagList Component
 * 
 * Displays multiple KPI tags in a row with proper spacing.
 */

interface KPITagListProps {
  tags: Array<{
    id: string;
    name: string;
    displayName: string;
    color: string;
  }>;
  size?: "sm" | "md" | "lg";
  onTagClick?: (tagId: string) => void;
  onTagRemove?: (tagId: string) => void;
  maxDisplay?: number; // Show "+X more" if more tags
}

export function KPITagList({
  tags,
  size = "sm",
  onTagClick,
  onTagRemove,
  maxDisplay,
}: KPITagListProps) {
  if (tags.length === 0) return null;

  const displayTags = maxDisplay ? tags.slice(0, maxDisplay) : tags;
  const remainingCount = maxDisplay ? tags.length - maxDisplay : 0;

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {displayTags.map((tag) => (
        <KPITagBadge
          key={tag.id}
          name={tag.name}
          displayName={tag.displayName}
          color={tag.color}
          size={size}
          onClick={onTagClick ? () => onTagClick(tag.id) : undefined}
          onRemove={onTagRemove ? () => onTagRemove(tag.id) : undefined}
        />
      ))}
      
      {remainingCount > 0 && (
        <span className="text-xs text-silver-600 font-medium">
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}

/**
 * KPITagSelector Component
 * 
 * Dropdown selector for adding KPI tags to an exercise.
 * Shows available tags with search and current selections.
 */

interface KPITagSelectorProps {
  availableTags: Array<{
    id: string;
    name: string;
    displayName: string;
    color: string;
    description?: string;
  }>;
  selectedTagIds: string[];
  onTagToggle: (tagId: string) => void;
  label?: string;
}

export function KPITagSelector({
  availableTags,
  selectedTagIds,
  onTagToggle,
  label = "KPI Tags",
}: KPITagSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredTags = availableTags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedTags = availableTags.filter((tag) =>
    selectedTagIds.includes(tag.id)
  );

  return (
    <div className="relative">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-silver-700 mb-1">
          {label}
        </label>
      )}

      {/* Selected tags display */}
      <div className="min-h-[42px] p-2 border border-silver-300 rounded-lg bg-white">
        {selectedTags.length > 0 ? (
          <KPITagList
            tags={selectedTags}
            size="sm"
            onTagRemove={onTagToggle}
          />
        ) : (
          <span className="text-sm text-silver-500">
            Click to add KPI tags...
          </span>
        )}
      </div>

      {/* Add tags button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="mt-2 text-sm text-accent-blue hover:text-accent-blue/80 font-medium"
      >
        {isOpen ? "Close" : "+ Add KPI Tag"}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-silver-300 rounded-lg shadow-lg max-h-80 overflow-auto">
          {/* Search */}
          <div className="p-3 border-b border-silver-200">
            <input
              type="text"
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-silver-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
            />
          </div>

          {/* Tag list */}
          <div className="p-2">
            {filteredTags.length > 0 ? (
              filteredTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => onTagToggle(tag.id)}
                    className={`
                      w-full p-3 rounded-lg text-left
                      hover:bg-silver-50 transition-colors
                      ${isSelected ? "bg-silver-100" : ""}
                    `}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <KPITagBadge
                          name={tag.name}
                          displayName={tag.displayName}
                          color={tag.color}
                          size="sm"
                          showTooltip={false}
                        />
                        <span className="text-sm font-medium text-silver-900">
                          {tag.displayName}
                        </span>
                      </div>
                      {isSelected && (
                        <svg
                          className="w-5 h-5 text-accent-blue"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    {tag.description && (
                      <p className="text-xs text-silver-600 mt-1">
                        {tag.description}
                      </p>
                    )}
                  </button>
                );
              })
            ) : (
              <p className="p-4 text-sm text-silver-500 text-center">
                No tags found
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
