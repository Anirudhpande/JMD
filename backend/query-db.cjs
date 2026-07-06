const { Pool } = require('pg');
require('dotenv').config({ path: '/run/user/1000/doc/c1d58c5c/JMD/backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    const prodRes = await pool.query("SELECT id, name, slug, category, size, variant_group_id, price FROM products ORDER BY category, name");
    console.log('--- Products in Database ---');
    console.log(JSON.stringify(prodRes.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
