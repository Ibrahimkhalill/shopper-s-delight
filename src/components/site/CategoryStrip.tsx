import { Smartphone, Shirt, Home, Sparkles, ShoppingBasket, Tag } from "lucide-react";
import { Link } from "@tanstack/react-router";

const cats = [
  { name: "Gadgets", slug: "gadgets", icon: Smartphone },
  { name: "Fashion", slug: "fashion", icon: Shirt },
  { name: "Home", slug: "home", icon: Home },
  { name: "Beauty", slug: "beauty", icon: Sparkles },
  { name: "Grocery", slug: "grocery", icon: ShoppingBasket },
  { name: "Deals", slug: "deals", icon: Tag },
];

export function CategoryStrip() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-10">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {cats.map(({ name, slug, icon: Icon }) => (
          <Link
            key={name}
            to="/category/$slug"
            params={{ slug }}
            className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card py-6 transition hover:border-foreground hover-lift"
          >
            <span className="size-12 rounded-full bg-secondary flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition">
              <Icon className="size-5" />
            </span>
            <span className="text-sm font-medium">{name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}