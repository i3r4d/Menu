import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import FlavorGrid from '@/components/FlavorGrid';
import BackButton from '@/components/BackButton';
// --- CORRECTED IMPORT ---
// Removed Firebase import reference
// Import the specific function needed from your Supabase service file
import { searchFlavors } from '@/services/supabase.ts'; // Corrected path
import { Flavor } from '@/types/flavor';

// Helper function to get search query from URL
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchPage = () => {
  const queryParams = useQuery();
  const query = queryParams.get('q') || ''; // Get search query 'q' from URL

  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [loading, setLoading] = useState(false); // Start as false until query is confirmed
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      // Only search if there is a query term
      if (!query) {
        setFlavors([]); // Clear results if query is empty
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null); // Reset error

        // --- CALLING THE IMPORTED SUPABASE FUNCTION ---
        // Function name matches the one from supabaseService.ts
        const results = await searchFlavors(query);
        setFlavors(results);
      } catch (err) {
        if (err instanceof Error) {
          console.error(`Error searching flavors for query "${query}":`, err.message);
          setError(`Failed to search flavors: ${err.message}`);
        } else {
          console.error('Unknown error searching flavors:', err);
          setError('Failed to search flavors due to an unknown error.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]); // Re-run effect when the query parameter changes

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
          ) : !query ? (
            // Message shown if the search URL has no query param (e.g., /search)
            <p className="text-muted-foreground text-center">Enter a search term in the navigation bar.</p>
          ) : flavors.length === 0 ? (
            // Message shown if query exists but yields no results
            <div className="text-center py-16">
              <h1 className="text-2xl font-bold mb-2">Search Results</h1>
              <p className="text-muted-foreground">No flavors found matching "{query}".</p>
            </div>
          ) : (
            // Display search results grid
            <div className="w-full max-w-5xl">
              <h1 className="text-2xl font-bold text-center mb-6">
                Search Results for "{query}"
              </h1>
              <FlavorGrid
                flavors={flavors}
                // Title prop not needed here as handled by the h1 above
              />
            </div>
          )}
        </div>
      </main>

      <BackButton />
    </div>
  );
};

export default SearchPage;
