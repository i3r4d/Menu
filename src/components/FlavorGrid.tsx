import { useState, useEffect } from 'react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import FlavorCard from './FlavorCard'; // Ensure FlavorCard accepts currentCategoryType
import { Button } from '@/components/ui/button';
// Make sure Flavor and FilterOptions types are updated in '@/types/flavor'
import { Flavor, FilterOptions } from '@/types/flavor';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface FlavorGridProps {
  flavors: Flavor[];
  // --- TYPE UPDATED FOR ROBUSTNESS ---
  // Allow string generally, but expect 'E-Liquid' or 'Salt Nic'
  currentCategoryType: string;
  // --- END OF TYPE UPDATE ---
  title?: string;
}

// Helper to get min price from variants, returning Infinity if no variants/prices
const getMinPrice = (variants: Flavor['variants']): number => {
    if (!variants || variants.length === 0) return Infinity;
    // Filter variants by the currentCategoryType BEFORE finding min price
    // This ensures sorting uses the relevant price for the view
    const relevantVariants = variants.filter(v => v.type === currentCategoryType); // Assuming currentCategoryType is passed down
    if (relevantVariants.length === 0) return Infinity; // Or handle case where no variant matches type
    return Math.min(...relevantVariants.map(v => v.price ?? Infinity));
};
// Helper to get max price from variants, returning 0 if no variants/prices
const getMaxPrice = (variants: Flavor['variants']): number => {
    if (!variants || variants.length === 0) return 0;
    // Consider filtering by type here as well if max price should be context-specific
    // For the overall filter range, using the absolute max across all variants is usually fine.
    return Math.max(0, ...variants.map(v => v.price ?? 0)); // Ensure price is treated as 0 if null/undefined
};


const FlavorGrid = ({ flavors, currentCategoryType, title }: FlavorGridProps) => {
  // --- Calculate available filter options based on the NEW 'variants' structure ---
  // Filter options should probably be based on ALL variants, not just the currentCategoryType
  const availableBottleSizes = Array.from(new Set(
      flavors.flatMap(f => f.variants?.map(v => v.size) ?? [])
  )).sort();
  const availableNicLevels = Array.from(new Set(
      flavors.flatMap(f => f.variants?.flatMap(v => v.nicLevels) ?? [])
  )).filter(level => typeof level === 'number').sort((a, b) => a - b);
  const availableVgPgRatios = Array.from(new Set(
      flavors.map(f => f.vgPgRatio).filter(Boolean) // Assumes vgPgRatio is still top-level
  )).sort();
  const overallMaxPrice = Math.max(1, ...flavors.map(f => getMaxPrice(f.variants))); // Ensure max is at least 1 for slider

  const [filteredFlavors, setFilteredFlavors] = useState<Flavor[]>(flavors);
  const [sortOrder, setSortOrder] = useState<string>('name-asc');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>(() => {
    return {
      bottleSizes: [],
      nicLevels: [],
      priceRange: [0, overallMaxPrice],
      vgPgRatios: []
    };
  });

  // --- Apply filters and sort based on NEW 'variants' structure ---
  const applyFiltersAndSort = () => {
    let result = [...flavors]; // Start from the original full list

    // Filter logic checking inside variants array
    if (filterOptions.bottleSizes.length > 0) {
      result = result.filter(flavor =>
        flavor.variants?.some(variant => filterOptions.bottleSizes.includes(variant.size))
      );
    }
    if (filterOptions.nicLevels.length > 0) {
       result = result.filter(flavor =>
        flavor.variants?.some(variant =>
            variant.nicLevels?.some(level => filterOptions.nicLevels.includes(level))
        )
      );
    }
     if (Array.isArray(filterOptions.priceRange) && filterOptions.priceRange.length === 2) {
        result = result.filter(flavor =>
            // Check if *any* variant's price falls within the range
            flavor.variants?.some(variant =>
                (variant.price ?? Infinity) >= filterOptions.priceRange[0] &&
                (variant.price ?? -Infinity) <= filterOptions.priceRange[1]
            )
        );
    }
    // VG/PG ratio filter remains the same (assuming it's still a top-level field)
    if (filterOptions.vgPgRatios.length > 0) {
      result = result.filter(flavor =>
        flavor.vgPgRatio && filterOptions.vgPgRatios.includes(flavor.vgPgRatio)
      );
    }

    // Sort logic - Adjusted price sort to use helper which considers currentCategoryType
    if (sortOrder === 'name-asc') {
      result.sort((a, b) => (a.flavorName || '').localeCompare(b.flavorName || ''));
    } else if (sortOrder === 'name-desc') {
      result.sort((a, b) => (b.flavorName || '').localeCompare(a.flavorName || ''));
    } else if (sortOrder === 'price-asc') {
      // Sort by minimum price FOUND IN VARIANTS MATCHING THE CURRENT CATEGORY TYPE
      result.sort((a, b) => getMinPrice(a.variants) - getMinPrice(b.variants));
    } else if (sortOrder === 'price-desc') {
       // Sort by minimum price FOUND IN VARIANTS MATCHING THE CURRENT CATEGORY TYPE (desc)
      result.sort((a, b) => getMinPrice(b.variants) - getMinPrice(a.variants));
    } else if (sortOrder === 'newest') {
      result.sort((a, b) => {
        const dateA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
        const dateB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
        return dateB - dateA; // Newest first
      });
    }

    setFilteredFlavors(result);
  };

  // Update filter state (remains the same logic)
  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setFilterOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Reset filters (uses recalculated overallMaxPrice)
  const resetFilters = () => {
    setFilterOptions({
      bottleSizes: [],
      nicLevels: [],
      priceRange: [0, overallMaxPrice],
      vgPgRatios: []
    });
  };

  const handleSortChange = (order: string) => {
    setSortOrder(order);
  };

  // Apply filters/sort when options, sort order, or initial flavors change
  useEffect(() => {
    // Pass currentCategoryType to the sort helper within the effect
    // Re-defining helpers inside useEffect or passing type if they are defined outside
    const getMinPriceForSort = (variants: Flavor['variants']): number => {
        if (!variants || variants.length === 0) return Infinity;
        const relevantVariants = variants.filter(v => v.type === currentCategoryType);
        if (relevantVariants.length === 0) return Infinity;
        return Math.min(...relevantVariants.map(v => v.price ?? Infinity));
    };

    let sortedResult = [...filteredFlavors]; // Start from already filtered list for sorting part

    if (sortOrder === 'name-asc') {
      sortedResult.sort((a, b) => (a.flavorName || '').localeCompare(b.flavorName || ''));
    } else if (sortOrder === 'name-desc') {
      sortedResult.sort((a, b) => (b.flavorName || '').localeCompare(a.flavorName || ''));
    } else if (sortOrder === 'price-asc') {
      sortedResult.sort((a, b) => getMinPriceForSort(a.variants) - getMinPriceForSort(b.variants));
    } else if (sortOrder === 'price-desc') {
      sortedResult.sort((a, b) => getMinPriceForSort(b.variants) - getMinPriceForSort(a.variants));
    } else if (sortOrder === 'newest') {
      sortedResult.sort((a, b) => {
        const dateA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
        const dateB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
        return dateB - dateA;
      });
    }
    setFilteredFlavors(sortedResult);

  // Apply filters whenever filterOptions change
  // Need separate effect for filtering based on original flavors
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterOptions, flavors]); // Filter runs when options or base flavors change

  useEffect(() => {
     // Apply sorting whenever sortOrder or the *result* of filtering changes
     applyFiltersAndSort(); // Rerun the whole process might be simpler here
     // If performance becomes an issue, separate filtering and sorting effects more carefully
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOrder, currentCategoryType]); // Re-sort if sortOrder or the context TYPE changes


    // Update initial filter price range if flavors prop changes
    useEffect(() => {
        const newOverallMaxPrice = Math.max(1, ...flavors.map(f => getMaxPrice(f.variants)));
        // Check if filterOptions needs update BEFORE setting it, avoid infinite loop if possible
        setFilterOptions(prev => {
            const newMax = newOverallMaxPrice;
            const currentMax = prev.priceRange[1];
            // Only update if the max price actually changed significantly
            // or if the lower bound is now invalid
            if (newMax !== currentMax || prev.priceRange[0] > newMax) {
                return {
                    ...prev,
                     // Reset lower bound if it's higher than the new max
                    priceRange: [prev.priceRange[0] > newMax ? 0 : prev.priceRange[0], newMax]
                };
            }
            return prev; // No change needed
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flavors]); // Rerun only when the base flavors list changes

  return (
    <div className="container mx-auto px-4 w-full max-w-6xl">
      {/* Optional Title */}
      {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}

      {/* Filter/Sort Controls Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4 sticky top-[60px] sm:top-[72px] bg-background py-2 z-10 border-b"> {/* Adjust top value based on navbar height */}
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <SlidersHorizontal size={16} />
                <span>Filter</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filter Options</SheetTitle>
              </SheetHeader>
              <div className="py-4 space-y-6 overflow-y-auto h-[calc(100vh-100px)]">
                {/* Bottle Sizes Filter UI */}
                {availableBottleSizes.length > 0 && (
                    <div>
                    <h3 className="font-medium mb-2">Bottle Sizes</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {availableBottleSizes.map((size) => (
                        <div key={`filter-size-${size}`} className="flex items-center space-x-2">
                            <Checkbox
                            id={`filter-size-${size}`}
                            checked={filterOptions.bottleSizes.includes(size)}
                            onCheckedChange={(checked) => {
                                const currentSizes = filterOptions.bottleSizes;
                                updateFilter('bottleSizes',
                                checked
                                    ? [...currentSizes, size]
                                    : currentSizes.filter(s => s !== size)
                                );
                            }}
                            />
                            <Label htmlFor={`filter-size-${size}`}>{size}</Label>
                        </div>
                        ))}
                    </div>
                    </div>
                )}

                 {/* Nicotine Levels Filter UI */}
                {availableNicLevels.length > 0 && (
                    <div>
                    <h3 className="font-medium mb-2">Nicotine Levels</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {availableNicLevels.map((level) => (
                        <div key={`filter-nic-${level}`} className="flex items-center space-x-2">
                            <Checkbox
                            id={`filter-nic-${level}`}
                            checked={filterOptions.nicLevels.includes(level)}
                            onCheckedChange={(checked) => {
                                const currentLevels = filterOptions.nicLevels;
                                updateFilter('nicLevels',
                                checked
                                    ? [...currentLevels, level]
                                    : currentLevels.filter(l => l !== level)
                                );
                            }}
                            />
                            <Label htmlFor={`filter-nic-${level}`}>{level}mg</Label>
                        </div>
                        ))}
                    </div>
                    </div>
                )}

                {/* Price Range Filter UI */}
                {overallMaxPrice > 0 && (
                    <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">Price Range</h3>
                        <span className="text-sm">
                        ${filterOptions.priceRange[0]} - ${filterOptions.priceRange[1]}
                        </span>
                    </div>
                    <Slider
                        min={0}
                        max={overallMaxPrice}
                        step={1}
                        value={filterOptions.priceRange}
                        onValueChange={(value) => updateFilter('priceRange', value)}
                        className="mt-2"
                    />
                    </div>
                )}


                {/* VG/PG Ratio Filter UI */}
                 {availableVgPgRatios.length > 0 && (
                    <div>
                    <h3 className="font-medium mb-2">VG/PG Ratio</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {availableVgPgRatios.map((ratio) => (
                        <div key={`filter-ratio-${ratio}`} className="flex items-center space-x-2">
                            <Checkbox
                            id={`filter-ratio-${ratio}`}
                            checked={filterOptions.vgPgRatios.includes(ratio)}
                            onCheckedChange={(checked) => {
                                const currentRatios = filterOptions.vgPgRatios;
                                updateFilter('vgPgRatios',
                                checked
                                    ? [...currentRatios, ratio]
                                    : currentRatios.filter(r => r !== ratio)
                                );
                            }}
                            />
                            <Label htmlFor={`filter-ratio-${ratio}`}>{ratio}</Label>
                        </div>
                        ))}
                    </div>
                    </div>
                 )}

                {/* Action Buttons */}
                <div className="flex justify-between pt-4 border-t">
                  <Button variant="outline" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                  {/* Apply button removed if filters apply on change */}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <span>Sort</span>
                <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleSortChange('name-asc')}>Name (A-Z)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('name-desc')}>Name (Z-A)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('price-asc')}>Price (Low-High)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('price-desc')}>Price (High-Low)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('newest')}>Newest Added</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Flavor count */}
        <div className="text-sm text-muted-foreground text-right">
          {filteredFlavors.length} flavor{filteredFlavors.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Flavor Cards Grid Section */}
      {filteredFlavors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Map over filtered flavors */}
          {filteredFlavors.map((flavor) => (
            // --- CHANGE MADE HERE ---
            <FlavorCard
              key={flavor.id} // Ensure unique key is present
              flavor={flavor}
              currentCategoryType={currentCategoryType} // Pass the context down
            />
            // --- END OF CHANGE ---
          ))}
        </div>
      ) : (
        // No results message
        <div className="flex flex-col items-center justify-center text-center mt-10">
          <p className="text-lg text-muted-foreground">No flavors found matching your criteria</p>
          <Button
            variant="link"
            onClick={resetFilters}
            className="mt-2"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default FlavorGrid;