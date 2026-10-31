# NoteExtract AI — Multi-Modal Document Intelligence & Grounded RAG Platform

[![Live Frontend on Vercel](https://img.shields.io/badge/Vercel-Live%20Demo-black?style=for-the-badge&logo=vercel)](https://notesextract-ai.vercel.app/)
[![Backend API on Render](https://img.shields.io/badge/Render-Cloud%20API-46E3B7?style=for-the-badge&logo=render)](https://notesai-backend-i1u8.onrender.com/api/health)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL%20Mode-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Gemini 3.6 Flash](https://img.shields.io/badge/Gemini-3.6%20Flash%20API-8E75C4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![ReportLab](https://img.shields.io/badge/ReportLab-Vector%20PDF-E05D44?style=for-the-badge)](https://www.reportlab.com/)

> **NoteExtract AI** transforms messy handwritten photos, whiteboard sketches, and scanned PDFs into clean, structured digital notes and multi-page notebooks. It provides an enterprise-grade **Grounded Federated RAG (Retrieval-Augmented Generation)** knowledge hub that answers questions across your entire library with **exact page-level source citations**.

---

## 🌐 Live Production Deployments

| Component | Platform | URL | Status |
| :--- | :--- | :--- | :--- |
| **Web Frontend (SPA)** | **Vercel** | [https://notesextract-ai.vercel.app/](https://notesextract-ai.vercel.app/) | ![Vercel Deployment](https://img.shields.io/badge/Status-Online-34d399) |
| **Backend REST API** | **Render** | [https://notesai-backend-i1u8.onrender.com/](https://notesai-backend-i1u8.onrender.com/api/health) | ![Render Cloud](https://img.shields.io/badge/Status-Healthy%20(v2.0)-34d399) |

*Note: The free Render backend enters sleep mode when idle. A built-in client-side awakening indicator gracefully notifies visitors while the instance warms up (~30–45s).*

---

## 🌟 Key Features

### 1. 🧠 Grounded Federated RAG Knowledge Hub (`Ctrl+K`)
* **Multi-Document Reasoning**: Search and chat across all your single notes and multi-page notebooks simultaneously.
* **Clickable Source Citations**: AI answers include interactive badges (e.g. `[Deep Learning | Page 2]` or `[Note: Math Physics]`). Clicking a badge instantly flips the reader to the exact source page with an animated locator banner.
* **Pre-Built Synthesizer Prompts**: 1-click prompts for cross-subject synthesis, formula extraction, multi-subject study quizzes, and exam cheat sheets.

### 2. ⚡ 1-Click Instant Demo Showcase
* Recruiter and interviewer-ready: new visitors can click **`⚡ Try Samples`** to instantly populate rich sample notes (with KaTeX physics formulas and interactive Mermaid architecture flowcharts) and a 3-page Deep Learning research notebook without having to upload photos.

### 3. 📖 Multi-Page Notebooks & PDF Processing
* **Batch Photo & PDF Ingestion**: Upload a multi-page PDF or a batch of handwritten notes; the system splits, extracts, and organizes them into an interactive notebook.
* **Vector PDF & Markdown Export**: 1-click export generating printable, publication-quality PDFs with custom styling and Table of Contents using **ReportLab**, or consolidated `.md` bundles.

### 4. 📐 Native LaTeX (KaTeX) & Mermaid Diagram Rendering
* Handwritten equations and math symbols automatically render via KaTeX (e.g. Euler's formula $e^{i\pi} + 1 = 0$, Fourier transforms, and neural loss gradients).
* System architecture workflows and mindmaps render into interactive, zoomable SVG diagrams via Mermaid.js.

### 5. 👁️ 3-Way Layout Verification Switcher
* `[ 📝 Notes Only ]`: 100% full-width, distraction-free reading and editing mode.
* `[ 📖 Split View ]`: 50/50 side-by-side verification comparing transcribed notes directly against the original untouched handwritten photo.
* `[ 🖼️ Photo Only ]`: Full-screen high-resolution zoom to inspect intricate diagrams, annotations, and sketches.

### 6. 🛡️ Fault-Tolerant Hybrid Architecture & Telemetry
* **Zero-Downtime Fallback**: If no Gemini API key is provided or the device is offline, NoteExtract AI seamlessly falls back to a local PyTorch EasyOCR engine and keyword-based TF-IDF search.
* **LLMOps Observability Dashboard**: Tracks token latency, model fallback distribution, and error diagnostics in real time.
* **Zero-Trust Client Key Security**: Gemini API keys are stored strictly in browser `localStorage` and passed ephemerally via request headers. Keys are never logged or stored on the backend.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer ["Frontend Layer (Vercel)"]
        UI["React 19 + Vite SPA\n(Glassmorphism Design System)"]
        LocalStorage["Client Storage\n(Encrypted Gemini Key)"]
        MathRender["KaTeX Math Engine\n+ Mermaid.js Diagrams"]
    end

    subgraph EdgeLayer ["Edge & Proxy Layer"]
        VercelRewrite["Vercel Monorepo Rewrites\n/api/* -> Cloud Proxy"]
    end

    subgraph ServerLayer ["Backend Compute Layer (Render)"]
        Gunicorn["Gunicorn WSGI Server\n(Python 3.11+)"]
        Flask["Flask REST Application Factory"]
        AuthMid["Ephemeral API Key Header Interceptor"]
    end

    subgraph IntelligenceLayer ["Multi-Modal AI Inference Router"]
        Router{"Gemini Key Present?"}
        GeminiAPI["Google Gemini 3.6 Flash\nInteractions API (Revision: 2026-05-20)"]
        LocalPyTorch["Local PyTorch EasyOCR\n+ Keyword TF-IDF Fallback"]
    end

    subgraph DataLayer ["Data & Document Compilers"]
        SQLite[("SQLite 3 with WAL Mode\nNotes, Notebooks, Chat History")]
        ReportLab["ReportLab PDF Vector Engine\nPrintable Document Compiler"]
    end

    UI --> LocalStorage
    UI --> MathRender
    UI -->|HTTPS / API Requests| VercelRewrite
    VercelRewrite -->|Proxy| Gunicorn
    Gunicorn --> Flask
    Flask --> AuthMid
    AuthMid --> Router
    Router -->|Yes| GeminiAPI
    Router -->|No / Offline| LocalPyTorch
    Flask --> SQLite
    Flask --> ReportLab
```

---

## 🛠️ Tech Stack & Engineering Decisions

| Layer | Technologies | Rationale & Trade-offs |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Lucide, KaTeX, Mermaid.js | High-performance SPA with zero build overhead, rich typography, and dynamic micro-animations. |
| **Backend** | Python 3.11+, Flask, Gunicorn | Lightweight WSGI microservice architecture optimal for serverless containerized deployment. |
| **Multi-Modal AI** | Google Gemini 3.6 Flash (`Api-Revision: 2026-05-20`) | Native multimodal transcription of handwriting with mathematical formula parsing and contextual grounding. |
| **Offline Fallback** | PyTorch, EasyOCR | Guarantees the application functions 100% locally with zero cloud dependencies or API keys. |
| **Database** | SQLite 3 (WAL Mode) | Zero-configuration ACID database with foreign keys, compound indexes, and persistent conversation memory. |
| **PDF Generation** | ReportLab 4.x, PyPDF 4.x | Programmatic vector PDF compilation with dynamic Table of Contents, page headers, and typography. |
| **Cloud Hosting** | Vercel (Frontend) + Render (Backend) | Free tier deployment with automated GitHub CI/CD and reverse-proxy route rewriting to bypass CORS. |

---

## 🔌 API Reference

### Single Notes
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/notes` | List notes with search, tag filters, favorites, and sorting |
| `POST` | `/api/notes` | Create a plain text note |
| `GET` | `/api/notes/<id>` | Retrieve a note by ID |
| `PUT` | `/api/notes/<id>` | Update note title, content, tags, or favorite status |
| `DELETE`| `/api/notes/<id>` | Delete note and cleanup disk uploads |
| `GET` | `/api/notes/<id>/export-pdf` | Stream printable PDF document |
| `GET` | `/api/notes/<id>/export-md` | Stream Markdown document |
| `POST` | `/api/upload` | Upload image, run OCR transcription, and generate draft note |

### Multi-Page Notebooks
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/notebooks` | List all multi-page notebooks with subject filter |
| `POST` | `/api/notebooks/batch` | Create notebook from batch image uploads or scanned PDF |
| `GET` | `/api/notebooks/<id>` | Retrieve notebook with all pages and cross-notebook links |
| `GET` | `/api/notebooks/<id>/export-pdf`| Compile and download multi-page vector PDF |
| `GET` | `/api/notebooks/<id>/export-md` | Download consolidated Markdown bundle |
| `POST` | `/api/notebooks/<id>/chat` | Grounded RAG chat scoped to notebook with page citations |

### Federated Workspace & Observability
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/workspace/chat` | Cross-notebook Grounded RAG with source attribution |
| `GET` | `/api/workspace/chat` | Retrieve global chat history |
| `DELETE`| `/api/workspace/chat` | Clear global conversation history |
| `GET` | `/api/telemetry/stats` | Retrieve LLMOps latency, fallback counts, and model rates |
| `POST` | `/api/demo/seed` | 1-Click idempotent demo data seeding |
| `DELETE`| `/api/demo/clear` | Clear demo-tagged sample documents |

---

## 🚀 Local Development Setup

### Prerequisites
* **Python**: 3.10 or higher
* **Node.js**: 18.0 or higher

### 1. Clone the Repository
```bash
git clone https://github.com/mayurmohite4848/NotesAi.git
cd NotesAi
```

### 2. Universal 1-Command Launcher
You can boot both the Flask backend and Vite React frontend with a single command:
```bash
python run.py
```
*(On Windows: `py run.py`)*

* **Frontend**: [http://127.0.0.1:5173](http://127.0.0.1:5173)
* **Backend API**: [http://127.0.0.1:5000/api/health](http://127.0.0.1:5000/api/health)

### 3. Running Automated Tests
Run the complete unit and integration test suite:
```bash
python -m unittest discover -s backend/tests
```

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
