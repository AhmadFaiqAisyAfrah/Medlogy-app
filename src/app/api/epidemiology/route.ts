import { NextResponse } from 'next/server';
import { getHistoricalData } from '@/lib/external/diseaseSh';
import { EpiPoint } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Fetch historical data for Indonesia (last 30 days) as a proxy for the 'Scenario'
        const historical = await getHistoricalData('Indonesia', 30);
        const timeline = historical.timeline;
        const dates = Object.keys(timeline.cases);

        // Helper to normalize M/D/YY to YYYY-MM-DD
        const normalizeDate = (d: string) => {
            const parts = d.split('/');
            if (parts.length === 3) {
                const m = parts[0].padStart(2, '0');
                const day = parts[1].padStart(2, '0');
                const y = '20' + parts[2];
                return `${y}-${m}-${day}`;
            }
            return new Date(d).toISOString().split('T')[0];
        };

        const epiData: EpiPoint[] = dates.map(dateStr => {
            return {
                date: normalizeDate(dateStr),
                cases: timeline.cases[dateStr] || 0,
                deaths: timeline.deaths[dateStr] || 0,
                recovered: timeline.recovered[dateStr] || 0,
                hospitalized: 0, // Not available in simple historical data
                positivity_rate: 0 // Not available in simple historical data
            };
        });

        // Sort by date ascending
        epiData.sort((a, b) => a.date.localeCompare(b.date));

        return NextResponse.json(epiData);
    } catch (error) {
        console.error('Failed to fetch external epidemiology data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
