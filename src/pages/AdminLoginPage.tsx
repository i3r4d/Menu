
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyAdminPassword } from '@/services/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const AdminLoginPage = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a password',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const isValid = await verifyAdminPassword(password);
      
      if (isValid) {
        // Store auth state in session storage
        sessionStorage.setItem('adminAuth', 'true');
        navigate('/admin-portal/dashboard');
      } else {
        toast({
          title: 'Authentication Failed',
          description: 'The password you entered is incorrect',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Error',
        description: 'An error occurred during login',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Admin Portal</h1>
          <p className="mt-2 text-gray-600">Enter your password to continue</p>
          <p className="mt-1 text-sm text-teal-600">Use password: "test" for this demo</p>
        </div>
        
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 text-lg py-6"
              required
            />
          </div>
          
          <Button
            type="submit"
            className="w-full py-6 text-lg bg-teal-600 hover:bg-teal-700"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-base text-gray-500 hover:text-teal-600 hover:bg-gray-100"
          >
            Return to Main Menu
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
