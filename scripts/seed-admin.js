const { PrismaClient } = require("@prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");
const { neonConfig } = require("@neondatabase/serverless");
const ws = require("ws");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "admin@dineo.com";
  const password = "AdminPassword123!";
  const name = "Super Admin";

  console.log("Seeding Super Admin...");

  const existing = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (existing) {
    console.log("Super Admin already exists with email:", email);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.adminUser.create({
    data: {
      name,
      email,
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  console.log("Super Admin created successfully!");
  console.log("Email:", admin.email);
  console.log("Password:", password);
}

main()
  .catch((e) => {
    console.error("Error seeding admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
