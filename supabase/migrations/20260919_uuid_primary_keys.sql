-- ============================================================
-- Root cause: later tables used TEXT PKs, so seed/app slugs
-- ('interior-client-3', 'bc_01', …) were valid. Align every
-- remaining TEXT id/FK with the UUID PKs from 20260828_init.
-- Idempotent: no-ops if columns are already uuid.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

BEGIN;

CREATE OR REPLACE FUNCTION public._afrah_is_uuid_text(val text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT val ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
$$;

CREATE OR REPLACE FUNCTION public._afrah_col_to_uuid(p_table text, p_column text, p_set_default boolean DEFAULT false)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = p_table
      AND column_name = p_column
      AND data_type = 'text'
  ) THEN
    EXECUTE format(
      'ALTER TABLE public.%I ALTER COLUMN %I DROP DEFAULT',
      p_table, p_column
    );
    EXECUTE format(
      'ALTER TABLE public.%I ALTER COLUMN %I TYPE uuid USING NULLIF(btrim(%I), '''')::uuid',
      p_table, p_column, p_column
    );
    IF p_set_default THEN
      EXECUTE format(
        'ALTER TABLE public.%I ALTER COLUMN %I SET DEFAULT gen_random_uuid()',
        p_table, p_column
      );
    END IF;
  END IF;
END;
$$;

DO $$
DECLARE
  rec record;
  tbl text;
  tables text[] := ARRAY[
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
    'interior_vendor_ledgers'
  ];
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'interior_clients'
      AND column_name = 'id'
      AND data_type = 'text'
  ) THEN
    RETURN;
  END IF;

  CREATE TEMP TABLE id_remap (
    tbl text NOT NULL,
    old_id text NOT NULL,
    new_id uuid NOT NULL,
    PRIMARY KEY (tbl, old_id)
  );

  FOREACH tbl IN ARRAY tables LOOP
    IF to_regclass('public.' || tbl) IS NULL THEN
      CONTINUE;
    END IF;
    EXECUTE format(
      $sql$
        INSERT INTO id_remap (tbl, old_id, new_id)
        SELECT %L, id,
          CASE
            WHEN public._afrah_is_uuid_text(id) THEN id::uuid
            ELSE gen_random_uuid()
          END
        FROM public.%I
      $sql$,
      tbl, tbl
    );
  END LOOP;

  FOR rec IN
    SELECT c.conrelid::regclass AS tbl, c.conname
    FROM pg_constraint c
    JOIN pg_class rel ON rel.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = rel.relnamespace
    WHERE c.contype = 'f'
      AND n.nspname = 'public'
      AND (
        rel.relname = ANY (tables)
        OR (
          SELECT r.relname
          FROM pg_class r
          WHERE r.oid = c.confrelid
        ) = ANY (tables)
      )
  LOOP
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', rec.tbl, rec.conname);
  END LOOP;

  -- Parent PKs first so identity maps stay stable for children
  FOREACH tbl IN ARRAY tables LOOP
    IF to_regclass('public.' || tbl) IS NULL THEN
      CONTINUE;
    END IF;
    EXECUTE format(
      $sql$
        UPDATE public.%I t
        SET id = m.new_id::text
        FROM id_remap m
        WHERE m.tbl = %L AND t.id = m.old_id AND t.id IS DISTINCT FROM m.new_id::text
      $sql$,
      tbl, tbl
    );
  END LOOP;

  IF to_regclass('public.interior_client_advances') IS NOT NULL THEN
    UPDATE public.interior_client_advances t
    SET client_id = m.new_id::text
    FROM id_remap m
    WHERE m.tbl = 'interior_clients' AND t.client_id = m.old_id;
  END IF;

  IF to_regclass('public.interior_client_expenses') IS NOT NULL THEN
    UPDATE public.interior_client_expenses t
    SET client_id = m.new_id::text
    FROM id_remap m
    WHERE m.tbl = 'interior_clients' AND t.client_id = m.old_id;
  END IF;

  IF to_regclass('public.interior_labour_entries') IS NOT NULL THEN
    UPDATE public.interior_labour_entries t
    SET contract_id = m.new_id::text
    FROM id_remap m
    WHERE m.tbl = 'interior_labour_contracts' AND t.contract_id = m.old_id;
  END IF;

  IF to_regclass('public.construction_labour_entries') IS NOT NULL THEN
    UPDATE public.construction_labour_entries t
    SET contract_id = m.new_id::text
    FROM id_remap m
    WHERE m.tbl = 'construction_labour_contracts' AND t.contract_id = m.old_id;
  END IF;

  IF to_regclass('public.brick_transactions') IS NOT NULL THEN
    UPDATE public.brick_transactions t
    SET customer_id = m.new_id::text
    FROM id_remap m
    WHERE m.tbl = 'brick_customers' AND t.customer_id = m.old_id;
  END IF;

  IF to_regclass('public.brick_stock_entries') IS NOT NULL THEN
    UPDATE public.brick_stock_entries t
    SET stock_item_id = m.new_id::text
    FROM id_remap m
    WHERE m.tbl = 'brick_stock_items' AND t.stock_item_id = m.old_id;
  END IF;

  IF to_regclass('public.interior_vendors') IS NOT NULL THEN
    UPDATE public.interior_vendors t
    SET category_id = m.new_id::text
    FROM id_remap m
    WHERE m.tbl = 'interior_vendor_categories' AND t.category_id = m.old_id;
  END IF;

  IF to_regclass('public.interior_vendor_ledgers') IS NOT NULL THEN
    UPDATE public.interior_vendor_ledgers t
    SET vendor_id = m.new_id::text
    FROM id_remap m
    WHERE m.tbl = 'interior_vendors' AND t.vendor_id = m.old_id;

    UPDATE public.interior_vendor_ledgers t
    SET client_id = m.new_id::text
    FROM id_remap m
    WHERE m.tbl = 'interior_clients' AND t.client_id = m.old_id;

    UPDATE public.interior_vendor_ledgers
    SET client_id = NULL
    WHERE client_id IS NOT NULL AND NOT public._afrah_is_uuid_text(client_id);
  END IF;

  PERFORM public._afrah_col_to_uuid('interior_clients', 'id', true);
  PERFORM public._afrah_col_to_uuid('interior_client_advances', 'id', true);
  PERFORM public._afrah_col_to_uuid('interior_client_advances', 'client_id');
  PERFORM public._afrah_col_to_uuid('interior_client_expenses', 'id', true);
  PERFORM public._afrah_col_to_uuid('interior_client_expenses', 'client_id');
  PERFORM public._afrah_col_to_uuid('interior_labour_contracts', 'id', true);
  PERFORM public._afrah_col_to_uuid('interior_labour_entries', 'id', true);
  PERFORM public._afrah_col_to_uuid('interior_labour_entries', 'contract_id');
  PERFORM public._afrah_col_to_uuid('construction_labour_contracts', 'id', true);
  PERFORM public._afrah_col_to_uuid('construction_labour_entries', 'id', true);
  PERFORM public._afrah_col_to_uuid('construction_labour_entries', 'contract_id');
  PERFORM public._afrah_col_to_uuid('brick_customers', 'id', true);
  PERFORM public._afrah_col_to_uuid('brick_transactions', 'id', true);
  PERFORM public._afrah_col_to_uuid('brick_transactions', 'customer_id');
  PERFORM public._afrah_col_to_uuid('brick_stock_items', 'id', true);
  PERFORM public._afrah_col_to_uuid('brick_stock_entries', 'id', true);
  PERFORM public._afrah_col_to_uuid('brick_stock_entries', 'stock_item_id');
  PERFORM public._afrah_col_to_uuid('brick_production_expenses', 'id', true);
  PERFORM public._afrah_col_to_uuid('interior_vendor_categories', 'id', true);
  PERFORM public._afrah_col_to_uuid('interior_vendors', 'id', true);
  PERFORM public._afrah_col_to_uuid('interior_vendors', 'category_id');
  PERFORM public._afrah_col_to_uuid('interior_vendor_ledgers', 'id', true);
  PERFORM public._afrah_col_to_uuid('interior_vendor_ledgers', 'vendor_id');
  PERFORM public._afrah_col_to_uuid('interior_vendor_ledgers', 'client_id');

END $$;

DO $$
BEGIN
  IF to_regclass('public.interior_client_advances') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'interior_client_advances_client_id_fkey') THEN
    ALTER TABLE public.interior_client_advances
      ADD CONSTRAINT interior_client_advances_client_id_fkey
      FOREIGN KEY (client_id) REFERENCES public.interior_clients(id) ON DELETE CASCADE;
  END IF;
  IF to_regclass('public.interior_client_expenses') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'interior_client_expenses_client_id_fkey') THEN
    ALTER TABLE public.interior_client_expenses
      ADD CONSTRAINT interior_client_expenses_client_id_fkey
      FOREIGN KEY (client_id) REFERENCES public.interior_clients(id) ON DELETE CASCADE;
  END IF;
  IF to_regclass('public.interior_labour_entries') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'interior_labour_entries_contract_id_fkey') THEN
    ALTER TABLE public.interior_labour_entries
      ADD CONSTRAINT interior_labour_entries_contract_id_fkey
      FOREIGN KEY (contract_id) REFERENCES public.interior_labour_contracts(id) ON DELETE CASCADE;
  END IF;
  IF to_regclass('public.construction_labour_entries') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'construction_labour_entries_contract_id_fkey') THEN
    ALTER TABLE public.construction_labour_entries
      ADD CONSTRAINT construction_labour_entries_contract_id_fkey
      FOREIGN KEY (contract_id) REFERENCES public.construction_labour_contracts(id) ON DELETE CASCADE;
  END IF;
  IF to_regclass('public.brick_transactions') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'brick_transactions_customer_id_fkey') THEN
    ALTER TABLE public.brick_transactions
      ADD CONSTRAINT brick_transactions_customer_id_fkey
      FOREIGN KEY (customer_id) REFERENCES public.brick_customers(id) ON DELETE CASCADE;
  END IF;
  IF to_regclass('public.brick_stock_entries') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'brick_stock_entries_stock_item_id_fkey') THEN
    ALTER TABLE public.brick_stock_entries
      ADD CONSTRAINT brick_stock_entries_stock_item_id_fkey
      FOREIGN KEY (stock_item_id) REFERENCES public.brick_stock_items(id) ON DELETE CASCADE;
  END IF;
  IF to_regclass('public.interior_vendors') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'interior_vendors_category_id_fkey') THEN
    ALTER TABLE public.interior_vendors
      ADD CONSTRAINT interior_vendors_category_id_fkey
      FOREIGN KEY (category_id) REFERENCES public.interior_vendor_categories(id) ON DELETE CASCADE;
  END IF;
  IF to_regclass('public.interior_vendor_ledgers') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'interior_vendor_ledgers_vendor_id_fkey') THEN
    ALTER TABLE public.interior_vendor_ledgers
      ADD CONSTRAINT interior_vendor_ledgers_vendor_id_fkey
      FOREIGN KEY (vendor_id) REFERENCES public.interior_vendors(id) ON DELETE CASCADE;
  END IF;
END $$;

DROP FUNCTION IF EXISTS public._afrah_col_to_uuid(text, text, boolean);
DROP FUNCTION IF EXISTS public._afrah_is_uuid_text(text);

COMMIT;
