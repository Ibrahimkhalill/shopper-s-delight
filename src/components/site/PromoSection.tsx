"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const U = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=480&h=480&q=80`;

const cards = [
  {
    href: "/category/beauty",
    bg: "bg-[#e8f5f0]",
    eyebrow: "Premium",
    title: "Skincare & Beauty\nEssentials",
    sub: "Get Extra 30% Off",
    img: U("photo-1591130901921-3f0652bb3915"),
    imgAlt: "Skincare products",
    imgPos: "right-0 bottom-0 h-[85%]",
  },
  {
    href: "/category/grocery",
    bg: "bg-[#fff9e6]",
    eyebrow: "Premium",
    title: "Healthy Food Habits\nfor Everyday Life",
    sub: "Get Extra 50% Off",
    img: U("photo-1587049352846-4a222e784d38"),
    imgAlt: "Honey jar grocery",
    imgPos: "right-2 bottom-0 h-[88%]",
  },
  {
    href: "/category/gadgets",
    bg: "bg-[#eef2ff]",
    eyebrow: "New Arrival",
    title: "Smart Gadgets\nfor Modern Life",
    sub: "Up to 40% Off",
    img: U("photo-1523275335684-37898b6baf30"),
    imgAlt: "Smart watch",
    imgPos: "right-2 bottom-0 h-[90%]",
  },
  {
    href: "/category/fashion",
    bg: "bg-[#fdf2f0]",
    eyebrow: "Trending",
    title: "Fashion Made\nfor You",
    sub: "New styles every week",
    img: U("photo-1542291026-7eec264c27ff"),
    imgAlt: "Fashion shoes",
    imgPos: "right-0 bottom-0 h-[85%]",
  },
];

export function PromoSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-10 lg:px-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {cards.map((c) => (
          <Link
            key={c.href + c.title}
            href={c.href}
            className={`group relative flex min-h-[190px] sm:min-h-[220px] overflow-hidden rounded-2xl ${c.bg} p-6 sm:p-7`}
          >
            {/* Text */}
            <div className="relative z-10 flex flex-col justify-between h-full max-w-[55%]">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/50 mb-2">
                  {c.eyebrow}
                </p>
                <h3 className="text-[17px] sm:text-[19px] font-bold leading-snug tracking-tight text-foreground whitespace-pre-line">
                  {c.title}
                </h3>
                <p className="mt-2 text-[13px] font-semibold text-foreground/60">
                  {c.sub}
                </p>
              </div>
              <div className="mt-5">
                <span className="inline-flex items-center gap-2 bg-foreground text-background text-xs font-bold px-4 py-2.5 rounded-full transition-all group-hover:bg-accent group-hover:gap-3">
                  Shop Now
                  <span className="size-5 rounded-full bg-white/20 flex items-center justify-center">
                    <ArrowUpRight className="size-3" />
                  </span>
                </span>
              </div>
            </div>

            {/* Product image — floats right */}
            <div className={`absolute ${c.imgPos} w-[48%] pointer-events-none`}>
              <img
                src={c.img}
                alt={c.imgAlt}
                className="w-full h-full object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-[1.04] group-hover:-translate-y-1"
                loading="lazy"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
