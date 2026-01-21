-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Outbreaks Table
CREATE TABLE IF NOT EXISTS public.outbreaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    disease_name TEXT NOT NULL,
    region TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('monitoring', 'active', 'resolved')),
    start_date DATE NOT NULL,
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Outbreak Metrics Table (Time-Series)
CREATE TABLE IF NOT EXISTS public.outbreak_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    outbreak_id UUID REFERENCES public.outbreaks(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    cases INT DEFAULT 0,
    severity_score FLOAT CHECK (severity_score >= 0 AND severity_score <= 10),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. News Sources Table
CREATE TABLE IF NOT EXISTS public.news_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    outbreak_id UUID REFERENCES public.outbreaks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    source TEXT NOT NULL,
    url TEXT NOT NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Literature Table
CREATE TABLE IF NOT EXISTS public.literature (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    outbreak_id UUID REFERENCES public.outbreaks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    journal TEXT,
    year INT,
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.outbreaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbreak_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.literature ENABLE ROW LEVEL SECURITY;

-- Create Policies (Public Read, Service Role Write)
-- Outbreaks
CREATE POLICY "Public outbreaks are viewable by everyone" ON public.outbreaks
    FOR SELECT USING (true);

-- Metrics
CREATE POLICY "Public metrics are viewable by everyone" ON public.outbreak_metrics
    FOR SELECT USING (true);

-- News
CREATE POLICY "Public news are viewable by everyone" ON public.news_sources
    FOR SELECT USING (true);

-- Literature
CREATE POLICY "Public literature are viewable by everyone" ON public.literature
    FOR SELECT USING (true);
