import React, { useState, useEffect } from "react";
import { CreditCard, ShoppingBag, Eye, RefreshCw, CheckCircle, PackageOpen } from "lucide-react";

interface Order {
  id: string;
  farmerName: string;
  phone: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  status: "Pending" | "Shipped" | "Delivered";
  date: string;
}

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("farmalert_orders");
    if (saved) {
      setOrders(JSON.parse(saved));
    } else {
      const defaults: Order[] = [
        { id: "o1", farmerName: "Nikunj Patel", phone: "9876543210", productName: "Premium BT Cotton Seeds", quantity: 5, totalPrice: 4250, status: "Pending", date: new Date(Date.now() - 3600000).toISOString() },
        { id: "o2", farmerName: "Ramesh Bhai", phone: "9823456789", productName: "N-P-K Organic Fertilizer", quantity: 10, totalPrice: 4200, status: "Shipped", date: new Date(Date.now() - 86400000).toISOString() },
        { id: "o3", farmerName: "Dinesh Kumar", phone: "9900887766", productName: "Drip Irrigation Hose (100m)", quantity: 1, totalPrice: 2400, status: "Delivered", date: new Date(Date.now() - 172800000).toISOString() }
      ];
      setOrders(defaults);
      localStorage.setItem("farmalert_orders", JSON.stringify(defaults));
    }
  }, []);

  const updateOrderStatus = (id: string, nextStatus: Order["status"]) => {
    const updated = orders.map(o => o.id === id ? { ...o, status: nextStatus } : o);
    setOrders(updated);
    localStorage.setItem("farmalert_orders", JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Orders Management</h2>
        <p className="text-slate-500 text-sm mt-1">Review farmer seed/fertilizer orders and manage delivery states.</p>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-6">Farmer</th>
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6">Total Cost</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Order Date</th>
                <th className="py-4 px-6 text-center">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 text-sm">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-mono text-xs font-semibold text-slate-800">
                    FA-ORD-{o.id.toUpperCase()}
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <span className="font-semibold text-slate-800">{o.farmerName}</span>
                      <div className="text-slate-400 text-xs mt-0.5">{o.phone}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <span className="font-semibold text-slate-800">{o.productName}</span>
                      <div className="text-slate-400 text-xs mt-0.5">Qty: {o.quantity} units</div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-800">₹{o.totalPrice}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      o.status === "Delivered" 
                        ? "bg-green-50 text-green-700 border-green-100" 
                        : o.status === "Shipped"
                        ? "bg-blue-50 text-blue-700 border-blue-100"
                        : "bg-amber-50 text-amber-700 border-amber-100"
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-400 text-xs font-mono">
                    {new Date(o.date).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="inline-flex gap-2">
                      <select
                        value={o.status}
                        onChange={(e: any) => updateOrderStatus(o.id, e.target.value)}
                        className="px-2.5 py-1 border border-slate-200 rounded text-xs text-slate-600 bg-white focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>
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
