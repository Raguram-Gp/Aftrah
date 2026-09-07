-- ============================================================
-- AFTRAH ERP — INTERIOR VENDORS & PROCUREMENT SCHEMA
-- Migration: 20260906_interior_vendors_schema.sql
-- ============================================================

-- Ensure pgcrypto or uuid generator is active
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Re-use or create update_updated_at_column trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------
-- 1. INTERIOR VENDOR CATEGORIES (e.g. Hardware, Glass, Plywood)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.interior_vendor_categories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    s_no INT NOT NULL DEFAULT 1,
    type TEXT NOT NULL,
    phone TEXT,
    contact_person TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_int_vc_s_no ON public.interior_vendor_categories(s_no);

DROP TRIGGER IF EXISTS update_interior_vendor_categories_updated_at ON public.interior_vendor_categories;
CREATE TRIGGER update_interior_vendor_categories_updated_at
BEFORE UPDATE ON public.interior_vendor_categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------
-- 2. INTERIOR VENDORS / SHOPS (Individual supplier profiles)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.interior_vendors (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    category_id TEXT NOT NULL REFERENCES public.interior_vendor_categories(id) ON DELETE CASCADE,
    s_no INT NOT NULL DEFAULT 1,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_int_vendors_cat_id ON public.interior_vendors(category_id);
CREATE INDEX IF NOT EXISTS idx_int_vendors_s_no ON public.interior_vendors(s_no);

DROP TRIGGER IF EXISTS update_interior_vendors_updated_at ON public.interior_vendors;
CREATE TRIGGER update_interior_vendors_updated_at
BEFORE UPDATE ON public.interior_vendors
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------
-- 3. INTERIOR VENDOR LEDGERS (Transactions, purchases, invoices)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.interior_vendor_ledgers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    vendor_id TEXT NOT NULL REFERENCES public.interior_vendors(id) ON DELETE CASCADE,
    s_no INT NOT NULL DEFAULT 1,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    item_type TEXT NOT NULL,
    client_name TEXT,
    client_id TEXT,
    quantity NUMERIC(12, 2) NOT NULL DEFAULT 1,
    rate NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    received_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    balance_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_int_vledgers_vendor_id ON public.interior_vendor_ledgers(vendor_id);
CREATE INDEX IF NOT EXISTS idx_int_vledgers_date ON public.interior_vendor_ledgers(date);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE public.interior_vendor_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interior_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interior_vendor_ledgers ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'interior_vendor_categories',
        'interior_vendors',
        'interior_vendor_ledgers'
    ]) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Allow select on ' || tbl, tbl);
        EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT USING (true)', 'Allow select on ' || tbl, tbl);
        
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Allow insert on ' || tbl, tbl);
        EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT WITH CHECK (true)', 'Allow insert on ' || tbl, tbl);
        
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Allow update on ' || tbl, tbl);
        EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE USING (true)', 'Allow update on ' || tbl, tbl);
        
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Allow delete on ' || tbl, tbl);
        EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE USING (true)', 'Allow delete on ' || tbl, tbl);
    END LOOP;
END $$;
