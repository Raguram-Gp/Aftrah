-- KAAB Interior client ledger (advances + site expenses). Separate from quotations.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.interior_ledger_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_interior_ledger_clients_updated_at ON public.interior_ledger_clients;
CREATE TRIGGER update_interior_ledger_clients_updated_at
BEFORE UPDATE ON public.interior_ledger_clients
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.interior_ledger_advances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.interior_ledger_clients(id) ON DELETE CASCADE,
    s_no INT NOT NULL DEFAULT 1,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    mode TEXT NOT NULL DEFAULT 'HDFC Bank',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interior_ledger_adv_client_id ON public.interior_ledger_advances(client_id);
CREATE INDEX IF NOT EXISTS idx_interior_ledger_adv_date ON public.interior_ledger_advances(date);

CREATE TABLE IF NOT EXISTS public.interior_ledger_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.interior_ledger_clients(id) ON DELETE CASCADE,
    s_no INT NOT NULL DEFAULT 1,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    expense_name TEXT NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL DEFAULT 1,
    rate NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interior_ledger_exp_client_id ON public.interior_ledger_expenses(client_id);
CREATE INDEX IF NOT EXISTS idx_interior_ledger_exp_date ON public.interior_ledger_expenses(date);

DO $$
DECLARE
    tbl text;
    pol text;
BEGIN
    FOREACH tbl IN ARRAY ARRAY[
        'interior_ledger_clients',
        'interior_ledger_advances',
        'interior_ledger_expenses'
    ] LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);

        FOREACH pol IN ARRAY ARRAY['select', 'insert', 'update', 'delete'] LOOP
            EXECUTE format(
                'DROP POLICY IF EXISTS %I ON public.%I',
                'Allow ' || pol || ' on ' || tbl,
                tbl
            );
        END LOOP;

        EXECUTE format(
            'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (true)',
            'Allow select on ' || tbl,
            tbl
        );
        EXECUTE format(
            'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (true)',
            'Allow insert on ' || tbl,
            tbl
        );
        EXECUTE format(
            'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (true) WITH CHECK (true)',
            'Allow update on ' || tbl,
            tbl
        );
        EXECUTE format(
            'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (true)',
            'Allow delete on ' || tbl,
            tbl
        );

        EXECUTE format(
            'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO authenticated',
            tbl
        );
    END LOOP;
END $$;
