import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { createProduct, uploadProductImages } from '../services/api';
import { toast } from 'sonner';
import { UploadCloud, X, Loader, Save, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const categories = ["Stationery", "Gift Sets", "Paper", "Chitrayan"];

const UploadProduct = () => {
  const navigate = useNavigate();
  
  // Form state
  const [productData, setProductData] = useState({
    title: "",
    description: "",
    originalPrice: "",
    discountPercent: "0",
    category: "",
    stock: "",
    tags: "",
    isTopPick: false,
    isTrending: false,
  });

  // Image state
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [currentStep, setCurrentStep] = useState<'form' | 'uploading' | 'complete'>('form');
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Image drop zone handler
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Validate file sizes (max 5MB per file)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validFiles: File[] = [];
    const invalidFiles: File[] = [];

    acceptedFiles.forEach(file => {
      if (file.size > maxSize) {
        invalidFiles.push(file);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      toast.error(`${invalidFiles.length} file(s) too large. Maximum size is 5MB per file.`);
    }

    if (validFiles.length === 0) return;

    const newFiles = [...files, ...validFiles];
    setFiles(newFiles);
    
    // Clean up old previews
    previews.forEach(url => URL.revokeObjectURL(url));
    
    // Create new previews
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);

    if (validFiles.length > 0) {
      toast.success(`Added ${validFiles.length} image(s)`);
    }
  }, [files, previews]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] },
    multiple: true,
    maxSize: 5 * 1024 * 1024 // 5MB limit
  });

  // Remove file from upload list
  const removeFile = (indexToRemove: number) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setPreviews(prev => {
      const newPreviews = prev.filter((_, index) => index !== indexToRemove);
      URL.revokeObjectURL(prev[indexToRemove]);
      return newPreviews;
    });
  };

  // Form validation
  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'title':
        return !value?.trim() ? 'Title is required' : '';
      case 'description':
        return !value?.trim() ? 'Description is required' : '';
      case 'originalPrice':
        return !value || parseFloat(value) <= 0 ? 'Valid price is required' : '';
      case 'stock':
        return !value || parseInt(value) < 0 ? 'Valid stock quantity is required' : '';
      case 'category':
        return !value ? 'Category is required' : '';
      case 'discountPercent':
        const discount = parseFloat(value);
        return discount < 0 || discount > 100 ? 'Discount must be between 0 and 100' : '';
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    // const requiredFields = ['title', 'description', 'originalPrice', 'stock', 'category'];
    
    // Validate all fields
    Object.keys(productData).forEach(key => {
      const error = validateField(key, (productData as any)[key]);
      if (error) newErrors[key] = error;
    });

    // Check if at least one image is provided
    if (files.length === 0) {
      toast.error("Please upload at least one product image.");
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductData(prev => ({ ...prev, [name]: value }));
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };
  
  const handleSwitchChange = (field: 'isTopPick' | 'isTrending', checked: boolean) => {
    setProductData(prev => ({ ...prev, [field]: checked }));
  };

  // Handle form submission
  const handleSave = async () => {
    // Mark all fields as touched for validation display
    const touchedFields = Object.keys(productData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(touchedFields);

    if (!validateForm()) {
      toast.error("Please fix the form errors before saving.");
      return;
    }

    try {
      setIsLoading(true);
      setCurrentStep('uploading');

      // Step 1: Create product
      const finalProductData = {
        ...productData,
        originalPrice: parseFloat(productData.originalPrice),
        stock: parseInt(productData.stock),
        discountPercent: parseFloat(productData.discountPercent || '0'),
        tags: productData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };

      toast.loading("Creating product...", { id: 'create-product' });
      const createdProductResponse = await createProduct(finalProductData);
      const newProduct = createdProductResponse.product;
      toast.success("Product created successfully!", { id: 'create-product' });

      // Step 2: Upload images
      setUploadingImages(true);
      toast.loading(`Uploading ${files.length} images...`, { id: 'upload-images' });
      
      const uploadResult = await uploadProductImages(newProduct._id, files);
      toast.success(`Successfully uploaded ${uploadResult.uploadedCount} images!`, { id: 'upload-images' });

      setCurrentStep('complete');
      
      // Show success message and redirect after a short delay
      setTimeout(() => {
        navigate('/products');
      }, 1500);

    } catch (error: any) {
      console.error('Product creation error:', error);
      toast.error("Failed to create product: " + (error.message || 'Unknown error'));
      setCurrentStep('form');
    } finally {
      setIsLoading(false);
      setUploadingImages(false);
    }
  };

  // Calculate final price after discount
  const finalPrice = productData.originalPrice && productData.discountPercent 
    ? parseFloat(productData.originalPrice) * (1 - parseFloat(productData.discountPercent) / 100)
    : parseFloat(productData.originalPrice || '0');

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  // Check if form has any data
  const hasFormData = Object.values(productData).some(value => 
    typeof value === 'string' ? value.trim() !== '' : value === true
  ) || files.length > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#5C4033] font-serif">Create New Product</h1>
          <p className="text-gray-600 mt-1">Add a new product to your inventory</p>
        </div>
        
        {/* Progress indicator */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className={`flex items-center ${currentStep === 'form' ? 'text-[#5C4033]' : 'text-gray-400'}`}>
            <div className={`w-2 h-2 rounded-full mr-1 ${currentStep === 'form' ? 'bg-[#5C4033]' : 'bg-gray-300'}`} />
            Form
          </div>
          <div className={`flex items-center ${currentStep === 'uploading' ? 'text-[#5C4033]' : 'text-gray-400'}`}>
            <div className={`w-2 h-2 rounded-full mr-1 ${currentStep === 'uploading' ? 'bg-[#5C4033] animate-pulse' : 'bg-gray-300'}`} />
            Upload
          </div>
          <div className={`flex items-center ${currentStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-2 h-2 rounded-full mr-1 ${currentStep === 'complete' ? 'bg-green-600' : 'bg-gray-300'}`} />
            Complete
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Fields - Takes 2/3 of the space */}
        <div className="lg:col-span-2">
          <Card className="bg-white shadow-lg border-[#5C4033]/20">
            <CardHeader>
              <CardTitle className="text-[#5C4033]">Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-[#5C4033] border-b pb-2">Basic Information</h3>
                
                <div>
                  <Label htmlFor="title">Product Title *</Label>
                  <input 
                    id="title" 
                    name="title" 
                    value={productData.title} 
                    onChange={handleChange}
                    placeholder="Enter product title"
                    className={`mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#5C4033] focus:border-transparent transition-colors ${
                      errors.title && touched.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.title && touched.title && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.title}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <textarea 
                    id="description" 
                    name="description" 
                    value={productData.description} 
                    onChange={handleChange}
                    placeholder="Describe your product in detail"
                    className={`mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#5C4033] focus:border-transparent transition-colors ${
                      errors.description && touched.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    rows={4}
                  />
                  {errors.description && touched.description && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="space-y-4">
                <h3 className="font-semibold text-[#5C4033] border-b pb-2">Pricing & Stock</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="originalPrice">Price (₹) *</Label>
                    <input 
                      id="originalPrice" 
                      name="originalPrice" 
                      value={productData.originalPrice} 
                      onChange={handleChange}
                      placeholder="0.00"
                      type="number" 
                      step="0.01"
                      min="0"
                      className={`mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#5C4033] focus:border-transparent transition-colors ${
                        errors.originalPrice && touched.originalPrice ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.originalPrice && touched.originalPrice && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.originalPrice}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="discountPercent">Discount %</Label>
                    <input 
                      id="discountPercent" 
                      name="discountPercent" 
                      value={productData.discountPercent} 
                      onChange={handleChange}
                      placeholder="0"
                      type="number" 
                      min="0"
                      max="100"
                      className={`mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#5C4033] focus:border-transparent transition-colors ${
                        errors.discountPercent && touched.discountPercent ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.discountPercent && touched.discountPercent && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.discountPercent}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="stock">Stock Quantity *</Label>
                    <input 
                      id="stock" 
                      name="stock" 
                      value={productData.stock} 
                      onChange={handleChange}
                      placeholder="0"
                      type="number" 
                      min="0"
                      className={`mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#5C4033] focus:border-transparent transition-colors ${
                        errors.stock && touched.stock ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.stock && touched.stock && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.stock}
                      </p>
                    )}
                  </div>
                </div>

                {/* Price Preview */}
                {productData.originalPrice && parseFloat(productData.originalPrice) > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span>Original Price:</span>
                      <span>₹{parseFloat(productData.originalPrice).toLocaleString()}</span>
                    </div>
                    {parseFloat(productData.discountPercent) > 0 && (
                      <>
                        <div className="flex items-center justify-between text-sm text-red-600">
                          <span>Discount ({productData.discountPercent}%):</span>
                          <span>-₹{(parseFloat(productData.originalPrice) * parseFloat(productData.discountPercent) / 100).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm font-semibold border-t pt-2 mt-2">
                          <span>Final Price:</span>
                          <span className="text-green-600">₹{finalPrice.toLocaleString()}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Category & Tags */}
              <div className="space-y-4">
                <h3 className="font-semibold text-[#5C4033] border-b pb-2">Categorization</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <select 
                      id="category" 
                      name="category" 
                      value={productData.category} 
                      onChange={handleChange}
                      className={`mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#5C4033] focus:border-transparent transition-colors ${
                        errors.category && touched.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {errors.category && touched.category && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.category}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <input 
                      id="tags" 
                      name="tags" 
                      value={productData.tags} 
                      onChange={handleChange}
                      placeholder="e.g., eco-friendly, handmade, premium"
                      className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5C4033] focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Product Features */}
              <div className="space-y-4">
                <h3 className="font-semibold text-[#5C4033] border-b pb-2">Product Features</h3>
                
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-3">
                    <Switch 
                      id="isTopPick" 
                      checked={productData.isTopPick} 
                      onCheckedChange={(checked) => handleSwitchChange('isTopPick', checked)}
                      className="data-[state=checked]:bg-[#5C4033]"
                    />
                    <Label htmlFor="isTopPick" className="flex items-center space-x-2">
                      <span>Top Pick</span>
                      {productData.isTopPick && <Badge variant="secondary">Featured</Badge>}
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Switch 
                      id="isTrending" 
                      checked={productData.isTrending} 
                      onCheckedChange={(checked) => handleSwitchChange('isTrending', checked)}
                      className="data-[state=checked]:bg-[#5C4033]"
                    />
                    <Label htmlFor="isTrending" className="flex items-center space-x-2">
                      <span>Trending</span>
                      {productData.isTrending && <Badge variant="secondary">Hot</Badge>}
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Image Upload - Takes 1/3 of the space */}
        <div className="space-y-6">
          <Card className="bg-white shadow-lg border-[#5C4033]/20">
            <CardHeader>
              <CardTitle className="text-[#5C4033] flex items-center">
                <ImageIcon className="w-5 h-5 mr-2" />
                Product Images ({files.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Zone */}
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive 
                    ? 'border-[#5C4033] bg-[#5C4033]/5 scale-105' 
                    : 'border-gray-300 hover:border-[#5C4033]/50 hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <UploadCloud className={`mx-auto h-10 w-10 mb-3 transition-colors ${
                  isDragActive ? 'text-[#5C4033]' : 'text-gray-400'
                }`} />
                <p className="text-sm font-medium mb-1">
                  {isDragActive ? 'Drop files here...' : 'Drag & drop images here'}
                </p>
                <p className="text-xs text-gray-500">or click to browse</p>
                <p className="text-xs text-gray-400 mt-2">Max 5MB per image • JPG, PNG, WebP</p>
              </div>

              {/* Image Previews */}
              {files.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Selected Images ({files.length})</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {previews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`} 
                          className="w-full h-20 object-cover rounded-lg border-2 border-gray-200 group-hover:border-[#5C4033]/50 transition-colors" 
                        />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          title="Remove image"
                        >
                          <X size={12} />
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {files.length === 0 && (
                <div className="text-center py-4">
                  <ImageIcon className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No images selected</p>
                  <p className="text-xs text-gray-400">At least one image is required</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Button */}
          <Button
            onClick={handleSave}
            disabled={isLoading || uploadingImages}
            className="w-full bg-[#5d4037] hover:bg-[#3e2f22] text-white py-3 text-base font-medium"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                {currentStep === 'uploading' && uploadingImages ? 'Uploading Images...' : 'Creating Product...'}
              </>
            ) : currentStep === 'complete' ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Product Created!
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Create Product
              </>
            )}
          </Button>

          {/* Form Status */}
          <div className="text-center">
            {hasFormData ? (
              <p className="text-sm text-orange-600 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                Form has unsaved data
              </p>
            ) : (
              <p className="text-sm text-gray-500">Fill out the form to get started</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadProduct;