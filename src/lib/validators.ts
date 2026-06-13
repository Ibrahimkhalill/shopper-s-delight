import { z } from "zod";

// ─── Shared ───────────────────────────────────────────────────────────────────

const phone = z
  .string()
  .min(10, "Phone must be at least 10 digits")
  .max(15, "Phone too long")
  .regex(/^[0-9+\-\s]+$/, "Invalid phone number");

const password = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(100, "Password too long");

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  name:     z.string().min(2, "Name too short").max(60, "Name too long").trim(),
  phone,
  email:    z.string().email("Invalid email").optional().or(z.literal("")),
  password,
});

export const LoginSchema = z.object({
  phone,
  password,
});

// ─── Order ────────────────────────────────────────────────────────────────────

export const PlaceOrderSchema = z.object({
  name:         z.string().min(2).max(60).trim(),
  phone,
  email:        z.string().email().optional().or(z.literal("")),
  address:      z.string().min(5).max(300).trim(),
  district:     z.string().min(2).max(60).trim(),
  division:     z.string().min(2).max(60).trim(),
  notes:        z.string().max(500).optional(),
  deliveryArea: z.enum(["inside", "outside"]),
  payment:      z.enum(["cod", "bkash", "nagad", "card"]),
  couponCode:   z.string().max(30).optional(),
  // Cart items sent from the client
  items: z.array(
    z.object({
      productId: z.string().min(1),
      qty:       z.number().int().min(1).max(99),
      size:      z.string().max(30).optional(),
      color:     z.string().max(20).optional(),
    })
  ).min(1, "Cart is empty"),
});

// ─── Review ───────────────────────────────────────────────────────────────────

export const ReviewSchema = z.object({
  productId: z.string().min(1),
  rating:    z.number().int().min(1).max(5),
  text:      z.string().min(3, "Review too short").max(2000, "Review too long").trim(),
  images:    z.array(z.string().url()).max(3).optional(),
  guestName: z.string().min(2).max(60).optional(),
});

export const ReviewReplySchema = z.object({
  text:     z.string().min(1).max(1000).trim(),
  userName: z.string().min(2).max(60).trim(),
});

// ─── Cart ─────────────────────────────────────────────────────────────────────

export const CartSyncSchema = z.array(
  z.object({
    productId: z.string().min(1),
    qty:       z.number().int().min(1).max(99),
    size:      z.string().max(30).optional(),
    color:     z.string().max(20).optional(),
  })
);

export const CartUpdateSchema = z.object({
  productId: z.string().min(1),
  qty:       z.number().int().min(0).max(99),
  size:      z.string().max(30).optional(),
  color:     z.string().max(20).optional(),
});

// ─── Admin: Product ───────────────────────────────────────────────────────────

export const AdminProductSchema = z.object({
  name:        z.string().min(2).max(200).trim(),
  slug:        z.string().min(2).max(200).toLowerCase().trim(),
  description: z.string().max(5000).optional(),
  price:       z.number().int().min(1),
  oldPrice:    z.number().int().min(1).optional(),
  stock:       z.number().int().min(0).default(0),
  images:      z.array(z.string()).min(1, "At least one image required"),
  colorImages: z.array(z.string()).optional(),
  colors:      z.array(z.string()).optional(),
  sizes:       z.array(z.string()).optional(),
  material:    z.string().max(200).optional(),
  tags:        z.array(z.string().max(50)).optional(),
  badgeLabel:  z.string().max(30).optional(),
  badgeTone:   z.enum(["new", "sale", "trending"]).optional(),
  status:      z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).default("ACTIVE"),
  featured:    z.boolean().default(false),
  trending:    z.boolean().default(false),
  metaTitle:   z.string().max(70).optional(),
  metaDesc:    z.string().max(160).optional(),
  categoryId:  z.string().optional(),
  brandId:     z.string().optional(),
  subcategory: z.string().max(100).optional(),
  variants: z.array(
    z.object({
      size:  z.string().max(30),
      color: z.string().max(20),
      price: z.number().int().min(1),
      stock: z.number().int().min(0),
      sku:   z.string().max(50).optional(),
    })
  ).optional(),
});

// ─── Admin: Category ──────────────────────────────────────────────────────────

export const CategorySchema = z.object({
  name:     z.string().min(2).max(100).trim(),
  slug:     z.string().min(2).max(100).toLowerCase().trim(),
  parentId: z.string().optional().nullable(),
  image:    z.string().optional(),
  status:   z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

// ─── Admin: Brand ─────────────────────────────────────────────────────────────

export const BrandSchema = z.object({
  name:        z.string().min(2).max(100).trim(),
  slug:        z.string().min(2).max(100).toLowerCase().trim(),
  image:       z.string().optional(),
  description: z.string().max(500).optional(),
  status:      z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

// ─── Admin: Offer ─────────────────────────────────────────────────────────────

export const OfferSchema = z.object({
  code:       z.string().min(3).max(30).toUpperCase().trim(),
  type:       z.enum(["PERCENT", "FIXED"]),
  value:      z.number().int().min(1),
  minOrder:   z.number().int().min(0).default(0),
  maxUses:    z.number().int().min(0).default(0),
  expiryDate: z.string().datetime(),
  status:     z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

// ─── Admin: Order status update ───────────────────────────────────────────────

export const OrderStatusSchema = z.object({
  status: z.enum(["PLACED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

// ─── Helper: parse and return 400 on failure ─────────────────────────────────

export function parseBody<T>(schema: z.ZodSchema<T>, data: unknown):
  | { ok: true;  data: T }
  | { ok: false; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const msg = result.error.errors.map((e) => e.message).join(", ");
    return { ok: false, error: msg };
  }
  return { ok: true, data: result.data };
}
