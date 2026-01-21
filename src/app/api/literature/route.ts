import { NextResponse } from 'next/server';
import litData from '@/lib/data/literature.json';

export async function GET() {
    return NextResponse.json(litData);
}
