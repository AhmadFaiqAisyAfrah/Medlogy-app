import { NextResponse } from 'next/server';
import scenarioData from '@/lib/data/outbreak_scenario.json';

export async function GET() {
    return NextResponse.json(scenarioData);
}
