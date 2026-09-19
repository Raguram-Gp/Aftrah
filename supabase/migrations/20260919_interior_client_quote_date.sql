-- Persist a single quotation date on interior clients (replaces from/to statement range).

ALTER TABLE public.interior_clients
  ADD COLUMN IF NOT EXISTS quote_date DATE;

UPDATE public.interior_clients
SET quote_date = COALESCE(quote_date, created_at::date, CURRENT_DATE)
WHERE quote_date IS NULL;

ALTER TABLE public.interior_clients
  ALTER COLUMN quote_date SET DEFAULT CURRENT_DATE;

ALTER TABLE public.interior_clients
  ALTER COLUMN quote_date SET NOT NULL;
