
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import FlavorGrid from '@/components/FlavorGrid';
import BackButton from '@/components/BackButton';
import { searchFlavors } from '@/services/supabase.ts';
import { Flavor } from '@/types/flavor';

// Helper function to get search query from URL
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchPage = () => {
  const queryParams = useQuery();
  const query = queryParams.get('q') || '';

  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setFlavors([]);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

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
  }, [query]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95">
      <Navbar />

      <main className="flex-1 flex flex-col p-6 overflow-auto">
        <div className="my-auto flex flex-col items-center w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-60">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2 mb-4"></div>
              <p className="text-muted-foreground">Searching for "{query}"...</p>
            </div>
          ) : error ? (
            <div className="p-8 bg-destructive/10 rounded-xl max-w-xl mx-auto text-center">
              <p className="text-destructive font-medium">{error}</p>
            </div>
          ) : !query ? (
            <div className="text-center p-12 bg-background/50 border border-dashed border-primary/20 rounded-xl max-w-xl">
              <p className="text-xl text-muted-foreground">Enter a search term in the navigation bar.</p>
            </div>
          ) : flavors.length === 0 ? (
            <div className="text-center py-16 max-w-xl">
              <h1 className="text-3xl font-bold mb-4">Search Results</h1>
              <div className="p-12 bg-background/50 border border-dashed border-primary/20 rounded-xl">
                <p className="text-xl text-muted-foreground">No flavors found matching "{query}".</p>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-5xl">
              <FlavorGrid
                flavors={flavors}
                currentCategoryType="E-Liquid"
                title={`Search Results for "${query}"`}
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
