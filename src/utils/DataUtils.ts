import DateUtils from "./DateUtils";
export default class DataUtils {
    static stringifyItem(value: number, type: string): string {
        switch (type) {
            case 'time':
                return DateUtils.getDurationString(value) || '0 s';
            case 'workouts':
                return value.toString() + (value === 1 ? ' workout' : ' workouts');
            case 'energy':
                return value.toString() + ' kj';
            case 'volume':
                return value.toString() + ' kg';
            default:
                return value.toString();
        }
    }

    static fullNameForType(type: string): string {
        switch (type) {
            case 'time':
                return 'Workout time';
            case 'workouts':
                return 'Number of workouts';
            case 'energy':
                return 'Energy burned';
            case 'volume':
                return 'Volume';
            default:
                return type;
        }
    }
}
