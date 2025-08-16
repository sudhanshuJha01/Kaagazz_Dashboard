import { useState, useEffect } from "react";
import AdminHeader from "../components/Header";

interface Order {
  _id: string;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    email: string;
  };
  products: { productId: string; title: string; quantity: number; price: number }[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

const statusOptions = ["Order Placed", "Packed", "Shipped", "Delivered", "Returned", "confirmed"];

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [changedStatuses, setChangedStatuses] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://backendecokaagazz-production.up.railway.app/api/order/list");
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data.orders || []);
        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load orders.");
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
    );
    setChangedStatuses((prev) => ({ ...prev, [orderId]: newStatus }));
  };

  const handleSave = async (orderId: string) => {
    const newStatus = changedStatuses[orderId];
    if (!newStatus) return;

    try {
      const res = await fetch(
        `https://backendecokaagazz-production.up.railway.app/api/order/update-status/${orderId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!res.ok) throw new Error("Failed to update status");
      setChangedStatuses((prev) => {
        const copy = { ...prev };
        delete copy[orderId];
        return copy;
      });
    } catch (err) {
      console.error(err);
      alert("Error updating order status");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-[#5C4033] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (error)
    return <div className="text-center text-red-500 mt-10">{error}</div>;

  return (
    <div className="w-screen h-screen bg-[url('/bg3.png')] bg-cover bg-center bg-no-repeat">
      <AdminHeader />
      <div className="w-full h-full bg-white/95 p-6 border-[#5C4033]/30 flex flex-col mt-[64px]">
        <h1 className="text-3xl font-bold text-[#5C4033] mb-8 text-center font-serif">
          All Orders
        </h1>
        <div className="flex-1 overflow-auto">
          <table className="w-full border border-[#5C4033]/30 rounded-lg overflow-hidden">
            <thead className="bg-[#5C4033]/80 text-white">
              <tr>
                <th className="px-4 py-3">Order No</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-[#f8f5f2] transition-colors text-center">
                  <td className="px-4 py-3 border">{order._id}</td>
                  <td className="px-4 py-3 border">{order.shippingAddress?.name}</td>
                  <td className="px-4 py-3 border">
                    {order.products.map((p) => `${p.title} (x${p.quantity})`).join(", ")}
                  </td>
                  <td className="px-4 py-3 border">₹{order.totalAmount}</td>
                  <td className="px-4 py-3 border">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 border">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="border rounded px-2 py-1 focus:ring-2 focus:ring-[#5C4033] text-[#5C4033]"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 border">
                    {changedStatuses[order._id] && (
                      <button
                        onClick={() => handleSave(order._id)}
                        className="bg-[#5C4033] text-black px-4 py-1 rounded hover:bg-[#3d2a20] transition-colors"
                      >
                        Save
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
