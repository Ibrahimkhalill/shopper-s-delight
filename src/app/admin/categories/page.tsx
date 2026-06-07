"use client";

import { useState, useMemo } from "react";
import { useAdminStore } from "@/lib/admin-store";
import { Plus, Pencil, Trash2, X, Check, Tag } from "lucide-react";
import { toast } from "sonner";

type Tab = "categories" | "brands" | "colors" | "sizes" | "badges";

const TABS: { id: Tab; label: string }[] = [
  { id: "categories", label: "Categories" },
  { id: "brands",     label: "Brands" },
  { id: "colors",     label: "Colors" },
  { id: "sizes",      label: "Sizes" },
  { id: "badges",     label: "Badges" },
];

export default function CategoriesPage() {
  const { products } = useAdminStore();
  const [tab, setTab] = useState<Tab>("categories");

  // Derive all data from products
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => map.set(p.category, (map.get(p.category) ?? 0) + 1));
    return Array.from(map.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [products]);

  const brands = useMemo(() => {
    const map = new Map<string, { count: number; category: string }>();
    products.forEach((p) => {
      const ex = map.get(p.brand);
      if (ex) ex.count++;
      else map.set(p.brand, { count: 1, category: p.category });
    });
    return Array.from(map.entries()).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.count - a.count);
  }, [products]);

  const colors = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => p.colors.forEach((c) => map.set(c, (map.get(c) ?? 0) + 1)));
    return Array.from(map.entries()).map(([hex, count]) => ({ hex, count })).sort((a, b) => b.count - a.count);
  }, [products]);

  const sizes = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => p.sizes.forEach((s) => map.set(s, (map.get(s) ?? 0) + 1)));
    return Array.from(map.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [products]);

  const badges = useMemo(() => {
    const map = new Map<string, { tone: string; count: number }>();
    products.forEach((p) => {
      if (p.badge) {
        const ex = map.get(p.badge.label);
        if (ex) ex.count++;
        else map.set(p.badge.label, { tone: p.badge.tone, count: 1 });
      }
    });
    return Array.from(map.entries()).map(([label, v]) => ({ label, ...v }));
  }, [products]);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Catalog Management</h2>
        <p className="text-sm text-slate-400">Browse categories, brands, colors, sizes and badges used across your products</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`h-9 px-4 rounded-full text-sm font-semibold border transition ${
              tab === t.id ? "bg-[#0f172a] text-white border-[#0f172a]" : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Categories */}
      {tab === "categories" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">All Categories <span className="text-slate-400 font-normal text-sm ml-1">({categories.length})</span></h3>
          </div>
          <div className="divide-y divide-slate-100">
            {categories.map((c) => (
              <div key={c.name} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-red-50 flex items-center justify-center">
                    <Tag className="size-4 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.count} products</p>
                  </div>
                </div>
                <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-semibold">{c.count}</span>
              </div>
            ))}
            {categories.length === 0 && <div className="py-12 text-center text-slate-400 text-sm">No categories found</div>}
          </div>
        </div>
      )}

      {/* Brands */}
      {tab === "brands" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">All Brands <span className="text-slate-400 font-normal text-sm ml-1">({brands.length})</span></h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Brand Name</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Category</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Products</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {brands.map((b) => (
                  <tr key={b.name} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {b.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-800">{b.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{b.category}</span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-700">{b.count}</td>
                  </tr>
                ))}
                {brands.length === 0 && <tr><td colSpan={3} className="text-center py-12 text-slate-400">No brands found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Colors */}
      {tab === "colors" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">All Colors <span className="text-slate-400 font-normal text-sm ml-1">({colors.length})</span></h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {colors.map((c) => (
              <div key={c.hex} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-slate-300 transition">
                <div className="size-10 rounded-full border-2 border-white shadow-md" style={{ background: c.hex }} />
                <p className="text-xs font-mono text-slate-500 truncate w-full text-center">{c.hex}</p>
                <span className="text-[10px] text-slate-400">{c.count} products</span>
              </div>
            ))}
            {colors.length === 0 && <div className="col-span-6 text-center py-12 text-slate-400 text-sm">No colors found</div>}
          </div>
        </div>
      )}

      {/* Sizes */}
      {tab === "sizes" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">All Sizes <span className="text-slate-400 font-normal text-sm ml-1">({sizes.length})</span></h3>
          <div className="flex flex-wrap gap-3">
            {sizes.map((s) => (
              <div key={s.name} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-200 hover:border-slate-400 transition min-w-[70px]">
                <span className="text-base font-bold text-slate-800">{s.name}</span>
                <span className="text-xs text-slate-400">{s.count} products</span>
              </div>
            ))}
            {sizes.length === 0 && <div className="text-center py-12 text-slate-400 text-sm w-full">No sizes found</div>}
          </div>
        </div>
      )}

      {/* Badges */}
      {tab === "badges" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">All Badges <span className="text-slate-400 font-normal text-sm ml-1">({badges.length})</span></h3>
          <div className="flex flex-wrap gap-4">
            {badges.map((b) => (
              <div key={b.label} className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-200 hover:border-slate-400 transition min-w-[120px]">
                <span className={`text-sm font-bold px-4 py-1.5 rounded-full uppercase ${
                  b.tone === "new"      ? "bg-slate-800 text-white" :
                  b.tone === "sale"     ? "bg-red-100 text-red-600" :
                  "bg-amber-100 text-amber-600"
                }`}>{b.label}</span>
                <span className="text-xs text-slate-400 capitalize">{b.tone} tone</span>
                <span className="text-xs font-semibold text-slate-700">{b.count} products</span>
              </div>
            ))}
            {badges.length === 0 && <div className="text-center py-12 text-slate-400 text-sm w-full">No badges assigned yet</div>}
          </div>
        </div>
      )}
    </div>
  );
}
