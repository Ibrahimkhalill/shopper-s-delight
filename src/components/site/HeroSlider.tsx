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
    img: heroImg,
  },
  {
    badge: "Free delivery",
    eyebrow: "Gadgets week",
    title: "Smarter tech, fairer prices",
    subtitle: "Phones, audio and wearables — delivered nationwide.",
    cta: "Explore gadgets",
    img: heroImg,
  },
  {
    badge: "৳ COD",
    eyebrow: "Beauty edit",
    title: "Glow up your routine",
    subtitle: "Premium beauty essentials, curated for you.",
    cta: "Shop beauty",
    img: heroImg,
  },
];

export function HeroSlider() {
  const [i, setI] = useState(0);
  const total = slides.length;

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % total), 6000);
    return () => clearInterval(t);
  }, [total]);

  const s = slides[i];

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6">
      <div className="relative overflow-hidden rounded-2xl bg-black text-white">
        {/* Decorative arcs */}
        <div className="pointer-events-none absolute -left-40 top-1/2 -translate-y-1/2 size-[480px] rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -left-32 top-1/2 -translate-y-1/2 size-[380px] rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-40 top-1/2 -translate-y-1/2 size-[480px] rounded-full border border-accent/40" />
        <div className="pointer-events-none absolute -right-32 top-1/2 -translate-y-1/2 size-[360px] rounded-full bg-accent/10" />

        <div className="relative grid md:grid-cols-2 items-center min-h-[420px] md:min-h-[520px]">
          {/* Image side */}
          <div className="relative flex items-end justify-center h-72 md:h-full">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-72 md:size-96 rounded-full bg-white/5" />
            </div>
            <img
              src={s.img}
              alt={s.title}
              width={1024}
              height={1024}
              className="relative max-h-[90%] w-auto object-contain drop-shadow-2xl"
            />
          </div>

          {/* Text side */}
          <div className="px-6 md:px-12 py-10 md:py-0">
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-accent text-accent-foreground text-xs font-semibold mb-6"
              style={{ clipPath: "polygon(50% 0,61% 8%,71% 3%,76% 14%,87% 14%,87% 25%,97% 30%,92% 41%,100% 50%,92% 59%,97% 70%,87% 75%,87% 86%,76% 86%,71% 97%,61% 92%,50% 100%,39% 92%,29% 97%,24% 86%,13% 86%,13% 75%,3% 70%,8% 59%,0 50%,8% 41%,3% 30%,13% 25%,13% 14%,24% 14%,29% 3%,39% 8%)" }}
            >
              {s.badge}
            </div>
            <p className="text-sm uppercase tracking-widest text-white/60 mb-3">{s.eyebrow}</p>
            <h1 className="text-4xl md:text-6xl font-semibold leading-tight tracking-tight">
              {s.title}
            </h1>
            <p className="mt-4 text-white/70 max-w-md">{s.subtitle}</p>
            <button className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-6 h-12 text-sm font-medium hover:opacity-90 transition">
              {s.cta}
            </button>
          </div>
        </div>

        {/* Controls */}
        <button
          onClick={() => setI((p) => (p - 1 + total) % total)}
          className="absolute left-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center"
          aria-label="Previous"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          onClick={() => setI((p) => (p + 1) % total)}
          className="absolute right-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center"
          aria-label="Next"
        >
          <ChevronRight className="size-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-2 rounded-full">
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