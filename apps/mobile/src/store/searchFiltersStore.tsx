import { PropertySearchFilters } from "@lando/shared";
import { createContext, useContext, useMemo, useState } from "react";

interface SearchFiltersContextValue {
  filters: PropertySearchFilters;
  setFilters: (filters: PropertySearchFilters) => void;
  activeCount: number;
}

const SearchFiltersContext = createContext<SearchFiltersContextValue | undefined>(undefined);

function countActiveFilters(filters: PropertySearchFilters): number {
  let count = 0;
  if (filters.type) count += 1;
  if (filters.priceMin !== undefined || filters.priceMax !== undefined) count += 1;
  if (filters.landCondition) count += 1;
  if (filters.roadWidthMin !== undefined) count += 1;
  if (filters.nearby && filters.nearby.length > 0) count += 1;
  if (filters.town) count += 1;
  return count;
}

export function SearchFiltersProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<PropertySearchFilters>({});

  const value = useMemo<SearchFiltersContextValue>(
    () => ({ filters, setFilters, activeCount: countActiveFilters(filters) }),
    [filters]
  );

  return <SearchFiltersContext.Provider value={value}>{children}</SearchFiltersContext.Provider>;
}

export function useSearchFilters(): SearchFiltersContextValue {
  const ctx = useContext(SearchFiltersContext);
  if (!ctx) {
    throw new Error("useSearchFilters must be used within a SearchFiltersProvider");
  }
  return ctx;
}
