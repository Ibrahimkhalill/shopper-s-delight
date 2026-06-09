"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdminStore } from "@/lib/admin-store";
import type { AdminProduct } from "@/lib/admin-store";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ImageUploadZone } from "@/components/admin/ImageUploadZone";
import {
  ChevronLeft, RefreshCw, Plus, Trash2, X,
  Package, Palette, Ruler, Layers, Save,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
type VariantType = "none" | "color" | "size" | "color+size";
type SizeRow  = { id: string; size: string; price: number; stock: number; sku: string };
type ColorRow = { color: string; image: string; price: number; stock: number; sku: string; sizes: SizeRow[] };

type ProductForm = {
  name: string; category: string; brand: string;
  price: number; oldPrice?: number;
  image: string; images: string[]; gallery: string[];
  badge?: { label: string; tone: "new" | "sale" | "trending" };
  material?: string; description: string;
  subcategory?: string; metaTitle?: string; metaDescription?: string;
  slug?: string; stock?: number; status?: "active" | "draft";
  categoryId?: string; brandId?: string; tags?: string[];
  variantType: VariantType; colorRows: ColorRow[]; sizeRows: SizeRow[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }

const emptyForm = (): ProductForm => ({
  name: "", category: "", brand: "", price: 0, oldPrice: undefined,
  image: "", images: [], gallery: [], badge: undefined, material: "",
  description: "", subcategory: "", metaTitle: "", metaDescription: "",
  slug: "", stock: 0, status: "active", categoryId: "", brandId: "",
  tags: [], variantType: "none", colorRows: [], sizeRows: [],
});

const emptySizeRow  = (): SizeRow  => ({ id: uid(), size: "", price: 0, stock: 0, sku: "" });
const emptyColorRow = (hex: string): ColorRow => ({ color: hex, image: "", price: 0, stock: 0, sku: "", sizes: [] });

function detectVariantType(p: AdminProduct): VariantType {
  const hasColors = (p.colors ?? []).length > 0;
  const hasSizes  = (p.sizes  ?? []).length > 0;
  if (hasColors && hasSizes) return "color+size";
  if (hasColors) return "color";
  if (hasSizes)  return "size";
  return "none";
}

function buildColorRows(p: AdminProduct): ColorRow[] {
  return (p.colors ?? []).map((hex, i) => {
    const vars = (p.variants ?? []).filter((v) => v.color === hex);
    return {
      color: hex, image: (p.colorImages ?? [])[i] ?? "",
      price: vars[0]?.price ?? p.price, stock: vars[0]?.stock ?? 0, sku: vars[0]?.sku ?? "",
      sizes: vars.map((v) => ({ id: v.id, size: v.size, price: v.price, stock: v.stock, sku: v.sku })),
    };
  });
}

function buildSizeRows(p: AdminProduct): SizeRow[] {
  const sv = (p.variants ?? []).filter((v) => !v.color && v.size);
  if (sv.length) return sv.map((v) => ({ id: v.id, size: v.size, price: v.price, stock: v.stock, sku: v.sku }));
  return (p.sizes ?? []).map((s) => ({ id: uid(), size: s, price: p.price, stock: 0, sku: "" }));
}

// ─── Field atoms ──────────────────────────────────────────────────────────────
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-2xl border border-slate-200 p-5 ${className}`}>{children}</div>;
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">{children}</p>;
}
function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
      {children}{required && <span className="text-red-400 ml-1">*</span>}
    </label>
  );
}
function TInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props}
      className={`w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition bg-white placeholder:text-slate-400 ${props.className ?? ""}`} />
  );
}
function TSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props}
      className={`w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition bg-white ${props.className ?? ""}`} />
  );
}

// ─── Color image upload button ────────────────────────────────────────────────
function ColorImgBtn({ src, onFile, onClear }: { src: string; onFile: (f: File) => void; onClear: () => void }) {
  const id = `ci-${uid()}`;
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; };
  if (src) {
    return (
      <div className="relative group/ci shrink-0">
        <img src={src} alt="" className="size-12 rounded-xl object-cover border border-slate-200" />
        <button type="button" onClick={onClear}
          className="absolute -top-1.5 -right-1.5 size-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow opacity-0 group-hover/ci:opacity-100 transition">
          <X className="size-3" />
        </button>
        <label htmlFor={id} className="absolute inset-0 cursor-pointer rounded-xl" />
        <input id={id} type="file" accept="image/*" className="hidden" onChange={onChange} />
      </div>
    );
  }
  return (
    <label htmlFor={id}
      className="size-12 shrink-0 flex flex-col items-center justify-center gap-0.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-red-400 hover:bg-red-50/30 cursor-pointer transition">
      <svg className="size-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
      <span className="text-[8px] font-bold text-slate-400 uppercase">Photo</span>
      <input id={id} type="file" accept="image/*" className="hidden" onChange={onChange} />
    </label>
  );
}

// ─── Color palette ────────────────────────────────────────────────────────────
function ColorPalette({
  activeColors, selected, onToggle, colorInput, onColorInputChange, onAddCustom,
}: {
  activeColors: { id: string; hex: string; name: string }[];
  selected: string[]; onToggle: (hex: string) => void;
  colorInput: string; onColorInputChange: (v: string) => void; onAddCustom: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {activeColors.map((c) => {
        const sel = selected.includes(c.hex);
        return (
          <button key={c.id} type="button" onClick={() => onToggle(c.hex)} title={c.name}
            className="flex flex-col items-center gap-1">
            <span className={`size-8 rounded-full border-4 transition ${sel ? "border-[#ef4444] scale-110 shadow-md" : "border-white shadow hover:scale-105"}`}
              style={{ background: c.hex }}>
              {sel && <span className="block w-full h-full rounded-full ring-2 ring-[#ef4444] ring-offset-1" />}
            </span>
            <span className="text-[9px] text-slate-500 font-medium">{c.name}</span>
          </button>
        );
      })}
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-1">
          <input type="color" value={colorInput} onChange={(e) => onColorInputChange(e.target.value)}
            className="size-8 rounded-full cursor-pointer border-4 border-white shadow p-0 overflow-hidden" />
          <button type="button" onClick={onAddCustom}
            className="h-6 px-2 rounded-full bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-600 transition">+Add</button>
        </div>
        <span className="text-[9px] text-slate-400">Custom</span>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
interface Props {
  mode: "add" | "edit";
  initialProduct?: AdminProduct;
}

export function ProductFormPage({ mode, initialProduct }: Props) {
  const router = useRouter();
  const { addProduct, updateProduct, categories, brands, sizes, colors, badges } = useAdminStore();

  const activeCategories = useMemo(() => categories.filter((c) => c.status === "active"), [categories]);
  const activeBrands     = useMemo(() => brands.filter((b) => b.status === "active"), [brands]);
  const activeSizes      = useMemo(() => sizes.filter((s) => s.status === "active"), [sizes]);
  const activeColors     = useMemo(() => colors.filter((c) => c.status === "active"), [colors]);
  const activeBadges     = useMemo(() => badges.filter((b) => b.status === "active"), [badges]);

  const [form, setForm] = useState<ProductForm>(() => {
    if (mode === "edit" && initialProduct) {
      const p = initialProduct;
      return {
        name: p.name, category: p.category, brand: p.brand,
        price: p.price, oldPrice: p.oldPrice,
        image: p.image, images: p.images ?? [], gallery: p.gallery ?? [],
        badge: p.badge, material: p.material ?? "", description: p.description ?? "",
        subcategory: p.subcategory ?? "", metaTitle: p.metaTitle ?? "",
        metaDescription: p.metaDescription ?? "", slug: p.slug ?? slugify(p.name),
        stock: p.stock ?? 0, status: p.status ?? "active",
        categoryId: p.categoryId ?? "", brandId: p.brandId ?? "",
        tags: p.tags ?? [], variantType: detectVariantType(p),
        colorRows: buildColorRows(p), sizeRows: buildSizeRows(p),
      };
    }
    return emptyForm();
  });

  const [colorInput, setColorInput] = useState("#ef4444");
  const [seoOpen, setSeoOpen]       = useState(false);
  const [saving, setSaving]         = useState(false);

  const subcategoriesForSelected = useMemo(
    () => form.categoryId ? activeCategories.filter((c) => c.parentId === form.categoryId) : [],
    [activeCategories, form.categoryId]
  );

  // ── Pricing helpers ─────────────────────────────────────────────────────────
  const discount = form.oldPrice && form.oldPrice > form.price
    ? Math.round((1 - form.price / form.oldPrice) * 100) : 0;
  const savings = form.oldPrice && form.oldPrice > form.price ? form.oldPrice - form.price : 0;

  const handleMrpChange = (mrp: number) => {
    if (mrp > 0 && discount > 0) setForm((f) => ({ ...f, oldPrice: mrp, price: Math.round(mrp * (1 - discount / 100)) }));
    else setForm((f) => ({ ...f, oldPrice: mrp || undefined }));
  };

  const handleDiscountPct = (pct: number) => {
    const mrp = form.oldPrice ?? 0;
    if (pct <= 0 && mrp > 0)      setForm((f) => ({ ...f, price: mrp }));
    else if (pct >= 100 && mrp > 0) setForm((f) => ({ ...f, price: 1 }));
    else if (mrp > 0)               setForm((f) => ({ ...f, price: Math.round(mrp * (1 - pct / 100)) }));
  };

  // ── Image helpers ───────────────────────────────────────────────────────────
  const allImages = useMemo(() => {
    const seen = new Set<string>(); const out: string[] = [];
    [form.image, ...form.images, ...form.gallery].forEach((u) => { if (u && !seen.has(u)) { seen.add(u); out.push(u); } });
    return out;
  }, [form.image, form.images, form.gallery]);

  const handleImagesChange = (imgs: string[]) =>
    setForm((f) => ({ ...f, image: imgs[0] ?? "", images: imgs.slice(1), gallery: imgs.slice(1) }));

  // ── Color variant helpers ───────────────────────────────────────────────────
  const selectedColorHexes = form.colorRows.map((r) => r.color);

  const toggleColor = (hex: string) => setForm((f) => ({
    ...f,
    colorRows: selectedColorHexes.includes(hex)
      ? f.colorRows.filter((r) => r.color !== hex)
      : [...f.colorRows, emptyColorRow(hex)],
  }));

  const addCustomColor = () => {
    if (!selectedColorHexes.includes(colorInput))
      setForm((f) => ({ ...f, colorRows: [...f.colorRows, emptyColorRow(colorInput)] }));
  };

  const updateColorRow = (hex: string, patch: Partial<ColorRow>) =>
    setForm((f) => ({ ...f, colorRows: f.colorRows.map((r) => r.color === hex ? { ...r, ...patch } : r) }));

  const removeColorRow = (hex: string) =>
    setForm((f) => ({ ...f, colorRows: f.colorRows.filter((r) => r.color !== hex) }));

  const handleColorImg = (hex: string, file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Images only"); return; }
    if (file.size > 8 * 1024 * 1024)    { toast.error("Max 8 MB"); return; }
    const reader = new FileReader();
    reader.onload = (e) => updateColorRow(hex, { image: e.target?.result as string });
    reader.readAsDataURL(file);
  };

  const addSizeToColor = (hex: string) =>
    setForm((f) => ({ ...f, colorRows: f.colorRows.map((r) => r.color === hex ? { ...r, sizes: [...r.sizes, emptySizeRow()] } : r) }));

  const updateColorSize = (hex: string, sid: string, patch: Partial<SizeRow>) =>
    setForm((f) => ({ ...f, colorRows: f.colorRows.map((r) => r.color === hex ? { ...r, sizes: r.sizes.map((s) => s.id === sid ? { ...s, ...patch } : s) } : r) }));

  const removeColorSize = (hex: string, sid: string) =>
    setForm((f) => ({ ...f, colorRows: f.colorRows.map((r) => r.color === hex ? { ...r, sizes: r.sizes.filter((s) => s.id !== sid) } : r) }));

  // ── Size-only helpers ───────────────────────────────────────────────────────
  const addSizeRow    = () => setForm((f) => ({ ...f, sizeRows: [...f.sizeRows, emptySizeRow()] }));
  const updateSizeRow = (id: string, patch: Partial<SizeRow>) =>
    setForm((f) => ({ ...f, sizeRows: f.sizeRows.map((r) => r.id === id ? { ...r, ...patch } : r) }));
  const removeSizeRow = (id: string) => setForm((f) => ({ ...f, sizeRows: f.sizeRows.filter((r) => r.id !== id) }));

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = (saveStatus: "active" | "draft") => {
    if (!form.name.trim()) { toast.error("Product name is required"); return; }
    if (form.price <= 0)   { toast.error("Price must be greater than 0"); return; }
    setSaving(true);

    let derivedColors: string[] = [], derivedColorImages: string[] = [];
    let derivedSizes: string[] = [], derivedVariants: AdminProduct["variants"] = [];

    if (form.variantType === "color") {
      derivedColors      = form.colorRows.map((r) => r.color);
      derivedColorImages = form.colorRows.map((r) => r.image);
      derivedVariants    = form.colorRows.map((r) => ({ id: `v-${uid()}`, color: r.color, size: "", price: r.price || form.price, stock: r.stock, sku: r.sku }));
    } else if (form.variantType === "size") {
      derivedSizes    = form.sizeRows.map((r) => r.size).filter(Boolean);
      derivedVariants = form.sizeRows.filter((r) => r.size).map((r) => ({ id: r.id, color: "", size: r.size, price: r.price || form.price, stock: r.stock, sku: r.sku }));
    } else if (form.variantType === "color+size") {
      derivedColors      = form.colorRows.map((r) => r.color);
      derivedColorImages = form.colorRows.map((r) => r.image);
      derivedSizes       = [...new Set(form.colorRows.flatMap((r) => r.sizes.map((s) => s.size)).filter(Boolean))];
      derivedVariants    = form.colorRows.flatMap((r) => r.sizes.map((s) => ({ id: s.id, color: r.color, size: s.size, price: s.price || form.price, stock: s.stock, sku: s.sku })));
    }

    const allImgs = [form.image, ...form.images.filter((x) => x && x !== form.image)].filter(Boolean);
    const data: Omit<AdminProduct, "id"> & { liked: boolean } = {
      ...form, status: saveStatus,
      image: allImgs[0] ?? "", images: allImgs, liked: false,
      slug: form.slug || slugify(form.name),
      colors: derivedColors, colorImages: derivedColorImages,
      sizes: derivedSizes, variants: derivedVariants,
    };

    if (mode === "edit" && initialProduct) {
      updateProduct(initialProduct.id, data);
      toast.success("Product updated");
    } else {
      addProduct(data);
      toast.success("Product created");
    }
    router.push("/admin/products");
  };

  const totalVariantCount =
    form.variantType === "color"      ? form.colorRows.length :
    form.variantType === "size"       ? form.sizeRows.length :
    form.variantType === "color+size" ? form.colorRows.reduce((a, r) => a + r.sizes.length, 0) : 0;

  const VARIANT_TYPES: { key: VariantType; label: string; sub: string; icon: React.ReactNode }[] = [
    { key: "none",       label: "None",        sub: "Single price",          icon: <Package className="size-4" /> },
    { key: "color",      label: "Color",       sub: "Per-color price/image", icon: <Palette className="size-4" /> },
    { key: "size",       label: "Size/Option", sub: "Per-size price",        icon: <Ruler   className="size-4" /> },
    { key: "color+size", label: "Color+Size",  sub: "Full matrix",           icon: <Layers  className="size-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/products"
            className="size-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-white transition text-slate-500 shrink-0">
            <ChevronLeft className="size-5" />
          </Link>
          <div>
            <p className="text-xs text-slate-400 font-medium">Products</p>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">
              {mode === "edit" ? `Edit: ${initialProduct?.name ?? ""}` : "Add New Product"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:shrink-0">
          <button type="button" onClick={() => handleSave("draft")} disabled={saving}
            className="h-10 px-5 rounded-xl border-2 border-slate-200 text-sm font-semibold text-slate-600 hover:bg-white transition disabled:opacity-50">
            Save Draft
          </button>
          <button type="button" onClick={() => handleSave("active")} disabled={saving}
            className="h-10 px-5 rounded-xl bg-[#ef4444] hover:bg-red-600 text-white text-sm font-semibold transition flex items-center gap-2 shadow-md shadow-red-500/20 disabled:opacity-50">
            <Save className="size-4" />
            {mode === "edit" ? "Save Changes" : "Publish Product"}
          </button>
        </div>
      </div>

      {/* ── Two-column layout ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

        {/* ═══ LEFT — main content ════════════════════════════════════════ */}
        <div className="space-y-6">

          {/* Name + Slug */}
          <Card>
            <SectionTitle>Basic Info</SectionTitle>
            <div className="space-y-4">
              <div>
                <FieldLabel required>Product Name</FieldLabel>
                <TInput value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
                  placeholder="e.g. Samsung Galaxy A55 5G" className="text-base font-semibold h-11" />
              </div>
              <div>
                <FieldLabel>URL Slug <span className="text-slate-400 font-normal text-xs">— Auto-generated</span></FieldLabel>
                <div className="flex gap-2">
                  <TInput value={form.slug ?? ""} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    placeholder="samsung-galaxy-a55-5g" className="font-mono text-xs" />
                  <button type="button" onClick={() => setForm((f) => ({ ...f, slug: slugify(f.name) }))}
                    className="size-10 shrink-0 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition">
                    <RefreshCw className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Description */}
          <Card>
            <SectionTitle>Description</SectionTitle>
            <RichTextEditor value={form.description}
              onChange={(html) => setForm((f) => ({ ...f, description: html }))}
              placeholder="Write a detailed product description..." minHeight={220} />
          </Card>

          {/* Product Images */}
          <Card>
            <SectionTitle>Product Images</SectionTitle>
            <ImageUploadZone images={allImages} onChange={handleImagesChange} maxImages={6} />
          </Card>

          {/* ── Variants ────────────────────────────────────────────────── */}
          <Card>
            <SectionTitle>Variants</SectionTitle>

            {/* Type selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
              {VARIANT_TYPES.map((vt) => {
                const active = form.variantType === vt.key;
                return (
                  <button key={vt.key} type="button"
                    onClick={() => setForm((f) => ({ ...f, variantType: vt.key, colorRows: [], sizeRows: [] }))}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition text-center ${active ? "border-[#ef4444] bg-red-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}>
                    <span className={active ? "text-[#ef4444]" : "text-slate-400"}>{vt.icon}</span>
                    <span className={`text-xs font-bold leading-tight ${active ? "text-red-600" : "text-slate-700"}`}>{vt.label}</span>
                    <span className="text-[10px] text-slate-400 leading-tight">{vt.sub}</span>
                  </button>
                );
              })}
            </div>

            {/* None */}
            {form.variantType === "none" && (
              <div className="p-4 bg-slate-50 rounded-2xl text-sm text-slate-500 text-center border border-dashed border-slate-200">
                No variants — single price & stock applies.
              </div>
            )}

            {/* Color only */}
            {form.variantType === "color" && (
              <div className="space-y-5">
                <ColorPalette activeColors={activeColors} selected={selectedColorHexes}
                  onToggle={toggleColor} colorInput={colorInput}
                  onColorInputChange={setColorInput} onAddCustom={addCustomColor} />

                {form.colorRows.length > 0 && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-[48px_1fr_110px_80px_80px_32px] gap-2 items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Img</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Color</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Price (৳)</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Qty</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">SKU</span>
                      <span />
                    </div>
                    {form.colorRows.map((row) => {
                      const cName = activeColors.find((ac) => ac.hex === row.color)?.name ?? row.color;
                      return (
                        <div key={row.color} className="grid grid-cols-[48px_1fr_110px_80px_80px_32px] gap-2 items-center p-2 bg-slate-50 rounded-xl border border-slate-100">
                          <ColorImgBtn src={row.image} onFile={(f) => handleColorImg(row.color, f)} onClear={() => updateColorRow(row.color, { image: "" })} />
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="size-4 rounded-full shrink-0 border-2 border-white shadow" style={{ background: row.color }} />
                            <span className="text-sm font-semibold text-slate-700 truncate">{cName}</span>
                          </div>
                          <input type="number" min="0" value={row.price || ""}
                            onChange={(e) => updateColorRow(row.color, { price: Number(e.target.value) })}
                            placeholder={String(form.price || 0)}
                            className="w-full h-9 px-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition bg-white" />
                          <input type="number" min="0" value={row.stock || ""}
                            onChange={(e) => updateColorRow(row.color, { stock: Number(e.target.value) })}
                            placeholder="0"
                            className="w-full h-9 px-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition bg-white" />
                          <input value={row.sku} onChange={(e) => updateColorRow(row.color, { sku: e.target.value })}
                            placeholder="SKU"
                            className="w-full h-9 px-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-red-400 transition bg-white" />
                          <button type="button" onClick={() => removeColorRow(row.color)}
                            className="size-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400 transition shrink-0">
                            <X className="size-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                {form.colorRows.length === 0 && (
                  <p className="text-center text-sm text-slate-400 py-4">Select a color above to configure per-color pricing</p>
                )}
              </div>
            )}

            {/* Size only */}
            {form.variantType === "size" && (
              <div className="space-y-3">
                {form.sizeRows.length > 0 && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-[1fr_110px_80px_80px_32px] gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Size / Option</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Price (৳)</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Qty</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">SKU</span>
                      <span />
                    </div>
                    {form.sizeRows.map((row) => (
                      <div key={row.id} className="grid grid-cols-[1fr_110px_80px_80px_32px] gap-2 items-center">
                        <TSelect value={row.size} onChange={(e) => updateSizeRow(row.id, { size: e.target.value })}>
                          <option value="">Select size</option>
                          {activeSizes.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                        </TSelect>
                        <input type="number" min="0" value={row.price || ""}
                          onChange={(e) => updateSizeRow(row.id, { price: Number(e.target.value) })}
                          placeholder={String(form.price || 0)}
                          className="w-full h-10 px-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition bg-white" />
                        <input type="number" min="0" value={row.stock || ""}
                          onChange={(e) => updateSizeRow(row.id, { stock: Number(e.target.value) })}
                          placeholder="0"
                          className="w-full h-10 px-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition bg-white" />
                        <input value={row.sku} onChange={(e) => updateSizeRow(row.id, { sku: e.target.value })}
                          placeholder="SKU"
                          className="w-full h-10 px-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-red-400 transition bg-white" />
                        <button type="button" onClick={() => removeSizeRow(row.id)}
                          className="size-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400 transition shrink-0">
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button type="button" onClick={addSizeRow}
                  className="w-full h-10 rounded-xl border-2 border-dashed border-slate-200 hover:border-red-400 hover:bg-red-50/30 text-xs font-semibold text-slate-500 hover:text-red-500 transition flex items-center justify-center gap-2">
                  <Plus className="size-3.5" /> Add Size / Option Row
                </button>
              </div>
            )}

            {/* Color + Size */}
            {form.variantType === "color+size" && (
              <div className="space-y-4">
                <ColorPalette activeColors={activeColors} selected={selectedColorHexes}
                  onToggle={toggleColor} colorInput={colorInput}
                  onColorInputChange={setColorInput} onAddCustom={addCustomColor} />

                {form.colorRows.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400">
                      {form.colorRows.length} color{form.colorRows.length > 1 ? "s" : ""} · {totalVariantCount} variant{totalVariantCount !== 1 ? "s" : ""}
                    </p>
                    {form.colorRows.map((row) => {
                      const cName = activeColors.find((ac) => ac.hex === row.color)?.name ?? row.color;
                      return (
                        <div key={row.color} className="border border-slate-200 rounded-2xl overflow-hidden">
                          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
                            <span className="size-4 rounded-full shrink-0 border-2 border-white shadow ring-1 ring-slate-200" style={{ background: row.color }} />
                            <span className="text-sm font-bold text-slate-700 flex-1">{cName}</span>
                            <span className="text-xs text-slate-400 font-mono hidden sm:block">{row.color}</span>
                            <button type="button" onClick={() => removeColorRow(row.color)}
                              className="size-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400 transition">
                              <X className="size-4" />
                            </button>
                          </div>
                          <div className="p-4 space-y-4">
                            <div className="flex items-center gap-4">
                              <ColorImgBtn src={row.image} onFile={(f) => handleColorImg(row.color, f)} onClear={() => updateColorRow(row.color, { image: "" })} />
                              <div>
                                <p className="text-xs font-semibold text-slate-600 mb-0.5">Color Image</p>
                                <p className="text-xs text-slate-400">Shown when customer selects this color</p>
                              </div>
                            </div>
                            {row.sizes.length > 0 && (
                              <div className="space-y-2">
                                <div className="grid grid-cols-[1fr_110px_80px_80px_32px] gap-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Size</span>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Price (৳)</span>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Qty</span>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">SKU</span>
                                  <span />
                                </div>
                                {row.sizes.map((s) => (
                                  <div key={s.id} className="grid grid-cols-[1fr_110px_80px_80px_32px] gap-2 items-center">
                                    <TSelect value={s.size} onChange={(e) => updateColorSize(row.color, s.id, { size: e.target.value })}>
                                      <option value="">Size</option>
                                      {activeSizes.map((sz) => <option key={sz.id} value={sz.name}>{sz.name}</option>)}
                                    </TSelect>
                                    <input type="number" min="0" value={s.price || ""}
                                      onChange={(e) => updateColorSize(row.color, s.id, { price: Number(e.target.value) })}
                                      placeholder={String(form.price || 0)}
                                      className="w-full h-10 px-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition bg-white" />
                                    <input type="number" min="0" value={s.stock || ""}
                                      onChange={(e) => updateColorSize(row.color, s.id, { stock: Number(e.target.value) })}
                                      placeholder="0"
                                      className="w-full h-10 px-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition bg-white" />
                                    <input value={s.sku} onChange={(e) => updateColorSize(row.color, s.id, { sku: e.target.value })}
                                      placeholder="SKU"
                                      className="w-full h-10 px-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-red-400 transition bg-white" />
                                    <button type="button" onClick={() => removeColorSize(row.color, s.id)}
                                      className="size-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400 transition shrink-0">
                                      <Trash2 className="size-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            <button type="button" onClick={() => addSizeToColor(row.color)}
                              className="w-full h-9 rounded-xl border-2 border-dashed border-slate-200 hover:border-red-400 hover:bg-red-50/30 text-xs font-semibold text-slate-500 hover:text-red-500 transition flex items-center justify-center gap-1.5">
                              <Plus className="size-3.5" /> Add size for {cName}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-sm text-slate-400 py-4">Select a color above to start building variants</p>
                )}
              </div>
            )}
          </Card>

          {/* SEO */}
          <Card>
            <button type="button" onClick={() => setSeoOpen((o) => !o)}
              className="w-full flex items-center justify-between">
              <SectionTitle>SEO Settings</SectionTitle>
              <span className="text-xs text-slate-400 -mt-4">{seoOpen ? "▲" : "▼"}</span>
            </button>
            {seoOpen && (
              <div className="space-y-4 mt-2">
                <div>
                  <FieldLabel>Meta Title</FieldLabel>
                  <TInput value={form.metaTitle ?? ""} onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))}
                    placeholder="Leave blank to use product name" />
                  <p className="text-xs text-slate-400 mt-1">{(form.metaTitle ?? "").length}/60</p>
                </div>
                <div>
                  <FieldLabel>Meta Description</FieldLabel>
                  <textarea value={form.metaDescription ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 transition resize-none"
                    placeholder="150–160 characters recommended" />
                  <p className="text-xs text-slate-400 mt-1">{(form.metaDescription ?? "").length}/160</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* ═══ RIGHT — sticky sidebar ══════════════════════════════════════ */}
        <div className="space-y-5 lg:sticky lg:top-6 lg:self-start">

          {/* Status */}
          <Card>
            <SectionTitle>Status</SectionTitle>
            <div className="flex gap-2">
              {(["active", "draft"] as const).map((s) => (
                <button key={s} type="button" onClick={() => setForm((f) => ({ ...f, status: s }))}
                  className={`flex-1 h-10 rounded-xl text-sm font-semibold border-2 transition capitalize ${form.status === s ? "bg-[#0f172a] text-white border-[#0f172a]" : "border-slate-200 text-slate-600 hover:border-slate-400"}`}>
                  {s}
                </button>
              ))}
            </div>
          </Card>

          {/* Pricing */}
          <Card>
            <SectionTitle>Pricing</SectionTitle>
            <div className="space-y-3">
              <div>
                <FieldLabel>MRP / Original Price (৳)</FieldLabel>
                <TInput type="number" min="0" value={form.oldPrice || ""}
                  onChange={(e) => handleMrpChange(e.target.value ? Number(e.target.value) : 0)}
                  placeholder="e.g. 1500" />
              </div>
              <div>
                <FieldLabel>Discount %</FieldLabel>
                <div className="relative">
                  <TInput type="number" min="0" max="90"
                    value={discount > 0 ? discount : ""}
                    onChange={(e) => handleDiscountPct(Number(e.target.value))}
                    placeholder="0" className="pr-8"
                    disabled={!form.oldPrice} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">%</span>
                </div>
                {!form.oldPrice && <p className="text-[11px] text-slate-400 mt-1">Set MRP first</p>}
              </div>
              <div>
                <FieldLabel required>
                  Sale Price (৳)
                  {discount > 0 && <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full normal-case">−{discount}% off</span>}
                </FieldLabel>
                <input type="number" min="0" value={form.price || ""}
                  onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                  placeholder="e.g. 1200"
                  className="w-full h-11 px-4 rounded-xl border-2 border-slate-300 focus:border-red-400 text-xl font-bold text-slate-800 outline-none transition bg-white" />
              </div>
              {savings > 0 && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-sm text-slate-400 line-through">৳{form.oldPrice?.toLocaleString()}</span>
                  <span className="text-sm font-bold text-slate-800">৳{form.price.toLocaleString()}</span>
                  <span className="ml-auto text-xs font-bold text-emerald-700">Save ৳{savings.toLocaleString()}</span>
                </div>
              )}
              <div>
                <FieldLabel>Stock Quantity</FieldLabel>
                <TInput type="number" min="0" value={form.stock || ""}
                  onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))} placeholder="100" />
              </div>
            </div>
          </Card>

          {/* Organization */}
          <Card>
            <SectionTitle>Organization</SectionTitle>
            <div className="space-y-3">
              <div>
                <FieldLabel>Category</FieldLabel>
                <TSelect value={form.categoryId || ""}
                  onChange={(e) => {
                    const cat = activeCategories.find((c) => c.id === e.target.value);
                    setForm((f) => ({ ...f, category: cat?.name ?? "", categoryId: e.target.value, subcategory: "" }));
                  }}>
                  <option value="">Select category</option>
                  {activeCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.parentId ? `  ↳ ${c.name}` : c.name}</option>
                  ))}
                </TSelect>
              </div>
              {subcategoriesForSelected.length > 0 && (
                <div>
                  <FieldLabel>Subcategory</FieldLabel>
                  <TSelect value={form.subcategory ?? ""} onChange={(e) => setForm((f) => ({ ...f, subcategory: e.target.value }))}>
                    <option value="">None</option>
                    {subcategoriesForSelected.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                  </TSelect>
                </div>
              )}
              <div>
                <FieldLabel>Brand</FieldLabel>
                <TSelect value={form.brandId || ""}
                  onChange={(e) => {
                    const b = activeBrands.find((x) => x.id === e.target.value);
                    setForm((f) => ({ ...f, brand: b?.name ?? "", brandId: e.target.value }));
                  }}>
                  <option value="">Select brand</option>
                  {activeBrands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </TSelect>
              </div>
              <div>
                <FieldLabel>Badge</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setForm((f) => ({ ...f, badge: undefined }))}
                    className={`h-7 px-3 rounded-full text-xs font-semibold border-2 transition ${!form.badge ? "bg-[#0f172a] text-white border-[#0f172a]" : "border-slate-200 text-slate-600 hover:border-slate-400"}`}>
                    None
                  </button>
                  {activeBadges.map((b) => (
                    <button key={b.id} type="button"
                      onClick={() => setForm((f) => ({ ...f, badge: { label: b.label, tone: b.tone } }))}
                      className={`h-7 px-3 rounded-full text-xs font-semibold border-2 transition ${form.badge?.label === b.label ? "bg-[#0f172a] text-white border-[#0f172a]" : "border-slate-200 text-slate-600 hover:border-slate-400"}`}>
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Details */}
          <Card>
            <SectionTitle>Details</SectionTitle>
            <div className="space-y-3">
              <div>
                <FieldLabel>Material</FieldLabel>
                <TInput value={form.material ?? ""} onChange={(e) => setForm((f) => ({ ...f, material: e.target.value }))}
                  placeholder="e.g. 100% Cotton" />
              </div>
              <div>
                <FieldLabel>Tags <span className="text-slate-400 font-normal text-xs">(comma-separated)</span></FieldLabel>
                <TInput value={(form.tags ?? []).join(", ")}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) }))}
                  placeholder="summer, casual, trending" />
              </div>
            </div>
          </Card>

          {/* Bottom action bar (mobile) */}
          <div className="lg:hidden flex gap-2 pb-2">
            <button type="button" onClick={() => handleSave("draft")} disabled={saving}
              className="flex-1 h-11 rounded-xl border-2 border-slate-200 text-sm font-semibold text-slate-600 hover:bg-white transition">
              Save Draft
            </button>
            <button type="button" onClick={() => handleSave("active")} disabled={saving}
              className="flex-1 h-11 rounded-xl bg-[#ef4444] hover:bg-red-600 text-white text-sm font-semibold transition flex items-center justify-center gap-2">
              <Save className="size-4" />
              {mode === "edit" ? "Save Changes" : "Publish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
