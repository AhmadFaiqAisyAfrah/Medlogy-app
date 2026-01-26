import { useState, useEffect, useCallback } from "react";
import { ChartState, Series, TimeRange } from "@/components/chart/chart.types";

const STORAGE_KEY = "medlogy_chart_state_v1";

const DEFAULT_STATE: ChartState = {
    primary: {
        id: "primary",
        indicator: "Dengue incidence",
        region: "Global",
    },
    comparisons: [],
    timeRange: { startYear: 2000, endYear: 2015 } // Safe default
};

export function useChartPersistence() {
    // Start with default, but we'll try to hydrate instantly or in effect
    // To avoid hydration mismatch in Next.js, we usually start default and effect-update, 
    // or use a specific storage hook pattern.
    const [state, setState] = useState<ChartState>(DEFAULT_STATE);
    const [isHydrated, setIsHydrated] = useState(false);

    // Load from storage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Basic structural check could be added here
                setState(parsed);
            }
        } catch (e) {
            console.error("Failed to load chart state", e);
        } finally {
            setIsHydrated(true);
        }
    }, []);

    // Autosave whenever state changes (if hydrated)
    useEffect(() => {
        if (!isHydrated) return;

        const timeout = setTimeout(() => {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            } catch (e) {
                console.error("Failed to save chart state", e);
            }
        }, 500); // Debounce save slightly

        return () => clearTimeout(timeout);
    }, [state, isHydrated]);

    // Helper wrappers to match individual state setters
    // Now supporting functional updates for compatibility with ChartToolbar
    const setPrimarySeries = useCallback((update: Series | ((prev: Series) => Series)) => {
        setState(prev => {
            const newSeries = typeof update === 'function' ? update(prev.primary) : update;
            return { ...prev, primary: newSeries };
        });
    }, []);

    const setComparisonSeries = useCallback((update: Series[] | ((prev: Series[]) => Series[])) => {
        setState(prev => {
            const newSeries = typeof update === 'function' ? update(prev.comparisons) : update;
            return { ...prev, comparisons: newSeries };
        });
    }, []);

    const setTimeRange = useCallback((range: TimeRange | ((prev: TimeRange) => TimeRange)) => {
        setState(prev => {
            const newRange = typeof range === 'function' ? range(prev.timeRange) : range;
            return { ...prev, timeRange: newRange };
        });
    }, []);

    const resetState = useCallback(() => {
        setState(DEFAULT_STATE);
    }, []);

    return {
        chartState: state,
        setPrimarySeries,
        setComparisonSeries,
        setTimeRange,
        resetState,
        isHydrated
    };
}
