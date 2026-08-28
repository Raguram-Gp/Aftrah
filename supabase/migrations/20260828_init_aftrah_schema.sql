-- ============================================================
-- AFTRAH CONSTRUCTIONS — ENTERPRISE ERP DATABASE SCHEMA
-- PostgreSQL Schema with Row-Level Security (RLS) & Triggers
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- 1. Helper Function: Auto-update `updated_at` timestamps
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------
-- 2. CLIENTS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------
-- 3. CLIENT ADVANCE PAYMENTS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.client_advance_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    s_no INT NOT NULL DEFAULT 1,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    mode TEXT NOT NULL DEFAULT 'HDFC Bank',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_advances_client_id ON public.client_advance_payments(client_id);
CREATE INDEX IF NOT EXISTS idx_advances_date ON public.client_advance_payments(date);

-- ------------------------------------------------------------
-- 4. CLIENT SITE EXPENSES TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.client_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    s_no INT NOT NULL DEFAULT 1,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    expense_name TEXT NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL DEFAULT 1,
    rate NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_client_id ON public.client_expenses(client_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.client_expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_name ON public.client_expenses(expense_name);

-- ------------------------------------------------------------
-- 5. VENDOR CATEGORIES TABLE (Tier 1: Bricks, Steel, Cement...)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vendor_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    s_no INT NOT NULL DEFAULT 1,
    type TEXT NOT NULL UNIQUE,
    phone TEXT,
    contact_person TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_vendor_categories_updated_at ON public.vendor_categories;
CREATE TRIGGER update_vendor_categories_updated_at
BEFORE UPDATE ON public.vendor_categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------
-- 6. VENDORS / SHOPS TABLE (Tier 2: Ramesh Bricks, Vinayaga...)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.vendor_categories(id) ON DELETE CASCADE,
    s_no INT NOT NULL DEFAULT 1,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendors_category_id ON public.vendors(category_id);
CREATE INDEX IF NOT EXISTS idx_vendors_name ON public.vendors(name);

DROP TRIGGER IF EXISTS update_vendors_updated_at ON public.vendors;
CREATE TRIGGER update_vendors_updated_at
BEFORE UPDATE ON public.vendors
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------
-- 7. VENDOR LEDGERS / SHOP TRANSACTIONS (Tier 3: Line Items)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vendor_ledgers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    s_no INT NOT NULL DEFAULT 1,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    item_type TEXT NOT NULL,
    client_name TEXT,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    quantity NUMERIC(12, 2) NOT NULL DEFAULT 1,
    rate NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    received_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    balance_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ledgers_vendor_id ON public.vendor_ledgers(vendor_id);
CREATE INDEX IF NOT EXISTS idx_ledgers_date ON public.vendor_ledgers(date);
CREATE INDEX IF NOT EXISTS idx_ledgers_client_id ON public.vendor_ledgers(client_id);

-- ------------------------------------------------------------
-- 8. BANK ACCOUNTS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_name TEXT NOT NULL,
    account_number TEXT,
    ifsc_code TEXT,
    branch TEXT,
    account_type TEXT DEFAULT 'Current Account',
    status TEXT DEFAULT 'ACTIVE',
    balance NUMERIC(14, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_bank_accounts_updated_at ON public.bank_accounts;
CREATE TRIGGER update_bank_accounts_updated_at
BEFORE UPDATE ON public.bank_accounts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------
-- 9. BANK TRANSACTIONS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bank_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id UUID NOT NULL REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'deposit', 'withdrawal', 'adjustment')),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bank_transactions_bank_id ON public.bank_transactions(bank_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_date ON public.bank_transactions(date);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_advance_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;

-- 1. Clients Policies
DROP POLICY IF EXISTS "Allow select on clients" ON public.clients;
DROP POLICY IF EXISTS "Allow insert on clients" ON public.clients;
DROP POLICY IF EXISTS "Allow update on clients" ON public.clients;
DROP POLICY IF EXISTS "Allow delete on clients" ON public.clients;
CREATE POLICY "Allow select on clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Allow insert on clients" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on clients" ON public.clients FOR UPDATE USING (true);
CREATE POLICY "Allow delete on clients" ON public.clients FOR DELETE USING (true);

-- 2. Client Advance Payments Policies
DROP POLICY IF EXISTS "Allow select on client_advance_payments" ON public.client_advance_payments;
DROP POLICY IF EXISTS "Allow insert on client_advance_payments" ON public.client_advance_payments;
DROP POLICY IF EXISTS "Allow update on client_advance_payments" ON public.client_advance_payments;
DROP POLICY IF EXISTS "Allow delete on client_advance_payments" ON public.client_advance_payments;
CREATE POLICY "Allow select on client_advance_payments" ON public.client_advance_payments FOR SELECT USING (true);
CREATE POLICY "Allow insert on client_advance_payments" ON public.client_advance_payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on client_advance_payments" ON public.client_advance_payments FOR UPDATE USING (true);
CREATE POLICY "Allow delete on client_advance_payments" ON public.client_advance_payments FOR DELETE USING (true);

-- 3. Client Expenses Policies
DROP POLICY IF EXISTS "Allow select on client_expenses" ON public.client_expenses;
DROP POLICY IF EXISTS "Allow insert on client_expenses" ON public.client_expenses;
DROP POLICY IF EXISTS "Allow update on client_expenses" ON public.client_expenses;
DROP POLICY IF EXISTS "Allow delete on client_expenses" ON public.client_expenses;
CREATE POLICY "Allow select on client_expenses" ON public.client_expenses FOR SELECT USING (true);
CREATE POLICY "Allow insert on client_expenses" ON public.client_expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on client_expenses" ON public.client_expenses FOR UPDATE USING (true);
CREATE POLICY "Allow delete on client_expenses" ON public.client_expenses FOR DELETE USING (true);

-- 4. Vendor Categories Policies
DROP POLICY IF EXISTS "Allow select on vendor_categories" ON public.vendor_categories;
DROP POLICY IF EXISTS "Allow insert on vendor_categories" ON public.vendor_categories;
DROP POLICY IF EXISTS "Allow update on vendor_categories" ON public.vendor_categories;
DROP POLICY IF EXISTS "Allow delete on vendor_categories" ON public.vendor_categories;
CREATE POLICY "Allow select on vendor_categories" ON public.vendor_categories FOR SELECT USING (true);
CREATE POLICY "Allow insert on vendor_categories" ON public.vendor_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on vendor_categories" ON public.vendor_categories FOR UPDATE USING (true);
CREATE POLICY "Allow delete on vendor_categories" ON public.vendor_categories FOR DELETE USING (true);

-- 5. Vendors Policies
DROP POLICY IF EXISTS "Allow select on vendors" ON public.vendors;
DROP POLICY IF EXISTS "Allow insert on vendors" ON public.vendors;
DROP POLICY IF EXISTS "Allow update on vendors" ON public.vendors;
DROP POLICY IF EXISTS "Allow delete on vendors" ON public.vendors;
CREATE POLICY "Allow select on vendors" ON public.vendors FOR SELECT USING (true);
CREATE POLICY "Allow insert on vendors" ON public.vendors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on vendors" ON public.vendors FOR UPDATE USING (true);
CREATE POLICY "Allow delete on vendors" ON public.vendors FOR DELETE USING (true);

-- 6. Vendor Ledgers Policies
DROP POLICY IF EXISTS "Allow select on vendor_ledgers" ON public.vendor_ledgers;
DROP POLICY IF EXISTS "Allow insert on vendor_ledgers" ON public.vendor_ledgers;
DROP POLICY IF EXISTS "Allow update on vendor_ledgers" ON public.vendor_ledgers;
DROP POLICY IF EXISTS "Allow delete on vendor_ledgers" ON public.vendor_ledgers;
CREATE POLICY "Allow select on vendor_ledgers" ON public.vendor_ledgers FOR SELECT USING (true);
CREATE POLICY "Allow insert on vendor_ledgers" ON public.vendor_ledgers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on vendor_ledgers" ON public.vendor_ledgers FOR UPDATE USING (true);
CREATE POLICY "Allow delete on vendor_ledgers" ON public.vendor_ledgers FOR DELETE USING (true);

-- 7. Bank Accounts Policies
DROP POLICY IF EXISTS "Allow select on bank_accounts" ON public.bank_accounts;
DROP POLICY IF EXISTS "Allow insert on bank_accounts" ON public.bank_accounts;
DROP POLICY IF EXISTS "Allow update on bank_accounts" ON public.bank_accounts;
DROP POLICY IF EXISTS "Allow delete on bank_accounts" ON public.bank_accounts;
CREATE POLICY "Allow select on bank_accounts" ON public.bank_accounts FOR SELECT USING (true);
CREATE POLICY "Allow insert on bank_accounts" ON public.bank_accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on bank_accounts" ON public.bank_accounts FOR UPDATE USING (true);
CREATE POLICY "Allow delete on bank_accounts" ON public.bank_accounts FOR DELETE USING (true);

-- 8. Bank Transactions Policies
DROP POLICY IF EXISTS "Allow select on bank_transactions" ON public.bank_transactions;
DROP POLICY IF EXISTS "Allow insert on bank_transactions" ON public.bank_transactions;
DROP POLICY IF EXISTS "Allow update on bank_transactions" ON public.bank_transactions;
DROP POLICY IF EXISTS "Allow delete on bank_transactions" ON public.bank_transactions;
CREATE POLICY "Allow select on bank_transactions" ON public.bank_transactions FOR SELECT USING (true);
CREATE POLICY "Allow insert on bank_transactions" ON public.bank_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on bank_transactions" ON public.bank_transactions FOR UPDATE USING (true);
CREATE POLICY "Allow delete on bank_transactions" ON public.bank_transactions FOR DELETE USING (true);
