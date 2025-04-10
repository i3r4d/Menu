
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Flavor } from '@/types/flavor';

interface FavoritesContextType {
  favorites: Flavor[];
  addFavorite: (flavor: Flavor) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<Flavor[]>([]);

  // Load favorites from localStorage on initial render
  useEffect(() => {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites));
      } catch (error) {
        console.error('Error loading favorites from localStorage:', error);
        localStorage.removeItem('favorites');
      }
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (flavor: Flavor) => {
    setFavorites(prev => [...prev, flavor]);
  };

  const removeFavorite = (id: string) => {
    setFavorites(prev => prev.filter(flavor => flavor.id !== id));
  };

  const isFavorite = (id: string) => {
    return favorites.some(flavor => flavor.id === id);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
