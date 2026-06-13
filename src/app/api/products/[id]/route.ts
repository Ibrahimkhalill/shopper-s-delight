import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/products/:id
// :id can be the product slug (preferred for SEO) or the cuid
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const product = await db.product.findFirst({
    where: {
      OR: [{ slug: id }, { id }],
      status: "ACTIVE",
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      brand:    { select: { id: true, name: true, slug: true } },
      variants: true,
      reviews: {
        orderBy: { createdAt: "desc" },
        include: {
          user:    { select: { id: true, name: true } },
          replies: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
}
