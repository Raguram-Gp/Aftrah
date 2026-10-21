import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { SiteReel, SiteReelSpec } from '../types';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { showToast } from '../layout/ToastContainer';
import {
  extractPosterAndDurationFromVideo,
  resolveMediaUrl,
  isSupabaseStorageUrl,
  SUPABASE_VIDEO_BUCKET,
} from '@/lib/videoStorage';
import {
  Film,
  Plus,
  Pencil,
  Trash2,
  Play,
  MapPin,
  Clock,
  Layers,
  ExternalLink,
  Search,
  Upload,
  Video as VideoIcon,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  X,
  Sparkles,
  Eye,
  Check,
  AlertCircle,
  Cloud,
  Copy,
} from 'lucide-react';

interface SiteVideosViewProps {
  reels: SiteReel[];
  onAddReel: (
    reelData: Omit<SiteReel, 'id'>,
    videoFile?: File,
    posterFile?: File
  ) => Promise<any>;
  onUpdateReel: (
    updated: SiteReel,
    newVideoFile?: File,
    newPosterFile?: File
  ) => Promise<any>;
  onDeleteReel: (id: string) => Promise<any>;
}

export const SiteVideosView: React.FC<SiteVideosViewProps> = ({
  reels,
  onAddReel,
  onUpdateReel,
  onDeleteReel,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'ongoing' | 'finished'>('all');

  // Preview Modal
  const [previewingReel, setPreviewingReel] = useState<SiteReel | null>(null);
  const [resolvedPreviewVideoUrl, setResolvedPreviewVideoUrl] = useState<string>('');

  // Add Video Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addTitle, setAddTitle] = useState('');
  const [addSubtitle, setAddSubtitle] = useState('');
  const [addCategory, setAddCategory] = useState<'ongoing' | 'finished'>('ongoing');
  const [addStage, setAddStage] = useState('');
  const [addLocation, setAddLocation] = useState('Theni District');
  const [addDuration, setAddDuration] = useState('0:45');
  const [addDescription, setAddDescription] = useState('');
  const [addSpecs, setAddSpecs] = useState<SiteReelSpec[]>([
    { label: 'Built-up Area', value: '3,800 sq.ft' },
    { label: 'Key Feature', value: 'Contemporary Elevation' },
  ]);

  // Video Source Options for Add Modal
  const [addVideoSourceType, setAddVideoSourceType] = useState<'file' | 'url'>('file');
  const [addVideoFile, setAddVideoFile] = useState<File | null>(null);
  const [addVideoUrl, setAddVideoUrl] = useState('');
  const [addPosterOption, setAddPosterOption] = useState<'auto' | 'custom' | 'url'>('auto');
  const [addAutoPosterUrl, setAddAutoPosterUrl] = useState('');
  const [addPosterFile, setAddPosterFile] = useState<File | null>(null);
  const [addPosterUrl, setAddPosterUrl] = useState('');
  const [isExtractingMetadata, setIsExtractingMetadata] = useState(false);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  // Edit Video Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReel, setEditingReel] = useState<SiteReel | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editCategory, setEditCategory] = useState<'ongoing' | 'finished'>('ongoing');
  const [editStage, setEditStage] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSpecs, setEditSpecs] = useState<SiteReelSpec[]>([]);
  const [editVideoFile, setEditVideoFile] = useState<File | null>(null);
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editPosterFile, setEditPosterFile] = useState<File | null>(null);
  const [editPosterUrl, setEditPosterUrl] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Delete Video Modal State
  const [deletingReelTarget, setDeletingReelTarget] = useState<SiteReel | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Cache resolved URLs for cards
  const [resolvedUrls, setResolvedUrls] = useState<Record<string, { video: string; poster: string }>>({});

  // Resolve media URLs for all reels so IDB blobs display
  useEffect(() => {
    let isCancelled = false;
    const resolveAll = async () => {
      const mapping: Record<string, { video: string; poster: string }> = {};
      for (const reel of reels) {
        const video = await resolveMediaUrl(reel.videoSrc);
        const poster = await resolveMediaUrl(reel.poster);
        mapping[reel.id] = { video, poster };
      }
      if (!isCancelled) {
        setResolvedUrls(mapping);
      }
    };
    resolveAll();
    return () => {
      isCancelled = true;
    };
  }, [reels]);

  // Resolve preview video URL when modal opens
  useEffect(() => {
    if (previewingReel) {
      resolveMediaUrl(previewingReel.videoSrc).then((url) => {
        setResolvedPreviewVideoUrl(url);
      });
    } else {
      setResolvedPreviewVideoUrl('');
    }
  }, [previewingReel]);

  // Video File Change Handler (Add Modal)
  const handleAddVideoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAddVideoFile(file);
    setIsExtractingMetadata(true);

    try {
      const { posterUrl, duration, posterBlob } = await extractPosterAndDurationFromVideo(file);
      setAddAutoPosterUrl(posterUrl);
      setAddDuration(duration);

      // Create a File from the auto poster blob for upload
      const posterFileObj = new File([posterBlob], `${file.name}-thumb.jpg`, {
        type: 'image/jpeg',
      });
      setAddPosterFile(posterFileObj);

      showToast('success', `Video loaded: detected duration ${duration}`);
    } catch (err) {
      console.warn('Metadata extraction error:', err);
    } finally {
      setIsExtractingMetadata(false);
    }
  };

  // Video File Change Handler (Edit Modal)
  const handleEditVideoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEditVideoFile(file);
    try {
      const { duration } = await extractPosterAndDurationFromVideo(file);
      setEditDuration(duration);
    } catch (err) {
      console.warn('Metadata extraction error in edit:', err);
    }
  };

  // Add Spec Row
  const handleAddSpecRow = (isEdit: boolean) => {
    if (isEdit) {
      setEditSpecs([...editSpecs, { label: '', value: '' }]);
    } else {
      setAddSpecs([...addSpecs, { label: '', value: '' }]);
    }
  };

  // Update Spec Row
  const handleUpdateSpec = (
    isEdit: boolean,
    index: number,
    field: 'label' | 'value',
    val: string
  ) => {
    if (isEdit) {
      const updated = [...editSpecs];
      updated[index][field] = val;
      setEditSpecs(updated);
    } else {
      const updated = [...addSpecs];
      updated[index][field] = val;
      setAddSpecs(updated);
    }
  };

  // Remove Spec Row
  const handleRemoveSpec = (isEdit: boolean, index: number) => {
    if (isEdit) {
      setEditSpecs(editSpecs.filter((_, i) => i !== index));
    } else {
      setAddSpecs(addSpecs.filter((_, i) => i !== index));
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (reel: SiteReel) => {
    setEditingReel(reel);
    setEditTitle(reel.title);
    setEditSubtitle(reel.subtitle || '');
    setEditCategory(reel.category);
    setEditStage(reel.stage || '');
    setEditLocation(reel.location || '');
    setEditDuration(reel.duration || '0:45');
    setEditDescription(reel.description || '');
    setEditSpecs(reel.specs && reel.specs.length > 0 ? [...reel.specs] : []);
    setEditVideoUrl(reel.videoSrc.startsWith('http') || reel.videoSrc.startsWith('/') ? reel.videoSrc : '');
    setEditPosterUrl(reel.poster.startsWith('http') || reel.poster.startsWith('/') ? reel.poster : '');
    setEditVideoFile(null);
    setEditPosterFile(null);
    setIsEditModalOpen(true);
  };

  // Submit Add Reel
  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addTitle.trim()) {
      showToast('error', 'Please enter a video title.');
      return;
    }

    if (addVideoSourceType === 'file' && !addVideoFile) {
      showToast('error', 'Please select a video file to upload.');
      return;
    }

    if (addVideoSourceType === 'url' && !addVideoUrl.trim()) {
      showToast('error', 'Please provide a video URL.');
      return;
    }

    setIsSubmittingAdd(true);

    try {
      const videoSrc = addVideoSourceType === 'url' ? addVideoUrl.trim() : '';
      let poster = '/images/videos/ongoing-slab.jpg';

      if (addPosterOption === 'url' && addPosterUrl.trim()) {
        poster = addPosterUrl.trim();
      } else if (addPosterOption === 'auto' && addAutoPosterUrl) {
        poster = addAutoPosterUrl;
      }

      const validSpecs = addSpecs.filter((s) => s.label.trim() && s.value.trim());

      await onAddReel(
        {
          title: addTitle.trim(),
          subtitle: addSubtitle.trim(),
          category: addCategory,
          stage: addStage.trim() || (addCategory === 'ongoing' ? 'Active Site Milestone' : 'Completed Residence'),
          location: addLocation.trim() || 'Theni District',
          duration: addDuration.trim() || '0:45',
          poster,
          videoSrc,
          description: addDescription.trim(),
          specs: validSpecs,
          sortOrder: reels.length + 1,
        },
        addVideoSourceType === 'file' ? addVideoFile || undefined : undefined,
        addPosterOption === 'custom' ? addPosterFile || undefined : undefined
      );

      showToast('success', `Video "${addTitle}" uploaded & live on landing page!`);

      // Reset and close
      setIsAddModalOpen(false);
      setAddTitle('');
      setAddSubtitle('');
      setAddDescription('');
      setAddVideoFile(null);
      setAddAutoPosterUrl('');
      setAddVideoUrl('');
      setAddPosterFile(null);
    } catch (err: any) {
      console.error('Error adding video:', err);
      showToast('error', err?.message || 'Failed to upload video.');
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // Submit Edit Reel
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReel) return;

    if (!editTitle.trim()) {
      showToast('error', 'Please enter a title.');
      return;
    }

    setIsSubmittingEdit(true);

    try {
      let finalVideoSrc = editingReel.videoSrc;
      if (editVideoUrl.trim()) {
        finalVideoSrc = editVideoUrl.trim();
      }

      let finalPoster = editingReel.poster;
      if (editPosterUrl.trim()) {
        finalPoster = editPosterUrl.trim();
      }

      const validSpecs = editSpecs.filter((s) => s.label.trim() && s.value.trim());

      const updatedReel: SiteReel = {
        ...editingReel,
        title: editTitle.trim(),
        subtitle: editSubtitle.trim(),
        category: editCategory,
        stage: editStage.trim(),
        location: editLocation.trim(),
        duration: editDuration.trim(),
        description: editDescription.trim(),
        specs: validSpecs,
        videoSrc: finalVideoSrc,
        poster: finalPoster,
      };

      await onUpdateReel(
        updatedReel,
        editVideoFile || undefined,
        editPosterFile || undefined
      );

      showToast('success', `Video "${updatedReel.title}" updated successfully!`);
      setIsEditModalOpen(false);
      setEditingReel(null);
    } catch (err: any) {
      console.error('Error updating video:', err);
      showToast('error', err?.message || 'Failed to update video.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Confirm Delete Reel
  const handleConfirmDelete = async () => {
    if (!deletingReelTarget) return;

    setIsDeleting(true);
    try {
      await onDeleteReel(deletingReelTarget.id);
      showToast('success', `Video "${deletingReelTarget.title}" removed from landing page.`);
      setDeletingReelTarget(null);
    } catch (err: any) {
      console.error('Error deleting video:', err);
      showToast('error', err?.message || 'Failed to delete video.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Reels
  const filteredReels = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return reels.filter((reel) => {
      const matchFilter =
        activeFilter === 'all' || reel.category === activeFilter;
      const matchSearch =
        !q ||
        reel.title.toLowerCase().includes(q) ||
        reel.subtitle?.toLowerCase().includes(q) ||
        reel.location?.toLowerCase().includes(q) ||
        reel.description?.toLowerCase().includes(q) ||
        reel.stage?.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [reels, searchQuery, activeFilter]);

  // Metrics
  const ongoingCount = useMemo(
    () => reels.filter((r) => r.category === 'ongoing').length,
    [reels]
  );
  const finishedCount = useMemo(
    () => reels.filter((r) => r.category === 'finished').length,
    [reels]
  );

  return (
    <div className="afrah-app-content-body" style={{ padding: '24px 28px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* 1. Header Section */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        <div>
          <div className="flex-center" style={{ gap: '10px', marginBottom: '6px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(217, 180, 130, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                boxShadow: '0 4px 12px rgba(217, 180, 130, 0.1)',
              }}
            >
              <Film size={20} />
            </div>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '22px',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                Site Cinematics & Video Reels
              </h1>
            </div>
          </div>
          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: '13.5px',
              color: 'var(--text-secondary)',
              maxWidth: '680px',
              lineHeight: 1.5,
            }}
          >
            Upload construction walkthroughs and completed residence reels directly to the main landing page showcase (<code style={{ color: 'var(--primary)' }}>/#cinematics</code>). Changes reflect immediately.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex-center" style={{ gap: '12px' }}>
          <a
            href="/#cinematics"
            target="_blank"
            rel="noopener noreferrer"
            className="afrah-app-back-btn"
            style={{
              height: '40px',
              padding: '0 16px',
              fontSize: '13px',
              fontWeight: 600,
              gap: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              textDecoration: 'none',
              borderRadius: '8px',
            }}
            title="Open landing page video section in new tab"
          >
            <span>Preview Landing Page</span>
            <ExternalLink size={14} />
          </a>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-add-global"
            style={{
              height: '40px',
              padding: '0 18px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #d9b482 0%, #b88d57 100%)',
              color: '#1a1610',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(217, 180, 130, 0.25)',
              transition: 'all 0.15s ease',
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Upload New Video</span>
          </button>
        </div>
      </div>

      {/* 2. Metric / Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '26px',
        }}
      >
        <div
          style={{
            background: 'var(--surface-container, #1e2126)',
            border: '1px solid var(--border-stroke, #2c303a)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'rgba(217, 180, 130, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}
          >
            <VideoIcon size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Active Videos
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              {reels.length}
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--surface-container, #1e2126)',
            border: '1px solid var(--border-stroke, #2c303a)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f59e0b',
            }}
          >
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Ongoing Site Reels
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              {ongoingCount}
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--surface-container, #1e2126)',
            border: '1px solid var(--border-stroke, #2c303a)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'rgba(34, 197, 94, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#22c55e',
            }}
          >
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Finished Home Tours
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              {finishedCount}
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--surface-container, #1e2126)',
            border: '1px solid var(--border-stroke, #2c303a)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'rgba(56, 189, 248, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Live Showcase Sync
            </div>
            <div className="flex-center" style={{ gap: '8px', marginTop: '4px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#22c55e',
                  boxShadow: '0 0 10px #22c55e',
                }}
              />
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#22c55e' }}>
                Synced & Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Controls Bar: Search & Category Filter Pills */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          marginBottom: '22px',
          padding: '12px 16px',
          background: 'var(--surface-container, #1e2126)',
          borderRadius: '10px',
          border: '1px solid var(--border-stroke, #2c303a)',
        }}
      >
        {/* Category Filter Pills */}
        <div className="flex-center" style={{ gap: '8px' }}>
          <button
            onClick={() => setActiveFilter('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12.5px',
              fontWeight: 600,
              border: activeFilter === 'all' ? '1px solid var(--primary)' : '1px solid transparent',
              background: activeFilter === 'all' ? 'rgba(217, 180, 130, 0.18)' : 'rgba(255, 255, 255, 0.04)',
              color: activeFilter === 'all' ? 'var(--primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            All Reels ({reels.length})
          </button>
          <button
            onClick={() => setActiveFilter('ongoing')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12.5px',
              fontWeight: 600,
              border: activeFilter === 'ongoing' ? '1px solid #f59e0b' : '1px solid transparent',
              background: activeFilter === 'ongoing' ? 'rgba(245, 158, 11, 0.18)' : 'rgba(255, 255, 255, 0.04)',
              color: activeFilter === 'ongoing' ? '#f59e0b' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Ongoing Sites ({ongoingCount})
          </button>
          <button
            onClick={() => setActiveFilter('finished')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12.5px',
              fontWeight: 600,
              border: activeFilter === 'finished' ? '1px solid #22c55e' : '1px solid transparent',
              background: activeFilter === 'finished' ? 'rgba(34, 197, 94, 0.18)' : 'rgba(255, 255, 255, 0.04)',
              color: activeFilter === 'finished' ? '#22c55e' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Finished Homes ({finishedCount})
          </button>
        </div>

        {/* Search Input */}
        <div
          style={{
            position: 'relative',
            minWidth: '260px',
            flex: '1',
            maxWidth: '380px',
          }}
        >
          <Search
            size={15}
            color="var(--text-secondary)"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, location, description..."
            style={{
              width: '100%',
              height: '36px',
              padding: '0 12px 0 34px',
              borderRadius: '8px',
              background: 'var(--surface-container-high, #25282c)',
              border: '1px solid var(--border-stroke, #333842)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 4. Video Reels Cards Grid */}
      {filteredReels.length === 0 ? (
        <div
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            background: 'var(--surface-container, #1e2126)',
            borderRadius: '14px',
            border: '1px dashed var(--border-stroke, #333842)',
          }}
        >
          <Film size={44} color="var(--text-secondary)" style={{ opacity: 0.4, marginBottom: '14px' }} />
          <h3 style={{ margin: '0 0 8px 0', fontSize: '17px', color: 'var(--text-primary)' }}>
            No video reels match your search
          </h3>
          <p style={{ margin: '0 0 18px 0', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            Try adjusting your search criteria or upload a new video reel.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-add-global"
            style={{
              padding: '8px 18px',
              fontSize: '13px',
              borderRadius: '8px',
              background: 'var(--primary)',
              color: '#1a1610',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            + Upload New Video
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '22px',
          }}
        >
          {filteredReels.map((reel) => {
            const urls = resolvedUrls[reel.id] || { video: reel.videoSrc, poster: reel.poster };
            return (
              <div
                key={reel.id}
                style={{
                  background: 'var(--surface-container, #1e2126)',
                  border: '1px solid var(--border-stroke, #2c303a)',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                }}
              >
                {/* Video / Poster Box */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    paddingTop: '56.25%', // 16:9 aspect ratio
                    background: '#0d0f12',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={urls.poster || '/images/videos/ongoing-slab.jpg'}
                    alt={reel.title}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/videos/ongoing-slab.jpg';
                    }}
                  />

                  {/* Gradient Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)',
                    }}
                  />

                  {/* Top Badges */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      right: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      zIndex: 2,
                    }}
                  >
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        background:
                          reel.category === 'ongoing'
                            ? 'rgba(245, 158, 11, 0.9)'
                            : 'rgba(34, 197, 94, 0.9)',
                        color: '#000000',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                      }}
                    >
                      {reel.category === 'ongoing' ? 'Ongoing Site' : 'Finished Home'}
                    </span>

                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        background: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(6px)',
                        color: '#ffffff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontFamily: 'monospace',
                        border: '1px solid rgba(255,255,255,0.15)',
                      }}
                    >
                      <Clock size={12} />
                      {reel.duration}
                    </span>
                  </div>

                  {/* Center Play Button Overlay */}
                  <button
                    onClick={() => setPreviewingReel(reel)}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      background: 'rgba(217, 180, 130, 0.92)',
                      border: 'none',
                      color: '#1a1610',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                      transition: 'transform 0.15s ease, background 0.15s ease',
                      zIndex: 3,
                    }}
                    title="Click to preview video"
                  >
                    <Play size={22} fill="#1a1610" style={{ marginLeft: '3px' }} />
                  </button>

                  {/* Bottom Stage Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '12px',
                      right: '12px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: 'rgba(255, 255, 255, 0.85)',
                      fontFamily: 'monospace',
                      textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                    }}
                  >
                    {reel.stage}
                  </div>
                </div>

                {/* Card Content */}
                <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '16.5px',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                      }}
                    >
                      {reel.title}
                    </h3>

                    {isSupabaseStorageUrl(reel.videoSrc) ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '10.5px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '10px',
                          background: 'rgba(56, 189, 248, 0.12)',
                          color: '#38bdf8',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}
                        title={`Stored in Supabase Storage (${SUPABASE_VIDEO_BUCKET})`}
                      >
                        <Cloud size={11} />
                        <span>Supabase CDN</span>
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '10px',
                          fontWeight: 600,
                          padding: '2px 7px',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-stroke, #333842)',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}
                      >
                        <span>Demo Asset</span>
                      </span>
                    )}
                  </div>

                  {reel.subtitle && (
                    <div style={{ fontSize: '12.5px', color: 'var(--primary)', fontWeight: 600, marginBottom: '8px' }}>
                      {reel.subtitle}
                    </div>
                  )}

                  {reel.location && (
                    <div className="flex-center" style={{ gap: '5px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                      <MapPin size={13} color="var(--primary)" />
                      <span>{reel.location}</span>
                    </div>
                  )}

                  {reel.description && (
                    <p
                      style={{
                        margin: '0 0 14px 0',
                        fontSize: '12.5px',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {reel.description}
                    </p>
                  )}

                  {/* Specs Chips */}
                  {reel.specs && reel.specs.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px',
                        marginTop: 'auto',
                        paddingTop: '10px',
                        borderTop: '1px solid var(--border-stroke, #2c303a)',
                      }}
                    >
                      {reel.specs.slice(0, 3).map((spec, sIdx) => (
                        <div
                          key={sIdx}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: 'var(--surface-container-high, #25282c)',
                            fontSize: '11px',
                            color: 'var(--text-secondary)',
                            fontFamily: 'monospace',
                            border: '1px solid var(--border-stroke, #333842)',
                          }}
                        >
                          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{spec.label}:</span>{' '}
                          <span>{spec.value}</span>
                        </div>
                      ))}
                      {reel.specs.length > 3 && (
                        <span style={{ fontSize: '11px', color: 'var(--primary)', alignSelf: 'center' }}>
                          +{reel.specs.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div
                  style={{
                    padding: '12px 18px',
                    borderTop: '1px solid var(--border-stroke, #2c303a)',
                    background: 'var(--surface-container-high, #23262c)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <button
                    onClick={() => setPreviewingReel(reel)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-primary)',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    <Eye size={14} color="var(--primary)" />
                    <span>Watch Preview</span>
                  </button>

                  <div className="flex-center" style={{ gap: '8px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const publicUrl = urls.video || reel.videoSrc;
                        navigator.clipboard.writeText(publicUrl);
                        showToast('success', 'Video URL copied to clipboard');
                      }}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-stroke, #333842)',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      title="Copy Public Video URL"
                    >
                      <Copy size={13} />
                    </button>

                    <button
                      onClick={() => handleOpenEdit(reel)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'rgba(217, 180, 130, 0.12)',
                        border: '1px solid rgba(217, 180, 130, 0.25)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      title="Edit Title, Description & Specs"
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      onClick={() => setDeletingReelTarget(reel)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        color: '#f87171',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      title="Remove Video from App & Landing Page"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. ADD / UPLOAD VIDEO MODAL */}
      {isAddModalOpen && (
        <div className="afrah-app-modal-overlay" onClick={() => !isSubmittingAdd && setIsAddModalOpen(false)}>
          <div
            className="afrah-app-modal-container"
            style={{
              maxWidth: '680px',
              padding: 0,
              overflow: 'hidden',
              borderRadius: '16px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 24px',
                borderBottom: '1px solid var(--border-stroke, #2c303a)',
                background: 'var(--surface-container, #1e2126)',
              }}
            >
              <div className="flex-center" style={{ gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(217, 180, 130, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                  }}
                >
                  <Upload size={16} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Upload New Landing Page Video
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    This video will appear in the Site Cinematics carousel on the main website.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                disabled={isSubmittingAdd}
                className="afrah-app-modal-close-btn"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmitAdd} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* 1. Video Source Picker */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    1. Video Source *
                  </label>

                  <div className="flex-center" style={{ gap: '12px', marginBottom: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setAddVideoSourceType('file')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        border: addVideoSourceType === 'file' ? '1.5px solid var(--primary)' : '1px solid var(--border-stroke, #333842)',
                        background: addVideoSourceType === 'file' ? 'rgba(217, 180, 130, 0.12)' : 'var(--surface-container-high, #25282c)',
                        color: addVideoSourceType === 'file' ? 'var(--primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      <Upload size={15} />
                      <span>Upload Video File (.mp4, .webm, .mov)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAddVideoSourceType('url')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        border: addVideoSourceType === 'url' ? '1.5px solid var(--primary)' : '1px solid var(--border-stroke, #333842)',
                        background: addVideoSourceType === 'url' ? 'rgba(217, 180, 130, 0.12)' : 'var(--surface-container-high, #25282c)',
                        color: addVideoSourceType === 'url' ? 'var(--primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      <VideoIcon size={15} />
                      <span>Direct Video URL / Cloud Asset</span>
                    </button>
                  </div>

                  {addVideoSourceType === 'file' ? (
                    <div>
                      <label
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '24px 16px',
                          borderRadius: '10px',
                          border: '2px dashed var(--border-stroke, #3a3f4a)',
                          background: 'var(--surface-container-high, #23262c)',
                          cursor: 'pointer',
                          transition: 'border-color 0.15s ease',
                        }}
                      >
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime,video/m4v"
                          onChange={handleAddVideoFileSelect}
                          style={{ display: 'none' }}
                        />
                        {isExtractingMetadata ? (
                          <div className="flex-center" style={{ gap: '10px', color: 'var(--primary)' }}>
                            <Loader2 size={24} className="animate-spin" />
                            <span style={{ fontSize: '13px', fontWeight: 600 }}>Analyzing video & extracting poster frame...</span>
                          </div>
                        ) : addVideoFile ? (
                          <div style={{ textAlign: 'center' }}>
                            <div className="flex-center" style={{ justifyContent: 'center', gap: '8px', color: '#4ade80', marginBottom: '6px' }}>
                              <CheckCircle2 size={20} />
                              <span style={{ fontSize: '14px', fontWeight: 700 }}>{addVideoFile.name}</span>
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                              {(addVideoFile.size / (1024 * 1024)).toFixed(1)} MB · Duration: {addDuration}
                            </div>
                            <span style={{ display: 'inline-block', marginTop: '8px', fontSize: '11.5px', color: 'var(--primary)', textDecoration: 'underline' }}>
                              Click to choose a different file
                            </span>
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center' }}>
                            <Upload size={32} color="var(--primary)" style={{ marginBottom: '8px' }} />
                            <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                              Click to choose a video file or drag and drop
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                              Supports MP4, WebM, MOV. Auto-generates thumbnail frame and duration.
                            </div>
                          </div>
                        )}
                      </label>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        value={addVideoUrl}
                        onChange={(e) => setAddVideoUrl(e.target.value)}
                        placeholder="https://... or /videos/sample-construction-1.webm"
                        style={{
                          width: '100%',
                          height: '40px',
                          padding: '0 12px',
                          borderRadius: '8px',
                          background: 'var(--surface-container-high, #25282c)',
                          border: '1px solid var(--border-stroke, #333842)',
                          color: 'var(--text-primary)',
                          fontSize: '13px',
                          outline: 'none',
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* 2. Poster / Thumbnail Option */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    2. Thumbnail Poster
                  </label>
                  <div className="flex-center" style={{ gap: '10px', marginBottom: '10px' }}>
                    {addAutoPosterUrl && (
                      <button
                        type="button"
                        onClick={() => setAddPosterOption('auto')}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          border: addPosterOption === 'auto' ? '1px solid var(--primary)' : '1px solid var(--border-stroke)',
                          background: addPosterOption === 'auto' ? 'rgba(217, 180, 130, 0.15)' : 'none',
                          color: addPosterOption === 'auto' ? 'var(--primary)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                        }}
                      >
                        Auto-Extracted Frame
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setAddPosterOption('custom')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        border: addPosterOption === 'custom' ? '1px solid var(--primary)' : '1px solid var(--border-stroke)',
                        background: addPosterOption === 'custom' ? 'rgba(217, 180, 130, 0.15)' : 'none',
                        color: addPosterOption === 'custom' ? 'var(--primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      Upload Image File
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddPosterOption('url')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        border: addPosterOption === 'url' ? '1px solid var(--primary)' : '1px solid var(--border-stroke)',
                        background: addPosterOption === 'url' ? 'rgba(217, 180, 130, 0.15)' : 'none',
                        color: addPosterOption === 'url' ? 'var(--primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      Custom Image URL
                    </button>
                  </div>

                  {addPosterOption === 'custom' ? (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setAddPosterFile(e.target.files?.[0] || null)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        fontSize: '12.5px',
                        color: 'var(--text-primary)',
                      }}
                    />
                  ) : addPosterOption === 'url' ? (
                    <input
                      type="text"
                      value={addPosterUrl}
                      onChange={(e) => setAddPosterUrl(e.target.value)}
                      placeholder="/images/videos/ongoing-slab.jpg or https://..."
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        background: 'var(--surface-container-high, #25282c)',
                        border: '1px solid var(--border-stroke, #333842)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                      }}
                    />
                  ) : addAutoPosterUrl ? (
                    <div className="flex-center" style={{ gap: '12px' }}>
                      <img
                        src={addAutoPosterUrl}
                        alt="Auto poster frame"
                        style={{ width: '120px', height: '68px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-stroke)' }}
                      />
                      <span style={{ fontSize: '12px', color: '#4ade80' }}>
                        ✓ Frame captured from video
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* 3. Title & Subtitle */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={addTitle}
                      onChange={(e) => setAddTitle(e.target.value)}
                      placeholder="e.g. Teak Courtyard Villa"
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        background: 'var(--surface-container-high, #25282c)',
                        border: '1px solid var(--border-stroke, #333842)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Subtitle / Focus Area
                    </label>
                    <input
                      type="text"
                      value={addSubtitle}
                      onChange={(e) => setAddSubtitle(e.target.value)}
                      placeholder="e.g. RCC Slab & Cantilever Deck"
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        background: 'var(--surface-container-high, #25282c)',
                        border: '1px solid var(--border-stroke, #333842)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                </div>

                {/* 4. Category & Location & Stage */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Category *
                    </label>
                    <select
                      value={addCategory}
                      onChange={(e) => setAddCategory(e.target.value as 'ongoing' | 'finished')}
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 10px',
                        borderRadius: '8px',
                        background: 'var(--surface-container-high, #25282c)',
                        border: '1px solid var(--border-stroke, #333842)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                      }}
                    >
                      <option value="ongoing">Ongoing Site</option>
                      <option value="finished">Finished Home</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Location
                    </label>
                    <input
                      type="text"
                      value={addLocation}
                      onChange={(e) => setAddLocation(e.target.value)}
                      placeholder="e.g. Uthamapalayam, Theni"
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        background: 'var(--surface-container-high, #25282c)',
                        border: '1px solid var(--border-stroke, #333842)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Milestone / Stage
                    </label>
                    <input
                      type="text"
                      value={addStage}
                      onChange={(e) => setAddStage(e.target.value)}
                      placeholder="e.g. Structural Framework"
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        background: 'var(--surface-container-high, #25282c)',
                        border: '1px solid var(--border-stroke, #333842)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                </div>

                {/* 5. Content / Description */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Narrative Content / Description
                  </label>
                  <textarea
                    rows={3}
                    value={addDescription}
                    onChange={(e) => setAddDescription(e.target.value)}
                    placeholder="Describe what is happening in the reel or key engineering highlights shown in the footage..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'var(--surface-container-high, #25282c)',
                      border: '1px solid var(--border-stroke, #333842)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* 6. Specifications Table */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Engineering Specifications
                    </label>
                    <button
                      type="button"
                      onClick={() => handleAddSpecRow(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Plus size={13} />
                      <span>Add Spec Item</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {addSpecs.map((spec, sIdx) => (
                      <div key={sIdx} className="flex-center" style={{ gap: '10px' }}>
                        <input
                          type="text"
                          value={spec.label}
                          onChange={(e) => handleUpdateSpec(false, sIdx, 'label', e.target.value)}
                          placeholder="Label (e.g. Built-up Area)"
                          style={{
                            flex: 1,
                            height: '34px',
                            padding: '0 10px',
                            borderRadius: '6px',
                            background: 'var(--surface-container-high, #25282c)',
                            border: '1px solid var(--border-stroke, #333842)',
                            color: 'var(--text-primary)',
                            fontSize: '12.5px',
                          }}
                        />
                        <input
                          type="text"
                          value={spec.value}
                          onChange={(e) => handleUpdateSpec(false, sIdx, 'value', e.target.value)}
                          placeholder="Value (e.g. 4,100 sq.ft)"
                          style={{
                            flex: 1,
                            height: '34px',
                            padding: '0 10px',
                            borderRadius: '6px',
                            background: 'var(--surface-container-high, #25282c)',
                            border: '1px solid var(--border-stroke, #333842)',
                            color: 'var(--text-primary)',
                            fontSize: '12.5px',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSpec(false, sIdx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#f87171',
                            cursor: 'pointer',
                            padding: '4px',
                          }}
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  padding: '16px 24px',
                  borderTop: '1px solid var(--border-stroke, #2c303a)',
                  background: 'var(--surface-container, #1e2126)',
                }}
              >
                <button
                  type="button"
                  disabled={isSubmittingAdd}
                  onClick={() => setIsAddModalOpen(false)}
                  className="afrah-app-back-btn"
                  style={{ height: '38px', padding: '0 16px', fontSize: '13px' }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  style={{
                    height: '38px',
                    padding: '0 20px',
                    borderRadius: '8px',
                    background: 'var(--primary)',
                    color: '#1a1610',
                    fontSize: '13px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: isSubmittingAdd ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: isSubmittingAdd ? 0.7 : 1,
                  }}
                >
                  {isSubmittingAdd ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Saving Video...</span>
                    </>
                  ) : (
                    <>
                      <Check size={15} />
                      <span>Upload & Publish to Landing Page</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. EDIT VIDEO MODAL */}
      {isEditModalOpen && editingReel && (
        <div className="afrah-app-modal-overlay" onClick={() => !isSubmittingEdit && setIsEditModalOpen(false)}>
          <div
            className="afrah-app-modal-container"
            style={{
              maxWidth: '680px',
              padding: 0,
              overflow: 'hidden',
              borderRadius: '16px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 24px',
                borderBottom: '1px solid var(--border-stroke, #2c303a)',
                background: 'var(--surface-container, #1e2126)',
              }}
            >
              <div className="flex-center" style={{ gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(217, 180, 130, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                  }}
                >
                  <Pencil size={16} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Edit Video Reel
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Update title, specifications, footage, or narrative content.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSubmittingEdit}
                className="afrah-app-modal-close-btn"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmitEdit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Title & Subtitle */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        background: 'var(--surface-container-high, #25282c)',
                        border: '1px solid var(--border-stroke, #333842)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Subtitle / Focus Area
                    </label>
                    <input
                      type="text"
                      value={editSubtitle}
                      onChange={(e) => setEditSubtitle(e.target.value)}
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        background: 'var(--surface-container-high, #25282c)',
                        border: '1px solid var(--border-stroke, #333842)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                </div>

                {/* Category, Location, Milestone */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Category *
                    </label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as 'ongoing' | 'finished')}
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 10px',
                        borderRadius: '8px',
                        background: 'var(--surface-container-high, #25282c)',
                        border: '1px solid var(--border-stroke, #333842)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                      }}
                    >
                      <option value="ongoing">Ongoing Site</option>
                      <option value="finished">Finished Home</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Location
                    </label>
                    <input
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        background: 'var(--surface-container-high, #25282c)',
                        border: '1px solid var(--border-stroke, #333842)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Milestone / Stage
                    </label>
                    <input
                      type="text"
                      value={editStage}
                      onChange={(e) => setEditStage(e.target.value)}
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        background: 'var(--surface-container-high, #25282c)',
                        border: '1px solid var(--border-stroke, #333842)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                </div>

                {/* Narrative Content / Description */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Narrative Content / Description
                  </label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'var(--surface-container-high, #25282c)',
                      border: '1px solid var(--border-stroke, #333842)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Replace Video / Poster Optional Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      Replace Video File (Optional)
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleEditVideoFileSelect}
                      style={{ fontSize: '12px', color: 'var(--text-secondary)' }}
                    />
                    {editVideoFile && (
                      <div style={{ fontSize: '11px', color: '#4ade80', marginTop: '2px' }}>
                        Selected: {editVideoFile.name}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      Replace Poster Image (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditPosterFile(e.target.files?.[0] || null)}
                      style={{ fontSize: '12px', color: 'var(--text-secondary)' }}
                    />
                    {editPosterFile && (
                      <div style={{ fontSize: '11px', color: '#4ade80', marginTop: '2px' }}>
                        Selected: {editPosterFile.name}
                      </div>
                    )}
                  </div>
                </div>

                {/* Engineering Specifications */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Engineering Specifications
                    </label>
                    <button
                      type="button"
                      onClick={() => handleAddSpecRow(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Plus size={13} />
                      <span>Add Spec Item</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {editSpecs.map((spec, sIdx) => (
                      <div key={sIdx} className="flex-center" style={{ gap: '10px' }}>
                        <input
                          type="text"
                          value={spec.label}
                          onChange={(e) => handleUpdateSpec(true, sIdx, 'label', e.target.value)}
                          placeholder="Label (e.g. Built-up Area)"
                          style={{
                            flex: 1,
                            height: '34px',
                            padding: '0 10px',
                            borderRadius: '6px',
                            background: 'var(--surface-container-high, #25282c)',
                            border: '1px solid var(--border-stroke, #333842)',
                            color: 'var(--text-primary)',
                            fontSize: '12.5px',
                          }}
                        />
                        <input
                          type="text"
                          value={spec.value}
                          onChange={(e) => handleUpdateSpec(true, sIdx, 'value', e.target.value)}
                          placeholder="Value (e.g. 4,100 sq.ft)"
                          style={{
                            flex: 1,
                            height: '34px',
                            padding: '0 10px',
                            borderRadius: '6px',
                            background: 'var(--surface-container-high, #25282c)',
                            border: '1px solid var(--border-stroke, #333842)',
                            color: 'var(--text-primary)',
                            fontSize: '12.5px',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSpec(true, sIdx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#f87171',
                            cursor: 'pointer',
                            padding: '4px',
                          }}
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  padding: '16px 24px',
                  borderTop: '1px solid var(--border-stroke, #2c303a)',
                  background: 'var(--surface-container, #1e2126)',
                }}
              >
                <button
                  type="button"
                  disabled={isSubmittingEdit}
                  onClick={() => setIsEditModalOpen(false)}
                  className="afrah-app-back-btn"
                  style={{ height: '38px', padding: '0 16px', fontSize: '13px' }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  style={{
                    height: '38px',
                    padding: '0 20px',
                    borderRadius: '8px',
                    background: 'var(--primary)',
                    color: '#1a1610',
                    fontSize: '13px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: isSubmittingEdit ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {isSubmittingEdit ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Check size={15} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. PREVIEW VIDEO PLAYER MODAL */}
      {previewingReel && (
        <div className="afrah-app-modal-overlay" onClick={() => setPreviewingReel(null)}>
          <div
            className="afrah-app-modal-container"
            style={{
              maxWidth: '820px',
              padding: 0,
              overflow: 'hidden',
              borderRadius: '16px',
              background: '#0e1014',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                background: '#15181d',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: previewingReel.category === 'ongoing' ? '#f59e0b' : '#22c55e',
                    fontFamily: 'monospace',
                  }}
                >
                  {previewingReel.category === 'ongoing' ? 'Ongoing Site Footage' : 'Finished Residence Tour'}
                </span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '17px', color: '#ffffff', fontWeight: 700 }}>
                  {previewingReel.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewingReel(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  padding: '6px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Video Player */}
            <div style={{ position: 'relative', width: '100%', background: '#000000', maxHeight: '460px', overflow: 'hidden' }}>
              {resolvedPreviewVideoUrl ? (
                <video
                  src={resolvedPreviewVideoUrl}
                  controls
                  autoPlay
                  playsInline
                  style={{ width: '100%', maxHeight: '460px', display: 'block' }}
                >
                  Your browser does not support HTML5 video.
                </video>
              ) : (
                <div style={{ padding: '60px', textAlign: 'center', color: '#ffffff' }}>
                  <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px' }} />
                  <div>Loading video stream...</div>
                </div>
              )}
            </div>

            {/* Narrative & Specs Footer */}
            <div style={{ padding: '20px 24px', background: '#15181d' }}>
              {previewingReel.subtitle && (
                <div style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600, marginBottom: '6px' }}>
                  {previewingReel.subtitle} · {previewingReel.location}
                </div>
              )}
              {previewingReel.description && (
                <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                  {previewingReel.description}
                </p>
              )}
              {previewingReel.specs && previewingReel.specs.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {previewingReel.specs.map((s, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        fontSize: '11.5px',
                        color: 'rgba(255,255,255,0.85)',
                        fontFamily: 'monospace',
                      }}
                    >
                      <strong style={{ color: 'var(--primary)' }}>{s.label}:</strong> {s.value}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 8. DELETE CONFIRMATION MODAL */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingReelTarget)}
        title="Remove Video from Landing Page?"
        message="This action will permanently remove this video reel from the website's Site Cinematics showcase and this management dashboard."
        itemName={deletingReelTarget?.title}
        confirmText="Remove Video"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingReelTarget(null)}
      />
    </div>
  );
};
