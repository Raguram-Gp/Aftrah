-- ============================================================
-- AFTRAH — Site Cinematics & Video Reels Management
-- Migration: 20261012_site_reels.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------
-- SITE REELS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_reels (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    category TEXT NOT NULL DEFAULT 'ongoing', -- 'ongoing' | 'finished'
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL DEFAULT '',
    stage TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    duration TEXT NOT NULL DEFAULT '0:45',
    poster TEXT NOT NULL DEFAULT '',
    video_src TEXT NOT NULL DEFAULT '',
    specs JSONB NOT NULL DEFAULT '[]'::jsonb,
    description TEXT NOT NULL DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------
ALTER TABLE public.site_reels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select on site_reels" ON public.site_reels;
CREATE POLICY "Allow select on site_reels"
    ON public.site_reels
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow insert on site_reels" ON public.site_reels;
CREATE POLICY "Allow insert on site_reels"
    ON public.site_reels
    FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update on site_reels" ON public.site_reels;
CREATE POLICY "Allow update on site_reels"
    ON public.site_reels
    FOR UPDATE
    USING (true);

DROP POLICY IF EXISTS "Allow delete on site_reels" ON public.site_reels;
CREATE POLICY "Allow delete on site_reels"
    ON public.site_reels
    FOR DELETE
    USING (true);

-- ------------------------------------------------------------
-- INITIAL SEED REELS
-- ------------------------------------------------------------
INSERT INTO public.site_reels (id, category, title, subtitle, stage, location, duration, poster, video_src, specs, description, sort_order)
VALUES
(
    'ongoing-slab-uthamapalayam',
    'ongoing',
    'Teak Courtyard Villa',
    'RCC Slab & Cantilever Deck Casting',
    'Structural Framework · Phase 2',
    'Uthamapalayam, Theni',
    '0:48',
    '/images/videos/ongoing-slab.jpg',
    '/videos/sample-construction-1.webm',
    '[{"label": "Built-up Area", "value": "4,100 sq.ft"}, {"label": "Grade of Concrete", "value": "M25 Design Mix"}, {"label": "Structural Steel", "value": "Fe550D TMT Rebar"}, {"label": "Key Feature", "value": "14ft Cantilever Porch"}]'::jsonb,
    'Direct site footage of reinforced slab shuttering, laser level verification, and high-frequency needle compaction under the Western Ghats backdrop.',
    1
),
(
    'finished-horizon-theni',
    'finished',
    'Horizon Villa',
    'Turnkey Handover & Dusk Light Tour',
    'Completed Residence Handover',
    'Theni City',
    '1:15',
    '/images/videos/finished-villa.jpg',
    '/videos/sample-construction-2.mov',
    '[{"label": "Configuration", "value": "4 BHK Luxury Duplex"}, {"label": "Elevation Finish", "value": "Burma Teak & Textured Slate"}, {"label": "Scope Delivered", "value": "Turnkey: Civil + Interiors"}, {"label": "Site Area", "value": "3,800 sq.ft Plot"}]'::jsonb,
    'Twilight architectural reveal highlighting warm facade up-lighting, natural wood louvers, reflective courtyard terrace, and expansive double-glazed glazing.',
    2
),
(
    'ongoing-facade-chinnamanur',
    'ongoing',
    'Jaali Twin Homes',
    'Teak Wood Pergola & Facade Joinery',
    'Elevation Craft & Masonry · Phase 4',
    'Chinnamanur, Theni',
    '0:36',
    '/images/videos/ongoing-facade.jpg',
    '/videos/sample-construction-1.webm',
    '[{"label": "Wood Spec", "value": "Seasoned 1st Quality Teak"}, {"label": "Screening", "value": "Terracotta Acoustic Jaali"}, {"label": "Coating", "value": "PU Exterior UV Shield"}, {"label": "Ventilation", "value": "Passive Solar Airflow"}]'::jsonb,
    'Master carpenters mounting handcrafted teak batten screens and breathable jaali patterns engineered specifically for Tamil Nadu climate resilience.',
    3
),
(
    'finished-interior-uthamapalayam',
    'finished',
    'Minimalist Teak Sanctum',
    'Double-Height Living & Interior Walkthrough',
    'Completed Luxury Interior',
    'Uthamapalayam',
    '0:52',
    '/images/videos/finished-interior.jpg',
    '/videos/sample-construction-2.mov',
    '[{"label": "Flooring", "value": "Italian Statuario Marble"}, {"label": "Staircase", "value": "Floating Solid Teak Treads"}, {"label": "Wall Acoustic", "value": "Fluted Natural Teak Slatting"}, {"label": "Lighting", "value": "Custom Warm 2700K Architectural"}]'::jsonb,
    'Interior walkthrough illustrating full-height acoustic teak wall paneling, glass balustrades, designer pendant chandeliers, and seamless landscaped court views.',
    4
),
(
    'ongoing-foundation-cumbum',
    'ongoing',
    'Lattice Garden House',
    'Substructure & Anti-Termite Plinth Casting',
    'Foundation Engineering · Phase 1',
    'Cumbum, Theni',
    '0:42',
    '/images/videos/ongoing-foundation.jpg',
    '/videos/sample-construction-1.webm',
    '[{"label": "Foundation Type", "value": "Isolated Column Footings"}, {"label": "Chemical Treatment", "value": "10-Year Anti-Termite Barrier"}, {"label": "Soil Bearing SBC", "value": "220 kN/m² Certified"}, {"label": "Plinth Beam", "value": "Reinforced Grade Beam Matrix"}]'::jsonb,
    'Foundation engineering milestone: transit-mixer concrete delivery, vibratory compaction, and laser-guided plumb checks before superstructure masonry.',
    5
)
ON CONFLICT (id) DO NOTHING;
