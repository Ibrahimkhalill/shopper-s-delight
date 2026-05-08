import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { useState } from "react";
import { Check, Lock, Truck, CreditCard, Wallet, Banknote, Smartphone, ChevronRight, MapPin, User as UserIcon, ShieldCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({ component: CheckoutPage });

const steps = ["Contact", "Shipping", "Payment"] as const;

function CheckoutPage() {
  const { cart, resolveProduct, cartSubtotal, placeOrder, user } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [pay, setPay] = useState("cod");
  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    email: user?.email ?? "",
    address: "",
    city: "Dhaka",
    postcode: "1207",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const shipping = cartSubtotal > 1500 ? 0 : 80;
  const total = cartSubtotal + shipping;

  const next = () => {
    if (step === 0 && (!form.name || !form.phone)) { toast.error("Please add your contact details"); return; }
    if (step === 1 && !form.address) { toast.error("Please add a delivery address"); return; }
    setStep((s) => Math.min(2, s + 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) { toast.error("Your cart is empty"); return; }
    if (!form.name || !form.phone || !form.address) { toast.error("Please fill required fields"); return; }
    setSubmitting(true);
    setTimeout(() => {
      const order = placeOrder({
        payment: pay,
        address: `${form.address}, ${form.city} ${form.postcode}`,
        name: form.name,
        phone: form.phone,
      });
      toast.success("Order placed!", { description: `Order ${order.id}` });
      navigate({ to: "/order/$id", params: { id: order.id } });
    }, 700);
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
    { id: "cod", t: "Cash on Delivery", s: "Pay when you receive", icon: Banknote },
    { id: "bkash", t: "bKash", s: "Mobile financial service", icon: Smartphone },
    { id: "nagad", t: "Nagad", s: "Mobile financial service", icon: Wallet },
    { id: "card", t: "Card · SSLCommerz", s: "Visa / Mastercard / Amex", icon: CreditCard },
  ];

  return (
    <Layout hideTrust>
      {/* Progress header */}
      <section className="border-b bg-gradient-to-b from-secondary/40 to-background">
        <div className="mx-auto max-w-7xl px-4 py-8 animate-fade-up">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Step {step + 1} of 3</p>
          <h1 className="mt-1 text-3xl md:text-4xl font-semibold tracking-tight">Checkout</h1>
          <p className="text-sm text-muted-foreground mt-1">{user ? `Signed in as ${user.name}` : <>Guest checkout · <Link to="/login" className="text-accent hover:underline">Sign in for faster checkout</Link></>}</p>

          {/* Stepper */}
          <ol className="mt-6 flex items-center gap-2 sm:gap-4">
            {steps.map((label, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <li key={label} className="flex items-center gap-2 sm:gap-4 flex-1">
                  <button onClick={() => setStep(i)} className="flex items-center gap-2 sm:gap-3 group min-w-0">
                    <span className={`size-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition ${done ? "bg-accent text-accent-foreground" : active ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"}`}>
                      {done ? <Check className="size-4" /> : i + 1}
                    </span>
                    <span className={`text-sm truncate ${active ? "font-medium text-foreground" : "text-muted-foreground"}`}>{label}</span>
                  </button>
                  {i < steps.length - 1 && <span className={`hidden sm:block flex-1 h-px ${i < step ? "bg-accent" : "bg-border"}`} />}
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="mx-auto max-w-7xl px-4 py-8 grid lg:grid-cols-[1fr_400px] gap-8 animate-fade-up">
        <div className="space-y-6">
          {/* Step 0 — Contact */}
          <div className={`rounded-2xl border bg-card p-6 transition ${step === 0 ? "" : "opacity-60"}`}>
            <header className="flex items-center gap-3 mb-5">
              <div className="size-9 rounded-full bg-secondary flex items-center justify-center"><UserIcon className="size-4" /></div>
              <div className="flex-1"><p className="font-semibold">Contact details</p><p className="text-xs text-muted-foreground">We'll text order updates</p></div>
              {step > 0 && <button type="button" onClick={() => setStep(0)} className="text-xs text-accent">Edit</button>}
            </header>
            {step === 0 ? (
              <div className="space-y-3">
                <Field label="Full name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Your name" />
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Phone number *" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+880 1XXX XXXXXX" />
                  <Field label="Email (optional)" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="you@email.com" />
                </div>
                <button type="button" onClick={next} className="mt-2 inline-flex items-center gap-2 h-11 px-6 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90">
                  Continue to shipping <ChevronRight className="size-4" />
                </button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{form.name} · {form.phone}{form.email ? ` · ${form.email}` : ""}</p>
            )}
          </div>

          {/* Step 1 — Shipping */}
          <div className={`rounded-2xl border bg-card p-6 transition ${step === 1 ? "" : "opacity-60"}`}>
            <header className="flex items-center gap-3 mb-5">
              <div className="size-9 rounded-full bg-secondary flex items-center justify-center"><MapPin className="size-4" /></div>
              <div className="flex-1"><p className="font-semibold">Delivery address</p><p className="text-xs text-muted-foreground">Where should we deliver?</p></div>
              {step > 1 && <button type="button" onClick={() => setStep(1)} className="text-xs text-accent">Edit</button>}
            </header>
            {step === 1 ? (
              <div className="space-y-3">
                <Field label="Address *" value={form.address} onChange={(v) => setForm({ ...form, address: v })} placeholder="House / Road / Area" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} placeholder="Dhaka" />
                  <Field label="Postcode" value={form.postcode} onChange={(v) => setForm({ ...form, postcode: v })} placeholder="1207" />
                </div>
                <Field label="Delivery notes (optional)" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} placeholder="Landmark, instructions..." />
                <div className="rounded-xl bg-secondary/60 border p-3 flex items-center gap-3 text-sm">
                  <Truck className="size-4 text-accent shrink-0" />
                  <span>Estimated delivery <span className="font-medium text-foreground">1–3 business days</span></span>
                </div>
                <button type="button" onClick={next} className="mt-2 inline-flex items-center gap-2 h-11 px-6 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90">
                  Continue to payment <ChevronRight className="size-4" />
                </button>
              </div>
            ) : step > 1 ? (
              <p className="text-sm text-muted-foreground">{form.address}, {form.city} {form.postcode}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Complete previous step</p>
            )}
          </div>

          {/* Step 2 — Payment */}
          <div className={`rounded-2xl border bg-card p-6 transition ${step === 2 ? "" : "opacity-60"}`}>
            <header className="flex items-center gap-3 mb-5">
              <div className="size-9 rounded-full bg-secondary flex items-center justify-center"><CreditCard className="size-4" /></div>
              <div className="flex-1"><p className="font-semibold">Payment method</p><p className="text-xs text-muted-foreground">Choose how you'd like to pay</p></div>
            </header>
            {step === 2 ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {payments.map((m) => {
                  const Icon = m.icon;
                  const sel = pay === m.id;
                  return (
                    <label key={m.id} className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition ${sel ? "border-foreground bg-secondary/50 ring-1 ring-foreground" : "hover:border-foreground/40"}`}>
                      <input type="radio" name="pay" checked={sel} onChange={() => setPay(m.id)} className="sr-only" />
                      <div className={`size-10 rounded-xl flex items-center justify-center ${sel ? "bg-accent text-accent-foreground" : "bg-secondary"}`}>
                        <Icon className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{m.t}</p>
                        <p className="text-xs text-muted-foreground truncate">{m.s}</p>
                      </div>
                      {sel && <Check className="size-4 text-accent shrink-0" />}
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Complete previous steps</p>
            )}
          </div>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-32 h-fit space-y-4">
          <div className="rounded-2xl border bg-card p-6">
            <p className="font-semibold mb-4">Your order</p>
            <div className="space-y-3 max-h-72 overflow-auto pr-1">
              {cart.map((it) => {
                const p = resolveProduct(it.id);
                if (!p) return null;
                return (
                  <div key={it.id + (it.size ?? "")} className="flex gap-3 text-sm">
                    <div className="relative shrink-0">
                      <img src={p.image} className="size-14 rounded-lg object-cover" alt="" />
                      <span className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-foreground text-background text-[10px] font-semibold flex items-center justify-center">{it.qty}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{p.name}</p>
                      {it.size && <p className="text-xs text-muted-foreground">Size {it.size}</p>}
                    </div>
                    <span className="tabular-nums whitespace-nowrap">৳{(p.price * it.qty).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
            <div className="border-t my-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums">৳{cartSubtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className={shipping === 0 ? "text-accent font-medium" : ""}>{shipping === 0 ? "Free" : `৳${shipping}`}</span></div>
            </div>
            <div className="border-t my-4" />
            <div className="flex justify-between items-baseline">
              <span className="font-semibold">Total</span>
              <span className="text-2xl font-semibold tabular-nums">৳{total.toLocaleString()}</span>
            </div>

            <button type="submit" disabled={submitting || step < 2} className="mt-5 w-full h-12 rounded-full bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2">
              {submitting ? (
                <><span className="size-4 rounded-full border-2 border-accent-foreground/30 border-t-accent-foreground animate-spin" /> Placing order...</>
              ) : step < 2 ? "Complete steps above" : <><Lock className="size-4" /> Place order · ৳{total.toLocaleString()}</>}
            </button>
            <p className="mt-3 text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5"><ShieldCheck className="size-3.5" /> Secure checkout · 7-day returns</p>
          </div>
        </aside>
      </form>
    </Layout>
  );
}

function Field({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-1 w-full h-11 px-4 rounded-xl border bg-background text-sm outline-none focus:border-foreground transition" />
    </label>
  );
}
