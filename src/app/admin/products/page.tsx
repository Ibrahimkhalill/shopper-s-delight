"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useAdminStore } from "@/lib/admin-store";
import { availableStock } from "@/lib/admin-store";
import type { AdminProduct } from "@/lib/admin-store";
import {
  Plus, Search, Pencil, Trash2, AlertTriangle,
  ChevronLeft, ChevronRight, Package,
} from "lucide-react";
import { toast } from "sonner";
import { useEscapeClose } from "@/hooks/use-escape-close";

const PAGE_SIZE = 10;

export default function ProductsPage() {
  const { products, deleteProduct, categories } = useAdminStore();

  const [search, setSearch]           = useState("");
  const [catFilter, setCatFilter]     = useState("All");
  const [page, setPage]               = useState(1);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  useEscapeClose(deleteModal !== null, () => setDeleteModal(null));

  const parentCategories = useMemo(
    () => categories.filter((c) => c.status === "active" && !c.parentId),
    [categories]
  );

  const filtered = useMemo(() => {
    let arr = products;
    if (catFilter !== "All") arr = arr.filter((p) => p.category.toLowerCase() === catFilter.toLowerCase());
    if (search) arr = arr.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
    );
    return arr;
  }, [products, search, catFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Products</h2>
          <p className="text-sm text-slate-400">{products.length} total products in catalog</p>
        </div>
        <Link href="/admin/products/new"
          className="inline-flex items-center gap-2 h-10 px-5 bg-[#ef4444] hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition shrink-0 self-start sm:self-auto">
          <Plus className="size-4" /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition" />
        </div>
        <select value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setPage(1); }}
          className="sm:w-44 h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition bg-white">
          <option value="All">All Categories</option>
          {parentCategories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Product</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Brand</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Variants</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageItems.length === 0 && (
                <tr><td colSpan={8} className="text-center py-16 text-slate-400">No products found</td></tr>
              )}
              {pageItems.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="size-11 rounded-xl object-cover shrink-0 border border-slate-100 bg-slate-50" />
                      ) : (
                        <div className="size-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                          <Package className="size-5 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-800 line-clamp-1 max-w-[200px]">{p.name}</p>
                        <p className="text-xs text-slate-400">
                          {(p as AdminProduct).variants?.length
                            ? `${(p as AdminProduct).variants!.length} variants`
                            : p.colors?.length ? `${p.colors.length} colors` : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">{p.category}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-sm hidden md:table-cell">{p.brand}</td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-800">৳{p.price.toLocaleString()}</p>
                    {p.oldPrice && <p className="text-xs text-slate-400 line-through">৳{p.oldPrice.toLocaleString()}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const stock = availableStock(p as AdminProduct);
                      if (stock === null) return <span className="text-xs text-slate-400">—</span>;
                      if (stock === 0) return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-red-100 text-red-600">Out of stock</span>;
                      if (stock <= 10) return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-100 text-amber-700">Low · {stock}</span>;
                      return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-100 text-emerald-700">{stock} in stock</span>;
                    })()}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5">
                      {(p.colors ?? []).slice(0, 5).map((c, i) => (
                        <span key={i} className="size-3.5 rounded-full border border-white shadow-sm shrink-0" style={{ background: c }} />
                      ))}
                      {(p.colors ?? []).length > 5 && <span className="text-xs text-slate-400">+{p.colors.length - 5}</span>}
                      {(p.sizes ?? []).length > 0 && !p.colors?.length && (
                        <span className="text-xs text-slate-500">{(p.sizes ?? []).join(", ")}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      (p as AdminProduct).status === "draft" ? "bg-slate-100 text-slate-500" : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {(p as AdminProduct).status ?? "active"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link href={`/admin/products/${p.id}/edit`}
                        className="size-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500 transition opacity-0 group-hover:opacity-100">
                        <Pencil className="size-3.5" />
                      </Link>
                      <button onClick={() => setDeleteModal(p.id)}
                        className="size-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400 transition opacity-0 group-hover:opacity-100">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p-1))} disabled={page===1}
                className="size-8 rounded-lg border flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition">
                <ChevronLeft className="size-4" />
              </button>
              {Array.from({length:totalPages},(_,i)=>i+1).filter((n)=>Math.abs(n-page)<=2).map((n)=>(
                <button key={n} onClick={()=>setPage(n)}
                  className={`size-8 rounded-lg border text-sm font-medium transition ${n===page?"bg-[#0f172a] text-white border-[#0f172a]":"hover:bg-slate-50"}`}>{n}</button>
              ))}
              <button onClick={()=>setPage((p)=>Math.min(totalPages,p+1))} disabled={page===totalPages}
                className="size-8 rounded-lg border flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition">
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setDeleteModal(null)}>
          <div onClick={(e) => e.stopPropagation()} className="animate-scale-in bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="size-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="size-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Delete Product?</h3>
            <p className="text-sm text-slate-400 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(null)}
                className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold hover:bg-slate-50 transition">Cancel</button>
              <button onClick={() => { deleteProduct(deleteModal); toast.success("Product deleted"); setDeleteModal(null); }}
                className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
