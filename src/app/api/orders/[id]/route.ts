import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/orders/:id
// Logged-in users: can fetch their own order by ID
// Guests: must provide ?phone=01XXXXXXXX to prove ownership
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id }       = await params;
  const session      = await auth();
  const { searchParams } = new URL(req.url);
  const guestPhone   = searchParams.get("phone");

  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: { name: true, images: true, slug: true, price: true },
          },
        },
      },
    },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // Authorization: must be the owner OR provide the correct phone
  const isOwner = session?.user?.id && order.userId === session.user.id;
  const isAdmin = session?.user?.role === "ADMIN";
  const phoneMatch = guestPhone && order.phone === guestPhone;

  if (!isOwner && !isAdmin && !phoneMatch) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  return NextResponse.json({ order });
}
