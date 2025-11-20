"use client";

import { Search } from "lucide-react";

interface SearchAndFiltersProps {
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (status: string) => void;
}

/**
 * SearchAndFilters Component
 * Mobile-optimized search bar and status filter buttons
 */
export default function SearchAndFilters({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
}: SearchAndFiltersProps) {
  const filterOptions = ["all", "active", "invited"];

  return (
    <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary w-5 h-5" />
        <input
          type="text"
          placeholder="Search athletes..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-4 sm:py-3 text-base border border-silver-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent touch-manipulation"
        />
      </div>
      <div className="grid grid-cols-3 gap-2 sm:flex">
        {filterOptions.map((status) => (
          <button
            key={status}
            onClick={() => onStatusFilterChange(status)}
            className={`px-4 py-4 sm:py-3 text-sm font-medium rounded-xl transition-all touch-manipulation ${
              statusFilter === status
                ? "bg-accent-blue text-white shadow-md"
                : "bg-tertiary text-primary hover:bg-surface-active"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
