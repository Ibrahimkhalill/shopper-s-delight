"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/site/Layout";
import { useState } from "react";
import {
  Lock, Truck, CreditCard, Wallet, Banknote, Smartphone,
  ShieldCheck, RotateCcw, Minus, Plus, Trash2, Check,
  ChevronDown, MapPin, Tag, ShoppingCart, User as UserIcon,
  Headphones, KeyRound,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { PageHeader } from "@/components/site/PageHeader";
import { Price } from "@/components/site/Price";

const BD_DIVISIONS = [
  "Barishal",
  "Chattogram",
  "Dhaka",
  "Khulna",
  "Mymensingh",
  "Rajshahi",
  "Rangpur",
  "Sylhet",
] as const;

const BD_DISTRICTS = [
  "Dhaka", "Chattogram", "Rajshahi", "Khulna", "Barishal",
  "Sylhet", "Rangpur", "Mymensingh", "Cumilla", "Narayanganj",
  "Gazipur", "Bogura", "Dinajpur", "Jessore", "Cox's Bazar",
];

const DELIVERY_AREAS = [
  { id: "inside",  label: "Inside Dhaka",  sub: "3-5 Business Days", price: 80 },
  { id: "outside", label: "Outside Dhaka", sub: "Next Day Delivery",  price: 120 },
];

const PAYMENT_METHODS = [
  { id: "cod",   label: "Cash on Delivery",    icon: Banknote   },
  { id: "bkash", label: "bKash",               icon: Smartphone },
  { id: "nagad", label: "Nagad",               icon: Wallet     },
  { id: "card",  label: "Credit / Debit Card", icon: CreditCard },
];

function CheckoutPage() {
  const { cart, resolveProduct, setQty, removeFromCart, cartSubtotal, placeOrder, user } = useStore();
  const router = useRouter();

  const [form, setForm] = useState({
    name:     user?.name  ?? "",
    phone:    user?.phone ?? "",
    email:    user?.email ?? "",
    address:  "",
    division: "",
    district: "",
    notes:    "",
  });
  const [deliveryArea, setDeliveryArea] = useState<"inside" | "outside">("inside");
  const [pay,          setPay]          = useState("cod");
  const [agreed,       setAgreed]       = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [coupon,       setCoupon]       = useState("");
  const [discount,     setDiscount]     = useState(0);
  const [summaryOpen,  setSummaryOpen]  = useState(true);

  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const shippingCost = deliveryArea === "inside" ? 80 : 120;
  const subtotal     = cartSubtotal;
  const total        = subtotal - discount + shippingCost;

  const applyCoupon = () => {
    const c = coupon.trim().toUpperCase();
    if (c === "SHOPBD10")     { setDiscount(Math.round(subtotal * 0.1)); toast.success("10% off applied!"); }
    else if (c === "WELCOME") { setDiscount(200); toast.success("৳200 off applied!"); }
    else toast.error("Invalid coupon code");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email.trim() || !form.address || !form.division || !form.district) {
      toast.error("Please fill all required fields"); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast.error("Please enter a valid email address"); return;
    }
    if (!agreed)       { toast.error("Please agree to Terms & Conditions"); return; }
    if (cart.length === 0) { toast.error("Your cart is empty"); return; }

    setSubmitting(true);
    setTimeout(() => {
      const order = placeOrder({
        payment: pay,
        address: `${form.address}, ${form.district}, ${form.division}`,
        name:    form.name,
        phone:   form.phone,
        email:   form.email.trim(),
        discount,
        shippingCost,
      });
      toast.success("Order placed!", { description: `Order ID: ${order.id}` });
      router.push(`/order/${order.id}`);
    }, 900);
  };

  if (cart.length === 0) {
    return (
      <Layout hideTrust>
        <div className="mx-auto max-w-md px-4 py-16 text-center sm:py-20 lg:py-24">
          <h1 className="text-xl font-bold tracking-tight lg:text-2xl">
            Your cart is empty
          </h1>
          <Link
            href="/"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-foreground px-6 text-sm font-semibold text-background transition hover:opacity-90 lg:h-11 lg:px-7"
          >
            Browse products
          </Link>
        </div>
      </Layout>
    );
  }

  /* ── Shared order summary content ─────────────────────────────────── */
  const OrderSummaryContent = () => (
    <div className="flex flex-col gap-4 lg:gap-5">
      {/* Product list */}
      <div className="flex flex-col gap-2.5 lg:gap-3">
        {cart.map(it => {
          const p = resolveProduct(it.id);
          if (!p) return null;
          return (
            <div
              key={it.id + (it.size ?? "")}
              className="flex gap-3 rounded-xl border border-border/70 bg-background p-3 lg:gap-3.5 lg:p-3.5"
            >
              <div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-muted lg:h-20 lg:w-16">
                <img src={p.image} alt={p.name} className="size-full object-cover" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <p className="line-clamp-2 text-sm font-medium leading-snug lg:text-[15px]">{p.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground lg:text-[13px]">
                    {it.size ? it.size : p.category}
                  </p>
                </div>
                <div className="mt-1.5 flex items-center justify-between lg:mt-2">
                  <div className="flex items-center gap-2.5 rounded-full border border-border px-2 py-0.5 lg:gap-3">
                    <button
                      type="button"
                      onClick={() => setQty(it.id, it.qty - 1)}
                      disabled={it.qty <= 1}
                      className="qty-btn flex size-5 items-center justify-center rounded-full hover:bg-secondary disabled:opacity-30 lg:size-6"
                    >
                      <Minus className="size-3" strokeWidth={2.5} />
                    </button>
                    <span className="text-xs font-semibold tabular-nums lg:text-[13px]">{it.qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(it.id, it.qty + 1)}
                      className="qty-btn flex size-5 items-center justify-center rounded-full hover:bg-secondary lg:size-6"
                    >
                      <Plus className="size-3" strokeWidth={2.5} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Line price — 14/15px semibold */}
                    <Price
                      amount={p.price * it.qty}
                      size="sm"
                      className="!font-semibold lg:!text-[15px]"
                    />
                    <button
                      type="button"
                      onClick={() => { removeFromCart(it.id); toast("Item removed"); }}
                      className="flex size-6 items-center justify-center text-muted-foreground/60 transition-colors hover:text-accent"
                      aria-label="Remove"
                    >
                      <Trash2 size={12} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Coupon — 14px input, 14px button, h-10 */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="pointer-events-none absolute left-3 top-1/2 size-[13px] -translate-y-1/2 text-muted-foreground" />
          <input
            value={coupon}
            onChange={e => setCoupon(e.target.value)}
            onKeyDown={e => e.key === "Enter" && applyCoupon()}
            placeholder="Promo code"
            className="input-soft h-10 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-sm font-medium uppercase tracking-wide outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-foreground"
          />
        </div>
        <button
          type="button"
          onClick={applyCoupon}
          className="h-10 shrink-0 rounded-lg bg-foreground px-4 text-sm font-semibold text-background transition hover:opacity-90"
        >
          Apply
        </button>
      </div>
      {discount > 0 && (
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-accent">
          <Check size={12} strokeWidth={3} />{" "}
          <Price amount={discount} size="sm" tone="inherit" className="!font-semibold" />{" "}
          discount applied
        </p>
      )}

      {/* Price breakdown — Subtotal/Shipping 14px, Total 18px */}
      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <Price amount={subtotal} size="sm" className="!font-semibold" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Shipping</span>
          <Price amount={shippingCost} size="sm" className="!font-semibold" />
        </div>
        {discount > 0 && (
          <div className="flex items-baseline justify-between text-accent">
            <span className="text-sm">Discount</span>
            <span className="inline-flex items-baseline gap-0.5 text-sm font-semibold">
              <span>−</span>
              <Price amount={discount} size="sm" tone="inherit" className="!font-semibold" />
            </span>
          </div>
        )}
        <div className="mt-1.5 flex items-baseline justify-between border-t border-border pt-3">
          <span className="text-base font-bold tracking-tight">Total</span>
          <Price
            amount={total}
            size="md"
            className="!font-bold lg:!text-lg"
            symbolClassName="lg:!text-[0.88rem]"
          />
        </div>
      </div>
    </div>
  );

  return (
    <Layout hideTrust>
      <PageHeader
        centered
        color="oklch(0.96 0 0)"
        title="Checkout"
        subtitle="Review your order, enter delivery details, and pay securely."
        crumbs={[{ label: "Home", to: "/" }, { label: "Checkout" }]}
      />

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="min-h-screen bg-secondary/25 pb-24 md:pb-10">
        <form
          id="checkout-form"
          onSubmit={handleSubmit}
          className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-5 px-4 py-5 sm:py-6 lg:grid-cols-12 lg:gap-7 lg:px-6 lg:py-8"
        >

          {/* ══════════ RIGHT — Order Summary ══════════ */}
          <aside className="flex flex-col gap-3 lg:sticky lg:top-24 lg:order-last lg:col-span-5 lg:gap-4">

            {/* Mobile collapsible */}
            <div className="lg:hidden overflow-hidden rounded-xl border border-border/80 bg-card">
              <button
                type="button"
                onClick={() => setSummaryOpen((o) => !o)}
                className="flex w-full cursor-pointer items-center justify-between px-4 py-3.5 text-left"
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart className="size-4 text-foreground" strokeWidth={2} />
                  <span className="text-sm font-semibold">
                    {summaryOpen ? "Hide" : "Show"} order summary
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-muted-foreground transition-transform duration-200 ${summaryOpen ? "rotate-180" : ""}`}
                  />
                </div>
                <Price amount={total} size="md" className="!font-bold" />
              </button>
              {summaryOpen && (
                <div className="px-4 pb-4 border-t border-border">
                  <div className="pt-3.5">
                    <OrderSummaryContent />
                  </div>
                </div>
              )}
            </div>

            {/* Desktop panel — 20px heading */}
            <div className="hidden rounded-2xl border border-border/80 bg-card p-6 lg:block">
              <h2 className="text-xl font-bold tracking-tight">Order summary</h2>
              <div className="mt-4">
                <OrderSummaryContent />
              </div>
            </div>

            {/* Trust badges */}
            <div className="hidden grid-cols-3 gap-3 rounded-2xl border border-border/80 bg-card p-4 lg:grid">
              {[
                { icon: ShieldCheck, label: "Secure" },
                { icon: RotateCcw, label: "7-Day Return" },
                { icon: KeyRound, label: "Encrypted" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                  <Icon className="size-[18px] text-foreground" strokeWidth={2} />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <div className="hidden items-center gap-3 rounded-2xl border border-border/70 bg-secondary/50 p-4 lg:flex">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background text-foreground">
                <Headphones className="size-[18px]" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Need assistance?</p>
                <p className="text-[13px] text-muted-foreground">Concierge: +880 1999-000000</p>
              </div>
            </div>
          </aside>

          {/* ══════════ LEFT — Form Sections ══════════ */}
          <div className="flex flex-col gap-4 lg:col-span-7 lg:gap-5">

            {/* Customer Information */}
            <section className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 lg:p-7">
              <SectionHead icon={UserIcon} title="Customer information" />
              <div className="mt-4 grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:mt-5 lg:gap-4">
                <div className="md:col-span-2">
                  <FormField label="Full Name" required placeholder="e.g. Sabbir Hassan" value={form.name} onChange={set("name")} />
                </div>
                <FormField label="Phone Number" required type="tel" placeholder="+880 1XXX-XXXXXX" value={form.phone} onChange={set("phone")} />
                <FormField label="Email" required type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} autoComplete="email" />
              </div>
            </section>

            {/* Shipping Address */}
            <section className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 lg:p-7">
              <SectionHead icon={MapPin} title="Shipping address" />
              <div className="mt-4 grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:mt-5 lg:gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Division <span className="text-accent">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.division}
                      onChange={(e) => {
                        const v = e.target.value;
                        setForm((f) => ({ ...f, division: v, district: "" }));
                      }}
                      required
                      className="input-soft h-10 w-full cursor-pointer appearance-none rounded-lg border border-border bg-background pl-3.5 pr-9 text-sm font-medium outline-none lg:h-11"
                    >
                      <option value="">Select Division</option>
                      {BD_DIVISIONS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    District <span className="text-accent">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.district}
                      onChange={(e) => set("district")(e.target.value)}
                      required
                      className="input-soft h-10 w-full cursor-pointer appearance-none rounded-lg border border-border bg-background pl-3.5 pr-9 text-sm font-medium outline-none lg:h-11"
                    >
                      <option value="">Select District</option>
                      {BD_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Full address <span className="text-accent">*</span>
                  </label>
                  <textarea
                    value={form.address}
                    onChange={e => set("address")(e.target.value)}
                    placeholder="House no, Street name, Area"
                    rows={3}
                    required
                    className="input-soft w-full resize-none rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Order notes <span className="text-[11px] font-normal normal-case text-muted-foreground">(optional)</span>
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={e => set("notes")(e.target.value)}
                    placeholder="Special instructions, landmark, preferred time..."
                    rows={2}
                    className="input-soft w-full resize-none rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none"
                  />
                </div>
              </div>
            </section>

            {/* Delivery Area */}
            <section className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 lg:p-7">
              <SectionHead icon={Truck} title="Delivery area" />
              <div className="mt-4 flex flex-col gap-2 lg:mt-5 lg:gap-2.5">
                {DELIVERY_AREAS.map(area => {
                  const selected = deliveryArea === area.id;
                  return (
                    <label
                      key={area.id}
                      className={`flex cursor-pointer select-none items-center gap-3 rounded-lg border px-3.5 py-3 transition-colors lg:gap-4 lg:rounded-xl lg:px-4 lg:py-3.5 ${
                        selected ? "border-foreground bg-secondary" : "border-border bg-background hover:border-foreground/35"
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryArea"
                        value={area.id}
                        checked={selected}
                        onChange={() => setDeliveryArea(area.id as "inside" | "outside")}
                        className="sr-only"
                      />
                      <div className={`flex size-[18px] shrink-0 items-center justify-center rounded border-2 transition-all ${
                        selected ? "border-foreground bg-foreground" : "border-border"
                      }`}>
                        {selected && <Check size={10} className="text-background" strokeWidth={3} />}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <span className="text-sm font-semibold text-foreground lg:text-[15px]">{area.label}</span>
                        <span className="hidden text-[13px] text-muted-foreground sm:block">{area.sub}</span>
                      </div>
                      <Price
                        amount={area.price}
                        size="sm"
                        tone="inherit"
                        className="text-accent !font-bold lg:!text-base"
                        symbolClassName="lg:!text-[0.78rem]"
                      />
                    </label>
                  );
                })}
              </div>
            </section>

            {/* Payment Method */}
            <section className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 lg:p-7">
              <SectionHead icon={CreditCard} title="Payment method" />
              <div className="mt-4 flex flex-col gap-2 lg:mt-5 lg:gap-2.5">
                {PAYMENT_METHODS.map(m => {
                  const Icon = m.icon;
                  const sel  = pay === m.id;
                  return (
                    <label
                      key={m.id}
                      className={`flex cursor-pointer select-none items-center gap-3.5 rounded-lg border p-3.5 transition-all lg:gap-4 lg:rounded-xl lg:p-4 ${
                        sel ? "border-foreground bg-secondary" : "border-border bg-background hover:border-foreground/35"
                      }`}
                    >
                      <input type="radio" name="pay" checked={sel} onChange={() => setPay(m.id)} className="sr-only" />
                      <div className={`flex size-[18px] shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                        sel ? "border-foreground bg-foreground" : "border-border"
                      }`}>
                        {sel && <div className="size-1.5 rounded-full bg-background" />}
                      </div>
                      <span className="flex-1 text-sm font-semibold lg:text-[15px]">{m.label}</span>
                      <Icon className="size-4 text-muted-foreground lg:size-[18px]" />
                    </label>
                  );
                })}
              </div>
              {pay === "bkash" && (
                <p className="mt-3 rounded-lg border border-accent/25 bg-accent/5 px-3.5 py-2.5 text-[13px] leading-relaxed text-foreground lg:mt-4 lg:rounded-xl lg:px-4 lg:py-3">
                  After placing your order, send payment to <strong>01XXXXXXXXX</strong> (bKash) with your order ID in the reference.
                </p>
              )}
              {pay === "nagad" && (
                <p className="mt-3 rounded-lg border border-accent/25 bg-accent/5 px-3.5 py-2.5 text-[13px] leading-relaxed text-foreground lg:mt-4 lg:rounded-xl lg:px-4 lg:py-3">
                  After placing your order, send payment to <strong>01XXXXXXXXX</strong> (Nagad) with your order ID in the reference.
                </p>
              )}
            </section>

            {/* Terms + desktop CTA */}
            <div className="hidden md:block space-y-4 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 lg:space-y-5 lg:p-7">
              <label className="flex cursor-pointer select-none items-start gap-3">
                <div
                  onClick={() => setAgreed(a => !a)}
                  className={`mt-0.5 flex size-[18px] shrink-0 cursor-pointer items-center justify-center rounded-md border-2 transition-all ${
                    agreed ? "border-foreground bg-foreground" : "border-border hover:border-foreground"
                  }`}
                >
                  {agreed && <Check size={10} className="text-background" strokeWidth={3} />}
                </div>
                <span className="text-[13px] leading-relaxed text-muted-foreground lg:text-sm">
                  I agree with the{" "}
                  <a href="#" className="font-semibold text-accent hover:underline">Terms &amp; Conditions.</a>
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting || !agreed}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-foreground text-sm font-semibold text-background transition hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 lg:h-12"
              >
                {submitting ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />
                    Placing order...
                  </>
                ) : (
                  <>
                    <Lock className="size-4" strokeWidth={2.25} />
                    Place order
                  </>
                )}
              </button>

            </div>
          </div>
        </form>
      </div>

      {/* ── Mobile sticky bottom bar ─────────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-border bg-background/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-12px_40px_-16px_rgba(0,0,0,0.1)] backdrop-blur-md supports-[backdrop-filter]:bg-background/90">
        <label className="flex items-center gap-2.5 mb-2.5 cursor-pointer select-none">
          <div
            onClick={() => setAgreed(a => !a)}
            className={`w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
              agreed ? "bg-foreground border-foreground" : "border-border"
            }`}
          >
            {agreed && <Check size={10} className="text-background" strokeWidth={3} />}
          </div>
          <span className="text-[12px] leading-snug text-muted-foreground">
            I agree with the{" "}
            <a href="#" className="text-accent font-semibold">Terms &amp; Conditions.</a>
          </span>
        </label>
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-muted-foreground">Total to pay</span>
            <Price amount={total} size="md" className="!font-bold" />
          </div>
          <button
            type="submit"
            form="checkout-form"
            disabled={submitting || !agreed}
            className="flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-foreground text-sm font-semibold text-background transition hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? (
              <><span className="w-4 h-4 rounded-full border-2 border-background/30 border-t-background animate-spin" /> Placing...</>
            ) : (
              <><Lock size={15} /> Place Order</>
            )}
          </button>
        </div>
      </div>
    </Layout>
  );
}

/* ── Small reusable components ─────────────────────────────────────── */
/* Section heading: 18px mobile / 20px desktop. Compact, Amazon-style. */
function SectionHead({
  icon: Icon, title,
}: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground lg:size-9 lg:rounded-xl">
        <Icon className="size-4 text-foreground lg:size-[18px]" strokeWidth={2} />
      </span>
      <h2 className="text-lg font-bold tracking-tight lg:text-xl">
        {title}
      </h2>
    </div>
  );
}

/* Form field: 12px label, 14px input, h-10 mobile / h-11 desktop. */
function FormField({
  label, placeholder, value, onChange, type = "text", required, autoComplete,
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; type?: string; required?: boolean; autoComplete?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}{required && <span className="ml-1 text-accent">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="input-soft h-10 w-full rounded-lg border border-border bg-background px-3.5 text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none lg:h-11"
      />
    </div>
  );
}

export default CheckoutPage;
