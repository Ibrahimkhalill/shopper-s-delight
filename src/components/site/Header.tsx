import { Search, Heart, ShoppingCart, User, Menu } from "lucide-react";

const categories = ["Gadgets", "Fashion", "Home & Living", "Beauty", "Grocery", "Deals"];

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-background">
      {/* Announcement */}
      <div className="bg-black text-white text-xs">
        <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-between">
          <span>Free delivery on orders over ৳1,500 · Cash on Delivery available</span>
          <span className="hidden sm:inline opacity-70">EN · <span className="font-bn">বাংলা</span></span>
        </div>
      </div>

      {/* Main bar */}
      <div className="border-b">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center gap-4">
          <button className="md:hidden -ml-1 p-2"><Menu className="size-5" /></button>
          <a href="/" className="flex items-baseline gap-0.5">
            <span className="text-xl font-semibold tracking-tight">SHOP</span>
            <span className="text-xl font-semibold tracking-tight text-[oklch(0.62_0.24_25)]">.BD</span>
          </a>

          <div className="flex-1 max-w-2xl mx-auto hidden md:block">
            <div className="relative">
              <Search className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search products, brands and categories"
                className="w-full h-11 pl-11 pr-4 rounded-full border border-border bg-secondary text-sm outline-none focus:border-foreground transition"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <button className="hidden sm:flex items-center gap-2 px-3 h-10 rounded-full hover:bg-secondary text-sm">
              <User className="size-4" /> Sign in
            </button>
            <button className="p-2.5 rounded-full hover:bg-secondary"><Heart className="size-5" /></button>
            <button className="relative p-2.5 rounded-full hover:bg-secondary">
              <ShoppingCart className="size-5" />
              <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-accent text-accent-foreground text-[10px] font-medium flex items-center justify-center">2</span>
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <Search className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search SHOP.BD"
              className="w-full h-11 pl-11 pr-4 rounded-full border border-border bg-secondary text-sm outline-none"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <nav className="border-b">
        <div className="mx-auto max-w-7xl px-4 h-11 flex items-center gap-6 overflow-x-auto text-sm">
          {categories.map((c, i) => (
            <a
              key={c}
              href="#"
              className={`whitespace-nowrap hover:text-foreground transition ${i === 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}
            >
              {c}
            </a>
          ))}
          <a href="#" className="ml-auto whitespace-nowrap text-accent font-medium">Track order →</a>
        </div>
      </nav>
    </header>
  );
}