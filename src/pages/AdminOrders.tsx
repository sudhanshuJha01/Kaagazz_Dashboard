import React from "react";
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
  Eye,
  Filter,
  SortAsc,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package2,
  TrendingUp,
  RefreshCw,
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
  trend,
  isLoading = false,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  trend?: number;
  isLoading?: boolean;
}) => (
  <Card className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
    <div className="absolute inset-0 bg-gradient-to-br opacity-5" style={{ background: `linear-gradient(135deg, ${color}20, ${color}05)` }} />
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
      <CardTitle className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
        {title}
      </CardTitle>
      <div className="p-2 rounded-full" style={{ backgroundColor: `${color}15` }}>
        {React.cloneElement(icon as React.ReactElement, { 
          className: "h-5 w-5 transition-transform group-hover:scale-110",
          style: { color }
        })}
      </div>
    </CardHeader>
    <CardContent className="relative z-10">
      <div className="flex items-baseline justify-between">
        {isLoading ? (
          <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
        ) : (
          <div className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</div>
        )}
        {trend !== undefined && (
          <div className={`flex items-center text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`h-3 w-3 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "shipped":
        return { variant: "default", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle };
      case "processing":
        return { variant: "secondary", color: "bg-blue-100 text-blue-800 border-blue-200", icon: Clock };
      case "pending":
        return { variant: "secondary", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: AlertCircle };
      case "confirmed":
        return { variant: "default", color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: CheckCircle };
      case "rejected":
        return { variant: "destructive", color: "bg-red-100 text-red-800 border-red-200", icon: XCircle };
      case "cancelled":
        return { variant: "destructive", color: "bg-red-100 text-red-800 border-red-200", icon: XCircle };
      default:
        return { variant: "default", color: "bg-gray-100 text-gray-800 border-gray-200", icon: Package };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  return (
    <Badge className={`${config.color} font-medium px-3 py-1 flex items-center gap-1 border`}>
      <IconComponent className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  const fetchOrders = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const params = { ...filters, search: debouncedSearch };
      const data = await getOrders(params);
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      toast.error("Failed to fetch orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters.sort, filters.status, debouncedSearch]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handle opening the dialog
  const handleOrderClick = useCallback((order: Order, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsDialogOpen(true);
  }, []);

  // Handle closing the dialog
  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
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
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === selectedOrder._id 
            ? { ...order, status: newStatus }
            : order
        )
      );
      
      toast.success("Order status updated successfully!");
      handleDialogClose();
      
      setTimeout(() => {
        fetchOrders(true);
      }, 500);
      
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status. Please try again.");
      setIsUpdating(false);
    }
  };

  const orderStats = useMemo(() => {
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === "pending" || o.status === "processing").length,
      shipped: orders.filter(o => o.status === "shipped").length,
      cancelled: orders.filter(o => o.status === "cancelled" || o.status === "rejected").length,
    };
    
    return stats;
  }, [orders]);

  const handleRefresh = () => {
    fetchOrders(true);
  };

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage customer orders</p>
        </div>
        
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
          className="flex items-center gap-2 hover:bg-gray-100"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Orders"
          value={orderStats.total}
          icon={<ListChecks />}
          color="#3b82f6"
          isLoading={loading}
        />
        <StatCard
          title="Pending/Processing"
          value={orderStats.pending}
          icon={<Clock />}
          color="#f59e0b"
          isLoading={loading}
        />
        <StatCard
          title="Shipped Orders"
          value={orderStats.shipped}
          icon={<Truck />}
          color="#10b981"
          isLoading={loading}
        />
        <StatCard
          title="Cancelled/Rejected"
          value={orderStats.cancelled}
          icon={<XCircle />}
          color="#ef4444"
          isLoading={loading}
        />
      </div>

      {/* Orders Table */}
      <Card className="shadow-xl border-0 bg-white">
        <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Package2 className="w-6 h-6 text-[#5C4033]" />
                Orders List
              </CardTitle>
              <CardDescription className="mt-1">
                Search, filter, and view customer orders
                <span className="ml-2 text-orange-600 font-semibold">
                  Note: Do not include # in order number search
                </span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by customer name, email, or order ID..."
                className="pl-10 bg-white border-gray-200 focus:border-[#5C4033] focus:ring-[#5C4033]"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
            
            <div className="flex gap-3">
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger className="w-full lg:w-[180px] bg-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s} className="hover:bg-gray-50">
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={filters.sort}
                onValueChange={(value) => handleFilterChange("sort", value)}
              >
                <SelectTrigger className="w-full lg:w-[180px] bg-white">
                  <SortAsc className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {sortOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="hover:bg-gray-50">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-gradient-to-r from-gray-100 to-gray-50">
                <TableRow className="border-gray-200">
                  <TableHead className="font-semibold text-gray-900">Order ID</TableHead>
                  <TableHead className="font-semibold text-gray-900">Customer</TableHead>
                  <TableHead className="font-semibold text-gray-900">Total</TableHead>
                  <TableHead className="font-semibold text-gray-900">Date</TableHead>
                  <TableHead className="font-semibold text-gray-900">Status</TableHead>
                  <TableHead className="font-semibold text-gray-900 w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Loader className="w-8 h-8 animate-spin text-[#5C4033]" />
                        <p className="text-gray-500 font-medium">Loading orders...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Package className="w-12 h-12 text-gray-300" />
                        <p className="text-gray-500 font-medium text-lg">No orders found</p>
                        <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order, index) => (
                    <TableRow
                      key={order._id}
                      onClick={(e) => handleOrderClick(order, e)}
                      className="cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group border-gray-100"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="font-mono text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#5C4033] opacity-60"></div>
                          #{order.orderNumber?.slice(-8) || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                            {order.shippingAddress?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {order.shippingAddress?.name || 'Unknown'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.shippingAddress?.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-lg text-green-600">
                          ₹{order.totalAmount?.toLocaleString() || '0'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          {selectedOrder ? (
            <div className="space-y-6">
              <DialogHeader className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <Eye className="w-6 h-6 text-[#5C4033]" />
                      Order Details
                    </DialogTitle>
                    <p className="text-gray-500 mt-1">
                      Order #{selectedOrder.orderNumber?.slice(-8) || 'N/A'} • 
                      Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <StatusBadge status={selectedOrder.status} />
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Customer Information */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border border-gray-200">
                    <CardHeader className="bg-gray-50 border-b">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        Customer Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      {selectedOrder.shippingAddress?.email && (
                        <div className="flex items-center gap-3 p-2 rounded bg-gray-50">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{selectedOrder.shippingAddress.email}</span>
                        </div>
                      )}
                      {selectedOrder.shippingAddress?.phone && (
                        <div className="flex items-center gap-3 p-2 rounded bg-gray-50">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{selectedOrder.shippingAddress.phone}</span>
                        </div>
                      )}
                      {selectedOrder.shippingAddress?.address && (
                        <div className="flex items-start gap-3 p-2 rounded bg-gray-50">
                          <Home className="w-4 h-4 text-gray-500 mt-0.5" />
                          <span className="text-sm">{selectedOrder.shippingAddress.address}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Products */}
                  <Card className="border border-gray-200">
                    <CardHeader className="bg-gray-50 border-b">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Package className="w-5 h-5 text-green-600" />
                        Products Ordered ({selectedOrder.products?.length || 0})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="max-h-80 overflow-y-auto">
                        {selectedOrder.products?.map((item, index) => (
                          <div
                            key={`${item.productId?._id}-${index}`}
                            className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b last:border-b-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (item.productId?._id) {
                                navigate(`/products/edit/${item.productId._id}`);
                              }
                            }}
                          >
                            <img
                              src={item.productId?.images?.[0] || "https://via.placeholder.com/64"}
                              alt={item.productId?.title || 'Product'}
                              className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {item.productId?.title || 'Unknown Product'}
                              </p>
                              <p className="text-sm text-gray-500">
                                Quantity: {item.quantity || 0}
                              </p>
                              <p className="text-sm text-gray-500">
                                Unit Price: ₹{(item.price || 0).toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-lg text-green-600">
                                ₹{((item.price || 0) * (item.quantity || 0)).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        )) || <p className="p-4 text-gray-500">No products found</p>}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Order Management */}
                <div className="space-y-6">
                  <Card className="border border-gray-200">
                    <CardHeader className="bg-gray-50 border-b">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Truck className="w-5 h-5 text-purple-600" />
                        Order Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <Label htmlFor="status-update" className="text-sm font-medium text-gray-700">
                          Update Status
                        </Label>
                        <Select 
                          value={newStatus} 
                          onValueChange={setNewStatus}
                          disabled={isUpdating}
                        >
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Set status..." />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {statusOptions
                              .filter((s) => s !== "all")
                              .map((s) => (
                                <SelectItem key={s} value={s} className="hover:bg-gray-50">
                                  {s.charAt(0).toUpperCase() + s.slice(1)}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button
                        onClick={handleStatusUpdate}
                        className="w-full bg-[#5d4037] hover:bg-[#3e2f22]"
                        disabled={isUpdating || newStatus === selectedOrder.status}
                      >
                        {isUpdating ? (
                          <>
                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Update Status
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Order Summary */}
                  <Card className="border border-gray-200">
                    <CardHeader className="bg-gray-50 border-b">
                      <CardTitle className="text-lg">Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>₹{(selectedOrder.totalAmount || 0).toLocaleString()}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total:</span>
                          <span className="text-green-600">
                            ₹{(selectedOrder.totalAmount || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin w-8 h-8" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;