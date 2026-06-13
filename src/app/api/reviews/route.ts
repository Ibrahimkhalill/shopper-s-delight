import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ReviewSchema, ReviewReplySchema, parseBody } from "@/lib/validators";

// GET /api/reviews?productId=xxx
// Returns all reviews for a product (public)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const reviews = await db.review.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    include: {
      user:    { select: { id: true, name: true } },
      replies: { orderBy: { createdAt: "asc" } },
    },
  });

  return NextResponse.json({ reviews });
}

// POST /api/reviews — add a review
// Rules:
//   - Logged-in users: can only review if they have a delivered order with that product
//   - Guests: can review without purchase check (not ideal, but keeps UX frictionless)
//   - One review per user per product
export async function POST(req: Request) {
  const session = await auth();

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const parsed = parseBody(ReviewSchema, body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { productId, rating, text, images, guestName } = parsed.data;

  // Check product exists
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  let verified = false;

  if (session?.user?.id) {
    // Prevent duplicate reviews from the same user
    const already = await db.review.findFirst({
      where: { productId, userId: session.user.id },
    });
    if (already) {
      return NextResponse.json({ error: "You already reviewed this product" }, { status: 409 });
    }

    // Verified purchase: check if user has a delivered order with this product
    const purchased = await db.order.findFirst({
      where: {
        userId: session.user.id,
        status: "DELIVERED",
        items: { some: { productId } },
      },
    });
    verified = !!purchased;
  }

  const review = await db.review.create({
    data: {
      productId,
      userId:    session?.user?.id ?? null,
      guestName: session ? null : (guestName ?? "Guest"),
      rating,
      text,
      images:    images ?? [],
      verified,
    },
    include: {
      user:    { select: { id: true, name: true } },
      replies: true,
    },
  });

  return NextResponse.json({ review }, { status: 201 });
}
