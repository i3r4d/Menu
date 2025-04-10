import { createClient } from '@supabase/supabase-js';
import { Flavor, FlavorVariant } from '@/types/flavor'; // Import Flavor and FlavorVariant

// Supabase client setup (remains the same)
const supabaseUrl = 'https://nbttfbmrpoevwovmzsrn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5idHRmYm1ycG9ldndvdm16c3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMjkwMjksImV4cCI6MjA1OTgwNTAyOX0.GPmWkyAeEqI9oH6b-EM7XJEiNW-l3XVf0O3K02z8Y7g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Transform Supabase flavor data (camelCase) to app's Flavor type (camelCase)
export const transformFlavorData = (data: any): Flavor => {
  // Ensure variants data is valid or default to empty array
  // Assumes the DB returns variants structure matching FlavorVariant interface
  const variantsData = Array.isArray(data.variants) ? data.variants.map((v: any): FlavorVariant => ({
      size: v.size || '',
      price: typeof v.price === 'number' ? v.price : 0, // Ensure price is number
      type: v.type === 'E-Liquid' || v.type === 'Salt Nic' ? v.type : 'E-Liquid', // Default or validate type
      nicLevels: Array.isArray(v.nicLevels) ? v.nicLevels.filter((n: any) => typeof n === 'number') : [], // Ensure nicLevels is array of numbers
  })) : [];

  return {
    id: data.id,
    flavorName: data.flavorName || '', // Add defaults for potentially missing fields
    manufacturer: data.manufacturer || '',
    description: data.description || '',
    shortDescription: data.shortDescription || '',
    type: data.type || 'Both', // Use the overall derived type stored in DB
    categories: Array.isArray(data.categories) ? data.categories : [], // Ensure categories is array
    variants: variantsData, // Assign the processed variants data
    vgPgRatio: data.vgPgRatio || '',
    imageURL: data.imageURL || null, // Allow null imageURL
    // Ensure dateAdded is correctly converted to a Date object
    dateAdded: data.dateAdded ? new Date(data.dateAdded) : new Date(),
    // Optional: include createdAt if it exists in your data object
    createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
  };
};

// Transform app's Flavor type (camelCase) to object for Supabase insert/update (camelCase keys)
export const prepareFlavorForSupabase = (flavor: Partial<Flavor>) => {
  // Create an object where keys EXACTLY match the camelCase database column names
  const dataForSupabase: { [key: string]: any } = {};

  // Conditionally add fields only if they exist in the input 'flavor' object
  if (flavor.flavorName !== undefined) dataForSupabase.flavorName = flavor.flavorName;
  if (flavor.manufacturer !== undefined) dataForSupabase.manufacturer = flavor.manufacturer;
  if (flavor.description !== undefined) dataForSupabase.description = flavor.description;
  if (flavor.shortDescription !== undefined) dataForSupabase.shortDescription = flavor.shortDescription;
  if (flavor.type !== undefined) dataForSupabase.type = flavor.type; // Overall derived type
  if (flavor.categories !== undefined) dataForSupabase.categories = flavor.categories; // Pass array directly
  if (flavor.variants !== undefined) dataForSupabase.variants = flavor.variants; // Pass variants array directly
  if (flavor.vgPgRatio !== undefined) dataForSupabase.vgPgRatio = flavor.vgPgRatio;
  if (flavor.imageURL !== undefined) dataForSupabase.imageURL = flavor.imageURL;

  // Handle dateAdded: Omit for inserts (use DB default), include for updates if explicitly provided.
  if (flavor.dateAdded instanceof Date) {
     dataForSupabase.dateAdded = flavor.dateAdded.toISOString();
  }
  // Handle createdAt: Usually managed by DB, omit unless needed for specific update logic
  // if (flavor.createdAt instanceof Date) {
  //    dataForSupabase.createdAt = flavor.createdAt.toISOString();
  // }

  // Remove id field if present, as it shouldn't be inserted/updated directly
  delete dataForSupabase.id;

  return dataForSupabase;
};