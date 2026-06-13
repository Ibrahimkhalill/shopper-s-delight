import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PlaceOrderSchema, parseBody } from "@/lib/validators";

function generateOrderId(): string {
  const year = new Date().getFullYear();
  const rand = String(Math.floor(Math.random() * 99999)).padStart(5, "0");
  return `BD-${year}-${rand}`;
}

// POST /api/orders — place an order
// Works for BOTH guests (no auth) and logged-in users
// Body: PlaceOrderSchema
export async function POST(req: Request) {
  const session = await auth(); // null for guests — that's fine

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const parsed = parseBody(PlaceOrderSchema, body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { name, phone, email, address, district, division, notes,
          deliveryArea, payment, couponCode, items } = parsed.data;

  // ── 1. Resolve products and calculate price server-side ─────────────────
  const productIds = items.map((i) => i.productId);
  const products   = await db.product.findMany({
    where: { id: { in: productIds }, status: "ACTIVE" },
    select: { id: true, slug: true, price: true, stock: true, name: true },
  });

  if (products.length === 0) {
    return NextResponse.json({ error: "No valid products in cart" }, { status: 400 });
  }

  const productMap = new Map(products.map((p) => [p.id, p]));

  // ── 2. Validate coupon if provided ────────────────────────────────────────
  let discount = 0;
  if (couponCode) {
    const offer = await db.offer.findFirst({
      where: {
        code:   couponCode.toUpperCase(),
        status: "ACTIVE",
        expiryDate: { gte: new Date() },
      },
    });
    if (offer) {
      const subtotalForCoupon = items.reduce((s, i) => {
        const p = productMap.get(i.productId);
        return s + (p ? p.price * i.qty : 0);
      }, 0);
      if (subtotalForCoupon >= offer.minOrder) {
        discount = offer.type === "PERCENT"
          ? Math.round(subtotalForCoupon * offer.value / 100)
          : offer.value;
        // Increment usedCount (fire-and-forget, don't block order)
        db.offer.update({ where: { id: offer.id }, data: { usedCount: { increment: 1 } } })
          .catch(() => {});
      }
    }
  }

  // ── 3. Build order items with price snapshots ─────────────────────────────
  const orderItems = items.flatMap((i) => {
    const p = productMap.get(i.productId);
    if (!p) return [];
    return [{
      productId: p.id,
      qty:       i.qty,
      size:      i.size  ?? null,
      color:     i.color ?? null,
      price:     p.price, // snapshot — never changes after order
    }];
  });

  const subtotal     = orderItems.reduce((s, i) => s + i.price * i.qty, 0);
  const shippingCost = deliveryArea === "inside" ? 80 : 120;
  const total        = subtotal - discount + shippingCost;

  // ── 4. Generate unique order ID (retry on collision) ─────────────────────
  let orderId = generateOrderId();
  for (let i = 0; i < 5; i++) {
    const exists = await db.order.findUnique({ where: { id: orderId } });
    if (!exists) break;
    orderId = generateOrderId();
  }

  // ── 5. Create the order ───────────────────────────────────────────────────
  const order = await db.order.create({
    data: {
      id:           orderId,
      userId:       session?.user?.id ?? null,
      name,
      phone,
      email:        email || null,
      address,
      district,
      division,
      notes:        notes ?? null,
      subtotal,
      shippingCost,
      discount,
      total,
      payment,
      items: { createMany: { data: orderItems } },
    },
    include: { items: true },
  });

  // ── 6. Clear the user's server-side cart if logged in ────────────────────
  if (session?.user?.id) {
    db.cartItem.deleteMany({ where: { userId: session.user.id } }).catch(() => {});
  }

  return NextResponse.json({ order }, { status: 201 });
}

// GET /api/orders — returns logged-in user's orders
export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page  = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 10;
  const skip  = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        items: {
          include: { product: { select: { name: true, images: true, slug: true } } },
        },
      },
    }),
    db.order.count({ where: { userId: session.user.id } }),
  ]);

  return NextResponse.json({ orders, total, page, totalPages: Math.ceil(total / limit) });
}
