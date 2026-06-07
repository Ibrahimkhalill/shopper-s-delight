"use client";

import { useState, useMemo } from "react";
import { useAdminStore } from "@/lib/admin-store";
import { Search, X, Pin, TrendingUp, Star, Check, RotateCcw } from "lucide-react";
import { toast } from "sonner";

type Tab = "featured" | "trending";

export default function HomepagePage() {
  const { products, featuredIds, setFeaturedIds, trendingIds, setTrendingIds } = useAdminStore();
  const [tab, setTab]     = useState<Tab>("featured");
  const [search, setSearch] = useState("");

  const activeIds   = tab === "featured" ? featuredIds : trendingIds;
  const setActiveIds = tab === "featured" ? setFeaturedIds : setTrendingIds;
  const MAX = tab === "featured" ? 8 : 5;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      String(p.id).toLowerCase().includes(q)
    );
  }, [products, search]);

  const toggle = (id: string) => {
    if (activeIds.includes(id)) {
      setActiveIds(activeIds.filter((x) => x !== id));
    } else {
      if (activeIds.length >= MAX) {
        toast.error(`Max ${MAX} products for ${tab}`);
        return;
      }
      setActiveIds([...activeIds, id]);
    }
  };

  const moveUp = (id: string) => {
    const idx = activeIds.indexOf(id);
    if (idx <= 0) return;
    const next = [...activeIds];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setActiveIds(next);
  };

  const moveDown = (id: string) => {
    const idx = activeIds.indexOf(id);
    if (idx < 0 || idx >= activeIds.length - 1) return;
    const next = [...activeIds];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setActiveIds(next);
  };

  const reset = () => {
    setActiveIds([]);
    toast.success(`${tab === "featured" ? "Featured" : "Trending"} list cleared`);
  };

  const pinnedProducts = activeIds.map((id) => products.find((p) => String(p.id) === String(id))).filter(Boolean) as typeof products;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Homepage Config</h2>
          <p className="text-sm text-slate-400">Pin products to Featured and Trending sections</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab("featured")}
          className={`flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold transition ${tab === "featured" ? "bg-[#0f172a] text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400"}`}>
          <Star className="size-4" /> Featured Products
        </button>
        <button onClick={() => setTab("trending")}
          className={`flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold transition ${tab === "trending" ? "bg-[#0f172a] text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400"}`}>
          <TrendingUp className="size-4" /> Trending Products
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Product picker */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 mb-3">
              {tab === "featured" ? "Pin to Featured" : "Pin to Trending"} <span className="text-sm font-normal text-slate-400">({activeIds.length}/{MAX} selected)</span>
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition" />
            </div>
          </div>
          <div className="overflow-y-auto flex-1" style={{ maxHeight: 460 }}>
            {filtered.length === 0 && (
              <div className="py-16 text-center text-slate-400 text-sm">No products found</div>
            )}
            {filtered.map((p) => {
              const pinned = activeIds.includes(String(p.id));
              return (
                <label key={p.id} className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition border-b border-slate-50 ${pinned ? "bg-red-50/50" : ""}`}>
                  <div className={`size-5 rounded-md border-2 flex items-center justify-center shrink-0 transition ${pinned ? "bg-[#ef4444] border-[#ef4444]" : "border-slate-300"}`}
                    onClick={() => toggle(String(p.id))}>
                    {pinned && <Check className="size-3 text-white" />}
                  </div>
                  <img src={p.image} alt={p.name} className="size-12 rounded-xl object-cover shrink-0 border border-slate-100" />
                  <div className="flex-1 min-w-0" onClick={() => toggle(String(p.id))}>
                    <p className="text-sm font-semibold text-slate-800 line-clamp-1">{p.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{p.category} · ৳{p.price.toLocaleString()}</p>
                  </div>
                  {pinned && (
                    <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full shrink-0">
                      #{activeIds.indexOf(String(p.id)) + 1}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {/* Right: Pinned order */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-800">
                {tab === "featured" ? <><Star className="size-4 inline mr-1 text-amber-500" />Featured Order</> : <><TrendingUp className="size-4 inline mr-1 text-red-500" />Trending Order</>}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {tab === "featured" ? "Shown in FeaturedGrid on homepage" : "Shown in Trending section on homepage"}
              </p>
            </div>
            {activeIds.length > 0 && (
              <button onClick={reset} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-500 transition">
                <RotateCcw className="size-3" /> Clear all
              </button>
            )}
          </div>
          <div className="overflow-y-auto flex-1" style={{ maxHeight: 460 }}>
            {pinnedProducts.length === 0 && (
              <div className="py-16 text-center">
                <Pin className="size-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No products pinned yet</p>
                <p className="text-xs text-slate-300 mt-1">Select products from the left panel</p>
              </div>
            )}
            {pinnedProducts.map((p, idx) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition">
                <span className="size-6 rounded-lg bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                <img src={p.image} alt={p.name} className="size-12 rounded-xl object-cover shrink-0 border border-slate-100" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 line-clamp-1">{p.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{p.category} · ৳{p.price.toLocaleString()}</p>
                </div>
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button onClick={() => moveUp(String(p.id))} disabled={idx === 0}
                    className="size-6 flex items-center justify-center rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition disabled:opacity-20">
                    <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
                  </button>
                  <button onClick={() => moveDown(String(p.id))} disabled={idx === pinnedProducts.length - 1}
                    className="size-6 flex items-center justify-center rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition disabled:opacity-20">
                    <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                  </button>
                </div>
                <button onClick={() => toggle(String(p.id))} className="size-6 flex items-center justify-center rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition">
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
          {pinnedProducts.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
              <p className="text-xs text-slate-400">
                Changes are saved automatically. Customer-facing pages will reflect these selections.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Star className="size-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Featured Grid</p>
              <p className="text-xs text-slate-400">{featuredIds.length} / {8} products pinned</p>
            </div>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${(featuredIds.length / 8) * 100}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {featuredIds.length === 0 ? "Shows all products when no products pinned" : `Showing ${featuredIds.length} specific products`}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-10 rounded-xl bg-red-100 flex items-center justify-center">
              <TrendingUp className="size-5 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Trending Section</p>
              <p className="text-xs text-slate-400">{trendingIds.length} / {5} products pinned</p>
            </div>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-red-400 rounded-full transition-all" style={{ width: `${(trendingIds.length / 5) * 100}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {trendingIds.length === 0 ? "Shows first 5 products when none pinned" : `Showing ${trendingIds.length} specific products`}
          </p>
        </div>
      </div>
    </div>
  );
}
