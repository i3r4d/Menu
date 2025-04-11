
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Flavor, FlavorVariant } from '@/types/flavor';
import { useFavorites } from '@/contexts/FavoritesContext';
import { cn } from '@/lib/utils';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface FlavorCardProps {
  flavor: Flavor;
  currentCategoryType: 'E-Liquid' | 'Salt Nic';
}

const FlavorCard: React.FC<FlavorCardProps> = ({ flavor, currentCategoryType }) => {
  const navigate = useNavigate();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [imageError, setImageError] = useState(false);

  // Find the relevant variant based on the current category context
  const variantToShow: FlavorVariant | undefined = flavor.variants?.find(v => v.type === currentCategoryType);

  // Determine display values with 'ml' suffix logic
  let displaySize = 'N/A';
  const rawSize = variantToShow?.size;

  if (rawSize != null && String(rawSize).trim() !== '') {
      const sizeString = String(rawSize);
      if (!sizeString.toLowerCase().includes('ml')) {
          displaySize = `${sizeString}ml`;
      } else {
          displaySize = sizeString;
      }
  }

  // Price: Format as whole number, handle potential null/undefined
  const displayPrice = variantToShow?.price != null
    ? `$${Math.round(variantToShow.price)}`
    : 'N/A';

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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
      className="group flex flex-col h-full overflow-hidden rounded-xl bg-white dark:bg-darkSurface border border-[#e0e0e0] dark:border-darkBorder hover:shadow-lg dark:hover:shadow-black/30 transition-all duration-300"
    >
      {/* Image Container with consistent aspect ratio */}
      <div className="relative overflow-hidden bg-[#f9f9f9] dark:bg-darkBgSecondary">
        <AspectRatio ratio={16/9} className="w-full">
          <img
            src={imageError ? '/placeholder.svg' : (flavor.imageURL || '/placeholder.svg')}
            alt={flavor.flavorName}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        </AspectRatio>
        
        {/* Favorite button */}
        <button
          className="absolute top-3 right-3 p-1.5 bg-white/80 dark:bg-darkBgPrimary/80 backdrop-blur-sm rounded-xl hover:bg-white dark:hover:bg-darkBgPrimary shadow-md transition-colors z-10"
          onClick={handleFavoriteClick}
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            size={20}
            className={cn(
              "transition-colors",
              favorite ? "fill-red-500 text-red-500" : "text-gray-400 dark:text-darkTextSecondary"
            )}
          />
        </button>
      </div>

      {/* Text Content */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Name */}
        <h3 className="font-semibold text-base md:text-lg mb-1.5 line-clamp-1 group-hover:text-primary dark:text-darkTextPrimary dark:group-hover:text-primaryAccent transition-colors"> 
          {flavor.flavorName}
        </h3>
        
        {/* Container for Size (Left) and Price (Right) */}
        <div className="flex justify-between items-center text-sm mb-2.5">
          <span className="text-gray-500 bg-gray-100 dark:bg-darkBgPrimary dark:text-darkTextSecondary px-2.5 py-0.5 rounded-full text-xs font-medium">{displaySize}</span>
          <span className="font-bold text-base dark:text-darkTextPrimary">{displayPrice}</span>
        </div>
        
        {/* Short Description */}
        <p className="text-sm text-gray-600 dark:text-darkTextSecondary line-clamp-2 min-h-[2.5rem] mt-auto">
          {flavor.shortDescription || flavor.description?.substring(0, 100) + '...' }
        </p>
      </div>
    </Link>
  );
};

export default FlavorCard;
