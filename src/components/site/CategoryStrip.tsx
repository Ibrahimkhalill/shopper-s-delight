import { Smartphone, Shirt, Home, Sparkles, ShoppingBasket, Tag } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useT, dict } from "@/lib/i18n";

const cats: { key: keyof typeof dict; slug: string; icon: any; bg: string; fg: string }[] = [
  { key: "cat.gadgets",  slug: "gadgets",  icon: Smartphone,    bg: "bg-blue-50",    fg: "text-blue-600" },
  { key: "cat.fashion",  slug: "fashion",  icon: Shirt,         bg: "bg-pink-50",    fg: "text-pink-600" },
  { key: "cat.home",     slug: "home",     icon: Home,          bg: "bg-amber-50",   fg: "text-amber-600" },
  { key: "cat.beauty",   slug: "beauty",   icon: Sparkles,      bg: "bg-purple-50",  fg: "text-purple-600" },
  { key: "cat.grocery",  slug: "grocery",  icon: ShoppingBasket,bg: "bg-green-50",   fg: "text-green-600" },
  { key: "cat.deals",    slug: "deals",    icon: Tag,           bg: "bg-accent/10",  fg: "text-accent" },
];

export function CategoryStrip() {
  const { t, lang } = useT();
  return (
    <section className="mx-auto max-w-7xl px-4 pt-8 sm:pt-10">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
        {cats.map(({ key, slug, icon: Icon, bg, fg }) => (
          <Link
            key={slug}
            to="/category/$slug"
            params={{ slug }}
            className="group flex flex-col items-center justify-center gap-2 sm:gap-3 rounded-2xl border border-border bg-card py-4 sm:py-6 transition hover:border-foreground hover:shadow-sm hover-lift"
          >
            <span className={`size-10 sm:size-12 rounded-full ${bg} flex items-center justify-center transition group-hover:scale-110`}>
              <Icon className={`size-4 sm:size-5 ${fg}`} />
            </span>
            <span className={`text-[11px] sm:text-sm font-medium text-center leading-tight ${lang === "bn" ? "font-bn" : ""}`}>
              {t(key)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
