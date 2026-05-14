"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Layout } from "@/components/site/Layout";
import { useStore } from "@/lib/store";
import type { Address } from "@/lib/store";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Package, PackageCheck, Clock, Bell, MapPin, Heart,
  ShoppingCart, Settings, LogOut, ChevronRight,
  User as UserIcon,
  Plus, Pencil, Trash2, Star, X, Menu,
} from "lucide-react";
import { Price } from "@/components/site/Price";
import { toast } from "sonner";

type Tab = "dashboard" | "orders" | "notifications" | "addresses" | "settings";

const NAV: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "dashboard",     label: "Dashboard",     icon: LayoutDashboard },
  { id: "orders",        label: "Order History", icon: Package },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "addresses",     label: "My Addresses",  icon: MapPin },
  { id: "settings",      label: "Settings",      icon: Settings },
];

const NAV_LINKS = [
  { href: "/wishlist", label: "Wishlist",      icon: Heart },
  { href: "/cart",     label: "Shopping Cart", icon: ShoppingCart },
];

function ProfilePage() {
  const { user, orders, logout, resolveProduct } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab | null) ?? "dashboard";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!user) router.replace("/");
  }, [user, router]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [drawerOpen]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    toast("Signed out");
    router.push("/");
  };

  const activeItem = NAV.find((n) => n.id === tab)!;

  const onSelectTab = (t: Tab) => {
    setTab(t);
    setDrawerOpen(false);
  };

  return (
    <Layout hideTrust>
      <div className="min-h-screen bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-5 lg:px-6 lg:py-8">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4 lg:mb-6">
            <Link href="/" className="hover:text-foreground transition">Home</Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground font-medium">My Account</span>
          </nav>

          <div className="grid lg:grid-cols-[280px_1fr] gap-4 lg:gap-6 items-start">

            {/* ── Mobile: trigger pill ─────────────────────────────── */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="
                lg:hidden flex items-center justify-between w-full
                bg-white rounded-2xl border shadow-[0_1px_3px_oklch(0_0_0/0.04)]
                px-3.5 py-2.5 active:scale-[0.99] transition
              "
              aria-label="Open account navigation"
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <span className="size-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <activeItem.icon className="size-[18px] text-black" strokeWidth={2} />
                </span>
                <span className="text-left min-w-0">
                  <span className="block text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70 font-semibold">My Account</span>
                  <span className="block text-[13px] font-bold truncate">{activeItem.label}</span>
                </span>
              </span>
              <span className="size-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <Menu className="size-[18px]" strokeWidth={2} />
              </span>
            </button>

            {/* ── Desktop sidebar ──────────────────────────────────── */}
            <aside className="hidden lg:block sticky top-24 self-start bg-white rounded-2xl border shadow-[0_1px_3px_oklch(0_0_0/0.04),0_12px_32px_-18px_oklch(0_0_0/0.06)] overflow-hidden">
              <SidebarPanel
                user={user}
                tab={tab}
                onSelect={onSelectTab}
                onLogout={handleLogout}
              />
            </aside>

            {/* ── Mobile drawer ────────────────────────────────────── */}
            {drawerOpen && (
              <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
                <button
                  type="button"
                  aria-label="Close navigation"
                  onClick={() => setDrawerOpen(false)}
                  className="absolute inset-0 bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-200"
                />
                <aside className="absolute left-0 top-0 h-full w-[320px] max-w-[88vw] bg-white shadow-2xl animate-in slide-in-from-left duration-300 ease-out flex flex-col">
                  <SidebarPanel
                    user={user}
                    tab={tab}
                    onSelect={onSelectTab}
                    onLogout={handleLogout}
                    onClose={() => setDrawerOpen(false)}
                  />
                </aside>
              </div>
            )}

            {/* ── Content ─────────────────────────────────────────── */}
            <div className="min-w-0">
              {tab === "dashboard" && <DashboardTab user={user} orders={orders} resolveProduct={resolveProduct} setTab={setTab} />}
              {tab === "orders" && <OrdersTab orders={orders} resolveProduct={resolveProduct} />}
              {tab === "notifications" && <NotificationsTab />}
              {tab === "addresses" && <AddressesTab />}
              {tab === "settings" && <SettingsTab user={user} />}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

/* ── Sidebar Panel (shared by desktop + mobile drawer) ────────────── */
function SidebarPanel({
  user, tab, onSelect, onLogout, onClose,
}: {
  user: { name: string; phone: string; email?: string };
  tab: Tab;
  onSelect: (t: Tab) => void;
  onLogout: () => void;
  onClose?: () => void;
}) {
  return (
    <>
      {/* Header */}
      <div className="px-4 lg:px-5 pt-4 pb-3 lg:pt-5 lg:pb-4 border-b flex items-center gap-2.5">
        <div className="size-10 lg:size-11 rounded-xl bg-black text-white flex items-center justify-center text-sm lg:text-base font-bold shrink-0">
          {user.name[0]?.toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70 font-semibold">Signed in</p>
          <p className="text-[13px] lg:text-sm font-bold truncate">{user.name}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="size-9 rounded-xl bg-secondary hover:bg-border flex items-center justify-center transition lg:hidden"
          >
            <X className="size-[18px]" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="py-2 lg:py-3 px-2.5 flex-1 overflow-y-auto">
        {NAV.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`
                w-full flex items-center gap-2.5 px-2.5 py-2.5 my-0.5 rounded-xl relative
                text-[13px] lg:text-sm font-medium
                transition-all duration-200 ease-out
                active:scale-[0.985]
                ${active
                  ? "text-black font-semibold bg-accent/10"
                  : "text-muted-foreground hover:text-black hover:bg-secondary/60"}
              `}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-accent" />
              )}
              <span className={`size-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                active ? "bg-accent text-white" : "bg-secondary text-muted-foreground"
              }`}>
                <item.icon className="size-[18px]" strokeWidth={2} />
              </span>
              <span className="truncate text-left">{item.label}</span>
              {active && <ChevronRight className="size-3.5 text-accent ml-auto shrink-0" />}
            </button>
          );
        })}

        {/* External page links */}
        <div className="mt-1 pt-1 border-t border-border/60">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="w-full flex items-center gap-2.5 px-2.5 py-2.5 my-0.5 rounded-xl text-[13px] lg:text-sm font-medium text-muted-foreground hover:text-black hover:bg-secondary/60 transition-all duration-200"
            >
              <span className="size-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <item.icon className="size-[18px]" strokeWidth={2} />
              </span>
              <span className="truncate">{item.label}</span>
              <ChevronRight className="size-3.5 ml-auto shrink-0 opacity-40" />
            </Link>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="px-2.5 pb-3 pt-1.5 border-t">
        <button
          onClick={onLogout}
          className="
            w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl
            text-[13px] lg:text-sm font-medium text-muted-foreground
            hover:text-accent hover:bg-accent/10
            active:scale-[0.985]
            transition-all duration-200 ease-out
          "
        >
          <span className="size-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
            <LogOut className="size-[18px]" strokeWidth={2} />
          </span>
          Log out
        </button>
      </div>
    </>
  );
}

const STATUS_META: Record<string, { label: string; cls: string }> = {
  placed:    { label: "Placed",     cls: "bg-accent text-white" },
  packed:    { label: "Packed",     cls: "bg-foreground text-background" },
  shipped:   { label: "Delivering", cls: "bg-foreground text-background" },
  delivered: { label: "Delivered",  cls: "bg-black text-white" },
  cancelled: { label: "Cancelled",  cls: "bg-border text-foreground" },
};

/* ── Dashboard Tab ────────────────────────────────────────────────── */
function DashboardTab({ user, orders, resolveProduct, setTab }: {
  user: { name: string; phone: string; email?: string };
  orders: ReturnType<typeof useStore>["orders"];
  resolveProduct: ReturnType<typeof useStore>["resolveProduct"];
  setTab: (t: Tab) => void;
}) {
  const { addresses, wishlist } = useStore();
  const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];

  const stats: { label: string; value: number; icon: typeof Package }[] = [
    { label: "Total Orders", value: orders.length,                                       icon: Package },
    { label: "Delivered",    value: orders.filter(o => o.status === "delivered").length, icon: PackageCheck },
    { label: "Pending",      value: orders.filter(o => o.status !== "delivered").length, icon: Clock },
    { label: "Wishlist",     value: wishlist.length,                                     icon: Heart },
  ];

  return (
    <div className="space-y-4 lg:space-y-5 animate-fade-up">
      {/* ── Welcome banner ─────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border shadow-[0_1px_3px_oklch(0_0_0/0.04)] p-5 sm:p-6 lg:p-7">
        <p className="text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground/70 font-bold">Dashboard</p>
        <h1 className="mt-1.5 text-[18px] sm:text-[20px] lg:text-[24px] font-bold tracking-tight leading-[1.15]">
          Welcome back, {user.name.split(" ")[0]}
        </h1>
        <p className="mt-2 text-[13px] sm:text-sm lg:text-[15px] text-muted-foreground leading-relaxed max-w-2xl">
          View your recent orders, manage your shipping and billing addresses, and edit your password and account details from one place.
        </p>
      </section>

      {/* ── Quick stats ────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="
              group bg-white rounded-2xl border
              shadow-[0_1px_3px_oklch(0_0_0/0.04)]
              hover:shadow-[0_12px_28px_-16px_oklch(0_0_0/0.12)]
              hover:-translate-y-[2px]
              transition-all duration-300 ease-out
              p-4 sm:p-5
            "
          >
            <div className="size-10 lg:size-11 rounded-xl bg-secondary text-black flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.05]">
              <s.icon className="size-[18px] lg:size-5" strokeWidth={2} />
            </div>
            <p className="mt-3 lg:mt-4 text-[20px] sm:text-[22px] lg:text-[26px] font-bold tracking-tight leading-none">
              {s.value}
            </p>
            <p className="mt-1 text-[12px] sm:text-[13px] lg:text-sm text-muted-foreground font-medium">
              {s.label}
            </p>
          </div>
        ))}
      </section>

      {/* ── Account Info + Billing Address ─────────────────────────── */}
      <section className="grid lg:grid-cols-2 gap-3 lg:gap-4">
        {/* Account Info */}
        <div className="bg-white rounded-2xl border shadow-[0_1px_3px_oklch(0_0_0/0.04)] p-5 sm:p-6 flex flex-col">
          <div className="flex items-center gap-2.5 mb-4 lg:mb-5">
            <div className="size-9 lg:size-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <UserIcon className="size-[18px] lg:size-5 text-black" strokeWidth={2} />
            </div>
            <h2 className="text-[15px] sm:text-base lg:text-lg font-bold tracking-tight">Account Info</h2>
          </div>

          <div className="flex items-center gap-3.5 lg:gap-4 mb-4 lg:mb-5">
            <div className="size-12 lg:size-14 rounded-2xl bg-black text-white flex items-center justify-center text-base lg:text-lg font-bold shrink-0">
              {user.name[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm lg:text-[15px] font-bold truncate">{user.name}</p>
              {user.email && <p className="text-xs lg:text-[13px] text-muted-foreground truncate mt-0.5">{user.email}</p>}
              {user.phone && <p className="text-xs lg:text-[13px] text-muted-foreground mt-0.5">{user.phone}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-3.5 mt-auto">
            <span className="text-xs lg:text-sm text-muted-foreground">Account Status</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black text-white text-[11px] font-semibold">
              <span className="size-1.5 rounded-full bg-white animate-pulse" />
              Active
            </span>
          </div>
        </div>

        {/* Billing Address */}
        <div className="bg-white rounded-2xl border shadow-[0_1px_3px_oklch(0_0_0/0.04)] p-5 sm:p-6 flex flex-col">
          <div className="flex items-center gap-2.5 mb-4 lg:mb-5">
            <div className="size-9 lg:size-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <MapPin className="size-[18px] lg:size-5 text-black" strokeWidth={2} />
            </div>
            <h2 className="text-[15px] sm:text-base lg:text-lg font-bold tracking-tight">Billing Address</h2>
          </div>

          {defaultAddr ? (
            <div className="space-y-0.5 flex-1">
              <p className="text-sm lg:text-[15px] font-bold">{defaultAddr.name}</p>
              <p className="text-xs lg:text-[13px] text-muted-foreground">
                {defaultAddr.line1}{defaultAddr.line2 ? `, ${defaultAddr.line2}` : ""}
              </p>
              <p className="text-xs lg:text-[13px] text-muted-foreground">{defaultAddr.city}, {defaultAddr.district}</p>
              <p className="text-xs lg:text-[13px] text-muted-foreground">{defaultAddr.phone}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 py-5 text-center gap-2.5">
              <div className="size-10 rounded-xl bg-secondary flex items-center justify-center">
                <MapPin className="size-5 text-muted-foreground/70" strokeWidth={2} />
              </div>
              <p className="text-xs lg:text-[13px] text-muted-foreground max-w-[14rem]">
                {"You haven't set up a default billing address yet."}
              </p>
            </div>
          )}

          <button
            onClick={() => setTab("addresses")}
            className="
              mt-4 h-10 lg:h-11 w-full rounded-xl
              border border-black text-xs lg:text-sm font-semibold
              hover:bg-black hover:text-white
              active:scale-[0.98]
              transition-all duration-200 ease-out
            "
          >
            {defaultAddr ? "Manage Addresses" : "Add Address"}
          </button>
        </div>
      </section>

      {/* ── Recent orders ──────────────────────────────────────────── */}
      {orders.length > 0 && (
        <section className="bg-white rounded-2xl border shadow-[0_1px_3px_oklch(0_0_0/0.04)] overflow-hidden">
          <div className="px-5 lg:px-6 py-4 lg:py-5 border-b flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-9 lg:size-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <Package className="size-[18px] lg:size-5 text-black" strokeWidth={2} />
              </div>
              <h2 className="text-[15px] sm:text-base lg:text-lg font-bold tracking-tight truncate">
                Recent Orders
              </h2>
            </div>
            <button
              onClick={() => setTab("orders")}
              className="
                shrink-0 inline-flex items-center gap-1
                text-xs lg:text-[13px] text-accent font-semibold
                hover:underline underline-offset-4
              "
            >
              View all <ChevronRight className="size-3.5" />
            </button>
          </div>

          <div className="divide-y">
            {orders.slice(0, 3).map((o) => {
              const meta = STATUS_META[o.status] ?? STATUS_META.placed;
              return (
                <Link
                  key={o.id}
                  href={`/order/${o.id}/details`}
                  className="flex items-center gap-3 px-5 lg:px-6 py-3.5 lg:py-4 hover:bg-secondary/60 transition-colors group"
                >
                  <div className="flex items-center -space-x-2 shrink-0">
                    {o.items.slice(0, 3).map((it) => {
                      const p = resolveProduct(it.id);
                      return p ? (
                        <img key={it.id} src={p.image}
                          className="size-9 lg:size-10 rounded-lg object-cover border-2 border-white shadow-sm"
                          alt="" />
                      ) : null;
                    })}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] lg:text-sm font-semibold truncate">
                      Order <span className="font-mono text-muted-foreground">{o.id}</span>
                    </p>
                    <p className="text-[11px] lg:text-xs text-muted-foreground mt-0.5">
                      {o.items.length} {o.items.length === 1 ? "item" : "items"} · {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <Price amount={o.total} size="sm" className="!font-bold" />
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${meta.cls}`}>
                      {meta.label}
                    </span>
                  </div>
                  <ChevronRight className="size-4 text-border group-hover:text-black transition-colors shrink-0" />
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

/* ── Orders Tab ───────────────────────────────────────────────────── */
type OrderFilter = "all" | "processing" | "delivering" | "completed" | "cancelled";

const ORDER_FILTERS: { id: OrderFilter; label: string }[] = [
  { id: "all",        label: "All" },
  { id: "processing", label: "Processing" },
  { id: "delivering", label: "Delivering" },
  { id: "completed",  label: "Completed" },
  { id: "cancelled",  label: "Cancelled" },
];

function matchesFilter(status: string, filter: OrderFilter) {
  if (filter === "all")        return true;
  if (filter === "processing") return status === "placed" || status === "packed";
  if (filter === "delivering") return status === "shipped";
  if (filter === "completed")  return status === "delivered";
  if (filter === "cancelled")  return status === "cancelled";
  return true;
}

function OrdersTab({ orders, resolveProduct }: {
  orders: ReturnType<typeof useStore>["orders"];
  resolveProduct: ReturnType<typeof useStore>["resolveProduct"];
}) {
  const [filter, setFilter] = useState<OrderFilter>("all");
  const filtered = orders.filter((o) => matchesFilter(o.status, filter));

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Filter tabs — scrollable, no overflow cut-off */}
      <div className="no-scrollbar overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max px-0.5 pb-1">
          {ORDER_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`shrink-0 h-9 px-4 rounded-full text-[13px] font-medium border transition-all duration-200 active:scale-[0.97] ${
                filter === f.id
                  ? "bg-foreground text-background border-foreground font-semibold"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground bg-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border py-14 text-center">
          <Package className="size-10 mx-auto text-muted-foreground/30 mb-3" strokeWidth={1.5} />
          <p className="font-semibold text-sm">No orders here</p>
          <p className="text-muted-foreground text-xs mt-1">Orders matching this filter will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((o) => {
            const meta = STATUS_META[o.status] ?? STATUS_META.placed;
            return (
              <Link
                key={o.id}
                href={`/order/${o.id}/details`}
                className="bg-white rounded-2xl border overflow-hidden hover:shadow-md transition-shadow flex items-center gap-3 px-4 py-4 group"
              >
                {/* Order thumb stack */}
                <div className="flex items-center -space-x-2 shrink-0">
                  {o.items.slice(0, 3).map((it) => {
                    const p = resolveProduct(it.id);
                    return p ? (
                      <img key={it.id} src={p.image}
                        className="size-10 rounded-xl object-cover border-2 border-white shadow-sm"
                        alt="" />
                    ) : null;
                  })}
                  {o.items.length > 3 && (
                    <span className="size-10 rounded-xl bg-secondary border-2 border-white flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                      +{o.items.length - 3}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold truncate">{o.id}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {new Date(o.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    {" · "}{o.items.length} item{o.items.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Status + total + chevron */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${meta.cls}`}>
                    {meta.label}
                  </span>
                  <Price amount={o.total} size="sm" className="!font-bold hidden sm:inline-flex" />
                  <ChevronRight className="size-4 text-muted-foreground group-hover:text-black transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Notifications Tab ────────────────────────────────────────────── */
function NotificationsTab() {
  return (
    <div className="animate-fade-up">
      <EmptyState icon={Bell} title="No notifications" desc={"You're all caught up! We'll notify you about orders and offers."} />
    </div>
  );
}

/* ── Addresses Tab ────────────────────────────────────────────────── */
type AddressFormState = Omit<Address, "id">;
const EMPTY_FORM: AddressFormState = { label: "Home", name: "", phone: "", line1: "", line2: "", city: "", district: "", isDefault: false };

function AddressesTab() {
  const { addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (a: Address) => { setEditing(a); setModalOpen(true); };

  const handleSave = (form: AddressFormState) => {
    if (editing) {
      updateAddress(editing.id, form);
      toast.success("Address updated");
    } else {
      addAddress(form);
      toast.success("Address added");
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteAddress(id);
    toast("Address removed");
  };

  return (
    <div className="animate-fade-up space-y-4 lg:space-y-5">
      {/* Action bar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Saved addresses for faster checkout</p>
        <button
          onClick={openAdd}
          className="shrink-0 h-9 px-3.5 rounded-xl bg-black text-white text-xs font-semibold hover:bg-accent active:scale-[0.98] transition-all duration-200 inline-flex items-center gap-1.5"
        >
          <Plus className="size-3.5" strokeWidth={2} /> Add New
        </button>
      </div>

      {/* List or empty state */}
      {addresses.length === 0 ? (
        <div className="bg-white rounded-2xl border shadow-sm py-16 text-center">
          <div className="mx-auto size-16 rounded-full bg-secondary flex items-center justify-center mb-5">
            <MapPin className="size-7 text-muted-foreground/70" />
          </div>
          <p className="font-bold text-base">No Addresses Found</p>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
            {"You haven't saved any addresses yet. Add one now for a faster checkout experience."}
          </p>
          <button
            onClick={openAdd}
            className="mt-6 h-10 px-7 rounded-full border-2 border-black text-sm font-bold hover:bg-black hover:text-white transition"
          >
            Add New Address
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-3 relative">
              {a.isDefault && (
                <span className="absolute top-4 right-4 text-[10px] px-2.5 py-1 rounded-full bg-black text-white font-semibold">
                  Default
                </span>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">
                  {a.label}
                </span>
              </div>
              <div>
                <p className="font-bold">{a.name}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{a.line1}{a.line2 ? `, ${a.line2}` : ""}</p>
                <p className="text-sm text-muted-foreground">{a.city}, {a.district}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{a.phone}</p>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t mt-auto">
                {!a.isDefault && (
                  <button
                    onClick={() => setDefaultAddress(a.id)}
                    className="flex items-center gap-1.5 text-xs text-black font-semibold hover:text-accent transition"
                  >
                    <Star className="size-3.5" /> Set default
                  </button>
                )}
                <div className="ml-auto flex items-center gap-1">
                  <button
                    onClick={() => openEdit(a)}
                    className="size-8 rounded-xl hover:bg-secondary flex items-center justify-center text-muted-foreground/70 hover:text-black transition"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="size-8 rounded-xl hover:bg-accent/10 flex items-center justify-center text-muted-foreground/70 hover:text-accent transition"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add new card */}
          <button
            onClick={openAdd}
            className="bg-white rounded-2xl border border-dashed shadow-sm p-5 flex flex-col items-center justify-center gap-2 text-muted-foreground/70 hover:border-black hover:text-black transition min-h-40"
          >
            <Plus className="size-7 opacity-40" />
            <p className="text-sm font-medium">Add new address</p>
          </button>
        </div>
      )}

      {/* Address Form Modal */}
      {modalOpen && (
        <AddressFormModal
          initial={editing ?? undefined}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

const LABELS = ["Home", "Work", "Other"];

function AddressFormModal({ initial, onSave, onClose }: {
  initial?: Address;
  onSave: (form: AddressFormState) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<AddressFormState>(
    initial
      ? { label: initial.label, name: initial.name, phone: initial.phone, line1: initial.line1, line2: initial.line2 ?? "", city: initial.city, district: initial.district, isDefault: initial.isDefault }
      : { ...EMPTY_FORM }
  );

  const set = (k: keyof AddressFormState, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.line1 || !form.city || !form.district) {
      toast.error("Please fill all required fields");
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <h2 className="font-bold text-lg">{initial ? "Edit Address" : "Add New Address"}</h2>
          <button onClick={onClose} className="size-8 rounded-full bg-secondary flex items-center justify-center hover:bg-border transition">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Label selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">Address Type</label>
            <div className="flex gap-2">
              {LABELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => set("label", l)}
                  className={`h-8 px-4 rounded-full text-xs font-semibold border transition ${
                    form.label === l ? "bg-black text-white border-black" : "border-gray-200 hover:border-black"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Full Name *" value={form.name} onChange={(v) => set("name", v)} placeholder="Recipient name" />
            <FormField label="Phone *" value={form.phone} onChange={(v) => set("phone", v)} placeholder="+880 1xxx xxxxxx" />
          </div>
          <FormField label="Address Line 1 *" value={form.line1} onChange={(v) => set("line1", v)} placeholder="House/Road/Area" />
          <FormField label="Address Line 2" value={form.line2 ?? ""} onChange={(v) => set("line2", v)} placeholder="Apartment, floor (optional)" />
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="City *" value={form.city} onChange={(v) => set("city", v)} placeholder="e.g. Dhaka" />
            <FormField label="District *" value={form.district} onChange={(v) => set("district", v)} placeholder="e.g. Dhaka" />
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none pt-1">
            <div
              onClick={() => set("isDefault", !form.isDefault)}
              className={`w-10 h-5 rounded-full relative transition ${form.isDefault ? "bg-black" : "bg-border"}`}
            >
              <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-all ${form.isDefault ? "left-5" : "left-0.5"}`} />
            </div>
            <span className="text-sm font-medium">Set as default address</span>
          </label>
        </form>

        <div className="px-6 pb-6 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 h-11 rounded-full border border-gray-300 text-sm font-semibold hover:bg-secondary/60 transition">
            Cancel
          </button>
          <button
            onClick={submit}
            className="flex-1 h-11 rounded-full bg-black text-white text-sm font-semibold hover:bg-accent transition"
          >
            {initial ? "Save Changes" : "Add Address"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 px-4 rounded-xl border bg-secondary/60 text-sm outline-none focus:border-black transition"
      />
    </div>
  );
}

/* ── Settings Tab ─────────────────────────────────────────────────── */
function SettingsTab({ user }: { user: { name: string; phone: string; email?: string } }) {
  const [firstName, lastName] = (() => {
    const parts = user.name.trim().split(/\s+/);
    return [parts[0] ?? "", parts.slice(1).join(" ")];
  })();

  const [first, setFirst] = useState(firstName);
  const [last, setLast] = useState(lastName);
  const [email, setEmail] = useState(user.email ?? "");

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const saveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!first.trim() || !email.trim()) {
      toast.error("First name and email are required");
      return;
    }
    toast.success("Account details saved");
  };

  const changePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPw || !newPw || !confirmPw) {
      toast.error("Please fill all password fields");
      return;
    }
    if (newPw.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("New passwords do not match");
      return;
    }
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    toast.success("Password updated");
  };

  return (
    <div className="animate-fade-up space-y-4 lg:space-y-5">

      {/* ── Account Settings ─────────────────────────────────────── */}
      <form
        onSubmit={saveAccount}
        className="bg-white rounded-2xl border shadow-[0_1px_3px_oklch(0_0_0/0.04)] p-5 sm:p-6 lg:p-7"
      >
        <h3 className="text-[15px] sm:text-base lg:text-lg font-bold tracking-tight">
          Account Settings
        </h3>

        <div className="mt-5 lg:mt-6 grid sm:grid-cols-2 gap-4 lg:gap-5">
          <SettingsField
            id="first-name"
            label="First Name"
            value={first}
            onChange={setFirst}
            placeholder="John"
          />
          <SettingsField
            id="last-name"
            label="Last Name"
            value={last}
            onChange={setLast}
            placeholder="Doe"
          />
        </div>

        <div className="mt-4 lg:mt-5">
          <SettingsField
            id="email-address"
            label="Email Address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="john.doe@example.com"
          />
        </div>

        <button
          type="submit"
          className="
            mt-6 inline-flex items-center justify-center
            h-10 lg:h-11 px-5 lg:px-6 rounded-full
            bg-black text-white text-xs lg:text-sm font-semibold
            hover:bg-accent active:scale-[0.98]
            transition-all duration-200 ease-out
          "
        >
          Save Changes
        </button>
      </form>

      {/* ── Change Password ──────────────────────────────────────── */}
      <form
        onSubmit={changePassword}
        className="bg-white rounded-2xl border shadow-[0_1px_3px_oklch(0_0_0/0.04)] p-5 sm:p-6 lg:p-7"
      >
        <h3 className="text-[15px] sm:text-base lg:text-lg font-bold tracking-tight">
          Change Password
        </h3>

        <div className="mt-5 lg:mt-6">
          <SettingsField
            id="current-password"
            label="Current Password"
            type="password"
            value={currentPw}
            onChange={setCurrentPw}
            placeholder="••••••••"
          />
        </div>

        <div className="mt-4 lg:mt-5 grid sm:grid-cols-2 gap-4 lg:gap-5">
          <SettingsField
            id="new-password"
            label="New Password"
            type="password"
            value={newPw}
            onChange={setNewPw}
            placeholder="••••••••"
          />
          <SettingsField
            id="confirm-password"
            label="Confirm Password"
            type="password"
            value={confirmPw}
            onChange={setConfirmPw}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="
            mt-6 inline-flex items-center justify-center
            h-10 lg:h-11 px-5 lg:px-6 rounded-full
            bg-black text-white text-xs lg:text-sm font-semibold
            hover:bg-accent active:scale-[0.98]
            transition-all duration-200 ease-out
          "
        >
          Change Password
        </button>
      </form>
    </div>
  );
}

function SettingsField({
  id, label, value, onChange, placeholder, type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "password";
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[12px] lg:text-[13px] font-semibold text-foreground mb-2"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="
          w-full h-10 lg:h-11 px-3.5 lg:px-4
          rounded-xl border border-gray-200 bg-white
          text-sm placeholder:text-muted-foreground/70
          outline-none transition-all duration-200
          hover:border-gray-300
          focus:border-black focus:ring-4 focus:ring-black/5
        "
      />
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────────────── */
function SectionTitle({
  icon: Icon,
  children,
}: {
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4 lg:mb-5">
      {Icon && (
        <div className="size-9 lg:size-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
          <Icon className="size-[18px] lg:size-5 text-black" strokeWidth={2} />
        </div>
      )}
      <h2 className="text-[17px] sm:text-[18px] lg:text-[20px] font-bold tracking-tight">
        {children}
      </h2>
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc, cta }: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  desc: string;
  cta?: { to: string; label: string };
}) {
  return (
    <div className="bg-white rounded-2xl border shadow-[0_1px_3px_oklch(0_0_0/0.04)] py-12 lg:py-14 px-6 text-center">
      <div className="mx-auto size-12 lg:size-14 rounded-2xl bg-secondary flex items-center justify-center mb-4">
        <Icon className="size-6 lg:size-7 text-muted-foreground/70" strokeWidth={2} />
      </div>
      <p className="text-[15px] lg:text-base font-bold">{title}</p>
      <p className="mt-1 text-[13px] lg:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">{desc}</p>
      {cta && (
        <Link href={cta.to} className="inline-block mt-5 h-10 px-6 rounded-xl bg-black text-white text-sm font-semibold leading-[40px] hover:bg-accent active:scale-[0.98] transition-all duration-200">
          {cta.label}
        </Link>
      )}
    </div>
  );
}

export default ProfilePage;
