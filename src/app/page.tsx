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
  params: Promise<{ [key: string]: string | string[] | undefined }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page(props: Props) {
  const initialSummaryData = await getTrackedItemSummary();
  const searchParams = await props.searchParams;
  const selectedItemId = searchParams.selectedItem ? Number(searchParams.selectedItem) : null;
  const selectedItemData = selectedItemId ? await getSelectedItemData(selectedItemId) : null;

  return (
    <div className="relative min-h-screen overflow-x-hidden px-2 sm:px-4 md:px-8 pt-4">
      <div className="absolute inset-0">
        <Background />
      </div>
      <div className="absolute inset-0 flex items-start sm:items-center justify-start sm:justify-center pointer-events-none">
        <div className="pointer-events-auto m-4 mt-4 w-full flex justify-center">
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