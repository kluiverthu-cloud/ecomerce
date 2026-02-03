// Configuración de Prisma para E-Commerce
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Usar URL directa para migraciones (sin pooler)
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"],
  },
});
