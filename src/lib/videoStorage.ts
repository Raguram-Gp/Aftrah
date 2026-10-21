import type { SiteReel } from '@/components/afrah-app/types';
import { INITIAL_REELS } from '@/components/afrah-app/data/initialReels';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export const REELS_STORAGE_KEY = 'afrah_site_reels_metadata';
export const SYNC_CHANNEL_NAME = 'afrah_reels_sync';
const DB_NAME = 'afrah_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'media_blobs';

// Open IndexedDB database
const openMediaDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Stores a media Blob (video or image) in IndexedDB.
 */
export const storeMediaBlob = async (key: string, blob: Blob): Promise<string> => {
  try {
    const db = await openMediaDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    return `idb:${key}`;
  } catch (err) {
    console.warn('Failed to store media blob in IndexedDB:', err);
    return '';
  }
};

/**
 * Retrieves a media Blob by key from IndexedDB.
 */
export const getMediaBlob = async (key: string): Promise<Blob | null> => {
  try {
    const cleanKey = key.replace(/^idb:/, '');
    const db = await openMediaDB();
    return await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(cleanKey);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to retrieve media blob from IndexedDB:', err);
    return null;
  }
};

/**
 * Deletes a media Blob from IndexedDB.
 */
export const deleteMediaBlob = async (key: string): Promise<void> => {
  try {
    const cleanKey = key.replace(/^idb:/, '');
    const db = await openMediaDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(cleanKey);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to delete media blob from IndexedDB:', err);
  }
};

// In-memory cache for created object URLs to prevent duplicate allocations
const objectUrlCache = new Map<string, string>();

/**
 * Resolves a video or poster URL.
 * If it points to an IndexedDB key (`idb:key`), it retrieves the Blob and generates a blob URL.
 */
export const resolveMediaUrl = async (urlOrKey: string): Promise<string> => {
  if (!urlOrKey) return '';
  if (urlOrKey.startsWith('idb:')) {
    if (objectUrlCache.has(urlOrKey)) {
      return objectUrlCache.get(urlOrKey)!;
    }
    const blob = await getMediaBlob(urlOrKey);
    if (blob) {
      const blobUrl = URL.createObjectURL(blob);
      objectUrlCache.set(urlOrKey, blobUrl);
      return blobUrl;
    }
    return '';
  }
  return urlOrKey;
};

/**
 * Automatically extracts a high-quality poster frame thumbnail and duration from a video file.
 */
export const extractPosterAndDurationFromVideo = (
  file: File
): Promise<{ posterUrl: string; duration: string; posterBlob: Blob }> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const fileUrl = URL.createObjectURL(file);
    video.src = fileUrl;

    let durationStr = '0:45';

    video.onloadedmetadata = () => {
      const totalSeconds = Math.round(video.duration || 0);
      const m = Math.floor(totalSeconds / 60);
      const s = totalSeconds % 60;
      durationStr = `${m}:${s < 10 ? '0' : ''}${s}`;

      // Seek to 1 second or 20% in for best representative frame
      video.currentTime = Math.min(1.0, video.duration * 0.2);
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(fileUrl);
              resolve({
                posterUrl: dataUrl,
                duration: durationStr,
                posterBlob: blob || new Blob(),
              });
            },
            'image/jpeg',
            0.85
          );
        } else {
          URL.revokeObjectURL(fileUrl);
          resolve({
            posterUrl: '',
            duration: durationStr,
            posterBlob: new Blob(),
          });
        }
      } catch (err) {
        URL.revokeObjectURL(fileUrl);
        reject(err);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(fileUrl);
      reject(new Error('Failed to load video file for thumbnail generation.'));
    };
  });
};

export const SUPABASE_VIDEO_BUCKET = 'site-videos';

/**
 * Checks if a given URL is hosted on Supabase Storage.
 */
export const isSupabaseStorageUrl = (url: string): boolean => {
  if (!url) return false;
  return url.includes('supabase.co/storage/v1/object/public/') || url.includes('/storage/v1/object/public/');
};

/**
 * Attempts to verify or create the Supabase Storage bucket for site videos.
 */
export const ensureSupabaseBucketExists = async (
  bucketName = SUPABASE_VIDEO_BUCKET
): Promise<boolean> => {
  if (!isSupabaseConfigured) return false;
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (!error && buckets && buckets.some((b) => b.name === bucketName || b.id === bucketName)) {
      return true;
    }
    // Attempt to create bucket if listBuckets permitted
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 209715200, // 200MB
    });
    return !createError;
  } catch (err) {
    console.warn('Could not verify/create Supabase bucket:', err);
    return false;
  }
};

/**
 * Uploads a video or image file to Supabase Storage.
 * Sets correct mime type, cache control, and returns the live public URL.
 */
export const uploadFileToSupabaseStorage = async (
  file: File | Blob,
  path: string,
  bucketName = SUPABASE_VIDEO_BUCKET
): Promise<string | null> => {
  if (!isSupabaseConfigured) return null;
  try {
    // Determine mime type
    let contentType = 'video/mp4';
    if (file.type) {
      contentType = file.type;
    } else if (path.endsWith('.webm')) {
      contentType = 'video/webm';
    } else if (path.endsWith('.mov')) {
      contentType = 'video/quicktime';
    } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    } else if (path.endsWith('.png')) {
      contentType = 'image/png';
    } else if (path.endsWith('.webp')) {
      contentType = 'image/webp';
    }

    const { data, error } = await supabase.storage.from(bucketName).upload(path, file, {
      cacheControl: '3600',
      contentType,
      upsert: true,
    });

    if (error || !data) {
      console.warn(`Supabase Storage upload to '${bucketName}/${path}' error:`, error?.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(data.path);
    return publicUrlData?.publicUrl || null;
  } catch (err) {
    console.warn(`Supabase Storage upload to bucket '${bucketName}' failed:`, err);
    return null;
  }
};

/**
 * Deletes a file from Supabase Storage by public URL or relative path.
 */
export const deleteFileFromSupabaseStorage = async (
  urlOrPath: string,
  bucketName = SUPABASE_VIDEO_BUCKET
): Promise<boolean> => {
  if (!isSupabaseConfigured || !urlOrPath) return false;
  try {
    let cleanPath = urlOrPath;
    const bucketMarker = `/${bucketName}/`;
    if (urlOrPath.includes(bucketMarker)) {
      cleanPath = urlOrPath.substring(urlOrPath.indexOf(bucketMarker) + bucketMarker.length);
    }
    // Remove query params if any
    cleanPath = cleanPath.split('?')[0];

    const { error } = await supabase.storage.from(bucketName).remove([cleanPath]);
    if (error) {
      console.warn(`Supabase Storage delete '${cleanPath}' error:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`Error deleting from Supabase Storage:`, err);
    return false;
  }
};

/**
 * LocalStorage Metadata Helpers
 */
export const getStoredReels = (): SiteReel[] => {
  if (typeof window === 'undefined') return INITIAL_REELS;
  try {
    const item = localStorage.getItem(REELS_STORAGE_KEY);
    if (item) {
      const parsed = JSON.parse(item);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse stored reels from localStorage:', e);
  }
  return INITIAL_REELS;
};

export const setStoredReels = (reels: SiteReel[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REELS_STORAGE_KEY, JSON.stringify(reels));
  } catch (e) {
    console.warn('Failed to write reels to localStorage:', e);
  }
};

/**
 * Cross-tab and cross-window sync broadcaster.
 */
export const broadcastReelsUpdate = (reels: SiteReel[]): void => {
  if (typeof window === 'undefined') return;

  // 1. BroadcastChannel API
  try {
    if ('BroadcastChannel' in window) {
      const bc = new BroadcastChannel(SYNC_CHANNEL_NAME);
      bc.postMessage({ type: 'REELS_UPDATED', reels });
      bc.close();
    }
  } catch (e) {
    console.warn('BroadcastChannel error:', e);
  }

  // 2. Custom window event for same-window components
  window.dispatchEvent(
    new CustomEvent('afrah-reels-updated', { detail: { reels } })
  );
};

/**
 * Listen for live updates from other tabs or components.
 */
export const subscribeToReelsUpdates = (
  callback: (reels: SiteReel[]) => void
): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  let bc: BroadcastChannel | null = null;
  try {
    if ('BroadcastChannel' in window) {
      bc = new BroadcastChannel(SYNC_CHANNEL_NAME);
      bc.onmessage = (event) => {
        if (event.data?.type === 'REELS_UPDATED' && Array.isArray(event.data.reels)) {
          callback(event.data.reels);
        }
      };
    }
  } catch (e) {
    console.warn('BroadcastChannel subscribe error:', e);
  }

  const handleCustomEvent = (e: any) => {
    if (e.detail?.reels && Array.isArray(e.detail.reels)) {
      callback(e.detail.reels);
    }
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === REELS_STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed)) {
          callback(parsed);
        }
      } catch (err) {
        console.warn('StorageEvent parse error:', err);
      }
    }
  };

  window.addEventListener('afrah-reels-updated', handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    if (bc) {
      bc.close();
    }
    window.removeEventListener('afrah-reels-updated', handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
};
