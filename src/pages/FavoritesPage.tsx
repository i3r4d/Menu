
import Navbar from '@/components/Navbar';
import FlavorGrid from '@/components/FlavorGrid';
import BackButton from '@/components/BackButton';
import { useFavorites } from '@/contexts/FavoritesContext';

const FavoritesPage = () => {
  const { favorites } = useFavorites();
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95 dark:from-darkBgPrimary dark:to-darkBgPrimary/95">
      <Navbar />
      
      <main className="flex-1 p-6 pt-8">
        {favorites.length === 0 ? (
          <div className="container mx-auto px-4 py-16 text-center max-w-xl">
            <h1 className="text-3xl font-bold mb-6 dark:text-darkTextHeading">Your Favorites</h1>
            <div className="p-12 bg-background/50 dark:bg-darkBgSecondary border border-dashed border-primary/20 dark:border-darkBorder rounded-xl">
              <p className="text-xl text-muted-foreground dark:text-darkTextMuted mb-4">
                You haven't added any flavors to your favorites yet
              </p>
              <p className="text-muted-foreground dark:text-darkTextLight">
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
