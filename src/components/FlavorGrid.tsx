
import { useState, useEffect } from 'react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import FlavorCard from './FlavorCard';
import { Button } from '@/components/ui/button';
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
  currentCategoryType?: 'E-Liquid' | 'Salt Nic';
  title?: string;
}

// Helper to get min price from variants, returning Infinity if no variants/prices
const getMinPrice = (variants: Flavor['variants'], currentCategoryType?: string): number => {
    if (!variants || variants.length === 0) return Infinity;
    // Filter variants by the currentCategoryType BEFORE finding min price if type is provided
    const relevantVariants = currentCategoryType 
      ? variants.filter(v => v.type === currentCategoryType)
      : variants;
    if (relevantVariants.length === 0) return Infinity;
    return Math.min(...relevantVariants.map(v => v.price ?? Infinity));
};

// Helper to get max price from variants, returning 0 if no variants/prices
const getMaxPrice = (variants: Flavor['variants']): number => {
    if (!variants || variants.length === 0) return 0;
    return Math.max(0, ...variants.map(v => v.price ?? 0));
};

const FlavorGrid = ({ flavors, currentCategoryType = 'E-Liquid', title }: FlavorGridProps) => {
  // Calculate available filter options based on the variants structure
  const availableBottleSizes = Array.from(new Set(
      flavors.flatMap(f => f.variants?.map(v => v.size) ?? [])
  )).sort();
  const availableNicLevels = Array.from(new Set(
      flavors.flatMap(f => f.variants?.flatMap(v => v.nicLevels) ?? [])
  )).filter(level => typeof level === 'number').sort((a, b) => a - b);
  const availableVgPgRatios = Array.from(new Set(
      flavors.map(f => f.vgPgRatio).filter(Boolean)
  )).sort();
  const overallMaxPrice = Math.max(1, ...flavors.map(f => getMaxPrice(f.variants)));

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

  // Apply filters and sort
  const applyFiltersAndSort = () => {
    let result = [...flavors];

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
            flavor.variants?.some(variant =>
                (variant.price ?? Infinity) >= filterOptions.priceRange[0] &&
                (variant.price ?? -Infinity) <= filterOptions.priceRange[1]
            )
        );
    }
    // VG/PG ratio filter
    if (filterOptions.vgPgRatios.length > 0) {
      result = result.filter(flavor =>
        flavor.vgPgRatio && filterOptions.vgPgRatios.includes(flavor.vgPgRatio)
      );
    }

    // Sort logic - using helper which considers currentCategoryType
    if (sortOrder === 'name-asc') {
      result.sort((a, b) => (a.flavorName || '').localeCompare(b.flavorName || ''));
    } else if (sortOrder === 'name-desc') {
      result.sort((a, b) => (b.flavorName || '').localeCompare(a.flavorName || ''));
    } else if (sortOrder === 'price-asc') {
      result.sort((a, b) => getMinPrice(a.variants, currentCategoryType) - getMinPrice(b.variants, currentCategoryType));
    } else if (sortOrder === 'price-desc') {
      result.sort((a, b) => getMinPrice(b.variants, currentCategoryType) - getMinPrice(a.variants, currentCategoryType));
    } else if (sortOrder === 'newest') {
      result.sort((a, b) => {
        const dateA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
        const dateB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
        return dateB - dateA;
      });
    }

    setFilteredFlavors(result);
  };

  // Update filter state
  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setFilterOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Reset filters
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

  // Apply filters/sort when options or flavors change
  useEffect(() => {
    applyFiltersAndSort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterOptions, flavors, sortOrder, currentCategoryType]);

  // Update price range if flavors change
  useEffect(() => {
    const newOverallMaxPrice = Math.max(1, ...flavors.map(f => getMaxPrice(f.variants)));
    setFilterOptions(prev => {
        const newMax = newOverallMaxPrice;
        const currentMax = prev.priceRange[1];
        if (newMax !== currentMax || prev.priceRange[0] > newMax) {
            return {
                ...prev,
                priceRange: [prev.priceRange[0] > newMax ? 0 : prev.priceRange[0], newMax]
            };
        }
        return prev;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flavors]);

  return (
    <div className="container mx-auto px-4 w-full max-w-6xl">
      {/* Optional Title */}
      {title && <h2 className="text-xl md:text-2xl font-bold mb-6 dark:text-darkTextPrimary">{title}</h2>}

      {/* Filter/Sort Controls Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 sticky top-[140px] sm:top-[140px] bg-background/80 dark:bg-darkBgPrimary/80 backdrop-blur-sm py-4 z-10 border-b dark:border-darkBorder rounded-md"> 
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1 font-medium dark:bg-darkSurface dark:text-darkTextSecondary dark:border-darkBorder dark:hover:bg-darkBgSecondary dark:hover:text-darkTextPrimary">
                <SlidersHorizontal size={16} />
                <span>Filter</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="dark:bg-darkBgSecondary dark:text-darkTextPrimary border-r dark:border-darkBorder">
              <SheetHeader>
                <SheetTitle className="text-2xl font-semibold dark:text-darkTextPrimary">Filter Options</SheetTitle>
              </SheetHeader>
              <div className="py-6 space-y-8 overflow-y-auto h-[calc(100vh-120px)]">
                {/* Bottle Sizes Filter UI */}
                {availableBottleSizes.length > 0 && (
                    <div>
                    <h3 className="font-semibold mb-3 text-lg dark:text-darkTextPrimary">Bottle Sizes</h3>
                    <div className="grid grid-cols-2 gap-3">
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
                            className="dark:border-darkBorder dark:data-[state=checked]:bg-primaryAccent dark:data-[state=checked]:border-primaryAccent"
                            />
                            <Label htmlFor={`filter-size-${size}`} className="font-medium dark:text-darkTextSecondary">{size}</Label>
                        </div>
                        ))}
                    </div>
                    </div>
                )}

                 {/* Nicotine Levels Filter UI */}
                {availableNicLevels.length > 0 && (
                    <div>
                    <h3 className="font-semibold mb-3 text-lg dark:text-darkTextPrimary">Nicotine Levels</h3>
                    <div className="grid grid-cols-2 gap-3">
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
                            className="dark:border-darkBorder dark:data-[state=checked]:bg-primaryAccent dark:data-[state=checked]:border-primaryAccent"
                            />
                            <Label htmlFor={`filter-nic-${level}`} className="font-medium dark:text-darkTextSecondary">{level}mg</Label>
                        </div>
                        ))}
                    </div>
                    </div>
                )}

                {/* Price Range Filter UI */}
                {overallMaxPrice > 0 && (
                    <div>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-lg dark:text-darkTextPrimary">Price Range</h3>
                        <span className="text-sm font-medium bg-primary/10 dark:bg-primaryAccent/10 dark:text-darkTextPrimary px-3 py-1 rounded-full">
                        ${filterOptions.priceRange[0]} - ${filterOptions.priceRange[1]}
                        </span>
                    </div>
                    <Slider
                        min={0}
                        max={overallMaxPrice}
                        step={1}
                        value={filterOptions.priceRange}
                        onValueChange={(value) => updateFilter('priceRange', value)}
                        className="mt-4"
                    />
                    </div>
                )}

                {/* VG/PG Ratio Filter UI */}
                 {availableVgPgRatios.length > 0 && (
                    <div>
                    <h3 className="font-semibold mb-3 text-lg dark:text-darkTextPrimary">VG/PG Ratio</h3>
                    <div className="grid grid-cols-2 gap-3">
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
                            className="dark:border-darkBorder dark:data-[state=checked]:bg-primaryAccent dark:data-[state=checked]:border-primaryAccent"
                            />
                            <Label htmlFor={`filter-ratio-${ratio}`} className="font-medium dark:text-darkTextSecondary">{ratio}</Label>
                        </div>
                        ))}
                    </div>
                    </div>
                 )}

                {/* Action Buttons */}
                <div className="flex justify-between pt-4 border-t dark:border-darkBorder mt-8">
                  <Button 
                    variant="outline" 
                    onClick={resetFilters} 
                    className="font-medium dark:bg-darkSurface dark:text-darkTextSecondary dark:border-darkBorder dark:hover:bg-darkBgSecondary dark:hover:text-darkTextPrimary"
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 font-medium dark:bg-darkSurface dark:text-darkTextSecondary dark:border-darkBorder dark:hover:bg-darkBgSecondary dark:hover:text-darkTextPrimary"
              >
                <span>Sort</span>
                <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background/95 dark:bg-darkSurface/95 backdrop-blur-sm border dark:border-darkBorder rounded-xl shadow-lg p-2">
              <DropdownMenuItem onClick={() => handleSortChange('name-asc')} className="cursor-pointer rounded-md mb-1 dark:text-darkTextSecondary dark:hover:bg-darkBgPrimary dark:hover:text-darkTextPrimary">Name (A-Z)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('name-desc')} className="cursor-pointer rounded-md mb-1 dark:text-darkTextSecondary dark:hover:bg-darkBgPrimary dark:hover:text-darkTextPrimary">Name (Z-A)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('price-asc')} className="cursor-pointer rounded-md mb-1 dark:text-darkTextSecondary dark:hover:bg-darkBgPrimary dark:hover:text-darkTextPrimary">Price (Low-High)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('price-desc')} className="cursor-pointer rounded-md mb-1 dark:text-darkTextSecondary dark:hover:bg-darkBgPrimary dark:hover:text-darkTextPrimary">Price (High-Low)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('newest')} className="cursor-pointer rounded-md dark:text-darkTextSecondary dark:hover:bg-darkBgPrimary dark:hover:text-darkTextPrimary">Newest Added</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Flavor count */}
        <div className="text-sm text-muted-foreground dark:text-darkTextSecondary font-medium px-3 py-1 bg-background/50 dark:bg-darkBgSecondary/50 border dark:border-darkBorder rounded-full">
          {filteredFlavors.length} flavor{filteredFlavors.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Flavor Cards Grid Section */}
      {filteredFlavors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFlavors.map((flavor) => (
            <FlavorCard
              key={flavor.id}
              flavor={flavor}
              currentCategoryType={currentCategoryType}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center mt-16 py-12 px-6 bg-background/50 dark:bg-darkSurface/50 border border-dashed border-primary/20 dark:border-darkBorder/50 rounded-xl">
          <p className="text-lg text-muted-foreground dark:text-darkTextSecondary mb-4">No flavors found matching your criteria</p>
          <Button
            variant="outline"
            onClick={resetFilters}
            className="mt-2 font-medium dark:bg-darkBgSecondary dark:text-darkTextSecondary dark:border-darkBorder dark:hover:bg-darkBgPrimary dark:hover:text-darkTextPrimary"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default FlavorGrid;
