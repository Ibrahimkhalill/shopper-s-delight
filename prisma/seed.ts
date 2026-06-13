// Run once to seed the first admin user:
//   npx tsx prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const phone    = process.env.ADMIN_PHONE    ?? "01700000000";
  const email    = process.env.ADMIN_EMAIL    ?? "admin@shopbd.com";
  const password = process.env.ADMIN_PASSWORD ?? "change_me";
  const name     = "Admin";

  const existing = await db.user.findFirst({
    where: { OR: [{ phone }, { email }] },
  });

  if (existing) {
    console.log("Admin already exists:", existing.phone);
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  const admin  = await db.user.create({
    data: { name, phone, email, password: hashed, role: "ADMIN" },
  });

  console.log("Admin created:", admin.phone, admin.email);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
