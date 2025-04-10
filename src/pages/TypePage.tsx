
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BackButton from '@/components/BackButton';
import { flavorCategories } from '@/types/flavor';

const TypePage = () => {
  const { type } = useParams<{ type: string }>();

  // Function to get image URL based on category
  const getCategoryImage = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fruit':
        return 'https://plus.unsplash.com/premium_photo-1674228288342-d72cf144e5de?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // Fruit
      case 'dessert':
        return 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=1527&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // Dessert
      case 'breakfast':
        return 'https://images.unsplash.com/photo-1554520735-0a6b8b6ce8b7?q=80&w=1528&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // Breakfast
      case 'candy':
        return 'https://plus.unsplash.com/premium_photo-1663839539482-001199704e08?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // Candy
      case 'drinks':
        return 'https://images.unsplash.com/photo-1500217052183-bc01eee1a74e?q=80&w=1588&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // Drinks
      case 'menthol':
        return 'https://images.unsplash.com/photo-1618130070080-91f4d55a2383?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // Menthol
      case 'tobacco':
        return 'https://plus.unsplash.com/premium_photo-1668445096155-5b97bcaaeac0?q=80&w=1588&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // Tobacco
      case 'nuts':
        return 'https://images.unsplash.com/photo-1600189020840-e9918c25269d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bnV0c3xlbnwwfHwwfHx8MA%3D%3D'; // Nuts
      case 'other':
        return 'https://plus.unsplash.com/premium_photo-1661337223133-a92f4f68d001?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // Default/Other
      default:
        return 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb'; // Default fallback
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95">
      <Navbar />

      <main className="flex-1 p-6 md:p-8">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold mb-8 text-center">
            Select a Category
          </h1>
          
          {/* Specifically using a 3-column grid for categories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {Array.isArray(flavorCategories) && flavorCategories.map((category) => (
              <Link
                key={category}
                to={type ? `/type/${type}/category/${category}` : '#'}
                className="overflow-hidden rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30 border border-gray-200 group block"
              >
                <div
                  className="h-44 relative bg-gray-200"
                  style={{
                    backgroundImage: `url(${getCategoryImage(category)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-primary group-hover:bg-opacity-50 transition-all duration-300"></div>
                  <div className="relative z-10 flex items-center justify-center h-full">
                    <h2 className="text-2xl font-bold text-white text-center px-4 drop-shadow-md group-hover:scale-105 transition-transform duration-300">{category}</h2>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <BackButton />
    </div>
  );
};

export default TypePage;
