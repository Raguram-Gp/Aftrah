-- Sequential quotation numbers, independent of quotation date.
-- Format: Q/YYYY/001 so multiple quotes on the same day stay unique.

ALTER TABLE public.interior_clients
  ADD COLUMN IF NOT EXISTS quote_no TEXT;

WITH numbered AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY EXTRACT(YEAR FROM COALESCE(quote_date, created_at::date, CURRENT_DATE))
      ORDER BY s_no ASC, created_at ASC NULLS LAST
    ) AS seq,
    EXTRACT(YEAR FROM COALESCE(quote_date, created_at::date, CURRENT_DATE))::int AS quote_year
  FROM public.interior_clients
  WHERE quote_no IS NULL OR btrim(quote_no) = ''
)
UPDATE public.interior_clients AS clients
SET quote_no = 'Q/' || numbered.quote_year::text || '/' || lpad(numbered.seq::text, 3, '0')
FROM numbered
WHERE clients.id = numbered.id;

CREATE UNIQUE INDEX IF NOT EXISTS interior_clients_quote_no_key
  ON public.interior_clients (quote_no);
