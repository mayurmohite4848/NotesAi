-- ==============================================================================
-- NoteExtract AI — Supabase PostgreSQL Schema & Row-Level Security (RLS)
-- Run this script in the Supabase Dashboard -> SQL Editor -> Click "Run"
-- ==============================================================================

-- 1. Enable UUID Extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. NOTEBOOKS TABLE
CREATE TABLE IF NOT EXISTS public.notebooks (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    subject_tag TEXT DEFAULT 'General',
    cover_color TEXT DEFAULT '#6366f1',
    cover_image TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. NOTEBOOK PAGES TABLE
CREATE TABLE IF NOT EXISTS public.notebook_pages (
    id BIGSERIAL PRIMARY KEY,
    notebook_id BIGINT REFERENCES public.notebooks(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    page_number INTEGER DEFAULT 1 NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    image_filename TEXT,
    image_path TEXT,
    cleaned_image_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. SINGLE NOTES TABLE
CREATE TABLE IF NOT EXISTS public.notes (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    extracted_text TEXT,
    image_filename TEXT,
    image_path TEXT,
    cleaned_image_filename TEXT,
    cleaned_image_path TEXT,
    image_metadata JSONB,
    ai_insights JSONB,
    handwriting_style TEXT DEFAULT 'caveat',
    tags JSONB DEFAULT '[]'::jsonb,
    source_image_filename TEXT,
    segment_index INTEGER DEFAULT 0,
    is_favorite BOOLEAN DEFAULT FALSE,
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. WORKSPACE CHAT HISTORY (FOR GROUNDED FEDERATED RAG)
CREATE TABLE IF NOT EXISTS public.workspace_chat_history (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    citations JSONB DEFAULT '[]'::jsonb,
    model_used TEXT DEFAULT 'gemini-3.6-flash',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TELEMETRY LOGS (LLMOps OBSERVABILITY)
CREATE TABLE IF NOT EXISTS public.telemetry_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    model TEXT,
    latency_ms REAL,
    status TEXT,
    token_count INTEGER DEFAULT 0,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- INDEXES FOR SUB-MILLISECOND PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_tags ON public.notes USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_notebooks_user_id ON public.notebooks(user_id);
CREATE INDEX IF NOT EXISTS idx_notebook_pages_notebook_id ON public.notebook_pages(notebook_id);
CREATE INDEX IF NOT EXISTS idx_workspace_chat_user_id ON public.workspace_chat_history(user_id);

-- ==============================================================================
-- 🛡️ ROW-LEVEL SECURITY (RLS) POLICIES
-- Ensures complete multi-tenant isolation between different users
-- ==============================================================================

-- Enable RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notebook_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry_logs ENABLE ROW LEVEL SECURITY;

-- NOTES POLICIES:
-- 1. Users can view their own notes OR public demo notes (is_demo = TRUE)
CREATE POLICY "notes_select_policy" ON public.notes
    FOR SELECT USING (
        auth.uid() = user_id OR is_demo = TRUE OR user_id IS NULL
    );

-- 2. Authenticated users can insert their own notes
CREATE POLICY "notes_insert_policy" ON public.notes
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR user_id IS NULL
    );

-- 3. Users can only update their own notes
CREATE POLICY "notes_update_policy" ON public.notes
    FOR UPDATE USING (
        auth.uid() = user_id
    );

-- 4. Users can only delete their own notes
CREATE POLICY "notes_delete_policy" ON public.notes
    FOR DELETE USING (
        auth.uid() = user_id
    );

-- NOTEBOOKS POLICIES:
CREATE POLICY "notebooks_select_policy" ON public.notebooks
    FOR SELECT USING (
        auth.uid() = user_id OR is_demo = TRUE OR user_id IS NULL
    );

CREATE POLICY "notebooks_insert_policy" ON public.notebooks
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR user_id IS NULL
    );

CREATE POLICY "notebooks_update_policy" ON public.notebooks
    FOR UPDATE USING (
        auth.uid() = user_id
    );

CREATE POLICY "notebooks_delete_policy" ON public.notebooks
    FOR DELETE USING (
        auth.uid() = user_id
    );

-- NOTEBOOK PAGES POLICIES:
CREATE POLICY "notebook_pages_select_policy" ON public.notebook_pages
    FOR SELECT USING (
        auth.uid() = user_id OR user_id IS NULL OR EXISTS (
            SELECT 1 FROM public.notebooks WHERE notebooks.id = notebook_pages.notebook_id AND (notebooks.is_demo = TRUE OR notebooks.user_id IS NULL)
        )
    );

CREATE POLICY "notebook_pages_insert_policy" ON public.notebook_pages
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR user_id IS NULL
    );

CREATE POLICY "notebook_pages_update_policy" ON public.notebook_pages
    FOR UPDATE USING (
        auth.uid() = user_id
    );

CREATE POLICY "notebook_pages_delete_policy" ON public.notebook_pages
    FOR DELETE USING (
        auth.uid() = user_id
    );

-- CHAT HISTORY POLICIES:
CREATE POLICY "chat_select_policy" ON public.workspace_chat_history
    FOR SELECT USING (
        auth.uid() = user_id OR user_id IS NULL
    );

CREATE POLICY "chat_insert_policy" ON public.workspace_chat_history
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR user_id IS NULL
    );

CREATE POLICY "chat_delete_policy" ON public.workspace_chat_history
    FOR DELETE USING (
        auth.uid() = user_id OR user_id IS NULL
    );

-- ==============================================================================
-- 📦 STORAGE BUCKET CREATION (FOR CLOUD HANDWRITING / PDF SCANS)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('note-images', 'note-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Anyone can view note images
CREATE POLICY "Public note images are viewable by everyone" ON storage.objects
    FOR SELECT USING (bucket_id = 'note-images');

-- Storage Policy: Authenticated users & guests can upload note images
CREATE POLICY "Anyone can upload note images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'note-images');
