"use client";

import { Flame, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "./ProductCard";
import { PRODUCTS } from "@/lib/products";
import { useT } from "@/lib/i18n";

export function TrendingSection() {
  const { t, lang } = useT();
  const items = PRODUCTS.slice(0, 5).map((p) => ({
    ...p,
    badge: { label: t("badge.trending"), tone: "trending" as const },
  }));

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:py-12 md:py-14 lg:px-6 lg:py-20">
      {/* Header */}
      <div className={`mb-7 flex items-end justify-between gap-4 sm:mb-8 lg:mb-12 ${lang === "bn" ? "font-bn" : ""}`}>
        <div className="flex min-w-0 items-center gap-3 sm:gap-3.5 lg:gap-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-sm sm:size-11 lg:size-14 lg:rounded-[1.25rem]">
            <Flame className="size-4 sm:size-[1.125rem] lg:size-6" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent lg:text-[13px]">
              {t("sec.trending.eyebrow")}
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-balance sm:text-2xl md:text-2xl lg:mt-1.5 lg:text-[2.125rem] lg:tracking-[-0.02em]">
              {t("sec.trending.title")}
            </h2>
          </div>
        </div>
        <Link
          href="/category/gadgets"
          className="flex shrink-0 items-center gap-1 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground sm:text-sm lg:gap-1.5 lg:text-base"
        >
          {t("sec.viewall")} <ArrowRight className="size-3.5 lg:size-4" />
        </Link>
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="-mx-4 overflow-x-auto px-4 no-scrollbar sm:hidden">
        <div className="flex snap-x snap-mandatory gap-3 pb-1">
          {items.map((p) => (
            <div key={p.id} className="w-[52vw] shrink-0 snap-start">
              <ProductCard p={p} />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: grid */}
      <div className="hidden grid-cols-3 gap-4 sm:grid lg:grid-cols-5 lg:gap-6">
        {items.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}
