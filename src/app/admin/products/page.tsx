"use client";

import { useState, useMemo } from "react";
import { useAdminStore } from "@/lib/admin-store";
import type { AdminProduct, ProductVariant } from "@/lib/admin-store";
import {
  Plus, Search, Pencil, Trash2, X, Check, AlertTriangle,
  ChevronLeft, ChevronRight, ImagePlus, Package, Layers,
} from "lucide-react";
import { toast } from "sonner";

const PAGE_SIZE = 10;

type ProductForm = Omit<AdminProduct, "id" | "liked">;

const emptyForm = (): ProductForm => ({
  name: "", category: "", brand: "", price: 0, oldPrice: undefined,
  image: "", images: [], colors: [], sizes: [], badge: undefined,
  material: "", description: "", variants: [], gallery: [], colorImages: [],
  subcategory: "", metaTitle: "", metaDescription: "", slug: "", stock: 0,
  status: "active", categoryId: "", brandId: "", tags: [],
});

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const emptyVariant = (): Omit<ProductVariant, "id"> => ({
  size: "", color: "", price: 0, stock: 0, sku: "",
});

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, categories, brands, sizes, colors, badges } = useAdminStore();

  const [search, setSearch]       = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [page, setPage]           = useState(1);
  const [modal, setModal]         = useState<"add" | "edit" | "delete" | null>(null);
  const [editing, setEditing]     = useState<AdminProduct | null>(null);
  const [form, setForm]           = useState<ProductForm>(emptyForm());
  const [deleteId, setDeleteId]   = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"basic" | "gallery" | "variants" | "seo">("basic");
  const [colorInput, setColorInput] = useState("#000000");
  const [newVariant, setNewVariant] = useState(emptyVariant());
  const [galleryInput, setGalleryInput] = useState("");

  const activeCategories = useMemo(() => categories.filter((c) => c.status === "active"), [categories]);
  const parentCategories = useMemo(() => activeCategories.filter((c) => !c.parentId), [activeCategories]);
  const subcategoriesForSelected = useMemo(() => {
    if (!form.categoryId) return [];
    return activeCategories.filter((c) => c.parentId === form.categoryId);
  }, [activeCategories, form.categoryId]);
  const activeBrands     = useMemo(() => brands.filter((b) => b.status === "active"), [brands]);
  const activeSizes      = useMemo(() => sizes.filter((s) => s.status === "active"), [sizes]);
  const activeColors     = useMemo(() => colors.filter((c) => c.status === "active"), [colors]);
  const activeBadges     = useMemo(() => badges.filter((b) => b.status === "active"), [badges]);

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

  const openAdd = () => {
    setForm(emptyForm());
    setEditing(null);
    setActiveTab("basic");
    setModal("add");
  };

  const openEdit = (p: AdminProduct) => {
    setEditing(p);
    setForm({
      name: p.name, category: p.category, brand: p.brand, price: p.price,
      oldPrice: p.oldPrice, image: p.image, images: p.images ?? [],
      colors: p.colors, sizes: p.sizes, badge: p.badge, material: p.material ?? "",
      description: (p as AdminProduct).description ?? "",
      variants: (p as AdminProduct).variants ?? [],
      gallery: (p as AdminProduct).gallery ?? [],
      colorImages: (p as AdminProduct).colorImages ?? [],
      subcategory: (p as AdminProduct).subcategory ?? "",
      metaTitle: (p as AdminProduct).metaTitle ?? "",
      metaDescription: (p as AdminProduct).metaDescription ?? "",
      slug: (p as AdminProduct).slug ?? slugify(p.name),
      stock: (p as AdminProduct).stock ?? 0,
      status: (p as AdminProduct).status ?? "active",
      categoryId: (p as AdminProduct).categoryId ?? "",
      brandId: (p as AdminProduct).brandId ?? "",
      tags: (p as AdminProduct).tags ?? [],
    });
    setActiveTab("basic");
    setModal("edit");
  };

  const openDelete = (id: string) => { setDeleteId(id); setModal("delete"); };
  const closeModal = () => { setModal(null); setEditing(null); setDeleteId(null); setNewVariant(emptyVariant()); };

  const handleSave = () => {
    if (!form.name.trim())  { toast.error("Product name is required"); return; }
    if (!form.image.trim()) { toast.error("Main image URL is required"); return; }
    if (form.price <= 0)    { toast.error("Price must be greater than 0"); return; }
    const data = { ...form, liked: false };
    if (modal === "add") {
      addProduct(data);
      toast.success("Product added successfully");
    } else if (modal === "edit" && editing) {
      updateProduct(editing.id, data);
      toast.success("Product updated");
    }
    closeModal();
  };

  const handleDelete = () => {
    if (deleteId) { deleteProduct(deleteId); toast.success("Product deleted"); closeModal(); }
  };

  const toggleSize = (s: string) =>
    setForm((f) => ({ ...f, sizes: f.sizes.includes(s) ? f.sizes.filter((x) => x !== s) : [...f.sizes, s] }));

  const toggleColor = (hex: string) =>
    setForm((f) => ({ ...f, colors: f.colors.includes(hex) ? f.colors.filter((x) => x !== hex) : [...f.colors, hex] }));

  const addCustomColor = () => {
    if (!form.colors.includes(colorInput)) setForm((f) => ({ ...f, colors: [...f.colors, colorInput] }));
  };

  const removeColor = (c: string) => setForm((f) => ({ ...f, colors: f.colors.filter((x) => x !== c) }));

  const addGalleryImage = () => {
    if (galleryInput.trim() && !form.gallery?.includes(galleryInput.trim())) {
      setForm((f) => ({ ...f, gallery: [...(f.gallery ?? []), galleryInput.trim()] }));
      setGalleryInput("");
    }
  };

  const removeGallery = (url: string) => setForm((f) => ({ ...f, gallery: (f.gallery ?? []).filter((x) => x !== url) }));

  const addVariant = () => {
    if (!newVariant.size && !newVariant.color) { toast.error("At least size or color is required for variant"); return; }
    if (newVariant.price <= 0) { toast.error("Variant price required"); return; }
    const variant: ProductVariant = { ...newVariant, id: `var-${Date.now()}` };
    setForm((f) => ({ ...f, variants: [...(f.variants ?? []), variant] }));
    setNewVariant(emptyVariant());
    toast.success("Variant added");
  };

  const removeVariant = (id: string) => setForm((f) => ({ ...f, variants: (f.variants ?? []).filter((v) => v.id !== id) }));

  const discount = form.oldPrice && form.oldPrice > form.price
    ? Math.round((1 - form.price / form.oldPrice) * 100) : 0;

  const TABS = [
    { id: "basic",    label: "Basic Info" },
    { id: "gallery",  label: `Gallery (${form.gallery?.length ?? 0})` },
    { id: "variants", label: `Variants (${form.variants?.length ?? 0})` },
    { id: "seo",      label: "SEO" },
  ] as const;

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
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition" />
        </div>
        <select value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setPage(1); }}
          className="h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 bg-white">
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Colors</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Status</th>
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
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="size-10 rounded-lg object-cover shrink-0 bg-slate-100" />
                      ) : (
                        <div className="size-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <Package className="size-5 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-800 line-clamp-1 max-w-[180px]">{p.name}</p>
                        {(p as AdminProduct).variants?.length ? (
                          <p className="text-xs text-slate-400">{(p as AdminProduct).variants!.length} variants</p>
                        ) : null}
                      </div>
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
                      {p.colors.slice(0, 5).map((c, i) => (
                        <span key={i} className="size-4 rounded-full border border-slate-200 shrink-0" style={{ background: c }} />
                      ))}
                      {p.colors.length > 5 && <span className="text-xs text-slate-400">+{p.colors.length - 5}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      (p as AdminProduct).status === "draft" ? "bg-slate-100 text-slate-500" : "bg-green-100 text-green-700"
                    }`}>
                      {(p as AdminProduct).status ?? "active"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(p as AdminProduct)} className="size-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500 transition">
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-400">Showing {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE,filtered.length)} of {filtered.length}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p-1))} disabled={page===1}
                className="size-8 rounded-lg border flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition"><ChevronLeft className="size-4" /></button>
              {Array.from({length:totalPages},(_,i)=>i+1).filter((n)=>Math.abs(n-page)<=2).map((n)=>(
                <button key={n} onClick={()=>setPage(n)}
                  className={`size-8 rounded-lg border text-sm font-medium transition ${n===page?"bg-[#0f172a] text-white border-[#0f172a]":"hover:bg-slate-50"}`}>{n}</button>
              ))}
              <button onClick={()=>setPage((p)=>Math.min(totalPages,p+1))} disabled={page===totalPages}
                className="size-8 rounded-lg border flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition"><ChevronRight className="size-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(modal === "add" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
              <h3 className="text-lg font-bold text-slate-800">{modal === "add" ? "Add New Product" : "Edit Product"}</h3>
              <button onClick={closeModal} className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition">
                <X className="size-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 shrink-0 px-6 overflow-x-auto">
              {TABS.map((t) => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`h-11 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
                    activeTab === t.id ? "border-[#ef4444] text-[#ef4444]" : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5">

              {/* ── BASIC INFO TAB ─────────────────────────────────────── */}
              {activeTab === "basic" && (
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="field-label">Product Name *</label>
                    <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
                      className="field-input" placeholder="e.g. Floral Summer Top" />
                  </div>

                  {/* Category + Brand */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="field-label">Category *</label>
                      <select value={form.categoryId || form.category}
                        onChange={(e) => {
                          const cat = activeCategories.find((c) => c.id === e.target.value || c.name === e.target.value);
                          setForm((f) => ({ ...f, category: cat?.name ?? e.target.value, categoryId: cat?.id ?? "" }));
                        }}
                        className="field-select">
                        <option value="">Select category</option>
                        {activeCategories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.parentId ? `  ↳ ${c.name}` : c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="field-label">Brand</label>
                      <select value={form.brandId || form.brand}
                        onChange={(e) => {
                          const brand = activeBrands.find((b) => b.id === e.target.value || b.name === e.target.value);
                          setForm((f) => ({ ...f, brand: brand?.name ?? e.target.value, brandId: brand?.id ?? "" }));
                        }}
                        className="field-select">
                        <option value="">Select brand</option>
                        {activeBrands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                        <option value="__custom__">Other (type below)</option>
                      </select>
                      {(!activeBrands.find((b) => b.id === form.brandId) && form.brand) && (
                        <input value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                          className="field-input mt-2" placeholder="Brand name" />
                      )}
                    </div>
                  </div>

                  {/* Subcategory */}
                  {subcategoriesForSelected.length > 0 && (
                    <div>
                      <label className="field-label">Subcategory</label>
                      <select value={form.subcategory ?? ""}
                        onChange={(e) => setForm((f) => ({ ...f, subcategory: e.target.value }))}
                        className="field-select">
                        <option value="">None (parent category only)</option>
                        {subcategoriesForSelected.map((c) => (
                          <option key={c.id} value={c.slug}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Price + Old Price */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="field-label">Price (৳) *</label>
                      <input type="number" min="0" value={form.price || ""}
                        onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                        className="field-input" placeholder="1200" />
                    </div>
                    <div>
                      <label className="field-label">
                        Old Price (৳) {discount > 0 && <span className="text-green-600 font-bold ml-1 normal-case">−{discount}% off</span>}
                      </label>
                      <input type="number" min="0" value={form.oldPrice || ""}
                        onChange={(e) => setForm((f) => ({ ...f, oldPrice: e.target.value ? Number(e.target.value) : undefined }))}
                        className="field-input" placeholder="Optional" />
                    </div>
                  </div>

                  {/* Stock + Status */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="field-label">Stock Quantity</label>
                      <input type="number" min="0" value={form.stock || ""}
                        onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
                        className="field-input" placeholder="100" />
                    </div>
                    <div>
                      <label className="field-label">Status</label>
                      <div className="flex gap-2 mt-1">
                        {(["active", "draft"] as const).map((s) => (
                          <button key={s} type="button" onClick={() => setForm((f) => ({ ...f, status: s }))}
                            className={`flex-1 h-10 rounded-xl text-sm font-semibold border transition capitalize ${form.status === s ? "bg-[#0f172a] text-white border-[#0f172a]" : "border-slate-200 text-slate-600 hover:border-slate-400"}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Main Image */}
                  <div>
                    <label className="field-label">Main Image URL *</label>
                    <div className="flex gap-2">
                      <input value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                        className="flex-1 field-input" placeholder="https://..." />
                      {form.image && <img src={form.image} alt="" className="size-10 rounded-xl object-cover border border-slate-200 shrink-0" />}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="field-label">Product Description</label>
                    <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      rows={5} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition resize-none"
                      placeholder="Describe the product in detail — material, features, use cases, care instructions..." />
                  </div>

                  {/* Badge */}
                  <div>
                    <label className="field-label">Badge</label>
                    <div className="flex gap-2 flex-wrap">
                      <button type="button" onClick={() => setForm((f) => ({ ...f, badge: undefined }))}
                        className={`h-8 px-3 rounded-full text-xs font-semibold border transition ${!form.badge ? "bg-[#0f172a] text-white border-[#0f172a]" : "border-slate-200 text-slate-600 hover:border-slate-400"}`}>
                        None
                      </button>
                      {activeBadges.map((b) => (
                        <button key={b.id} type="button"
                          onClick={() => setForm((f) => ({ ...f, badge: { label: b.label, tone: b.tone } }))}
                          className={`h-8 px-3 rounded-full text-xs font-semibold border transition ${form.badge?.label === b.label ? "bg-[#0f172a] text-white border-[#0f172a]" : "border-slate-200 text-slate-600 hover:border-slate-400"}`}>
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sizes */}
                  <div>
                    <label className="field-label">Sizes</label>
                    <div className="flex flex-wrap gap-2">
                      {activeSizes.map((s) => (
                        <button key={s.id} type="button" onClick={() => toggleSize(s.name)}
                          className={`h-9 min-w-[2.5rem] px-3 rounded-xl text-xs font-semibold border-2 transition ${form.sizes.includes(s.name) ? "bg-[#0f172a] text-white border-[#0f172a]" : "border-slate-200 text-slate-600 hover:border-slate-400"}`}>
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <label className="field-label">Colors</label>
                    <div className="space-y-2">
                      {/* Predefined colors from catalog */}
                      <div className="flex flex-wrap gap-2">
                        {activeColors.map((c) => (
                          <button key={c.id} type="button" onClick={() => toggleColor(c.hex)}
                            title={c.name}
                            className={`size-8 rounded-full border-4 transition ${form.colors.includes(c.hex) ? "border-[#ef4444] scale-110" : "border-white shadow-md hover:scale-105"}`}
                            style={{ background: c.hex }} />
                        ))}
                      </div>
                      {/* Custom color picker */}
                      <div className="flex items-center gap-2">
                        <input type="color" value={colorInput} onChange={(e) => setColorInput(e.target.value)}
                          className="size-8 rounded-lg border border-slate-200 cursor-pointer p-0.5 shrink-0" />
                        <span className="text-xs text-slate-500 font-mono">{colorInput}</span>
                        <button onClick={addCustomColor} type="button"
                          className="h-7 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-600 transition">
                          + Add Custom
                        </button>
                      </div>
                      {/* Selected colors + per-color image */}
                      {form.colors.length > 0 && (
                        <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                          <span className="text-xs text-slate-500 block mb-1">Selected: {form.colors.length} color(s)</span>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {form.colors.map((c, i) => (
                              <div key={i} className="relative group">
                                <span className="size-7 rounded-full border-2 border-white shadow block" style={{ background: c }} />
                                <button onClick={() => removeColor(c)}
                                  className="absolute -top-1 -right-1 size-4 bg-red-500 text-white rounded-full hidden group-hover:flex items-center justify-center">
                                  <X className="size-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="border-t border-slate-200 pt-2 space-y-2">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Per-Color Images (optional)</p>
                            {form.colors.map((c, i) => {
                              const colorName = activeColors.find((ac) => ac.hex === c)?.name ?? c;
                              const colorImgs = (form.colorImages ?? []);
                              return (
                                <div key={i} className="flex items-center gap-2">
                                  <span className="size-5 rounded-full shrink-0 border border-white shadow" style={{ background: c }} />
                                  <span className="text-xs text-slate-600 w-16 truncate shrink-0">{colorName}</span>
                                  <input
                                    value={colorImgs[i] ?? ""}
                                    onChange={(e) => {
                                      const updated = [...(form.colorImages ?? [])];
                                      while (updated.length <= i) updated.push("");
                                      updated[i] = e.target.value;
                                      setForm((f) => ({ ...f, colorImages: updated }));
                                    }}
                                    className="flex-1 h-8 px-2.5 rounded-lg border border-slate-200 text-xs outline-none focus:border-red-400 transition"
                                    placeholder="Image URL for this color"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Material */}
                  <div>
                    <label className="field-label">Material</label>
                    <input value={form.material ?? ""} onChange={(e) => setForm((f) => ({ ...f, material: e.target.value }))}
                      className="field-input" placeholder="e.g. 100% Cotton, Polyester blend" />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="field-label">Tags (comma-separated)</label>
                    <input
                      value={(form.tags ?? []).join(", ")}
                      onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) }))}
                      className="field-input" placeholder="summer, casual, trending" />
                  </div>
                </div>
              )}

              {/* ── GALLERY TAB ────────────────────────────────────────── */}
              {activeTab === "gallery" && (
                <div className="space-y-4">
                  <div>
                    <label className="field-label">Add Gallery Images</label>
                    <div className="flex gap-2">
                      <input value={galleryInput} onChange={(e) => setGalleryInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addGalleryImage()}
                        className="flex-1 field-input" placeholder="Paste image URL and press Enter or click Add" />
                      <button onClick={addGalleryImage} type="button"
                        className="h-10 px-4 rounded-xl bg-[#ef4444] hover:bg-red-600 text-white text-sm font-semibold transition flex items-center gap-1.5">
                        <ImagePlus className="size-4" /> Add
                      </button>
                    </div>
                  </div>

                  {(form.gallery ?? []).length === 0 ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center">
                      <ImagePlus className="size-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-400">No gallery images yet. Paste URLs above to add.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {(form.gallery ?? []).map((url, i) => (
                        <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => removeGallery(url)}
                            className="absolute top-2 right-2 size-7 bg-red-500 text-white rounded-lg hidden group-hover:flex items-center justify-center shadow-lg">
                            <Trash2 className="size-3.5" />
                          </button>
                          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
                            Image {i + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {form.image && (
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-xs font-semibold text-slate-500 mb-2">Main Product Image (from Basic Info)</p>
                      <div className="size-24 rounded-xl overflow-hidden border border-slate-200">
                        <img src={form.image} alt="" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── VARIANTS TAB ───────────────────────────────────────── */}
              {activeTab === "variants" && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">Add Variant</p>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-xs text-slate-500 block mb-1">Size</label>
                        <select value={newVariant.size} onChange={(e) => setNewVariant((v) => ({ ...v, size: e.target.value }))}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 bg-white">
                          <option value="">Select size</option>
                          {activeSizes.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 block mb-1">Color</label>
                        <select value={newVariant.color} onChange={(e) => setNewVariant((v) => ({ ...v, color: e.target.value }))}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 bg-white">
                          <option value="">Select color</option>
                          {activeColors.map((c) => <option key={c.id} value={c.hex}>{c.name} ({c.hex})</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 block mb-1">Price (৳) *</label>
                        <input type="number" min="0" value={newVariant.price || ""}
                          onChange={(e) => setNewVariant((v) => ({ ...v, price: Number(e.target.value) }))}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400"
                          placeholder={String(form.price || 0)} />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 block mb-1">Stock</label>
                        <input type="number" min="0" value={newVariant.stock || ""}
                          onChange={(e) => setNewVariant((v) => ({ ...v, stock: Number(e.target.value) }))}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400"
                          placeholder="0" />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="text-xs text-slate-500 block mb-1">SKU (optional)</label>
                      <input value={newVariant.sku} onChange={(e) => setNewVariant((v) => ({ ...v, sku: e.target.value }))}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400"
                        placeholder="e.g. PROD-RED-XL" />
                    </div>
                    <button onClick={addVariant} type="button"
                      className="w-full h-10 bg-[#ef4444] hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2">
                      <Plus className="size-4" /> Add Variant
                    </button>
                  </div>

                  {/* Variants list */}
                  {(form.variants ?? []).length === 0 ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
                      <Layers className="size-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">No variants yet. Add size/color/price combinations above.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(form.variants ?? []).map((v) => (
                        <div key={v.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                          {v.color && <span className="size-6 rounded-full border-2 border-white shadow shrink-0" style={{ background: v.color }} />}
                          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                            {v.size && <span className="font-semibold text-slate-700">Size: {v.size}</span>}
                            <span className="font-bold text-slate-800">৳{v.price.toLocaleString()}</span>
                            <span className="text-slate-500">Stock: {v.stock}</span>
                            {v.sku && <span className="text-xs font-mono text-slate-400">{v.sku}</span>}
                          </div>
                          <button onClick={() => removeVariant(v.id)} className="size-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500 transition shrink-0">
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── SEO TAB ────────────────────────────────────────────── */}
              {activeTab === "seo" && (
                <div className="space-y-4">
                  <div>
                    <label className="field-label">URL Slug</label>
                    <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                      className="field-input font-mono" placeholder="my-product-name" />
                    <p className="text-xs text-slate-400 mt-1">URL-friendly version of the product name</p>
                  </div>
                  <div>
                    <label className="field-label">Meta Title</label>
                    <input value={form.metaTitle} onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))}
                      className="field-input" placeholder="SEO title (leave blank to use product name)" />
                    <p className="text-xs text-slate-400 mt-1">{(form.metaTitle ?? "").length}/60 characters</p>
                  </div>
                  <div>
                    <label className="field-label">Meta Description</label>
                    <textarea value={form.metaDescription} onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
                      rows={4} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition resize-none"
                      placeholder="Brief description for search engines (150-160 characters recommended)" />
                    <p className="text-xs text-slate-400 mt-1">{(form.metaDescription ?? "").length}/160 characters</p>
                  </div>
                </div>
              )}
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

      <style jsx>{`
        .field-label {
          display: block;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #475569;
          margin-bottom: 0.375rem;
        }
        .field-input {
          width: 100%;
          height: 2.5rem;
          padding: 0 0.75rem;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s;
        }
        .field-input:focus { border-color: #ef4444; }
        .field-select {
          width: 100%;
          height: 2.5rem;
          padding: 0 0.75rem;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          font-size: 0.875rem;
          outline: none;
          background-color: white;
          transition: border-color 0.15s;
        }
        .field-select:focus { border-color: #ef4444; }
      `}</style>
    </div>
  );
}
