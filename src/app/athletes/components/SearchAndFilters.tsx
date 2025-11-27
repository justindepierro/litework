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
          className="w-full pl-12 pr-4 py-4 sm:py-3 text-base border-2 border-silver-400 rounded-xl focus:outline-none focus:ring-4 focus:ring-accent-blue-300 focus:border-accent-blue-500 shadow-sm focus:shadow-lg transition-all touch-manipulation"
        />
      </div>
      <div className="grid grid-cols-3 gap-2 sm:flex">
        {filterOptions.map((status, index) => {
          const gradients = [
            "bg-linear-to-br from-accent-purple-500 to-accent-pink-500",
            "bg-linear-to-br from-accent-green-500 to-accent-cyan-500",
            "bg-linear-to-br from-accent-amber-500 to-accent-orange-500",
          ];
          const inactiveGradients = [
            "bg-linear-to-br from-accent-purple-100 to-accent-purple-50 border-2 border-accent-purple-400 text-accent-purple-700",
            "bg-linear-to-br from-accent-green-100 to-accent-green-50 border-2 border-accent-green-400 text-accent-green-700",
            "bg-linear-to-br from-accent-amber-100 to-accent-amber-50 border-2 border-accent-amber-400 text-accent-amber-700",
          ];
          return (
            <button
              key={status}
              onClick={() => onStatusFilterChange(status)}
              className={`px-4 py-4 sm:py-3 text-sm font-bold rounded-xl transition-all touch-manipulation shadow-md hover:shadow-lg hover:scale-105 ${
                statusFilter === status
                  ? `${gradients[index]} text-white`
                  : inactiveGradients[index]
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
