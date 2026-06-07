"use client";

import { useState, useMemo } from "react";
import { useAdminStore } from "@/lib/admin-store";
import type { AdminBrand } from "@/lib/admin-store";
import { Plus, Pencil, Trash2, X, Check, AlertTriangle, Search, Store } from "lucide-react";
import { toast } from "sonner";

const emptyForm = (): Omit<AdminBrand, "id" | "createdAt"> => ({
  name: "", slug: "", image: "", description: "", status: "active",
});

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function BrandsPage() {
  const { brands, addBrand, updateBrand, deleteBrand } = useAdminStore();

  const [search, setSearch]     = useState("");
  const [modal, setModal]       = useState<"add" | "edit" | "delete" | null>(null);
  const [editing, setEditing]   = useState<AdminBrand | null>(null);
  const [form, setForm]         = useState(emptyForm());
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() =>
    !search ? brands : brands.filter((b) => b.name.toLowerCase().includes(search.toLowerCase())),
    [brands, search]
  );

  const openAdd = () => { setForm(emptyForm()); setEditing(null); setModal("add"); };
  const openEdit = (b: AdminBrand) => {
    setEditing(b);
    setForm({ name: b.name, slug: b.slug, image: b.image, description: b.description, status: b.status });
    setModal("edit");
  };
  const openDelete = (id: string) => { setDeleteId(id); setModal("delete"); };
  const closeModal = () => { setModal(null); setEditing(null); setDeleteId(null); };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error("Brand name is required"); return; }
    const slug = form.slug.trim() || slugify(form.name);
    if (modal === "add") {
      addBrand({ ...form, slug });
      toast.success("Brand added successfully");
    } else if (modal === "edit" && editing) {
      updateBrand(editing.id, { ...form, slug });
      toast.success("Brand updated");
    }
    closeModal();
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteBrand(deleteId);
    toast.success("Brand deleted");
    closeModal();
  };

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, slug: slugify(name) }));
  };

  const toggleStatus = (b: AdminBrand) => {
    updateBrand(b.id, { status: b.status === "active" ? "inactive" : "active" });
    toast.success(`Brand ${b.status === "active" ? "deactivated" : "activated"}`);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Brands</h2>
          <p className="text-sm text-slate-400">Showing {brands.length} of {brands.length} brands</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 h-10 px-4 bg-[#ef4444] hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition shrink-0">
          <Plus className="size-4" /> Add Brand
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brands..."
            className="w-full h-9 pl-9 pr-4 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Image</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Created</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-16 text-slate-400">No brands found</td></tr>
              )}
              {filtered.map((b, i) => (
                <tr key={b.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3.5 text-slate-400 text-xs">{i + 1}</td>
                  <td className="px-4 py-3.5">
                    {b.image ? (
                      <img src={b.image} alt={b.name} className="size-10 rounded-xl object-cover bg-slate-100 border border-slate-200" />
                    ) : (
                      <div className="size-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {b.name.charAt(0)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-800">{b.name}</td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{b.slug}</span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 text-xs hidden md:table-cell max-w-[200px] truncate">{b.description || "—"}</td>
                  <td className="px-4 py-3.5">
                    <button onClick={() => toggleStatus(b)}
                      className={`text-xs px-3 py-1 rounded-full font-semibold transition ${b.status === "active" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                      {b.status}
                    </button>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-400 hidden lg:table-cell">
                    {new Date(b.createdAt).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => openEdit(b)} className="size-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500 transition">
                        <Pencil className="size-3.5" />
                      </button>
                      <button onClick={() => openDelete(b.id)} className="size-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500 transition">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(modal === "add" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">{modal === "add" ? "Add Brand" : "Edit Brand"}</h3>
              <button onClick={closeModal} className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition">
                <X className="size-4" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Brand Name *</label>
                <input value={form.name} onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition"
                  placeholder="e.g. UrbanFit" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Slug</label>
                <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition font-mono"
                  placeholder="urbanfit" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Logo/Image URL</label>
                <div className="flex gap-2">
                  <input value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                    className="flex-1 h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition"
                    placeholder="https://..." />
                  {form.image ? (
                    <img src={form.image} alt="" className="size-10 rounded-xl object-cover border border-slate-200 shrink-0" />
                  ) : (
                    <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      <Store className="size-4 text-slate-400" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition resize-none"
                  placeholder="Brief description of the brand..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Status</label>
                <div className="flex gap-2">
                  {(["active", "inactive"] as const).map((s) => (
                    <button key={s} type="button" onClick={() => setForm((f) => ({ ...f, status: s }))}
                      className={`h-9 px-4 rounded-xl text-sm font-semibold border transition capitalize ${form.status === s ? "bg-[#0f172a] text-white border-[#0f172a]" : "border-slate-200 text-slate-600 hover:border-slate-400"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-slate-200">
              <button onClick={closeModal} className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleSave} className="flex-1 h-10 rounded-xl bg-[#ef4444] hover:bg-red-600 text-white text-sm font-semibold transition flex items-center justify-center gap-1.5">
                <Check className="size-4" /> {modal === "add" ? "Add Brand" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === "delete" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="size-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="size-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Delete Brand?</h3>
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
