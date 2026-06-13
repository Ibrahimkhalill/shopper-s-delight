import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

const U = (id: string, w = 600, h = 600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=75`;

async function main() {
  console.log("🌱 Seeding database...");

  // ── Admin ──────────────────────────────────────────────────────────────────
  const phone    = process.env.ADMIN_PHONE    ?? "01700000000";
  const email    = process.env.ADMIN_EMAIL    ?? "admin@shopbd.com";
  const password = process.env.ADMIN_PASSWORD ?? "change_me";

  const existingAdmin = await db.user.findFirst({ where: { OR: [{ phone }, { email }] } });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash(password, 12);
    await db.user.create({ data: { name: "Admin", phone, email, password: hashed, role: "ADMIN" } });
    console.log("✓ Admin created:", phone);
  } else {
    console.log("✓ Admin already exists");
  }

  // ── Parent categories ──────────────────────────────────────────────────────
  const parentCats = [
    { slug: "fashion",  name: "Fashion",       image: U("photo-1558618666-fcd25c85cd64", 400, 300) },
    { slug: "gadgets",  name: "Gadgets",        image: U("photo-1498049794561-7780e7231661", 400, 300) },
    { slug: "home",     name: "Home & Living",  image: U("photo-1555041469-a586c61ea9bc", 400, 300) },
    { slug: "beauty",   name: "Beauty",         image: U("photo-1512496015851-a90fb38ba796", 400, 300) },
    { slug: "grocery",  name: "Grocery",        image: U("photo-1542838132-92c53300491e", 400, 300) },
  ];

  const catMap: Record<string, string> = {};
  for (const c of parentCats) {
    const cat = await db.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, image: c.image },
      create: { name: c.name, slug: c.slug, image: c.image, status: "ACTIVE" },
    });
    catMap[c.slug] = cat.id;
    console.log(`✓ Category: ${c.name}`);
  }

  // ── Subcategories ──────────────────────────────────────────────────────────
  const subCats = [
    // Fashion
    { slug: "t-shirts",  name: "T-Shirts",   parent: "fashion", image: U("photo-1521572163474-6864f9cf17ab", 400, 300) },
    { slug: "shirts",    name: "Shirts",      parent: "fashion", image: U("photo-1602810316693-3667c854239a", 400, 300) },
    { slug: "outerwear", name: "Outerwear",   parent: "fashion", image: U("photo-1539109136881-3be0616acf4b", 400, 300) },
    { slug: "tops",      name: "Tops",        parent: "fashion", image: U("photo-1558769132-cb1aea458c5e", 400, 300) },
    { slug: "shoes",     name: "Shoes",       parent: "fashion", image: U("photo-1542291026-7eec264c27ff", 400, 300) },
    { slug: "denim",     name: "Denim",       parent: "fashion", image: U("photo-1576871337622-98d48d1cf531", 400, 300) },
    // Gadgets
    { slug: "phones",    name: "Phones",      parent: "gadgets", image: U("photo-1598327105666-5b89351aff97", 400, 300) },
    { slug: "laptops",   name: "Laptops",     parent: "gadgets", image: U("photo-1496181133206-80ce9b88a853", 400, 300) },
    { slug: "audio",     name: "Audio",       parent: "gadgets", image: U("photo-1505740420928-5e560c06d30e", 400, 300) },
    { slug: "wearables", name: "Wearables",   parent: "gadgets", image: U("photo-1523275335684-37898b6baf30", 400, 300) },
    { slug: "tablets",   name: "Tablets",     parent: "gadgets", image: U("photo-1544244015-0df4b3ffc6b0", 400, 300) },
    { slug: "earbuds",   name: "Earbuds",     parent: "gadgets", image: U("photo-1590658268037-6bf12165a8df", 400, 300) },
    // Home
    { slug: "bedding",   name: "Bedding",     parent: "home",    image: U("photo-1564019472231-4586c552dc27", 400, 300) },
    { slug: "kitchen",   name: "Kitchen",     parent: "home",    image: U("photo-1518291344630-4857135fb581", 400, 300) },
    { slug: "lighting",  name: "Lighting",    parent: "home",    image: U("photo-1621177555452-bedbe4c28879", 400, 300) },
    { slug: "decor",     name: "Decor",       parent: "home",    image: U("photo-1629949008265-af1bcaf59786", 400, 300) },
    // Beauty
    { slug: "skincare",  name: "Skincare",    parent: "beauty",  image: U("photo-1591130901921-3f0652bb3915", 400, 300) },
    { slug: "makeup",    name: "Makeup",      parent: "beauty",  image: U("photo-1512496015851-a90fb38ba796", 400, 300) },
    { slug: "fragrance", name: "Fragrance",   parent: "beauty",  image: U("photo-1541643600914-78b084683601", 400, 300) },
    // Grocery
    { slug: "organic",   name: "Organic",     parent: "grocery", image: U("photo-1587049352846-4a222e784d38", 400, 300) },
    { slug: "staples",   name: "Staples",     parent: "grocery", image: U("photo-1586201375761-83865001e31c", 400, 300) },
  ];

  for (const s of subCats) {
    await db.category.upsert({
      where: { slug: s.slug },
      update: { name: s.name, image: s.image, parentId: catMap[s.parent] },
      create: { name: s.name, slug: s.slug, image: s.image, parentId: catMap[s.parent], status: "ACTIVE" },
    });
  }
  console.log("✓ Subcategories seeded");

  // ── Brands ─────────────────────────────────────────────────────────────────
  const brands = [
    { slug: "urbanfit",      name: "UrbanFit",      description: "Urban fashion brand" },
    { slug: "loom-field",    name: "Loom & Field",  description: "Premium outerwear" },
    { slug: "aerostep",      name: "AeroStep",      description: "Sports footwear" },
    { slug: "denimco",       name: "DenimCo",       description: "Denim specialists" },
    { slug: "boardroombd",   name: "BoardroomBD",   description: "Formal wear" },
    { slug: "soundwave",     name: "SoundWave",     description: "Audio electronics" },
    { slug: "chronotech",    name: "ChronoTech",    description: "Smart wearables" },
    { slug: "techbd",        name: "TechBD",        description: "Phones, laptops, tablets" },
    { slug: "homecomfort",   name: "HomeComfort",   description: "Home essentials" },
    { slug: "brighthome",    name: "BrightHome",    description: "Lighting solutions" },
    { slug: "cozyhome",      name: "CozyHome",      description: "Home decor" },
    { slug: "chefbd",        name: "ChefBD",        description: "Kitchen essentials" },
    { slug: "glowbd",        name: "GlowBD",        description: "Beauty & skincare" },
    { slug: "aromabd",       name: "AromaBD",       description: "Fragrances" },
    { slug: "naturebd",      name: "NatureBD",      description: "Organic products" },
    { slug: "grainbd",       name: "GrainBD",       description: "Grocery staples" },
    { slug: "gamingbd",      name: "GamingBD",      description: "Gaming peripherals" },
  ];

  const brandMap: Record<string, string> = {};
  for (const b of brands) {
    const brand = await db.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name, description: b.description },
      create: { name: b.name, slug: b.slug, description: b.description, status: "ACTIVE" },
    });
    brandMap[b.slug] = brand.id;
  }
  console.log("✓ Brands seeded");

  // ── Products ───────────────────────────────────────────────────────────────
  const products = [
    // ── Fashion ──────────────────────────────────────────────────────────────
    {
      slug: "cotton-tshirt", name: "Premium Cotton T-Shirt",
      category: "fashion", subcategory: "T-Shirts", brand: "urbanfit",
      material: "100% cotton jersey",
      sizes: ["S", "M", "L", "XL"],
      price: 1200, oldPrice: 1500, stock: 8,
      images: [U("photo-1521572163474-6864f9cf17ab"), U("photo-1583743814966-8936f5b7be1a"), U("photo-1618354691373-d851c5c3a990"), U("photo-1529374255404-311a2a4f1fd9")],
      colorImages: [U("photo-1521572163474-6864f9cf17ab"), U("photo-1583743814966-8936f5b7be1a"), U("photo-1618354691373-d851c5c3a990"), U("photo-1529374255404-311a2a4f1fd9")],
      colors: ["#f5b6c8", "#7d8ce0", "#ffffff", "#000000"],
      badgeLabel: "New", badgeTone: "new", featured: true, trending: false,
      tags: ["cotton", "summer", "casual"],
      description: "Classic premium cotton t-shirt for everyday wear. Breathable fabric, perfect fit.",
      metaTitle: "Premium Cotton T-Shirt | SHOP.BD",
      metaDesc: "Buy premium cotton t-shirts in Bangladesh. Available in multiple colors and sizes.",
    },
    {
      slug: "plaid-coat", name: "Plaid Trench Coat",
      category: "fashion", subcategory: "Outerwear", brand: "loom-field",
      material: "Wool blend",
      sizes: ["S", "M", "L", "XL"],
      price: 4800, oldPrice: 5500, stock: 3,
      images: [U("photo-1539109136881-3be0616acf4b"), U("photo-1548454782-15b189d129ab"), U("photo-1607345366928-199ea26cfe3e"), U("photo-1591047139829-d91aecb6caea")],
      colorImages: [U("photo-1539109136881-3be0616acf4b"), U("photo-1548454782-15b189d129ab")],
      colors: ["#a06b48", "#2c2c2c"],
      badgeLabel: "Sale", badgeTone: "sale", featured: true, trending: false,
      tags: ["coat", "winter", "wool"],
      description: "Timeless plaid trench coat. Wool blend for warmth and style.",
    },
    {
      slug: "sport-shoes", name: "Pro Sport Running Shoes",
      category: "fashion", subcategory: "Shoes", brand: "aerostep",
      material: "Mesh & synthetic upper",
      sizes: ["39", "40", "41", "42", "43"],
      price: 5500, oldPrice: 6200, stock: 54,
      images: [U("photo-1542291026-7eec264c27ff"), U("photo-1595950653106-6c9ebd614d3a"), U("photo-1608231387042-66d1773070a5"), U("photo-1560769629-975ec94e6a86")],
      colorImages: [U("photo-1542291026-7eec264c27ff"), U("photo-1595950653106-6c9ebd614d3a"), U("photo-1608231387042-66d1773070a5")],
      colors: ["#000000", "#d96a7a", "#ffffff"],
      badgeLabel: undefined, badgeTone: undefined, featured: true, trending: true,
      tags: ["shoes", "running", "sport"],
      description: "High-performance running shoes with superior cushioning.",
    },
    {
      slug: "cotton-top", name: "Floral Summer Top",
      category: "fashion", subcategory: "Tops", brand: "urbanfit",
      material: "Organic cotton",
      sizes: ["S", "M", "L"],
      price: 1200, oldPrice: 1400, stock: 48,
      images: [U("photo-1558769132-cb1aea458c5e"), U("photo-1515886657613-9f3515b0c78f"), U("photo-1572804013309-59a88b7e92f1"), U("photo-1554568218-0f1715e72254")],
      colorImages: [],
      colors: ["#ffffff", "#d4b3ff", "#f5b6c8"],
      badgeLabel: "New", badgeTone: "new", featured: true, trending: false,
      tags: ["top", "summer", "floral"],
      description: "Light and breezy floral top for warm weather.",
    },
    {
      slug: "denim-jacket", name: "Classic Denim Jacket",
      category: "fashion", subcategory: "Outerwear", brand: "denimco",
      material: "100% denim",
      sizes: ["S", "M", "L", "XL"],
      price: 3200, oldPrice: 3800, stock: 38,
      images: [U("photo-1576871337622-98d48d1cf531"), U("photo-1551537482-f2075a1d41f2"), U("photo-1611312449408-fcece27cdbb7"), U("photo-1598033129183-c4f50c736f10")],
      colorImages: [],
      colors: ["#4a6fa5", "#2c2c2c"],
      badgeLabel: "Trending", badgeTone: "trending", featured: false, trending: true,
      tags: ["denim", "jacket", "casual"],
      description: "Timeless denim jacket that goes with everything.",
    },
    {
      slug: "formal-shirt", name: "Slim Fit Formal Shirt",
      category: "fashion", subcategory: "Shirts", brand: "boardroombd",
      material: "Cotton poplin",
      sizes: ["S", "M", "L", "XL"],
      price: 1800, oldPrice: 2200, stock: 29,
      images: [U("photo-1602810316693-3667c854239a"), U("photo-1620012253295-c15cc3e65df4"), U("photo-1563630423918-b58f07336ac9"), U("photo-1604695573706-53170668f6a6")],
      colorImages: [],
      colors: ["#ffffff", "#add8e6", "#d3d3d3"],
      badgeLabel: undefined, badgeTone: undefined, featured: false, trending: false,
      tags: ["shirt", "formal", "office"],
      description: "Slim fit formal shirt for professional occasions.",
    },

    // ── Gadgets ───────────────────────────────────────────────────────────────
    {
      slug: "wireless-headphones", name: "Wireless Over-Ear Headphones",
      category: "gadgets", subcategory: "Audio", brand: "soundwave",
      material: "ABS plastic, protein leather",
      sizes: ["One size"],
      price: 6800, oldPrice: 7800, stock: 25,
      images: [U("photo-1505740420928-5e560c06d30e"), U("photo-1583394838336-acd977736f90"), U("photo-1546435770-a3e426bf472b"), U("photo-1484704849700-f032a568e944")],
      colorImages: [U("photo-1505740420928-5e560c06d30e"), U("photo-1583394838336-acd977736f90"), U("photo-1546435770-a3e426bf472b")],
      colors: ["#000000", "#7d8ce0", "#f08c6e"],
      badgeLabel: "Trending", badgeTone: "trending", featured: true, trending: true,
      tags: ["headphones", "wireless", "audio"],
      description: "Premium wireless headphones with active noise cancellation.",
    },
    {
      slug: "smart-watch", name: "Classic Smart Watch",
      category: "gadgets", subcategory: "Wearables", brand: "chronotech",
      material: "Aluminium case, silicone band",
      sizes: ["One size"],
      price: 9200, oldPrice: 10500, stock: 26,
      images: [U("photo-1523275335684-37898b6baf30"), U("photo-1434493789847-2f02dc6ca35d"), U("photo-1508685096489-7aacd43bd3b1"), U("photo-1617043786394-f977fa12eddf")],
      colorImages: [U("photo-1523275335684-37898b6baf30"), U("photo-1434493789847-2f02dc6ca35d"), U("photo-1508685096489-7aacd43bd3b1")],
      colors: ["#000000", "#c8b5ff", "#c8c8c8"],
      badgeLabel: "New", badgeTone: "new", featured: true, trending: true,
      tags: ["smartwatch", "wearable", "fitness"],
      description: "Smart watch with health monitoring, GPS, and 7-day battery life.",
    },
    {
      slug: "smartphone-pro", name: "Flagship Smartphone Pro",
      category: "gadgets", subcategory: "Phones", brand: "techbd",
      material: "Gorilla Glass, aluminium frame",
      sizes: ["128GB", "256GB"],
      price: 52000, oldPrice: 58000, stock: 48,
      images: [U("photo-1598327105666-5b89351aff97"), U("photo-1565849904461-04a58ad377e0"), U("photo-1512941937669-90a1b58e7e9c"), U("photo-1580910051074-3eb694886505")],
      colorImages: [],
      colors: ["#000000", "#1a1a2e", "#c8c8c8"],
      badgeLabel: "New", badgeTone: "new", featured: true, trending: false,
      tags: ["smartphone", "5g", "camera"],
      description: "Top-of-the-line flagship smartphone with a 108MP camera and 5G support.",
    },
    {
      slug: "laptop-slim", name: "UltraSlim Laptop 14\"",
      category: "gadgets", subcategory: "Laptops", brand: "techbd",
      material: "Aluminium unibody",
      sizes: ["8GB/256GB", "16GB/512GB"],
      price: 78000, oldPrice: 85000, stock: 33,
      images: [U("photo-1496181133206-80ce9b88a853"), U("photo-1525547719571-a2d4ac8945e2"), U("photo-1541807084-5c52b6b3adef"), U("photo-1593642632559-0c6d3fc62b89")],
      colorImages: [],
      colors: ["#c0c0c0", "#2c2c2c"],
      badgeLabel: "Sale", badgeTone: "sale", featured: true, trending: false,
      tags: ["laptop", "ultrabook", "work"],
      description: "Ultra-thin and light laptop, perfect for professionals on the go.",
    },
    {
      slug: "earbuds-tws", name: "True Wireless Earbuds",
      category: "gadgets", subcategory: "Audio", brand: "soundwave",
      material: "ABS, silicone tips",
      sizes: ["One size"],
      price: 3500, oldPrice: 4200, stock: 32,
      images: [U("photo-1590658268037-6bf12165a8df"), U("photo-1572536147248-ac59a8abfa4b"), U("photo-1606220945770-b5b6c2c55bf1"), U("photo-1598986646512-9330bcc4c0dc")],
      colorImages: [],
      colors: ["#ffffff", "#000000"],
      badgeLabel: undefined, badgeTone: undefined, featured: false, trending: true,
      tags: ["earbuds", "tws", "wireless"],
      description: "True wireless earbuds with 30-hour total battery and IPX5 water resistance.",
    },
    {
      slug: "tablet-hd", name: "10\" HD Android Tablet",
      category: "gadgets", subcategory: "Tablets", brand: "techbd",
      material: "Aluminium & glass",
      sizes: ["32GB", "64GB"],
      price: 28000, oldPrice: 32000, stock: 45,
      images: [U("photo-1544244015-0df4b3ffc6b0"), U("photo-1589739900266-43b2843f4c12"), U("photo-1561154464-82e9adf32764"), U("photo-1527698266440-12104e498b76")],
      colorImages: [],
      colors: ["#c0c0c0", "#2c2c2c"],
      badgeLabel: "Sale", badgeTone: "sale", featured: false, trending: false,
      tags: ["tablet", "android", "10inch"],
      description: "10-inch HD tablet for entertainment, study and work.",
    },

    // ── Home & Living ─────────────────────────────────────────────────────────
    {
      slug: "bedsheet-set", name: "Premium Cotton Bedsheet Set",
      category: "home", subcategory: "Bedding", brand: "homecomfort",
      material: "400 thread-count cotton",
      sizes: ["Single", "Double", "King"],
      price: 2800, oldPrice: 3500, stock: 55,
      images: [U("photo-1564019472231-4586c552dc27"), U("photo-1522771739844-6a9f6d5f14af"), U("photo-1556909114-f6e7ad7d3136"), U("photo-1631049307264-da0ec9d70304")],
      colorImages: [],
      colors: ["#ffffff", "#f5f0e8", "#b8d4e8"],
      badgeLabel: "New", badgeTone: "new", featured: true, trending: false,
      tags: ["bedsheet", "cotton", "bedroom"],
      description: "400 thread-count cotton bedsheet set — ultra-soft and durable.",
    },
    {
      slug: "desk-lamp", name: "LED Desk Lamp with USB",
      category: "home", subcategory: "Lighting", brand: "brighthome",
      material: "Aluminium, ABS",
      sizes: ["One size"],
      price: 1500, oldPrice: 1800, stock: 54,
      images: [U("photo-1621177555452-bedbe4c28879"), U("photo-1507473885765-e6ed057f782c"), U("photo-1513506003901-1e6a35d4c4e0"), U("photo-1572635196237-14b3f281503f")],
      colorImages: [],
      colors: ["#ffffff", "#000000"],
      badgeLabel: undefined, badgeTone: undefined, featured: false, trending: false,
      tags: ["lamp", "led", "desk"],
      description: "Adjustable LED desk lamp with USB charging port and touch controls.",
    },
    {
      slug: "sofa-cushion", name: "Nordic Throw Cushion Set (2pcs)",
      category: "home", subcategory: "Decor", brand: "cozyhome",
      material: "Linen cover, polyester fill",
      sizes: ["45×45cm", "50×50cm"],
      price: 950, oldPrice: 1200, stock: 20,
      images: [U("photo-1629949008265-af1bcaf59786"), U("photo-1616627451515-cbc80e5ece5a"), U("photo-1555041469-a586c61ea9bc"), U("photo-1493809842364-78817add7ffb")],
      colorImages: [],
      colors: ["#d4c5b0", "#8b7355", "#ffffff"],
      badgeLabel: "Trending", badgeTone: "trending", featured: false, trending: true,
      tags: ["cushion", "nordic", "decor"],
      description: "Set of 2 premium Nordic-style throw cushions for your sofa or bed.",
    },
    {
      slug: "cookware-set", name: "Non-stick Cookware Set 5pcs",
      category: "home", subcategory: "Kitchen", brand: "chefbd",
      material: "Aluminium, non-stick coating",
      sizes: ["One size"],
      price: 4200, oldPrice: 5000, stock: 25,
      images: [U("photo-1518291344630-4857135fb581"), U("photo-1585515320310-259814833e62"), U("photo-1556909114-f6e7ad7d3136"), U("photo-1574269909862-7e1d70bb8078")],
      colorImages: [],
      colors: ["#2c2c2c", "#c0392b"],
      badgeLabel: "Sale", badgeTone: "sale", featured: false, trending: false,
      tags: ["cookware", "nonstick", "kitchen"],
      description: "5-piece non-stick cookware set — pots and pans for every meal.",
    },

    // ── Beauty ────────────────────────────────────────────────────────────────
    {
      slug: "skincare-kit", name: "Daily Glow Skincare Kit",
      category: "beauty", subcategory: "Skincare", brand: "glowbd",
      material: "Natural ingredients",
      sizes: ["One size"],
      price: 2400, oldPrice: 2900, stock: 10,
      images: [U("photo-1591130901921-3f0652bb3915"), U("photo-1556228720-195a672e8a03"), U("photo-1571781926291-c477ebfd024b"), U("photo-1608248543803-ba4f8c70ae0b")],
      colorImages: [],
      colors: ["#fde8d8", "#ffffff"],
      badgeLabel: "New", badgeTone: "new", featured: true, trending: false,
      tags: ["skincare", "glow", "natural"],
      description: "Complete daily skincare routine — cleanser, toner, moisturizer and SPF.",
    },
    {
      slug: "lipstick-set", name: "Matte Lipstick Collection (6 shades)",
      category: "beauty", subcategory: "Makeup", brand: "glowbd",
      material: "Long-lasting formula",
      sizes: ["One size"],
      price: 1800, oldPrice: 2200, stock: 33,
      images: [U("photo-1512496015851-a90fb38ba796"), U("photo-1586495777744-4e6b23b48a54"), U("photo-1631214503851-25e29e571968"), U("photo-1522335789203-aabd1fc54bc9")],
      colorImages: [],
      colors: ["#c0392b", "#8b0000", "#ff69b4"],
      badgeLabel: "Trending", badgeTone: "trending", featured: false, trending: true,
      tags: ["lipstick", "matte", "makeup"],
      description: "6-shade matte lipstick collection in beautiful bold colors.",
    },
    {
      slug: "perfume-bd", name: "Oud Wood Eau de Parfum 100ml",
      category: "beauty", subcategory: "Fragrance", brand: "aromabd",
      material: "Premium fragrance",
      sizes: ["50ml", "100ml"],
      price: 3200, oldPrice: 3800, stock: 53,
      images: [U("photo-1541643600914-78b084683601"), U("photo-1592945403407-9caf930d03b0"), U("photo-1585386959984-a4155224a1ad"), U("photo-1563170351-be82bc888aa4")],
      colorImages: [],
      colors: ["#c8a96e", "#2c2c2c"],
      badgeLabel: undefined, badgeTone: undefined, featured: false, trending: false,
      tags: ["perfume", "oud", "fragrance"],
      description: "Luxurious Oud Wood fragrance — warm, rich and long-lasting.",
    },

    // ── Grocery ───────────────────────────────────────────────────────────────
    {
      slug: "organic-honey", name: "Pure Sundarban Honey 500g",
      category: "grocery", subcategory: "Organic", brand: "naturebd",
      material: "100% natural honey",
      sizes: ["250g", "500g", "1kg"],
      price: 650, oldPrice: 800, stock: 14,
      images: [U("photo-1587049352846-4a222e784d38"), U("photo-1558642452-9d2a7deb7f62"), U("photo-1471943311424-646960669fbc"), U("photo-1534470397394-7f370f4b09c0")],
      colorImages: [],
      colors: ["#f5a623"],
      badgeLabel: "New", badgeTone: "new", featured: false, trending: false,
      tags: ["honey", "organic", "sundarban"],
      description: "Pure raw honey from the Sundarbans — unprocessed and naturally sweet.",
    },
    {
      slug: "rice-premium", name: "Premium Basmati Rice 5kg",
      category: "grocery", subcategory: "Staples", brand: "grainbd",
      material: "Long grain basmati",
      sizes: ["2kg", "5kg", "10kg"],
      price: 850, oldPrice: 1000, stock: 20,
      images: [U("photo-1586201375761-83865001e31c"), U("photo-1536304929831-ee1ca9d44906"), U("photo-1574226516831-e1dff420e562"), U("photo-1550989460-0adf9ea622e2")],
      colorImages: [],
      colors: ["#f5f0e8"],
      badgeLabel: undefined, badgeTone: undefined, featured: false, trending: false,
      tags: ["rice", "basmati", "grocery"],
      description: "Premium long-grain basmati rice — aromatic and fluffy every time.",
    },
  ];

  for (const p of products) {
    const categoryId = catMap[p.category] ?? null;
    const brandId    = brandMap[p.brand]    ?? null;
    await db.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name, price: p.price, oldPrice: p.oldPrice ?? null,
        stock: p.stock, images: p.images, colorImages: p.colorImages,
        colors: p.colors, sizes: p.sizes,
        badgeLabel: p.badgeLabel ?? null, badgeTone: p.badgeTone ?? null,
        featured: p.featured, trending: p.trending,
        description: p.description ?? null,
        metaTitle: (p as { metaTitle?: string }).metaTitle ?? null,
        metaDesc: (p as { metaDesc?: string }).metaDesc ?? null,
        tags: p.tags, subcategory: p.subcategory,
        categoryId, brandId, status: "ACTIVE",
      },
      create: {
        slug: p.slug, name: p.name, price: p.price, oldPrice: p.oldPrice ?? null,
        stock: p.stock, images: p.images, colorImages: p.colorImages,
        colors: p.colors, sizes: p.sizes,
        badgeLabel: p.badgeLabel ?? null, badgeTone: p.badgeTone ?? null,
        featured: p.featured, trending: p.trending,
        description: p.description ?? null,
        metaTitle: (p as { metaTitle?: string }).metaTitle ?? null,
        metaDesc: (p as { metaDesc?: string }).metaDesc ?? null,
        tags: p.tags, subcategory: p.subcategory, material: p.material,
        categoryId, brandId, status: "ACTIVE",
      },
    });
  }
  console.log(`✓ ${products.length} products seeded`);

  // ── Hero Slides ────────────────────────────────────────────────────────────
  const heroSlides = [
    { badge: "22% OFF",       title: "Latest Fashion Trends",         subtitle: "Discover the newest arrivals — exclusive styles for every season.", cta: "Shop Fashion", slug: "fashion", image: "", gradient: "from-zinc-900 via-black to-black",    order: 0 },
    { badge: "Free Delivery", title: "Top Gadgets & Electronics",     subtitle: "Upgrade your tech — smartphones, earbuds, smartwatches at great prices.", cta: "Shop Gadgets", slug: "gadgets", image: "", gradient: "from-neutral-900 via-black to-black", order: 1 },
    { badge: "Premium",       title: "Beauty & Personal Care",        subtitle: "Skincare, makeup, and fragrances curated just for you.", cta: "Shop Beauty", slug: "beauty", image: "", gradient: "from-stone-900 via-black to-black",   order: 2 },
    { badge: "Best Deals",    title: "Home & Living Essentials",      subtitle: "Fresh picks for your home — from kitchen to bedroom.", cta: "Shop Home", slug: "home", image: "", gradient: "from-zinc-800 via-zinc-900 to-black",  order: 3 },
  ];

  await db.heroSlide.deleteMany({});
  for (const s of heroSlides) {
    await db.heroSlide.create({ data: { ...s, active: true } });
  }
  console.log("✓ Hero slides seeded");

  // ── Promo Banners ──────────────────────────────────────────────────────────
  const promoBanners = [
    { eyebrow: "Premium",     title: "Skincare & Beauty\nEssentials",   subtitle: "Get Extra 30% Off", image: U("photo-1591130901921-3f0652bb3915", 480, 480), href: "/category/beauty",  bg: "#e8f5f0", order: 0 },
    { eyebrow: "Premium",     title: "Healthy Food Habits\nfor Everyday Life", subtitle: "Get Extra 50% Off", image: U("photo-1587049352846-4a222e784d38", 480, 480), href: "/category/grocery", bg: "#fff9e6", order: 1 },
    { eyebrow: "New Arrival", title: "Smart Gadgets\nfor Modern Life",  subtitle: "Up to 40% Off",    image: U("photo-1523275335684-37898b6baf30", 480, 480), href: "/category/gadgets", bg: "#eef2ff", order: 2 },
    { eyebrow: "Trending",    title: "Fashion Made\nfor You",           subtitle: "New styles every week", image: U("photo-1542291026-7eec264c27ff", 480, 480), href: "/category/fashion", bg: "#fdf2f0", order: 3 },
  ];

  await db.promoBanner.deleteMany({});
  for (const b of promoBanners) {
    await db.promoBanner.create({ data: { ...b, active: true } });
  }
  console.log("✓ Promo banners seeded");

  // ── Coupons ────────────────────────────────────────────────────────────────
  const coupons = [
    { code: "SHOPBD10", type: "PERCENT" as const, value: 10, minOrder: 500,  maxUses: 0, expiryDate: new Date("2027-12-31") },
    { code: "WELCOME",  type: "FIXED"   as const, value: 200, minOrder: 1000, maxUses: 0, expiryDate: new Date("2027-12-31") },
    { code: "SAVE500",  type: "FIXED"   as const, value: 500, minOrder: 3000, maxUses: 100, expiryDate: new Date("2027-06-30") },
  ];

  for (const c of coupons) {
    await db.offer.upsert({
      where: { code: c.code },
      update: { value: c.value, expiryDate: c.expiryDate },
      create: { ...c, usedCount: 0, status: "ACTIVE" },
    });
  }
  console.log("✓ Coupons seeded");

  console.log("\n🎉 Seeding complete!");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
