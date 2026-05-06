import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { useState } from "react";
import { Check, Lock } from "lucide-react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({ component: CheckoutPage });

function CheckoutPage() {
  const { cart, resolveProduct, cartSubtotal, placeOrder, user } = useStore();
  const navigate = useNavigate();
  const [pay, setPay] = useState("cod");
  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    email: user?.email ?? "",
    address: "",
    city: "Dhaka",
    postcode: "1207",
  });
  const [submitting, setSubmitting] = useState(false);

  const shipping = cartSubtotal > 1500 ? 0 : 80;
  const total = cartSubtotal + shipping;

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
    }, 600);
  };

  if (cart.length === 0) {
    return (
      <Layout hideTrust>
        <div className="mx-auto max-w-md text-center py-20 px-4">
          <h1 className="text-2xl font-semibold">Nothing to checkout</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your cart is empty.</p>
          <Link to="/" className="inline-block mt-6 h-11 px-6 rounded-full bg-foreground text-background text-sm font-medium leading-[2.75rem]">Browse products</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideTrust>
      <div className="mx-auto max-w-6xl px-4 py-10 animate-fade-up">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Checkout</h1>
        <p className="text-sm text-muted-foreground mt-1">{user ? `Signed in as ${user.name}` : <>Guest checkout · <Link to="/login" className="text-accent">Sign in for faster checkout</Link></>}</p>

        <form onSubmit={handleSubmit} className="mt-8 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Section title="Contact">
              <Field label="Full name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Your name" />
              <Field label="Phone number *" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+880 1XXX XXXXXX" />
              <Field label="Email (optional)" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="you@email.com" />
            </Section>
            <Section title="Shipping address">
              <Field label="Address *" value={form.address} onChange={(v) => setForm({ ...form, address: v })} placeholder="House / Road / Area" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} placeholder="Dhaka" />
                <Field label="Postcode" value={form.postcode} onChange={(v) => setForm({ ...form, postcode: v })} placeholder="1207" />
              </div>
            </Section>
            <Section title="Payment method">
              {[
                { id: "cod", t: "Cash on Delivery", s: "Pay when you receive" },
                { id: "bkash", t: "bKash", s: "Mobile financial service" },
                { id: "nagad", t: "Nagad", s: "Mobile financial service" },
                { id: "card", t: "Card · SSLCommerz", s: "Visa / Mastercard / Amex" },
              ].map((m) => (
                <label key={m.id} className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition ${pay === m.id ? "border-foreground bg-secondary/50" : "hover:border-foreground/40"}`}>
                  <input type="radio" name="pay" checked={pay === m.id} onChange={() => setPay(m.id)} className="accent-[oklch(0.62_0.24_25)]" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{m.t}</p>
                    <p className="text-xs text-muted-foreground">{m.s}</p>
                  </div>
                  {pay === m.id && <Check className="size-4 text-accent" />}
                </label>
              ))}
            </Section>
          </div>

          <aside className="rounded-2xl border p-6 h-fit lg:sticky lg:top-32">
            <p className="font-medium mb-4">Summary</p>
            <div className="space-y-3 max-h-64 overflow-auto pr-1">
              {cart.map((it) => {
                const p = resolveProduct(it.id);
                if (!p) return null;
                return (
                  <div key={it.id + (it.size ?? "")} className="flex gap-3 text-sm">
                    <img src={p.image} className="size-12 rounded-lg object-cover shrink-0" alt="" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">Qty {it.qty}</p>
                    </div>
                    <span className="tabular-nums">৳{(p.price * it.qty).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
            <div className="border-t my-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums">৳{cartSubtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : `৳${shipping}`}</span></div>
            </div>
            <div className="border-t my-4" />
            <div className="flex justify-between font-semibold text-base"><span>Total</span><span className="tabular-nums">৳{total.toLocaleString()}</span></div>
            <button type="submit" disabled={submitting} className="mt-5 block w-full text-center h-12 leading-[3rem] rounded-full bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60">
              {submitting ? "Placing order..." : "Place order"}
            </button>
            <p className="mt-3 text-xs text-muted-foreground flex items-center justify-center gap-1.5"><Lock className="size-3.5" /> Secure checkout · 7-day returns</p>
          </aside>
        </form>
      </div>
    </Layout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-6 space-y-3">
      <p className="font-medium">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
function Field({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-1 w-full h-11 px-4 rounded-xl border border-border bg-card text-sm outline-none focus:border-foreground transition" />
    </label>
  );
}
