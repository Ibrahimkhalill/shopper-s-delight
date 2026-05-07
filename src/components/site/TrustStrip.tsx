import { Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";
import { useT, dict } from "@/lib/i18n";

const items: { icon: any; t: keyof typeof dict; d: keyof typeof dict }[] = [
  { icon: Truck, t: "trust.delivery.title", d: "trust.delivery.desc" },
  { icon: ShieldCheck, t: "trust.secure.title", d: "trust.secure.desc" },
  { icon: RotateCcw, t: "trust.returns.title", d: "trust.returns.desc" },
  { icon: Headphones, t: "trust.support.title", d: "trust.support.desc" },
];

export function TrustStrip() {
  const { t, lang } = useT();
  return (
    <section className="border-y bg-secondary/50">
      <div className={`mx-auto max-w-7xl px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 ${lang === "bn" ? "font-bn" : ""}`}>
        {items.map(({ icon: Icon, t: tk, d }) => (
          <div key={tk} className="flex items-center gap-3">
            <span className="size-11 rounded-full bg-card border border-border flex items-center justify-center">
              <Icon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-medium">{t(tk)}</p>
              <p className="text-xs text-muted-foreground">{t(d)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
