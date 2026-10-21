-- ============================================================
-- AFTRAH — Supabase Storage Bucket for Site Videos & Posters
-- Migration: 20261013_site_videos_storage_bucket.sql
-- ============================================================

-- 1. Create the public 'site-videos' bucket in storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'site-videos',
    'site-videos',
    true,
    209715200, -- 200 MB max size per video file
    ARRAY[
        'video/mp4',
        'video/webm',
        'video/quicktime',
        'video/x-m4v',
        'image/jpeg',
        'image/png',
        'image/webp'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 209715200,
    allowed_mime_types = ARRAY[
        'video/mp4',
        'video/webm',
        'video/quicktime',
        'video/x-m4v',
        'image/jpeg',
        'image/png',
        'image/webp'
    ];

-- 2. Storage Policies for 'site-videos' bucket

-- Public Read: allows anyone visiting the website to stream and view the videos
DROP POLICY IF EXISTS "Public can view site videos" ON storage.objects;
CREATE POLICY "Public can view site videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-videos');

-- Upload / Insert: allows uploading new video files and poster thumbnails
DROP POLICY IF EXISTS "Allow upload to site videos" ON storage.objects;
CREATE POLICY "Allow upload to site videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'site-videos');

-- Update: allows replacing or overwriting existing video files and posters
DROP POLICY IF EXISTS "Allow update on site videos" ON storage.objects;
CREATE POLICY "Allow update on site videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'site-videos');

-- Delete: allows removing video files when deleted from the app
DROP POLICY IF EXISTS "Allow delete on site videos" ON storage.objects;
CREATE POLICY "Allow delete on site videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'site-videos');
