import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  Sparkles, 
  ShieldCheck, 
  Loader2, 
  ArrowRight,
  UserCheck,
  CheckCircle2
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, showToast }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const isConfigured = isSupabaseConfigured();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      if (showToast) showToast('Please enter both email and password.', 'error');
      return;
    }

    if (!isConfigured) {
      if (showToast) showToast('Supabase keys not yet configured in .env. Running in Guest Mode.', 'info');
      onClose();
      return;
    }

    setLoading(true);
    setSuccessMsg('');

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim()
        });

        if (error) throw error;

        if (data?.session) {
          if (showToast) showToast('Account created and logged in successfully!', 'success');
          if (onAuthSuccess) onAuthSuccess(data.user);
          onClose();
        } else {
          setSuccessMsg('Account registered! Please check your email to confirm your account.');
          if (showToast) showToast('Confirmation email sent! Please check your inbox.', 'info');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim()
        });

        if (error) throw error;

        if (showToast) showToast(`Welcome back, ${data.user.email}!`, 'success');
        if (onAuthSuccess) onAuthSuccess(data.user);
        onClose();
      }
    } catch (err) {
      console.error('Supabase Auth error:', err);
      if (showToast) showToast(err.message || 'Authentication failed. Please verify credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isConfigured) {
      if (showToast) showToast('Supabase is not configured yet. Running in Guest Mode.', 'info');
      onClose();
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error('Google OAuth error:', err);
      if (showToast) showToast(err.message || 'Failed to initiate Google OAuth.', 'error');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal-content glass-panel" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '440px',
          padding: '32px',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={18} color="#ffffff" />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
              {mode === 'signin' ? 'Sign In to NoteExtract' : 'Create Cloud Account'}
            </h2>
          </div>
          <button 
            className="btn btn-ghost btn-icon" 
            onClick={onClose}
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Guest Mode Indicator */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: '8px',
          padding: '10px 14px',
          fontSize: '0.8rem',
          color: '#c7d2fe',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px'
        }}>
          <Sparkles size={16} color="#818cf8" style={{ flexShrink: 0 }} />
          <span>
            <strong>Guest Mode active</strong>: You can explore all math proofs and RAG search without signing in. Sign in to enable permanent cloud sync.
          </span>
        </div>

        {!isConfigured && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '0.8rem',
            color: '#fde68a',
            marginBottom: '16px'
          }}>
            Supabase keys not yet configured. Connect your Supabase project URL to activate cloud authentication.
          </div>
        )}

        {successMsg ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <CheckCircle2 size={42} color="#34d399" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
              Check your inbox!
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              {successMsg}
            </p>
            <button
              className="btn btn-secondary"
              style={{ marginTop: '16px' }}
              onClick={() => { setMode('signin'); setSuccessMsg(''); }}
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <>
            {/* Google 1-Click OAuth */}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleGoogleLogin}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              margin: '16px 0',
              color: 'var(--text-dim)',
              fontSize: '0.75rem'
            }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
              <span style={{ padding: '0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or email</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
                  <input
                    type="email"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@university.edu"
                    required
                    style={{ width: '100%', paddingLeft: '38px', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
                  <input
                    type="password"
                    className="input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    style={{ width: '100%', paddingLeft: '38px', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: '8px',
                  marginTop: '8px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'signin' ? 'Sign In' : 'Create Free Account'}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Mode */}
            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {mode === 'signin' ? (
                <span>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    Create Account
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    Sign In
                  </button>
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
