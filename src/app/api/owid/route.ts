// app/api/owid/route.ts
import { NextResponse } from "next/server"
import { getCache, setCache } from "./cache" // ✅ TAMBAHAN

/**
 * Mapping internal Medlogy indicator → OWID Grapher slug
 */
const OWID_INDICATOR_MAP: Record<string, string> = {
    life_expectancy: "life-expectancy",
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const indicator = searchParams.get("indicator")
    const region = searchParams.get("region")

    // 1️⃣ Validasi
    if (!indicator || !region) {
        return NextResponse.json(
            { error: { code: "BAD_REQUEST", message: "indicator & region are required" } },
            { status: 400 }
        )
    }

    const slug = OWID_INDICATOR_MAP[indicator]
    if (!slug) {
        return NextResponse.json(
            { error: { code: "NOT_FOUND", message: "Indicator not mapped" } },
            { status: 404 }
        )
    }

    // 🔁 CACHE CHECK (NEW)
    const cacheKey = `${indicator}:${region}`
    const cached = getCache<any>(cacheKey)
    if (cached) {
        return NextResponse.json(cached)
    }

    // 2️⃣ Fetch CSV Grapher
    const url = `https://ourworldindata.org/grapher/${slug}.csv`

    let csvText: string
    try {
        const res = await fetch(url, { cache: "no-store" })
        if (!res.ok) {
            return NextResponse.json(
                { error: { code: "FETCH_FAILED", message: `OWID responded with ${res.status}` } },
                { status: res.status }
            )
        }
        csvText = await res.text()
    } catch {
        return NextResponse.json(
            { error: { code: "FETCH_FAILED", message: "Network error while fetching OWID" } },
            { status: 502 }
        )
    }

    // 3️⃣ Parse CSV
    const lines = csvText.trim().split("\n")
    const headers = lines[0].split(",")

    const idxCode = headers.indexOf("Code")
    const idxYear = headers.indexOf("Year")
    const idxValue = headers.length - 1

    if (idxCode === -1 || idxYear === -1) {
        return NextResponse.json(
            { error: { code: "PARSE_FAILED", message: "Unexpected CSV structure" } },
            { status: 500 }
        )
    }

    const data = lines
        .slice(1)
        .map(line => line.split(","))
        .filter(cols => cols[idxCode] === region && cols[idxValue])
        .map(cols => ({
            date: `${cols[idxYear]}-01-01`,
            value: Number(cols[idxValue]),
        }))
        .filter(d => !Number.isNaN(d.value))

    if (data.length === 0) {
        return NextResponse.json(
            { error: { code: "NO_DATA", message: `No data for region ${region}` } },
            { status: 404 }
        )
    }

    // 4️⃣ Response final
    const response = {
        source: "OWID" as const,
        indicator: indicator.replace("_", " "),
        unit: "",
        data,
    }

    // 🔁 SAVE CACHE (NEW)
    setCache(cacheKey, response)

    return NextResponse.json(response)
}
