import { NextResponse } from 'next/server';

export async function GET() {
    // Mock synthesis response
    const report = {
        generatedAt: new Date().toISOString(),
        headline: "Rapidly Evolving Influenza B Cluster in Jakarta",
        summary: "Current data indicates a novel Influenza B strain with heightened transmissibility (R0 > 1.4). Hospitalizations are tracking above seasonal baselines. Genomic markers suggest potential vaccine escape.",
        riskLevel: "High",
        keyInsights: [
            "Case trajectory exceeds 3-year seasonal average by 40%.",
            "News and Social signals correlate with a localized outbreak in South Jakarta.",
            "Early literature suggests a mismatch with the current trivalent vaccine."
        ]
    };
    return NextResponse.json(report);
}
