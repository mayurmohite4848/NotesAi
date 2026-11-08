import React from 'react';
import { 
  Menu, 
  RefreshCw, 
  Sparkles, 
  Plus, 
  Layers, 
  FileText, 
  Globe
} from 'lucide-react';

export default function Navbar({ 
  onToggleSidebar,
  activeTab = 'notes',
  onChangeTab,
  onNewNote, 
  onNewUpload, 
  onOpenBatchNotebook,
  onOpenGlobalChat,
  stats, 
  backendOnline,
  backendStatus = 'connecting',
  onRefresh,
  refreshing 
}) {
  return (
    <header className="app-topbar">
      {/* Left: Mobile/Collapse Menu Toggle & Current Workspace View Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          id="btn-sidebar-toggle"
          className="btn btn-ghost btn-icon"
          onClick={onToggleSidebar}
          title="Toggle Navigation & Tools Sidebar"
          style={{
            padding: '7px 8px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            background: 'rgba(255, 255, 255, 0.04)'
          }}
        >
          <Menu size={18} color="var(--text-main)" />
        </button>

        {/* View Switcher Pills in Topbar */}
        <div style={{
          display: 'flex',
          background: 'rgba(15, 23, 42, 0.65)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          padding: '3px'
        }}>
          <button
            onClick={() => onChangeTab && onChangeTab('notes')}
            style={{
              padding: '5px 12px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeTab === 'notes' ? 'rgba(99, 102, 241, 0.35)' : 'transparent',
              color: activeTab === 'notes' ? '#ffffff' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            <FileText size={14} />
            <span>Single Notes</span>
            <span style={{
              fontSize: '0.7rem',
              padding: '1px 6px',
              borderRadius: '10px',
              background: activeTab === 'notes' ? 'rgba(99, 102, 241, 0.5)' : 'rgba(255, 255, 255, 0.08)'
            }}>
              {stats?.total_notes || 0}
            </span>
          </button>

          <button
            onClick={() => onChangeTab && onChangeTab('notebooks')}
            style={{
              padding: '5px 12px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeTab === 'notebooks' ? 'rgba(99, 102, 241, 0.35)' : 'transparent',
              color: activeTab === 'notebooks' ? '#ffffff' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            <Layers size={14} />
            <span>Notebooks</span>
            <span style={{
              fontSize: '0.7rem',
              padding: '1px 6px',
              borderRadius: '10px',
              background: activeTab === 'notebooks' ? 'rgba(99, 102, 241, 0.5)' : 'rgba(255, 255, 255, 0.08)'
            }}>
              {stats?.total_notebooks || 0}
            </span>
          </button>
        </div>
      </div>

      {/* Center: Search / AI Hub Quick Trigger */}
      <div className="topbar-center-hub">
        <button
          onClick={onOpenGlobalChat}
          className="topbar-ai-pill"
          title="Search across all notebooks & notes with Grounded Federated RAG (Ctrl+K)"
        >
          <Globe size={14} color="#67e8f9" />
          <span>Ask AI Hub across workspace</span>
          <kbd className="topbar-kbd">Ctrl+K</kbd>
        </button>
      </div>

      {/* Right: Quick Action Buttons & Refresh */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {onRefresh && (
          <button
            className="btn btn-ghost btn-icon"
            onClick={onRefresh}
            title="Refresh notes & notebooks from database"
            disabled={refreshing}
            style={{ padding: '7px' }}
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} color="var(--text-dim)" />
          </button>
        )}

        {activeTab === 'notebooks' ? (
          <button 
            id="topbar-btn-new-notebook"
            className="btn btn-primary btn-sm" 
            onClick={onOpenBatchNotebook}
            style={{ whiteSpace: 'nowrap', padding: '6px 14px', fontSize: '0.82rem', gap: '6px' }}
          >
            <Sparkles size={14} />
            <span>+ New Notebook</span>
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button 
              id="topbar-btn-add-text-note"
              className="btn btn-secondary btn-sm" 
              onClick={onNewNote}
              style={{ whiteSpace: 'nowrap', padding: '6px 11px', fontSize: '0.8rem' }}
            >
              + Note
            </button>

            <button 
              id="topbar-btn-transcribe"
              className="btn btn-primary btn-sm" 
              onClick={onNewUpload}
              style={{ whiteSpace: 'nowrap', padding: '6px 13px', fontSize: '0.82rem', gap: '6px' }}
            >
              <Sparkles size={14} />
              <span>Transcribe Photo</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
