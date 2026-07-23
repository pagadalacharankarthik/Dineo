const { PrismaClient } = require("@prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");
const { neonConfig } = require("@neondatabase/serverless");
const ws = require("ws");
require("dotenv").config({ path: ".env.local" });

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const rahulRest = await prisma.restaurant.findFirst({
    where: { name: { contains: "Rahul" } }
  });

  if (!rahulRest) {
    console.log("Rahul Restaurant not found in DB.");
    return;
  }

  const updated = await prisma.restaurant.update({
    where: { id: rahulRest.id },
    data: { slug: "demo" }
  });

  console.log(`Successfully updated slug for '${updated.name}' to '${updated.slug}'`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
