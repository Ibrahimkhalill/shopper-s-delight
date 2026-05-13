"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "./ProductCard";
import { PRODUCTS } from "@/lib/products";
import { useT } from "@/lib/i18n";

export function FeaturedGrid() {
  const { t, lang } = useT();
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:py-14 md:py-16 lg:px-6 lg:py-20">
      {/* Section header */}
      <div className={`mb-7 flex items-end justify-between gap-4 sm:mb-8 lg:mb-12 ${lang === "bn" ? "font-bn" : ""}`}>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent lg:text-[13px]">
            {t("sec.featured.eyebrow")}
          </p>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-balance sm:text-2xl md:text-2xl lg:mt-3 lg:text-[2.125rem] lg:tracking-[-0.02em]">
            {t("sec.featured.title")}
          </h2>
        </div>
        <Link
          href="/category/deals"
          className="flex shrink-0 items-center gap-1 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground sm:text-sm lg:gap-1.5 lg:text-base"
        >
          {t("sec.viewall")} <ArrowRight className="size-3.5 lg:size-4" />
        </Link>
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="-mx-4 overflow-x-auto px-4 no-scrollbar sm:hidden">
        <div className="flex snap-x snap-mandatory gap-3 pb-1">
          {PRODUCTS.slice(0, 5).map((p) => (
            <div key={p.id} className="w-[52vw] shrink-0 snap-start">
              <ProductCard p={p} />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: grid */}
      <div className="hidden grid-cols-3 gap-4 sm:grid lg:grid-cols-5 lg:gap-6">
        {PRODUCTS.slice(0, 5).map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}
