import DateUtils from './DateUtils';
export function Histogram(
    dataset: Array<{ x: Date; y: number }>,
    binSize: 'day' | 'week' | 'month' | 'year',
    //graphSize: 'week' | 'month' | 'year' | 'all'
    graphSize: string,
    backTimes: number
): Array<number> {
    if (dataset.length === 0) {
        return [];
    }

    // Sort dataset by date
    const sorted = [...dataset].sort((a, b) => a.x.getTime() - b.x.getTime());
    const minDate = sorted[0].x;
    const maxDate = sorted[sorted.length - 1].x;

    // Determine graph start and end based on graphSize
    //const graphStart = DateUtils.getStartOfTerm(minDate, graphSize) || minDate; 
    //const graphEnd = DateUtils.getEndOfTerm(maxDate, graphSize) || maxDate;

    const graphStart = DateUtils.addPeriod(DateUtils.getStartOfTerm(0, graphSize) || minDate, graphSize, -backTimes);
    const graphEnd = DateUtils.addPeriod(DateUtils.getEndOfTerm(0, graphSize) || maxDate, graphSize, -backTimes);
    // Generate all bucket boundaries
    const buckets = generateBuckets(graphStart, graphEnd, binSize);
    
    // Initialize result array with zeros
    const result = new Array(buckets.length - 1).fill(0);

    // Bin the data
    for (const { x, y } of dataset) {
        const bucketIndex = findBucketIndex(x, buckets);
        if (bucketIndex >= 0 && bucketIndex < result.length) {
            result[bucketIndex] += y;
        }
    }

    return result;
}

/**
 * Returns an array of label strings for each bin in the histogram
 */
export function HistogramBinLabels(
    dataset: Array<{ x: Date; y: number }>,
    binSize: 'day' | 'week' | 'month' | 'year',
    //graphSize: 'week' | 'month' | 'year' | 'all'
    graphSize: string,
    backTimes: number
): Array<string> {
    if (dataset.length === 0) {
        return [];
    }

    const sorted = [...dataset].sort((a, b) => a.x.getTime() - b.x.getTime());
    const minDate = sorted[0].x;
    const maxDate = sorted[sorted.length - 1].x;

    //const graphStart = DateUtils.getStartOfTerm(0, graphSize) || minDate; 
    //const graphEnd = DateUtils.getEndOfTerm(0, graphSize) || maxDate;

    const graphStart = DateUtils.addPeriod(DateUtils.getStartOfTerm(0, graphSize) || minDate, graphSize, -backTimes);
    const graphEnd = DateUtils.addPeriod(DateUtils.getEndOfTerm(0, graphSize) || maxDate, graphSize, -backTimes);

    const buckets = generateBuckets(graphStart, graphEnd, binSize);
    return buckets.slice(0, -1).map((start, i) => formatBucketLabel(start, buckets[i + 1], binSize));
}

// Generate all bucket start dates from start to end
function generateBuckets(start: Date, end: Date, binSize: 'day' | 'week' | 'month' | 'year'): Date[] {
    //const buckets: Date[] = [new Date(start)];
    const buckets: Date[] = [];
    let current = startOfBin(start, binSize);

    const endPlusOne = addPeriod(end, binSize, 1);

    while (current <= endPlusOne) {
        buckets.push(new Date(current));
        current = startOfBin(addPeriod(current, binSize, 1), binSize);
    }

    if (buckets.length === 1) {
        // Ensure at least two buckets for single-bin case
        buckets.push(addPeriod(buckets[0], binSize, 1));
    }

    return buckets;
}

// Find which bucket a date falls into
function findBucketIndex(date: Date, buckets: Date[]): number {
    for (let i = 0; i < buckets.length - 1; i++) {
        if (date >= buckets[i] && date < buckets[i + 1]) {
            return i;
        }
    }
    // Check last bucket
    if (date >= buckets[buckets.length - 1]) {
        return buckets.length - 2;
    }
    return -1;
}

// Format label for a bucket
function formatBucketLabel(start: Date, end: Date, binSize: 'day' | 'week' | 'month' | 'year'): string {
    const fmt = (d: Date) => {
        switch (binSize) {
            case 'day': return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            case 'week': return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            case 'month': return d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
            case 'year': return d.getFullYear().toString();
        }
    };

    if (binSize === 'week') {
        const endMinusDay = new Date(end);
        endMinusDay.setDate(endMinusDay.getDate() - 1);
        return `${fmt(start)} – ${fmt(endMinusDay)}`;
    }

    return fmt(start);
}

// Date utility functions
function startOfBin(date: Date, unit: 'day' | 'week' | 'month' | 'year'): Date {
    const d = new Date(date);
    switch (unit) {
        case 'day':
            d.setHours(0, 0, 0, 0);
            break;
        case 'week':
            d.setHours(0, 0, 0, 0);
            const day = d.getDay();
            d.setDate(d.getDate() - (day === 0 ? 6 : day - 1)); // Monday start
            break;
        case 'month':
            d.setDate(1);
            d.setHours(0, 0, 0, 0);
            break;
        case 'year':
            d.setMonth(0, 1);
            d.setHours(0, 0, 0, 0);
            break;
    }
    return d;
}

function endOfBin(date: Date, unit: 'day' | 'week' | 'month' | 'year'): Date {
    const d = new Date(date);
    switch (unit) {
        case 'day':
            d.setHours(23, 59, 59, 999);
            break;
        case 'week':
            d.setHours(23, 59, 59, 999);
            const day = d.getDay();
            d.setDate(d.getDate() + (day === 0 ? 0 : 7 - day));
            break;
        case 'month':
            d.setMonth(d.getMonth() + 1, 0);
            d.setHours(23, 59, 59, 999);
            break;
        case 'year':
            d.setFullYear(d.getFullYear() + 1, 0, 0);
            d.setHours(23, 59, 59, 999);
            break;
    }
    return d;
}

function addPeriod(date: Date, unit: 'day' | 'week' | 'month' | 'year', amount: number): Date {
    const d = new Date(date);
    switch (unit) {
        case 'day': d.setDate(d.getDate() + amount); break;
        case 'week': d.setDate(d.getDate() + amount * 7); break;
        case 'month': d.setMonth(d.getMonth() + amount); break;
        case 'year': d.setFullYear(d.getFullYear() + amount); break;
    }
    return d;
}

function addYears(date: Date, years: number): Date {
    const d = new Date(date);
    d.setFullYear(d.getFullYear() + years);
    return d;
}
