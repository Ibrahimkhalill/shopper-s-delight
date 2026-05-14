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

const cats: { key: keyof typeof dict; slug: string; img: StaticImageData }[] = [
  { key: "cat.gadgets", slug: "gadgets", img: gadgets },
  { key: "cat.fashion", slug: "fashion", img: fashion },
  { key: "cat.home",    slug: "home",    img: home    },
  { key: "cat.beauty",  slug: "beauty",  img: beauty  },
  { key: "cat.grocery", slug: "grocery", img: grocery },
  { key: "cat.deals",   slug: "deals",   img: deals   },
];

export function CategoryStrip() {
  const { t, lang } = useT();
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-6 sm:pt-10 lg:px-6">
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6 sm:gap-3">
        {cats.map(({ key, slug, img }) => (
          <Link
            key={slug}
            href={`/category/${slug}`}
            className="group flex flex-col items-center overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-foreground/30 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex flex-col items-center gap-2 px-2 py-4 sm:py-5 w-full">
              <div className="relative size-14 overflow-hidden rounded-full bg-secondary ring-2 ring-border/60 transition-all duration-300 group-hover:ring-foreground/30 sm:size-18">
                <Image
                  src={img}
                  alt={t(key)}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="72px"
                />
              </div>
              <span className={`text-[11px] font-semibold text-center leading-tight text-foreground sm:text-xs ${lang === "bn" ? "font-bn" : ""}`}>
                {t(key)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
