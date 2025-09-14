import { useEffect, useState, useCallback, useMemo } from "react";
import { getOrders, updateOrderStatus } from "../services/api";
import type { Order } from "../types";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Package,
  User,
  Mail,
  Phone,
  Home,
  Calendar,
  Truck,
  Loader,
  ListChecks,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// Custom hook for debouncing user input to reduce API calls
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const statusOptions = [
  "all",
  "processing",
  "rejected",
  "confirmed",
  "shipped",
  "pending",
  "cancelled",
];
const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "price_low", label: "Price: Low to High" },
];

const StatCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) => (
  <Card className="bg-white/80 border-l-4" style={{ borderColor: color }}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-[#5C4033]">
        {title}
      </CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [filters, setFilters] = useState({
    sort: "newest",
    status: "all",
    search: "",
  });
  const debouncedSearch = useDebounce(filters.search, 500);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = { ...filters, search: debouncedSearch };
      const data = await getOrders(params);
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      toast.error("Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  }, [filters.sort, filters.status, debouncedSearch]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handle opening the dialog - Fixed version
  const handleOrderClick = useCallback((order: Order, e?: React.MouseEvent) => {
    // Prevent any potential event propagation issues
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log("Opening dialog for order:", order._id); // Debug log
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsDialogOpen(true);
  }, []);

  // Handle closing the dialog
  const handleDialogClose = useCallback(() => {
    console.log("Closing dialog"); // Debug log
    setIsDialogOpen(false);
    // Clear state immediately instead of using timeout
    setSelectedOrder(null);
    setNewStatus("");
    setIsUpdating(false);
  }, []);

  const handleFilterChange = (
    key: "sort" | "status" | "search",
    value: string
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus || isUpdating) return;
    
    try {
      setIsUpdating(true);
      await updateOrderStatus(selectedOrder._id, newStatus);
      
      // Update the order in the local state immediately for better UX
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === selectedOrder._id 
            ? { ...order, status: newStatus }
            : order
        )
      );
      
      toast.success("Order status updated successfully!");
      handleDialogClose();
      
      // Refresh the list after a short delay to ensure consistency
      setTimeout(() => {
        fetchOrders();
      }, 500);
      
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status. Please try again.");
      setIsUpdating(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "shipped":
        return "success";
      case "processing":
        return "secondary";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      case "cancelled":
        return "destructive";
      default:
        return "default";
    }
  };

  const orderStats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(
        (o) => o.status === "pending" || o.status === "processing"
      ).length,
      shipped: orders.filter((o) => o.status === "shipped").length,
    };
  }, [orders]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Orders"
          value={orderStats.total}
          icon={<ListChecks className="text-blue-500" />}
          color="#3b82f6"
        />
        <StatCard
          title="Pending/Processing"
          value={orderStats.pending}
          icon={<Loader className="text-orange-500" />}
          color="#f97316"
        />
        <StatCard
          title="Shipped Orders"
          value={orderStats.shipped}
          icon={<Truck className="text-green-500" />}
          color="#22c55e"
        />
      </div>

      <Card className="bg-white/80 border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#5C4033] font-serif">
            Order List
          </CardTitle>
          <CardDescription>
            Search, filter, and view customer orders <span className="text-xl font-bold">do not include # in order Number Search.</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by name, email, or Order ID..."
                className="pl-10"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status..." />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.sort}
              onValueChange={(value) => handleFilterChange("sort", value)}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {sortOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-10 text-[#5C4033]"
                  >
                    Loading orders...
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-10 text-[#5C4033]"
                  >
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow
                    key={order._id}
                    onClick={(e) => handleOrderClick(order, e)}
                    className="cursor-pointer hover:bg-[#f8f5f2] transition-colors"
                  >
                    <TableCell className="font-mono text-xs">
                      {order.orderNumber?.slice(-8)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {order.shippingAddress?.name || 'N/A'}
                    </TableCell>
                    <TableCell>₹{order.totalAmount?.toLocaleString() || '0'}</TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status) as any}>
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Fixed Dialog with proper state management */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
          {selectedOrder ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-[#5C4033] font-serif">
                  Order Details
                </DialogTitle>
                <p className="text-sm text-gray-500">
                  Order #{selectedOrder.orderNumber?.slice(-8) || 'N/A'}
                </p>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Customer Information */}
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User size={16} /> Customer Information
                  </h3>
                  <Separator />
                  {selectedOrder.shippingAddress?.email && (
                    <p className="flex items-center gap-3 text-sm">
                      <Mail size={14} className="text-gray-500" />
                      {selectedOrder.shippingAddress.email}
                    </p>
                  )}
                  {selectedOrder.shippingAddress?.phone && (
                    <p className="flex items-center gap-3 text-sm">
                      <Phone size={14} className="text-gray-500" />
                      {selectedOrder.shippingAddress.phone}
                    </p>
                  )}
                  {selectedOrder.shippingAddress?.address && (
                    <p className="flex items-center gap-3 text-sm">
                      <Home size={14} className="text-gray-500" />
                      {selectedOrder.shippingAddress.address}
                    </p>
                  )}
                  <p className="flex items-center gap-3 text-sm">
                    <Calendar size={14} className="text-gray-500" />
                    Placed on: {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Products Ordered */}
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Package size={16} /> Products Ordered
                  </h3>
                  <Separator />
                  <div className="max-h-[200px] overflow-y-auto pr-2">
                    {selectedOrder.products?.map((item) => (
                      <div
                        key={`${item.productId?._id}-${Math.random()}`}
                        className="flex items-center gap-4 py-2 hover:bg-gray-50 rounded-md cursor-pointer p-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.productId?._id) {
                            navigate(`/products/edit/${item.productId._id}`);
                          }
                        }}
                      >
                        <img
                          src={
                            item.productId?.images?.[0] ||
                            "https://via.placeholder.com/64"
                          }
                          alt={item.productId?.title || 'Product'}
                          className="w-16 h-16 rounded-md object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{item.productId?.title || 'Unknown Product'}</p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity || 0}
                          </p>
                        </div>
                        <p className="font-semibold">
                          ₹{((item.price || 0) * (item.quantity || 0)).toLocaleString()}
                        </p>
                      </div>
                    )) || <p className="text-gray-500">No products found</p>}
                  </div>
                </div>

                {/* Update Status */}
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Truck size={16} /> Update Status
                  </h3>
                  <Separator />
                  <div className="flex items-center gap-4 pt-2">
                    <Label htmlFor="status-update" className="whitespace-nowrap">
                      Order Status
                    </Label>
                    <Select 
                      value={newStatus} 
                      onValueChange={setNewStatus}
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Set status..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {statusOptions
                          .filter((s) => s !== "all")
                          .map((s) => (
                            <SelectItem key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleStatusUpdate}
                      className="bg-[#5d4037] hover:bg-[#3e2f22]"
                      disabled={isUpdating || newStatus === selectedOrder.status}
                    >
                      {isUpdating ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>

                {/* Order Total */}
                <div className="text-right">
                  <Separator className="my-2" />
                  <p className="text-lg font-bold">
                    Total:{" "}
                    <span className="text-green-600">
                      ₹{selectedOrder.totalAmount?.toLocaleString() || '0'}
                    </span>
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-10">
              <Loader className="animate-spin" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;