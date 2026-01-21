-- Create public_news_feed table
CREATE TABLE IF NOT EXISTS public_news_feed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    source TEXT NOT NULL, -- 'WHO', 'CDC', 'ECDC'
    published_at TIMESTAMPTZ NOT NULL,
    
    -- Original Content (for reference)
    original_snippet TEXT,

    -- AI Enriched Content
    ai_headline TEXT,
    ai_summary TEXT, -- 2-3 sentences
    ai_why_this_matters TEXT, -- 1 sentence explanation
    ai_processed BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public_news_feed ENABLE ROW LEVEL SECURITY;

-- Policy: Public Read Access (Unauthenticated)
CREATE POLICY "Public read access"
    ON public_news_feed FOR SELECT
    USING (true);

-- Policy: Service Role Write Access
CREATE POLICY "Service role write access"
    ON public_news_feed FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create index on published_at for sorting
CREATE INDEX idx_public_news_feed_published_at ON public_news_feed(published_at DESC);
