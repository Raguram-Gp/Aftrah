import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

let supabaseUrl = process.env.PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl && fs.existsSync('.env.local')) {
  const content = fs.readFileSync('.env.local', 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = trimmed.split('=')[1].trim();
    }
    if (trimmed.startsWith('PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseKey = trimmed.split('=')[1].trim();
    }
  }
}

console.log('Testing Supabase Storage Connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? supabaseKey.substring(0, 15) + '...' : 'NONE');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStorage() {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.log('listBuckets error:', error.message);
    } else {
      console.log('Existing buckets:', buckets.map(b => ({ name: b.name, public: b.public })));
    }

    // Try creating or ensuring bucket 'site-videos'
    const { data: createData, error: createError } = await supabase.storage.createBucket('site-videos', {
      public: true,
      fileSizeLimit: 209715200,
    });

    if (createError) {
      console.log('createBucket result/error:', createError.message);
    } else {
      console.log('createBucket success:', createData);
    }

    // Test uploading a small sample buffer to 'site-videos'
    const testBuffer = Buffer.from('TEST_VIDEO_MP4_PAYLOAD');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('site-videos')
      .upload('reels/test-sample.mp4', testBuffer, {
        contentType: 'video/mp4',
        upsert: true,
      });

    if (uploadError) {
      console.log('Test upload error:', uploadError.message);
    } else {
      console.log('Test upload SUCCESS! Path:', uploadData.path);
      const { data: publicUrlData } = supabase.storage.from('site-videos').getPublicUrl(uploadData.path);
      console.log('Public URL:', publicUrlData.publicUrl);

      // Test delete
      const { data: removeData, error: removeError } = await supabase.storage
        .from('site-videos')
        .remove(['reels/test-sample.mp4']);
      if (removeError) {
        console.log('Delete error:', removeError.message);
      } else {
        console.log('Test delete SUCCESS! Removed:', removeData);
      }
    }
  } catch (err) {
    console.error('Catch error:', err);
  }
}

checkStorage();
