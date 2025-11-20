"use client";

import React, {
  memo,
  useMemo,
  useCallback,
  useState,
  useRef,
  useEffect,
} from "react";

// ===========================
// REACT PERFORMANCE SHOWCASE
// ===========================

// Types for demo data
interface DemoItem {
  id: string;
  name: string;
  description: string;
}

// 1. Memoized List Item Component
const OptimizedListItem = memo(function OptimizedListItem({
  item,
  onToggle,
  isSelected,
}: {
  item: DemoItem;
  onToggle: (id: string) => void;
  isSelected: boolean;
}) {
  // Memoize the toggle handler to prevent recreating on each render
  const handleToggle = useCallback(() => {
    onToggle(item.id);
  }, [item.id, onToggle]);

  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-all ${
        isSelected
          ? "bg-info-lighter border-info-light"
          : "bg-white border-silver-300 hover:border-silver-400"
      }`}
      onClick={handleToggle}
    >
      <h3 className="font-medium text-primary">{item.name}</h3>
      <p className="text-sm text-secondary mt-1">{item.description}</p>
    </div>
  );
});

// 2. Virtual Scrolling Component for Large Lists
function VirtualizedList<T>({
  items,
  itemHeight = 100,
  containerHeight = 400,
  renderItem,
}: {
  items: T[];
  itemHeight?: number;
  containerHeight?: number;
  renderItem: (item: T) => React.ReactNode;
}) {
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(start + visibleCount + 2, items.length); // +2 for buffer

    return { start: Math.max(0, start - 1), end }; // -1 for buffer
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return (
    <div
      className="overflow-auto border rounded-lg"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div
              key={visibleRange.start + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 3. Optimized Search Component with proper debouncing
const OptimizedSearch = memo(function OptimizedSearch({
  onSearch,
  placeholder = "Search...",
}: {
  onSearch: (query: string) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        onSearch(value);
      }, 300);
    },
    [onSearch]
  );

  return (
    <input
      type="text"
      value={query}
      onChange={handleInputChange}
      placeholder={placeholder}
      className="w-full px-4 py-2 border border-silver-300 rounded-lg focus:ring-2 focus:ring-info focus:border-info"
    />
  );
});

// 4. Main Performance Demo Component
const ReactPerformanceDemo = memo(function ReactPerformanceDemo() {
  // Generate sample data
  const sampleData = useMemo(
    (): DemoItem[] =>
      Array.from({ length: 1000 }, (_, i) => ({
        id: `item-${i}`,
        name: `Workout Item ${i + 1}`,
        description: `This is a sample workout description for item ${i + 1}. It demonstrates performance optimization.`,
      })),
    []
  );

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Filtered data based on search
  const filteredData = useMemo(() => {
    if (!searchQuery) return sampleData;
    return sampleData.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sampleData, searchQuery]);

  // Optimized toggle handler
  const handleToggleItem = useCallback((id: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Render item function for virtualized list
  const renderItem = useCallback(
    (item: DemoItem) => (
      <OptimizedListItem
        key={item.id}
        item={item}
        onToggle={handleToggleItem}
        isSelected={selectedItems.has(item.id)}
      />
    ),
    [handleToggleItem, selectedItems]
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        React Performance Optimizations Demo
      </h1>

      <div className="space-y-6">
        {/* Search Performance Demo */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Debounced Search</h2>
          <OptimizedSearch
            onSearch={handleSearch}
            placeholder="Search workouts..."
          />
          <p className="text-sm text-secondary mt-2">
            Search queries are debounced by 300ms to reduce unnecessary
            re-renders
          </p>
        </div>

        {/* Selected Items Counter */}
        <div className="bg-info-lighter p-4 rounded-lg">
          <p className="text-info-dark">
            Selected: {selectedItems.size} items | Showing:{" "}
            {filteredData.length} / {sampleData.length} items
          </p>
        </div>

        {/* Virtual Scrolling Demo */}
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Virtualized List (Renders only visible items)
          </h2>
          <VirtualizedList
            items={filteredData}
            itemHeight={100}
            containerHeight={400}
            renderItem={renderItem}
          />
          <p className="text-sm text-[var(--color-text-secondary)] mt-2">
            Only visible items are rendered in the DOM for optimal performance
            with large datasets
          </p>
        </div>

        {/* Performance Tips */}
        <div className="bg-[var(--color-silver-200)] p-4 rounded-lg">
          <h3 className="font-semibold mb-2">
            Performance Optimizations Used:
          </h3>
          <ul className="text-sm text-[var(--color-text-primary)] space-y-1">
            <li>
              • <strong>React.memo</strong>: Prevents unnecessary re-renders
            </li>
            <li>
              • <strong>useMemo</strong>: Memoizes expensive calculations
            </li>
            <li>
              • <strong>useCallback</strong>: Prevents function recreation on
              each render
            </li>
            <li>
              • <strong>Virtual Scrolling</strong>: Renders only visible items
            </li>
            <li>
              • <strong>Debounced Search</strong>: Reduces API calls and
              re-renders
            </li>
            <li>
              • <strong>Efficient State Updates</strong>: Uses functional
              updates
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
});

export default ReactPerformanceDemo;
