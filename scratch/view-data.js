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
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true } });
  const restaurants = await prisma.restaurant.findMany({ select: { id: true, name: true, slug: true, ownerId: true } });
  const enquiries = await prisma.contactEnquiry.findMany();
  const kitRequests = await prisma.qRKitRequest.findMany();

  console.log("DATA_DUMP_START");
  console.log(JSON.stringify({
    users,
    restaurants,
    enquiries,
    kitRequests
  }, null, 2));
  console.log("DATA_DUMP_END");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
