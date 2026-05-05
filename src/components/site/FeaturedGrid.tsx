import { ProductCard, type Product } from "./ProductCard";
import tshirt from "@/assets/p-tshirt.jpg";
import coat from "@/assets/p-coat.jpg";
import shoes from "@/assets/p-shoes.jpg";
import headphones from "@/assets/p-headphones.jpg";
import watch from "@/assets/p-watch.jpg";

const products: Product[] = [
  {
    id: "1", name: "Cotton fabric T-shirt", category: "T-Shirt",
    sizes: ["S", "M", "XL"], price: 1200, oldPrice: 1300, image: tshirt,
    badge: { label: "New", tone: "new" }, colors: ["#f5b6c8", "#7d8ce0", "#ffffff"],
  },
  {
    id: "2", name: "Plaid trench coat", category: "Outerwear",
    sizes: ["S", "M", "XL"], price: 4800, oldPrice: 5500, image: coat,
    badge: { label: "Sale", tone: "sale" }, colors: ["#f5b6c8", "#a06b48"],
  },
  {
    id: "3", name: "Wireless over-ear headphones", category: "Audio",
    sizes: ["BLK"], price: 6800, oldPrice: 7800, image: headphones,
    badge: { label: "Trending", tone: "trending" }, colors: ["#000000", "#7d8ce0", "#f08c6e", "#7dd9a0"],
  },
  {
    id: "4", name: "Special sport shoes", category: "Shoes",
    sizes: ["7", "8", "10"], price: 5500, image: shoes,
    colors: ["#000000", "#d96a7a"], liked: true,
  },
  {
    id: "5", name: "Classic smart watch", category: "Wearable",
    sizes: ["1 size"], price: 9200, oldPrice: 10500, image: watch,
    badge: { label: "New", tone: "new" }, colors: ["#000000", "#c8b5ff"],
  },
];

export function FeaturedGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent font-medium">Best of the week</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">Featured products</h2>
        </div>
        <a href="#" className="hidden md:inline text-sm text-muted-foreground hover:text-foreground">View all →</a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {products.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}