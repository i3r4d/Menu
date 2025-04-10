
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import FlavorGrid from '@/components/FlavorGrid';
import BackButton from '@/components/BackButton';
import { getFlavorsByCategory } from '@/services/supabase.ts';
import { Flavor } from '@/types/flavor';

const CategoryPage = () => {
  const { type, category } = useParams<{ type: string; category: string }>();
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlavors = async () => {
      const currentType = type || 'e-liquid';
      const currentCategory = category || 'all';

      if (!type || !category) {
         console.warn("Category type or name missing in URL parameters, using defaults.");
      }

      try {
        setLoading(true);
        setError(null);

        const data = await getFlavorsByCategory(currentType, currentCategory);
        setFlavors(data);
      } catch (err) {
        if (err instanceof Error) {
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
  }, [type, category]);

  // Ensure a valid currentCategoryType for the FlavorGrid
  const currentCategoryType = type === 'Salt-Nic' ? 'Salt Nic' : 'E-Liquid';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95">
      <Navbar />

      <main className="flex-1 flex flex-col p-6 overflow-auto">
        <div className="my-auto flex flex-col items-center w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-60">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2 mb-4"></div>
              <p className="text-muted-foreground">Loading flavors...</p>
            </div>
          ) : error ? (
            <div className="p-8 bg-destructive/10 rounded-xl max-w-xl mx-auto text-center">
              <p className="text-destructive font-medium">{error}</p>
            </div>
          ) : flavors.length > 0 ? (
            <div className="w-full max-w-5xl">
              <FlavorGrid
                flavors={flavors}
                currentCategoryType={currentCategoryType as 'E-Liquid' | 'Salt Nic'}
                title={`${category} ${currentCategoryType}`}
              />
            </div>
          ) : (
            <div className="text-center p-12 bg-background/50 border border-dashed border-primary/20 rounded-xl max-w-xl">
              <p className="text-xl text-muted-foreground">No flavors found in this category.</p>
            </div>
          )}
        </div>
      </main>

      <BackButton />
    </div>
  );
};

export default CategoryPage;
