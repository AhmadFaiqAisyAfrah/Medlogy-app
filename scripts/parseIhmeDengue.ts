// scripts/parseIhmeDengue.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/* =========================================
   ESM SAFE __dirname
========================================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =========================================
   PATHS
========================================= */
const RAW_DIR = path.join(
    __dirname,
    "..",
    "src",
    "lib",
    "data",
    "ihme",
    "raw"
);

const INPUT_CSV = path.join(
    RAW_DIR,
    "IHME-GBD_2023_DENGUE_INDONESIA.csv"
);

const OUTPUT_JSON = path.join(
    RAW_DIR,
    "ihme_dengue_indonesia.json"
);

/* =========================================
   CSV PARSER
========================================= */
function parseCSV(csv: string) {
    const lines = csv.trim().split(/\r?\n/);
    const header = lines.shift()!.split(",");

    return lines.map((line) => {
        const cols = line.split(",");
        const row: Record<string, string> = {};
        header.forEach((h, i) => {
            row[h.trim()] = (cols[i] ?? "").trim();
        });
        return row;
    });
}

/* =========================================
   MAIN
========================================= */
if (!fs.existsSync(INPUT_CSV)) {
    console.error("❌ CSV not found:", INPUT_CSV);
    process.exit(1);
}

const csv = fs.readFileSync(INPUT_CSV, "utf-8");
const rows = parseCSV(csv);

/* ---- parse numeric rows ---- */
const parsed = rows
    .map((r) => {
        const year = Number(r.year);
        const value = Number(r.val);
        const upper = Number(r.upper);
        const lower = Number(r.lower);

        if (
            Number.isNaN(year) ||
            Number.isNaN(value) ||
            Number.isNaN(upper) ||
            Number.isNaN(lower)
        ) {
            return null;
        }

        return { year, value, upper, lower };
    })
    .filter((v): v is {
        year: number;
        value: number;
        upper: number;
        lower: number;
    } => v !== null);

/* ---- sort SAFELY ---- */
parsed.sort((a, b) => a.year - b.year);

if (parsed.length === 0) {
    console.error("❌ Parsed data is EMPTY. Check CSV format.");
    process.exit(1);
}

/* ---- build json ---- */
const json = {
    indicator: "dengue_incidence",
    region: "Indonesia",
    unit: "cases per 100k",
    dataStatus: "modeled",
    source: "IHME – Global Burden of Disease (GBD 2023)",
    data: parsed,
};

fs.writeFileSync(OUTPUT_JSON, JSON.stringify(json, null, 2));

console.log("✅ IHME Dengue JSON generated successfully");
console.log("➡", OUTPUT_JSON);
console.log(
    `Years: ${parsed[0].year} – ${parsed[parsed.length - 1].year}`
);
