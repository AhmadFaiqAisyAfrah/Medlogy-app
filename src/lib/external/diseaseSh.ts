
export interface DiseaseShCountry {
    updated: number;
    country: string;
    cases: number;
    todayCases: number;
    deaths: number;
    todayDeaths: number;
    recovered: number;
    todayRecovered: number;
    active: number;
    critical: number;
    casesPerOneMillion: number;
    deathsPerOneMillion: number;
    tests: number;
    testsPerOneMillion: number;
    population: number;
    continent: string;
    oneCasePerPeople: number;
    oneDeathPerPeople: number;
    oneTestPerPeople: number;
    activePerOneMillion: number;
    recoveredPerOneMillion: number;
    criticalPerOneMillion: number;
}

export interface DiseaseShGlobal {
    updated: number;
    cases: number;
    todayCases: number;
    deaths: number;
    todayDeaths: number;
    recovered: number;
    todayRecovered: number;
    active: number;
    critical: number;
    casesPerOneMillion: number;
    deathsPerOneMillion: number;
    tests: number;
    testsPerOneMillion: number;
    population: number;
    oneCasePerPeople: number;
    oneDeathPerPeople: number;
    oneTestPerPeople: number;
    activePerOneMillion: number;
    recoveredPerOneMillion: number;
    criticalPerOneMillion: number;
    affectedCountries: number;
}

export interface DiseaseShHistorical {
    country: string;
    province: string[];
    timeline: {
        cases: Record<string, number>;
        deaths: Record<string, number>;
        recovered: Record<string, number>;
    };
}

const BASE_URL = 'https://disease.sh/v3/covid-19';

export async function getCountryData(country: string): Promise<DiseaseShCountry> {
    const res = await fetch(`${BASE_URL}/countries/${country}?strict=true`);
    if (!res.ok) {
        throw new Error(`Failed to fetch country data for ${country}`);
    }
    return res.json();
}

export async function getGlobalData(): Promise<DiseaseShGlobal> {
    const res = await fetch(`${BASE_URL}/all`);
    if (!res.ok) {
        throw new Error('Failed to fetch global data');
    }
    return res.json();
}

export async function getHistoricalData(country: string, lastdays: number = 30): Promise<DiseaseShHistorical> {
    const res = await fetch(`${BASE_URL}/historical/${country}?lastdays=${lastdays}`);
    if (!res.ok) {
        throw new Error(`Failed to fetch historical data for ${country}`);
    }
    return res.json();
}
