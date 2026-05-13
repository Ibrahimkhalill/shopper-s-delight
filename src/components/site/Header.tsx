"use client";

import {
  Search, Heart, ShoppingCart, User, Menu, X, Package,
  LogOut, ChevronDown, Globe, Smartphone, Shirt, Home,
  Sparkles, ShoppingBasket, Tag, ChevronRight, MapPin, Settings,
  ArrowLeftRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useStore } from "@/lib/store";
import { PRODUCTS } from "@/lib/products";
import { useT } from "@/lib/i18n";
import { CartDrawer } from "./CartDrawer";
import { WishlistDrawer } from "./WishlistDrawer";
import { Price } from "./Price";

export function Header() {
  const { cartCount, wishlist, compareList, user, logout, openAuthModal } = useStore();
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
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLDivElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const [searchPopover, setSearchPopover] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => setMounted(true), []);

  // lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menu]);

  const results = q.trim()
    ? PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.category.toLowerCase().includes(q.toLowerCase()) ||
        p.brand.toLowerCase().includes(q.toLowerCase()),
      ).slice(0, 6)
    : [];

  useLayoutEffect(() => {
    if (!searchOpen || !q.trim()) {
      setSearchPopover(null);
      return;
    }
    const update = () => {
      const el = searchRef.current;
      if (!el) {
        setSearchPopover(null);
        return;
      }
      const r = el.getBoundingClientRect();
      if (r.width < 8) {
        setSearchPopover(null);
        return;
      }
      const gap = 6;
      const pad = 8;
      const maxLeft = window.innerWidth - r.width - pad;
      const left = Math.max(pad, Math.min(r.left, maxLeft));
      setSearchPopover({ top: r.bottom + gap, left, width: r.width });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [searchOpen, q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (searchRef.current?.contains(t) || searchDropdownRef.current?.contains(t)) return;
      setSearchOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) { router.push(`/search?q=${encodeURIComponent(q)}`); setSearchOpen(false); }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full min-w-0 bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/70">

        {/* ── Top bar ── */}
        <div className="bg-black text-xs text-white lg:text-[13px]">
          <div className="mx-auto flex min-w-0 max-w-7xl items-center justify-between gap-2 px-4 py-2 lg:px-6 lg:py-2.5">
            <span className={`min-w-0 flex-1 truncate ${lang === "bn" ? "font-bn" : ""}`}>{t("topbar.delivery")}</span>
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
        <div className="border-b bg-background">
          <div className="mx-auto flex h-[3.75rem] min-w-0 max-w-7xl items-center gap-3 px-4 sm:h-16 lg:h-20 lg:gap-5 lg:px-6">

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
              href="/"
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
                      <Link href="/profile" onClick={() => setUserMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-secondary lg:gap-3 lg:py-3 lg:text-[15px]"><User className="size-4 lg:size-[18px]" /> {t("user.profile")}</Link>
                      <Link href="/profile" onClick={() => setUserMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-secondary lg:gap-3 lg:py-3 lg:text-[15px]"><Package className="size-4 lg:size-[18px]" /> {t("user.orders")}</Link>
                      <Link href="/wishlist" onClick={() => setUserMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-secondary lg:gap-3 lg:py-3 lg:text-[15px]"><Heart className="size-4 lg:size-[18px]" /> {t("user.wishlist")}</Link>
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

              {/* Desktop: compare */}
              <Link
                href="/compare"
                aria-label="Compare products"
                className="relative hidden rounded-full p-2.5 hover:bg-secondary md:flex lg:p-3"
              >
                <ArrowLeftRight className="size-5 text-muted-foreground lg:size-[22px]" strokeWidth={2} />
                {mounted && compareList.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-background lg:size-[18px] lg:text-[11px]">
                    {compareList.length > 9 ? "9+" : compareList.length}
                  </span>
                )}
              </Link>

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
              <Link href="/search" aria-label="Search" className="md:hidden p-2.5 rounded-full hover:bg-secondary">
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
        <nav className="border-b bg-background">
          <div className="relative">
            <div className="mx-auto flex h-11 w-full min-w-0 max-w-7xl items-center gap-6 overflow-x-auto px-4 text-sm no-scrollbar lg:h-14 lg:gap-9 lg:px-6 lg:text-[17px]">
              {categories.map((c) => {
                const catActive =
                  pathname === c.to || (c.to !== "/" && pathname.startsWith(c.to));
                return (
                <Link
                  key={c.name}
                  href={c.to}
                  className={`whitespace-nowrap transition-colors ${catActive ? `text-foreground font-semibold ${lang === "bn" ? "font-bn" : ""}` : `text-muted-foreground hover:text-foreground ${lang === "bn" ? "font-bn" : ""}`}`}
                >
                  {c.name}
                </Link>
                );
              })}
              <Link href="/track" className={`ml-auto whitespace-nowrap font-semibold text-accent ${lang === "bn" ? "font-bn" : ""}`}>
                {t("nav.track")}
              </Link>
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-background to-transparent md:hidden" />
          </div>
        </nav>

      </header>

      {/* ── Mobile hamburger drawer ── */}
      {/* Mobile nav overlay — must sit above sticky page chrome (e.g. checkout bar z-50, drawers z-60) */}
      {menu && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMenu(false)}
          />

          {/* Drawer panel */}
          <div className="absolute left-0 top-0 bottom-0 w-75 bg-background shadow-2xl flex flex-col animate-slide-left overflow-hidden">

            {/* Brand header */}
            <div className="flex items-center justify-between px-5 py-4 bg-black text-white shrink-0">
              <Link href="/" onClick={() => setMenu(false)} className="flex items-baseline gap-0.5">
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

              {/* Quick actions */}
              <div className="px-4 pt-4 pb-3 border-b space-y-0.5">
                <Link href="/track" onClick={() => setMenu(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary transition"
                >
                  <span className="size-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Package className="size-4 text-muted-foreground" />
                  </span>
                  <span className="text-sm font-medium">Track Order</span>
                  <ChevronRight className="size-3.5 text-muted-foreground ml-auto" />
                </Link>
                <Link href="/compare" onClick={() => setMenu(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary transition"
                >
                  <span className="size-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <ArrowLeftRight className="size-4 text-muted-foreground" />
                  </span>
                  <span className="text-sm font-medium flex-1">Compare products</span>
                  {compareList.length > 0 && (
                    <span className="text-[10px] font-bold rounded-full bg-foreground text-background px-1.5 py-0.5 min-w-5 text-center">
                      {compareList.length}
                    </span>
                  )}
                  <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
                </Link>
              </div>

              {/* Categories */}
              <div className="px-4 pt-4 pb-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-1 mb-2">Categories</p>
                <nav className="space-y-0.5">
                  {categories.map((c) => (
                    <Link key={c.name} href={c.to} onClick={() => setMenu(false)}
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
                      <Link key={item.label} href={item.to} onClick={() => setMenu(false)}
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

      {/* Desktop search suggestions — portaled so it stacks above category nav & is never clipped by header overflow */}
      {searchOpen &&
        q.trim().length > 0 &&
        searchPopover &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={searchDropdownRef}
            role="listbox"
            aria-label="Search suggestions"
            className="pointer-events-auto fixed z-[500] hidden max-h-[min(22rem,70svh)] overflow-hidden overflow-y-auto overscroll-contain rounded-xl border border-border/90 bg-card shadow-xl ring-1 ring-foreground/[0.04] animate-slide-down md:block"
            style={{ top: searchPopover.top, left: searchPopover.left, width: searchPopover.width }}
          >
            {results.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No matches for <span className="font-medium text-foreground">{q}</span>
                </p>
                <Link
                  href="/search"
                  className="mt-3 inline-block text-xs font-semibold text-accent hover:underline"
                  onClick={() => setSearchOpen(false)}
                >
                  Browse all products
                </Link>
              </div>
            ) : (
              <>
                <ul className="divide-y divide-border/60 py-1">
                  {results.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/product/${p.id}`}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-secondary/80"
                        role="option"
                      >
                        <img
                          src={p.image}
                          className="size-9 shrink-0 rounded-md object-cover ring-1 ring-border/50"
                          alt=""
                          width={36}
                          height={36}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium leading-snug text-foreground">{p.name}</p>
                          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                            {p.category} · {p.brand}
                          </p>
                        </div>
                        <Price
                          amount={p.price}
                          size="sm"
                          className="shrink-0 !text-sm !font-semibold"
                          symbolClassName="!text-[0.65rem]"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-border/70 bg-secondary/25 px-2 py-1.5">
                  <Link
                    href={`/search?q=${encodeURIComponent(q.trim())}`}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-semibold text-foreground/80 transition hover:bg-secondary hover:text-foreground"
                  >
                    View all results
                    <ChevronRight className="size-3.5 opacity-60" aria-hidden />
                  </Link>
                </div>
              </>
            )}
          </div>,
          document.body,
        )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <WishlistDrawer open={wishlistOpen} onClose={() => setWishlistOpen(false)} />
    </>
  );
}
