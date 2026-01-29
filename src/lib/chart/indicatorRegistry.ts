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

    // ⚙️ INGESTION CONFIG (New V1.5)
    ingestion: {
        type: "local_ihme" | "owid_csv" | "world_bank" | "simulation";
        param?: string; // filename, slug, or api code
    };
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
        ingestion: {
            type: "local_ihme",
            param: "dengue_incidence_{REGION}.json" // Dynamic: replaced by Adapter
        }
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
        ingestion: {
            type: "owid_csv",
            param: "life-expectancy" // OWID Grapher Slug
        }
    },

    /* ======================================================
       🔴 HIV/AIDS INCIDENCE — MODELED
       ====================================================== */
    hiv_incidence: {
        id: "hiv_incidence",
        label: "HIV/AIDS incidence",
        unit: "new cases per 100k",
        scale: "linear",
        normalization: "per_100k",
        recommendedAxis: "shared",
        mockRange: [10, 100],
        availableYears: [1990, 2023],

        // IHME GBD (Observed + Modeled)
        dataStatus: "modeled",
        source: "IHME, Global Burden of Disease (GBD 2023)",
        ingestion: {
            type: "local_ihme",
            param: "hiv_incidence_{REGION}.json"
        }
    },

    /* ======================================================
       🟡 TB MORTALITY — SIMULATED (BLOCKED SOURCE)
       ====================================================== */
    /* ======================================================
       🔴 MALARIA INCIDENCE — MODELED
       ====================================================== */
    malaria_incidence: {
        id: "malaria_incidence",
        label: "Malaria incidence",
        unit: "new cases per 100k",
        scale: "linear",
        normalization: "per_100k",
        recommendedAxis: "shared",
        mockRange: [0, 5000],
        availableYears: [1990, 2021],

        // IHME GBD (Observed + Modeled)
        dataStatus: "modeled",
        source: "IHME, Global Burden of Disease (GBD 2021)",
        ingestion: {
            type: "local_ihme",
            param: "malaria_incidence.json" // Single multi-region file
        }
    },

    /* ======================================================
       🟣 ZIKA INCIDENCE — MODELED
       ====================================================== */
    zika_incidence: {
        id: "zika_incidence",
        label: "Zika incidence",
        unit: "new cases per 100k",
        scale: "linear",
        normalization: "per_100k",
        recommendedAxis: "shared",
        mockRange: [0, 100],
        availableYears: [1990, 2019],

        // IHME GBD (Observed + Modeled)
        dataStatus: "modeled",
        source: "IHME, Global Burden of Disease (GBD 2019)",
        ingestion: {
            type: "local_ihme",
            param: "zika_incidence.json" // Single multi-region file
        }
    },

    /* ======================================================
       🔴 TUBERCULOSIS INCIDENCE — MODELED
       ====================================================== */
    tb_incidence: {
        id: "tb_incidence",
        label: "Tuberculosis incidence",
        unit: "new cases per 100k",
        scale: "linear",
        normalization: "per_100k",
        recommendedAxis: "shared",
        mockRange: [50, 250],
        availableYears: [1990, 2023],

        // IHME GBD (Observed + Modeled)
        dataStatus: "modeled",
        source: "IHME, Global Burden of Disease (GBD 2023)",
        ingestion: {
            type: "local_ihme",
            param: "tb_incidence_{REGION}.json"
        }
    },
};

/* ======================================================
   SAFE ACCESSOR
====================================================== */
export const getIndicatorMeta = (id: string | null): IndicatorMeta | null => {
    if (!id) return null;
    return indicatorRegistry[id] ?? null;
};
