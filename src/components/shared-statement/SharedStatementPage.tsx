import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import type { StatementSnapshot } from '@/lib/statementSnapshot';
import { SharedStatementSheet } from './SharedStatementSheet';
import '../afrah-app/styles/_print.css';

const TOKEN_PATTERN = /^\/s\/([^/]+)\/?$/;

const PAGE_BG = '#e2e8f0';

function parseTokenFromPathname(pathname: string): string | null {
  const match = TOKEN_PATTERN.exec(pathname);
  return match?.[1] ?? null;
}

type LoadState =
  | { status: 'no-token' }
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; payload: StatementSnapshot; title: string };

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: PAGE_BG,
        backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        color: '#334155',
        fontFamily: "'Plus Jakarta Sans', Arial, Helvetica, sans-serif",
        fontSize: '16px',
        textAlign: 'center',
      }}
    >
      {children}
    </div>
  );
}

export function SharedStatementPage() {
  const [state, setState] = useState<LoadState>(() => {
    const token = parseTokenFromPathname(window.location.pathname);
    if (!token) return { status: 'no-token' };
    return { status: 'loading' };
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.body.style.backgroundColor = PAGE_BG;
  }, []);

  useEffect(() => {
    const token = parseTokenFromPathname(window.location.pathname);
    if (!token) {
      setState({ status: 'no-token' });
      return;
    }

    let cancelled = false;

    async function loadShare() {
      if (!isSupabaseConfigured) {
        if (!cancelled) setState({ status: 'error' });
        return;
      }

      const { data, error } = await supabase
        .from('statement_shares')
        .select('payload, title, created_at')
        .eq('id', token)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data?.payload) {
        setState({ status: 'error' });
        return;
      }

      const title = data.title?.trim() || 'Statement';
      document.title = `${title} | Afrah Constructions`;
      setState({
        status: 'success',
        payload: data.payload as StatementSnapshot,
        title,
      });
    }

    setState({ status: 'loading' });
    void loadShare();

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === 'no-token') {
    return <CenteredMessage>Statement not found</CenteredMessage>;
  }

  if (state.status === 'loading') {
    return <CenteredMessage>Loading statement…</CenteredMessage>;
  }

  if (state.status === 'error') {
    return (
      <CenteredMessage>This statement link is invalid or has expired.</CenteredMessage>
    );
  }

  return (
    <div
      className="statement-preview-viewport"
      style={{
        minHeight: '100vh',
        maxHeight: 'none',
        boxSizing: 'border-box',
      }}
    >
      <SharedStatementSheet payload={state.payload} />
    </div>
  );
}

export default SharedStatementPage;
