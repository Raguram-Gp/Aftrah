-- ============================================================
-- AFTRAH — WhatsApp statement share links (Wave 1)
-- Migration: 20260919_statement_shares.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------
-- STATEMENT SHARES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.statement_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kind TEXT NOT NULL,
    entity_id UUID,
    title TEXT NOT NULL DEFAULT '',
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE public.statement_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select on statement_shares" ON public.statement_shares;
CREATE POLICY "Allow select on statement_shares"
    ON public.statement_shares
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow insert on statement_shares" ON public.statement_shares;
CREATE POLICY "Allow insert on statement_shares"
    ON public.statement_shares
    FOR INSERT
    WITH CHECK (true);
