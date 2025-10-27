export default class DateUtils {
    static getStartOfWeek(date: Date): Date {
        date = new Date(date);
        var day = date.getDay(),
        diff = date.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
        date.setDate(diff);
        date.setHours(0, 0, 0, 0);
        return date;
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
}
