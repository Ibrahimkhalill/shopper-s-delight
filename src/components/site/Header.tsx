import { Search, Heart, ShoppingCart, User, Menu, X, Package, LogOut, ChevronDown, Globe, Smartphone, Shirt, Home, Sparkles, ShoppingBasket, Tag, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { PRODUCTS } from "@/lib/products";
import { useT } from "@/lib/i18n";
import { CartDrawer } from "./CartDrawer";

export function Header() {
  const { cartCount, wishlist, user, logout } = useStore();
  const { lang, setLang, t } = useT();
  const categories = [
    { name: t("nav.gadgets"), to: "/category/gadgets", icon: Smartphone },
    { name: t("nav.fashion"), to: "/category/fashion", icon: Shirt },
    { name: t("nav.home"), to: "/category/home", icon: Home },
    { name: t("nav.beauty"), to: "/category/beauty", icon: Sparkles },
    { name: t("nav.grocery"), to: "/category/grocery", icon: ShoppingBasket },
    { name: t("nav.deals"), to: "/category/deals", icon: Tag },
  ];
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const results = q.trim()
    ? PRODUCTS.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.category.toLowerCase().includes(q.toLowerCase())).slice(0, 6)
    : [];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      navigate({ to: "/search", search: { q } });
      setOpen(false);
    }
  };

  return (
    <>
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="bg-black text-white text-xs">
        <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-between">
          <span className={`truncate ${lang === "bn" ? "font-bn" : ""}`}>{t("topbar.delivery")}</span>
          <button
            onClick={() => setLang(lang === "en" ? "bn" : "en")}
            className="hidden sm:inline-flex items-center gap-1.5 opacity-80 hover:opacity-100 transition"
            aria-label="Toggle language"
          >
            <Globe className="size-3.5" />
            <span className={lang === "en" ? "font-bn" : ""}>{t("lang.toggle")}</span>
          </button>
        </div>
      </div>

      <div className="border-b">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center gap-3">
          <button onClick={() => setMenu(true)} className="md:hidden -ml-1 p-2"><Menu className="size-5" /></button>
          <Link to="/" className="flex items-baseline gap-0.5 shrink-0">
            <span className="text-xl font-semibold tracking-tight">SHOP</span>
            <span className="text-xl font-semibold tracking-tight text-accent">.BD</span>
          </Link>

          <div ref={ref} className="flex-1 max-w-2xl mx-auto hidden md:block relative">
            <form onSubmit={submit}>
              <Search className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                placeholder={t("search.placeholder")}
                className="w-full h-11 pl-11 pr-4 rounded-full border border-border bg-secondary text-sm outline-none focus:border-foreground transition"
              />
            </form>
            {open && results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-2xl shadow-xl overflow-hidden animate-slide-down z-50">
                {results.map((p) => (
                  <Link key={p.id} to="/product/$id" params={{ id: p.id }} onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 hover:bg-secondary">
                    <img src={p.image} className="size-11 rounded-lg object-cover" alt="" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.category}</p>
                    </div>
                    <span className="text-sm font-semibold">৳{p.price}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-1">
            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenu(!userMenu)} className="hidden sm:flex items-center gap-2 px-3 h-10 rounded-full hover:bg-secondary text-sm">
                  <div className="size-7 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-semibold">{user.name[0]?.toUpperCase()}</div>
                  <span className="max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
                  <ChevronDown className="size-3" />
                </button>
                {userMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-card border rounded-2xl shadow-xl py-2 animate-slide-down">
                    <Link to="/profile" onClick={() => setUserMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-secondary text-sm"><User className="size-4" /> {t("user.profile")}</Link>
                    <Link to="/profile" onClick={() => setUserMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-secondary text-sm"><Package className="size-4" /> {t("user.orders")}</Link>
                    <Link to="/wishlist" onClick={() => setUserMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-secondary text-sm"><Heart className="size-4" /> {t("user.wishlist")}</Link>
                    <div className="border-t my-1.5" />
                    <button onClick={() => { logout(); setUserMenu(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-secondary text-sm text-accent"><LogOut className="size-4" /> {t("user.signout")}</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="hidden sm:flex items-center gap-2 px-3 h-10 rounded-full hover:bg-secondary text-sm">
                <User className="size-4" /> {t("user.signin")}
              </Link>
            )}
            <Link to="/wishlist" className="relative p-2.5 rounded-full hover:bg-secondary">
              <Heart className="size-5" />
              {mounted && wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-foreground text-background text-[10px] font-medium flex items-center justify-center">{wishlist.length}</span>
              )}
            </Link>
            <button onClick={() => setCartOpen(true)} aria-label="Open cart" className="relative p-2.5 rounded-full hover:bg-secondary">
              <ShoppingCart className="size-5" />
              {mounted && cartCount > 0 && (
                <span key={cartCount} className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-accent text-accent-foreground text-[10px] font-medium flex items-center justify-center animate-bounce-soft">{cartCount}</span>
              )}
            </button>
          </div>
        </div>

        <div className="md:hidden px-4 pb-3 relative" ref={ref}>
          <form onSubmit={submit}>
            <Search className="size-4 absolute left-7 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              placeholder={t("search.mobile")}
              className="w-full h-11 pl-11 pr-4 rounded-full border border-border bg-secondary text-sm outline-none"
            />
          </form>
          {open && results.length > 0 && (
            <div className="absolute top-full left-4 right-4 mt-1 bg-card border rounded-2xl shadow-xl overflow-hidden z-50 animate-slide-down">
              {results.map((p) => (
                <Link key={p.id} to="/product/$id" params={{ id: p.id }} onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 hover:bg-secondary">
                  <img src={p.image} className="size-10 rounded-lg object-cover" alt="" />
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{p.name}</p></div>
                  <span className="text-sm font-semibold">৳{p.price}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <nav className="border-b">
        <div className="relative">
          <div className="mx-auto max-w-7xl px-4 h-11 flex items-center gap-6 overflow-x-auto no-scrollbar text-sm">
            {categories.map((c) => (
              <Link
                key={c.name}
                to={c.to}
                className={`whitespace-nowrap text-muted-foreground hover:text-foreground transition ${lang === "bn" ? "font-bn" : ""}`}
                activeProps={{ className: `whitespace-nowrap text-foreground font-medium ${lang === "bn" ? "font-bn" : ""}` }}
              >
                {c.name}
              </Link>
            ))}
            <Link to="/track" className={`ml-auto whitespace-nowrap text-accent font-medium ${lang === "bn" ? "font-bn" : ""}`}>{t("nav.track")}</Link>
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent md:hidden" />
        </div>
      </nav>

    </header>

    {/* Mobile drawer — outside <header> so z-50 lives in the root stacking context */}
    {menu && (
      <div className="fixed inset-0 z-50 md:hidden animate-fade-in">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMenu(false)} />

        <div className="absolute left-0 top-0 bottom-0 w-[300px] bg-background shadow-2xl flex flex-col animate-slide-left overflow-hidden">

          {/* ── Brand header ── */}
          <div className="flex items-center justify-between px-5 py-4 bg-black text-white shrink-0">
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-semibold tracking-tight">SHOP</span>
              <span className="text-lg font-semibold tracking-tight text-accent">.BD</span>
            </div>
            <button onClick={() => setMenu(false)} className="size-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
              <X className="size-4" />
            </button>
          </div>

          {/* ── User section ── */}
          {user ? (
            <div className="px-5 py-4 border-b bg-secondary/40 shrink-0">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-full bg-foreground text-background flex items-center justify-center text-base font-semibold shrink-0">
                  {user.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.phone}</p>
                </div>
                <Link to="/profile" onClick={() => setMenu(false)} className="text-xs text-accent font-semibold shrink-0">
                  Profile →
                </Link>
              </div>
            </div>
          ) : (
            <div className="px-5 py-4 border-b bg-secondary/30 shrink-0">
              <p className="text-xs text-muted-foreground mb-3">Sign in for faster checkout & order tracking</p>
              <div className="flex gap-2">
                <Link to="/login" onClick={() => setMenu(false)} className="flex-1 h-9 rounded-xl bg-accent text-accent-foreground text-xs font-semibold flex items-center justify-center">
                  Sign in
                </Link>
                <Link to="/signup" onClick={() => setMenu(false)} className="flex-1 h-9 rounded-xl border text-xs font-semibold flex items-center justify-center hover:bg-secondary transition">
                  Register
                </Link>
              </div>
            </div>
          )}

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto">

            {/* Quick-action tiles */}
            <div className="px-4 pt-4 pb-3 grid grid-cols-3 gap-2 border-b">
              <Link to="/cart" onClick={() => setMenu(false)} className="relative flex flex-col items-center gap-1.5 py-3 rounded-xl hover:bg-secondary transition">
                <ShoppingCart className="size-5" />
                <span className="text-[11px] font-medium">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute top-2 right-3 size-4 rounded-full bg-accent text-accent-foreground text-[9px] font-bold flex items-center justify-center">{cartCount}</span>
                )}
              </Link>
              <Link to="/wishlist" onClick={() => setMenu(false)} className="relative flex flex-col items-center gap-1.5 py-3 rounded-xl hover:bg-secondary transition">
                <Heart className="size-5" />
                <span className="text-[11px] font-medium">Wishlist</span>
                {wishlist.length > 0 && (
                  <span className="absolute top-2 right-3 size-4 rounded-full bg-foreground text-background text-[9px] font-bold flex items-center justify-center">{wishlist.length}</span>
                )}
              </Link>
              <Link to="/track" onClick={() => setMenu(false)} className="flex flex-col items-center gap-1.5 py-3 rounded-xl hover:bg-secondary transition">
                <Package className="size-5" />
                <span className="text-[11px] font-medium">Track</span>
              </Link>
            </div>

            {/* Categories */}
            <div className="px-4 pt-4 pb-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-1 mb-2">Browse</p>
              <nav className="space-y-0.5">
                {categories.map((c) => (
                  <Link
                    key={c.name}
                    to={c.to}
                    onClick={() => setMenu(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary transition group"
                  >
                    <span className="size-8 rounded-lg bg-secondary group-hover:bg-background flex items-center justify-center transition shrink-0">
                      <c.icon className="size-4 text-muted-foreground group-hover:text-foreground transition" />
                    </span>
                    <span className={`text-sm font-medium flex-1 ${lang === "bn" ? "font-bn" : ""}`}>{c.name}</span>
                    <ChevronRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                  </Link>
                ))}
              </nav>
            </div>

            {/* Language toggle */}
            <div className="px-4 pt-3 pb-4 border-t mt-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-1 mb-3 flex items-center gap-1.5"><Globe className="size-3.5" /> Language</p>
              <div className="flex rounded-xl border overflow-hidden text-xs font-semibold">
                <button
                  onClick={() => setLang("en")}
                  className={`flex-1 h-9 transition ${lang === "en" ? "bg-foreground text-background" : "hover:bg-secondary"}`}
                >
                  English
                </button>
                <button
                  onClick={() => setLang("bn")}
                  className={`flex-1 h-9 font-bn transition ${lang === "bn" ? "bg-foreground text-background" : "hover:bg-secondary"}`}
                >
                  বাংলা
                </button>
              </div>
            </div>

          </div>

          {/* ── Sign-out footer (logged-in only) ── */}
          {user && (
            <div className="px-4 py-4 border-t shrink-0">
              <button
                onClick={() => { logout(); setMenu(false); }}
                className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-accent/30 text-accent text-sm font-medium hover:bg-accent/5 transition"
              >
                <LogOut className="size-4" /> Sign out
              </button>
            </div>
          )}

        </div>
      </div>
    )}
    <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
