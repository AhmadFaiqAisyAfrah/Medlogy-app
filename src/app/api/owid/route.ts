// app/api/owid/route.ts
import { NextResponse } from "next/server"

/**
 * Mapping internal Medlogy indicator → OWID Grapher slug
 * NOTE:
 * - Grapher menyediakan CSV publik & stabil
 * - JSON grapher TIDAK publik
 */
const OWID_INDICATOR_MAP: Record<string, string> = {
    life_expectancy: "life-expectancy",
    // nanti:
    // dengue_incidence: "dengue-incidence",
    // tuberculosis_incidence: "tuberculosis-incidence",
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

    // 2️⃣ Fetch CSV Grapher (ENDPOINT RESMI)
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

    // 3️⃣ Parse CSV (minimal & robust)
    const lines = csvText.trim().split("\n")
    const headers = lines[0].split(",")

    const idxEntity = headers.indexOf("Entity")
    const idxCode = headers.indexOf("Code")
    const idxYear = headers.indexOf("Year")
    const idxValue = headers.length - 1 // nilai indikator biasanya kolom terakhir

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

    // 4️⃣ Response sesuai kontrak frontend
    return NextResponse.json({
        source: "OWID",
        indicator: indicator.replace("_", " "),
        unit: "", // unit bisa ditambahkan nanti via registry
        data,
    })
}
