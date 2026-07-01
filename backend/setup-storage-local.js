// setup-storage-local.js — Local setup script for DB storage policies
const pg = require('pg');

const connectionString = 'postgresql://postgres:2Hjk10eXRtnQG6R7@db.xckbpnvkteeczvibmbrq.supabase.co:5432/postgres';

async function run() {
  const client = new pg.Client({ connectionString });
  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL.");

    const queries = [
      `ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;`,
      `DROP POLICY IF EXISTS "Public Select stone-images" ON storage.objects;`,
      `DROP POLICY IF EXISTS "Public Insert stone-images" ON storage.objects;`,
      `DROP POLICY IF EXISTS "Public Update stone-images" ON storage.objects;`,
      `DROP POLICY IF EXISTS "Public Delete stone-images" ON storage.objects;`,
      
      `CREATE POLICY "Public Select stone-images" ON storage.objects 
       FOR SELECT TO public USING (bucket_id = 'stone-images');`,
       
      `CREATE POLICY "Public Insert stone-images" ON storage.objects 
       FOR INSERT TO public WITH CHECK (bucket_id = 'stone-images');`,
       
      `CREATE POLICY "Public Update stone-images" ON storage.objects 
       FOR UPDATE TO public USING (bucket_id = 'stone-images');`,
       
      `CREATE POLICY "Public Delete stone-images" ON storage.objects 
       FOR DELETE TO public USING (bucket_id = 'stone-images');`
    ];

    for (const sql of queries) {
      await client.query(sql);
      console.log(`✓ Executed: ${sql.substring(0, 60)}...`);
    }
    console.log("✅ Successfully set up all storage policies!");
  } catch (err) {
    console.error("❌ Error setting up policies:", err.message);
  } finally {
    await client.end();
  }
}

run();
