import { Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";

const items = [
  { icon: Truck, title: "Nationwide delivery", desc: "1–3 days across Bangladesh" },
  { icon: ShieldCheck, title: "Secure checkout", desc: "bKash · Nagad · SSLCommerz" },
  { icon: RotateCcw, title: "7-day returns", desc: "Easy refund policy" },
  { icon: Headphones, title: "24/7 support", desc: "We're here to help" },
];

export function TrustStrip() {
  return (
    <section className="border-y bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-center gap-3">
            <span className="size-11 rounded-full bg-card border border-border flex items-center justify-center">
              <Icon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}