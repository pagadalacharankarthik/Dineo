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
  const rest = await prisma.restaurant.findUnique({
    where: { slug: "demo" },
    include: {
      categories: {
        include: {
          menuItems: true
        }
      }
    }
  });

  if (!rest) {
    console.log("demo restaurant not found!");
    return;
  }

  console.log("DEMO_RESTAURANT_DUMP_START");
  console.log(JSON.stringify(rest, null, 2));
  console.log("DEMO_RESTAURANT_DUMP_END");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
