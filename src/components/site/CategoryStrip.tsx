import { Smartphone, Shirt, Home, Sparkles, ShoppingBasket, Tag } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useT, dict } from "@/lib/i18n";

const cats: { key: keyof typeof dict; slug: string; icon: any }[] = [
  { key: "cat.gadgets", slug: "gadgets", icon: Smartphone },
  { key: "cat.fashion", slug: "fashion", icon: Shirt },
  { key: "cat.home", slug: "home", icon: Home },
  { key: "cat.beauty", slug: "beauty", icon: Sparkles },
  { key: "cat.grocery", slug: "grocery", icon: ShoppingBasket },
  { key: "cat.deals", slug: "deals", icon: Tag },
];

export function CategoryStrip() {
  const { t, lang } = useT();
  return (
    <section className="mx-auto max-w-7xl px-4 pt-10">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {cats.map(({ key, slug, icon: Icon }) => (
          <Link
            key={slug}
            to="/category/$slug"
            params={{ slug }}
            className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card py-6 transition hover:border-foreground hover-lift"
          >
            <span className="size-12 rounded-full bg-secondary flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition">
              <Icon className="size-5" />
            </span>
            <span className={`text-sm font-medium ${lang === "bn" ? "font-bn" : ""}`}>{t(key)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
