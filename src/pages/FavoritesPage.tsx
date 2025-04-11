
import Navbar from '@/components/Navbar';
import FlavorGrid from '@/components/FlavorGrid';
import BackButton from '@/components/BackButton';
import { useFavorites } from '@/contexts/FavoritesContext';

const FavoritesPage = () => {
  const { favorites } = useFavorites();
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95 dark:from-darkBgPrimary dark:to-darkBgSecondary">
      <Navbar />
      
      <main className="flex-1 p-6 pt-8">
        {favorites.length === 0 ? (
          <div className="container mx-auto px-4 py-16 text-center max-w-xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 dark:text-darkTextPrimary">Your Favorites</h1>
            <div className="p-12 bg-background/50 dark:bg-darkSurface/70 border border-dashed border-primary/20 dark:border-darkBorder/50 rounded-xl">
              <p className="text-xl text-muted-foreground dark:text-darkTextPrimary mb-4">
                You haven't added any flavors to your favorites yet
              </p>
              <p className="text-muted-foreground dark:text-darkTextSecondary">
                Heart your favorite flavors to save them here
              </p>
            </div>
          </div>
        ) : (
          <FlavorGrid 
            flavors={favorites} 
            title="Your Favorites"
            currentCategoryType="E-Liquid"
          />
        )}
      </main>
      
      <BackButton />
    </div>
  );
};

export default FavoritesPage;
