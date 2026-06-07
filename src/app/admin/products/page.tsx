"use client";

import { useState, useMemo } from "react";
import { useAdminStore } from "@/lib/admin-store";
import { Plus, Search, Pencil, Trash2, X, Check, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/components/site/ProductCard";
import { toast } from "sonner";

const CATEGORIES = ["Fashion", "Gadgets", "Home & Living", "Beauty", "Grocery", "Deals"];
const SIZES_LIST  = ["XS", "S", "M", "L", "XL", "XXL", "1 size", "7", "8", "10"];
const BADGE_OPTIONS = [
  { label: "None", value: "" },
  { label: "NEW", value: "new" },
  { label: "SALE", value: "sale" },
  { label: "TRENDING", value: "trending" },
];
const PAGE_SIZE = 10;

const emptyForm = (): Omit<Product, "id"> => ({
  name: "", category: "Fashion", brand: "", price: 0, oldPrice: undefined,
  image: "", images: [], colors: ["#000000"], sizes: ["M"],
  badge: undefined, material: "", liked: false,
});

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useAdminStore();
  const [search, setSearch]     = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [page, setPage]         = useState(1);
  const [modal, setModal]       = useState<"add" | "edit" | "delete" | null>(null);
  const [editing, setEditing]   = useState<Product | null>(null);
  const [form, setForm]         = useState<Omit<Product, "id">>(emptyForm());
  const [colorInput, setColorInput] = useState("#000000");
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  const openAdd = () => { setForm(emptyForm()); setEditing(null); setModal("add"); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, category: p.category, brand: p.brand, price: p.price,
      oldPrice: p.oldPrice, image: p.image, images: p.images ?? [], colors: p.colors,
      sizes: p.sizes, badge: p.badge, material: p.material, liked: p.liked });
    setModal("edit");
  };
  const openDelete = (id: string) => { setDeleteId(id); setModal("delete"); };
  const closeModal = () => { setModal(null); setEditing(null); setDeleteId(null); };

  const handleSave = () => {
    if (!form.name.trim() || !form.brand.trim() || form.price <= 0 || !form.image.trim()) {
      toast.error("Please fill all required fields (Name, Brand, Price, Image URL)");
      return;
    }
    if (modal === "add") {
      addProduct(form);
      toast.success("Product added successfully");
    } else if (modal === "edit" && editing) {
      updateProduct(editing.id, form);
      toast.success("Product updated successfully");
    }
    closeModal();
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteProduct(deleteId);
      toast.success("Product deleted");
      closeModal();
    }
  };

  const toggleSize = (s: string) =>
    setForm((f) => ({ ...f, sizes: f.sizes.includes(s) ? f.sizes.filter((x) => x !== s) : [...f.sizes, s] }));

  const addColor = () => {
    if (!form.colors.includes(colorInput)) setForm((f) => ({ ...f, colors: [...f.colors, colorInput] }));
  };
  const removeColor = (c: string) => setForm((f) => ({ ...f, colors: f.colors.filter((x) => x !== c) }));

  const discount = form.oldPrice && form.oldPrice > form.price
    ? Math.round((1 - form.price / form.oldPrice) * 100) : 0;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Products</h2>
          <p className="text-sm text-slate-400">{products.length} total products in catalog</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 h-10 px-4 bg-[#ef4444] hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition shrink-0">
          <Plus className="size-4" /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search products..."
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition"
            />
          </div>
          <select
            value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setPage(1); }}
            className="h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 bg-white"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Colors</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Badge</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageItems.length === 0 && (
                <tr><td colSpan={7} className="text-center py-16 text-slate-400">No products found</td></tr>
              )}
              {pageItems.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="size-10 rounded-lg object-cover shrink-0 bg-slate-100" />
                      <span className="font-medium text-slate-800 line-clamp-1 max-w-[160px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{p.category}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{p.brand}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">৳{p.price.toLocaleString()}</p>
                    {p.oldPrice && <p className="text-xs text-slate-400 line-through">৳{p.oldPrice.toLocaleString()}</p>}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex gap-1">
                      {p.colors.slice(0, 4).map((c, i) => (
                        <span key={i} className="size-4 rounded-full border border-slate-200 shrink-0" style={{ background: c }} />
                      ))}
                      {p.colors.length > 4 && <span className="text-xs text-slate-400">+{p.colors.length - 4}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {p.badge ? (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase ${
                        p.badge.tone === "new" ? "bg-slate-800 text-white" :
                        p.badge.tone === "sale" ? "bg-red-100 text-red-600" :
                        "bg-amber-100 text-amber-600"
                      }`}>{p.badge.label}</span>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="size-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500 transition">
                        <Pencil className="size-3.5" />
                      </button>
                      <button onClick={() => openDelete(p.id)} className="size-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500 transition">
                        <Trash2 className="size-3.5" />
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
            <p className="text-xs text-slate-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="size-8 rounded-lg border flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition">
                <ChevronLeft className="size-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).filter((n) => Math.abs(n - page) <= 2).map((n) => (
                <button key={n} onClick={() => setPage(n)}
                  className={`size-8 rounded-lg border text-sm font-medium transition ${n === page ? "bg-[#0f172a] text-white border-[#0f172a]" : "hover:bg-slate-50"}`}>
                  {n}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="size-8 rounded-lg border flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition">
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {(modal === "add" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
              <h3 className="text-lg font-bold text-slate-800">{modal === "add" ? "Add New Product" : "Edit Product"}</h3>
              <button onClick={closeModal} className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition">
                <X className="size-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
              {/* Row 1: Name */}
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Product Name *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition"
                  placeholder="e.g. Floral Summer Top" />
              </div>

              {/* Row 2: Category + Brand */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Category *</label>
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 bg-white transition">
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Brand *</label>
                  <input value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition"
                    placeholder="e.g. UrbanFit" />
                </div>
              </div>

              {/* Row 3: Price + Old Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Price (৳) *</label>
                  <input type="number" min="0" value={form.price || ""}
                    onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition"
                    placeholder="1200" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">
                    Old Price (৳) {discount > 0 && <span className="text-green-600 font-bold ml-1">−{discount}% off</span>}
                  </label>
                  <input type="number" min="0" value={form.oldPrice || ""}
                    onChange={(e) => setForm((f) => ({ ...f, oldPrice: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition"
                    placeholder="1400 (optional)" />
                </div>
              </div>

              {/* Row 4: Image URL */}
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Image URL *</label>
                <div className="flex gap-2">
                  <input value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                    className="flex-1 h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition"
                    placeholder="https://..." />
                  {form.image && (
                    <img src={form.image} alt="" className="size-10 rounded-xl object-cover border border-slate-200 shrink-0" />
                  )}
                </div>
              </div>

              {/* Row 5: Badge */}
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Badge</label>
                <div className="flex gap-2 flex-wrap">
                  {BADGE_OPTIONS.map((b) => {
                    const active = b.value === "" ? !form.badge : form.badge?.tone === b.value;
                    return (
                      <button key={b.value} type="button" onClick={() =>
                        setForm((f) => ({ ...f, badge: b.value ? { label: b.label, tone: b.value as "new"|"sale"|"trending" } : undefined }))
                      } className={`h-8 px-3 rounded-full text-xs font-semibold border transition ${active ? "bg-[#0f172a] text-white border-[#0f172a]" : "border-slate-200 text-slate-600 hover:border-slate-400"}`}>
                        {b.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 6: Sizes */}
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {SIZES_LIST.map((s) => (
                    <button key={s} type="button" onClick={() => toggleSize(s)}
                      className={`h-8 min-w-[2.5rem] px-3 rounded-xl text-xs font-semibold border-2 transition ${form.sizes.includes(s) ? "bg-[#0f172a] text-white border-[#0f172a]" : "border-slate-200 text-slate-600 hover:border-slate-400"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 7: Colors */}
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Colors</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {form.colors.map((c, i) => (
                    <div key={i} className="relative group">
                      <span className="size-7 rounded-full border border-slate-200 block shrink-0" style={{ background: c }} />
                      <button onClick={() => removeColor(c)}
                        className="absolute -top-1 -right-1 size-4 bg-red-500 text-white rounded-full hidden group-hover:flex items-center justify-center">
                        <X className="size-2.5" />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-1.5">
                    <input type="color" value={colorInput} onChange={(e) => setColorInput(e.target.value)}
                      className="size-7 rounded-full border border-slate-200 cursor-pointer p-0" />
                    <button onClick={addColor} type="button"
                      className="h-7 px-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-600 transition">
                      + Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 8: Material */}
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Material (optional)</label>
                <input value={form.material ?? ""} onChange={(e) => setForm((f) => ({ ...f, material: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition"
                  placeholder="e.g. Cotton, Polyester" />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-slate-200 shrink-0">
              <button onClick={closeModal} className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                Cancel
              </button>
              <button onClick={handleSave} className="flex-1 h-10 rounded-xl bg-[#ef4444] hover:bg-red-600 text-white text-sm font-semibold transition flex items-center justify-center gap-1.5">
                <Check className="size-4" /> {modal === "add" ? "Add Product" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {modal === "delete" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="size-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="size-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Delete Product?</h3>
            <p className="text-sm text-slate-400 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleDelete} className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
