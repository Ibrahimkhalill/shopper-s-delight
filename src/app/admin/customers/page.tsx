"use client";

import { useState, useMemo } from "react";
import { useAdminStore } from "@/lib/admin-store";
import { Search, ShoppingBag } from "lucide-react";

export default function CustomersPage() {
  const { orders } = useAdminStore();
  const [search, setSearch] = useState("");

  // Derive unique customers from orders
  const customers = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; email?: string; orderCount: number; totalSpent: number; lastOrder: number }>();
    orders.forEach((o) => {
      const existing = map.get(o.phone);
      if (existing) {
        existing.orderCount += 1;
        existing.totalSpent += o.total;
        if (o.createdAt > existing.lastOrder) existing.lastOrder = o.createdAt;
      } else {
        map.set(o.phone, { name: o.name, phone: o.phone, email: o.email, orderCount: 1, totalSpent: o.total, lastOrder: o.createdAt });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.lastOrder - a.lastOrder);
  }, [orders]);

  const filtered = useMemo(() =>
    customers.filter((c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email ?? "").toLowerCase().includes(search.toLowerCase())
    ), [customers, search]);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">All Customers</h2>
        <p className="text-sm text-slate-400">{customers.length} unique customers from order history</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, email..."
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Orders</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Spent</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Last Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-slate-400">
                  {orders.length === 0 ? "No orders placed yet" : "No customers found"}
                </td></tr>
              ) : filtered.map((c, i) => (
                <tr key={c.phone} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-800">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 hidden sm:table-cell">{c.phone}</td>
                  <td className="px-4 py-3.5 text-slate-400 hidden md:table-cell">{c.email ?? "—"}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <ShoppingBag className="size-3.5 text-slate-400" />
                      <span className="font-medium text-slate-700">{c.orderCount}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800">৳{c.totalSpent.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-400 hidden lg:table-cell">
                    {new Date(c.lastOrder).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
