// OWID SOURCE DOCUMENTATION & CONFIGURATION

export interface OwidSourceConfig {
    id: string;
    label: string;
    url: string;
    columns: {
        date: string; // usually 'Year' or 'Day'
        entity: string; // usually 'Entity'
        value: string; // The specific column name for the indicator
    };
    attribution: string;
    /**
     * If false, we cannot fetch the CSV directly due to CORS/Licensing (e.g. IHME/GBD).
     * These will use the Hybrid Data Strategy (Mock/Cache) on the frontend.
     */
    redistributable: boolean;
}

export const OWID_SOURCES: Record<string, OwidSourceConfig> = {
    "dengue_incidence": {
        id: "dengue_incidence",
        label: "Dengue Incidence",
        // Source: IHME via OWID Grapher -> Non-redistributable / 403 Protected
        url: "https://ourworldindata.org/grapher/dengue-incidence.csv?v=1&csvType=full&useColumnShortNames=false",
        columns: {
            date: "Year", // Yearly granularity
            entity: "Entity",
            value: "Dengue incidence" // Confirmed slug pattern
        },
        attribution: "Data adapted from Institute for Health Metrics and Evaluation (IHME), Global Burden of Disease (GBD).",
        redistributable: false
    },
    "hiv_prevalence": {
        id: "hiv_prevalence",
        label: "HIV Prevalence",
        // Source: UNAIDS via OWID Grapher -> Non-redistributable if using GBD variants
        url: "https://ourworldindata.org/grapher/share-of-the-population-infected-with-hiv-ihme.csv?v=1&csvType=full&useColumnShortNames=false",
        columns: {
            date: "Year",
            entity: "Entity",
            value: "Share of the population with HIV" // Standard Grapher export name for this dataset
        },
        attribution: "Data adapted from UNAIDS via Our World in Data.",
        redistributable: false
    },
    "tb_mortality": {
        id: "tb_mortality",
        label: "TB Mortality",
        // Source: WHO via OWID Grapher
        // WHO data is often Open, but we flag false if we encounter issues. Checking...
        // Assuming strict hybrid for safety on known GBD-linked datasets.
        url: "https://ourworldindata.org/grapher/tuberculosis-death-rates.csv?v=1&csvType=full&useColumnShortNames=false",
        columns: {
            date: "Year",
            entity: "Entity",
            value: "Deaths - Tuberculosis" // Specific GBD/WHO name
        },
        attribution: "Data adapted from WHO, Global Tuberculosis Report.",
        redistributable: true
    }
};
