
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/ThemeContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { getManufacturers, getSettings, updateSettings } from '@/services/supabase';
import { Manufacturer, SettingsData } from '@/integrations/supabase/types';

const AdminSettings = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState<SettingsData>({
    logoURL: '',
    lineOfTheMonth: ''
  });
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const settingsData = await getSettings();
        if (settingsData) {
          setSettings(settingsData);
        }
        
        const manufacturersData = await getManufacturers();
        setManufacturers(manufacturersData);
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value: string) => {
    setSettings(prev => ({
      ...prev,
      lineOfTheMonth: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(settings);
      toast.success('Settings updated successfully');
      // Redirect to dashboard or refresh settings
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout title="Settings">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-darkSurface rounded-xl shadow-md p-6 max-w-2xl dark:text-darkTextPrimary">
          <div className="space-y-6">
            {/* Logo URL Setting */}
            <div className="space-y-2">
              <Label htmlFor="logoURL" className="text-lg font-medium dark:text-darkTextPrimary">Logo URL</Label>
              <Input
                id="logoURL"
                name="logoURL"
                value={settings.logoURL || ''}
                onChange={handleInputChange}
                placeholder="Enter logo image URL"
                className="dark:bg-darkBgPrimary dark:border-darkBorder"
              />
              <p className="text-sm text-gray-500 dark:text-darkTextSecondary">
                Enter a URL for your store logo image
              </p>
            </div>
            
            {/* Line of the Month Setting */}
            <div className="space-y-2">
              <Label htmlFor="lineOfTheMonth" className="text-lg font-medium dark:text-darkTextPrimary">Line of the Month</Label>
              <Select 
                value={settings.lineOfTheMonth || ''} 
                onValueChange={handleSelectChange}
              >
                <SelectTrigger 
                  id="lineOfTheMonth"
                  className="dark:bg-darkBgPrimary dark:border-darkBorder dark:text-darkTextPrimary"
                >
                  <SelectValue placeholder="Select manufacturer" />
                </SelectTrigger>
                <SelectContent className="dark:bg-darkBgSecondary dark:border-darkBorder">
                  <SelectItem value="">None</SelectItem>
                  {manufacturers.map((manufacturer) => (
                    <SelectItem 
                      key={manufacturer.id} 
                      value={manufacturer.name}
                      className="dark:text-darkTextPrimary dark:hover:bg-darkBgPrimary"
                    >
                      {manufacturer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 dark:text-darkTextSecondary">
                Feature a manufacturer on the Deals page
              </p>
            </div>

            {/* Dark Mode Toggle - New Addition */}
            <div className="space-y-2 pt-4 border-t dark:border-darkBorder">
              <div className="flex items-center justify-between">
                <Label htmlFor="darkMode" className="text-lg font-medium dark:text-darkTextPrimary">
                  Dark Mode
                </Label>
                <Switch
                  id="darkMode"
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                  className="data-[state=checked]:bg-primaryAccent"
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-darkTextSecondary">
                Toggle between light and dark theme
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6">
              <Button
                variant="outline"
                onClick={() => navigate('/admin-portal/dashboard')}
                className="dark:bg-darkBgPrimary dark:border-darkBorder dark:text-darkTextSecondary"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="dark:bg-primaryAccent dark:text-white"
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminSettings;
