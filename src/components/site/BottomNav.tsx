"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingCart, Heart, User } from "lucide-react";
import { useStore } from "@/lib/store";

const tabs = [
  { to: "/",         icon: Home,         label: "Home" },
  { to: "/search",   icon: Search,       label: "Search" },
  { to: "/cart",     icon: ShoppingCart, label: "Cart",    badge: "cart" },
  { to: "/wishlist", icon: Heart,        label: "Saved",   badge: "wish" },
  { to: "/profile",  icon: User,         label: "Account" },
] as const;

export function BottomNav() {
  const { cartCount, wishlist } = useStore();
  const pathname = usePathname();

  if (pathname === "/checkout" || pathname === "/cart") return null;

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  const getBadge = (badge?: string) => {
    if (badge === "cart")  return cartCount > 0 ? cartCount : null;
    if (badge === "wish")  return wishlist.length > 0 ? wishlist.length : null;
    return null;
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t safe-bottom">
      <div className="flex items-stretch h-16">
        {tabs.map((tab) => {
          const { to, icon: Icon, label } = tab;
          const badge = "badge" in tab ? tab.badge : undefined;
          const active = isActive(to);
          const count = getBadge(badge);
          return (
            <Link
              key={to}
              href={to}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative tap-highlight-none"
            >
              {/* Active indicator pill */}
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-accent" />
              )}

              {/* Icon wrapper */}
              <span className="relative">
                <Icon
                  className={`size-[22px] transition-all duration-200 ${
                    active ? "text-accent scale-110" : "text-muted-foreground"
                  }`}
                  strokeWidth={active ? 2.25 : 1.75}
                />
                {count !== null && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center px-0.5 leading-none">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </span>

              {/* Label */}
              <span className={`text-[11px] font-medium leading-tight sm:text-xs ${active ? "text-accent" : "text-muted-foreground"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
