import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import heroImg from "@/assets/hero-shopping.png";

const slides = [
  {
    badge: "22% Off",
    eyebrow: "New season",
    title: "Fashion sale for everyone",
    subtitle: "Wear the change. Fashion that feels good.",
    cta: "Shop now",
  },
  {
    badge: "Free ৳",
    eyebrow: "Gadgets week",
    title: "Smarter tech, fairer prices",
    subtitle: "Phones, audio and wearables — delivered nationwide.",
    cta: "Explore gadgets",
  },
  {
    badge: "COD",
    eyebrow: "Beauty edit",
    title: "Glow up your routine",
    subtitle: "Premium beauty essentials, curated for you.",
    cta: "Shop beauty",
  },
];

export function HeroSlider() {
  const [i, setI] = useState(0);
  const total = slides.length;

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % total), 5500);
    return () => clearInterval(t);
  }, [total]);

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6">
      <div className="relative overflow-hidden rounded-2xl bg-black text-white min-h-[440px] md:min-h-[520px]">
        {/* Decorative arcs */}
        <div className="pointer-events-none absolute -left-40 top-1/2 -translate-y-1/2 size-[480px] rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -left-32 top-1/2 -translate-y-1/2 size-[380px] rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-40 top-1/2 -translate-y-1/2 size-[480px] rounded-full border border-accent/40" />
        <div className="pointer-events-none absolute -right-32 top-1/2 -translate-y-1/2 size-[360px] rounded-full bg-accent/10" />

        {/* Slides — crossfade */}
        {slides.map((s, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${idx === i ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <div className="relative h-full grid md:grid-cols-2 items-center">
              <div className="relative flex items-end justify-center h-64 md:h-full order-1 md:order-none">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-64 md:size-96 rounded-full bg-white/5" />
                </div>
                <img
                  src={heroImg}
                  alt={s.title}
                  width={1024}
                  height={1024}
                  className={`relative max-h-[95%] w-auto object-contain drop-shadow-2xl transition-transform duration-700 ${idx === i ? "scale-100" : "scale-95"}`}
                />
              </div>
              <div className="px-6 md:px-12 py-8 md:py-0">
                <div className="inline-flex items-center justify-center size-14 rounded-full bg-accent text-accent-foreground text-[11px] font-semibold mb-5">
                  {s.badge}
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/60 mb-3">{s.eyebrow}</p>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight max-w-md">
                  {s.title}
                </h1>
                <p className="mt-4 text-sm md:text-base text-white/70 max-w-md">{s.subtitle}</p>
                <button className="mt-7 inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-6 h-11 text-sm font-medium hover:opacity-90 transition">
                  {s.cta}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Controls */}
        <button
          onClick={() => setI((p) => (p - 1 + total) % total)}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center"
          aria-label="Previous"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          onClick={() => setI((p) => (p + 1) % total)}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center"
          aria-label="Next"
        >
          <ChevronRight className="size-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-2 rounded-full">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              className={`h-2 rounded-full transition-all ${idx === i ? "w-6 bg-accent" : "w-2 bg-white/40"}`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}