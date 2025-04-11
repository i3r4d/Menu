
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { getSettings, updateSettings, getUniqueManufacturers, SettingsData } from '@/services/supabase.ts';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const AdminSettings = () => {
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [manufacturers, setManufacturers] = useState<string[]>(['None']);
  const [settings, setSettings] = useState<Partial<SettingsData>>({
    logoURL: '',
    lineOfTheMonth: null,
  });

  // Fetch settings and manufacturers on component mount
  const loadData = useCallback(async () => {
    setLoading(true);
    setImageError(false);
    try {
      // Fetch settings using the generic function
      const fetchedSettings = await getSettings();
      if (fetchedSettings) {
        setSettings({
          logoURL: fetchedSettings.logoURL || '',
          lineOfTheMonth: fetchedSettings.lineOfTheMonth || null,
        });
      } else {
         setSettings({ logoURL: '', lineOfTheMonth: null });
      }

      // Fetch manufacturers
      const fetchedManufacturers = await getUniqueManufacturers();
      setManufacturers(['None', ...fetchedManufacturers]);

    } catch (error) {
      console.error("Error loading settings page data:", error);
      toast({
        title: 'Error Loading Data',
        description: error instanceof Error ? error.message : 'Could not load settings or manufacturers.',
        variant: 'destructive',
      });
       setManufacturers(['None']);
       setSettings({ logoURL: '', lineOfTheMonth: null });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle changes for Input fields (like logoURL)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
     if (name === 'logoURL') {
        setImageError(false);
    }
  };

  // Handle change for the Line of the Month Select dropdown
  const handleLineChange = (value: string) => {
    setSettings(prev => ({ ...prev, lineOfTheMonth: value === 'None' ? null : value }));
  };

  // Handle saving all settings
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      // Prepare data using camelCase keys
      const dataToSave: Partial<SettingsData> = {
        logoURL: settings.logoURL?.trim() || null,
        lineOfTheMonth: settings.lineOfTheMonth, // Already null for 'None' from state logic
      };

      // Call the generic updateSettings function
      await updateSettings(dataToSave);
      toast({ title: 'Success', description: 'Settings updated successfully.' });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: 'Error Saving Settings',
        description: error instanceof Error ? error.message : 'Could not save settings.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Global Settings">
      <div className="bg-card text-card-foreground dark:bg-darkBgSecondary dark:text-darkTextHeading rounded-lg shadow p-6 max-w-2xl mx-auto border dark:border-darkBorder">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary dark:border-primaryAccent border-r-2"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Logo URL */}
            <div className="space-y-2">
              <Label htmlFor="logoURL" className="dark:text-darkTextHeading">Shop Logo URL</Label>
              <Input
                id="logoURL"
                name="logoURL"
                value={settings.logoURL || ''}
                onChange={handleInputChange}
                placeholder="https://..."
                className="dark:bg-darkFormBg dark:border-darkBorder dark:text-darkTextHeading dark:placeholder:text-darkTextLight"
              />
               {settings.logoURL && (
                    <div className="mt-2">
                         <p className="text-sm text-muted-foreground dark:text-darkTextMuted mb-1">Preview:</p>
                         <div className="h-16 w-auto max-w-[150px] bg-muted dark:bg-darkFormBg p-1 rounded inline-block">
                            <img
                                src={imageError ? '/placeholder.svg' : settings.logoURL}
                                alt="Logo Preview"
                                className="h-full w-auto object-contain"
                                onError={() => setImageError(true)}
                             />
                        </div>
                    </div>
               )}
            </div>

            {/* Line of the Month */}
            <div className="space-y-2">
              <Label htmlFor="lineOfTheMonth" className="dark:text-darkTextHeading">Line of the Month</Label>
              <Select
                value={settings.lineOfTheMonth === null ? 'None' : settings.lineOfTheMonth}
                onValueChange={handleLineChange}
              >
                <SelectTrigger 
                  id="lineOfTheMonth"
                  className="dark:bg-darkFormBg dark:border-darkBorder dark:text-darkTextHeading"
                >
                  <SelectValue placeholder="Select Manufacturer..." />
                </SelectTrigger>
                <SelectContent className="dark:bg-darkBgSecondary dark:border-darkBorder">
                  {manufacturers.map(man => (
                    <SelectItem 
                      key={man} 
                      value={man}
                      className="dark:text-darkTextHeading dark:focus:bg-darkFormBg dark:data-[state=checked]:text-primaryAccent"
                    >
                      {man}
                    </SelectItem>
                  ))}
                  {manufacturers.length <= 1 && (
                     <p className="text-xs text-muted-foreground dark:text-darkTextLight p-2">No manufacturers found in flavors list.</p>
                  )}
                </SelectContent>
              </Select>
               <p className="text-sm text-muted-foreground dark:text-darkTextLight">
                Select "None" to disable the Deals page feature.
               </p>
            </div>

            {/* Dark Mode Toggle */}
            <div className="space-y-2 pt-2 border-t dark:border-darkBorder">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dark-mode" className="text-base dark:text-darkTextHeading">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground dark:text-darkTextLight">
                    Toggle between light and dark theme.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Sun className="h-4 w-4 text-muted-foreground dark:text-darkTextLight" />
                  <Switch 
                    id="dark-mode" 
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme}
                    className="data-[state=checked]:bg-primaryAccent data-[state=checked]:border-primaryAccent"
                  />
                  <Moon className="h-4 w-4 text-muted-foreground dark:text-darkTextLight" />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t dark:border-darkBorder mt-6">
              <Button 
                onClick={() => handleSave()} 
                disabled={saving || loading}
                className="bg-primary dark:bg-primaryAccent hover:bg-primary/90 dark:hover:bg-primaryAccent/90 text-white dark:text-darkTextHeading"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
