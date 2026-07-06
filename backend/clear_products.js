import { db } from './db.js';

async function run() {
  console.log('Starting product database wipe...');
  try {
    await db.clearProducts();
    console.log('✅ Successfully cleared all products from all database stores (Postgres, Supabase, and JSON file).');
    process.exit(0);
  } catch (err) {
    console.error('❌ Wipe failed:', err);
    process.exit(1);
  }
}

run();
