import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { newId } from '@/lib/id';
import type { SiteReel } from '../types';
import { INITIAL_REELS } from '../data/initialReels';
import {
  getStoredReels,
  setStoredReels,
  storeMediaBlob,
  deleteMediaBlob,
  broadcastReelsUpdate,
  subscribeToReelsUpdates,
  uploadFileToSupabaseStorage,
  deleteFileFromSupabaseStorage,
  isSupabaseStorageUrl,
} from '@/lib/videoStorage';

export const useSiteVideos = () => {
  const [reels, setReels] = useState<SiteReel[]>(() => getStoredReels());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch reels from Supabase or fallback
  const fetchReels = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // 1. First ensure local cache is loaded
    const localReels = getStoredReels();
    setReels(localReels);

    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('site_reels')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (fetchError) {
        // Table might not exist yet or permissions issue; fall back to local reels
        console.warn('Supabase site_reels query error (using local storage):', fetchError.message);
        setIsLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const mappedReels: SiteReel[] = data.map((r: any) => ({
          id: r.id,
          category: r.category as 'ongoing' | 'finished',
          title: r.title,
          subtitle: r.subtitle || '',
          stage: r.stage || '',
          location: r.location || '',
          duration: r.duration || '0:45',
          poster: r.poster || '',
          videoSrc: r.video_src || '',
          specs: Array.isArray(r.specs) ? r.specs : [],
          description: r.description || '',
          sortOrder: r.sort_order ?? 0,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }));

        setReels(mappedReels);
        setStoredReels(mappedReels);
        broadcastReelsUpdate(mappedReels);
      } else if (data && data.length === 0) {
        // Table exists but is empty; seed with INITIAL_REELS
        for (const initReel of INITIAL_REELS) {
          await supabase.from('site_reels').insert({
            id: initReel.id,
            category: initReel.category,
            title: initReel.title,
            subtitle: initReel.subtitle,
            stage: initReel.stage,
            location: initReel.location,
            duration: initReel.duration,
            poster: initReel.poster,
            video_src: initReel.videoSrc,
            specs: initReel.specs,
            description: initReel.description,
            sort_order: initReel.sortOrder || 0,
          });
        }
      }
    } catch (err: any) {
      console.warn('Error fetching site_reels:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for cross-tab or cross-component sync
  useEffect(() => {
    fetchReels();

    const unsubscribe = subscribeToReelsUpdates((updatedReels) => {
      setReels(updatedReels);
    });

    return () => {
      unsubscribe();
    };
  }, [fetchReels]);

  // ADD NEW REEL
  const addReel = async (
    reelData: Omit<SiteReel, 'id'>,
    videoFile?: File,
    posterFile?: File
  ): Promise<SiteReel> => {
    const id = newId();
    let finalVideoSrc = reelData.videoSrc;
    let finalPoster = reelData.poster;

    // Handle video file upload
    if (videoFile) {
      const ext = videoFile.name.split('.').pop() || 'mp4';
      const storagePath = `reels/${id}-video-${Date.now()}.${ext}`;
      const cloudUrl = await uploadFileToSupabaseStorage(videoFile, storagePath);
      if (cloudUrl) {
        finalVideoSrc = cloudUrl;
      } else {
        const idbKey = await storeMediaBlob(`${id}-video`, videoFile);
        finalVideoSrc = idbKey || finalVideoSrc;
      }
    }

    // Handle poster file upload
    if (posterFile) {
      const ext = posterFile.name.split('.').pop() || 'jpg';
      const storagePath = `reels/${id}-poster-${Date.now()}.${ext}`;
      const cloudUrl = await uploadFileToSupabaseStorage(posterFile, storagePath);
      if (cloudUrl) {
        finalPoster = cloudUrl;
      } else {
        const idbKey = await storeMediaBlob(`${id}-poster`, posterFile);
        finalPoster = idbKey || finalPoster;
      }
    }

    const newReel: SiteReel = {
      ...reelData,
      id,
      videoSrc: finalVideoSrc,
      poster: finalPoster,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const nextReels = [newReel, ...reels];
    setReels(nextReels);
    setStoredReels(nextReels);
    broadcastReelsUpdate(nextReels);

    // Save to Supabase if configured
    if (isSupabaseConfigured) {
      try {
        await supabase.from('site_reels').insert({
          id: newReel.id,
          category: newReel.category,
          title: newReel.title,
          subtitle: newReel.subtitle,
          stage: newReel.stage,
          location: newReel.location,
          duration: newReel.duration,
          poster: newReel.poster,
          video_src: newReel.videoSrc,
          specs: newReel.specs,
          description: newReel.description,
          sort_order: newReel.sortOrder || 0,
        });
      } catch (err) {
        console.warn('Failed to insert reel to Supabase:', err);
      }
    }

    return newReel;
  };

  // UPDATE REEL
  const updateReel = async (
    updatedReel: SiteReel,
    newVideoFile?: File,
    newPosterFile?: File
  ): Promise<SiteReel> => {
    let finalVideoSrc = updatedReel.videoSrc;
    let finalPoster = updatedReel.poster;

    if (newVideoFile) {
      // If previous was in Supabase storage, clean up old file
      if (isSupabaseStorageUrl(updatedReel.videoSrc)) {
        await deleteFileFromSupabaseStorage(updatedReel.videoSrc);
      } else if (updatedReel.videoSrc.startsWith('idb:')) {
        await deleteMediaBlob(updatedReel.videoSrc);
      }

      const ext = newVideoFile.name.split('.').pop() || 'mp4';
      const storagePath = `reels/${updatedReel.id}-video-${Date.now()}.${ext}`;
      const cloudUrl = await uploadFileToSupabaseStorage(newVideoFile, storagePath);
      if (cloudUrl) {
        finalVideoSrc = cloudUrl;
      } else {
        const idbKey = await storeMediaBlob(`${updatedReel.id}-video`, newVideoFile);
        finalVideoSrc = idbKey || finalVideoSrc;
      }
    }

    if (newPosterFile) {
      // If previous was in Supabase storage, clean up old file
      if (isSupabaseStorageUrl(updatedReel.poster)) {
        await deleteFileFromSupabaseStorage(updatedReel.poster);
      } else if (updatedReel.poster.startsWith('idb:')) {
        await deleteMediaBlob(updatedReel.poster);
      }

      const ext = newPosterFile.name.split('.').pop() || 'jpg';
      const storagePath = `reels/${updatedReel.id}-poster-${Date.now()}.${ext}`;
      const cloudUrl = await uploadFileToSupabaseStorage(newPosterFile, storagePath);
      if (cloudUrl) {
        finalPoster = cloudUrl;
      } else {
        const idbKey = await storeMediaBlob(`${updatedReel.id}-poster`, newPosterFile);
        finalPoster = idbKey || finalPoster;
      }
    }

    const modifiedReel: SiteReel = {
      ...updatedReel,
      videoSrc: finalVideoSrc,
      poster: finalPoster,
      updatedAt: new Date().toISOString(),
    };

    const nextReels = reels.map((r) => (r.id === modifiedReel.id ? modifiedReel : r));
    setReels(nextReels);
    setStoredReels(nextReels);
    broadcastReelsUpdate(nextReels);

    // Save to Supabase if configured
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('site_reels')
          .update({
            category: modifiedReel.category,
            title: modifiedReel.title,
            subtitle: modifiedReel.subtitle,
            stage: modifiedReel.stage,
            location: modifiedReel.location,
            duration: modifiedReel.duration,
            poster: modifiedReel.poster,
            video_src: modifiedReel.videoSrc,
            specs: modifiedReel.specs,
            description: modifiedReel.description,
            sort_order: modifiedReel.sortOrder || 0,
            updated_at: modifiedReel.updatedAt,
          })
          .eq('id', modifiedReel.id);
      } catch (err) {
        console.warn('Failed to update reel in Supabase:', err);
      }
    }

    return modifiedReel;
  };

  // DELETE REEL
  const deleteReel = async (id: string): Promise<void> => {
    const target = reels.find((r) => r.id === id);
    if (target) {
      if (target.videoSrc.startsWith('idb:')) {
        await deleteMediaBlob(target.videoSrc);
      } else if (isSupabaseStorageUrl(target.videoSrc)) {
        await deleteFileFromSupabaseStorage(target.videoSrc);
      }

      if (target.poster.startsWith('idb:')) {
        await deleteMediaBlob(target.poster);
      } else if (isSupabaseStorageUrl(target.poster)) {
        await deleteFileFromSupabaseStorage(target.poster);
      }
    }

    const nextReels = reels.filter((r) => r.id !== id);
    setReels(nextReels);
    setStoredReels(nextReels);
    broadcastReelsUpdate(nextReels);

    // Delete from Supabase if configured
    if (isSupabaseConfigured) {
      try {
        await supabase.from('site_reels').delete().eq('id', id);
      } catch (err) {
        console.warn('Failed to delete reel from Supabase:', err);
      }
    }
  };

  return {
    reels,
    isLoading,
    error,
    addReel,
    updateReel,
    deleteReel,
    refreshReels: fetchReels,
  };
};
