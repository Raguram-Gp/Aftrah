-- ============================================================
-- AFTRAH CONSTRUCTIONS & BRICK FACTORY — FULL CLOUD INTEGRATION
-- Migration: 20260905_full_cloud_integration.sql
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
-- 1. INTERIOR CLIENTS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.interior_clients (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    s_no INT NOT NULL DEFAULT 1,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    site_location TEXT,
    project_scope TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_interior_clients_updated_at ON public.interior_clients;
CREATE TRIGGER update_interior_clients_updated_at
BEFORE UPDATE ON public.interior_clients
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------
-- 2. INTERIOR CLIENT ADVANCES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.interior_client_advances (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    client_id TEXT NOT NULL REFERENCES public.interior_clients(id) ON DELETE CASCADE,
    s_no INT NOT NULL DEFAULT 1,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    mode TEXT NOT NULL DEFAULT 'HDFC Bank',
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interior_adv_client_id ON public.interior_client_advances(client_id);
CREATE INDEX IF NOT EXISTS idx_interior_adv_date ON public.interior_client_advances(date);

-- ------------------------------------------------------------
-- 3. INTERIOR CLIENT EXPENSES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.interior_client_expenses (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    client_id TEXT NOT NULL REFERENCES public.interior_clients(id) ON DELETE CASCADE,
    s_no INT NOT NULL DEFAULT 1,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category TEXT,
    expense_name TEXT NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL DEFAULT 1,
    unit TEXT DEFAULT 'Sq.ft',
    rate NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interior_exp_client_id ON public.interior_client_expenses(client_id);
CREATE INDEX IF NOT EXISTS idx_interior_exp_date ON public.interior_client_expenses(date);

-- ------------------------------------------------------------
-- 4. INTERIOR LABOUR CONTRACTS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.interior_labour_contracts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    s_no INT NOT NULL DEFAULT 1,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    labour_name TEXT NOT NULL,
    site_name TEXT NOT NULL,
    phone TEXT,
    labour_charge NUMERIC(14, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_interior_labour_contracts_updated_at ON public.interior_labour_contracts;
CREATE TRIGGER update_interior_labour_contracts_updated_at
BEFORE UPDATE ON public.interior_labour_contracts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------
-- 5. INTERIOR LABOUR ENTRIES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.interior_labour_entries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    contract_id TEXT NOT NULL REFERENCES public.interior_labour_contracts(id) ON DELETE CASCADE,
    s_no INT NOT NULL DEFAULT 1,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    work_type TEXT NOT NULL,
    days NUMERIC(10, 2) NOT NULL DEFAULT 1,
    salary_per_day NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_int_labour_entries_cid ON public.interior_labour_entries(contract_id);
CREATE INDEX IF NOT EXISTS idx_int_labour_entries_date ON public.interior_labour_entries(date);

-- ------------------------------------------------------------
-- 6. CONSTRUCTION LABOUR CONTRACTS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.construction_labour_contracts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    s_no INT NOT NULL DEFAULT 1,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    labour_name TEXT NOT NULL,
    site_name TEXT NOT NULL,
    phone TEXT,
    labour_charge NUMERIC(14, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_const_labour_contracts_updated_at ON public.construction_labour_contracts;
CREATE TRIGGER update_const_labour_contracts_updated_at
BEFORE UPDATE ON public.construction_labour_contracts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------
-- 7. CONSTRUCTION LABOUR ENTRIES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.construction_labour_entries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    contract_id TEXT NOT NULL REFERENCES public.construction_labour_contracts(id) ON DELETE CASCADE,
    s_no INT NOT NULL DEFAULT 1,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    work_type TEXT NOT NULL,
    days NUMERIC(10, 2) NOT NULL DEFAULT 1,
    salary_per_day NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_const_labour_entries_cid ON public.construction_labour_entries(contract_id);
CREATE INDEX IF NOT EXISTS idx_const_labour_entries_date ON public.construction_labour_entries(date);

-- ------------------------------------------------------------
-- 8. BRICK CUSTOMERS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.brick_customers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    s_no INT NOT NULL DEFAULT 1,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    balance NUMERIC(14, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_brick_customers_updated_at ON public.brick_customers;
CREATE TRIGGER update_brick_customers_updated_at
BEFORE UPDATE ON public.brick_customers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------
-- 9. BRICK TRANSACTIONS (DISPATCH & PAYMENTS)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.brick_transactions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    customer_id TEXT NOT NULL REFERENCES public.brick_customers(id) ON DELETE CASCADE,
    s_no INT NOT NULL DEFAULT 1,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    brick_type TEXT NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL DEFAULT 1,
    rate NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    paid_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    balance_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    site_location TEXT,
    vehicle_number TEXT,
    driver_phone TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brick_tx_cust_id ON public.brick_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_brick_tx_date ON public.brick_transactions(date);

-- ------------------------------------------------------------
-- 10. BRICK STOCK ITEMS (MASTER)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.brick_stock_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    s_no INT NOT NULL DEFAULT 1,
    item TEXT NOT NULL UNIQUE,
    stock_opening NUMERIC(14, 2) NOT NULL DEFAULT 0,
    current_production NUMERIC(14, 2) NOT NULL DEFAULT 0,
    sales NUMERIC(14, 2) NOT NULL DEFAULT 0,
    material_usage NUMERIC(14, 2) NOT NULL DEFAULT 0,
    pending_stock NUMERIC(14, 2) NOT NULL DEFAULT 0,
    unit_rate NUMERIC(12, 2) DEFAULT 0,
    unit_name TEXT DEFAULT 'Units',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_brick_stock_items_updated_at ON public.brick_stock_items;
CREATE TRIGGER update_brick_stock_items_updated_at
BEFORE UPDATE ON public.brick_stock_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------
-- 11. BRICK STOCK ENTRIES (DAILY MOVEMENTS)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.brick_stock_entries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    stock_item_id TEXT NOT NULL REFERENCES public.brick_stock_items(id) ON DELETE CASCADE,
    s_no INT NOT NULL DEFAULT 1,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    item TEXT NOT NULL,
    stock_opening NUMERIC(14, 2) NOT NULL DEFAULT 0,
    current_production NUMERIC(14, 2) NOT NULL DEFAULT 0,
    sales NUMERIC(14, 2) NOT NULL DEFAULT 0,
    material_usage NUMERIC(14, 2) NOT NULL DEFAULT 0,
    material_inflow NUMERIC(14, 2) NOT NULL DEFAULT 0,
    pending_stock NUMERIC(14, 2) NOT NULL DEFAULT 0,
    type TEXT NOT NULL,
    quantity NUMERIC(14, 2) NOT NULL DEFAULT 0,
    batch_no TEXT,
    vehicle_number TEXT,
    customer_name TEXT,
    notes TEXT,
    balance_after NUMERIC(14, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brick_stock_entries_sid ON public.brick_stock_entries(stock_item_id);
CREATE INDEX IF NOT EXISTS idx_brick_stock_entries_date ON public.brick_stock_entries(date);

-- ------------------------------------------------------------
-- 12. BRICK PRODUCTION EXPENSES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.brick_production_expenses (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    s_no INT NOT NULL DEFAULT 1,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category TEXT NOT NULL,
    expense_name TEXT NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL DEFAULT 1,
    unit TEXT DEFAULT 'Units',
    rate NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    payment_mode TEXT NOT NULL DEFAULT 'Cash',
    paid_to TEXT,
    vehicle_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brick_prod_expenses_date ON public.brick_production_expenses(date);
CREATE INDEX IF NOT EXISTS idx_brick_prod_expenses_cat ON public.brick_production_expenses(category);

DROP TRIGGER IF EXISTS update_brick_prod_expenses_updated_at ON public.brick_production_expenses;
CREATE TRIGGER update_brick_prod_expenses_updated_at
BEFORE UPDATE ON public.brick_production_expenses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE public.interior_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interior_client_advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interior_client_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interior_labour_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interior_labour_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.construction_labour_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.construction_labour_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brick_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brick_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brick_stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brick_stock_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brick_production_expenses ENABLE ROW LEVEL SECURITY;

-- Open policies for anon / authenticated access
DO $$
DECLARE
    tbl text;
    pol text;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'interior_clients',
        'interior_client_advances',
        'interior_client_expenses',
        'interior_labour_contracts',
        'interior_labour_entries',
        'construction_labour_contracts',
        'construction_labour_entries',
        'brick_customers',
        'brick_transactions',
        'brick_stock_items',
        'brick_stock_entries',
        'brick_production_expenses'
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
