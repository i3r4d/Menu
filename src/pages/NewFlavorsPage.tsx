import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import FlavorGrid from '@/components/FlavorGrid';
import BackButton from '@/components/BackButton';
// --- CORRECTED IMPORT ---
// Removed Firebase import reference
// Import the specific function needed from your Supabase service file
import { getNewFlavors } from '@/services/supabase.ts'; // Corrected path
import { Flavor } from '@/types/flavor';

const NewFlavorsPage = () => {
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewFlavors = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error

        // --- CALLING THE IMPORTED SUPABASE FUNCTION ---
        // Function name matches the one from supabaseService.ts
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
  }, []); // Empty dependency array means this runs once on mount

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
          ) : flavors.length === 0 ? (
             // Centered message when no new flavors are found
            <div className="text-center py-16">
              <h1 className="text-2xl font-bold mb-2">New Flavors</h1>
              <p className="text-muted-foreground">No recent flavors added.</p>
            </div>
          ) : (
            // Display new flavors grid
            <div className="w-full max-w-5xl">
              {/* Optional: Add a title above the grid if needed */}
              {/* <h1 className="text-2xl font-bold text-center mb-6">New Flavors</h1> */}
              <FlavorGrid
                flavors={flavors}
                // The 'title' prop might not be needed if handled separately
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
