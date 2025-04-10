
import { ReactNode, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Home, PlusCircle, Settings, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = sessionStorage.getItem('adminAuth') === 'true';
    
    if (!isAuthenticated) {
      navigate('/admin-portal');
    }
  }, [navigate]);
  
  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    navigate('/admin-portal');
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white shadow-md md:min-h-screen">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-teal-600">Admin Portal</h1>
        </div>
        
        <nav className="p-4 space-y-3">
          <Link to="/admin-portal/dashboard">
            <Button variant="ghost" className="w-full justify-start text-lg py-5 hover:bg-teal-500 hover:text-white">
              <Home className="mr-3 h-5 w-5" />
              Dashboard
            </Button>
          </Link>
          <Link to="/admin-portal/flavors/add">
            <Button variant="ghost" className="w-full justify-start text-lg py-5 hover:bg-teal-500 hover:text-white">
              <PlusCircle className="mr-3 h-5 w-5" />
              Add Flavor
            </Button>
          </Link>
          <Link to="/admin-portal/line-of-month">
            <Button variant="ghost" className="w-full justify-start text-lg py-5 hover:bg-teal-500 hover:text-white">
              <Box className="mr-3 h-5 w-5" />
              Line of the Month
            </Button>
          </Link>
          <Link to="/admin-portal/settings">
            <Button variant="ghost" className="w-full justify-start text-lg py-5 hover:bg-teal-500 hover:text-white">
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </Button>
          </Link>
          
          <hr className="my-6" />
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-lg py-5 text-red-500 hover:bg-red-500 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </nav>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{title}</h1>
        </div>
        
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
