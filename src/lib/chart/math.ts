import { ChartPoint } from "./contract";

export function calculateSMA(data: ChartPoint[], windowSize: number = 5): ChartPoint[] {
    if (data.length < windowSize) return data;

    const result: ChartPoint[] = [];

    // Check if dates are numbers (years) or ISO strings
    // We will preserve the original date format of the window's end point

    for (let i = 0; i < data.length; i++) {
        // Skip null values for calculation safety, or treat as 0? 
        // Better: if any value in window is null, result is null (or skip).
        // Let's implement robust skipping: if we can't form a full window of valid numbers, we skip.

        if (i < windowSize - 1) {
            continue;
        }

        let sum = 0;
        let validWindow = true;

        for (let j = 0; j < windowSize; j++) {
            const val = data[i - j].value;
            if (val === null) {
                validWindow = false;
                break;
            }
            sum += val;
        }

        if (validWindow) {
            result.push({
                date: data[i].date,
                value: sum / windowSize
            });
        }
    }
    return result;
}
