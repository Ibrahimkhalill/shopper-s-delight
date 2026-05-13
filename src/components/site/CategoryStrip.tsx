"use client";

import type { StaticImageData } from "next/image";
import Link from "next/link";
import { useT, dict } from "@/lib/i18n";
import gadgets from "@/assets/cat-gadgets.jpg";
import fashion from "@/assets/cat-fashion.jpg";
import home from "@/assets/cat-home.jpg";
import beauty from "@/assets/cat-beauty.jpg";
import grocery from "@/assets/cat-grocery.jpg";
import deals from "@/assets/cat-deals.jpg";

const cats: { key: keyof typeof dict; slug: string; img: string | StaticImageData }[] = [
  { key: "cat.gadgets", slug: "gadgets", img: gadgets },
  { key: "cat.fashion", slug: "fashion", img: fashion },
  { key: "cat.home",    slug: "home",    img: home },
  { key: "cat.beauty",  slug: "beauty",  img: beauty },
  { key: "cat.grocery", slug: "grocery", img: grocery },
  { key: "cat.deals",   slug: "deals",   img: deals },
];

export function CategoryStrip() {
  const { t, lang } = useT();
  return (
    <section className="mx-auto max-w-7xl px-4 pt-8 sm:pt-10">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
        {cats.map(({ key, slug, img }) => (
          <Link
            key={slug}
            href={`/category/${slug}`}
            className="group flex flex-col items-center justify-center gap-2 sm:gap-3 rounded-2xl border border-border bg-card py-3 sm:py-4 px-2 transition hover:border-foreground hover:shadow-md hover-lift"
          >
            <span className="size-14 sm:size-20 rounded-full overflow-hidden ring-1 ring-border bg-secondary">
              <img
                src={typeof img === "string" ? img : img.src}
                alt={t(key)}
                width={512}
                height={512}
                loading="lazy"
                className="size-full object-cover transition duration-500 group-hover:scale-110"
              />
            </span>
            <span className={`text-[11px] sm:text-sm font-medium text-center leading-tight ${lang === "bn" ? "font-bn" : ""}`}>
              {t(key)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
