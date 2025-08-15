import { useState } from "react";
import AdminHeader from "../components/Header";
interface Order {
  id: number;
  customerName: string;
  productName: string;
  date: string;
  status: string;
}

const initialOrders: Order[] = [
  { id: 1, customerName: "John Doe", productName: "Kaagazz Notebook", date: "2025-08-14", status: "Order Placed" },
  { id: 2, customerName: "Jane Smith", productName: "Kaagazz Pen", date: "2025-08-13", status: "Packed" },
  { id: 3, customerName: "Alex Brown", productName: "Kaagazz Sketchbook", date: "2025-08-12", status: "Delivered" },
];

const statusOptions = ["Order Placed", "Packed", "Shipped", "Delivered", "Returned"];

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [changedOrders, setChangedOrders] = useState<{ [key: number]: string }>({});

  const handleStatusChange = (orderId: number, newStatus: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    setChangedOrders((prev) => ({ ...prev, [orderId]: newStatus }));
  };

  const handleSave = (orderId: number) => {
    console.log(`Saving Order ${orderId} with status: ${changedOrders[orderId]}`);
    setChangedOrders((prev) => {
      const updated = { ...prev };
      delete updated[orderId];
      return updated;
    });
  };

  return (
    <div className="w-screen h-screen bg-[url('/bg3.png')] bg-cover bg-center bg-no-repeat">
      <AdminHeader />
      <div className="w-full h-full bg-white/95 shadow-lg p-6 border border-[#5C4033]/30 flex flex-col mt-15">
        <h1 className="text-3xl font-bold text-[#5C4033] mb-8 text-center font-serif">
          All Orders
        </h1>

        <div className="flex-1 overflow-auto">
          <table className="w-full border border-[#5C4033]/30 rounded-lg overflow-hidden">
            <thead className="bg-[#5C4033]/80 text-white">
              <tr>
                <th className="px-4 py-3 border">Order ID</th>
                <th className="px-4 py-3 border">Customer</th>
                <th className="px-4 py-3 border">Product</th>
                <th className="px-4 py-3 border">Date</th>
                <th className="px-4 py-3 border">Status</th>
                <th className="px-4 py-3 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="text-center hover:bg-[#f8f5f2] transition-colors"
                >
                  <td className="px-4 py-3 border">{order.id}</td>
                  <td className="px-4 py-3 border">{order.customerName}</td>
                  <td className="px-4 py-3 border">{order.productName}</td>
                  <td className="px-4 py-3 border">{order.date}</td>
                  <td className="px-4 py-3 border">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#5C4033] text-[#5C4033]"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 border">
                    {changedOrders[order.id] && (
                      <button
                        onClick={() => handleSave(order.id)}
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
