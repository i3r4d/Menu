
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import FlavorGrid from '@/components/FlavorGrid';
import BackButton from '@/components/BackButton';
// Import the specific functions needed from your Supabase service file
import { getLineOfTheMonth, SettingsData, getSettings } from '@/services/supabase'; // Corrected path
import { Flavor } from '@/types/flavor';

const DealsPage = () => {
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Store the setting directly
  const [lineOfMonthManufacturer, setLineOfMonthManufacturer] = useState<string | null>(null);

  useEffect(() => {
    const fetchDealsAndSettings = async () => {
      console.log('[DealsPage] useEffect starting...');
      try {
        setLoading(true);
        setError(null);
        setFlavors([]); // Reset flavors explicitly
        setLineOfMonthManufacturer(null); // Reset manufacturer explicitly

        // 1. Fetch settings to get the LOTM manufacturer name
        console.log('[DealsPage] Fetching settings...');
        const settings: SettingsData | null = await getSettings();
        const currentLotm = settings?.lineOfTheMonth ?? null;
        console.log('[DealsPage] Retrieved LOTM setting:', currentLotm);
        setLineOfMonthManufacturer(currentLotm); // Update state with the actual setting value

        // 2. Fetch flavors ONLY if a manufacturer is set
        if (currentLotm) {
          console.log(`[DealsPage] LOTM is set to "${currentLotm}". Fetching flavors...`);
          // --- CALLING THE IMPORTED SUPABASE FUNCTION ---
          const data = await getLineOfTheMonth();
          console.log('[DealsPage] Data received from getLineOfTheMonth:', data);

          setFlavors(data);
          console.log(`[DealsPage] Flavors state set with ${data.length} items.`);
        } else {
           console.log('[DealsPage] No LOTM set in settings. Skipping flavor fetch.');
           setFlavors([]);
        }

      } catch (err) {
        let errorMessage = 'Failed to load deals due to an unknown error.';
        if (err instanceof Error) {
          console.error('[DealsPage] Error fetching deals/settings:', err.message, err.stack);
          errorMessage = `Failed to load deals: ${err.message}`;
        } else {
          console.error('[DealsPage] Unknown error fetching deals/settings:', err);
        }
        setError(errorMessage);
        setFlavors([]);
        setLineOfMonthManufacturer(null);

      } finally {
        setLoading(false);
        console.log('[DealsPage] useEffect finished.');
      }
    };

    fetchDealsAndSettings();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95">
      <Navbar />

      {/* Main content area */}
      <main className="flex-1 flex flex-col p-6 overflow-auto">
        <div className="my-auto flex flex-col items-center w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-60">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2 mb-4"></div>
              <p className="text-muted-foreground">Loading deals...</p>
            </div>
          ) : error ? (
            <div className="p-8 bg-destructive/10 rounded-xl max-w-xl mx-auto text-center">
              <p className="text-destructive font-medium">{error}</p>
            </div>
          ) : (
            <div className="w-full max-w-5xl">
              {/* Deals Header Box */}
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-3">Line of the Month</h1>
                {/* Display this message only if loading is false AND no manufacturer is set */}
                {!lineOfMonthManufacturer && !loading && (
                   <p className="text-muted-foreground text-lg">No Line of the Month currently selected.</p>
                )}
              </div>

              {/* Flavor Grid - Show only if LOTM is set and flavors were found */}
              {lineOfMonthManufacturer && flavors.length > 0 ? (
                <FlavorGrid
                  flavors={flavors}
                  currentCategoryType="E-Liquid"
                />
              ) : lineOfMonthManufacturer && flavors.length === 0 && !loading ? (
                 // Handles case where LOTM is set, but no flavors were found
                <div className="text-center p-12 bg-background/50 border border-dashed border-primary/20 rounded-xl">
                  <p className="text-lg text-muted-foreground">
                    No flavors found for the selected Line of the Month ({lineOfMonthManufacturer}).
                  </p>
                </div>
              ) : null /* Don't show grid if no LOTM is set (message handled above) */ }
            </div>
          )}
        </div>
      </main>

      <BackButton />
    </div>
  );
};

export default DealsPage;
