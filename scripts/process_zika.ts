
import * as fs from 'fs';
import * as path from 'path';

// CONFIG
const INPUT_CSV = path.join(process.cwd(), 'IHME Sources', 'Zika virus.csv');
const OUTPUT_JSON = path.join(process.cwd(), 'src', 'lib', 'data', 'ihme', 'processed', 'zika_incidence.json');

// TYPES
interface Point {
    year: number;
    value: number;
}

interface MultiRegionJson {
    indicator: string;
    unit: string;
    regions: Record<string, { data: Point[] }>;
}

// MAIN
function main() {
    console.log(`Reading CSV: ${INPUT_CSV}`);
    const content = fs.readFileSync(INPUT_CSV, 'utf-8');
    const lines = content.split('\n');

    const headers = parseCSVLine(lines[0]);
    // Find needed indices
    const idx = {
        location: headers.indexOf('location_name'),
        year: headers.indexOf('year'),
        val: headers.indexOf('val'),
        measure: headers.indexOf('measure_name'),
        metric: headers.indexOf('metric_name'),
        sex: headers.indexOf('sex_name'),
        age: headers.indexOf('age_name')
    };

    console.log("Indices:", idx);

    // MAPPINGS
    // Map CSV location names to our IDs
    const regionData: Record<string, Point[]> = {};
    const regionNames = new Set<string>();

    let count = 0;
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const row = parseCSVLine(line);
        if (row.length < headers.length) continue;

        // FILTERS
        // measure_name = Incidence
        // metric_name = Rate
        // sex_name = Both
        // age_name = All ages
        if (row[idx.measure] !== 'Incidence') continue;
        if (row[idx.metric] !== 'Rate') continue;
        if (row[idx.sex] !== 'Both') continue;
        if (row[idx.age] !== 'All ages') continue;

        // EXTRACT
        const locName = row[idx.location];
        const year = parseInt(row[idx.year]);
        const val = parseFloat(row[idx.val]);

        // NORMALIZE REGION KEY
        let regionKey = locName;
        if (locName === 'Global') regionKey = 'Global';
        else if (locName === 'Indonesia') regionKey = 'IDN';
        else {
            regionNames.add(locName); // Track provinces
        }

        if (!regionData[regionKey]) {
            regionData[regionKey] = [];
        }

        regionData[regionKey].push({ year, value: val });
        count++;
    }

    console.log(`Processed ${count} data points.`);
    console.log(`Found ${regionNames.size} provinces:`, Array.from(regionNames).sort());

    // SORT DATA BY YEAR & FORMAT
    const regionsOutput: Record<string, { data: Point[] }> = {};
    for (const [key, points] of Object.entries(regionData)) {
        points.sort((a, b) => a.year - b.year);
        regionsOutput[key] = { data: points };
    }

    const output: MultiRegionJson = {
        indicator: "zika_incidence",
        unit: "new cases per 100k",
        regions: regionsOutput
    };

    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(output, null, 4));
    console.log(`Wrote JSON to ${OUTPUT_JSON}`);
}


// SIMPLE CSV PARSER (Handles quoted commas)
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuote = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);

    // Remove quotes if present
    return result.map(s => {
        s = s.trim();
        if (s.startsWith('"') && s.endsWith('"')) {
            return s.substring(1, s.length - 1);
        }
        return s;
    });
}

main();
