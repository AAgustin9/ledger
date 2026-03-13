import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function LoginScreen() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    const { error } =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
    } else if (mode === 'signup') {
      setInfo('Check your email to confirm your account.');
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError(null);
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    background: '#0c0c0a',
    border: '1px solid #272522',
    borderRadius: 3,
    color: '#e8e0d0',
    fontSize: 15,
    fontFamily: "'Courier New', monospace",
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0c0c0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Georgia, serif',
      padding: 24,
    }}>
      {/* Wordmark */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#c9a84c', letterSpacing: '5px', textTransform: 'uppercase' }}>
          Ledger
        </div>
        <div style={{ fontSize: 12, color: '#504840', letterSpacing: '2px', marginTop: 4, fontFamily: "'Courier New', monospace" }}>
          personal finance tracker
        </div>
      </div>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: 380,
        background: '#141412',
        border: '1px solid #272522',
        borderRadius: 6,
        padding: '32px 28px',
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e8e0d0', marginBottom: 24 }}>
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </h2>

        {/* Google */}
        <button onClick={handleGoogle} style={{
          width: '100%',
          padding: '11px 14px',
          background: 'transparent',
          border: '1px solid #272522',
          borderRadius: 3,
          color: '#e8e0d0',
          fontSize: 14,
          fontFamily: "'Courier New', monospace",
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          marginBottom: 20,
          transition: 'border-color 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#c9a84c'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#272522'}
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: '#272522' }} />
          <span style={{ fontSize: 11, color: '#504840', fontFamily: "'Courier New', monospace", letterSpacing: '1px' }}>or</span>
          <div style={{ flex: 1, height: 1, background: '#272522' }} />
        </div>

        {/* Email + password */}
        <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            style={inputStyle}
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            onFocus={e => e.target.style.borderColor = '#c9a84c'}
            onBlur={e => e.target.style.borderColor = '#272522'}
          />
          <input
            style={inputStyle}
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            onFocus={e => e.target.style.borderColor = '#c9a84c'}
            onBlur={e => e.target.style.borderColor = '#272522'}
          />

          {error && (
            <div style={{ fontSize: 13, color: '#c0392b', fontFamily: "'Courier New', monospace", padding: '8px 0' }}>
              {error}
            </div>
          )}
          {info && (
            <div style={{ fontSize: 13, color: '#4a9e6a', fontFamily: "'Courier New', monospace", padding: '8px 0' }}>
              {info}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            padding: '11px 14px',
            background: '#c9a84c',
            border: 'none',
            borderRadius: 3,
            color: '#0c0c0a',
            fontSize: 14,
            fontWeight: 800,
            fontFamily: "'Courier New', monospace",
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            letterSpacing: '0.5px',
            marginTop: 4,
          }}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setInfo(null); }} style={{
          width: '100%',
          marginTop: 20,
          background: 'none',
          border: 'none',
          color: '#8a8070',
          fontSize: 13,
          fontFamily: "'Courier New', monospace",
          cursor: 'pointer',
          textDecoration: 'underline',
        }}>
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
