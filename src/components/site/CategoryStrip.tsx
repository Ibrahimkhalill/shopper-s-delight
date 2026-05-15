"use client";

import Image from "next/image";
import Link from "next/link";
import { useT, dict } from "@/lib/i18n";
import gadgets from "@/assets/cat-gadgets.jpg";
import fashion from "@/assets/cat-fashion.jpg";
import home from "@/assets/cat-home.jpg";
import beauty from "@/assets/cat-beauty.jpg";
import grocery from "@/assets/cat-grocery.jpg";
import deals from "@/assets/cat-deals.jpg";
import type { StaticImageData } from "next/image";

const cats: { key: keyof typeof dict; slug: string; img: StaticImageData; bg: string; color: string }[] = [
  { key: "cat.gadgets", slug: "gadgets", img: gadgets, bg: "#dbeafe", color: "#3b82f6" },
  { key: "cat.fashion", slug: "fashion", img: fashion, bg: "#fce7f3", color: "#ec4899" },
  { key: "cat.home",    slug: "home",    img: home,    bg: "#ffedd5", color: "#f97316" },
  { key: "cat.beauty",  slug: "beauty",  img: beauty,  bg: "#f3e8ff", color: "#a855f7" },
  { key: "cat.grocery", slug: "grocery", img: grocery, bg: "#dcfce7", color: "#22c55e" },
  { key: "cat.deals",   slug: "deals",   img: deals,   bg: "#fee2e2", color: "#ef4444" },
];

export function CategoryStrip() {
  const { t, lang } = useT();
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-8 sm:pt-12 lg:px-6">
      <div className="mb-6 sm:mb-8">
        <p className="text-[11px] font-bold uppercase tracking-widest text-accent sm:text-xs mb-1">Categories</p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-[2rem]">Shop By Category</h2>
      </div>
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6 sm:gap-3">
        {cats.map(({ key, slug, img, bg, color }) => (
          <Link
            key={slug}
            href={`/category/${slug}`}
            className="group flex flex-col items-center rounded-2xl border border-border bg-card transition-all duration-300 hover:border-foreground/20 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex flex-col items-center gap-2 px-2 py-4 sm:py-5 w-full">
              <div className="relative size-14 overflow-hidden rounded-full ring-2 ring-transparent transition-all duration-300 group-hover:ring-foreground/20 sm:size-18" style={{ backgroundColor: bg }}>
                <Image
                  src={img}
                  alt={t(key)}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="72px"
                />
              </div>
              <span className={`text-[11px] font-bold text-center leading-tight sm:text-xs ${lang === "bn" ? "font-bn" : ""}`} style={{ color }}>
                {t(key)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
