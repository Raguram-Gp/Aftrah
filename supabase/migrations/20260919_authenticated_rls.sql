-- ERP tables: authenticated staff only. Public statement links stay readable.

DO $$
DECLARE
    tbl text;
    pol text;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'clients',
        'client_advance_payments',
        'client_expenses',
        'vendor_categories',
        'vendors',
        'vendor_ledgers',
        'vendor_shops',
        'bank_accounts',
        'bank_transactions',
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
        'brick_production_expenses',
        'interior_vendor_categories',
        'interior_vendors',
        'interior_vendor_ledgers',
        'interior_ledger_clients',
        'interior_ledger_advances',
        'interior_ledger_expenses'
    ]) LOOP
        IF to_regclass('public.' || tbl) IS NULL THEN
            CONTINUE;
        END IF;

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

DO $$
BEGIN
    IF to_regclass('public.statement_shares') IS NULL THEN
        RETURN;
    END IF;

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
        TO authenticated
        WITH CHECK (true);

    GRANT SELECT ON TABLE public.statement_shares TO anon;
    GRANT SELECT, INSERT ON TABLE public.statement_shares TO authenticated;
END $$;
