import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`;

const logOption: ("query" | "info" | "warn" | "error")[] =
  process.env.NODE_ENV !== "production" ? ["query", "info"] : ["error"];

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter, log: logOption });

export { prisma };
