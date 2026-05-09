import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { PageHeader } from "@/components/site/PageHeader";
import { useState, useEffect } from "react";
import {
  Lock, Truck, CreditCard, Wallet, Banknote, Smartphone,
  ShieldCheck, MapPin, User as UserIcon, MessageSquare, Check,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

function useCountdown(seconds: number) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) return;
    const t = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [left]);
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return { left, mm, ss };
}

export const Route = createFileRoute("/checkout")({ component: CheckoutPage });

const BD_DIVISIONS = [
  "Dhaka", "Chattogram", "Rajshahi", "Khulna",
  "Barishal", "Sylhet", "Rangpur", "Mymensingh",
];

const THANAS: Record<string, string[]> = {
  Dhaka: ["Dhanmondi", "Gulshan", "Mirpur", "Mohammadpur", "Motijheel", "Uttara", "Banani", "Badda", "Khilgaon", "Lalbagh"],
  Chattogram: ["Agrabad", "Halishahar", "Khulshi", "Kotwali", "Pahartali", "Panchlaish", "Chandgaon"],
  Rajshahi: ["Boalia", "Motihar", "Rajpara", "Shah Makhdum"],
  Khulna: ["Daulatpur", "Khalishpur", "Khan Jahan Ali", "Kotwali", "Sonadanga"],
  Barishal: ["Bandhar", "Barisal Sadar", "Char Aitala"],
  Sylhet: ["Balaganj", "Jalalabad", "Kotwali", "Moglabazar", "Shah Poran"],
  Rangpur: ["Kaunia", "Mithapukur", "Pirganj", "Rangpur Sadar"],
  Mymensingh: ["Bhaluka", "Gaffargaon", "Mymensingh Sadar", "Trishal"],
};

function CheckoutPage() {
  const { cart, resolveProduct, cartSubtotal, placeOrder, user } = useStore();
  const navigate = useNavigate();
  const [pay, setPay] = useState("cod");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.name?.split(" ")[0] ?? "",
    lastName: user?.name?.split(" ").slice(1).join(" ") ?? "",
    phone: user?.phone ?? "",
    altPhone: "",
    email: user?.email ?? "",
    division: "Dhaka",
    thana: "Dhanmondi",
    area: "",
    address: "",
    postcode: "1207",
    notes: "",
  });

  const set = (k: keyof typeof form) => (v: string) => {
    if (k === "division") {
      const thanas = THANAS[v] ?? [];
      setForm((f) => ({ ...f, division: v, thana: thanas[0] ?? "" }));
    } else {
      setForm((f) => ({ ...f, [k]: v }));
    }
  };

  const shipping = cartSubtotal > 1500 ? 0 : 80;
  const total = cartSubtotal + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) { toast.error("Your cart is empty"); return; }
    if (!form.firstName || !form.phone || !form.address) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const fullName = `${form.firstName} ${form.lastName}`.trim();
      const fullAddress = `${form.address}, ${form.thana}, ${form.division} ${form.postcode}`;
      const order = placeOrder({ payment: pay, address: fullAddress, name: fullName, phone: form.phone });
      toast.success("Order placed!", { description: `Order ID: ${order.id}` });
      navigate({ to: "/order/$id", params: { id: order.id } });
    }, 800);
  };

  if (cart.length === 0) {
    return (
      <Layout hideTrust>
        <div className="mx-auto max-w-md text-center py-24 px-4">
          <h1 className="text-2xl font-semibold">Nothing to checkout</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your cart is empty.</p>
          <Link to="/" className="inline-block mt-6 h-11 px-6 rounded-full bg-foreground text-background text-sm font-medium leading-[2.75rem]">Browse products</Link>
        </div>
      </Layout>
    );
  }

  const payments = [
    { id: "cod",   label: "Cash on Delivery", sub: "Pay when you receive",    icon: Banknote,    color: "bg-emerald-50 text-emerald-600" },
    { id: "bkash", label: "bKash",             sub: "Mobile payment",          icon: Smartphone,  color: "bg-pink-50 text-pink-600" },
    { id: "nagad", label: "Nagad",             sub: "Mobile payment",          icon: Wallet,      color: "bg-orange-50 text-orange-600" },
    { id: "card",  label: "Card",              sub: "Visa / Mastercard / Amex", icon: CreditCard,  color: "bg-blue-50 text-blue-600" },
  ];

  const thanaList = THANAS[form.division] ?? [];
  const { left, mm, ss } = useCountdown(10 * 60);
  const urgent = left <= 120;

  return (
    <Layout hideTrust>
      <PageHeader
        centered
        title="Check Out"
        subtitle="Review your order details carefully and complete your purchase securely and easily for a smooth shopping experience."
        crumbs={[{ label: "Home", to: "/" }, { label: "Check Out" }]}
      />

      {/* Urgency banner */}
      <div className={`mx-auto max-w-7xl px-4 mt-4 transition-all ${left <= 0 ? "hidden" : ""}`}>
        <div className={`flex items-center gap-3 rounded-2xl border px-5 py-3.5 text-sm transition-colors ${
          urgent
            ? "bg-red-50 border-red-200 text-red-700"
            : "bg-orange-50 border-orange-200 text-orange-700"
        }`}>
          <span className="text-lg shrink-0">{urgent ? "🔥" : "⏳"}</span>
          <span className="flex-1">
            Your cart will expire in{" "}
            <span className={`font-bold tabular-nums ${urgent ? "text-red-600" : "text-orange-600"}`}>
              {mm}:{ss}
            </span>{" "}
            minutes! Please checkout now before your items sell out!
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-7xl px-4 py-6 grid lg:grid-cols-[1fr_380px] gap-6 animate-fade-up">

        {/* ── Left column ── */}
        <div className="space-y-5">

          {/* Contact */}
          <Section icon={UserIcon} title="Contact Information">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="First Name *" value={form.firstName} onChange={set("firstName")} placeholder="Sabbir" />
              <Field label="Last Name" value={form.lastName} onChange={set("lastName")} placeholder="Hassan" />
              <Field label="Phone Number *" type="tel" value={form.phone} onChange={set("phone")} placeholder="01XXXXXXXXX" />
              <Field label="Alt. Phone (optional)" type="tel" value={form.altPhone} onChange={set("altPhone")} placeholder="01XXXXXXXXX" />
              <div className="sm:col-span-2">
                <Field label="Email (optional)" type="email" value={form.email} onChange={set("email")} placeholder="you@email.com" />
              </div>
            </div>
          </Section>

          {/* Delivery Address */}
          <Section icon={MapPin} title="Delivery Address">
            <div className="grid sm:grid-cols-2 gap-3">
              {/* Division */}
              <div>
                <label className="text-xs text-muted-foreground font-medium">Division *</label>
                <select
                  value={form.division}
                  onChange={(e) => set("division")(e.target.value)}
                  className="mt-1 w-full h-11 px-3 rounded-xl border border-border bg-card text-sm outline-none focus:border-foreground transition appearance-none cursor-pointer"
                >
                  {BD_DIVISIONS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>

              {/* Thana */}
              <div>
                <label className="text-xs text-muted-foreground font-medium">Thana / Upazila *</label>
                <select
                  value={form.thana}
                  onChange={(e) => set("thana")(e.target.value)}
                  className="mt-1 w-full h-11 px-3 rounded-xl border border-border bg-card text-sm outline-none focus:border-foreground transition appearance-none cursor-pointer"
                >
                  {thanaList.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>

              <Field label="Area / Neighbourhood" value={form.area} onChange={set("area")} placeholder="e.g. Kalabagan, Banani Block-C" />
              <Field label="Postal Code" value={form.postcode} onChange={set("postcode")} placeholder="1207" />

              <div className="sm:col-span-2">
                <Field label="House / Road / Building *" value={form.address} onChange={set("address")} placeholder="e.g. House 12, Road 4, Block B" />
              </div>
            </div>

            <div className="mt-3 rounded-xl bg-accent/5 border border-accent/20 p-3 flex items-center gap-3 text-sm">
              <Truck className="size-4 text-accent shrink-0" />
              <span className="text-muted-foreground">Delivery within <span className="font-semibold text-foreground">1–3 business days</span> across Bangladesh</span>
            </div>
          </Section>

          {/* Notes */}
          <Section icon={MessageSquare} title="Order Notes (optional)">
            <textarea
              value={form.notes}
              onChange={(e) => set("notes")(e.target.value)}
              placeholder="Special instructions, landmark, preferred delivery time..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm outline-none focus:border-foreground transition resize-none"
            />
          </Section>

          {/* Payment */}
          <Section icon={CreditCard} title="Payment Method">
            <div className="grid grid-cols-2 gap-3">
              {payments.map((m) => {
                const Icon = m.icon;
                const sel = pay === m.id;
                return (
                  <label
                    key={m.id}
                    className={`relative flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition select-none ${
                      sel ? "border-foreground ring-2 ring-foreground/10 bg-secondary/40" : "hover:border-foreground/30 hover:bg-secondary/20"
                    }`}
                  >
                    <input type="radio" name="pay" checked={sel} onChange={() => setPay(m.id)} className="sr-only" />
                    <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${m.color}`}>
                      <Icon className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{m.label}</p>
                      <p className="text-xs text-muted-foreground">{m.sub}</p>
                    </div>
                    {sel && (
                      <span className="absolute top-2.5 right-2.5 size-4 rounded-full bg-foreground flex items-center justify-center">
                        <Check className="size-2.5 text-background" />
                      </span>
                    )}
                  </label>
                );
              })}
            </div>

            {pay === "bkash" && (
              <div className="mt-3 rounded-xl bg-pink-50 border border-pink-200 p-3 text-xs text-pink-700">
                After placing order, send payment to <span className="font-bold">01XXXXXXXXX</span> (bKash) and mention your Order ID as reference.
              </div>
            )}
            {pay === "nagad" && (
              <div className="mt-3 rounded-xl bg-orange-50 border border-orange-200 p-3 text-xs text-orange-700">
                After placing order, send payment to <span className="font-bold">01XXXXXXXXX</span> (Nagad) and mention your Order ID as reference.
              </div>
            )}
          </Section>
        </div>

        {/* ── Right: Order summary ── */}
        <aside className="lg:sticky lg:top-28 h-fit space-y-4">
          <div className="rounded-2xl border bg-card p-5">
            <p className="font-semibold mb-4 text-base">Order Summary</p>

            <div className="space-y-3 max-h-64 overflow-auto pr-1">
              {cart.map((it) => {
                const p = resolveProduct(it.id);
                if (!p) return null;
                return (
                  <div key={it.id + (it.size ?? "")} className="flex gap-3">
                    <div className="relative shrink-0">
                      <img src={p.image} className="size-14 rounded-xl object-cover border" alt="" />
                      <span className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">{it.qty}</span>
                    </div>
                    <div className="flex-1 min-w-0 py-0.5">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      {it.size && <p className="text-xs text-muted-foreground">Size: {it.size}</p>}
                      <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">৳{p.price.toLocaleString()} × {it.qty}</p>
                    </div>
                    <p className="text-sm font-semibold tabular-nums whitespace-nowrap pt-0.5">৳{(p.price * it.qty).toLocaleString()}</p>
                  </div>
                );
              })}
            </div>

            <div className="border-t my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">৳{cartSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className={shipping === 0 ? "text-emerald-600 font-medium" : "tabular-nums"}>
                  {shipping === 0 ? "Free 🎉" : `৳${shipping}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT</span>
                <span className="text-muted-foreground">Included</span>
              </div>
            </div>

            <div className="border-t my-4" />
            <div className="flex justify-between items-baseline">
              <span className="font-bold text-base">Total</span>
              <span className="text-2xl font-bold tabular-nums">৳{total.toLocaleString()}</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-5 w-full h-13 rounded-2xl bg-accent text-accent-foreground text-sm font-bold hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-sm"
            >
              {submitting ? (
                <>
                  <span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Placing order...
                </>
              ) : (
                <>
                  <Lock className="size-4" />
                  Place Order · ৳{total.toLocaleString()}
                </>
              )}
            </button>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                { icon: ShieldCheck, label: "Secure" },
                { icon: Truck, label: "Fast delivery" },
                { icon: Check, label: "7-day return" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 text-[10px] text-muted-foreground">
                  <Icon className="size-4" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          <Link to="/cart" className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground transition">
            ← Edit cart
          </Link>
        </aside>
      </form>
    </Layout>
  );
}

function Section({ icon: Icon, title, children }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="size-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <p className="font-semibold">{title}</p>
      </div>
      {children}
    </div>
  );
}

function Field({ label, placeholder, value, onChange, type = "text" }: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full h-11 px-4 rounded-xl border border-border bg-card text-sm outline-none focus:border-foreground transition"
      />
    </label>
  );
}
