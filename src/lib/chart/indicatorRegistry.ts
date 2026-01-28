// src/lib/chart/indicatorRegistry.ts

/* =========================================
   DATA STATUS ENUM (LOCKED)
========================================= */
export type DataStatus = "observed" | "modeled" | "simulated";

/* =========================================
   INDICATOR META
========================================= */
export interface IndicatorMeta {
    id: string;
    label: string;
    unit: string;

    // Chart behavior
    scale: "linear" | "log";
    normalization: "none" | "per_100k" | "percentage" | "index";
    recommendedAxis: "shared" | "secondary";

    // Temporal bounds
    availableYears: [number, number];

    // Mock fallback only (dev / demo)
    mockRange: [number, number];

    // 🔑 NEW: Scientific metadata
    source: string;
    dataStatus: DataStatus;
}

/* =========================================
   INDICATOR REGISTRY (SINGLE SOURCE OF TRUTH)
========================================= */
export const indicatorRegistry: Record<string, IndicatorMeta> = {
    /* ======================================================
       🟠 DENGUE INCIDENCE — MODELED (IHME / GBD)
       ====================================================== */
    dengue_incidence: {
        id: "dengue_incidence",
        label: "Dengue incidence",
        unit: "cases per 100k",

        scale: "linear",
        normalization: "per_100k",
        recommendedAxis: "shared",

        availableYears: [1990, 2019],
        mockRange: [100, 5000],

        source: "Institute for Health Metrics and Evaluation (IHME), Global Burden of Disease (GBD)",
        dataStatus: "modeled",
    },

    /* ======================================================
       🟢 LIFE EXPECTANCY — OBSERVED (UN / OWID)
       ====================================================== */
    life_expectancy: {
        id: "life_expectancy",
        label: "Life expectancy",
        unit: "years",

        scale: "linear",
        normalization: "none",
        recommendedAxis: "shared",

        availableYears: [1950, 2023],
        mockRange: [40, 85],

        source: "United Nations, via Our World in Data (OWID)",
        dataStatus: "observed",
    },

    /* ======================================================
       🟠 HIV PREVALENCE — MODELED (UNAIDS / GBD VARIANTS)
       ====================================================== */
    hiv_prevalence: {
        id: "hiv_prevalence",
        label: "HIV prevalence",
        unit: "%",

        scale: "linear",
        normalization: "percentage",
        recommendedAxis: "secondary",

        availableYears: [1990, 2020],
        mockRange: [0.1, 15],

        source: "UNAIDS estimates, harmonized via Global Burden of Disease (GBD)",
        dataStatus: "modeled",
    },

    /* ======================================================
       🟢 TB MORTALITY — OBSERVED (WHO)
       ====================================================== */
    tb_mortality: {
        id: "tb_mortality",
        label: "TB mortality",
        unit: "deaths per 100k",

        scale: "linear",
        normalization: "per_100k",
        recommendedAxis: "shared",

        availableYears: [2000, 2021],
        mockRange: [5, 50],

        source: "World Health Organization (WHO)",
        dataStatus: "observed",
    },
};

/* =========================================
   SAFE ACCESSOR
========================================= */
export const getIndicatorMeta = (id: string | null): IndicatorMeta | null => {
    if (!id) return null;
    return indicatorRegistry[id] ?? null;
};
