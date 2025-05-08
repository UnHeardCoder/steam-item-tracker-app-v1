import "dotenv/config";
import { db } from "./drizzle/db";
import { items } from "./drizzle/schema";

async function main() {
    await db.insert(items).values({
        market_hash_name: "CS:GO Weapon Case 2",
        steam_appid: 730,
    })
    console.log("Item inserted")
}

main()
