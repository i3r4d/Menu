import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import FlavorGrid from '@/components/FlavorGrid';
import BackButton from '@/components/BackButton';
// --- CORRECTED IMPORT ---
// Removed Firebase import reference
// Import the specific function needed from your Supabase service file
import { getFlavorsByCategory } from '@/services/supabase.ts'; // Corrected path
import { Flavor } from '@/types/flavor';

const CategoryPage = () => {
  const { type, category } = useParams<{ type: string; category: string }>();
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlavors = async () => {
      // Ensure type and category params are present before fetching
      // Use default values or handle potentially undefined params gracefully
      const currentType = type || 'e-liquid'; // Example default, adjust if needed
      const currentCategory = category || 'all'; // Example default, adjust if needed

      // Check if original params were undefined if strict handling is needed
      if (!type || !category) {
         // Decide how to handle: error, redirect, or use defaults?
         // Using defaults as shown above is one option.
         // Setting an error might be better if the URL structure guarantees params.
         console.warn("Category type or name missing in URL parameters, using defaults.");
         // setError('Invalid category parameters.');
         // setLoading(false);
         // return; // Stop execution if params are missing and defaults aren't used
      }


      try {
        setLoading(true);
        setError(null); // Reset error on new fetch

        // --- CALLING THE IMPORTED SUPABASE FUNCTION ---
        // Use the potentially defaulted variables
        const data = await getFlavorsByCategory(currentType, currentCategory);

        setFlavors(data);
      } catch (err) {
        // Log the actual error for better debugging
        if (err instanceof Error) {
          // Use the potentially defaulted variables in the error message
          console.error(`Error fetching flavors for ${currentType} - ${currentCategory}:`, err.message);
          setError(`Failed to load flavors: ${err.message}`);
        } else {
          console.error('Unknown error fetching flavors:', err);
          setError('Failed to load flavors due to an unknown error.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchFlavors();
  }, [type, category]); // Dependencies for useEffect still use original params

  // Use the type variable (which might be undefined initially) for the prop
  // but ensure it has a valid string value before passing, or handle potential undefined in FlavorGrid
  const displayType = type || 'e-liquid'; // Use the same default or logic as fetch

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      {/* Main content area uses flex-1 to grow and flex/col for centering child */}
      <main className="flex-1 flex flex-col p-4 overflow-auto">
        {/* Wrapper uses my-auto for vertical centering within the flex-col parent */}
        {/* items-center centers content horizontally */}
        <div className="my-auto flex flex-col items-center w-full">
          {loading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2"></div>
          ) : error ? (
            <p className="text-destructive text-center">{error}</p>
          ) : flavors.length > 0 ? (
            // Ensure FlavorGrid takes appropriate width, e.g., max-w-5xl w-full
            <div className="w-full max-w-5xl">
              <FlavorGrid
                flavors={flavors}
                // --- CHANGE MADE HERE ---
                // Pass the 'type' parameter from the URL down to FlavorGrid
                currentCategoryType={displayType}
                // --- END OF CHANGE ---
              />
            </div>
          ) : (
            <p className="text-muted-foreground">No flavors found in this category.</p>
          )}
        </div>
      </main>

      <BackButton />
    </div>
  );
};

export default CategoryPage;