
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Heart, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getLogoURL } from '@/services/supabase';
import { useFavorites } from '@/contexts/FavoritesContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const { theme } = useTheme();
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
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-darkSurface backdrop-blur-md shadow-sm px-4 sm:px-6 lg:px-8 py-5">
      {/* Desktop Navbar */}
      <div className="container mx-auto">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Avatar className="h-12 w-12 border-2 border-primary/20 dark:border-primaryAccent/20 shadow-sm">
              {logoURL ? (
                <AvatarImage 
                  src={logoURL} 
                  alt="Logo"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : null}
              <AvatarFallback className="bg-primary dark:bg-primaryAccent text-white text-xl font-bold">
                FF
              </AvatarFallback>
            </Avatar>
            <span className="ml-3 text-xl font-bold dark:text-darkTextPrimary hidden sm:block">KV Menu</span>
          </Link>
          
          {/* Search Form - Tablet/Desktop */}
          <form onSubmit={handleSearch} className="relative hidden sm:block flex-grow max-w-md mx-4">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search flavors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl dark:bg-darkBgPrimary dark:border-darkBorder dark:text-darkTextPrimary dark:placeholder:text-darkTextSecondary"
              />
              <Search 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-primaryAccent" 
                size={18} 
              />
            </div>
          </form>
          
          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Button 
                key={item.path}
                variant="ghost" 
                onClick={() => navigate(item.path)}
                className="text-base font-medium hover:bg-transparent hover:text-primary dark:text-darkTextSecondary dark:hover:text-darkTextPrimary"
              >
                {item.name}
              </Button>
            ))}
            
            {/* Favorites Button */}
            <Button 
              variant="ghost" 
              onClick={() => navigate('/favorites')}
              className="relative p-2 h-10 w-10 rounded-xl hover:bg-transparent hover:text-primary dark:text-darkTextSecondary dark:hover:text-primaryAccent"
              aria-label="Favorites"
            >
              <Heart size={24} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary dark:bg-primaryAccent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Button>
          </div>
          
          {/* Mobile Menu Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu size={24} className="dark:text-darkTextPrimary" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80vw] sm:w-[350px] pt-12 dark:bg-darkBgSecondary dark:text-darkTextPrimary">
              <div className="flex flex-col h-full">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="mb-6">
                  <div className="relative">
                    <Input
                      type="search"
                      placeholder="Search flavors..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-12 pl-12 pr-4 rounded-xl dark:bg-darkBgPrimary dark:border-darkBorder dark:text-darkTextPrimary dark:placeholder:text-darkTextSecondary"
                    />
                    <Search 
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-primaryAccent" 
                      size={18} 
                    />
                  </div>
                </form>
                
                {/* Mobile Nav Links */}
                <div className="space-y-2">
                  {navItems.map((item) => (
                    <Button 
                      key={item.path}
                      variant="ghost"
                      className="w-full justify-start text-left text-lg font-bold h-12 dark:text-darkTextSecondary dark:hover:text-darkTextPrimary"
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
                    className="w-full justify-start text-left text-lg font-bold h-12 dark:text-darkTextSecondary dark:hover:text-darkTextPrimary"
                    onClick={() => {
                      navigate('/favorites');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Favorites
                    {favorites.length > 0 && (
                      <span className="ml-2 bg-primary dark:bg-primaryAccent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
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
    </nav>
  );
};

export default Navbar;
