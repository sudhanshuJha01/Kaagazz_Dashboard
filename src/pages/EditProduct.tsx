import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDropzone } from 'react-dropzone';
import { getProductById, updateProduct, deleteProduct, uploadProductImages, removeProductImages } from "../services/api";
import { Trash2, X, Upload, UploadCloud, Loader, AlertTriangle, CheckCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const categories = ["Stationery", "Gift Sets", "Paper", "Chitrayan"];

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Core product data
  const [productData, setProductData] = useState<any>({});
  const [originalProductData, setOriginalProductData] = useState<any>({});
  
  // Image management
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch product data on mount
  useEffect(() => {
    if (!id) return;
    
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        const product = data.product;
        
        const formattedProduct = {
          ...product,
          tags: product.tags?.join(', ') || ''
        };
        
        setProductData(formattedProduct);
        setOriginalProductData(formattedProduct);
        setCurrentImages(product.images || []);
      } catch (error: any) {
        console.error('Failed to fetch product:', error);
        toast.error("Failed to fetch product details: " + error.message);
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id, navigate]);

  // Image upload dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Validate file sizes (e.g., max 5MB per file)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const updatedFiles = [...newFiles, ...validFiles];
    setNewFiles(updatedFiles);
    
    // Clean up old previews
    newPreviews.forEach(url => URL.revokeObjectURL(url));
    
    // Create new previews
    const updatedPreviews = updatedFiles.map(file => URL.createObjectURL(file));
    setNewPreviews(updatedPreviews);
  }, [newFiles, newPreviews]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] },
    multiple: true,
    maxSize: 5 * 1024 * 1024 // 5MB limit
  });

  // Remove existing image (mark for deletion)
  const markImageForDeletion = (imageUrl: string) => {
    setCurrentImages(prev => prev.filter(img => img !== imageUrl));
    setImagesToDelete(prev => [...prev, imageUrl]);
  };

  // Restore image from deletion list
  const restoreImage = (imageUrl: string) => {
    setImagesToDelete(prev => prev.filter(img => img !== imageUrl));
    setCurrentImages(prev => [...prev, imageUrl]);
  };

  // Remove new file
  const removeNewFile = (indexToRemove: number) => {
    setNewFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setNewPreviews(prev => {
      const newPreviews = prev.filter((_, index) => index !== indexToRemove);
      URL.revokeObjectURL(prev[indexToRemove]);
      return newPreviews;
    });
  };

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!productData.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!productData.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!productData.originalPrice || productData.originalPrice <= 0) {
      newErrors.originalPrice = 'Valid price is required';
    }
    
    if (!productData.stock || productData.stock < 0) {
      newErrors.stock = 'Valid stock quantity is required';
    }
    
    if (!productData.category) {
      newErrors.category = 'Category is required';
    }

    if (productData.discountPercent && (productData.discountPercent < 0 || productData.discountPercent > 100)) {
      newErrors.discountPercent = 'Discount must be between 0 and 100';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductData((prev: any) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleSwitchChange = (field: 'isTopPick' | 'isTrending', checked: boolean) => {
    setProductData((prev: any) => ({ ...prev, [field]: checked }));
  };

  const handleSave = async () => {
    if (!id) return;
    
    if (!validateForm()) {
      toast.error("Please fix the form errors before saving.");
      return;
    }

    try {
      setSaving(true);
      
      // Step 1: Update basic product info
      const updateData = {
        ...productData,
        tags: productData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag),
        images: currentImages // Set current images (after removals)
      };
      
      // Remove system fields
      const fieldsToRemove = ['_id', 'createdAt', 'updatedAt', '__v'];
      fieldsToRemove.forEach(field => delete updateData[field]);

      await updateProduct(id, updateData);
      
      // Step 2: Handle image deletions
      if (imagesToDelete.length > 0) {
        try {
          await removeProductImages(id, imagesToDelete);
          toast.success(`Removed ${imagesToDelete.length} image(s)`);
        } catch (error) {
          console.error('Failed to remove some images:', error);
          toast.error("Some images couldn't be removed, but product was updated.");
        }
      }

      // Step 3: Upload new images
      if (newFiles.length > 0) {
        setUploadingImages(true);
        try {
          const uploadResult = await uploadProductImages(id, newFiles);
          toast.success(`Uploaded ${uploadResult.uploadedCount} new image(s)`);
        } catch (error) {
          console.error('Failed to upload some images:', error);
          toast.error("Some images couldn't be uploaded, but product was updated.");
        } finally {
          setUploadingImages(false);
        }
      }

      toast.success("Product updated successfully!");
      navigate('/products');
      
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error("Failed to update product: " + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };
  
  const confirmDelete = async () => {
    if (!id) return;
    try {
      await deleteProduct(id);
      toast.success("Product deleted successfully!");
      navigate('/products');
    } catch (error: any) {
      toast.error("Failed to delete product: " + error.message);
    } finally {
      setShowDeleteDialog(false);
    }
  };

  // Check if form has changes
  const hasChanges = JSON.stringify(productData) !== JSON.stringify(originalProductData) || 
                    newFiles.length > 0 || 
                    imagesToDelete.length > 0;

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      newPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)]">
        <div className="flex items-center space-x-2">
          <Loader className="w-6 h-6 animate-spin text-[#5C4033]" />
          <span className="text-[#5C4033]">Loading product...</span>
        </div>
      </div>
    );
  }

  const totalCurrentImages = currentImages.length + newFiles.length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#5C4033] font-serif">Edit Product</h1>
          <p className="text-gray-600 mt-1">
            Product ID: {id} • Created: {new Date(productData.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Trash2 size={16} />
          Delete Product
        </button>
      </div>

      {/* Main Form */}
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Fields - Takes 2/3 of the space */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#5C4033] border-b pb-2">Basic Information</h3>
              
              <div>
                <Label htmlFor="title">Title *</Label>
                <input 
                  id="title" 
                  type="text" 
                  name="title" 
                  value={productData.title || ''} 
                  onChange={handleChange} 
                  className={`mt-1 block w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-[#5C4033] focus:border-transparent ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter product title"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <textarea 
                  id="description" 
                  name="description" 
                  value={productData.description || ''} 
                  onChange={handleChange} 
                  rows={4} 
                  className={`mt-1 block w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-[#5C4033] focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter product description"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#5C4033] border-b pb-2">Pricing & Stock</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="originalPrice">Price (₹) *</Label>
                  <input 
                    id="originalPrice" 
                    type="number" 
                    name="originalPrice" 
                    value={productData.originalPrice || ''} 
                    onChange={handleChange} 
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-[#5C4033] focus:border-transparent ${
                      errors.originalPrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="0" 
                    step="0.01"
                    placeholder="0.00"
                  />
                  {errors.originalPrice && <p className="text-red-500 text-sm mt-1">{errors.originalPrice}</p>}
                </div>
                
                <div>
                  <Label htmlFor="discountPercent">Discount %</Label>
                  <input 
                    id="discountPercent" 
                    type="number" 
                    name="discountPercent" 
                    value={productData.discountPercent || '0'} 
                    onChange={handleChange} 
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-[#5C4033] focus:border-transparent ${
                      errors.discountPercent ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="0" 
                    max="100"
                    placeholder="0"
                  />
                  {errors.discountPercent && <p className="text-red-500 text-sm mt-1">{errors.discountPercent}</p>}
                </div>
                
                <div>
                  <Label htmlFor="stock">Stock *</Label>
                  <input 
                    id="stock" 
                    type="number" 
                    name="stock" 
                    value={productData.stock || ''} 
                    onChange={handleChange} 
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-[#5C4033] focus:border-transparent ${
                      errors.stock ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="0"
                    placeholder="0"
                  />
                  {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
                </div>
              </div>
            </div>

            {/* Category & Tags */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#5C4033] border-b pb-2">Categorization</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <select 
                    id="category" 
                    name="category" 
                    value={productData.category || ''} 
                    onChange={handleChange} 
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-[#5C4033] focus:border-transparent ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>
                
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <input 
                    id="tags" 
                    type="text" 
                    name="tags" 
                    value={productData.tags || ''} 
                    onChange={handleChange} 
                    placeholder="e.g., eco-friendly, handmade, premium"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#5C4033] focus:border-transparent" 
                  />
                </div>
              </div>
            </div>

            {/* Product Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#5C4033] border-b pb-2">Product Features</h3>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="isTopPick" 
                    checked={productData.isTopPick || false} 
                    onCheckedChange={(checked) => handleSwitchChange('isTopPick', checked)}
                    className="data-[state=checked]:bg-[#5C4033]"
                  />
                  <Label htmlFor="isTopPick" className="flex items-center space-x-1">
                    <span>Top Pick</span>
                    {productData.isTopPick && <Badge variant="secondary">Featured</Badge>}
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="isTrending" 
                    checked={productData.isTrending || false} 
                    onCheckedChange={(checked) => handleSwitchChange('isTrending', checked)}
                    className="data-[state=checked]:bg-[#5C4033]"
                  />
                  <Label htmlFor="isTrending" className="flex items-center space-x-1">
                    <span>Trending</span>
                    {productData.isTrending && <Badge variant="secondary">Hot</Badge>}
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Image Management - Takes 1/3 of the space */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[#5C4033] border-b pb-2">Images ({totalCurrentImages})</h3>
            
            {/* Current Images */}
            {currentImages.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Current Images ({currentImages.length})</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {currentImages.map((img: string, index: number) => (
                    <div key={`current-${index}`} className="relative group">
                      <img 
                        src={img} 
                        alt={`Current ${index + 1}`} 
                        className="w-full h-20 object-cover rounded border" 
                      />
                      <button
                        type="button"
                        onClick={() => markImageForDeletion(img)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Mark for deletion"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Images marked for deletion */}
            {imagesToDelete.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-red-600">
                  <AlertTriangle className="inline w-4 h-4 mr-1" />
                  To be removed ({imagesToDelete.length})
                </Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {imagesToDelete.map((img: string, index: number) => (
                    <div key={`delete-${index}`} className="relative group opacity-50">
                      <img 
                        src={img} 
                        alt={`Delete ${index + 1}`} 
                        className="w-full h-20 object-cover rounded border-2 border-red-200" 
                      />
                      <button
                        type="button"
                        onClick={() => restoreImage(img)}
                        className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Restore image"
                      >
                        <CheckCircle size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            {newFiles.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-green-600">
                  <UploadCloud className="inline w-4 h-4 mr-1" />
                  New images ({newFiles.length})
                </Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {newPreviews.map((preview, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <img 
                        src={preview} 
                        alt={`New ${index + 1}`} 
                        className="w-full h-20 object-cover rounded border-2 border-green-200" 
                      />
                      <button
                        type="button"
                        onClick={() => removeNewFile(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove new image"
                      >
                        <X size={10} />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                        New
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Zone */}
            <div>
              <Label className="text-sm font-medium">Add New Images</Label>
              <div 
                {...getRootProps()} 
                className={`mt-2 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-[#5C4033] bg-[#5C4033]/5' : 'border-gray-300 hover:border-[#5C4033]/50'
                }`}
              >
                <input {...getInputProps()} />
                <UploadCloud className="mx-auto h-6 w-6 text-gray-400 mb-2" />
                <p className="text-xs text-gray-600">
                  {isDragActive ? 'Drop files here...' : 'Drop images or click to browse'}
                </p>
                <p className="text-xs text-gray-400 mt-1">Max 5MB per image</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-8 flex justify-between items-center border-t pt-6">
          <div className="text-sm text-gray-600">
            {hasChanges ? (
              <span className="text-orange-600 font-medium">You have unsaved changes</span>
            ) : (
              <span>No changes made</span>
            )}
          </div>
          
          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/products')}
              className="px-6"
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={saving || uploadingImages || !hasChanges}
              className="px-8 bg-[#5d4037] hover:bg-[#3e2f22]"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : uploadingImages ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-pulse" />
                  Uploading Images...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>"{productData.title}"</strong>? 
              This action cannot be undone and will permanently remove the product from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditProduct;