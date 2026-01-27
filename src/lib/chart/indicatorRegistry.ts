// src/lib/chart/indicatorRegistry.ts

export interface IndicatorMeta {
    id: string;
    label: string;
    unit: string;
    scale: "linear" | "log";
    normalization: "none" | "per_100k" | "percentage" | "index";
    recommendedAxis: "shared" | "secondary";
    mockRange: [number, number];
    availableYears: [number, number];
}

export const indicatorRegistry: Record<string, IndicatorMeta> = {
    dengue_incidence: {
        id: "dengue_incidence",
        label: "Dengue incidence",
        unit: "cases per 100k",
        scale: "linear",
        normalization: "per_100k",
        recommendedAxis: "shared",
        mockRange: [100, 5000],
        availableYears: [1990, 2019],
    },

    life_expectancy: {
        id: "life_expectancy",
        label: "Life expectancy",
        unit: "years",
        scale: "linear",
        normalization: "none",
        recommendedAxis: "shared",
        mockRange: [40, 85],
        availableYears: [1950, 2023],
    },

    hiv_prevalence: {
        id: "hiv_prevalence",
        label: "HIV prevalence",
        unit: "%",
        scale: "linear",
        normalization: "percentage",
        recommendedAxis: "secondary",
        mockRange: [0.1, 15],
        availableYears: [1990, 2020],
    },

    tb_mortality: {
        id: "tb_mortality",
        label: "TB mortality",
        unit: "deaths per 100k",
        scale: "linear",
        normalization: "per_100k",
        recommendedAxis: "shared",
        mockRange: [5, 50],
        availableYears: [2000, 2021],
    },
};

export const getIndicatorMeta = (id: string | null): IndicatorMeta | null => {
    if (!id) return null;
    return indicatorRegistry[id] ?? null;
};
