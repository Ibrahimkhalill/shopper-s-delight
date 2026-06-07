"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingCart, Users, X,
  BarChart2, LogOut, Layers, Palette, Ruler, Award, Percent, Store,
  Image, Layout, Home,
} from "lucide-react";
import { useAdminStore } from "@/lib/admin-store";
import { useRouter } from "next/navigation";

const NAV = [
  {
    label: null,
    items: [{ icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" }],
  },
  {
    label: "PRODUCT MANAGEMENT",
    items: [
      { icon: Package,  label: "Products",    href: "/admin/products" },
      { icon: Layers,   label: "Categories",  href: "/admin/categories" },
      { icon: Store,    label: "Brands",      href: "/admin/brands" },
      { icon: Ruler,    label: "Sizes",       href: "/admin/sizes" },
      { icon: Palette,  label: "Colors",      href: "/admin/colors" },
      { icon: Award,    label: "Badges",      href: "/admin/badges" },
    ],
  },
  {
    label: "CONTENT",
    items: [
      { icon: Image,   label: "Hero Slider",    href: "/admin/banners" },
      { icon: Layout,  label: "Promo Banners",  href: "/admin/promos" },
      { icon: Home,    label: "Homepage Config", href: "/admin/homepage" },
    ],
  },
  {
    label: "SALES",
    items: [
      { icon: Percent, label: "Offers & Coupons", href: "/admin/offers" },
    ],
  },
  {
    label: "ORDER MANAGEMENT",
    items: [
      { icon: ShoppingCart, label: "Orders",  href: "/admin/orders" },
    ],
  },
  {
    label: "CUSTOMERS",
    items: [
      { icon: Users,        label: "All Customers", href: "/admin/customers" },
    ],
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AdminSidebar({ open, onClose }: Props) {
  const pathname = usePathname();
  const { adminLogout } = useAdminStore();
  const router = useRouter();

  const handleLogout = () => {
    adminLogout();
    router.push("/admin/login");
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/10 shrink-0">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold text-[#ef4444]">SHOP</span>
          <span className="text-xl font-bold text-white">.BD</span>
          <span className="text-[10px] font-semibold bg-white/10 text-white/70 px-1.5 py-0.5 rounded-md ml-1">ADMIN</span>
        </Link>
        <button onClick={onClose} className="lg:hidden text-white/60 hover:text-white transition">
          <X className="size-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-2 mb-2">
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? "bg-[#ef4444] text-white shadow-lg shadow-red-500/20"
                          : "text-white/60 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <item.icon className="size-4 shrink-0" strokeWidth={active ? 2.5 : 2} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-3 space-y-1 shrink-0">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition"
        >
          <BarChart2 className="size-4" strokeWidth={2} />
          View Store
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-red-400 hover:bg-red-500/10 transition"
        >
          <LogOut className="size-4" strokeWidth={2} />
          Logout
        </button>
        <div className="flex items-center gap-3 px-3 py-2.5 mt-1">
          <div className="size-8 rounded-full bg-[#ef4444] flex items-center justify-center text-white text-xs font-bold shrink-0">
            A
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">Admin User</p>
            <p className="text-xs text-white/40 truncate">admin@shopbd.com</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-[#0f172a] h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[#0f172a] flex flex-col animate-slide-left">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
