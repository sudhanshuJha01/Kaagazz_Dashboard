import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct, applyBulkDiscount } from '../services/api';
import type { Product } from '../types';
import { toast } from 'sonner';
import { Trash2, Pencil, PlusCircle, Sprout } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AllProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [bulkDiscount, setBulkDiscount] = useState(0);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data.products);
    } catch (error) {
      toast.error("Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked) {
      setSelectedProducts(products.map(p => p._id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectOne = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId);
    setShowDeleteDialog(true);
  };
  
  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete);
      toast.success("Product deleted successfully!");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to delete product.");
    } finally {
      setShowDeleteDialog(false);
      setProductToDelete(null);
    }
  };
  
  const handleApplyBulkDiscount = async () => {
    if (selectedProducts.length === 0) return toast.error("No products selected.");
    if (bulkDiscount < 0 || bulkDiscount > 100) return toast.error("Discount must be between 0 and 100.");

    try {
        const res = await applyBulkDiscount(selectedProducts, bulkDiscount);
        toast.success(res.message);
        fetchProducts(); // Refresh data
        setIsBulkDialogOpen(false);
        setSelectedProducts([]);
        setBulkDiscount(0);
    } catch (error: any) {
        toast.error("Failed to apply discount.", { description: error.message });
    }
  };

  if (loading) return <div className="text-center py-10 text-[#5C4033]">Loading products...</div>;

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 border-none shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-[#5C4033] font-serif">Manage Products</CardTitle>
            <CardDescription>View, edit, or delete your products.</CardDescription>
          </div>
          <div className="flex gap-4">
            {selectedProducts.length > 0 && (
                <Button variant="outline" onClick={() => setIsBulkDialogOpen(true)}>
                    <Sprout className="mr-2 h-4 w-4" /> Bulk Actions ({selectedProducts.length})
                </Button>
            )}
            <Button onClick={() => navigate("/upload")} className="bg-[#5d4037] hover:bg-[#3e2f22]">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                    <Checkbox onCheckedChange={handleSelectAll} checked={products.length > 0 && selectedProducts.length === products.length} />
                </TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Original Price</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Final Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const finalPrice = product.originalPrice * (1 - (product.discountPercent || 0) / 100);
                return (
                  <TableRow key={product._id}>
                    <TableCell>
                        <Checkbox onCheckedChange={(checked) => handleSelectOne(product._id, !!checked)} checked={selectedProducts.includes(product._id)} />
                    </TableCell>
                    <TableCell className="font-medium flex items-center gap-4">
                      <img src={product.images?.[0] || 'https://via.placeholder.com/40'} alt={product.title} className="w-10 h-10 rounded-md object-cover" />
                      {product.title}
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>₹{product.originalPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-green-600">{product.discountPercent || 0}%</TableCell>
                    <TableCell className="font-semibold">₹{finalPrice.toFixed(2)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => navigate(`/products/edit/${product._id}`)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(product._id)} className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        {/* <<< FIX: Added bg-white to make the dialog solid */}
        <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone. This will permanently delete the product.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Discount Dialog */}
      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        {/* <<< FIX: Added bg-white to make the dialog solid */}
        <DialogContent className="bg-white">
            <DialogHeader>
                <DialogTitle>Apply Bulk Discount</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <p>You have selected {selectedProducts.length} products.</p>
                <div>
                    <Label htmlFor="bulk-discount">Discount Percentage</Label>
                    <Input id="bulk-discount" type="number" placeholder="e.g., 15" onChange={(e) => setBulkDiscount(Number(e.target.value))} />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleApplyBulkDiscount} className="bg-[#5d4037] hover:bg-[#3e2f22]">Apply Discount</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default AllProducts;