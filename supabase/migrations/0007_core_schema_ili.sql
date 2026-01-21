-- Migration 0007: Core Schema - ILI Monitoring (Jakarta Seed)

-- 1. Create Tables

-- Outbreaks: The core entity tracking a disease event
CREATE TABLE IF NOT EXISTS public.outbreaks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    pathogen TEXT NOT NULL,
    location_country TEXT NOT NULL,
    location_city TEXT,
    start_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('monitoring', 'resolved')),
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    summary_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Case Timeseries: Daily statistics for the outbreak
CREATE TABLE IF NOT EXISTS public.case_timeseries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    outbreak_id UUID REFERENCES public.outbreaks(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    active_cases INTEGER DEFAULT 0,
    recovered INTEGER DEFAULT 0,
    critical INTEGER DEFAULT 0,
    positivity_rate FLOAT, -- Stored as percentage e.g. 5.5
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- News Signals: External media reports correlated with the outbreak
CREATE TABLE IF NOT EXISTS public.news_signals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    outbreak_id UUID REFERENCES public.outbreaks(id) ON DELETE CASCADE NOT NULL,
    source TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    signal_level TEXT NOT NULL CHECK (signal_level IN ('low', 'medium', 'high')),
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Research Sources: Academic/Scientific backing
CREATE TABLE IF NOT EXISTS public.research_sources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    outbreak_id UUID REFERENCES public.outbreaks(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    authors TEXT,
    journal TEXT,
    year INTEGER,
    url TEXT,
    relevance_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Insight Summaries: Synthesized intelligence points
CREATE TABLE IF NOT EXISTS public.insight_summaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    outbreak_id UUID REFERENCES public.outbreaks(id) ON DELETE CASCADE NOT NULL,
    summary_points JSONB NOT NULL, -- Array of strings
    confidence_level FLOAT CHECK (confidence_level >= 0 AND confidence_level <= 1.0),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Security (Row Level Security)

-- Enable RLS
ALTER TABLE public.outbreaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_timeseries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insight_summaries ENABLE ROW LEVEL SECURITY;

-- Read-Only Policy for Authenticated Users
CREATE POLICY "Authenticated users can read outbreaks" ON public.outbreaks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read case_timeseries" ON public.case_timeseries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read news_signals" ON public.news_signals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read research_sources" ON public.research_sources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read insight_summaries" ON public.insight_summaries FOR SELECT TO authenticated USING (true);

-- No INSERT/UPDATE policies defined for 'authenticated' (Standard users are Read-Only)

-- 3. Seed Data (ILI – Jakarta)

DO $$
DECLARE
    v_outbreak_id UUID;
BEGIN
    -- Insert Outbreak
    INSERT INTO public.outbreaks (title, pathogen, location_country, location_city, start_date, status, risk_level, summary_text)
    VALUES (
        'ILI Monitoring – Jakarta, Indonesia',
        'Influenza A (H3N2) Variant',
        'Indonesia',
        'Jakarta',
        (NOW() - INTERVAL '14 days')::DATE,
        'monitoring',
        'high',
        'Sustained increase in Influenza-like Illness (ILI) reported across major Jakarta hospitals. Correlation with seasonal flooding and high density urban clusters.'
    )
    RETURNING id INTO v_outbreak_id;

    -- Insert Case Timeseries (14 days increasing)
    INSERT INTO public.case_timeseries (outbreak_id, date, active_cases, recovered, critical, positivity_rate)
    VALUES 
        (v_outbreak_id, (NOW() - INTERVAL '14 days')::DATE, 45, 12, 2, 3.2),
        (v_outbreak_id, (NOW() - INTERVAL '13 days')::DATE, 62, 20, 3, 3.5),
        (v_outbreak_id, (NOW() - INTERVAL '12 days')::DATE, 78, 30, 4, 3.9),
        (v_outbreak_id, (NOW() - INTERVAL '11 days')::DATE, 95, 45, 5, 4.2),
        (v_outbreak_id, (NOW() - INTERVAL '10 days')::DATE, 120, 55, 6, 4.8),
        (v_outbreak_id, (NOW() - INTERVAL '9 days')::DATE, 150, 70, 8, 5.2),
        (v_outbreak_id, (NOW() - INTERVAL '8 days')::DATE, 185, 90, 10, 5.8),
        (v_outbreak_id, (NOW() - INTERVAL '7 days')::DATE, 230, 110, 12, 6.5),
        (v_outbreak_id, (NOW() - INTERVAL '6 days')::DATE, 280, 130, 15, 7.1),
        (v_outbreak_id, (NOW() - INTERVAL '5 days')::DATE, 340, 160, 18, 7.8),
        (v_outbreak_id, (NOW() - INTERVAL '4 days')::DATE, 410, 200, 22, 8.5),
        (v_outbreak_id, (NOW() - INTERVAL '3 days')::DATE, 490, 240, 26, 9.2),
        (v_outbreak_id, (NOW() - INTERVAL '2 days')::DATE, 580, 290, 30, 9.8),
        (v_outbreak_id, (NOW() - INTERVAL '1 days')::DATE, 650, 350, 35, 10.5);

    -- Insert News Signals
    INSERT INTO public.news_signals (outbreak_id, source, title, summary, signal_level, published_at)
    VALUES
        (v_outbreak_id, 'Local Health Reports', 'Early signs of respiratory surge in South Jakarta clinics', 'Community clinics report 20% increase in patient visits for cough and fever symptoms.', 'low', NOW() - INTERVAL '10 days'),
        (v_outbreak_id, 'Jakarta Globe', 'Hospitals prepare for seasonal flu peak amidst flood warnings', 'DOH warns of potential vector-borne and respiratory coinfections.', 'medium', NOW() - INTERVAL '5 days'),
        (v_outbreak_id, 'The Jakarta Post', 'Alert: Unusual viral pneumonia clusters detected in high-density zones', 'Epidemiologists flag anomaly in standard seasonal pattern. Sequencing underway.', 'high', NOW() - INTERVAL '12 hours');

    -- Insert Research Sources
    INSERT INTO public.research_sources (outbreak_id, title, authors, journal, year, url, relevance_note)
    VALUES
        (v_outbreak_id, 'Evolution of Influenza A(H3N2) Viruses in 2 Consecutive Seasons of Genomic Surveillance', 'Merel E. A. et al.', 'Open Forum Infectious Diseases', 2024, 'https://academic.oup.com/ofid/article/11/8/ofae434/7740417', 'Matches strain characteristics observed in current cluster.'),
        (v_outbreak_id, 'Monitoring of human enteric viruses and coliform bacteria in waters after urban flood in Jakarta', 'Phanuwan C. et al.', 'Water Science and Technology', 2006, 'https://pubmed.ncbi.nlm.nih.gov/16889260/', 'Provides predictive modeling baseline for the current region.');

    -- Insert Insight Summary
    INSERT INTO public.insight_summaries (outbreak_id, summary_points, confidence_level)
    VALUES (
        v_outbreak_id,
        jsonb_build_array(
            'Rapid 14-day escalation in active cases correlates with recent flooding events.',
            'Positivity rate has nearly tripled (3.2% to 10.5%) suggesting substantial under-testing.',
            'Cluster characteristics match emerging H3N2 variant described in recent regional surveillance.',
            'Immediate risk upgraded to HIGH due to strain on critical care capacity in referenced urban zones.'
        ),
        0.78
    );

END $$;
