import { NextResponse } from 'next/server';
import newsData from '@/lib/data/news.json';

export async function GET() {
    return NextResponse.json(newsData);
}
