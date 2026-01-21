import { EpiPoint, JournalArticle, NewsArticle, Scenario } from './types';

export type IntelligenceReport = any;

declare const process: any;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export async function getActiveScenario(): Promise<Scenario> {
    const res = await fetch(`${API_BASE}/api/scenario/active`);
    if (!res.ok) throw new Error('Failed to fetch scenario');
    return res.json();
}

export async function getEpidemiologyData(): Promise<EpiPoint[]> {
    const res = await fetch(`${API_BASE}/api/epidemiology`);
    if (!res.ok) throw new Error('Failed to fetch epidemiology data');
    return res.json();
}

export async function getCorrelatedNews(): Promise<NewsArticle[]> {
    const res = await fetch(`${API_BASE}/api/news/correlated`);
    if (!res.ok) throw new Error('Failed to fetch news');
    return res.json();
}

export async function getScientificLiterature(): Promise<JournalArticle[]> {
    const res = await fetch(`${API_BASE}/api/literature`);
    if (!res.ok) throw new Error('Failed to fetch literature');
    return res.json();
}

export async function generateSynthesizedReport(): Promise<IntelligenceReport> {
    const res = await fetch(`${API_BASE}/api/reports/synthesized`);
    if (!res.ok) throw new Error('Failed to fetch report');
    return res.json();
}
