import { NextResponse } from "next/server";
import { getIndicatorData } from "@/lib/data/service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const indicator = searchParams.get("indicator");
    const region = searchParams.get("region");
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!indicator || !region) {
        return NextResponse.json(
            { error: "Missing required params: indicator, region" },
            { status: 400 }
        );
    }

    const yearRange = (start && end)
        ? [Number(start), Number(end)] as [number, number]
        : undefined;

    const data = await getIndicatorData(indicator, region, yearRange);

    if (!data) {
        return NextResponse.json(
            { error: `No data found for ${indicator} in ${region}` },
            { status: 404 }
        );
    }

    return NextResponse.json(data);
}
