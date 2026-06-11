"use client";

import { useState } from "react";
import { useAdminStore } from "@/lib/admin-store";
import type { Offer } from "@/lib/admin-store";
import { Plus, Pencil, Trash2, X, Check, AlertTriangle, Percent, Tag, Copy } from "lucide-react";
import { toast } from "sonner";
import { useEscapeClose } from "@/hooks/use-escape-close";

const emptyForm = (): Omit<Offer, "id" | "usedCount" | "createdAt"> => ({
  code: "", type: "percent", value: 10, minOrder: 0, maxUses: 100,
  expiryDate: "", status: "active",
});

function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function OffersPage() {
  const { offers, addOffer, updateOffer, deleteOffer } = useAdminStore();

  const [modal, setModal]       = useState<"add" | "edit" | "delete" | null>(null);
  const [editing, setEditing]   = useState<Offer | null>(null);
  const [form, setForm]         = useState(emptyForm());
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const activeOffers   = offers.filter((o) => o.status === "active");
  const inactiveOffers = offers.filter((o) => o.status === "inactive");

  const openAdd = () => { setForm({ ...emptyForm(), code: generateCode() }); setEditing(null); setModal("add"); };
  const openEdit = (o: Offer) => {
    setEditing(o);
    setForm({ code: o.code, type: o.type, value: o.value, minOrder: o.minOrder, maxUses: o.maxUses, expiryDate: o.expiryDate, status: o.status });
    setModal("edit");
  };
  const openDelete = (id: string) => { setDeleteId(id); setModal("delete"); };
  const closeModal = () => { setModal(null); setEditing(null); setDeleteId(null); };
  useEscapeClose(modal !== null, closeModal);

  const handleSave = () => {
    if (!form.code.trim()) { toast.error("Coupon code is required"); return; }
    if (form.value <= 0)   { toast.error("Discount value must be greater than 0"); return; }
    if (form.type === "percent" && form.value > 100) { toast.error("Percentage cannot exceed 100"); return; }
    if (modal === "add") {
      if (offers.some((o) => o.code === form.code)) { toast.error("Coupon code already exists"); return; }
      addOffer(form);
      toast.success("Coupon created successfully");
    } else if (modal === "edit" && editing) {
      updateOffer(editing.id, form);
      toast.success("Coupon updated");
    }
    closeModal();
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteOffer(deleteId);
    toast.success("Coupon deleted");
    closeModal();
  };

  const toggleStatus = (o: Offer) => {
    updateOffer(o.id, { status: o.status === "active" ? "inactive" : "active" });
    toast.success(`Coupon ${o.status === "active" ? "deactivated" : "activated"}`);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  const isExpired = (expiryDate: string) => expiryDate && new Date(expiryDate) < new Date();

  const OfferTable = ({ items, title }: { items: Offer[]; title: string }) => (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">{title} <span className="text-slate-400 font-normal text-sm ml-1">({items.length})</span></h3>
      </div>
      {items.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">No coupons yet</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Discount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Min Order</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Usage</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Expiry</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <Tag className="size-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono font-bold text-slate-800 tracking-wider">{o.code}</span>
                      <button onClick={() => copyCode(o.code)} className="size-6 flex items-center justify-center rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
                        <Copy className="size-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 text-sm font-bold ${o.type === "percent" ? "text-green-600" : "text-blue-600"}`}>
                      {o.type === "percent" ? <Percent className="size-3.5" /> : <span className="text-xs">৳</span>}
                      {o.value}{o.type === "percent" ? "%" : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 hidden sm:table-cell">
                    {o.minOrder > 0 ? `৳${o.minOrder.toLocaleString()}` : <span className="text-slate-300">None</span>}
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 w-16">
                        <div className="bg-[#ef4444] h-1.5 rounded-full" style={{ width: `${Math.min(100, (o.usedCount / o.maxUses) * 100)}%` }} />
                      </div>
                      <span className="text-xs text-slate-500">{o.usedCount}/{o.maxUses}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    {o.expiryDate ? (
                      <span className={`text-xs ${isExpired(o.expiryDate) ? "text-red-500 font-semibold" : "text-slate-500"}`}>
                        {isExpired(o.expiryDate) ? "Expired " : ""}
                        {new Date(o.expiryDate).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    ) : <span className="text-slate-300 text-xs">No expiry</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <button onClick={() => toggleStatus(o)}
                      className={`text-xs px-3 py-1 rounded-full font-semibold transition ${o.status === "active" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                      {o.status}
                    </button>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => openEdit(o)} className="size-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500 transition">
                        <Pencil className="size-3.5" />
                      </button>
                      <button onClick={() => openDelete(o.id)} className="size-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500 transition">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Offers & Coupons</h2>
          <p className="text-sm text-slate-400">{activeOffers.length} active, {inactiveOffers.length} inactive</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 h-10 px-4 bg-[#ef4444] hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition shrink-0">
          <Plus className="size-4" /> Create Coupon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500 mb-1">Total Coupons</p>
          <p className="text-3xl font-bold text-slate-800">{offers.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500 mb-1">Active Coupons</p>
          <p className="text-3xl font-bold text-green-600">{activeOffers.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500 mb-1">Total Uses</p>
          <p className="text-3xl font-bold text-slate-800">{offers.reduce((s, o) => s + o.usedCount, 0)}</p>
        </div>
      </div>

      <OfferTable items={activeOffers} title="Active Coupons" />
      {inactiveOffers.length > 0 && <OfferTable items={inactiveOffers} title="Inactive Coupons" />}

      {offers.length === 0 && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center">
          <div className="size-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Percent className="size-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-1">No coupons yet</h3>
          <p className="text-sm text-slate-400 mb-5">Create your first coupon to offer discounts to customers</p>
          <button onClick={openAdd} className="inline-flex items-center gap-2 h-10 px-5 bg-[#ef4444] hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition">
            <Plus className="size-4" /> Create First Coupon
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(modal === "add" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={closeModal}>
          <div onClick={(e) => e.stopPropagation()} className="animate-scale-in bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
              <h3 className="text-lg font-bold text-slate-800">{modal === "add" ? "Create Coupon" : "Edit Coupon"}</h3>
              <button onClick={closeModal} className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition">
                <X className="size-4" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
              {/* Code preview */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-4 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-xs text-white/60 mb-1">Coupon Code</p>
                  <p className="text-2xl font-bold font-mono tracking-widest text-white">{form.code || "———"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/60 mb-1">Discount</p>
                  <p className="text-2xl font-bold text-[#ef4444]">
                    {form.type === "percent" ? `${form.value}%` : `৳${form.value}`}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Coupon Code *</label>
                <div className="flex gap-2">
                  <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                    className="flex-1 h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition font-mono font-bold tracking-wider"
                    placeholder="SAVE20" />
                  <button type="button" onClick={() => setForm((f) => ({ ...f, code: generateCode() }))}
                    className="h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition whitespace-nowrap">
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-2">Discount Type *</label>
                <div className="flex gap-2">
                  {(["percent", "fixed"] as const).map((t) => (
                    <button key={t} type="button" onClick={() => setForm((f) => ({ ...f, type: t }))}
                      className={`flex-1 h-10 rounded-xl text-sm font-semibold border transition ${form.type === t ? "bg-[#0f172a] text-white border-[#0f172a]" : "border-slate-200 text-slate-600 hover:border-slate-400"}`}>
                      {t === "percent" ? "% Percentage" : "৳ Fixed Amount"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">
                    {form.type === "percent" ? "Discount %" : "Discount (৳)"} *
                  </label>
                  <input type="number" min="1" max={form.type === "percent" ? "100" : undefined}
                    value={form.value || ""}
                    onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition"
                    placeholder={form.type === "percent" ? "10" : "100"} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Min Order (৳)</label>
                  <input type="number" min="0"
                    value={form.minOrder || ""}
                    onChange={(e) => setForm((f) => ({ ...f, minOrder: Number(e.target.value) }))}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition"
                    placeholder="0 (no minimum)" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Max Uses</label>
                  <input type="number" min="1"
                    value={form.maxUses || ""}
                    onChange={(e) => setForm((f) => ({ ...f, maxUses: Number(e.target.value) }))}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition"
                    placeholder="100" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Expiry Date</label>
                  <input type="date"
                    value={form.expiryDate}
                    onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition"
                    min={new Date().toISOString().split("T")[0]} />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-2">Status</label>
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
            <div className="flex gap-3 px-6 py-4 border-t border-slate-200 shrink-0">
              <button onClick={closeModal} className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleSave} className="flex-1 h-10 rounded-xl bg-[#ef4444] hover:bg-red-600 text-white text-sm font-semibold transition flex items-center justify-center gap-1.5">
                <Check className="size-4" /> {modal === "add" ? "Create Coupon" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === "delete" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={closeModal}>
          <div onClick={(e) => e.stopPropagation()} className="animate-scale-in bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="size-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="size-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Delete Coupon?</h3>
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
