/**
 * One-off: set password for Santiago to SantI123
 * Run: node scripts/update-santiago-password.mjs
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const emailMatch = process.env.SANTIAGO_EMAIL || "santiago.corellvidal";
  const users = await prisma.user.findMany({
    where: { email: { contains: emailMatch } },
  });
  if (users.length === 0) {
    console.error("No user found with email containing:", emailMatch);
    process.exit(1);
  }
  const user = users[0];
  const newPassword = "SantI123.";
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });
  console.log("Password updated for", user.email);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
