import {
  Search, Heart, ShoppingCart, User, Menu, X, Package,
  LogOut, ChevronDown, Globe, Smartphone, Shirt, Home,
  Sparkles, ShoppingBasket, Tag, ChevronRight, MapPin, Settings,
} from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { PRODUCTS } from "@/lib/products";
import { useT } from "@/lib/i18n";
import { CartDrawer } from "./CartDrawer";
import { WishlistDrawer } from "./WishlistDrawer";
import { Price } from "./Price";

export function Header() {
  const { cartCount, wishlist, user, logout, openAuthModal } = useStore();
  const { lang, setLang, t } = useT();

  const categories = [
    { name: t("nav.gadgets"), to: "/category/gadgets", icon: Smartphone },
    { name: t("nav.fashion"), to: "/category/fashion", icon: Shirt },
    { name: t("nav.home"),    to: "/category/home",    icon: Home },
    { name: t("nav.beauty"),  to: "/category/beauty",  icon: Sparkles },
    { name: t("nav.grocery"), to: "/category/grocery", icon: ShoppingBasket },
    { name: t("nav.deals"),   to: "/category/deals",   icon: Tag },
  ];

  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menu]);

  const results = q.trim()
    ? PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.category.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 6)
    : [];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setSearchOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) { navigate({ to: "/search", search: { q } }); setSearchOpen(false); }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/70">

        {/* ── Top bar ── */}
        <div className="bg-black text-xs text-white lg:text-[13px]">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 lg:px-6 lg:py-2.5">
            <span className={`truncate ${lang === "bn" ? "font-bn" : ""}`}>{t("topbar.delivery")}</span>
            <button
              onClick={() => setLang(lang === "en" ? "bn" : "en")}
              className="hidden items-center gap-1.5 opacity-80 transition hover:opacity-100 sm:inline-flex lg:gap-2"
              aria-label="Toggle language"
            >
              <Globe className="size-3.5 lg:size-4" />
              <span className={lang === "en" ? "font-bn" : ""}>{t("lang.toggle")}</span>
            </button>
          </div>
        </div>

        {/* ── Main bar ── */}
        <div className="border-b">
          <div className="mx-auto flex h-[3.75rem] max-w-7xl items-center gap-3 px-4 sm:h-16 lg:h-20 lg:gap-5 lg:px-6">

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenu(true)}
              aria-label="Open menu"
              className="md:hidden p-2 rounded-xl hover:bg-secondary transition shrink-0"
            >
              <Menu className="size-5.5 stroke-[1.75]" />
            </button>

            {/* Logo — centered on mobile, left on desktop */}
            <Link
              to="/"
              className="absolute left-1/2 flex shrink-0 -translate-x-1/2 items-center gap-1.5 md:static md:mr-4 md:translate-x-0 lg:mr-6"
            >
              <span className="text-xl font-bold tracking-tight text-accent lg:text-2xl">SHOP</span>
              <span className="text-xl font-bold tracking-tight lg:text-2xl">.BD</span>
            </Link>

            {/* Desktop search */}
            <div ref={searchRef} className="relative mx-auto hidden max-w-2xl flex-1 md:block">
              <form onSubmit={submit}>
                <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground lg:left-5 lg:size-[18px]" />
                <input
                  value={q}
                  onChange={(e) => { setQ(e.target.value); setSearchOpen(true); }}
                  onFocus={() => setSearchOpen(true)}
                  placeholder={t("search.placeholder")}
                  className="h-12 w-full rounded-full border border-border bg-secondary pl-11 pr-4 text-sm outline-none transition focus-visible:border-foreground/35 focus-visible:ring-2 focus-visible:ring-ring/20 lg:h-[52px] lg:pl-12 lg:pr-5 lg:text-base"
                />
              </form>
              {searchOpen && results.length > 0 && (
                <div className="absolute inset-x-0 top-full z-50 mt-2 animate-slide-down overflow-hidden rounded-2xl border bg-card shadow-xl lg:mt-3 lg:rounded-3xl">
                  {results.map((p) => (
                    <Link
                      key={p.id}
                      to="/product/$id"
                      params={{ id: p.id }}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-secondary lg:gap-4 lg:px-5 lg:py-3.5"
                    >
                      <img src={p.image} className="size-11 rounded-lg object-cover lg:size-14 lg:rounded-xl" alt="" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium lg:text-base">{p.name}</p>
                        <p className="text-xs text-muted-foreground lg:text-sm">{p.category}</p>
                      </div>
                      <Price
                        amount={p.price}
                        size="sm"
                        className="!font-semibold lg:!text-lg"
                        symbolClassName="lg:!text-[0.88rem]"
                      />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Right icons */}
            <div className="ml-auto flex items-center gap-0.5 lg:gap-1.5">

              {/* Desktop: user menu */}
              {user ? (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setUserMenu(!userMenu)}
                    className="flex h-10 items-center gap-2 rounded-full px-3 text-sm hover:bg-secondary lg:h-12 lg:gap-2.5 lg:px-4 lg:text-[15px]"
                  >
                    <div className="flex size-7 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background lg:size-9 lg:text-sm">
                      {user.name[0]?.toUpperCase()}
                    </div>
                    <span className="max-w-24 truncate lg:max-w-28">{user.name.split(" ")[0]}</span>
                    <ChevronDown className="size-3 lg:size-3.5" />
                  </button>
                  {userMenu && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-56 animate-slide-down rounded-2xl border bg-card py-2 shadow-xl lg:w-64">
                      <Link to="/profile" onClick={() => setUserMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-secondary lg:gap-3 lg:py-3 lg:text-[15px]"><User className="size-4 lg:size-[18px]" /> {t("user.profile")}</Link>
                      <Link to="/profile" onClick={() => setUserMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-secondary lg:gap-3 lg:py-3 lg:text-[15px]"><Package className="size-4 lg:size-[18px]" /> {t("user.orders")}</Link>
                      <Link to="/wishlist" onClick={() => setUserMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-secondary lg:gap-3 lg:py-3 lg:text-[15px]"><Heart className="size-4 lg:size-[18px]" /> {t("user.wishlist")}</Link>
                      <div className="my-1.5 border-t" />
                      <button onClick={() => { logout(); setUserMenu(false); }} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-accent hover:bg-secondary lg:gap-3 lg:py-3 lg:text-[15px]">
                        <LogOut className="size-4 lg:size-[18px]" /> {t("user.signout")}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => openAuthModal("login")}
                  className="hidden h-10 items-center gap-2 rounded-full px-3 text-sm hover:bg-secondary md:flex lg:h-12 lg:gap-2.5 lg:px-4 lg:text-[15px]"
                >
                  <User className="size-4 lg:size-[18px]" /> {t("user.signin")}
                </button>
              )}

              {/* Desktop: wishlist + cart */}
              <button
                onClick={() => setWishlistOpen(true)}
                aria-label="Wishlist"
                className="relative hidden rounded-full p-2.5 hover:bg-secondary md:flex lg:p-3"
              >
                <Heart className="size-5 lg:size-[22px]" />
                {mounted && wishlist.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-background lg:size-[18px] lg:text-[11px]">
                    {wishlist.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setCartOpen(true)}
                aria-label="Cart"
                className="relative hidden rounded-full p-2.5 hover:bg-secondary md:flex lg:p-3"
              >
                <ShoppingCart className="size-5 lg:size-[22px]" />
                {mounted && cartCount > 0 && (
                  <span
                    key={cartCount}
                    className="absolute -right-0.5 -top-0.5 flex size-4 animate-bounce-soft items-center justify-center rounded-full bg-accent text-[10px] font-medium text-accent-foreground lg:size-[18px] lg:text-[11px]"
                  >
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile: search + cart icons */}
              <Link to="/search" aria-label="Search" className="md:hidden p-2.5 rounded-full hover:bg-secondary">
                <Search className="size-5" />
              </Link>
              <button onClick={() => setCartOpen(true)} aria-label="Cart" className="md:hidden relative p-2.5 rounded-full hover:bg-secondary">
                <ShoppingCart className="size-5" />
                {mounted && cartCount > 0 && (
                  <span key={cartCount} className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-accent text-accent-foreground text-[10px] font-medium flex items-center justify-center animate-bounce-soft">{cartCount}</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Category nav bar ── */}
        <nav className="border-b">
          <div className="relative">
            <div className="mx-auto flex h-11 max-w-7xl items-center gap-6 overflow-x-auto px-4 text-sm no-scrollbar lg:h-14 lg:gap-9 lg:px-6 lg:text-[17px]">
              {categories.map((c) => (
                <Link
                  key={c.name}
                  to={c.to}
                  className={`whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground ${lang === "bn" ? "font-bn" : ""}`}
                  activeProps={{ className: `whitespace-nowrap text-foreground font-semibold ${lang === "bn" ? "font-bn" : ""}` }}
                >
                  {c.name}
                </Link>
              ))}
              <Link to="/track" className={`ml-auto whitespace-nowrap font-semibold text-accent ${lang === "bn" ? "font-bn" : ""}`}>
                {t("nav.track")}
              </Link>
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-background to-transparent md:hidden" />
          </div>
        </nav>

      </header>

      {/* ── Mobile hamburger drawer ── */}
      {menu && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMenu(false)}
          />

          {/* Drawer panel */}
          <div className="absolute left-0 top-0 bottom-0 w-75 bg-background shadow-2xl flex flex-col animate-slide-left overflow-hidden">

            {/* Brand header */}
            <div className="flex items-center justify-between px-5 py-4 bg-black text-white shrink-0">
              <Link to="/" onClick={() => setMenu(false)} className="flex items-baseline gap-0.5">
                <span className="text-lg font-semibold tracking-tight">SHOP</span>
                <span className="text-lg font-semibold tracking-tight text-accent">.BD</span>
              </Link>
              <button
                onClick={() => setMenu(false)}
                className="size-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                aria-label="Close menu"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* User section */}
            {user ? (
              <div className="px-5 py-4 border-b bg-secondary/40 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-full bg-foreground text-background flex items-center justify-center text-base font-semibold shrink-0">
                    {user.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.phone || user.email}</p>
                  </div>
                  
                </div>
              </div>
            ) : (
              <div className="px-5 py-4 border-b bg-secondary/30 shrink-0">
                <p className="text-xs text-muted-foreground mb-3">Sign in for faster checkout & order tracking</p>
                <div className="flex gap-2">
                  <button onClick={() => { setMenu(false); openAuthModal("login"); }}
                    className="flex-1 h-9 rounded-xl bg-foreground text-background text-xs font-semibold flex items-center justify-center hover:opacity-90 transition"
                  >
                    Sign in
                  </button>
                  <button onClick={() => { setMenu(false); openAuthModal("signup"); }}
                    className="flex-1 h-9 rounded-xl border text-xs font-semibold flex items-center justify-center hover:bg-secondary transition"
                  >
                    Register
                  </button>
                </div>
              </div>
            )}

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">

              {/* Quick action tile — Track only */}
              <div className="px-4 pt-4 pb-3 border-b">
                <Link to="/track" onClick={() => setMenu(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary transition"
                >
                  <span className="size-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Package className="size-4 text-muted-foreground" />
                  </span>
                  <span className="text-sm font-medium">Track Order</span>
                  <ChevronRight className="size-3.5 text-muted-foreground ml-auto" />
                </Link>
              </div>

              {/* Categories */}
              <div className="px-4 pt-4 pb-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-1 mb-2">Categories</p>
                <nav className="space-y-0.5">
                  {categories.map((c) => (
                    <Link key={c.name} to={c.to} onClick={() => setMenu(false)}
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

              {/* Account links (logged in) */}
              {user && (
                <div className="px-4 pt-3 pb-2 border-t mt-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-1 mb-2">Account</p>
                  <nav className="space-y-0.5">
                    {[
                      { to: "/profile",  icon: User,     label: "My Profile" },
                      { to: "/profile",  icon: Package,  label: "My Orders" },
                      { to: "/profile",  icon: MapPin,   label: "My Addresses" },
                      { to: "/wishlist", icon: Heart,    label: "Wishlist" },
                      { to: "/profile",  icon: Settings, label: "Settings" },
                    ].map((item) => (
                      <Link key={item.label} to={item.to} onClick={() => setMenu(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary transition group"
                      >
                        <span className="size-8 rounded-lg bg-secondary group-hover:bg-background flex items-center justify-center transition shrink-0">
                          <item.icon className="size-4 text-muted-foreground group-hover:text-foreground transition" />
                        </span>
                        <span className="text-sm font-medium flex-1">{item.label}</span>
                        <ChevronRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                      </Link>
                    ))}
                  </nav>
                </div>
              )}

              {/* Language toggle */}
              <div className="px-4 pt-3 pb-4 border-t mt-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-1 mb-3 flex items-center gap-1.5">
                  <Globe className="size-3.5" /> Language
                </p>
                <div className="flex rounded-xl border overflow-hidden text-xs font-semibold">
                  <button onClick={() => setLang("en")}
                    className={`flex-1 h-9 transition ${lang === "en" ? "bg-foreground text-background" : "hover:bg-secondary"}`}
                  >
                    English
                  </button>
                  <button onClick={() => setLang("bn")}
                    className={`flex-1 h-9 font-bn transition ${lang === "bn" ? "bg-foreground text-background" : "hover:bg-secondary"}`}
                  >
                    বাংলা
                  </button>
                </div>
              </div>

            </div>

            {/* Sign-out footer */}
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
      <WishlistDrawer open={wishlistOpen} onClose={() => setWishlistOpen(false)} />
    </>
  );
}
