import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import { applyPostLoginLocation } from '@/lib/afrahAppRedirect';
import { AfrahAppLogin } from './AfrahAppLogin';
import { Loader2 } from 'lucide-react';

interface AfrahAppAuthGateProps {
  children: React.ReactNode;
}

export const AfrahAppAuthGate: React.FC<AfrahAppAuthGateProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const hadSessionRef = React.useRef(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setReady(true);
      return;
    }

    let cancelled = false;

    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      hadSessionRef.current = Boolean(data.session);
      setSession(data.session ?? null);
      setReady(true);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'SIGNED_IN' && !hadSessionRef.current) {
        applyPostLoginLocation();
      }
      hadSessionRef.current = Boolean(nextSession);
      setSession(nextSession);
      setReady(true);
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <div className="afrah-app-login-page">
        <div className="afrah-app-login-card">
          <h1 className="afrah-app-login-title">Database not configured</h1>
          <p className="afrah-app-login-sub">
            Set the public Supabase URL and anon key to sign in to the operations portal.
          </p>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="afrah-app-login-page">
        <div className="afrah-app-login-status">
          <Loader2 size={22} className="afrah-app-login-spinner" />
          <span>Checking session…</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <AfrahAppLogin
        onSubmit={async (email, password) => {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) return error.message;
          return null;
        }}
      />
    );
  }

  return <>{children}</>;
};
