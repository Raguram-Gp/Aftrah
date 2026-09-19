import { APP_BASE } from '@/components/afrah-app/navUrl';

const isSafeAfrahAppPath = (path: string): boolean =>
  path === APP_BASE || path.startsWith(`${APP_BASE}/`);

export const sanitizeAfrahAppPath = (raw: string | null | undefined): string | null => {
  if (!raw) return null;

  let value = raw.trim();
  if (!value) return null;

  try {
    value = decodeURIComponent(value);
  } catch {
    return null;
  }

  if (
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\') ||
    value.includes('://') ||
    /[<>'"\s]/.test(value)
  ) {
    return null;
  }

  const path = value.split('?')[0]?.split('#')[0] ?? '';
  if (!isSafeAfrahAppPath(path)) return null;

  const trimmed = path.replace(/\/+$/, '');
  return trimmed || APP_BASE;
};

export const resolvePostLoginPath = (): string => {
  if (typeof window === 'undefined') return APP_BASE;

  const params = new URLSearchParams(window.location.search);
  const fromQuery = sanitizeAfrahAppPath(params.get('redirectUrl'));
  if (fromQuery) return fromQuery;

  const fromLocation = sanitizeAfrahAppPath(window.location.pathname);
  if (fromLocation) return fromLocation;

  return APP_BASE;
};

export const applyPostLoginLocation = (): void => {
  if (typeof window === 'undefined') return;

  const targetPath = resolvePostLoginPath();
  const url = new URL(window.location.href);
  url.searchParams.delete('redirectUrl');
  const nextSearch = url.searchParams.toString();
  const next = nextSearch ? `${targetPath}?${nextSearch}` : targetPath;
  const current = `${window.location.pathname}${window.location.search}`;

  if (next !== current) {
    window.history.replaceState(window.history.state, '', next);
  }
};
