import { Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";
import { useT, dict } from "@/lib/i18n";

const items: { icon: any; t: keyof typeof dict; d: keyof typeof dict; bg: string; fg: string }[] = [
  { icon: Truck,        t: "trust.delivery.title", d: "trust.delivery.desc", bg: "bg-blue-50",   fg: "text-blue-600" },
  { icon: ShieldCheck,  t: "trust.secure.title",   d: "trust.secure.desc",   bg: "bg-green-50",  fg: "text-green-600" },
  { icon: RotateCcw,    t: "trust.returns.title",  d: "trust.returns.desc",  bg: "bg-amber-50",  fg: "text-amber-600" },
  { icon: Headphones,   t: "trust.support.title",  d: "trust.support.desc",  bg: "bg-purple-50", fg: "text-purple-600" },
];

export function TrustStrip() {
  const { t, lang } = useT();
  return (
    <section className="border-y bg-secondary/30">
      <div className={`mx-auto max-w-7xl px-4 py-5 sm:py-8 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 ${lang === "bn" ? "font-bn" : ""}`}>
        {items.map(({ icon: Icon, t: tk, d, bg, fg }) => (
          <div key={tk} className="flex items-center gap-3">
            <span className={`size-9 sm:size-11 rounded-full ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`size-4 sm:size-5 ${fg}`} />
            </span>
            <div>
              <p className="text-[12px] sm:text-sm font-semibold">{t(tk)}</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-tight">{t(d)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
