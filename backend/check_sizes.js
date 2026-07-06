import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('supabase.co') ? { rejectUnauthorized: false } : false
});

async function checkImages() {
  try {
    const res = await pool.query('SELECT id, name, images FROM products');
    console.log('Postgres Products (IDs and Image Arrays):');
    res.rows.forEach(r => {
      console.log(`- ${r.id}: ${JSON.stringify(r.images)}`);
    });
    await pool.end();
  } catch (err) {
    console.error('Error querying:', err);
  }
}

checkImages();
