import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select components
import { useToast } from '@/components/ui/use-toast';
import { addFlavor, updateFlavor, getFlavorById } from '@/services/supabase.ts';
import { Flavor, flavorCategories, FlavorVariant } from '@/types/flavor'; // Ensure Flavor type is updated separately, explicitly import FlavorVariant

// Define the structure for a single variant within the form state
interface VariantFormData {
  id: string; // Temporary unique ID for React key prop during mapping
  size: string;
  price: string; // Keep price as string in form for input handling
  type: 'E-Liquid' | 'Salt Nic' | ''; // Allow empty for new rows
  nicLevels: number[];
}

const AdminFlavorForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    flavorName: string;
    manufacturer: string;
    description: string;
    shortDescription: string;
    categories: string[];
    vgPgRatio: string;
    imageURL: string;
    variants: VariantFormData[]; // Use the new variants structure
  }>({
    flavorName: '',
    manufacturer: '',
    description: '',
    shortDescription: '',
    categories: [],
    vgPgRatio: '70/30',
    imageURL: '',
    variants: [
      // Start with one empty variant row
      { id: crypto.randomUUID(), size: '', price: '', type: '', nicLevels: [] }
    ],
  });

  // Nicotine options (remain the same)
  const eliquidNicOptions: number[] = [0, 3, 6, 9, 12, 18, 24];
  const saltNicOptions: number[] = [10, 15, 20, 24, 25, 28, 30, 35, 48, 50, 55];

  useEffect(() => {
    if (isEditing && id) {
      fetchFlavor(id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditing]);

  const fetchFlavor = async (flavorId: string) => {
    try {
      setLoading(true);
      // Assume getFlavorById now returns the updated Flavor structure with 'variants'
      const flavor = await getFlavorById(flavorId);

      if (flavor) {
        setFormData({
          flavorName: flavor.flavorName || '',
          manufacturer: flavor.manufacturer || '',
          description: flavor.description || '',
          shortDescription: flavor.shortDescription || '',
          categories: flavor.categories || [],
          vgPgRatio: flavor.vgPgRatio || '70/30',
          imageURL: flavor.imageURL || '',
          // Map fetched variants to form state structure
          variants: flavor.variants?.length > 0
            ? flavor.variants.map((v: FlavorVariant) => ({ // Explicit type
                id: crypto.randomUUID(), // Assign temporary ID for keys
                size: v.size || '',
                price: v.price?.toString() || '', // Convert number to string for input
                type: v.type || '',
                nicLevels: v.nicLevels || []
              }))
            : [{ id: crypto.randomUUID(), size: '', price: '', type: '', nicLevels: [] }], // Default if no variants found
        });
      } else {
        toast({ title: 'Error', description: 'Flavor not found', variant: 'destructive' });
        navigate('/admin-portal/dashboard');
      }
    } catch (err) {
      console.error('Error fetching flavor:', err);
      toast({ title: 'Error', description: 'Failed to load flavor data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // --- NEW VARIANT HANDLERS ---

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        { id: crypto.randomUUID(), size: '', price: '', type: '', nicLevels: [] }
      ]
    }));
  };

  const removeVariant = (variantId: string) => {
    // Prevent removing the last variant
    if (formData.variants.length <= 1) {
      toast({ title: 'Cannot remove the last variant entry', variant: 'destructive' });
      return;
    }
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter(v => v.id !== variantId)
    }));
  };

  const handleVariantChange = (
    variantId: string,
    field: keyof Omit<VariantFormData, 'id' | 'nicLevels'>, // 'size', 'price', or 'type'
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v => {
        if (v.id === variantId) {
           // If type changes, reset nic levels for that variant
           const shouldResetNicLevels = field === 'type' && v.type !== value;
           return {
             ...v,
             [field]: value,
             nicLevels: shouldResetNicLevels ? [] : v.nicLevels,
           };
        }
        return v;
      })
    }));
  };

 const handleVariantNicLevelChange = (variantId: string, level: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v => {
        if (v.id === variantId) {
          const currentLevels = v.nicLevels;
          const newLevels = currentLevels.includes(level)
            ? currentLevels.filter(l => l !== level)
            : [...currentLevels, level].sort((a, b) => a - b);
          return { ...v, nicLevels: newLevels };
        }
        return v;
      })
    }));
  };

  // --- END NEW VARIANT HANDLERS ---

  // Input change handler (for top-level fields like name, description etc)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Category change handler (remains the same)
  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // --- VALIDATION ---
    const requiredTextFields = ['flavorName', 'manufacturer', 'description', 'vgPgRatio'];
    for (const field of requiredTextFields) {
        if (!(formData as any)[field]?.trim()) {
            toast({ title: 'Validation Error', description: `${field.replace(/([A-Z])/g, ' $1')} is required`, variant: 'destructive'});
            setLoading(false); return;
        }
    }
    if (formData.categories.length === 0) {
        toast({ title: 'Validation Error', description: 'Please select at least one Category', variant: 'destructive' });
        setLoading(false); return;
    }
    if (formData.variants.length === 0) {
      toast({ title: 'Validation Error', description: 'Please add at least one product variant (size/price/type)', variant: 'destructive' });
      setLoading(false); return;
    }
    // Validate each variant
    for (const [index, variant] of formData.variants.entries()) {
        if (!variant.size?.trim()) { toast({ title: `Validation Error (Variant ${index + 1})`, description: 'Size is required', variant: 'destructive' }); setLoading(false); return; }
        // Basic check for 'ml' in size, can be improved
        if (!variant.size.toLowerCase().includes('ml') && !/^\d+$/.test(variant.size.trim())) {
             toast({ title: `Validation Error (Variant ${index + 1})`, description: 'Size should be a number (e.g., 60) or include "ml" (e.g., 60ml)', variant: 'destructive' }); setLoading(false); return;
        }
        if (!variant.price?.trim() || isNaN(parseFloat(variant.price))) { toast({ title: `Validation Error (Variant ${index + 1})`, description: 'Price must be a valid number', variant: 'destructive' }); setLoading(false); return; }
        if (!variant.type) { toast({ title: `Validation Error (Variant ${index + 1})`, description: 'Type (E-Liquid/Salt Nic) must be selected', variant: 'destructive' }); setLoading(false); return; }
        if (variant.nicLevels.length === 0) { toast({ title: `Validation Error (Variant ${index + 1})`, description: `Select at least one Nic Level for ${variant.type}`, variant: 'destructive' }); setLoading(false); return; }
    }
    // --- END VALIDATION ---

    try {
      // --- CHANGE MADE HERE: Prepare variants for saving ---
      const finalVariants = formData.variants.map(v => {
        const trimmedSize = v.size.trim();
        let processedSize = trimmedSize; // Default to trimmed size

        // Append 'ml' if it's just a number or doesn't already end with 'ml' (case-insensitive)
        if (trimmedSize && !trimmedSize.toLowerCase().endsWith('ml') && /^\d+$/.test(trimmedSize)) {
           processedSize = `${trimmedSize}ml`;
        }

        return {
          size: processedSize, // Use the potentially modified size
          price: parseFloat(v.price), // Convert to number
          type: v.type as 'E-Liquid' | 'Salt Nic', // Type assertion after validation
          nicLevels: v.nicLevels,
        };
      });
      // --- END OF CHANGE ---

      // Determine overall type ('E-Liquid', 'Salt Nic', 'Both')
      const typesPresent = new Set(finalVariants.map(v => v.type));
      let finalType: 'E-Liquid' | 'Salt Nic' | 'Both';
      if (typesPresent.size === 2) {
        finalType = 'Both';
      } else if (typesPresent.has('E-Liquid')) {
        finalType = 'E-Liquid';
      } else if (typesPresent.has('Salt Nic')) {
        finalType = 'Salt Nic';
      } else {
        // Should not happen due to validation, but handle defensively
        throw new Error("No valid variant types found.");
      }


      // Data structure for Supabase (ensure Flavor type definition is updated!)
      // Needs 'type' and 'variants', removes old fields
      const flavorDataForSupabase = {
        flavorName: formData.flavorName.trim(),
        manufacturer: formData.manufacturer.trim(),
        description: formData.description.trim(),
        shortDescription: formData.shortDescription.trim() || formData.description.substring(0, 100).trim(),
        categories: formData.categories,
        vgPgRatio: formData.vgPgRatio.trim(),
        imageURL: formData.imageURL.trim(),
        type: finalType, // Add the derived overall type
        variants: finalVariants, // Add the processed variants array
      };

      if (isEditing && id) {
        await updateFlavor(id, flavorDataForSupabase);
        toast({ title: 'Success', description: 'Flavor updated successfully' });
      } else {
        // Cast might be needed if 'id' is strictly required by updateFlavor type, but not addFlavor
        await addFlavor(flavorDataForSupabase as Omit<Flavor, 'id' | 'createdAt' | 'dateAdded'>);
        toast({ title: 'Success', description: 'Flavor added successfully' });
      }

      navigate('/admin-portal/dashboard');
    } catch (err) {
      console.error('Error saving flavor:', err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      toast({ title: 'Error', description: `Failed to ${isEditing ? 'update' : 'add'} flavor: ${message}`, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading && isEditing) {
    // ... loading spinner ...
     return (
      <AdminLayout title="Loading...">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2"></div>
        </div>
      </AdminLayout>
    );
  }

  // --- RENDER ---
  return (
    <AdminLayout title={isEditing ? 'Edit Flavor' : 'Add New Flavor'}>
      <div className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Flavor Name / Manufacturer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="flavorName">Flavor Name*</Label>
              <Input id="flavorName" name="flavorName" value={formData.flavorName} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer*</Label>
              <Input id="manufacturer" name="manufacturer" value={formData.manufacturer} onChange={handleInputChange} required />
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-2">
            <Label htmlFor="description">Full Description*</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={4} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short Description <span className="text-gray-500 text-sm">(Optional)</span></Label>
            <Textarea id="shortDescription" name="shortDescription" value={formData.shortDescription} onChange={handleInputChange} rows={2} />
          </div>

           {/* --- Categories Checkboxes --- */}
           <div className="space-y-2">
            <Label>Categories*</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {flavorCategories.map(category => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox id={`category-${category}`} checked={formData.categories.includes(category)} onCheckedChange={() => handleCategoryChange(category)} />
                  <Label htmlFor={`category-${category}`}>{category}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* --- VG/PG Ratio --- */}
           <div className="space-y-2">
            <Label htmlFor="vgPgRatio">VG/PG Ratio*</Label>
            <Input id="vgPgRatio" name="vgPgRatio" value={formData.vgPgRatio} onChange={handleInputChange} placeholder="e.g. 70/30" required />
          </div>

          {/* --- NEW: Variants Section --- */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Product Variants*</h3>
              <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                Add Variant
              </Button>
            </div>

            {formData.variants.map((variant, index) => (
              <div key={variant.id} className="border rounded-md p-4 space-y-4 relative bg-gray-50"> {/* Added bg for contrast */}
                {/* Remove Button */}
                 {formData.variants.length > 1 && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVariant(variant.id)}
                        className="absolute top-2 right-2 h-6 w-6 text-destructive hover:text-destructive hover:bg-red-100 rounded-full"
                        aria-label="Remove Variant"
                    >
                        × {/* Use a multiplication sign for 'X' */}
                    </Button>
                )}

                {/* Size / Price / Type Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div className="space-y-1">
                    <Label htmlFor={`variant-size-${variant.id}`}>Size*</Label>
                    <Input
                      id={`variant-size-${variant.id}`}
                      placeholder="e.g. 60 or 60ml" // Updated placeholder
                      value={variant.size}
                      onChange={e => handleVariantChange(variant.id, 'size', e.target.value)}
                      required
                    />
                  </div>
                   <div className="space-y-1">
                    <Label htmlFor={`variant-price-${variant.id}`}>Price*</Label>
                    <Input
                      id={`variant-price-${variant.id}`}
                      placeholder="e.g. 19.99"
                      type="number" // Use number input
                      step="0.01"
                      min="0"
                      value={variant.price}
                      onChange={e => handleVariantChange(variant.id, 'price', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`variant-type-${variant.id}`}>Type*</Label>
                    <Select
                        value={variant.type}
                        onValueChange={(value: 'E-Liquid' | 'Salt Nic') => handleVariantChange(variant.id, 'type', value)} // Type assertion may be needed depending on Select component props
                        required
                    >
                        <SelectTrigger id={`variant-type-${variant.id}`}>
                            <SelectValue placeholder="Select Type..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="E-Liquid">E-Liquid</SelectItem>
                            <SelectItem value="Salt Nic">Salt Nic</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                </div>

                 {/* Nic Levels (Conditional based on variant type) */}
                 {variant.type && ( // Only show if type is selected
                    <div className="space-y-2 pt-2 border-t">
                         <Label className="text-sm font-medium">
                            {variant.type === 'E-Liquid' ? 'E-Liquid Nic Levels*' : 'Salt Nic Levels*'}
                        </Label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-4 gap-y-2">
                            {(variant.type === 'E-Liquid' ? eliquidNicOptions : saltNicOptions).map(level => (
                                <div key={`${variant.id}-nic-${level}`} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`${variant.id}-nic-${level}`}
                                    checked={variant.nicLevels.includes(level)}
                                    onCheckedChange={() => handleVariantNicLevelChange(variant.id, level)}
                                />
                                <Label htmlFor={`${variant.id}-nic-${level}`} className="text-sm">
                                    {level}mg
                                </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                 )}
              </div>
            ))}
          </div>
          {/* --- END NEW: Variants Section --- */}

          {/* --- Image URL --- */}
           <div className="space-y-2 border-t pt-4">
            <Label htmlFor="imageURL">Image URL <span className="text-gray-500 text-sm">(Public link)</span></Label>
            <Input id="imageURL" name="imageURL" value={formData.imageURL} onChange={handleInputChange} placeholder="https://example.com/image.jpg" />
             {formData.imageURL && (<div className="mt-2"><p className="text-sm text-gray-500 mb-1">Preview:</p><div className="h-32 w-32 bg-gray-100 rounded-md overflow-hidden"><img src={formData.imageURL} alt="Preview" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}/></div></div>)}
          </div>

          {/* --- Form Actions --- */}
          <div className="flex justify-between pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => navigate('/admin-portal/dashboard')}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Update Flavor' : 'Add Flavor'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminFlavorForm;