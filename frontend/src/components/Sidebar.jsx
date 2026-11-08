import React, { useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  Layers, 
  Globe, 
  Activity, 
  Zap, 
  Key, 
  User, 
  LogOut, 
  Plus, 
  Sparkles, 
  Loader2, 
  Check, 
  AlertCircle, 
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';

export default function Sidebar({
  activeTab = 'notes',
  onChangeTab,
  onNewNote,
  onNewUpload,
  onOpenBatchNotebook,
  onOpenGlobalChat,
  onOpenTelemetry,
  onSeedDemo,
  seedingDemo = false,
  currentUser = null,
  onOpenAuth,
  onSignOut,
  stats = {},
  backendOnline = false,
  backendStatus = 'connecting',
  onRetryConnection,
  isOpen = true,
  onToggle,
  onCloseMobile,
  showToast
}) {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  const handleTestKey = async () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setVerifyResult({ valid: false, message: 'Please enter an API key to test.' });
      return;
    }
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await api.verifyKey(trimmed);
      setVerifyResult({ valid: true, message: res.message || 'Key is valid and active!' });
    } catch (err) {
      setVerifyResult({ valid: false, message: err.message || 'Verification failed. Please check your key.' });
    } finally {
      setVerifying(false);
    }
  };

  const handleSaveKey = () => {
    const trimmed = apiKey.trim();
    if (trimmed) {
      localStorage.setItem('gemini_api_key', trimmed);
      if (showToast) showToast('Gemini API Key saved! Handwriting transcription enabled.', 'success');
    } else {
      localStorage.removeItem('gemini_api_key');
      if (showToast) showToast('Gemini API Key removed. Using local OCR engine.', 'info');
    }
    setShowKeyModal(false);
  };

  const hasKey = !!localStorage.getItem('gemini_api_key');

  const navItemClick = (action) => {
    if (action) action();
    if (onCloseMobile && typeof window !== 'undefined' && window.innerWidth < 1024) {
      onCloseMobile();
    }
  };

  return (
    <>
      <aside className={`app-sidebar ${isOpen ? 'open' : 'collapsed'}`}>
        {/* Brand Header */}
        <div style={{
          padding: '20px 18px 16px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)',
              flexShrink: 0
            }}>
              <BookOpen size={18} color="#ffffff" />
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{ 
                fontSize: '1.05rem', 
                fontWeight: 800, 
                letterSpacing: '-0.02em', 
                color: '#ffffff',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden'
              }}>
                NoteExtract <span style={{ color: 'var(--accent-secondary)' }}>AI</span>
              </div>
              <div style={{ 
                fontSize: '0.66rem', 
                color: 'var(--text-muted)', 
                fontWeight: 500,
                whiteSpace: 'nowrap'
              }}>
                Grounded Notes & RAG
              </div>
            </div>
          </div>

          {/* Close button for mobile or collapse */}
          {onToggle && (
            <button
              className="btn btn-ghost btn-icon desktop-collapse-btn"
              onClick={onToggle}
              title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
              style={{ padding: '6px', color: 'var(--text-dim)' }}
            >
              {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          )}

          {/* Mobile close cross */}
          {onCloseMobile && (
            <button
              className="btn btn-ghost btn-icon mobile-close-btn"
              onClick={onCloseMobile}
              style={{ padding: '6px', color: 'var(--text-dim)' }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Primary Action Buttons */}
        <div style={{ padding: '16px 14px 10px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            id="sidebar-btn-transcribe"
            className="btn btn-primary"
            onClick={() => navItemClick(onNewUpload)}
            style={{
              width: '100%',
              justifyContent: 'flex-start',
              padding: '10px 14px',
              fontSize: '0.86rem',
              fontWeight: 700,
              gap: '9px',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)'
            }}
          >
            <Sparkles size={16} />
            <span>Transcribe Photo</span>
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <button
              id="sidebar-btn-new-notebook"
              className="btn btn-secondary btn-sm"
              onClick={() => navItemClick(onOpenBatchNotebook)}
              style={{
                justifyContent: 'center',
                padding: '7px 8px',
                fontSize: '0.76rem',
                gap: '5px',
                whiteSpace: 'nowrap'
              }}
              title="Batch upload images or multi-page PDF"
            >
              <Layers size={13} color="var(--accent-secondary)" />
              <span>+ Notebook</span>
            </button>

            <button
              id="sidebar-btn-quick-note"
              className="btn btn-secondary btn-sm"
              onClick={() => navItemClick(onNewNote)}
              style={{
                justifyContent: 'center',
                padding: '7px 8px',
                fontSize: '0.76rem',
                gap: '5px',
                whiteSpace: 'nowrap'
              }}
              title="Add a clean Markdown note manually"
            >
              <Plus size={13} color="#818cf8" />
              <span>+ Text Note</span>
            </button>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '10px 12px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '18px' 
        }}>
          {/* Section: Main Workspace Navigation */}
          <div>
            <div style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: 'var(--text-dim)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '0 10px 8px 10px'
            }}>
              Workspace
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <button
                id="sidebar-nav-notes"
                onClick={() => navItemClick(() => onChangeTab && onChangeTab('notes'))}
                className={`sidebar-nav-item ${activeTab === 'notes' ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileText size={16} />
                  <span>Single Notes</span>
                </div>
                <span className="sidebar-badge">
                  {stats?.total_notes || 0}
                </span>
              </button>

              <button
                id="sidebar-nav-notebooks"
                onClick={() => navItemClick(() => onChangeTab && onChangeTab('notebooks'))}
                className={`sidebar-nav-item ${activeTab === 'notebooks' ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Layers size={16} />
                  <span>Notebooks</span>
                </div>
                <span className="sidebar-badge">
                  {stats?.total_notebooks || 0}
                </span>
              </button>

              <button
                id="sidebar-nav-ai-hub"
                onClick={() => navItemClick(onOpenGlobalChat)}
                className="sidebar-nav-item ai-hub-item"
                title="Grounded Cross-Workspace AI Search & Chat (Ctrl+K)"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Globe size={16} color="#67e8f9" />
                  <span style={{ fontWeight: 700, color: '#e0e7ff' }}>AI Hub</span>
                </div>
                <kbd style={{
                  background: 'rgba(0, 0, 0, 0.45)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '4px',
                  padding: '2px 5px',
                  fontSize: '0.64rem',
                  color: 'var(--text-dim)',
                  fontFamily: 'var(--font-mono)'
                }}>
                  Ctrl+K
                </kbd>
              </button>
            </div>
          </div>

          {/* Section: Engines & Tools */}
          <div>
            <div style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: 'var(--text-dim)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '0 10px 8px 10px'
            }}>
              Engines & Tools
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <button
                id="sidebar-tool-samples"
                onClick={() => navItemClick(onSeedDemo)}
                disabled={seedingDemo}
                className="sidebar-nav-item"
                title="Load rich LaTeX math, Mermaid diagrams, and deep learning demo notes"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {seedingDemo ? (
                    <Loader2 size={16} className="animate-spin" color="#fbbf24" />
                  ) : (
                    <Zap size={16} color="#fbbf24" />
                  )}
                  <span>{seedingDemo ? 'Loading...' : 'Try Demo Samples'}</span>
                </div>
              </button>

              <button
                id="sidebar-tool-telemetry"
                onClick={() => navItemClick(onOpenTelemetry)}
                className="sidebar-nav-item"
                title="View LLMOps metrics, OCR confidence, and fallback traces"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Activity size={16} color="#34d399" />
                  <span>LLMOps Telemetry</span>
                </div>
              </button>

              <button
                id="sidebar-tool-apikey"
                onClick={() => {
                  setVerifyResult(null);
                  setShowKeyModal(true);
                }}
                className="sidebar-nav-item"
                title={hasKey ? 'Gemini API key is active' : 'Configure Gemini API Key'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Key size={16} color={hasKey ? '#34d399' : 'currentColor'} />
                  <span>Gemini API Key</span>
                </div>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: hasKey ? '#10b981' : 'var(--text-dim)',
                  boxShadow: hasKey ? '0 0 8px #10b981' : 'none'
                }} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer: Cloud & Auth */}
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(15, 23, 42, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* Cloud Health Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.74rem'
          }}>
            <span style={{ color: 'var(--text-dim)', fontWeight: 500 }}>Cloud Engine</span>
            {backendStatus === 'online' || backendOnline ? (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '0.68rem',
                fontWeight: 700,
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#34d399'
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 6px #10b981'
                }} />
                <span>Render Live</span>
              </span>
            ) : backendStatus === 'connecting' ? (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '0.68rem',
                fontWeight: 700,
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                color: '#fbbf24'
              }}>
                <Loader2 size={10} className="animate-spin" />
                <span>Connecting...</span>
              </span>
            ) : backendStatus === 'cold_start' ? (
              <button
                onClick={onRetryConnection}
                title="Render cloud instance is waking up (~30-45s). Click to test connection."
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  cursor: onRetryConnection ? 'pointer' : 'default',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  color: '#fbbf24'
                }}
              >
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#f59e0b',
                  boxShadow: '0 0 6px #f59e0b'
                }} />
                <span>Waking Up (Retry)</span>
              </button>
            ) : (
              <button
                onClick={onRetryConnection}
                title="Backend server is unreachable. Click to retry connection."
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  cursor: onRetryConnection ? 'pointer' : 'default',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#f87171'
                }}
              >
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#ef4444',
                  boxShadow: '0 0 6px #ef4444'
                }} />
                <span>Offline (Retry)</span>
              </button>
            )}
          </div>

          {/* Supabase User Profile Card */}
          {currentUser ? (
            <div style={{
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  flexShrink: 0
                }}>
                  {currentUser.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#e0e7ff',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden'
                  }}>
                    {currentUser.email?.split('@')[0]}
                  </div>
                  <div style={{ fontSize: '0.64rem', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <ShieldCheck size={11} color="#34d399" />
                    <span>Cloud Sync</span>
                  </div>
                </div>
              </div>

              <button
                className="btn btn-ghost btn-icon"
                onClick={onSignOut}
                title="Sign out of Supabase"
                style={{ padding: '5px', color: 'var(--text-dim)' }}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              id="sidebar-btn-auth"
              className="btn btn-secondary"
              onClick={() => navItemClick(onOpenAuth)}
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '8px 12px',
                fontSize: '0.8rem',
                gap: '7px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.15)'
              }}
            >
              <User size={14} color="#818cf8" />
              <span>Sign In / Cloud Sync</span>
            </button>
          )}
        </div>
      </aside>

      {/* Free Gemini Key Modal */}
      {showKeyModal && (
        <div className="modal-backdrop" onClick={() => setShowKeyModal(false)}>
          <div className="modal-content" style={{ maxWidth: '520px', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Key size={20} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Google Gemini API Key (100% Free)</h3>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowKeyModal(false)}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
              Gemini Flash transcribes messy handwriting into clean English text with LaTeX equations and Mermaid diagrams.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
                Gemini API Key:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="password"
                  className="input"
                  value={apiKey}
                  onChange={e => {
                    setApiKey(e.target.value);
                    setVerifyResult(null);
                  }}
                  placeholder="AIzaSy..."
                  style={{ flex: 1 }}
                />
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={handleTestKey}
                  disabled={verifying || !apiKey.trim()}
                >
                  {verifying ? <Loader2 size={14} className="animate-spin" /> : 'Test Key'}
                </button>
              </div>
              
              {verifyResult && (
                <div style={{
                  marginTop: '10px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  background: verifyResult.valid ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                  color: verifyResult.valid ? '#34d399' : '#fb7185',
                  border: `1px solid ${verifyResult.valid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
                }}>
                  {verifyResult.valid ? <Check size={16} style={{ flexShrink: 0, marginTop: '2px' }} /> : <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />}
                  <span>{verifyResult.message}</span>
                </div>
              )}

              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '8px' }}>
                Don't have a key? Get one for free at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-secondary)', textDecoration: 'underline' }}>Google AI Studio</a>.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowKeyModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleSaveKey}>
                <Check size={14} />
                <span>Save Key</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
