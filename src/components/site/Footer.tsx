import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { useT, dict } from "@/lib/i18n";

export function Footer() {
  const { t, lang } = useT();
  const cols: { title: keyof typeof dict; links: (keyof typeof dict)[] }[] = [
    { title: "footer.shop", links: ["footer.l.gadgets", "footer.l.fashion", "footer.l.home", "footer.l.beauty", "footer.l.grocery"] },
    { title: "footer.help", links: ["footer.l.track", "footer.l.shipping", "footer.l.returns", "footer.l.faq", "footer.l.contact"] },
    { title: "footer.company", links: ["footer.l.about", "footer.l.careers", "footer.l.press", "footer.l.blog"] },
  ];
  const socials = [
    { Icon: Facebook, label: "Facebook" },
    { Icon: Instagram, label: "Instagram" },
    { Icon: Twitter, label: "Twitter" },
    { Icon: Youtube, label: "YouTube" },
  ];
  return (
    <footer className={`bg-black text-white ${lang === "bn" ? "font-bn" : ""}`}>
      <div className="mx-auto max-w-7xl px-4 py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2">
          <div className="flex items-baseline gap-0.5">
            <span className="text-2xl font-semibold">SHOP</span>
            <span className="text-2xl font-semibold text-[oklch(0.62_0.24_25)]">.BD</span>
          </div>
          <p className="mt-4 text-sm text-white/60 max-w-xs">{t("footer.tagline")}</p>
          <p className="mt-6 text-sm font-bn text-white/70">{t("footer.bn_tagline")}</p>
          <div className="mt-6 flex items-center gap-2">
            {socials.map(({ Icon, label }) => (
              <a key={label} href="#" aria-label={label} className="size-9 rounded-full border border-white/15 flex items-center justify-center hover:bg-accent hover:border-accent transition">
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="text-sm font-semibold mb-4">{t(c.title)}</p>
            <ul className="space-y-2.5 text-sm text-white/60">
              {c.links.map((l) => <li key={l}><a href="#" className="hover:text-white">{t(l)}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-5 flex flex-col sm:flex-row gap-2 items-center justify-between text-xs text-white/50">
          <span>{t("footer.copyright")}</span>
          <span>{t("footer.made")}</span>
        </div>
      </div>
    </footer>
  );
}
