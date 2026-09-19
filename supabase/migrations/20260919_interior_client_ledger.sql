-- Interior Clients ledger (KAAB Interior → Clients tab).
-- Quotations stay on interior_clients + interior_client_expenses.
-- Advances move onto a new interior_client parent.

CREATE TABLE IF NOT EXISTS public.interior_client (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_interior_client_updated_at ON public.interior_client;
CREATE TRIGGER update_interior_client_updated_at
BEFORE UPDATE ON public.interior_client
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.interior_client_ledger_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.interior_client(id) ON DELETE CASCADE,
    s_no INT NOT NULL DEFAULT 1,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    expense_name TEXT NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL DEFAULT 1,
    rate NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interior_client_ledger_exp_client_id
    ON public.interior_client_ledger_expenses(client_id);
CREATE INDEX IF NOT EXISTS idx_interior_client_ledger_exp_date
    ON public.interior_client_ledger_expenses(date);

-- Quotation-linked advances are unused in the quotations UI.
DELETE FROM public.interior_client_advances;

ALTER TABLE public.interior_client_advances
    DROP CONSTRAINT IF EXISTS interior_client_advances_client_id_fkey;

ALTER TABLE public.interior_client_advances
    ADD CONSTRAINT interior_client_advances_client_id_fkey
    FOREIGN KEY (client_id) REFERENCES public.interior_client(id) ON DELETE CASCADE;

-- Authenticated RLS for new tables (vendor_shops never existed — skip).
DO $$
DECLARE
    tbl text;
    pol text;
BEGIN
    FOREACH tbl IN ARRAY ARRAY['interior_client', 'interior_client_ledger_expenses'] LOOP
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

-- Demo ledger rows (UUID PKs). Skip if the phone already exists.
INSERT INTO public.interior_client (name, phone, address, created_at, updated_at)
SELECT v.name, v.phone, v.address, v.created_at, v.created_at
FROM (
    VALUES
        ('Karthik Rajan', '+91 98401 55678', 'Penthouse 402, Skyline Residency, Anna Nagar, Chennai', TIMESTAMPTZ '2026-01-10'),
        ('Dr. Vikramaditya Reddy', '+91 97910 88901', 'Plot 12, Jubilee Hills Extension, Hyderabad', TIMESTAMPTZ '2026-01-15'),
        ('Priya Sundaram', '+91 94440 23456', 'Villa 8, Palm Meadows, ECR, Chennai', TIMESTAMPTZ '2026-02-01')
) AS v(name, phone, address, created_at)
WHERE NOT EXISTS (
    SELECT 1 FROM public.interior_client c WHERE c.phone = v.phone
);

INSERT INTO public.interior_client_advances (client_id, s_no, date, amount, mode)
SELECT c.id, v.s_no, v.date, v.amount, v.mode
FROM public.interior_client c
JOIN (
    VALUES
        ('+91 98401 55678', 1, DATE '2026-01-10', 350000.00, 'HDFC Bank'),
        ('+91 98401 55678', 2, DATE '2026-01-25', 250000.00, 'UPI'),
        ('+91 98401 55678', 3, DATE '2026-02-10', 200000.00, 'Cheque'),
        ('+91 98401 55678', 4, DATE '2026-02-22', 150000.00, 'State Bank of India (SBI)'),
        ('+91 97910 88901', 1, DATE '2026-01-15', 500000.00, 'ICICI Bank'),
        ('+91 97910 88901', 2, DATE '2026-02-01', 400000.00, 'HDFC Bank'),
        ('+91 97910 88901', 3, DATE '2026-02-18', 300000.00, 'UPI'),
        ('+91 94440 23456', 1, DATE '2026-02-01', 300000.00, 'UPI'),
        ('+91 94440 23456', 2, DATE '2026-02-20', 200000.00, 'Cheque')
) AS v(phone, s_no, date, amount, mode) ON c.phone = v.phone
WHERE NOT EXISTS (
    SELECT 1 FROM public.interior_client_advances a WHERE a.client_id = c.id
);

INSERT INTO public.interior_client_ledger_expenses (client_id, s_no, date, expense_name, quantity, rate, total_amount)
SELECT c.id, v.s_no, v.date, v.expense_name, v.quantity, v.rate, v.total_amount
FROM public.interior_client c
JOIN (
    VALUES
        ('+91 98401 55678', 1, DATE '2026-01-12', 'Plywood (BWP 710)', 45.00, 2400.00, 108000.00),
        ('+91 98401 55678', 2, DATE '2026-01-18', 'Laminate Sheets (1mm)', 30.00, 1850.00, 55500.00),
        ('+91 98401 55678', 3, DATE '2026-01-28', 'Modular Kitchen Hardware', 1.00, 85000.00, 85000.00),
        ('+91 98401 55678', 4, DATE '2026-02-02', 'False Ceiling Gypsum', 650.00, 110.00, 71500.00),
        ('+91 98401 55678', 5, DATE '2026-02-08', 'LED Profile & Strip Lights', 24.00, 1450.00, 34800.00),
        ('+91 98401 55678', 6, DATE '2026-02-15', 'Carpenter Team Wages', 1.00, 95000.00, 95000.00),
        ('+91 98401 55678', 7, DATE '2026-02-20', 'PU Polish & Paint Finish', 1.00, 62000.00, 62000.00),
        ('+91 97910 88901', 1, DATE '2026-01-20', 'Veneer Paneling Sheets', 25.00, 3800.00, 95000.00),
        ('+91 97910 88901', 2, DATE '2026-01-26', 'Wardrobe Sliding Fittings', 3.00, 22000.00, 66000.00),
        ('+91 97910 88901', 3, DATE '2026-02-05', 'Master Bedroom Bed & Paneling', 1.00, 140000.00, 140000.00),
        ('+91 97910 88901', 4, DATE '2026-02-12', 'Toughened Glass Partitions', 4.00, 16500.00, 66000.00),
        ('+91 97910 88901', 5, DATE '2026-02-21', 'Designer Wallpaper & Textured Paint', 1.00, 58000.00, 58000.00),
        ('+91 94440 23456', 1, DATE '2026-02-04', 'Modular Kitchen Quartz Countertop', 1.00, 72000.00, 72000.00),
        ('+91 94440 23456', 2, DATE '2026-02-11', 'Acrylic Cabinet Shutters', 18.00, 2600.00, 46800.00),
        ('+91 94440 23456', 3, DATE '2026-02-23', 'Electrical Fixtures & Switches', 1.00, 38000.00, 38000.00)
) AS v(phone, s_no, date, expense_name, quantity, rate, total_amount) ON c.phone = v.phone
WHERE NOT EXISTS (
    SELECT 1 FROM public.interior_client_ledger_expenses e WHERE e.client_id = c.id
);
