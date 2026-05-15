"use client";

import Link from "next/link";
import { SUBCATEGORIES } from "@/lib/products";

export function SubcategorySection({ slug, title }: { slug: string; title: string }) {
  const subs = SUBCATEGORIES[slug];
  if (!subs || subs.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-0.5">Shop by</p>
          <h3 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-[2rem]">{title}</h3>
        </div>
        <Link
          href={`/category/${slug}`}
          className="text-xs font-semibold text-muted-foreground hover:text-foreground transition"
        >
          View all 
        </Link>
      </div>

      {/* Subcategory cards */}
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6 sm:gap-3">
        {subs.map(({ label, image }) => (
          <Link
            key={label}
            href={`/category/${slug}?sub=${encodeURIComponent(label)}`}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card hover:border-foreground/30 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
          >
            {/* Image */}
            <div className="relative w-full aspect-4/3 overflow-hidden bg-secondary">
              <img
                src={image}
                alt={label}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
              {/* Label on image */}
              <div className="absolute inset-0 flex items-end p-2.5">
                <span className="text-[11px] sm:text-xs font-bold text-white leading-tight drop-shadow-sm">
                  {label}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
