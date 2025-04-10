
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Heart, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getLogoURL } from '@/services/supabase';
import { useFavorites } from '@/contexts/FavoritesContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  const [logoURL, setLogoURL] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const url = await getLogoURL();
        setLogoURL(url);
      } catch (error) {
        console.error('Error fetching logo URL:', error);
      }
    };
    
    fetchLogo();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "New", path: "/new" },
    { name: "Deals", path: "/deals" }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm px-4 sm:px-6 py-4">
      {/* Desktop Navbar */}
      <div className="container mx-auto">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-sm">
              {logoURL ? (
                <AvatarImage 
                  src={logoURL} 
                  alt="Logo"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : null}
              <AvatarFallback className="bg-primary text-white text-xl font-bold">
                FF
              </AvatarFallback>
            </Avatar>
          </Link>
          
          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <Button 
                key={item.path}
                variant="ghost" 
                onClick={() => navigate(item.path)}
                className="text-lg font-bold hover:bg-primary hover:text-white transition-colors"
              >
                {item.name}
              </Button>
            ))}
          </div>
          
          {/* Search & Favorites */}
          <div className="flex items-center gap-3">
            {/* Search Form - Tablet/Desktop */}
            <form onSubmit={handleSearch} className="relative hidden sm:block">
              <Input
                type="search"
                placeholder="Search flavors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-[200px] lg:w-[300px] h-10 pl-4 pr-10 rounded-full border border-gray-300 dark:border-gray-700 shadow-sm focus-visible:ring-primary"
              />
              <button 
                type="submit" 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-primary"
              >
                <Search size={18} />
              </button>
            </form>
            
            {/* Favorites Button */}
            <Button 
              variant="ghost" 
              onClick={() => navigate('/favorites')}
              className="relative p-2 h-10 w-10 rounded-full hover:bg-primary hover:text-white"
              aria-label="Favorites"
            >
              <Heart size={22} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Button>
            
            {/* Mobile Menu Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80vw] sm:w-[350px] pt-12 dark:bg-gray-900 dark:text-gray-100">
                <div className="flex flex-col h-full">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="mb-6">
                    <div className="relative">
                      <Input
                        type="search"
                        placeholder="Search flavors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-4 pr-10 rounded-lg border border-gray-300 dark:border-gray-700"
                      />
                      <button 
                        type="submit" 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                      >
                        <Search size={18} />
                      </button>
                    </div>
                  </form>
                  
                  {/* Mobile Nav Links */}
                  <div className="space-y-2">
                    {navItems.map((item) => (
                      <Button 
                        key={item.path}
                        variant="ghost"
                        className="w-full justify-start text-left text-lg font-bold h-12"
                        onClick={() => {
                          navigate(item.path);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        {item.name}
                      </Button>
                    ))}
                    <Button 
                      variant="ghost"
                      className="w-full justify-start text-left text-lg font-bold h-12"
                      onClick={() => {
                        navigate('/favorites');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Favorites
                      {favorites.length > 0 && (
                        <span className="ml-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {favorites.length}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
