import React, { useState } from 'react';
import { Loader2, Lock } from 'lucide-react';

interface AfrahAppLoginProps {
  onSubmit: (email: string, password: string) => Promise<string | null>;
  onGuestAccess?: () => void;
}

export const AfrahAppLogin: React.FC<AfrahAppLoginProps> = ({ onSubmit, onGuestAccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const message = await onSubmit(email.trim(), password);
      if (message) setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="afrah-app-login-page">
      <div className="afrah-app-ambient-glow" />
      <div className="afrah-app-ambient-glow-2" />

      <form className="afrah-app-login-card" onSubmit={handleSubmit}>
        <div className="afrah-app-login-mark">
          <Lock size={18} />
        </div>
        <h1 className="afrah-app-login-title">AFRAH CONSTRUCTIONS</h1>
        <p className="afrah-app-login-sub">Sign in to the operations portal</p>

        <label className="afrah-app-login-label" htmlFor="afrah-login-email">
          Email
        </label>
        <input
          id="afrah-login-email"
          className="afrah-app-login-input"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="afrah-app-login-label" htmlFor="afrah-login-password">
          Password
        </label>
        <input
          id="afrah-login-password"
          className="afrah-app-login-input"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error ? <p className="afrah-app-login-error">{error}</p> : null}

        <button className="afrah-app-login-submit" type="submit" disabled={submitting}>
          {submitting ? <Loader2 size={16} className="afrah-app-login-spinner" /> : null}
          <span>{submitting ? 'Signing in…' : 'Sign in'}</span>
        </button>

        {onGuestAccess && (
          <button
            type="button"
            onClick={onGuestAccess}
            style={{
              marginTop: '12px',
              width: '100%',
              height: '38px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-stroke, #333842)',
              color: 'var(--text-secondary, #9ca3af)',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Explore as Guest / Dev Mode
          </button>
        )}
      </form>
    </div>
  );
};
