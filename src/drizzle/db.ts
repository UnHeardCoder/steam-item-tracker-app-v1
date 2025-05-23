import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import postgres from "postgres";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL as string;
const client = postgres(connectionString);
export const db = drizzle(client, { schema, logger: true });
