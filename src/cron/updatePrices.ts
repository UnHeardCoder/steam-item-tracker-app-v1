import { db } from '~/drizzle/db';
import { updateItemPrice } from '~/app/actions';

async function updateAllItemPrices() {
  try {
    console.log('Starting scheduled price update...');
    
    // Get all items from the database
    const allItems = await db.query.items.findMany();
    console.log(`Found ${allItems.length} items to update`);

    // Update each item's price
    for (const item of allItems) {
      try {
        console.log(`Updating price for item: ${item.market_hash_name}`);
        const result = await updateItemPrice(item.id);
        
        if (result.success) {
          console.log(`Successfully updated price for ${item.market_hash_name}: ${result.data?.currentPrice}`);
        } else {
          console.error(`Failed to update price for ${item.market_hash_name}:`, result.error);
        }
      } catch (error) {
        console.error(`Error updating price for ${item.market_hash_name}:`, error);
      }
    }

    console.log('Completed scheduled price update');
  } catch (error) {
    console.error('Error in scheduled price update:', error);
  }
}

// Export the function for use in the cron job
export default updateAllItemPrices; 