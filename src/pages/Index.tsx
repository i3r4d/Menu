
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const Index = () => {
  // Background image URLs for category cards
  const getCategoryImage = (type: string) => {
    if (type === 'E-Liquid') {
      return 'https://sdmntpraustraliaeast.oaiusercontent.com/files/00000000-d1ec-51fa-9762-e6d178ffeeeb/raw?se=2025-04-09T20%3A38%3A12Z&sp=r&sv=2024-08-04&sr=b&scid=f3c422a6-fd68-5e3e-87c1-055272c0b3df&skoid=d958ec58-d47c-4d2f-a9f2-7f3e03fdcf72&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-04-09T17%3A58%3A51Z&ske=2025-04-10T17%3A58%3A51Z&sks=b&skv=2024-08-04&sig=piGjCP2ep00kdxL3Kq/1dDmKX0mPmEsA98L1LzNUYLU%3D'; // Yellow lights, atmospheric
    } else if (type === 'Salt-Nic') {
      return 'https://images.unsplash.com/photo-1590346313583-492cdf7c5f6b?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // River between mountains
    }
    return '';
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      
      <main className="flex-1 flex flex-col justify-center px-4 py-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Link to="/type/E-Liquid">
              <div 
                className="category-card h-64 md:h-80 border border-blue-100 group relative overflow-hidden rounded-lg"
                style={{
                  backgroundImage: `url(${getCategoryImage('E-Liquid')})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-teal-500 group-hover:bg-opacity-60 transition-all duration-200"></div>
                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-md">E-Liquid</h2>
                </div>
              </div>
            </Link>
            
            <Link to="/type/Salt-Nic">
              <div 
                className="category-card h-64 md:h-80 border border-orange-100 group relative overflow-hidden rounded-lg"
                style={{
                  backgroundImage: `url(${getCategoryImage('Salt-Nic')})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-teal-500 group-hover:bg-opacity-60 transition-all duration-200"></div>
                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-md">Salt Nic</h2>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
