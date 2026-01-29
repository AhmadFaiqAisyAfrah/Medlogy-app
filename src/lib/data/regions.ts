
/**
 * Maps display names (UI) to internal data codes (File/API).
 * Source of truth for region normalization.
 */
export const REGION_ISO_MAP: Record<string, string> = {
    "Indonesia": "IDN",
    "Global": "Global",
    "Jakarta": "Jakarta", // Or specific code if needed
    "Bali": "Bali"
};


/**
 * Resolves a human-readable region name to its data code.
 * E.g. "Indonesia" -> "IDN"
 * Defaults to returning the input if no map found.
 */
export function resolveRegionCode(name: string): string {
    return REGION_ISO_MAP[name] || name;
}

/**
 * List of regions available in the UI Dropdown.
 * Generated from IHME data + Standard defaults.
 */
export const uiAvailableRegions = [
    "Global",
    "Indonesia",
    // Provinces (Alphabetical)
    "Aceh",
    "Bali",
    "Bangka-Belitung Islands",
    "Banten",
    "Bengkulu",
    "Central Java",
    "Central Kalimantan",
    "Central Sulawesi",
    "East Java",
    "East Kalimantan",
    "East Nusa Tenggara",
    "Gorontalo",
    "Jakarta",
    "Jambi",
    "Lampung",
    "Maluku",
    "North Kalimantan",
    "North Maluku",
    "North Sulawesi",
    "North Sumatra",
    "Papua",
    "Riau",
    "Riau Islands",
    "South Kalimantan",
    "South Sulawesi",
    "South Sumatra",
    "Southeast Sulawesi",
    "West Java",
    "West Kalimantan",
    "West Nusa Tenggara",
    "West Papua",
    "West Sulawesi",
    "West Sumatra",
    "Yogyakarta"
];
