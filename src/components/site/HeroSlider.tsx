import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-shopping.png";
import { useT, dict } from "@/lib/i18n";

type K = keyof typeof dict;

const slides: { badge: string; eyebrow: K; title: K; subtitle: K; cta: K; slug: string }[] = [
  { badge: "22%", eyebrow: "hero.s1.eyebrow", title: "hero.s1.title", subtitle: "hero.s1.subtitle", cta: "hero.s1.cta", slug: "fashion" },
  { badge: "Free ৳", eyebrow: "hero.s2.eyebrow", title: "hero.s2.title", subtitle: "hero.s2.subtitle", cta: "hero.s2.cta", slug: "gadgets" },
  { badge: "COD", eyebrow: "hero.s3.eyebrow", title: "hero.s3.title", subtitle: "hero.s3.subtitle", cta: "hero.s3.cta", slug: "beauty" },
];

export function HeroSlider() {
  const { t, lang } = useT();
  const [i, setI] = useState(0);
  const total = slides.length;

  useEffect(() => {
    const tm = setInterval(() => setI((p) => (p + 1) % total), 5500);
    return () => clearInterval(tm);
  }, [total]);

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6">
      <div className="relative overflow-hidden rounded-2xl bg-black text-white min-h-[560px] md:min-h-[520px]">
        {/* Decorative background circles — z-0, always behind everything */}
        <div className="pointer-events-none absolute z-0 -left-40 top-1/2 -translate-y-1/2 size-[480px] rounded-full border border-white/10" />
        <div className="pointer-events-none absolute z-0 -left-32 top-1/2 -translate-y-1/2 size-[380px] rounded-full border border-white/10" />
        <div className="pointer-events-none absolute z-0 -right-40 top-1/2 -translate-y-1/2 size-[480px] rounded-full border border-accent/40" />
        <div className="pointer-events-none absolute z-0 -right-32 top-1/2 -translate-y-1/2 size-[360px] rounded-full bg-accent/10" />

        {/* Slides — z-[1], above decorative circles */}
        {slides.map((s, idx) => (
          <div key={idx} className={`absolute inset-0 z-[1] transition-opacity duration-700 ease-out ${idx === i ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <div className="relative h-full grid md:grid-cols-2 items-center">
              {/* Image — z-[1] within slide */}
              <div className="relative z-[1] flex items-end justify-center h-56 md:h-full order-1 md:order-none">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-64 md:size-96 rounded-full bg-white/5" />
                </div>
                <img src={heroImg} alt={t(s.title)} width={1024} height={1024} className={`relative max-h-[95%] w-auto object-contain drop-shadow-2xl transition-transform duration-700 ${idx === i ? "scale-100" : "scale-95"}`} />
              </div>
              {/* Text — z-[2] within slide, always on top of image on mobile */}
              <div className={`relative z-[2] px-6 md:px-12 py-8 md:py-0 ${lang === "bn" ? "font-bn" : ""}`}>
                <div className="inline-flex items-center justify-center size-14 rounded-full bg-accent text-accent-foreground text-[11px] font-semibold mb-5">{s.badge}</div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/60 mb-3">{t(s.eyebrow)}</p>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight max-w-md">{t(s.title)}</h1>
                <p className="mt-4 text-sm md:text-base text-white/70 max-w-md">{t(s.subtitle)}</p>
                <Link to="/category/$slug" params={{ slug: s.slug }} className="mt-7 inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-6 h-11 text-sm font-medium hover:opacity-90 transition leading-[2.75rem]">
                  {t(s.cta)}
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Prev / Next buttons — z-20, always clickable above slides */}
        <button onClick={() => setI((p) => (p - 1 + total) % total)} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center" aria-label="Previous">
          <ChevronLeft className="size-5" />
        </button>
        <button onClick={() => setI((p) => (p + 1) % total)} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center" aria-label="Next">
          <ChevronRight className="size-5" />
        </button>

        {/* Dot indicators — z-20 */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-2 rounded-full">
          {slides.map((_, idx) => (
            <button key={idx} onClick={() => setI(idx)} className={`h-2 rounded-full transition-all ${idx === i ? "w-6 bg-accent" : "w-2 bg-white/40"}`} aria-label={`Slide ${idx + 1}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
