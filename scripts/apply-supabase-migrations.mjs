import fs from 'fs';
import path from 'path';

let SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
let PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'zhbcopkgwfjqzlhbmgqf';

if (!SUPABASE_ACCESS_TOKEN && fs.existsSync('.env.local')) {
  const content = fs.readFileSync('.env.local', 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('SUPABASE_ACCESS_TOKEN=')) {
      SUPABASE_ACCESS_TOKEN = trimmed.split('=')[1].trim();
    }
    if (trimmed.startsWith('PUBLIC_SUPABASE_URL=')) {
      const url = trimmed.split('=')[1].trim();
      const match = url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/);
      if (match) PROJECT_REF = match[1];
    }
  }
}

if (!SUPABASE_ACCESS_TOKEN) {
  console.error('❌ Error: SUPABASE_ACCESS_TOKEN is not set in environment or .env.local');
  process.exit(1);
}

async function executeSql(sql, label) {
  console.log(`Running migration: ${label}...`);
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error(`❌ Migration failed for ${label}:`, text);
    throw new Error(`Migration ${label} failed: ${text}`);
  }
  console.log(`✅ ${label} succeeded:`, text.slice(0, 100));
}

async function main() {
  const migrationsDir = path.resolve('supabase/migrations');
  const files = [
    '20261012_site_reels.sql',
    '20261013_site_videos_storage_bucket.sql',
  ];

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    if (fs.existsSync(filePath)) {
      const sql = fs.readFileSync(filePath, 'utf-8');
      await executeSql(sql, file);
    } else {
      console.warn(`File not found: ${filePath}`);
    }
  }

  // Verify site_reels table
  await executeSql('SELECT count(*) FROM public.site_reels;', 'Verify site_reels table');

  // Verify storage bucket
  await executeSql('SELECT id, name, public FROM storage.buckets WHERE id = \'site-videos\';', 'Verify site-videos bucket');

  console.log('\n🎉 All Supabase migrations and storage bucket setup completed successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
