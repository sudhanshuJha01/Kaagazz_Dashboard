import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserDetails } from '../services/api';
import type { UserDetails, Order } from '../types';
import { toast } from 'sonner';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const CustomerDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchUserDetails = async () => {
            try {
                const data = await getUserDetails(id);
                setUser(data.user);
            } catch (error) {
                toast.error("Failed to fetch customer details.");
            } finally {
                setLoading(false);
            }
        };
        fetchUserDetails();
    }, [id]);

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'shipped': return 'success';
            case 'processing': return 'secondary';
            case 'pending': return 'secondary';
            case 'rejected': return 'destructive';
            case 'cancelled': return 'destructive';
            default: return 'default';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-80px)]">
                <div className="w-10 h-10 border-4 border-[#5C4033] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-10">
                <p className="text-lg text-red-500">Customer not found.</p>
                <Button variant="outline" onClick={() => navigate('/customers')} className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Customers
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Button variant="outline" onClick={() => navigate('/customers')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Customers
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-white/80 border-none shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-[#5C4033] font-serif">{user.fullname}</CardTitle>
                            <CardDescription>{user.email}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
                            <p><strong>Role:</strong> {user.role}</p>
                            <p><strong>Verified:</strong> {user.isVerified ? 'Yes' : 'No'}</p>
                            <p><strong>Last Login:</strong> {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'N/A'}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/80 border-none shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-[#5C4033] font-serif">Lifetime Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p><strong>Total Orders:</strong> {user.totalOrders}</p>
                            <p><strong>Total Spent:</strong> <span className="font-bold text-green-700">₹{(user.totalSpent || 0).toLocaleString()}</span></p>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card className="bg-white/80 border-none shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-[#5C4033] font-serif flex items-center gap-2">
                                <ShoppingBag size={20}/> Order History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Separator />
                            <div className="max-h-[400px] overflow-y-auto mt-4 pr-2">
                                {user.orders.map((order: Order) => (
                                    <div key={order._id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-md">
                                        <p className="font-mono text-sm">#{order.orderNumber.slice(-8)}</p>
                                        <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                                        <Badge variant={getStatusVariant(order.status) as any}>{order.status}</Badge>
                                        <p className="font-semibold">₹{order.totalAmount.toLocaleString()}</p>
                                    </div>
                                ))}
                                {user.orders.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No orders found.</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
export default CustomerDetails;