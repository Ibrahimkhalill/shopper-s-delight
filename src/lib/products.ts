import tshirt from "@/assets/p-tshirt.jpg";
import coat from "@/assets/p-coat.jpg";
import shoes from "@/assets/p-shoes.jpg";
import headphones from "@/assets/p-headphones.jpg";
import watch from "@/assets/p-watch.jpg";
import type { Product } from "@/components/site/ProductCard";

export const PRODUCTS: Product[] = [
  { id: "cotton-tshirt", name: "Cotton fabric T-shirt", category: "T-Shirt",
    sizes: ["S", "M", "XL"], price: 1200, oldPrice: 1300, image: tshirt,
    badge: { label: "New", tone: "new" }, colors: ["#f5b6c8", "#7d8ce0", "#ffffff"] },
  { id: "plaid-coat", name: "Plaid trench coat", category: "Outerwear",
    sizes: ["S", "M", "XL"], price: 4800, oldPrice: 5500, image: coat,
    badge: { label: "Sale", tone: "sale" }, colors: ["#f5b6c8", "#a06b48"] },
  { id: "wireless-headphones", name: "Wireless over-ear headphones", category: "Audio",
    sizes: ["BLK"], price: 6800, oldPrice: 7800, image: headphones,
    badge: { label: "Trending", tone: "trending" }, colors: ["#000000", "#7d8ce0", "#f08c6e", "#7dd9a0"] },
  { id: "sport-shoes", name: "Special sport shoes", category: "Shoes",
    sizes: ["7", "8", "10"], price: 5500, image: shoes,
    colors: ["#000000", "#d96a7a"], liked: true },
  { id: "smart-watch", name: "Classic smart watch", category: "Wearable",
    sizes: ["1 size"], price: 9200, oldPrice: 10500, image: watch,
    badge: { label: "New", tone: "new" }, colors: ["#000000", "#c8b5ff"] },
  { id: "cotton-top", name: "Cotton fabric Top", category: "Top",
    sizes: ["S", "M"], price: 1200, oldPrice: 1300, image: tshirt,
    badge: { label: "New", tone: "new" }, colors: ["#ffffff", "#d4b3ff"] },
];

export function getProduct(id: string) {
  return PRODUCTS.find((p) => p.id === id);
}