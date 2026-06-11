"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import heroImg from "@/assets/hero-shopping.png";
import { getAdminHeroSlides } from "@/lib/admin-config";
import type { HeroSlide } from "@/lib/admin-store";
import { HeroSkeleton } from "./skeletons";

export function HeroSlider() {
  const [slides, setSlides] = useState<HeroSlide[] | null>(null);
  const [i, setI]           = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setSlides(getAdminHeroSlides());
  }, []);

  const total = slides?.length ?? 0;
  const next = useCallback(() => setI((p) => (p + 1) % Math.max(total, 1)), [total]);
  const prev = useCallback(() => setI((p) => (p - 1 + Math.max(total, 1)) % Math.max(total, 1)), [total]);

  useEffect(() => {
    if (paused || total === 0) return;
    const tm = setInterval(next, 5500);
    return () => clearInterval(tm);
  }, [next, paused, total]);

  // Still reading config from storage — shimmer placeholder, no flash.
  if (slides === null) return <HeroSkeleton />;

  if (slides.length === 0) {
    return (
      <section className="mx-auto w-full min-w-0 max-w-7xl overflow-x-clip px-4 pt-4 sm:pt-6">
        <div className="relative min-h-[480px] w-full overflow-hidden rounded-2xl sm:min-h-[520px] md:min-h-[540px] md:rounded-3xl bg-gradient-to-br from-zinc-900 via-black to-black flex items-center justify-center">
          <p className="text-white/40 text-sm">No hero slides configured</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full min-w-0 max-w-7xl overflow-x-clip px-4 pt-4 sm:pt-6">
      <div
        className="relative min-h-[480px] w-full overflow-hidden rounded-2xl sm:min-h-[520px] md:min-h-[540px] md:rounded-3xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Background layers per slide */}
        {slides.map((s, idx) => (
          <div key={s.id}
            className={`absolute inset-0 bg-linear-to-br ${s.gradient} transition-opacity duration-700 ${idx === i ? "opacity-100" : "opacity-0"}`}
          />
        ))}

        {/* Mesh noise overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.05),transparent)]" />

        {/* Grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)", backgroundSize: "48px 48px" }}
        />

        {/* Slides */}
        {slides.map((s, idx) => (
          <div key={s.id}
            className={`absolute inset-0 z-[1] transition-all duration-700 ease-out ${idx === i ? "opacity-100 translate-x-0" : idx < i ? "opacity-0 -translate-x-8 pointer-events-none" : "opacity-0 translate-x-8 pointer-events-none"}`}
          >
            <div className="relative grid h-full grid-cols-1 items-center md:grid-cols-2">
              {/* Image side */}
              <div className="relative order-1 flex h-52 items-end justify-center overflow-hidden md:order-none md:h-full">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 size-64 md:size-96 rounded-full blur-3xl opacity-20 bg-accent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-72 md:size-[420px] rounded-full border border-white/5 bg-white/[0.02]" />
                </div>
                {s.image ? (
                  <img
                    src={s.image}
                    alt={s.title}
                    className={`relative z-10 max-h-[90%] w-auto max-w-full object-contain drop-shadow-2xl transition-transform duration-700 ${idx === i ? "scale-100" : "scale-95"}`}
                  />
                ) : (
                  <img
                    src={heroImg.src}
                    alt={s.title}
                    className={`relative z-10 max-h-[90%] w-auto max-w-full object-contain drop-shadow-2xl transition-transform duration-700 ${idx === i ? "scale-100" : "scale-95"}`}
                  />
                )}
              </div>

              {/* Text side */}
              <div className="relative z-[2] px-6 py-8 text-white md:px-14 md:py-0">
                {/* Badge */}
                {s.badge && (
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-accent px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg sm:text-xs">
                    <ShoppingBag className="size-3.5" strokeWidth={2.5} />
                    {s.badge}
                  </div>
                )}

                {/* Heading */}
                <h1 className="max-w-sm text-[1.75rem] font-bold leading-[1.06] tracking-tight text-balance sm:text-4xl md:text-[2.75rem] lg:text-5xl">
                  {s.title}
                </h1>

                {/* Subtitle */}
                {s.subtitle && (
                  <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60 sm:text-base md:max-w-sm">
                    {s.subtitle}
                  </p>
                )}

                {/* CTA */}
                <div className="mt-7 flex flex-wrap items-center gap-3 sm:mt-8">
                  <Link
                    href={`/category/${s.slug}`}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-7 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 active:scale-[0.98] sm:h-[3.125rem] sm:px-8 sm:text-[15px]"
                  >
                    {s.cta || "Shop Now"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Nav buttons */}
        <button onClick={prev}
          className="absolute hidden left-4 top-1/2 z-20 -translate-y-1/2 sm:flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
          aria-label="Previous slide">
          <ChevronLeft className="size-5" />
        </button>
        <button onClick={next}
          className="absolute hidden right-4 top-1/2 z-20 -translate-y-1/2 sm:flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
          aria-label="Next slide">
          <ChevronRight className="size-5" />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-5 right-5 z-20 flex items-center gap-2">
          {slides.map((s, idx) => (
            <button key={s.id} onClick={() => setI(idx)} aria-label={`Go to slide ${idx + 1}`}
              className={`rounded-full transition-all duration-300 ${idx === i ? "h-2 w-8 bg-accent" : "h-2 w-2 bg-white/30 hover:bg-white/50"}`} />
          ))}
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 z-20 h-0.5 w-full bg-white/10">
          <div key={i} className="h-full bg-accent animate-progress-bar"
            style={{ animation: paused ? "none" : "progress-bar 5.5s linear forwards" }} />
        </div>
      </div>
    </section>
  );
}
