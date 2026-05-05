import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { useState } from "react";
import { Check } from "lucide-react";

export const Route = createFileRoute("/checkout")({ component: CheckoutPage });

function CheckoutPage() {
  const [pay, setPay] = useState("cod");

  return (
    <Layout hideTrust>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Checkout</h1>
        <p className="text-sm text-muted-foreground mt-1">Guest checkout · <Link to="/login" className="text-accent">Sign in for faster checkout</Link></p>

        <div className="mt-8 grid lg:grid-cols-3 gap-8">
          <form className="lg:col-span-2 space-y-8">
            <Section title="Contact">
              <Field label="Full name" placeholder="Your name" />
              <Field label="Phone number" placeholder="+880 1XXX XXXXXX" />
              <Field label="Email (optional)" placeholder="you@email.com" />
            </Section>
            <Section title="Shipping address">
              <Field label="Address" placeholder="House / Road / Area" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="City" placeholder="Dhaka" />
                <Field label="Postcode" placeholder="1207" />
              </div>
            </Section>
            <Section title="Payment">
              {[
                { id: "cod", t: "Cash on Delivery", s: "Pay when you receive" },
                { id: "bkash", t: "bKash", s: "Mobile financial service" },
                { id: "nagad", t: "Nagad", s: "Mobile financial service" },
                { id: "card", t: "Card · SSLCommerz", s: "Visa / Mastercard / Amex" },
              ].map((m) => (
                <label key={m.id} className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer ${pay === m.id ? "border-foreground" : ""}`}>
                  <input type="radio" name="pay" checked={pay === m.id} onChange={() => setPay(m.id)} className="accent-[oklch(0.62_0.24_25)]" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{m.t}</p>
                    <p className="text-xs text-muted-foreground">{m.s}</p>
                  </div>
                </label>
              ))}
            </Section>
          </form>

          <aside className="rounded-2xl border p-6 h-fit lg:sticky lg:top-32">
            <p className="font-medium mb-4">Summary</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>৳12,800</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>Free</span></div>
            </div>
            <div className="border-t my-4" />
            <div className="flex justify-between font-semibold"><span>Total</span><span>৳12,800</span></div>
            <Link to="/order/$id" params={{ id: "BD-2026-00421" }} className="mt-5 block text-center h-12 leading-[3rem] rounded-full bg-accent text-accent-foreground text-sm font-medium">Place order</Link>
            <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5"><Check className="size-3.5" /> Secure checkout · 7-day returns</p>
          </aside>
        </div>
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
function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input placeholder={placeholder} className="mt-1 w-full h-11 px-4 rounded-xl border border-border bg-card text-sm outline-none focus:border-foreground" />
    </label>
  );
}