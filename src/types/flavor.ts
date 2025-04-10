// Define the structure for a single product variant
export interface FlavorVariant {
  size: string;
  price: number; // Prices are numbers in the final data structure
  type: 'E-Liquid' | 'Salt Nic';
  nicLevels: number[];
}

// Updated Flavor interface reflecting the new schema
export interface Flavor {
  id: string; // Keep internal ID
  flavorName: string;
  manufacturer: string;
  description: string;
  shortDescription: string;
  type: 'E-Liquid' | 'Salt Nic' | 'Both'; // Overall type derived from variants
  categories: string[];
  variants: FlavorVariant[]; // Array of size/price/type/nic variants
  vgPgRatio: string;
  imageURL: string | null; // Allow null for imageURL
  dateAdded: Date; // Keep dateAdded
  createdAt?: Date; // Optional: Supabase often adds this
}

// This type alias might still be useful for the overall derived type
export type FlavorType = 'E-Liquid' | 'Salt Nic' | 'Both';

// TODO: Review and update FilterOptions
// This interface likely needs significant changes to work with the new 'variants' structure.
// Filtering will now involve checking conditions *within* the variants array.
// For example, checking if *any* variant matches a size, price range, nic level, etc.
export interface FilterOptions {
  // Example potential changes (needs implementation design):
  // sizes?: string[]; // Check if any variant.size matches
  // nicLevels?: { type: 'E-Liquid' | 'Salt Nic', levels: number[] }; // Check if variant of specific type has matching levels
  // priceRange?: [number, number]; // Check if any variant.price falls within range
  // vgPgRatios?: string[]; // This one might remain top-level

  // Old fields - REMOVE THESE or update based on new filtering logic
  bottleSizes: string[];
  nicLevels: number[];
  priceRange: [number, number];
  vgPgRatios: string[];
}

// Flavor categories remain the same
export const flavorCategories = [
  "Fruit",
  "Dessert",
  "Breakfast",
  "Candy",
  "Drinks",
  "Menthol",
  "Tobacco",
  "Nuts",
  "Other"
];