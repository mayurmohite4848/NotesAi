const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Helper to handle fetch responses and error reporting
 */
async function request(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, options);
  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }
  return data;
}

export const api = {
  // Image URL resolver for local proxy or production backend
  getImageUrl(path) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
      return path;
    }
    return `${API_BASE}${path}`;
  },

  // Check API status
  async checkHealth() {
    return request('/api/health');
  },

  // Verify Gemini API key with Google AI Studio
  async verifyKey(apiKey) {
    return request('/api/verify-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey })
    });
  },

  // ==========================================
  // SINGLE NOTES API
  // ==========================================

  async getNotes({ search = '', tag = '', favorite = false, sortBy = 'created_at', order = 'desc' } = {}) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (tag) params.append('tag', tag);
    if (favorite) params.append('favorite', 'true');
    if (sortBy) params.append('sort_by', sortBy);
    if (order) params.append('order', order);

    const queryString = params.toString();
    const url = `/api/notes${queryString ? `?${queryString}` : ''}`;
    return request(url);
  },

  async getNoteById(id) {
    return request(`/api/notes/${id}`);
  },

  async createNote(noteData) {
    return request('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteData)
    });
  },

  async batchCreateNotes(notesArray) {
    return request('/api/notes/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: notesArray })
    });
  },

  async updateNote(id, noteData) {
    return request(`/api/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteData)
    });
  },

  async deleteNote(id) {
    return request(`/api/notes/${id}`, {
      method: 'DELETE'
    });
  },

  getNoteExportPdfUrl(noteId) {
    return `${API_BASE}/api/notes/${noteId}/export-pdf`;
  },

  getNoteExportMdUrl(noteId) {
    return `${API_BASE}/api/notes/${noteId}/export-md`;
  },

  async enhanceNoteAI(id) {
    return request(`/api/notes/${id}/enhance-ai`, {
      method: 'POST'
    });
  },

  async uploadImage(file, { autoSave = false, title = '', content = '' } = {}) {
    const formData = new FormData();
    formData.append('file', file);
    if (autoSave) formData.append('auto_save', 'true');
    if (title) formData.append('title', title);
    if (content) formData.append('content', content);

    const apiKey = (localStorage.getItem('gemini_api_key') || '').trim();
    const headers = {};
    if (apiKey) {
      formData.append('gemini_api_key', apiKey);
      headers['X-Gemini-Key'] = apiKey;
    }

    return request('/api/upload', {
      method: 'POST',
      headers,
      body: formData
    });
  },

  // ==========================================
  // MULTI-PAGE NOTEBOOKS API
  // ==========================================

  async getNotebooks({ search = '', subject = '' } = {}) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (subject) params.append('subject', subject);
    const qs = params.toString();
    return request(`/api/notebooks${qs ? `?${qs}` : ''}`);
  },

  async getNotebookById(id) {
    return request(`/api/notebooks/${id}`);
  },

  async createNotebook(data) {
    return request('/api/notebooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  async updateNotebook(id, data) {
    return request(`/api/notebooks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  async deleteNotebook(id) {
    return request(`/api/notebooks/${id}`, {
      method: 'DELETE'
    });
  },

  async uploadNotebookBatch(files, { title = '', description = '', subject_tag = 'General', cover_color = '#6366f1' } = {}) {
    const formData = new FormData();
    for (const f of files) {
      formData.append('files', f);
    }
    formData.append('title', title);
    formData.append('description', description);
    formData.append('subject_tag', subject_tag);
    formData.append('cover_color', cover_color);

    const apiKey = (localStorage.getItem('gemini_api_key') || '').trim();
    const headers = {};
    if (apiKey) {
      formData.append('gemini_api_key', apiKey);
      headers['X-Gemini-Key'] = apiKey;
    }

    return request('/api/notebooks/upload-batch', {
      method: 'POST',
      headers,
      body: formData
    });
  },

  async addNotebookPages(notebookId, files) {
    const formData = new FormData();
    for (const f of files) {
      formData.append('files', f);
    }
    const apiKey = (localStorage.getItem('gemini_api_key') || '').trim();
    const headers = {};
    if (apiKey) {
      formData.append('gemini_api_key', apiKey);
      headers['X-Gemini-Key'] = apiKey;
    }

    return request(`/api/notebooks/${notebookId}/pages`, {
      method: 'POST',
      headers,
      body: formData
    });
  },

  async addNotebookPage(notebookId, { title = '', content = '', file = null } = {}) {
    const apiKey = (localStorage.getItem('gemini_api_key') || '').trim();

    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      if (title) formData.append('title', title);
      if (apiKey) formData.append('gemini_api_key', apiKey);

      return request(`/api/notebooks/${notebookId}/pages`, {
        method: 'POST',
        headers: apiKey ? { 'X-Gemini-Key': apiKey } : {},
        body: formData
      });
    } else {
      return request(`/api/notebooks/${notebookId}/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
    }
  },

  async updateNotebookPage(notebookId, pageId, data) {
    return request(`/api/notebooks/${notebookId}/pages/${pageId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  async deleteNotebookPage(notebookId, pageId) {
    return request(`/api/notebooks/${notebookId}/pages/${pageId}`, {
      method: 'DELETE'
    });
  },

  async reorderNotebookPages(notebookId, pageIds) {
    return request(`/api/notebooks/${notebookId}/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page_ids: pageIds })
    });
  },

  getExportPdfUrl(notebookId) {
    return `${API_BASE}/api/notebooks/${notebookId}/export-pdf`;
  },

  getExportMdUrl(notebookId) {
    return `${API_BASE}/api/notebooks/${notebookId}/export-md`;
  },

  /**
   * Universal File Downloader
   * First attempts in-memory Blob stream with Content-Disposition parsing.
   * If any network/CORS restriction interrupts blob reading, falls back to direct anchor download.
   */
  async downloadBlob(url, defaultFilename = 'document') {
    const fullUrl = `${API_BASE}${url.startsWith('/') ? url : `/${url}`}`;
    try {
      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      let filename = defaultFilename;
      try {
        const disposition = response.headers.get('Content-Disposition') || response.headers.get('content-disposition');
        if (disposition && disposition.includes('filename=')) {
          const match = disposition.match(/filename=["']?([^"';]+)["']?/i);
          if (match && match[1]) {
            filename = match[1].trim();
          }
        }
      } catch (e) {
        // use defaultFilename
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 3000);
      return filename;
    } catch (err) {
      console.warn('Blob streaming failed, using direct anchor fallback:', err);
      const fallbackLink = document.createElement('a');
      fallbackLink.href = fullUrl;
      fallbackLink.download = defaultFilename;
      fallbackLink.target = '_blank';
      fallbackLink.rel = 'noopener noreferrer';
      document.body.appendChild(fallbackLink);
      fallbackLink.click();
      document.body.removeChild(fallbackLink);
      return defaultFilename;
    }
  },

  async downloadNotePdf(noteId, title = 'note') {
    const clean = (title || 'note').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    return this.downloadBlob(`/api/notes/${noteId}/export-pdf`, `${clean}.pdf`);
  },

  async downloadNoteMd(noteId, title = 'note') {
    const clean = (title || 'note').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    return this.downloadBlob(`/api/notes/${noteId}/export-md`, `${clean}.md`);
  },

  async downloadNotebookPdf(notebookId, title = 'notebook') {
    const clean = (title || 'notebook').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    return this.downloadBlob(`/api/notebooks/${notebookId}/export-pdf`, `${clean}.pdf`);
  },

  async downloadNotebookMd(notebookId, title = 'notebook') {
    const clean = (title || 'notebook').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    return this.downloadBlob(`/api/notebooks/${notebookId}/export-md`, `${clean}.md`);
  },

  // Grounded RAG Notebook Chat API
  async chatWithNotebook(notebookId, message, { currentPage = null, scope = 'all_pages' } = {}) {
    const apiKey = (localStorage.getItem('gemini_api_key') || '').trim();
    const headers = { 'Content-Type': 'application/json' };
    if (apiKey) {
      headers['X-Gemini-Key'] = apiKey;
    }

    return request(`/api/notebooks/${notebookId}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        message, 
        current_page: currentPage,
        scope,
        gemini_api_key: apiKey 
      })
    });
  },

  async getNotebookChatHistory(notebookId) {
    return request(`/api/notebooks/${notebookId}/chat`);
  },

  async clearNotebookChatHistory(notebookId) {
    return request(`/api/notebooks/${notebookId}/chat`, {
      method: 'DELETE'
    });
  },

  async getRelatedNotebooks(notebookId) {
    return request(`/api/notebooks/${notebookId}/related`);
  },

  // ==========================================
  // GLOBAL WORKSPACE FEDERATED RAG CHAT API
  // ==========================================

  async chatWithWorkspace(message) {
    const apiKey = (localStorage.getItem('gemini_api_key') || '').trim();
    const headers = { 'Content-Type': 'application/json' };
    if (apiKey) {
      headers['X-Gemini-Key'] = apiKey;
    }

    return request('/api/workspace/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, gemini_api_key: apiKey })
    });
  },

  async getWorkspaceChatHistory() {
    return request('/api/workspace/chat');
  },

  async clearWorkspaceChatHistory() {
    return request('/api/workspace/chat', {
      method: 'DELETE'
    });
  },

  // Global Statistics
  async getStats() {
    return request('/api/stats');
  },

  // ==========================================
  // LLMOPS TELEMETRY & OBSERVABILITY API
  // ==========================================

  async getTelemetryStats() {
    return request('/api/telemetry/stats');
  },

  async getTelemetryLogs(limit = 50) {
    return request(`/api/telemetry/logs?limit=${limit}`);
  },

  async clearTelemetryLogs() {
    return request('/api/telemetry/logs', {
      method: 'DELETE'
    });
  },

  // ==========================================
  // DEMO SAMPLES & TEST DATA API
  // ==========================================

  async seedDemoSamples() {
    return request('/api/demo/seed', {
      method: 'POST'
    });
  },

  async clearDemoSamples() {
    return request('/api/demo/clear', {
      method: 'DELETE'
    });
  }
};


