import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import { useT, dict } from "@/lib/i18n";

export function Footer() {
  const { t, lang } = useT();

  const cols: { title: keyof typeof dict; links: { key: keyof typeof dict; href: string }[] }[] = [
    {
      title: "footer.shop",
      links: [
        { key: "footer.l.gadgets", href: "/category/gadgets" },
        { key: "footer.l.fashion",  href: "/category/fashion" },
        { key: "footer.l.home",     href: "/category/home" },
        { key: "footer.l.beauty",   href: "/category/beauty" },
        { key: "footer.l.grocery",  href: "/category/grocery" },
      ],
    },
    {
      title: "footer.help",
      links: [
        { key: "footer.l.track",    href: "/track" },
        { key: "footer.l.shipping", href: "#" },
        { key: "footer.l.returns",  href: "#" },
        { key: "footer.l.faq",      href: "#" },
        { key: "footer.l.contact",  href: "#" },
      ],
    },
    {
      title: "footer.company",
      links: [
        { key: "footer.l.about",   href: "#" },
        { key: "footer.l.careers", href: "#" },
        { key: "footer.l.press",   href: "#" },
        { key: "footer.l.blog",    href: "#" },
      ],
    },
  ];

  const socials = [
    { Icon: Facebook,  label: "Facebook",  href: "#" },
    { Icon: Instagram, label: "Instagram", href: "#" },
    { Icon: Twitter,   label: "Twitter",   href: "#" },
    { Icon: Youtube,   label: "YouTube",   href: "#" },
  ];

  return (
    <footer className={`w-full min-w-0 overflow-x-clip ${lang === "bn" ? "font-bn" : ""}`}>
      {/* App download / newsletter banner */}
      <div className="bg-foreground text-background">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:gap-6 sm:px-6 sm:py-8">
          <div className="text-center sm:text-left">
            <p className="text-sm font-bold sm:text-base">Get exclusive deals on SHOP.BD</p>
            <p className="mt-1 text-xs text-background/60 sm:text-sm">Subscribe for daily offers, new arrivals & flash sales.</p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full max-w-sm items-center gap-2"
          >
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-background/40" />
              <input
                type="email"
                placeholder="Your email address"
                className="h-11 w-full rounded-xl border border-background/20 bg-background/10 pl-9 pr-3 text-sm text-background placeholder:text-background/40 outline-none focus:border-background/40 focus:bg-background/15"
              />
            </div>
            <button
              type="submit"
              className="h-11 shrink-0 rounded-xl bg-accent px-5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className="bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-6">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-5">
            {/* Brand column */}
            <div className="col-span-1 sm:col-span-2">
              <Link href="/" className="flex items-baseline gap-0.5">
                <span className="text-2xl font-bold tracking-tight text-white">SHOP</span>
                <span className="text-2xl font-bold tracking-tight text-accent">.BD</span>
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">
                {t("footer.tagline")}
              </p>
              <p className="mt-3 font-bn text-sm text-white/40">{t("footer.bn_tagline")}</p>

              {/* Contact info */}
              <div className="mt-5 space-y-2 text-sm text-white/50">
                <div className="flex items-center gap-2">
                  <Phone className="size-3.5 shrink-0 text-accent" />
                  <span>+880 1999-000000</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="size-3.5 shrink-0 text-accent" />
                  <span>support@shopbd.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-3.5 shrink-0 text-accent" />
                  <span>Dhaka, Bangladesh</span>
                </div>
              </div>

              {/* Socials */}
              <div className="mt-6 flex items-center gap-2">
                {socials.map(({ Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="flex size-9 items-center justify-center rounded-full border border-white/15 text-white/60 transition hover:border-accent hover:bg-accent hover:text-white"
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {cols.map((c) => (
              <div key={c.title}>
                <p className="mb-5 text-xs font-bold uppercase tracking-widest text-white/40">{t(c.title)}</p>
                <ul className="space-y-3">
                  {c.links.map(({ key, href }) => (
                    <li key={key}>
                      <Link
                        href={href}
                        className="text-sm text-white/60 transition hover:text-white"
                      >
                        {t(key)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Payment logos row */}
          
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 sm:flex-row sm:px-6">
            <span className="text-xs text-white/40">{t("footer.copyright")}</span>
            <span className="text-xs text-white/40">{t("footer.made")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
