// src/lib/chart/indicatorRegistry.ts

export type DataStatus = "observed" | "modeled" | "simulated";

export interface IndicatorMeta {
    id: string;
    label: string;
    unit: string;

    // Chart behavior
    scale: "linear" | "log";
    normalization: "none" | "per_100k" | "percentage" | "index";
    recommendedAxis: "shared" | "secondary";

    // Mock fallback (ONLY used if no real data ingestion)
    mockRange: [number, number];
    availableYears: [number, number];

    // 🔑 DATA SEMANTICS (SOURCE OF TRUTH)
    dataStatus: DataStatus;
    source: string;
}

export const indicatorRegistry: Record<string, IndicatorMeta> = {
    /* ======================================================
       🟠 DENGUE INCIDENCE — MODELED
       ====================================================== */
    dengue_incidence: {
        id: "dengue_incidence",
        label: "Dengue incidence",
        unit: "cases per 100k",
        scale: "linear",
        normalization: "per_100k",
        recommendedAxis: "shared",
        mockRange: [100, 5000],
        availableYears: [1990, 2019],

        // IHME GBD = modeled epidemiological estimates
        dataStatus: "modeled",
        source: "Institute for Health Metrics and Evaluation (IHME), Global Burden of Disease (GBD)",
    },

    /* ======================================================
       🟢 LIFE EXPECTANCY — OBSERVED
       ====================================================== */
    life_expectancy: {
        id: "life_expectancy",
        label: "Life expectancy",
        unit: "years",
        scale: "linear",
        normalization: "none",
        recommendedAxis: "shared",
        mockRange: [40, 85],
        availableYears: [1950, 2023],

        // UN demographic observations
        dataStatus: "observed",
        source: "United Nations, via Our World in Data",
    },

    /* ======================================================
       🟡 HIV PREVALENCE — SIMULATED (TEMPORARY)
       ====================================================== */
    hiv_prevalence: {
        id: "hiv_prevalence",
        label: "HIV prevalence",
        unit: "%",
        scale: "linear",
        normalization: "percentage",
        recommendedAxis: "secondary",
        mockRange: [0.1, 15],
        availableYears: [1990, 2020],

        // Placeholder until ingestion pipeline is added
        dataStatus: "simulated",
        source: "Internal simulation (no live ingestion yet)",
    },

    /* ======================================================
       🟡 TB MORTALITY — SIMULATED (BLOCKED SOURCE)
       ====================================================== */
    tb_mortality: {
        id: "tb_mortality",
        label: "TB mortality",
        unit: "deaths per 100k",
        scale: "linear",
        normalization: "per_100k",
        recommendedAxis: "shared",
        mockRange: [5, 50],
        availableYears: [2000, 2021],

        // OWID endpoint exists but CSV is non-redistributable (403)
        dataStatus: "simulated",
        source: "Simulated (OWID source non-redistributable)",
    },
};

/* ======================================================
   SAFE ACCESSOR
====================================================== */
export const getIndicatorMeta = (id: string | null): IndicatorMeta | null => {
    if (!id) return null;
    return indicatorRegistry[id] ?? null;
};
