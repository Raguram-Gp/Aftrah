export function formatInteriorQuoteNo(year: number | string, seq: number): string {
  return `Q/${year}/${String(seq).padStart(3, '0')}`;
}

export function parseInteriorQuoteNo(quoteNo?: string): { year: string; seq: number } | null {
  const match = quoteNo?.trim().match(/^Q\/(\d{4})\/(\d+)$/i);
  if (!match) return null;
  return { year: match[1], seq: Number.parseInt(match[2], 10) };
}

export function nextInteriorQuoteNo(
  existing: Array<{ quoteNo?: string }>,
  onDate: Date | string = new Date(),
): string {
  const year =
    typeof onDate === 'string' && onDate.length >= 4
      ? onDate.slice(0, 4)
      : String((onDate instanceof Date ? onDate : new Date()).getFullYear());

  let maxSeq = 0;
  for (const item of existing) {
    const parsed = parseInteriorQuoteNo(item.quoteNo);
    if (parsed?.year === year) {
      maxSeq = Math.max(maxSeq, parsed.seq);
    }
  }

  return formatInteriorQuoteNo(year, maxSeq + 1);
}

export function resolveInteriorQuoteNo(
  client: { quoteNo?: string; quoteDate?: string; createdAt?: string; sNo?: number },
): string {
  if (client.quoteNo?.trim()) return client.quoteNo.trim();
  const year =
    (client.quoteDate || client.createdAt || '').slice(0, 4) || String(new Date().getFullYear());
  return formatInteriorQuoteNo(year, client.sNo || 1);
}
