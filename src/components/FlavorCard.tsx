
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Flavor, FlavorVariant } from '@/types/flavor';
import { useFavorites } from '@/contexts/FavoritesContext';
import { cn } from '@/lib/utils';

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
      className="flex flex-col items-center text-center dark:bg-darkBgSecondary rounded-2xl relative overflow-visible pt-[60px] pb-6 px-4 h-[260px] w-full transition-all duration-300 hover:shadow-lg"
    >
      {/* Image in top overlapping position */}
      <div className="absolute top-[-40px] left-1/2 transform -translate-x-1/2 w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 dark:border-darkBgSecondary">
        <img
          src={imageError ? '/placeholder.svg' : (flavor.imageURL || '/placeholder.svg')}
          alt={flavor.flavorName}
          className="object-cover w-full h-full"
          onError={() => setImageError(true)}
        />
        
        {/* Favorite button positioned on the image */}
        <button
          className="absolute bottom-0 right-0 p-1.5 bg-white/90 dark:bg-darkBgSecondary/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-darkBgSecondary shadow-md transition-colors z-10"
          onClick={handleFavoriteClick}
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            size={16}
            className={cn(
              "transition-colors",
              favorite ? "fill-primaryAccent text-primaryAccent" : "text-gray-400 dark:text-darkTextLight"
            )}
          />
        </button>
      </div>

      {/* Text Content Area */}
      <div className="flex flex-col items-center justify-center gap-1 flex-grow mt-2 w-full">
        {/* Name - allow wrapping with fixed height */}
        <h3 className="text-sm font-semibold dark:text-darkTextHeading leading-tight line-clamp-2 h-10 mb-1"> 
          {flavor.flavorName}
        </h3>
        
        {/* Container for Size and Price */}
        <div className="flex justify-center items-center gap-2 text-sm mb-2">
          <span className="dark:text-darkTextMuted">{displaySize}</span>
          <span className="font-semibold dark:text-darkTextHeading">{displayPrice}</span>
        </div>
        
        {/* Short Description */}
        <p className="text-xs dark:text-darkTextLight line-clamp-2 min-h-[2rem]">
          {flavor.shortDescription || flavor.description?.substring(0, 50) + '...' }
        </p>
      </div>
    </Link>
  );
};

export default FlavorCard;
