import { supabase, transformFlavorData, prepareFlavorForSupabase } from '@/lib/supabase'; // Assuming these helpers correctly handle the new 'variants' field
import { Flavor } from '@/types/flavor'; // Assuming this type now includes 'variants' and omits old fields

// Admin authentication (Simple check)
export const verifyAdminPassword = async (password: string): Promise<boolean> => {
  return password === 'test';
};

// --- Settings Table Functions ---

// Define the expected structure for settings data
export interface SettingsData {
  id?: number; // Usually 1
  logoURL?: string | null;
  lineOfTheMonth?: string | null;
  // Add other settings fields here if needed in the future
}

// --- Generic function to fetch all settings ---
export const getSettings = async (): Promise<SettingsData | null> => {
    console.log('[getSettings] Fetching settings...'); // Added log
    const { data, error } = await supabase
        .from('settings')
        .select('id, logoURL, lineOfTheMonth') // Explicitly select columns
        .eq('id', 1) // Assuming settings are stored in a single row with id=1
        .maybeSingle(); // Handles row not found gracefully

    if (error && error.code !== 'PGRST116') { // PGRST116: row not found, which is okay
        console.error('[getSettings] Error fetching settings:', error);
        throw error;
    }
    console.log('[getSettings] Fetched settings data:', data); // Log fetched data
    // Return the data object (which matches SettingsData) or null
    return data;
};

// --- Generic function to update settings (handles insert if not exists) ---
export const updateSettings = async (settings: Partial<Omit<SettingsData, 'id'>>): Promise<void> => {
    console.log('[updateSettings] Attempting to update settings with:', settings); // Added log
    const { error } = await supabase
        .from('settings')
        .update(settings) // Use camelCase keys from input 'settings' object
        .eq('id', 1); // Update the single settings row

    if (error) {
        console.error('[updateSettings] Error during initial update:', error);
        // Check if the row doesn't exist and insert it if needed (upsert logic)
        // Note: Supabase might return 'PGRST116' or a message containing '0 rows' depending on version/context
        if (error.code === 'PGRST116' || (error.message && error.message.includes('0 rows'))) { // Heuristic check for non-existent row
             console.log('[updateSettings] Settings row not found, attempting to insert...');
             const { error: insertError } = await supabase
                .from('settings')
                .insert({ ...settings, id: 1 }); // Ensure 'id' is included for insert

             if (insertError) {
                console.error('[updateSettings] Error inserting settings:', insertError);
                throw insertError;
             }
             console.log('[updateSettings] Settings row inserted successfully.');
             return; // Exit after successful insert
        }
        // If it's another error, throw it
        throw error;
    }
    console.log('[updateSettings] Settings updated successfully.');
};


// --- LEGACY Settings Functions (can be removed if AdminSettings uses the new ones) ---
// Fetch Logo URL from settings table (can be replaced by getSettings().then(s => s?.logoURL))
export const getLogoURL = async (): Promise<string> => {
  const settings = await getSettings();
  return settings?.logoURL || '';
};

// Update Logo URL in settings table (can be replaced by updateSettings({ logoURL }))
export const updateLogo = async (logoURL: string): Promise<void> => {
  // Ensure empty string saves as null if desired, or handle as needed
  await updateSettings({ logoURL: logoURL || null });
};

// Fetch Line of the Month manufacturer *name* (can be replaced by getSettings().then(s => s?.lineOfTheMonth))
// Internal helper - gets the raw value from the settings table
const getLineOfTheMonthManufacturer = async (): Promise<string | null> => {
  const settings = await getSettings();
  // Returns the value directly (could be string, null, or even "EMPTY" if saved that way)
  return settings?.lineOfTheMonth ?? null; // Use nullish coalescing for clarity
};


// Update Line of the Month manufacturer (can be replaced by updateSettings({ lineOfTheMonth }))
export const updateLineOfMonth = async (manufacturer: string | null): Promise<void> => {
   // Allow null to be passed directly for setting "None"
  await updateSettings({ lineOfTheMonth: manufacturer });
};
// --- End LEGACY Settings Functions ---


// --- Flavor Table CRUD Functions ---

// Fetch all flavors, ordered by dateAdded descending
export const getAllFlavors = async (): Promise<Flavor[]> => {
  const { data, error } = await supabase
    .from('flavors')
    .select('*')
    .order('dateAdded', { ascending: false });

  if (error) {
    console.error('Error fetching all flavors:', error);
    throw error;
  }
  // Relies on updated transformFlavorData
  return data ? data.map(transformFlavorData) : [];
};

// Fetch a single flavor by its ID
export const getFlavorById = async (id: string): Promise<Flavor | null> => {
  const { data, error } = await supabase
    .from('flavors')
    .select('*')
    .eq('id', id)
    .single(); // Use single to ensure only one row is returned or error if none/multiple

  if (error) {
    // 'PGRST116' indicates that zero rows were found, which is a valid case for "not found"
    if (error.code === 'PGRST116') {
      console.log(`Flavor with id ${id} not found.`);
      return null;
    } else {
      // Log and throw other unexpected errors
      console.error(`Error fetching flavor with id ${id}:`, error);
      throw error;
    }
  }
  // Relies on updated transformFlavorData
  return data ? transformFlavorData(data) : null;
};


// Fetch flavors by type ('E-Liquid' or 'Salt Nic') and category using RPC
export const getFlavorsByCategory = async (type: string, category: string): Promise<Flavor[]> => {
  console.log(`[getFlavorsByCategory] Called with type: "${type}", category: "${category}"`);

  try {
      // Calls the SQL function get_flavors_by_category_raw
      console.log(`[getFlavorsByCategory] Running RPC: get_flavors_by_category_raw with category='${category}', type='${type}'`);

      const { data, error } = await supabase.rpc('get_flavors_by_category_raw', {
        p_category: category,
        p_type: type
      });

      if (error) {
          console.error(`[getFlavorsByCategory] Error fetching flavors via RPC for category ${category}:`, error);
          throw error;
      }

      console.log(`[getFlavorsByCategory] Fetched ${data?.length ?? 0} flavors via RPC.`); // Log count

      // Relies on updated transformFlavorData
      return data ? data.map(transformFlavorData) : [];

  } catch (error) {
      console.error(`[getFlavorsByCategory] CATCH BLOCK - Error fetching flavors for category ${category} (RPC):`, error);
      return []; // Return empty array on error
  }
};


// Fetch recently added flavors
export const getNewFlavors = async (limit: number = 12): Promise<Flavor[]> => {
  const { data, error } = await supabase
    .from('flavors')
    .select('*')
    .order('dateAdded', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching new flavors:', error);
    throw error;
  }
  // Relies on updated transformFlavorData
  return data ? data.map(transformFlavorData) : [];
};

// Fetch 'Line of the Month' flavors
export const getLineOfTheMonth = async (): Promise<Flavor[]> => {
  // Get the raw value from settings
  const manufacturer = await getLineOfTheMonthManufacturer(); // Uses the internal helper which uses getSettings

  // Log the retrieved value for debugging
  console.log('[getLineOfTheMonth] Retrieved manufacturer setting:', manufacturer); // Log the exact value

  // ***MODIFIED CHECK***: Explicitly check if the setting is null (meaning "None" was saved)
  if (manufacturer === null) {
    console.log('[getLineOfTheMonth] No line of the month manufacturer is set (value is null). Returning empty array.');
    return []; // Return empty array as no LOTM is set
  }

  // If we reach here, a manufacturer name *should* be set.
  // It might be a real name, or it could be "EMPTY" if saved incorrectly.
  // We proceed assuming it's the intended manufacturer name.
  console.log(`[getLineOfTheMonth] Fetching flavors for manufacturer: "${manufacturer}"`);

  // Proceed with the query using the potentially non-null manufacturer string
  const { data, error } = await supabase
    .from('flavors')
    .select('*')
    .eq('manufacturer', manufacturer) // Query using the retrieved name
    .order('flavorName', { ascending: true });

  if (error) {
    console.error(`[getLineOfTheMonth] Error fetching flavors for manufacturer "${manufacturer}":`, error);
    throw error; // Rethrow the error to be handled upstream
  }

  console.log(`[getLineOfTheMonth] Found ${data?.length ?? 0} flavors for manufacturer "${manufacturer}".`);

  // Relies on updated transformFlavorData
  return data ? data.map(transformFlavorData) : [];
};

// Search flavors
export const searchFlavors = async (query: string): Promise<Flavor[]> => {
  const { data, error } = await supabase
    .from('flavors')
    .select('*')
    .or(`flavorName.ilike.%${query}%,manufacturer.ilike.%${query}%,description.ilike.%${query}%`)
    .order('flavorName', { ascending: true });

  if (error) {
    console.error(`Error searching flavors with query "${query}":`, error);
    throw error;
  }
  // Relies on updated transformFlavorData
  return data ? data.map(transformFlavorData) : [];
};

// Add a new flavor
export const addFlavor = async (flavorData: Omit<Flavor, 'id' | 'createdAt' | 'dateAdded'>): Promise<Flavor> => {
  // Relies on updated prepareFlavorForSupabase
  const supabaseData = prepareFlavorForSupabase(flavorData);

  const { data, error } = await supabase
    .from('flavors')
    .insert(supabaseData)
    .select('*')
    .single(); // Expect a single row back after insert

  if (error) {
    console.error('Error adding flavor:', error);
    console.error('Data sent:', JSON.stringify(supabaseData, null, 2));
    throw error;
  }
  if (!data) { throw new Error('Flavor added, but no data returned.'); }

  // Relies on updated transformFlavorData
  return transformFlavorData(data);
};

// Update an existing flavor
export const updateFlavor = async (id: string, flavorUpdateData: Partial<Omit<Flavor, 'id' | 'createdAt' | 'dateAdded'>>): Promise<Flavor> => {
  // Relies on updated prepareFlavorForSupabase
  const supabaseData = prepareFlavorForSupabase(flavorUpdateData);

  const { data, error } = await supabase
    .from('flavors')
    .update(supabaseData)
    .eq('id', id)
    .select('*')
    .single(); // Expect a single row back after update

  if (error) {
    console.error(`Error updating flavor with id ${id}:`, error);
    console.error('Data sent:', JSON.stringify(supabaseData, null, 2));
    throw error;
  }
   if (!data) { throw new Error(`Flavor ${id} updated, but no data returned.`); }

  // Relies on updated transformFlavorData
  return transformFlavorData(data);
};

// Delete a flavor
export const deleteFlavor = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('flavors')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting flavor with id ${id}:`, error);
    throw error;
  }
  console.log(`Flavor with id ${id} deleted successfully.`);
};


// --- Function to fetch unique manufacturers (requires RPC function created in Supabase) ---
export const getUniqueManufacturers = async (): Promise<string[]> => {
  // Assumes you created the 'get_unique_manufacturers' function in Supabase SQL Editor
  const { data, error } = await supabase.rpc('get_unique_manufacturers');

  if (error) {
    console.error('Error fetching unique manufacturers via RPC:', error);
    throw error;
  }
  // The RPC returns an array of objects like [{ manufacturer: 'Name1' }, ...]
  // We need to extract the names into a simple string array.
  return data ? data.map((item: { manufacturer: string }) => item.manufacturer).filter(Boolean) : []; // Filter out potential null/empty values from DB if any
};