// DB Types matching Supabase Schema
export interface Region {
    id: string;
    name: string;
    country: string;
    lat: number;
    lon: number;
    active: boolean;
    created_at: string;
}

export interface Outbreak {
    id: string;
    region_id: string;
    title: string;
    pathogen: string;
    location_country: string;
    location_city: string | null;
    start_date: string;
    status: 'monitoring' | 'resolved';
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    summary_text: string | null;
    created_at: string;
}

export interface CaseTimeseries {
    id: string;
    outbreak_id: string;
    date: string;
    active_cases: number;
    recovered: number;
    critical: number;
    positivity_rate: number | null;
    created_at: string;
}

export interface NewsSignal {
    id: string;
    outbreak_id: string;
    source: string;
    title: string;
    summary: string | null;
    signal_level: 'low' | 'medium' | 'high';
    published_at: string;
    created_at: string;
}

export interface ResearchSource {
    id: string;
    outbreak_id: string;
    title: string;
    authors: string | null;
    journal: string | null;
    year: number | null;
    url: string | null;
    relevance_note: string | null;
    created_at: string;
}

export interface InsightSummary {
    id: string;
    outbreak_id: string;
    summary_points: string[]; // JSONB array of strings
    confidence_level: number | null;
    generated_at: string;
}

export interface SignalMetric {
    outbreak_id: string;
    date: string;
    daily_news_count: number;
    source_diversity_count: number;
    severity_score: number;
    last_updated: string;
}

export interface PolicyStatus {
    id: string;
    outbreak_id: string;
    monitoring_level: 'routine' | 'enhanced' | 'active_response';
    advisory_code: 'green' | 'yellow' | 'orange' | 'red';
    generated_at: string;
    reasoning: string;
    recommended_actions: string[]; // JSONB array
}

// Supabase Database Type Wrapper
export interface Database {
    public: {
        Tables: {
            regions: {
                Row: Region;
                Insert: Omit<Region, 'id' | 'created_at'>;
                Update: Partial<Omit<Region, 'id' | 'created_at'>>;
            };
            outbreaks: {
                Row: Outbreak;
                Insert: Omit<Outbreak, 'id' | 'created_at'>;
                Update: Partial<Omit<Outbreak, 'id' | 'created_at'>>;
            };
            case_timeseries: {
                Row: CaseTimeseries;
                Insert: Omit<CaseTimeseries, 'id' | 'created_at'>;
                Update: Partial<Omit<CaseTimeseries, 'id' | 'created_at'>>;
            };
            news_signals: {
                Row: NewsSignal;
                Insert: Omit<NewsSignal, 'id' | 'created_at'>;
                Update: Partial<Omit<NewsSignal, 'id' | 'created_at'>>;
            };
            research_sources: {
                Row: ResearchSource;
                Insert: Omit<ResearchSource, 'id' | 'created_at'>;
                Update: Partial<Omit<ResearchSource, 'id' | 'created_at'>>;
            };
            insight_summaries: {
                Row: InsightSummary;
                Insert: Omit<InsightSummary, 'id' | 'created_at'>;
                Update: Partial<Omit<InsightSummary, 'id' | 'created_at'>>;
            };
            policy_status: {
                Row: PolicyStatus;
                Insert: Omit<PolicyStatus, 'id' | 'generated_at'>;
                Update: Partial<Omit<PolicyStatus, 'id' | 'generated_at'>>;
            };
            public_news_feed: {
                Row: PublicNewsItem;
                Insert: Omit<PublicNewsItem, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<PublicNewsItem, 'id' | 'created_at' | 'updated_at'>>;
            };
        };
        Views: {
            signal_metrics: {
                Row: SignalMetric;
            };
        };
    };
}

export interface PublicNewsItem {
    id: string;
    title: string;
    url: string;
    source: 'WHO' | 'CDC' | 'ECDC';
    published_at: string;
    original_snippet: string | null;
    ai_headline: string | null;
    ai_summary: string | null;
    ai_why_this_matters: string | null;
    ai_processed: boolean;
    created_at: string;
    updated_at: string;
}

// Frontend Adapters (for compatibility with UI components)
// We Map DB Types to these UI-expected types in the Page
export type OutbreakScenario = Scenario;

export interface Scenario {
    scenarioId: string;
    name: string;
    startDate: string;
    location: string;
    pathogen: {
        name: string;
        strain: string;
        type: string;
        r0_initial: number;
        r0_current: number;
    };
    status: string;
    description: string;
    phases: { day: number; name: string; description: string }[];
}

export interface EpiPoint {
    date: string;
    cases: number;
    deaths: number;
    recovered: number;
    hospitalized: number;
    positivity_rate: number;
}

export interface NewsArticle {
    id: string;
    date: string;
    source: string;
    title: string;
    summary: string;
    sentiment: 'positive' | 'neutral' | 'negative' | 'serious'; // Mapped from signal_level
    relevance_score: number;
}

export interface JournalArticle {
    id: string;
    title: string;
    journal: string;
    authors: string[];
    date: string;
    type: string;
    abstract: string;
    key_findings: string[];
    url: string;
}
