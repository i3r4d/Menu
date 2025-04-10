
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getLogoURL } from '@/services/supabase';
import { useFavorites } from '@/contexts/FavoritesContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Navbar = () => {
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  const [logoURL, setLogoURL] = useState('');

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
    }
  };

  return (
    <nav className="sticky top-0 z-10 bg-white shadow-md px-6 py-4">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              {logoURL ? (
                <AvatarImage 
                  src={logoURL} 
                  alt="Logo"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : null}
              <AvatarFallback className="bg-primary text-white text-2xl font-bold">
                FF
              </AvatarFallback>
            </Avatar>
          </Link>
          
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="nav-item text-lg font-bold px-6 py-6 border-gray-300 hover:bg-primary hover:text-white hover:border-primary"
            >
              Flavors
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/new')}
              className="nav-item text-lg font-bold px-6 py-6 border-gray-300 hover:bg-primary hover:text-white hover:border-primary"
            >
              New
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/deals')}
              className="nav-item text-lg font-bold px-6 py-6 border-gray-300 hover:bg-primary hover:text-white hover:border-primary"
            >
              Deals
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="search"
              placeholder="Search flavors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input w-full md:w-[250px] lg:w-[350px] h-12 text-lg font-bold pl-4 pr-12 border border-gray-300 shadow-sm"
            />
            <button 
              type="submit" 
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary"
            >
              <Search size={24} />
            </button>
          </form>
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/favorites')}
            className="relative p-3 h-12 w-12 border-gray-300 hover:bg-primary hover:text-white hover:border-primary"
            aria-label="Favorites"
          >
            <Heart size={28} />
            {favorites.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-sm rounded-full h-6 w-6 flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </Button>
        </div>
      </div>
      
      <div className="md:hidden flex justify-center mt-4 space-x-3">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="nav-item text-base font-bold px-4 py-5 border-gray-300 hover:bg-primary hover:text-white hover:border-primary"
        >
          Flavors
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate('/new')}
          className="nav-item text-base font-bold px-4 py-5 border-gray-300 hover:bg-primary hover:text-white hover:border-primary"
        >
          New
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate('/deals')}
          className="nav-item text-base font-bold px-4 py-5 border-gray-300 hover:bg-primary hover:text-white hover:border-primary"
        >
          Deals
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
