import Background from "../components/Background";
import Steamitemtracker from "../components/Steamitemtracker";
import { db } from "../drizzle/db";
import { items, priceHistory } from "../drizzle/schema";
import { eq, sql, min, max } from "drizzle-orm";

async function getTrackedItemSummary() {
  const trackedItemsSummary = await db
    .select({
      market_hash_name: items.market_hash_name,
      tracked_start_date: min(priceHistory.recordedAt),
      tracked_end_date: max(priceHistory.recordedAt),
      item_id: items.id,
      item_created_at: items.createdAt,
      steam_appid: items.steam_appid
    })
    .from(items)
    .leftJoin(priceHistory, sql`${items.id} = ${priceHistory.itemId}`)
    .groupBy(items.id, items.market_hash_name, items.createdAt, items.steam_appid)
    .orderBy(items.market_hash_name);
  return trackedItemsSummary;
}

async function getSelectedItemData(itemId: number) {
  const itemData = await db
    .select({
      market_hash_name: items.market_hash_name,
      tracked_start_date: min(priceHistory.recordedAt),
      tracked_end_date: max(priceHistory.recordedAt),
      item_id: items.id,
      item_created_at: items.createdAt,
      steam_appid: items.steam_appid,
      volume: sql<number>`COUNT(${priceHistory.id})`,
      trend: sql<string>`CASE 
        WHEN AVG(${priceHistory.price}) > LAG(AVG(${priceHistory.price})) OVER (ORDER BY ${priceHistory.recordedAt}) 
        THEN 'UP' 
        ELSE 'DOWN' 
      END`
    })
    .from(items)
    .leftJoin(priceHistory, sql`${items.id} = ${priceHistory.itemId}`)
    .where(eq(items.id, itemId))
    .groupBy(items.id, items.market_hash_name, items.createdAt, items.steam_appid, priceHistory.recordedAt)
    .orderBy(priceHistory.recordedAt)
    .limit(1);

  return itemData[0];
}

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
  params: { [key: string]: string | string[] | undefined };
}

export default async function Home(props: Props) {
  const initialSummaryData = await getTrackedItemSummary();
  const selectedItemId = props.searchParams.selectedItem ? Number(props.searchParams.selectedItem) : null;
  const selectedItemData = selectedItemId ? await getSelectedItemData(selectedItemId) : null;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="absolute inset-0">
        <Background />
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <Steamitemtracker
            initialSummaryData={initialSummaryData}
            selectedItemData={selectedItemData}
            selectedItemId={selectedItemId}
          />
        </div>
      </div>
    </div>
  );
}