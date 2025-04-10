
import { Fragment } from 'react';
import { X, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '@/contexts/FavoritesContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function FavoritesModal() {
  const { favorites, removeFavorite } = useFavorites();
  const navigate = useNavigate();
  
  const handleViewFlavor = (id: string) => {
    navigate(`/flavor/${id}`);
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="relative p-2" aria-label="Favorites">
          <Heart size={24} />
          {favorites.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {favorites.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Your Favorites</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {favorites.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No favorites yet</p>
              <p className="text-sm mt-2">
                Heart your favorite flavors to save them here
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {favorites.map((flavor) => (
                <li key={flavor.id} className="flex items-center gap-3 p-2 hover:bg-secondary rounded-md">
                  <div 
                    className="h-12 w-12 rounded-md overflow-hidden bg-muted cursor-pointer"
                    onClick={() => handleViewFlavor(flavor.id)}
                  >
                    <img 
                      src={flavor.imageURL} 
                      alt={flavor.flavorName}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => handleViewFlavor(flavor.id)}
                  >
                    <p className="font-medium text-sm">{flavor.flavorName}</p>
                    <p className="text-xs text-muted-foreground">{flavor.type}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeFavorite(flavor.id)}
                  >
                    <X size={16} />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
