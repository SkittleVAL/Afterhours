-- ==============================================================================
-- AFTERHOURS DATABASE SCHEMA (PostgreSQL / Supabase)
-- Robust schema with Row-Level Security (RLS), indexes, and auto-updated timestamps
-- ==============================================================================

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    theme TEXT DEFAULT 'nocturne' CHECK (theme IN ('nocturne', 'obsidian', 'twilight')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 2. SAVED ITEMS
CREATE TABLE IF NOT EXISTS public.saved_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('music', 'game', 'movie', 'place', 'other')),
    artwork_url TEXT,
    fallback_gradient TEXT,
    external_provider TEXT NOT NULL CHECK (external_provider IN ('spotify', 'steam', 'tmdb', 'google_maps', 'apple_music', 'custom')),
    external_url TEXT NOT NULL,
    external_id TEXT,
    personal_notes TEXT,
    tags TEXT[] DEFAULT '{}',
    rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
    status TEXT NOT NULL DEFAULT 'want' CHECK (status IN ('want', 'experiencing', 'completed', 'archived')),
    is_favorite BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. COLLECTIONS
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    icon TEXT,
    category TEXT DEFAULT 'mixed',
    is_favorite BOOLEAN DEFAULT FALSE,
    is_private BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 4. COLLECTION ITEMS (M:N JOIN TABLE)
CREATE TABLE IF NOT EXISTS public.collection_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    saved_item_id UUID NOT NULL REFERENCES public.saved_items(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    added_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    UNIQUE (collection_id, saved_item_id)
);

-- 5. PROVIDER CONNECTIONS
CREATE TABLE IF NOT EXISTS public.provider_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('spotify', 'steam', 'tmdb', 'google_maps')),
    is_connected BOOLEAN DEFAULT FALSE,
    account_name TEXT,
    account_id TEXT,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    last_synced_at TIMESTAMPTZ,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    UNIQUE (user_id, provider)
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_saved_items_user_category ON public.saved_items(user_id, category);
CREATE INDEX IF NOT EXISTS idx_saved_items_status ON public.saved_items(user_id, status);
CREATE INDEX IF NOT EXISTS idx_collections_user ON public.collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_col ON public.collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_item ON public.collection_items(saved_item_id);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_connections ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- Profiles: Anyone can view public profile, only owner can update
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Saved Items: Users only have access to their own saved items
CREATE POLICY "Users can manage their own saved items" 
    ON public.saved_items FOR ALL USING (auth.uid() = user_id);

-- Collections: Users can manage their own, and view non-private collections
CREATE POLICY "Users can manage their own collections" 
    ON public.collections FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public collections" 
    ON public.collections FOR SELECT USING (is_private = false);

-- Collection items
CREATE POLICY "Users can manage items in their collections" 
    ON public.collection_items FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.collections WHERE collections.id = collection_items.collection_id AND collections.user_id = auth.uid()));

-- Provider connections: STRICTLY PRIVATE TO OWNER
CREATE POLICY "Users can only access their own provider credentials" 
    ON public.provider_connections FOR ALL USING (auth.uid() = user_id);
