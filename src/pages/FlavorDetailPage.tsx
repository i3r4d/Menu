import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Added useNavigate for better back button
import { Heart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flavor, FlavorVariant } from '@/types/flavor'; // Ensure FlavorVariant is imported
import { useFavorites } from '@/contexts/FavoritesContext';
import { cn } from '@/lib/utils';
// --- ADDED Supabase Import ---
import { getFlavorById } from '@/services/supabase.ts'; // Adjust path if necessary

const FlavorDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate(); // Use navigate for error handling back button
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [flavor, setFlavor] = useState<Flavor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchFlavor = async () => {
      if (!id) {
        setError('Flavor ID is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null); // Reset error on new fetch

        // --- UPDATED: Fetch using Supabase ---
        const fetchedFlavor = await getFlavorById(id);

        if (fetchedFlavor) {
          setFlavor(fetchedFlavor);
        } else {
          setError('Flavor not found');
        }
      } catch (err) {
        console.error('Error fetching flavor:', err);
        const message = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to load flavor details: ${message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchFlavor();
  }, [id]);

  const handleFavoriteToggle = () => {
    if (!flavor) return;

    if (isFavorite(flavor.id)) {
      removeFavorite(flavor.id);
    } else {
      addFavorite(flavor);
    }
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2"></div>
        </div>
         <BackButton /> {/* Keep back button accessible */}
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error || !flavor) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex flex-col justify-center items-center text-center px-4">
          <p className="text-destructive text-lg mb-4">{error || 'Flavor details could not be loaded.'}</p>
          <Button onClick={() => navigate(-1)} variant="outline"> {/* Use navigate(-1) for reliable back */}
            Go Back
          </Button>
        </div>
         <BackButton /> {/* Keep back button accessible */}
      </div>
    );
  }

  // --- SUCCESS STATE ---
  const favorite = isFavorite(flavor.id);

  // Separate variants by type for clearer display
  const eliquidVariants = flavor.variants?.filter(v => v.type === 'E-Liquid') || [];
  const saltNicVariants = flavor.variants?.filter(v => v.type === 'Salt Nic') || [];

  // Helper function to format size (avoids repeating logic)
  const formatDisplaySize = (rawSize: string | number | null | undefined): string => {
      if (rawSize == null || String(rawSize).trim() === '') {
          return 'N/A';
      }
      const sizeString = String(rawSize);
      if (!sizeString.toLowerCase().includes('ml') && /^\d+(\.\d+)?$/.test(sizeString)) { // Check if it's a number (integer or decimal) and doesn't have 'ml'
          return `${sizeString}ml`;
      }
      return sizeString; // Return as is if it has 'ml' or isn't just a number
  };


  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          {/* Use card component styling for consistency */}
          <div className="bg-card rounded-xl shadow-lg overflow-hidden border">
            <div className="md:flex">
              {/* Image Section */}
              <div className="md:w-1/2 relative">
                <div className="aspect-square bg-muted flex items-center justify-center"> {/* Added aspect ratio and background */}
                    <img
                    src={imageError ? '/placeholder.svg' : flavor.imageURL}
                    alt={flavor.flavorName}
                    className="max-h-full max-w-full object-contain" // Changed object-cover to contain
                    onError={() => setImageError(true)}
                    />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleFavoriteToggle}
                  className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-full h-10 w-10 shadow-md border" // Use theme variables
                >
                  <Heart
                    size={20}
                    className={cn(
                      favorite ? "fill-red-500 text-red-500" : "text-muted-foreground" // Use theme variables
                    )}
                  />
                </Button>
              </div>

              {/* Details Section */}
              <div className="p-6 md:w-1/2 flex flex-col">
                 {/* Top Info: Name, Manufacturer */}
                 <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-card-foreground mb-1">{flavor.flavorName}</h1>
                    <p className="text-sm text-muted-foreground">By {flavor.manufacturer}</p>
                  </div>
                  {/* Badge removed in previous step */}
                 </div>

                {/* Full Description */}
                <p className="text-muted-foreground mt-2 mb-6">{flavor.description}</p>

                {/* Detail Badges: VG/PG, Categories */}
                <div className="border-t pt-4 mb-6">
                   <h3 className="text-lg font-semibold mb-3 text-card-foreground">Details</h3>
                   <div className="flex flex-wrap gap-4 items-start">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">VG/PG Ratio</p>
                            <Badge variant="secondary">{flavor.vgPgRatio || 'N/A'}</Badge>
                        </div>
                         {flavor.categories && flavor.categories.length > 0 && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Categories</p>
                                <div className="flex flex-wrap gap-1">
                                {flavor.categories.map(category => (
                                    <Badge key={category} variant="secondary" className="text-xs">
                                    {category}
                                    </Badge>
                                ))}
                                </div>
                            </div>
                         )}
                   </div>
                </div>

                {/* Available Options (Variants) */}
                 {(eliquidVariants.length > 0 || saltNicVariants.length > 0) && (
                    <div className="border-t pt-4">
                        <h3 className="text-lg font-semibold mb-3 text-card-foreground">Available Options</h3>

                        {/* E-Liquid Variants */}
                        {eliquidVariants.length > 0 && (
                            <div className="mb-4">
                                <h4 className="text-md font-medium mb-2 text-card-foreground">E-Liquid</h4>
                                <div className="space-y-2">
                                    {eliquidVariants.map((variant, index) => (
                                    <div key={`eliquid-var-${index}`} className="flex flex-wrap justify-between items-center text-sm border-b pb-1 last:border-b-0">
                                        {/* --- CHANGE MADE HERE: Removed text-muted-foreground --- */}
                                        <span className="mr-2"> {/* Removed text-muted-foreground */}
                                            {formatDisplaySize(variant.size)} / ${Math.round(variant.price)}
                                        </span>
                                        {/* --- END OF CHANGE --- */}
                                        <div className="flex flex-wrap gap-1">
                                        {variant.nicLevels.map(level => (
                                            <Badge key={`eliquid-nic-${level}`} variant="outline" className="text-xs">
                                            {level}mg
                                            </Badge>
                                        ))}
                                        </div>
                                    </div>
                                    ))}
                                </div>
                            </div>
                        )}

                         {/* Salt Nic Variants */}
                         {saltNicVariants.length > 0 && (
                            <div>
                                <h4 className="text-md font-medium mb-2 text-card-foreground">Salt Nic</h4>
                                 <div className="space-y-2">
                                    {saltNicVariants.map((variant, index) => (
                                    <div key={`salt-var-${index}`} className="flex flex-wrap justify-between items-center text-sm border-b pb-1 last:border-b-0">
                                        {/* --- CHANGE MADE HERE: Removed text-muted-foreground --- */}
                                        <span className="mr-2"> {/* Removed text-muted-foreground */}
                                             {formatDisplaySize(variant.size)} / ${Math.round(variant.price)}
                                        </span>
                                        {/* --- END OF CHANGE --- */}
                                        <div className="flex flex-wrap gap-1">
                                        {variant.nicLevels.map(level => (
                                            <Badge key={`salt-nic-${level}`} variant="outline" className="text-xs">
                                            {level}mg
                                            </Badge>
                                        ))}
                                        </div>
                                    </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                 )}
                {/* End Available Options Section */}

              </div> {/* End Details Section */}
            </div> {/* End md:flex */}
          </div> {/* End Card */}
        </div> {/* End max-w-5xl */}
      </main>

      <BackButton />
    </div>
  );
};

export default FlavorDetailPage;