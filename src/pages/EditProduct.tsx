import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getProductById, updateProduct, deleteProduct } from "../services/api";
// import type { Product } from "../types";
import { Trash2 } from "lucide-react";
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

const categories = ["Stationery", "Gift Sets", "Paper", "Chitrayan"];

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [productData, setProductData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProductData({
            ...data.product,
            tags: data.product.tags?.join(', ') || ''
        });
      } catch (error) {
        toast.error("Failed to fetch product details.");
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductData((prev: any) => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (field: 'isTopPick' | 'isTrending', checked: boolean) => {
    setProductData((prev: any) => ({ ...prev, [field]: checked }));
  };

  const handleSave = async () => {
    if (!id) return;
    const finalProductData = {
        ...productData,
        tags: productData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag),
    };

    try {
      await updateProduct(id, finalProductData);
      toast.success("Product updated successfully!");
      navigate('/products');
    } catch (error) {
      toast.error("Failed to save changes.");
    }
  };
  
  const confirmDelete = async () => {
    if (!id) return;
    try {
      await deleteProduct(id);
      toast.success("Product deleted successfully!");
      navigate('/products');
    } catch (error) {
      toast.error("Failed to delete product.");
    } finally {
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)]">
        <div className="w-10 h-10 border-4 border-[#5C4033] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#5C4033] font-serif">Edit Product</h1>
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Trash2 size={16} />
          Delete Product
        </button>
      </div>
      
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Side: Form Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <input id="title" type="text" name="title" value={productData.title || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
             <div>
                <Label htmlFor="description">Description</Label>
                <textarea id="description" name="description" value={productData.description || ''} onChange={handleChange} rows={4} className="mt-1 block w-full border rounded-md px-3 py-2"></textarea>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="originalPrice">Price (₹)</Label>
                    <input id="originalPrice" type="number" name="originalPrice" value={productData.originalPrice || ''} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2" />
                </div>
                <div>
                    <Label htmlFor="discountPercent">Discount %</Label>
                    <input id="discountPercent" type="number" name="discountPercent" value={productData.discountPercent || '0'} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="stock">Stock</Label>
                    <input id="stock" type="number" name="stock" value={productData.stock || ''} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2" />
                </div>
                 <div>
                    <Label htmlFor="category">Category</Label>
                    <select id="category" name="category" value={productData.category || ''} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2">
                        {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <input id="tags" type="text" name="tags" value={productData.tags || ''} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2" />
            </div>
             <div className="flex items-center space-x-4 pt-2">
                <div className="flex items-center space-x-2">
                    <Switch 
                        id="isTopPick" 
                        checked={productData.isTopPick || false} 
                        onCheckedChange={(checked) => handleSwitchChange('isTopPick', checked)}
                        className="data-[state=checked]:bg-black"
                    />
                    <Label htmlFor="isTopPick">Top Pick</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Switch 
                        id="isTrending" 
                        checked={productData.isTrending || false} 
                        onCheckedChange={(checked) => handleSwitchChange('isTrending', checked)}
                        className="data-[state=checked]:bg-black"
                    />
                    <Label htmlFor="isTrending">Trending</Label>
                </div>
            </div>
          </div>

          {/* Right Side: Image Preview */}
          <div className="space-y-4">
             <Label>Product Images</Label>
             <div className="grid grid-cols-2 gap-4">
                {productData.images?.map((img: string, index: number) => (
                    <img key={index} src={img} alt={`Product image ${index + 1}`} className="w-full h-32 object-cover rounded-lg border" />
                ))}
                {(!productData.images || productData.images.length === 0) && <p className="text-sm text-gray-500 col-span-2">No images uploaded for this product.</p>}
             </div>
             <p className="text-xs text-gray-500">To update images, a new product entry is required for now.</p>
          </div>
        </div>
        <div className="mt-8 text-right">
          <button onClick={handleSave} className="px-8 py-3 bg-[#5d4037] text-white rounded-lg hover:bg-[#3e2f22]">
            Save Changes
          </button>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
export default EditProduct;