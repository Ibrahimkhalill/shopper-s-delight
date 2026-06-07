"use client";

import { useAdminStore } from "@/lib/admin-store";
import { StatCard } from "@/components/admin/StatCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { OrderStatusChart } from "@/components/admin/OrderStatusChart";
import {
  TrendingUp, ShoppingCart, Package, Users, Clock, CheckCircle, Tag, Heart,
} from "lucide-react";
import Link from "next/link";

const STATUS_BADGE: Record<string, string> = {
  placed:    "bg-blue-100 text-blue-700",
  packed:    "bg-yellow-100 text-yellow-700",
  shipped:   "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
};

export default function DashboardPage() {
  const { orders, products } = useAdminStore();

  const totalRevenue   = orders.reduce((s, o) => s + o.total, 0);
  const pendingOrders  = orders.filter((o) => o.status === "placed" || o.status === "packed").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const onSaleProducts = products.filter((p) => p.oldPrice).length;
  const recentOrders   = [...orders].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);

  // unique customers from orders
  const uniqueCustomers = new Set(orders.map((o) => o.phone)).size;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
        <p className="text-sm text-slate-400 mt-0.5">Manage all aspects of your e-commerce platform</p>
      </div>

      {/* Stat cards row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`৳${totalRevenue.toLocaleString()}`} subtitle="All time" icon={TrendingUp} color="green" />
        <StatCard title="Total Orders"  value={orders.length} subtitle={`${pendingOrders} pending`} icon={ShoppingCart} color="blue" />
        <StatCard title="Total Products" value={products.length} subtitle={`${onSaleProducts} on sale`} icon={Package} color="orange" />
        <StatCard title="Customers" value={uniqueCustomers} subtitle="Unique buyers" icon={Users} color="purple" />
      </div>

      {/* Stat cards row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pending Orders" value={pendingOrders} subtitle="Need attention" icon={Clock} color="yellow" />
        <StatCard title="Delivered" value={deliveredOrders} subtitle="Completed" icon={CheckCircle} color="teal" />
        <StatCard title="On Sale" value={onSaleProducts} subtitle="Discounted products" icon={Tag} color="red" />
        <StatCard title="Categories" value={[...new Set(products.map((p) => p.category))].length} subtitle="Active categories" icon={Heart} color="pink" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueChart orders={orders} />
        </div>
        <div>
          <OrderStatusChart orders={orders} />
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Recent Orders</h3>
          <Link href="/admin/orders" className="text-xs text-[#ef4444] font-semibold hover:underline">View All</Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">No orders yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Order ID</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Items</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{o.id.slice(0, 12)}…</td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-800">{o.name}</p>
                      <p className="text-xs text-slate-400">{o.phone}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 hidden sm:table-cell">{o.items.length} pcs</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">৳{o.total.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_BADGE[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400 hidden md:table-cell">
                      {new Date(o.createdAt).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
