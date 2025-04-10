
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import FlavorGrid from '@/components/FlavorGrid';
import BackButton from '@/components/BackButton';
import { getNewFlavors } from '@/services/supabase.ts';
import { Flavor } from '@/types/flavor';

const NewFlavorsPage = () => {
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewFlavors = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getNewFlavors();
        setFlavors(data);
      } catch (err) {
        if (err instanceof Error) {
          console.error('Error fetching new flavors:', err.message);
          setError(`Failed to load new flavors: ${err.message}`);
        } else {
          console.error('Unknown error fetching new flavors:', err);
          setError('Failed to load new flavors due to an unknown error.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNewFlavors();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <main className="flex-1 flex flex-col p-6 pt-8 overflow-auto">
        <div className="my-auto flex flex-col items-center w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-60">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2 mb-4"></div>
              <p className="text-muted-foreground dark:text-gray-400">Loading new flavors...</p>
            </div>
          ) : error ? (
            <div className="p-8 bg-destructive/10 dark:bg-destructive/20 rounded-xl max-w-xl mx-auto text-center">
              <p className="text-destructive dark:text-red-400 font-medium">{error}</p>
            </div>
          ) : flavors.length === 0 ? (
            <div className="text-center py-16 max-w-xl">
              <h1 className="text-3xl font-bold mb-4 dark:text-white">New Flavors</h1>
              <div className="p-12 bg-background/50 dark:bg-gray-800/50 border border-dashed border-primary/20 dark:border-primary/10 rounded-xl">
                <p className="text-xl text-muted-foreground dark:text-gray-400">No recent flavors added.</p>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-5xl">
              <FlavorGrid
                flavors={flavors}
                currentCategoryType="E-Liquid"
                title="Recently Added Flavors"
              />
            </div>
          )}
        </div>
      </main>

      <BackButton />
    </div>
  );
};

export default NewFlavorsPage;
