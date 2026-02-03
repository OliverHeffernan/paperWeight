export default class DateUtils {

    static addPeriod(date: Date, unit: string, amount: number): Date {
        const d = new Date(date);
        switch (unit) {
            case 'day': d.setDate(d.getDate() + amount); break;
            case 'week': d.setDate(d.getDate() + amount * 7); break;
            case 'month': d.setMonth(d.getMonth() + amount); break;
            case 'year': d.setFullYear(d.getFullYear() + amount); break;
        }
        return d;
    }

    static getStartOfTerm(backTimes: number, term: string): Date | null {
        switch (term) {
            case 'month':
                const date = new Date();
                date.setMonth(date.getMonth() - backTimes);
                return DateUtils.getStartOfMonth(date);
            case 'year':
                const yearDate = new Date();
                yearDate.setFullYear(yearDate.getFullYear() - backTimes);
                return DateUtils.getStartOfYear(yearDate);
            case 'week':
                const weekDate = new Date();
                weekDate.setDate(weekDate.getDate() - (backTimes * 7));
                return DateUtils.getStartOfWeek(weekDate);
            default:
                return null;
        }

    }
    static getEndOfTerm(backTimes: number, term: string): Date | null {
        switch (term) {
            case 'month':
                const date = new Date();
                date.setMonth(date.getMonth() - backTimes);
                return DateUtils.getEndOfMonth(date);
            case 'year':
                const yearDate = new Date();
                yearDate.setFullYear(yearDate.getFullYear() - backTimes);
                return DateUtils.getEndOfYear(yearDate);
            case 'week':
                const weekDate = new Date();
                weekDate.setDate(weekDate.getDate() - (backTimes * 7));
                return DateUtils.getEndOfWeek(weekDate);
            default:
                return null;
        }
    }

    static getStartOfWeek(date: Date): Date {
        date = new Date(date);
        var day = date.getDay(),
        diff = date.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
        date.setDate(diff);
        date.setHours(0, 0, 0, 0);
        return date;
    }

    static getEndOfWeek(date: Date): Date {
        const startOfWeek = DateUtils.getStartOfWeek(date);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return endOfWeek;
    }

    static getStartOfPreviousWeek(date: Date): Date {
        const startOfCurrentWeek = DateUtils.getStartOfWeek(date);
        const startOfPreviousWeek = new Date(startOfCurrentWeek);
        startOfPreviousWeek.setDate(startOfCurrentWeek.getDate() - 7);
        return startOfPreviousWeek;
    }

    static getStartOfMonth(date: Date): Date {
        const result: Date = new Date(date);
        result.setDate(1);
        result.setHours(0, 0, 0, 0);
        return result;
    }

    static getEndOfMonth(date: Date): Date {
        const year = date.getFullYear();
        const month = date.getMonth(); // 0-based (January = 0)

        // Create a date for the first day of the next month, then subtract 1 millisecond
        const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

        return endOfMonth;
    }

    static getStartOfPreviousMonth(date: Date): Date {
        const startOfCurrentMonth = DateUtils.getStartOfMonth(date);
        const startOfPreviousMonth = new Date(startOfCurrentMonth);
        startOfPreviousMonth.setMonth(startOfCurrentMonth.getMonth() - 1);
        return startOfPreviousMonth;
    }

    static getStartOfYear(date: Date): Date {
        const result: Date = new Date(date);
        result.setMonth(0);
        result.setDate(1);
        result.setHours(0, 0, 0, 0);
        return result;
    }
    static getEndOfYear(date: Date): Date {
        const year = date.getFullYear();
        const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);
        return endOfYear;
    }

    static getStartOfPreviousYear(date: Date): Date {
        const startOfCurrentYear = DateUtils.getStartOfYear(date);
        const startOfPreviousYear = new Date(startOfCurrentYear);
        startOfPreviousYear.setFullYear(startOfCurrentYear.getFullYear() - 1);
        return startOfPreviousYear;
    }

    static getStart(date: Date, timeframe: string): Date {
        switch (timeframe) {
            case 'week':
                return DateUtils.getStartOfWeek(date);
            case 'month':
                return DateUtils.getStartOfMonth(date);
            case 'year':
                return DateUtils.getStartOfYear(date);
            default:
                return date;
        }
    }

    static getEnd(date: Date, timeframe: string): Date {
        switch (timeframe) {
            case 'week':
                return DateUtils.getEndOfWeek(date);
            case 'month':
                return DateUtils.getEndOfMonth(date);
            case 'year':
                return DateUtils.getEndOfYear(date);
            default:
                return date;
        }
    }

    static getStartOfPrevious(date: Date, timeframe: string): Date {
        switch (timeframe) {
            case 'week':
                return DateUtils.getStartOfPreviousWeek(date);
            case 'month':
                return DateUtils.getStartOfPreviousMonth(date);
            case 'year':
                return DateUtils.getStartOfPreviousYear(date);
            default:
                return date;
        }
    }

    static getDurationString(totalSeconds: number): string|null {
        if (totalSeconds <= 0) return null;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);

        const parts: string[] = [];
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
        return parts.join(' ');
    }

    static getPeriodString(graphSize: string, backTimes: number): string {
        const now = new Date();
        const start = DateUtils.addPeriod(DateUtils.getStart(now, graphSize), graphSize, -backTimes);
        const end = DateUtils.addPeriod(DateUtils.getEnd(now, graphSize), graphSize, - backTimes);
        switch (graphSize) {
            case 'month':
                return `
                    ${start.toLocaleString('default', { month: 'long' })} 
                    ${start.getFullYear()}
                `
            case 'year':
                return `${start.getFullYear()}`;
            case 'week':
                return `
                    ${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} – 
                    ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                `;
            default:
                return '';
        }

    }
}
