-- Create signal_metrics VIEW for Data Enrichment
-- Aggregates news signals by outbreak and date to provide context volume/sentiment.

CREATE OR REPLACE VIEW signal_metrics AS
SELECT 
    outbreak_id,
    DATE(published_at) as date,
    COUNT(*) as daily_news_count,
    COUNT(DISTINCT source) as source_diversity_count,
    SUM(CASE WHEN signal_level = 'high' THEN 3 WHEN signal_level = 'medium' THEN 2 ELSE 1 END) as severity_score,
    MAX(published_at) as last_updated
FROM news_signals
GROUP BY outbreak_id, DATE(published_at);

-- Grant access to authenticated users
GRANT SELECT ON signal_metrics TO authenticated;
GRANT SELECT ON signal_metrics TO service_role;
