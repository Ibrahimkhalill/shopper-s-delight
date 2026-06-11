"use client";

import { useState, useMemo } from "react";
import { useAdminStore } from "@/lib/admin-store";
import { Search, X, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import type { Order } from "@/lib/store";
import { toast } from "sonner";
import { useEscapeClose } from "@/hooks/use-escape-close";

const STATUS_OPTIONS: Order["status"][] = ["placed", "packed", "shipped", "delivered"];
const STATUS_BADGE: Record<Order["status"], string> = {
  placed:    "bg-blue-100 text-blue-700",
  packed:    "bg-yellow-100 text-yellow-700",
  shipped:   "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
};
const PAGE_SIZE = 12;

export default function OrdersPage() {
  const { orders, products, updateOrderStatus } = useAdminStore();
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState<Order["status"] | "all">("all");
  const [page, setPage]           = useState(1);
  const [selected, setSelected]   = useState<Order | null>(null);
  useEscapeClose(selected !== null, () => setSelected(null));

  const filtered = useMemo(() => {
    let arr = [...orders].sort((a, b) => b.createdAt - a.createdAt);
    if (statusFilter !== "all") arr = arr.filter((o) => o.status === statusFilter);
    if (search) arr = arr.filter((o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.phone.includes(search)
    );
    return arr;
  }, [orders, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleStatusChange = (id: string, status: Order["status"]) => {
    updateOrderStatus(id, status);
    toast.success(`Order status updated to ${status}`);
    if (selected?.id === id) setSelected((o) => o ? { ...o, status } : o);
  };

  const resolveProduct = (pid: string) => products.find((p) => p.id === pid);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Orders Management</h2>
        <p className="text-sm text-slate-400">{orders.length} total orders</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", ...STATUS_OPTIONS] as const).map((s) => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }}
            className={`h-9 px-4 rounded-full text-sm font-semibold border transition capitalize ${
              statusFilter === s ? "bg-[#0f172a] text-white border-[#0f172a]" : "border-slate-200 text-slate-600 hover:border-slate-400 bg-white"
            }`}>
            {s === "all" ? "All Orders" : s}
            <span className="ml-1.5 text-xs opacity-70">
              ({s === "all" ? orders.length : orders.filter((o) => o.status === s).length})
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by order ID, name, phone..."
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Items</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Date</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageItems.length === 0 && (
                <tr><td colSpan={7} className="text-center py-16 text-slate-400">No orders found</td></tr>
              )}
              {pageItems.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-600">{o.id.slice(0, 14)}…</td>
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-slate-800">{o.name}</p>
                    <p className="text-xs text-slate-400">{o.phone}</p>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 hidden sm:table-cell">{o.items.length} pcs</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800">৳{o.total.toLocaleString()}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_BADGE[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-400 hidden md:table-cell">
                    {new Date(o.createdAt).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-end">
                      <button onClick={() => setSelected(o)} className="size-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500 transition">
                        <Eye className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-400">Showing {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE,filtered.length)} of {filtered.length}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p-1))} disabled={page===1} className="size-8 rounded-lg border flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition"><ChevronLeft className="size-4" /></button>
              {Array.from({length:totalPages},(_,i)=>i+1).filter((n)=>Math.abs(n-page)<=2).map((n)=>(
                <button key={n} onClick={()=>setPage(n)} className={`size-8 rounded-lg border text-sm font-medium transition ${n===page?"bg-[#0f172a] text-white border-[#0f172a]":"hover:bg-slate-50"}`}>{n}</button>
              ))}
              <button onClick={()=>setPage((p)=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="size-8 rounded-lg border flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition"><ChevronRight className="size-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setSelected(null)}>
          <div onClick={(e) => e.stopPropagation()} className="animate-scale-in bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Order Details</h3>
                <p className="text-xs text-slate-400 font-mono">{selected.id}</p>
              </div>
              <button onClick={() => setSelected(null)} className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition">
                <X className="size-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
              {/* Customer info */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-1.5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Customer Info</p>
                <p className="text-sm font-semibold text-slate-800">{selected.name}</p>
                <p className="text-xs text-slate-500">{selected.phone}</p>
                {selected.email && <p className="text-xs text-slate-500">{selected.email}</p>}
                <p className="text-xs text-slate-500 mt-1">{selected.address}</p>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Items ({selected.items.length})</p>
                <div className="space-y-2">
                  {selected.items.map((item, i) => {
                    const p = resolveProduct(item.id);
                    return (
                      <div key={i} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl">
                        {p && <img src={p.image} alt={p.name} className="size-10 rounded-lg object-cover bg-slate-100 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{p?.name ?? item.id}</p>
                          {item.size && <p className="text-xs text-slate-400">Size: {item.size}</p>}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-slate-800">×{item.qty}</p>
                          {p && <p className="text-xs text-slate-400">৳{(p.price * item.qty).toLocaleString()}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                <span className="text-sm font-semibold text-slate-600">Total Amount</span>
                <span className="text-lg font-bold text-slate-800">৳{selected.total.toLocaleString()}</span>
              </div>

              {/* Status update */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Update Status</p>
                <div className="flex gap-2 flex-wrap">
                  {STATUS_OPTIONS.map((s) => (
                    <button key={s} onClick={() => handleStatusChange(selected.id, s)}
                      className={`h-9 px-4 rounded-full text-xs font-semibold border transition capitalize ${
                        selected.status === s ? STATUS_BADGE[s] + " border-transparent" : "border-slate-200 text-slate-600 hover:border-slate-400"
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 shrink-0">
              <button onClick={() => setSelected(null)} className="w-full h-10 rounded-xl bg-[#0f172a] text-white text-sm font-semibold hover:bg-slate-700 transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
