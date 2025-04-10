import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Flavor, FlavorVariant } from '@/types/flavor'; // Explicitly import FlavorVariant if needed
import { useFavorites } from '@/contexts/FavoritesContext';
import { cn } from '@/lib/utils';

interface FlavorCardProps {
  flavor: Flavor;
  currentCategoryType: 'E-Liquid' | 'Salt Nic'; // Get the current context
}

const FlavorCard: React.FC<FlavorCardProps> = ({ flavor, currentCategoryType }) => {
  const navigate = useNavigate();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [imageError, setImageError] = useState(false);

  // Find the relevant variant based on the current category context
  const variantToShow: FlavorVariant | undefined = flavor.variants?.find(v => v.type === currentCategoryType);

  // --- UPDATED: Determine display values with 'ml' suffix logic ---
  let displaySize = 'N/A'; // Default fallback
  const rawSize = variantToShow?.size;

  if (rawSize != null && String(rawSize).trim() !== '') { // Check if size exists and is not empty
      const sizeString = String(rawSize);
      // Check if 'ml' (case-insensitive) is missing from the string
      if (!sizeString.toLowerCase().includes('ml')) {
          displaySize = `${sizeString}ml`; // Append 'ml'
      } else {
          displaySize = sizeString; // Use the size as is (it already has 'ml')
      }
  }

  // Price: Format as whole number, handle potential null/undefined
  const displayPrice = variantToShow?.price != null
    ? `$${Math.round(variantToShow.price)}` // Use Math.round() for whole number
    : 'N/A';
  // --- END OF UPDATE ---

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent link navigation when clicking the heart
    if (isFavorite(flavor.id)) {
      removeFavorite(flavor.id);
    } else {
      addFavorite(flavor);
    }
  };

  const favorite = isFavorite(flavor.id);

  return (
    <Link
        to={`/flavor/${flavor.id}`}
        className="flavor-card group flex flex-col h-full rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-card border" // Use theme variables
    >
      {/* Text content: Name, Size/Price */}
      <div className="p-3 order-1 flex-shrink-0">
          {/* Name */}
          <h3 className="text-lg font-semibold text-card-foreground mb-1 truncate group-hover:text-primary"> {/* Use theme variables */}
            {flavor.flavorName}
          </h3>
          {/* Container for Size (Left) and Price (Right) */}
          <div className="flex justify-between items-center text-sm">
            {/* Size (e.g., 100ml) - Left */}
            <span className="text-muted-foreground">{displaySize}</span> {/* This now includes 'ml' */}
            {/* Price (e.g., $25) - Right */}
            <span className="font-semibold text-card-foreground">{displayPrice}</span>
          </div>
      </div>

      {/* Image Container - Relative for positioning favorite button */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted order-2"> {/* Use theme variables */}
        <img
          src={imageError ? '/placeholder.svg' : (flavor.imageURL || '/placeholder.svg')}
          alt={flavor.flavorName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImageError(true)} // Handle image loading errors
        />
        {/* Favorite button remains positioned over image */}
        <button
          className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors z-10" // Use theme variables
          onClick={handleFavoriteClick}
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            size={20}
            className={cn(
              "transition-colors",
              favorite ? "fill-red-500 text-red-500" : "text-muted-foreground" // Use theme variable for default color
            )}
          />
        </button>
      </div>

      {/* Short Description (Moved below image) */}
      <div className="p-3 order-3 flex-shrink-0"> {/* Order 3: Bottom part */}
           {/* Ensure min-height for consistent card size even with short descriptions */}
           <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
            {flavor.shortDescription || flavor.description?.substring(0, 100) + '...' } {/* Fallback to full desc if short is missing */}
          </p>
      </div>
    </Link>
  );
};

export default FlavorCard;