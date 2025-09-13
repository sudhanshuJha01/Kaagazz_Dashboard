import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { createProduct, uploadProductImages } from '../services/api';
import { toast } from 'sonner';
import { UploadCloud, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const UploadProduct = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [productData, setProductData] = useState({
    title: "",
    description: "",
    originalPrice: "",
    discountPercent: "0",
    category: "Stationery",
    stock: "",
    tags: "",
    isTopPick: false,
    isTrending: false,
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...files, ...acceptedFiles];
    setFiles(newFiles);
    previews.forEach(url => URL.revokeObjectURL(url));
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  }, [files, previews]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } });

  const removeFile = (indexToRemove: number) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setPreviews(prev => {
        const newPreviews = prev.filter((_, index) => index !== indexToRemove);
        URL.revokeObjectURL(prev[indexToRemove]);
        return newPreviews;
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };
  
  const handleSwitchChange = (field: 'isTopPick' | 'isTrending', checked: boolean) => {
    setProductData(prev => ({ ...prev, [field]: checked }));
  };

  const handleSave = async () => {
    if (!productData.title || !productData.originalPrice || !productData.stock || files.length === 0) {
      return toast.error("Please fill all required fields and upload at least one image.");
    }
    setIsLoading(true);
    const finalProductData = {
      ...productData,
      tags: productData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
    };

    try {
      const createdProductResponse = await createProduct(finalProductData);
      const newProduct = createdProductResponse.product;
      await uploadProductImages(newProduct._id, files);
      toast.success("Product created and images uploaded successfully!");
      navigate('/products');
    } catch (error: any) {
      toast.error("Failed to create product.", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <h1 className="text-3xl font-bold text-[#5C4033] font-serif">Upload New Product</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form Fields */}
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4 border border-[#5C4033]/20">
          <div>
            <Label htmlFor="title">Title</Label>
            <input id="title" name="title" value={productData.title} onChange={handleChange} placeholder="Product Title" className="mt-1 w-full p-2 border rounded" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <textarea id="description" name="description" value={productData.description} onChange={handleChange} placeholder="Description" className="mt-1 w-full p-2 border rounded" rows={4}></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <Label htmlFor="originalPrice">Price (₹)</Label>
                <input id="originalPrice" name="originalPrice" value={productData.originalPrice} onChange={handleChange} placeholder="e.g., 500" type="number" className="mt-1 w-full p-2 border rounded" />
            </div>
            <div>
                <Label htmlFor="discountPercent">Discount %</Label>
                <input id="discountPercent" name="discountPercent" value={productData.discountPercent} onChange={handleChange} placeholder="e.g., 10" type="number" className="mt-1 w-full p-2 border rounded" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <Label htmlFor="stock">Stock</Label>
                <input id="stock" name="stock" value={productData.stock} onChange={handleChange} placeholder="e.g., 100" type="number" className="mt-1 w-full p-2 border rounded" />
            </div>
            <div>
                <Label htmlFor="category">Category</Label>
                <select id="category" name="category" value={productData.category} onChange={handleChange} className="mt-1 w-full p-2 border rounded">
                    <option>Stationery</option><option>Gift Sets</option><option>Paper</option><option>Chitrayan</option>
                </select>
            </div>
          </div>
          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <input id="tags" name="tags" value={productData.tags} onChange={handleChange} placeholder="e.g., eco-friendly, handmade" className="mt-1 w-full p-2 border rounded" />
          </div>
          <div className="flex items-center space-x-4 pt-2">
            <div className="flex items-center space-x-2">
                <Switch 
                    id="isTopPick" 
                    checked={productData.isTopPick} 
                    onCheckedChange={(checked) => handleSwitchChange('isTopPick', checked)}
                    className="data-[state=checked]:bg-black"
                />
                <Label htmlFor="isTopPick">Top Pick</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Switch 
                    id="isTrending" 
                    checked={productData.isTrending} 
                    onCheckedChange={(checked) => handleSwitchChange('isTrending', checked)}
                    className="data-[state=checked]:bg-black"
                />
                <Label htmlFor="isTrending">Trending</Label>
            </div>
          </div>
        </div>

        {/* Image Uploader */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-[#5C4033]/20">
          <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${isDragActive ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
            <input {...getInputProps()} />
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">Drag & drop files here, or click to select</p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative">
                <img src={preview} alt={`preview ${index}`} className="w-full h-24 object-cover rounded-md" onLoad={() => URL.revokeObjectURL(preview)} />
                <button onClick={() => removeFile(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 leading-none"><X size={12} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="text-right">
        <button onClick={handleSave} disabled={isLoading} className="px-8 py-3 bg-[#5d4037] text-white rounded-lg hover:bg-[#3e2f22] disabled:bg-gray-400">
          {isLoading ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </div>
  );
};
export default UploadProduct;