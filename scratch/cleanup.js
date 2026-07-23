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
  console.log("Starting DB Cleanup...");

  // 1. Delete Dineo Test User
  const deletedTestUser = await prisma.user.deleteMany({
    where: { email: "dineotest1784630591327@example.com" }
  });
  console.log(`Deleted Dineo Test User records: ${deletedTestUser.count}`);

  // 2. Delete Tom (which will cascade delete Tom's Restaurant, QR Codes, and QR Scans)
  const deletedTom = await prisma.user.deleteMany({
    where: { email: "wanojar460@rapplo.com" }
  });
  console.log(`Deleted Tom (User + Restaurant + related): ${deletedTom.count}`);

  // 3. Delete Bot Enquiries
  const deletedBots = await prisma.contactEnquiry.deleteMany({
    where: {
      email: {
        in: ["bot@dineo.com", "bot2@dineo.com"]
      }
    }
  });
  console.log(`Deleted Bot Contact Enquiries: ${deletedBots.count}`);

  console.log("DB Cleanup Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("Error during cleanup:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
