import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local for CLI commands (prisma db push, prisma migrate, etc.)
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // DIRECT_URL bypasses PgBouncer pooler for schema migrations
    // Falls back to DATABASE_URL if DIRECT_URL is not set
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
