import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { useStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { Package, Heart, MapPin, LogOut, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({ component: ProfilePage });

function ProfilePage() {
  const { user, orders, wishlist, logout, resolveProduct } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"orders" | "wishlist" | "address">("orders");

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user, navigate]);
  if (!user) return null;

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-10 animate-fade-up">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-full bg-foreground text-background flex items-center justify-center text-xl font-semibold">{user.name[0]?.toUpperCase()}</div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{user.name}</h1>
            <p className="text-sm text-muted-foreground">{user.phone}{user.email && ` · ${user.email}`}</p>
          </div>
          <button onClick={() => { logout(); toast("Signed out"); navigate({ to: "/" }); }} className="ml-auto inline-flex items-center gap-2 h-10 px-4 rounded-full border text-sm hover:border-accent hover:text-accent transition"><LogOut className="size-4" /> Sign out</button>
        </div>

        <div className="mt-8 grid lg:grid-cols-[220px_1fr] gap-8">
          <aside className="space-y-1">
            {[
              { id: "orders" as const, t: "Orders", icon: Package, count: orders.length },
              { id: "wishlist" as const, t: "Wishlist", icon: Heart, count: wishlist.length },
              { id: "address" as const, t: "Profile info", icon: UserIcon },
            ].map((m) => (
              <button key={m.id} onClick={() => setTab(m.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${tab === m.id ? "bg-foreground text-background" : "hover:bg-secondary"}`}>
                <m.icon className="size-4" />
                <span className="flex-1 text-left">{m.t}</span>
                {m.count !== undefined && <span className="text-xs opacity-70">{m.count}</span>}
              </button>
            ))}
          </aside>

          <div>
            {tab === "orders" && (
              orders.length === 0 ? (
                <Empty icon={Package} title="No orders yet" desc="Your order history will show here." cta={{ to: "/", label: "Start shopping" }} />
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => (
                    <Link key={o.id} to="/order/$id" params={{ id: o.id }} className="block rounded-2xl border p-5 hover-lift">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <p className="font-semibold">Order {o.id}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{new Date(o.createdAt).toLocaleString()} · {o.items.length} items</p>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-secondary capitalize">{o.status}</span>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        {o.items.slice(0, 4).map((it) => {
                          const p = resolveProduct(it.id);
                          return p ? <img key={it.id} src={p.image} className="size-12 rounded-lg object-cover border" alt="" /> : null;
                        })}
                        {o.items.length > 4 && <span className="text-xs text-muted-foreground">+{o.items.length - 4}</span>}
                        <span className="ml-auto font-semibold tabular-nums">৳{o.total.toLocaleString()}</span>
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
                <Link to="/wishlist" className="text-accent text-sm font-medium">Open wishlist →</Link>
              )
            )}

            {tab === "address" && (
              <div className="rounded-2xl border p-6 max-w-xl">
                <p className="font-medium flex items-center gap-2"><MapPin className="size-4" /> Profile details</p>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-xs text-muted-foreground">Name</p><p className="mt-0.5">{user.name}</p></div>
                  <div><p className="text-xs text-muted-foreground">Phone</p><p className="mt-0.5">{user.phone}</p></div>
                  {user.email && <div className="col-span-2"><p className="text-xs text-muted-foreground">Email</p><p className="mt-0.5">{user.email}</p></div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function Empty({ icon: Icon, title, desc, cta }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string; cta: { to: string; label: string } }) {
  return (
    <div className="rounded-2xl border p-10 text-center">
      <div className="mx-auto size-14 rounded-full bg-secondary flex items-center justify-center"><Icon className="size-6 text-muted-foreground" /></div>
      <p className="mt-4 font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <Link to={cta.to} className="inline-block mt-4 h-10 px-5 rounded-full bg-foreground text-background text-sm font-medium leading-[2.5rem]">{cta.label}</Link>
    </div>
  );
}