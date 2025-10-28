// Let me test a scenario that might cause only one label to be returned
// Maybe if all data is in the same month?

function startOfBin(date, unit) {
    const d = new Date(date);
    switch (unit) {
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

function addPeriod(date, unit, amount) {
    const d = new Date(date);
    switch (unit) {
        case 'month': d.setMonth(d.getMonth() + amount); break;
        case 'year': d.setFullYear(d.getFullYear() + amount); break;
    }
    return d;
}

function getStartOfYear(date) {
    const result = new Date(date);
    result.setMonth(0);
    result.setDate(1);
    result.setHours(0, 0, 0, 0);
    return result;
}

function getEndOfYear(date) {
    const year = date.getFullYear();
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);
    return endOfYear;
}

function generateBuckets(start, end, binSize) {
    console.log('generateBuckets:', { start, end, binSize });
    const buckets = [new Date(start)];
    let current = startOfBin(addPeriod(start, binSize, 1), binSize);
    
    let iterations = 0;
    while (current <= end && iterations < 20) {
        buckets.push(new Date(current));
        current = startOfBin(addPeriod(current, binSize, 1), binSize);
        iterations++;
    }
    
    console.log('Generated buckets:', buckets.length, buckets);
    return buckets;
}

// Test scenarios
console.log('=== Test 1: Data spanning same month ===');
const sameMonthData = [
    { x: new Date('2024-01-05'), y: 10 },
    { x: new Date('2024-01-15'), y: 20 }
];

const sorted1 = [...sameMonthData].sort((a, b) => a.x.getTime() - b.x.getTime());
const graphStart1 = getStartOfYear(sorted1[0].x);
const graphEnd1 = getEndOfYear(sorted1[sorted1.length - 1].x);
const buckets1 = generateBuckets(graphStart1, graphEnd1, 'month');
console.log('Labels would be:', buckets1.slice(0, -1).length);

console.log('\n=== Test 2: Edge case - what if start and end are the same? ===');
const singleDateData = [{ x: new Date('2024-01-15'), y: 10 }];
const sorted2 = [...singleDateData].sort((a, b) => a.x.getTime() - b.x.getTime());
const graphStart2 = getStartOfYear(sorted2[0].x);
const graphEnd2 = getEndOfYear(sorted2[sorted2.length - 1].x);
const buckets2 = generateBuckets(graphStart2, graphEnd2, 'month');
console.log('Single date - Labels would be:', buckets2.slice(0, -1).length);

console.log('\n=== Test 3: Checking the boundary condition ===');
// What if graphStart and graphEnd are very close?
const testStart = new Date('2024-01-01T00:00:00.000Z');
const testEnd = new Date('2024-01-31T23:59:59.999Z'); // End of same month
const buckets3 = generateBuckets(testStart, testEnd, 'month');
console.log('Same month boundary - Labels would be:', buckets3.slice(0, -1).length);