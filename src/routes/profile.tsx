import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { PageHeader } from "@/components/site/PageHeader";
import { useStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { Package, Heart, MapPin, LogOut, User as UserIcon, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/site/ProductCard";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({ component: ProfilePage });

const TABS = [
  { id: "orders" as const, label: "Orders", icon: Package },
  { id: "wishlist" as const, label: "Wishlist", icon: Heart },
  { id: "address" as const, label: "Profile info", icon: UserIcon },
];

function ProfilePage() {
  const { user, orders, wishlist, logout, resolveProduct } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"orders" | "wishlist" | "address">("orders");

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user, navigate]);
  if (!user) return null;

  const counts: Record<string, number | undefined> = {
    orders: orders.length,
    wishlist: wishlist.length,
    address: undefined,
  };

  return (
    <Layout>
      <PageHeader
        title={user.name}
        subtitle={`${user.phone}${user.email ? ` · ${user.email}` : ""}`}
        crumbs={[{ label: "Home", to: "/" }, { label: "My Account" }]}
        badge={
          <div className="inline-flex items-center gap-2">
            <div className="size-10 rounded-full bg-foreground text-background flex items-center justify-center text-base font-bold">
              {user.name[0]?.toUpperCase()}
            </div>
          </div>
        }
        actions={
          <button
            onClick={() => { logout(); toast("Signed out"); navigate({ to: "/" }); }}
            className="h-9 px-4 rounded-full border text-xs font-medium inline-flex items-center gap-1.5 hover:border-accent hover:text-accent transition"
          >
            <LogOut className="size-3.5" /> Sign out
          </button>
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-6 animate-fade-up">
        {/* Mobile tab strip */}
        <div className="flex gap-1 p-1 rounded-2xl bg-secondary mb-6 lg:hidden">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-semibold transition ${
                tab === t.id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
              }`}
            >
              <t.icon className="size-3.5" />
              {t.label}
              {counts[t.id] !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tab === t.id ? "bg-secondary text-foreground" : "bg-background/60"}`}>
                  {counts[t.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-[220px_1fr] gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block space-y-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                  tab === t.id ? "bg-foreground text-background" : "hover:bg-secondary"
                }`}
              >
                <t.icon className="size-4" />
                <span className="flex-1 text-left">{t.label}</span>
                {counts[t.id] !== undefined && (
                  <span className="text-xs opacity-70">{counts[t.id]}</span>
                )}
              </button>
            ))}
          </aside>

          {/* Content */}
          <div>
            {tab === "orders" && (
              orders.length === 0 ? (
                <Empty icon={Package} title="No orders yet" desc="Your order history will show here." cta={{ to: "/", label: "Start shopping" }} />
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => (
                    <Link key={o.id} to="/order/$id" params={{ id: o.id }}
                      className="group block rounded-2xl border bg-card p-4 sm:p-5 hover:shadow-md hover:border-foreground/20 transition"
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <p className="font-semibold text-sm">{o.id}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(o.createdAt).toLocaleDateString()} · {o.items.length} {o.items.length === 1 ? "item" : "items"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2.5 py-1 rounded-full bg-secondary capitalize font-medium">{o.status}</span>
                          <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground transition" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        {o.items.slice(0, 5).map((it) => {
                          const p = resolveProduct(it.id);
                          return p ? (
                            <img key={it.id} src={p.image} className="size-11 rounded-xl object-cover border shrink-0" alt="" />
                          ) : null;
                        })}
                        {o.items.length > 5 && (
                          <span className="size-11 rounded-xl bg-secondary border flex items-center justify-center text-xs text-muted-foreground shrink-0">
                            +{o.items.length - 5}
                          </span>
                        )}
                        <span className="ml-auto font-bold tabular-nums text-sm">৳{o.total.toLocaleString()}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            )}

            {tab === "wishlist" && (
              wishlist.length === 0 ? (
                <Empty icon={Heart} title="Your wishlist is empty" desc="Save items you love for later." cta={{ to: "/", label: "Discover products" }} />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {wishlist.map(resolveProduct).filter(Boolean).map((p) => p && <ProductCard key={p.id} p={p} />)}
                </div>
              )
            )}

            {tab === "address" && (
              <div className="rounded-2xl border bg-card p-5 sm:p-6 max-w-xl">
                <p className="font-semibold flex items-center gap-2 mb-5">
                  <MapPin className="size-4 text-accent" /> Profile details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-secondary p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Full name</p>
                    <p className="mt-1 font-medium">{user.name}</p>
                  </div>
                  <div className="rounded-xl bg-secondary p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Phone</p>
                    <p className="mt-1 font-medium">{user.phone}</p>
                  </div>
                  {user.email && (
                    <div className="sm:col-span-2 rounded-xl bg-secondary p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
                      <p className="mt-1 font-medium">{user.email}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function Empty({ icon: Icon, title, desc, cta }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  cta: { to: string; label: string };
}) {
  return (
    <div className="rounded-2xl border bg-card p-10 text-center">
      <div className="mx-auto size-14 rounded-full bg-secondary flex items-center justify-center">
        <Icon className="size-6 text-muted-foreground" />
      </div>
      <p className="mt-4 font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <Link to={cta.to} className="inline-block mt-4 h-10 px-5 rounded-full bg-foreground text-background text-sm font-medium leading-[2.5rem]">
        {cta.label}
      </Link>
    </div>
  );
}
