import { Smartphone, Shirt, Home, Sparkles, ShoppingBasket, Tag } from "lucide-react";

const cats = [
  { name: "Gadgets", icon: Smartphone },
  { name: "Fashion", icon: Shirt },
  { name: "Home & Living", icon: Home },
  { name: "Beauty", icon: Sparkles },
  { name: "Grocery", icon: ShoppingBasket },
  { name: "Deals", icon: Tag },
];

export function CategoryStrip() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-10">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {cats.map(({ name, icon: Icon }) => (
          <a
            key={name}
            href="#"
            className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card py-6 transition hover:border-foreground"
          >
            <span className="size-12 rounded-full bg-secondary flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition">
              <Icon className="size-5" />
            </span>
            <span className="text-sm font-medium">{name}</span>
          </a>
        ))}
      </div>
    </section>
  );
}