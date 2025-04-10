import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout'; // Adjust path if necessary
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Import RadioGroup
import { useToast } from '@/components/ui/use-toast';
// Import CONSISTENT service functions (using camelCase)
import { getSettings, updateSettings, getUniqueManufacturers } from '@/services/supabase.ts'; // Adjust path if necessary

const AdminLineOfMonth = () => {
  const [manufacturers, setManufacturers] = useState<string[]>([]);
  const [currentLotmDisplay, setCurrentLotmDisplay] = useState<string>('Loading...'); // For display text
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>(''); // Form state: '' represents "None"
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Fetch settings and manufacturers using consistent service functions
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch current setting for line of the month using getSettings
      const settings = await getSettings();
      // Read the camelCase property from the settings object
      const currentSetting = settings?.lineOfTheMonth || null; // <-- Correctly reading camelCase
      setCurrentLotmDisplay(currentSetting || 'None selected'); // Set display text
      setSelectedManufacturer(currentSetting || ''); // Set form state ('') if null

      // Fetch unique manufacturers for the radio options
      const fetchedManufacturers = await getUniqueManufacturers();
      setManufacturers(fetchedManufacturers);

    } catch (error) {
      console.error("Error loading Line of the Month data:", error);
      toast({
        title: 'Error Loading Data',
        description: error instanceof Error ? error.message : 'Could not load data.',
        variant: 'destructive',
      });
      setCurrentLotmDisplay('Error loading data');
      setSelectedManufacturer(''); // Default to None on error
      setManufacturers([]); // Empty list on error
    } finally {
      setLoading(false);
    }
  }, [toast]); // Add toast to dependency array

  useEffect(() => {
    loadData();
  }, [loadData]); // Use loadData as dependency

  // Handle saving the selection using the consistent updateSettings function
  const handleSave = async (e?: React.FormEvent) => { // Make event optional
    if (e) e.preventDefault(); // Prevent form submission default if called from form
    setSaving(true);
    try {
      // If empty string ('') is selected (representing "None"), save null, otherwise save the name
      const valueToSave = selectedManufacturer === '' ? null : selectedManufacturer;

      // Use the generic updateSettings function with the CAMELCASE key
      await updateSettings({ lineOfTheMonth: valueToSave }); // <-- Correctly using camelCase key

      // Update the display text immediately after successful save
      setCurrentLotmDisplay(valueToSave || 'None selected');

      toast({ title: 'Success', description: 'Line of the Month updated successfully.' });
    } catch (error) {
      console.error("Error saving Line of the Month:", error);
      toast({
        title: 'Error Saving',
        description: error instanceof Error ? error.message : 'Could not save setting.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Line of the Month">
      {/* Use consistent styling */}
      <div className="bg-card text-card-foreground rounded-lg shadow p-6 max-w-2xl mx-auto border">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary border-r-2"></div>
          </div>
        ) : (
          // Removed form tag for simplicity unless validation needed
          <div className="space-y-6">
             {/* Current Status Display */}
             <h2 className="text-xl font-semibold mb-2">
                 Current Line of the Month: <span className="font-normal">{currentLotmDisplay}</span>
             </h2>

             {/* Info Box */}
             <div className="bg-muted/50 text-muted-foreground p-4 rounded-md text-sm mb-6 border">
                 The Line of the Month appears on the "Deals" page. This indicates to customers that these products have a special discount (typically $5 off). The discount is not automatically calculated in the app, as staff will communicate this to customers.
             </div>

            {/* Radio Group Section */}
            <div className="space-y-2">
              <Label className="text-base font-medium block mb-3">Select Manufacturer</Label>
              <RadioGroup
                value={selectedManufacturer} // Controlled by state ('') for None
                onValueChange={setSelectedManufacturer} // Update state directly
                className="space-y-2"
              >
                {/* Explicit "None" Option */}
                <div className="flex items-center space-x-2">
                  {/* Use empty string "" as the value for None */}
                  <RadioGroupItem value="" id="lotm-none" />
                  <Label htmlFor="lotm-none" className="font-normal cursor-pointer">None</Label>
                </div>

                {/* Map over fetched manufacturers */}
                {manufacturers.map(man => (
                  <div key={man} className="flex items-center space-x-2">
                    <RadioGroupItem value={man} id={`lotm-${man}`} />
                    <Label htmlFor={`lotm-${man}`} className="font-normal cursor-pointer">{man}</Label>
                  </div>
                ))}

                {/* Message if no manufacturers found */}
                {manufacturers.length === 0 && (
                  <p className="text-muted-foreground text-sm pt-2">
                    No manufacturers found in flavors list. Add flavors with manufacturers first.
                  </p>
                )}
              </RadioGroup>
            </div>

            {/* Save Button */}
            <div className="flex justify-start pt-6 border-t">
              <Button onClick={() => handleSave()} disabled={saving || loading}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminLineOfMonth;