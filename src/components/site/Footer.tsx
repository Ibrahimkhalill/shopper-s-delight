export function Footer() {
  const cols = [
    { title: "Shop", links: ["Gadgets", "Fashion", "Home & Living", "Beauty", "Grocery"] },
    { title: "Help", links: ["Track order", "Shipping", "Returns", "FAQ", "Contact"] },
    { title: "Company", links: ["About", "Careers", "Press", "Blog"] },
  ];
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2">
          <div className="flex items-baseline gap-0.5">
            <span className="text-2xl font-semibold">SHOP</span>
            <span className="text-2xl font-semibold text-[oklch(0.62_0.24_25)]">.BD</span>
          </div>
          <p className="mt-4 text-sm text-white/60 max-w-xs">
            Premium multi-category e-commerce for Bangladesh. Cash on Delivery, secure payments, nationwide shipping.
          </p>
          <p className="mt-6 text-sm font-bn text-white/70">কেনাকাটার নতুন ঠিকানা</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="text-sm font-semibold mb-4">{c.title}</p>
            <ul className="space-y-2.5 text-sm text-white/60">
              {c.links.map((l) => <li key={l}><a href="#" className="hover:text-white">{l}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-5 flex flex-col sm:flex-row gap-2 items-center justify-between text-xs text-white/50">
          <span>© 2026 SHOP.BD · All rights reserved</span>
          <span>Made in Bangladesh 🇧🇩</span>
        </div>
      </div>
    </footer>
  );
}