
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95 dark:from-darkBgPrimary dark:to-darkBgPrimary/95">
      <Navbar />
      
      <main className="flex-1 flex flex-col justify-center items-center p-6 md:p-8">
        <div className="container max-w-6xl mx-auto">
          {/* Headline & Description */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800 dark:text-darkTextHeading">Browse Our Selection</h1>
            <p className="text-xl text-gray-600 dark:text-darkTextMuted max-w-2xl mx-auto">Choose between E-Liquid and Salt Nicotine options</p>
          </div>
          
          {/* Type Selection Cards in a 2-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* E-Liquid Card */}
            <Link to="/type/E-Liquid">
              <div 
                className="relative h-80 md:h-96 overflow-hidden rounded-2xl shadow-lg dark:shadow-black/30 transition-transform duration-200 ease-in-out hover:scale-[1.03] hover:shadow-lg"
                style={{
                  backgroundImage: `url(${getCategoryImage('E-Liquid')})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20"></div>
                
                {/* Content */}
                <div className="absolute inset-0 flex items-center justify-center text-white p-8">
                  <h2 className="text-4xl md:text-5xl font-bold transform drop-shadow-md">E-Liquid</h2>
                </div>
              </div>
            </Link>
            
            {/* Salt Nic Card */}
            <Link to="/type/Salt-Nic">
              <div 
                className="relative h-80 md:h-96 overflow-hidden rounded-2xl shadow-lg dark:shadow-black/30 transition-transform duration-200 ease-in-out hover:scale-[1.03] hover:shadow-lg"
                style={{
                  backgroundImage: `url(${getCategoryImage('Salt-Nic')})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20"></div>
                
                {/* Content */}
                <div className="absolute inset-0 flex items-center justify-center text-white p-8">
                  <h2 className="text-4xl md:text-5xl font-bold transform drop-shadow-md">Salt Nic</h2>
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
