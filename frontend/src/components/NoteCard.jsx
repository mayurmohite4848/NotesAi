import React, { useState } from 'react';
import { 
  Star, 
  Trash2, 
  Tag, 
  Calendar, 
  FileText, 
  Sparkles, 
  Image as ImageIcon,
  Download,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';

export default function NoteCard({ note, onClick, onSelect, onToggleFavorite, onDelete, showToast }) {
  const isFav = !!note.is_favorite;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return isNaN(date) ? dateStr : date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleCardClick = () => {
    if (onClick) onClick(note);
    else if (onSelect) onSelect(note);
  };

  const [downloading, setDownloading] = useState(false);
  const [downloadingMd, setDownloadingMd] = useState(false);

  const handleDownloadPdf = async (e) => {
    e.stopPropagation();
    setDownloading(true);
    try {
      if (showToast) showToast('Compiling printable PDF with ReportLab...', 'info');
      const filename = await api.downloadNotePdf(note.id, note.title);
      if (showToast) showToast(`Downloaded ${filename}!`, 'success');
    } catch (err) {
      console.error('NoteCard download error:', err);
      if (showToast) showToast(err.message || 'Failed to download PDF.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadMd = async (e) => {
    e.stopPropagation();
    setDownloadingMd(true);
    try {
      const filename = await api.downloadNoteMd(note.id, note.title);
      if (showToast) showToast(`Downloaded ${filename}!`, 'success');
    } catch (err) {
      console.warn('Backend note MD export failed, generating locally:', err);
      try {
        const clientMd = `# ${note.title || 'Untitled Note'}\n\n${note.content || note.extracted_text || ''}`;
        const blob = new Blob([clientMd], { type: 'text/markdown;charset=utf-8' });
        const cleanTitle = (note.title || 'note').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
        const filename = `${cleanTitle}.md`;
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          try {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
          } catch (_) {}
        }, 10000);
        if (showToast) showToast(`Downloaded ${filename}!`, 'success');
      } catch (localErr) {
        if (showToast) showToast(err.message || 'Failed to download Markdown.', 'error');
      }
    } finally {
      setDownloadingMd(false);
    }
  };

  return (
    <div 
      className="glass-panel glass-panel-hover"
      onClick={handleCardClick}
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        position: 'relative',
        minHeight: '220px',
        border: isFav ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-subtle)'
      }}
    >
      {/* Top Bar: Title & Favorite */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '10px'
        }}>
          <h3 style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {note.title || 'Untitled Note'}
          </h3>

          <button
            className="btn btn-ghost btn-icon"
            style={{ 
              color: isFav ? '#fbbf24' : 'var(--text-dim)', 
              padding: '4px',
              marginTop: '-4px'
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleFavorite) onToggleFavorite(note.id, !isFav);
            }}
            title={isFav ? "Unfavorite" : "Favorite"}
          >
            <Star size={18} fill={isFav ? '#fbbf24' : 'none'} />
          </button>
        </div>

        {/* Note Body Text */}
        <p style={{
          fontSize: '0.88rem',
          lineHeight: '1.6',
          color: 'var(--text-muted)',
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          marginBottom: '16px',
          whiteSpace: 'pre-line'
        }}>
          {note.content || note.extracted_text || 'No content.'}
        </p>
      </div>

      {/* Footer Meta & Tags */}
      <div>
        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            marginBottom: '12px'
          }}>
            {note.tags.slice(0, 3).map((t, idx) => (
              <span key={idx} className="tag-badge">
                #{t}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="tag-badge" style={{ color: 'var(--text-dim)' }}>
                +{note.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Bottom Info Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '10px',
          fontSize: '0.75rem',
          color: 'var(--text-dim)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={13} />
            <span>{formatDate(note.created_at)}</span>
            {note.image_filename && (
              <span title="Contains original photo" style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--accent-secondary)' }}>
                <ImageIcon size={13} />
                <span>Photo</span>
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              className="btn btn-ghost btn-icon"
              style={{ color: '#818cf8', padding: '4px' }}
              onClick={handleDownloadPdf}
              disabled={downloading}
              title="Download Note PDF"
            >
              {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            </button>

            <button
              className="btn btn-ghost btn-icon"
              style={{ color: 'var(--text-muted)', padding: '4px' }}
              onClick={handleDownloadMd}
              disabled={downloadingMd}
              title="Download Note Markdown (.md)"
            >
              {downloadingMd ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
            </button>

            <button
              className="btn btn-ghost btn-icon"
              style={{ color: 'var(--text-dim)', padding: '4px' }}
              onClick={(e) => {
                e.stopPropagation();
                if (onDelete) onDelete(note.id);
              }}
              title="Delete Note"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
