
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flavor, FlavorVariant } from '@/types/flavor';
import { useFavorites } from '@/contexts/FavoritesContext';
import { cn } from '@/lib/utils';
import { getFlavorById } from '@/services/supabase.ts';

const FlavorDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
        setError(null);

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

  // LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2 mb-4"></div>
            <p className="text-muted-foreground">Loading flavor details...</p>
          </div>
        </div>
        <BackButton />
      </div>
    );
  }

  // ERROR STATE
  if (error || !flavor) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95">
        <Navbar />
        <div className="flex-1 flex flex-col justify-center items-center text-center px-4">
          <div className="p-8 bg-destructive/10 rounded-xl max-w-xl mx-auto">
            <p className="text-destructive font-medium mb-4">{error || 'Flavor details could not be loaded.'}</p>
            <Button onClick={() => navigate(-1)} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
        <BackButton />
      </div>
    );
  }

  // SUCCESS STATE
  const favorite = isFavorite(flavor.id);

  // Separate variants by type for clearer display
  const eliquidVariants = flavor.variants?.filter(v => v.type === 'E-Liquid') || [];
  const saltNicVariants = flavor.variants?.filter(v => v.type === 'Salt Nic') || [];

  // Helper function to format size
  const formatDisplaySize = (rawSize: string | number | null | undefined): string => {
      if (rawSize == null || String(rawSize).trim() === '') {
          return 'N/A';
      }
      const sizeString = String(rawSize);
      if (!sizeString.toLowerCase().includes('ml') && /^\d+(\.\d+)?$/.test(sizeString)) {
          return `${sizeString}ml`;
      }
      return sizeString;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Product Detail Card */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
            <div className="md:flex">
              {/* Image Section */}
              <div className="md:w-2/5 relative bg-[#f9f9f9]">
                <div className="aspect-square flex items-center justify-center p-6">
                  <img
                    src={imageError ? '/placeholder.svg' : flavor.imageURL}
                    alt={flavor.flavorName}
                    className="max-h-full max-w-full object-contain"
                    onError={() => setImageError(true)}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleFavoriteToggle}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full h-10 w-10 shadow-md border"
                >
                  <Heart
                    size={20}
                    className={cn(
                      favorite ? "fill-red-500 text-red-500" : "text-gray-400"
                    )}
                  />
                </Button>
              </div>

              {/* Details Section */}
              <div className="p-6 md:w-3/5 flex flex-col">
                {/* Top Info: Name, Manufacturer */}
                <div className="mb-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">{flavor.flavorName}</h1>
                    {flavor.manufacturer && (
                      <Badge variant="outline" className="font-medium text-xs py-1 px-2">
                        By {flavor.manufacturer}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Full Description */}
                <p className="text-gray-600 mt-2 mb-6">{flavor.description}</p>

                {/* Detail Badges: VG/PG, Categories */}
                <div className="border-t border-gray-100 pt-4 mb-6">
                   <h3 className="text-lg font-semibold mb-3 text-gray-800">Details</h3>
                   <div className="flex flex-wrap gap-4 items-start">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">VG/PG Ratio</p>
                            <Badge variant="secondary" className="bg-primary/5 text-primary hover:bg-primary/10">{flavor.vgPgRatio || 'N/A'}</Badge>
                        </div>
                         {flavor.categories && flavor.categories.length > 0 && (
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Categories</p>
                                <div className="flex flex-wrap gap-1">
                                {flavor.categories.map(category => (
                                    <Badge key={category} variant="secondary" className="bg-primary/5 text-primary hover:bg-primary/10 text-xs">
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
                    <div className="border-t border-gray-100 pt-4">
                        <h3 className="text-lg font-semibold mb-3 text-gray-800">Available Options</h3>

                        {/* E-Liquid Variants */}
                        {eliquidVariants.length > 0 && (
                            <div className="mb-4">
                                <h4 className="text-md font-medium mb-2 text-gray-700">E-Liquid</h4>
                                <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
                                    {eliquidVariants.map((variant, index) => (
                                    <div key={`eliquid-var-${index}`} className="flex flex-wrap justify-between items-center text-sm border-b border-gray-200 pb-2 last:border-b-0 last:pb-0">
                                        <span className="mr-2 font-medium">
                                            {formatDisplaySize(variant.size)} / ${Math.round(variant.price)}
                                        </span>
                                        <div className="flex flex-wrap gap-1">
                                        {variant.nicLevels.map(level => (
                                            <Badge key={`eliquid-nic-${level}`} variant="outline" className="text-xs bg-white">
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
                                <h4 className="text-md font-medium mb-2 text-gray-700">Salt Nic</h4>
                                 <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
                                    {saltNicVariants.map((variant, index) => (
                                    <div key={`salt-var-${index}`} className="flex flex-wrap justify-between items-center text-sm border-b border-gray-200 pb-2 last:border-b-0 last:pb-0">
                                        <span className="mr-2 font-medium">
                                             {formatDisplaySize(variant.size)} / ${Math.round(variant.price)}
                                        </span>
                                        <div className="flex flex-wrap gap-1">
                                        {variant.nicLevels.map(level => (
                                            <Badge key={`salt-nic-${level}`} variant="outline" className="text-xs bg-white">
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
              </div>
            </div>
          </div>
        </div>
      </main>

      <BackButton />
    </div>
  );
};

export default FlavorDetailPage;
