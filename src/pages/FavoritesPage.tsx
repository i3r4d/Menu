
import Navbar from '@/components/Navbar';
import FlavorGrid from '@/components/FlavorGrid';
import BackButton from '@/components/BackButton';
import { useFavorites } from '@/contexts/FavoritesContext';

const FavoritesPage = () => {
  const { favorites } = useFavorites();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {favorites.length === 0 ? (
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-2xl font-bold mb-4">Your Favorites</h1>
            <p className="text-muted-foreground">
              You haven't added any flavors to your favorites yet
            </p>
            <p className="text-sm mt-2 text-muted-foreground">
              Heart your favorite flavors to save them here
            </p>
          </div>
        ) : (
          <FlavorGrid 
            flavors={favorites} 
            title="Your Favorites"
          />
        )}
      </main>
      
      <BackButton />
    </div>
  );
};

export default FavoritesPage;
