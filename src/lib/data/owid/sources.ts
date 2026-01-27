// OWID SOURCE DOCUMENTATION & CONFIGURATION
// This file defines which indicators are allowed to fetch REAL OWID data
// and which must fallback to MOCK due to licensing / redistribution limits.

export interface OwidSourceConfig {
    id: string;
    label: string;
    url: string;
    columns: {
        date: string;    // usually 'Year'
        entity: string;  // usually 'Entity'
        value: string;   // EXACT indicator column name in CSV
    };
    attribution: string;
    /**
     * If false, we cannot redistribute the CSV directly (IHME / GBD / restricted).
     * These indicators will automatically fallback to MOCK in the adapter.
     */
    redistributable: boolean;
}

export const OWID_SOURCES: Record<string, OwidSourceConfig> = {

    /* ======================================================
       ✅ LIFE EXPECTANCY (OPEN / VALIDATION BASELINE)
       ====================================================== */
    life_expectancy: {
        id: "life_expectancy",
        label: "Life expectancy",
        url: "https://ourworldindata.org/grapher/life-expectancy.csv",
        columns: {
            date: "Year",
            entity: "Entity",
            value: "Period life expectancy at birth" // ⬅️ FIX FINAL
        },
        attribution: "Data from United Nations, via Our World in Data.",
        redistributable: true
    },


    /* ======================================================
       ⚠️ DENGUE INCIDENCE (IHME / GBD → NOT REDISTRIBUTABLE)
       ====================================================== */
    dengue_incidence: {
        id: "dengue_incidence",
        label: "Dengue incidence",
        url: "https://ourworldindata.org/grapher/dengue-incidence.csv",
        columns: {
            date: "Year",
            entity: "Entity",
            value: "Dengue incidence"
        },
        attribution:
            "Data adapted from Institute for Health Metrics and Evaluation (IHME), Global Burden of Disease (GBD).",
        redistributable: false
    },

    /* ======================================================
       ⚠️ HIV PREVALENCE (UNAIDS / GBD VARIANTS)
       ====================================================== */
    hiv_prevalence: {
        id: "hiv_prevalence",
        label: "HIV prevalence",
        url: "https://ourworldindata.org/grapher/share-of-the-population-infected-with-hiv-ihme.csv",
        columns: {
            date: "Year",
            entity: "Entity",
            value: "Share of the population with HIV"
        },
        attribution: "Data adapted from UNAIDS via Our World in Data.",
        redistributable: false
    },

    /* ======================================================
       ✅ TB MORTALITY (WHO → REDISTRIBUTABLE)
       ====================================================== */
    tb_mortality: {
        id: "tb_mortality",
        label: "TB mortality",
        url: "https://ourworldindata.org/grapher/tuberculosis-death-rates.csv",
        columns: {
            date: "Year",
            entity: "Entity",
            value: "Deaths - Tuberculosis"
        },
        attribution: "Data from WHO, via Our World in Data.",
        redistributable: true
    }
};
