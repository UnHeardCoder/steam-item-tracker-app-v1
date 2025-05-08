import cron from 'node-cron';
import updateAllItemPrices from '../cron/updatePrices';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
config({ path: resolve(process.cwd(), '.env') });

// Verify database connection is configured
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set in environment variables');
  process.exit(1);
}

// Run the update immediately when the script starts
console.log('Running initial price update...');
updateAllItemPrices();

// Schedule the task to run every hour
cron.schedule('0 * * * *', () => {
  console.log('Running scheduled price update...');
  updateAllItemPrices();
});

console.log('Price update scheduler started. Will run every hour.'); 