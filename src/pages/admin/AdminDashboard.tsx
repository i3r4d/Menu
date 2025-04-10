
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getAllFlavors, deleteFlavor } from '@/services/supabase';
import { Flavor } from '@/types/flavor';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const AdminDashboard = () => {
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [flavorToDelete, setFlavorToDelete] = useState<Flavor | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchFlavors();
  }, []);
  
  const fetchFlavors = async () => {
    try {
      setLoading(true);
      const data = await getAllFlavors();
      setFlavors(data);
    } catch (err) {
      console.error('Error fetching flavors:', err);
      setError('Failed to load flavors');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteClick = (flavor: Flavor) => {
    setFlavorToDelete(flavor);
  };
  
  const confirmDelete = async () => {
    if (!flavorToDelete) return;
    
    try {
      await deleteFlavor(flavorToDelete.id);
      setFlavors(flavors.filter(f => f.id !== flavorToDelete.id));
      toast({
        title: 'Flavor deleted',
        description: `${flavorToDelete.flavorName} has been removed`,
      });
    } catch (err) {
      console.error('Error deleting flavor:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete flavor',
        variant: 'destructive',
      });
    } finally {
      setFlavorToDelete(null);
    }
  };
  
  const cancelDelete = () => {
    setFlavorToDelete(null);
  };
  
  const filteredFlavors = flavors.filter(flavor => 
    flavor.flavorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flavor.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <AdminLayout title="Dashboard">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Manage Flavors</h2>
          <Link to="/admin-portal/flavors/add">
            <Button>Add New Flavor</Button>
          </Link>
        </div>
        
        <div className="mb-4">
          <Input
            placeholder="Search flavors..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary border-r-2"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-destructive">{error}</p>
            <Button onClick={fetchFlavors} className="mt-4">
              Retry
            </Button>
          </div>
        ) : filteredFlavors.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">
              {searchTerm ? 'No flavors match your search' : 'No flavors found'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Name</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Manufacturer</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Type</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Categories</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFlavors.map(flavor => (
                  <tr key={flavor.id}>
                    <td className="px-4 py-3 text-sm">{flavor.flavorName}</td>
                    <td className="px-4 py-3 text-sm">{flavor.manufacturer}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant="outline">{flavor.type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {flavor.categories.slice(0, 2).map(category => (
                          <Badge key={category} variant="secondary" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                        {flavor.categories.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{flavor.categories.length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/admin-portal/flavors/edit/${flavor.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit size={16} />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteClick(flavor)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Delete confirmation dialog */}
      <Dialog open={!!flavorToDelete} onOpenChange={open => !open && cancelDelete()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{flavorToDelete?.flavorName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminDashboard;
