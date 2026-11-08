# NoteExtract AI — Frontend Single Page Application

Modern, high-performance web client for **NoteExtract AI**, built with **React 19**, **Vite 6**, and **Tailwind CSS**. Designed with an ultra-responsive Glassmorphism dark aesthetic, live mathematical typesetting via **KaTeX**, and interactive diagrams via **Mermaid.js**.

[![Live Frontend on Vercel](https://img.shields.io/badge/Vercel-Live%20Deployment-black?style=for-the-badge&logo=vercel)](https://notesextract-ai.vercel.app/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

---

## 🎨 UI Architecture & Design System

* **Dark Glassmorphism**: Tailored with semi-transparent surfaces (`backdrop-filter: blur(16px)`), subtle neon indigo/cyan accents, and high-contrast typography.
* **Native KaTeX Mathematical Typesetting**: Real-time rendering of inline math (`$E=mc^2$`) and display equations (`$$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$`).
* **Mermaid.js Architecture Flowcharts**: Automatically identifies fenced ````mermaid```` code blocks in OCR output and compiles them into zoomable, interactive SVG diagrams.
* **3-Way Verification Layout**:
  * `Notes Only`: 100% full-width, distraction-free reading and editing mode.
  * `Split View`: Synchronized 50/50 comparison comparing transcribed markdown against the original handwriting photo.
  * `Photo Only`: High-resolution canvas for zooming in on intricate diagrams and handwritten annotations.

---

## 📁 Component Hierarchy & Directory Structure

```text
frontend/
├── public/                # Static assets, favicons, logos
├── src/
│   ├── components/
│   │   ├── App.jsx                     # Root application container & modal coordinator
│   │   ├── Sidebar.jsx                 # Adaptive workspace navigation, tools & cloud indicator
│   │   ├── Navbar.jsx                  # Topbar search, view switcher pills & AI Hub shortcut
│   │   ├── NoteCard.jsx                # Single note card with tag badges & favorite toggle
│   │   ├── NotebookCard.jsx            # Multi-page notebook card with page count badge
│   │   ├── NoteModal.jsx               # Note detail modal (3-way layout & KaTeX live preview)
│   │   ├── NotebookReaderModal.jsx     # Interactive multi-page notebook reader & carousel
│   │   ├── NotebookBatchUploader.jsx   # Drag-and-drop batch photo & PDF uploader
│   │   ├── GlobalWorkspaceChatModal.jsx# Grounded Federated RAG Knowledge Hub (Ctrl+K)
│   │   ├── LLMOpsModal.jsx             # Real-time latency, request volume & telemetry profiler
│   │   ├── MathViewer.jsx              # Isolated KaTeX mathematical rendering component
│   │   ├── MermaidViewer.jsx           # Dynamic Mermaid.js SVG compiler component
│   │   ├── ImageUploader.jsx           # Single-photo dropzone with live preview
│   │   ├── ManualNoteModal.jsx         # Clean text/markdown note composer
│   │   ├── StatsBar.jsx                # Workspace statistics and tag filters
│   │   ├── Toast.jsx                   # Non-blocking animated toast alerts
│   │   └── AuthModal.jsx               # Supabase cloud authentication modal
│   ├── services/
│   │   ├── api.js                      # Centralized API service with AbortController timeouts
│   │   └── supabaseClient.js           # Supabase client singleton for optional cloud sync
│   ├── index.css                       # Global styles, variables, typography, and utility classes
│   └── main.jsx                        # React 19 DOM entrypoint
├── index.html                          # HTML shell with Google Fonts and KaTeX stylesheets
├── vercel.json                         # Monorepo proxy rewrite rules to Render backend
├── vite.config.js                      # Vite build configuration with React plugin
└── package.json                        # Frontend dependencies and build scripts
```

---

## ⚡ Performance & Network Resilience

* **Timeout & Abort Handling**: Network requests in `services/api.js` use `AbortController` timeouts tailored by request type:
  * Health probes: **8 seconds**
  * Fast CRUD operations: **15 seconds**
  * Multimodal AI & OCR batch uploads: **90–120 seconds**
* **Self-Healing Cloud Health Monitor**: Tracks backend connection states (`online`, `cold_start`, `connecting`, `offline`) and automatically polls the Render backend until active.
* **Monorepo Proxy Rewrites (`vercel.json`)**: All `/api/*` endpoints are rewritten to the backend API at the Vercel edge, eliminating CORS preflight overhead:
  ```json
  {
    "rewrites": [
      {
        "source": "/api/:path*",
        "destination": "https://notesai-backend-i1u8.onrender.com/api/:path*"
      },
      {
        "source": "/(.*)",
        "destination": "/index.html"
      }
    ]
  }
  ```

---

## 🛠️ Local Development & Build Scripts

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Runs the Vite development server with Hot Module Replacement (HMR) at `http://127.0.0.1:5173`.

### 3. Production Build
```bash
npm run build
```
Compiles and tree-shakes the application into optimized static assets in `dist/`.

### 4. Preview Production Build
```bash
npm run preview
```

### 5. Linting
```bash
npm run lint
```
Runs high-performance Oxlint rules across the codebase.

---

## 🔐 Environment Variables

Create a `.env` file in `frontend/` (optional for local development):

```env
# Optional: Override the backend API destination (defaults to /api proxy or http://127.0.0.1:5000)
VITE_API_URL=http://127.0.0.1:5000

# Optional: Supabase credentials for cloud authentication and cross-device sync
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

*Note: For the Gemini API, user keys can be set directly through the UI via the **Gemini API Key** button in the sidebar and are kept securely in browser `localStorage` without cloud transmission.*
