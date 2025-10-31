import DateUtils from "./DateUtils";
export default class DataUtils {
    static stringifyItem(value: number, type: string): string {
        switch (type) {
            case 'time':
                return DateUtils.getDurationString(value) || '0 s';
            case 'workouts':
                return value.toString() + (value === 1 ? ' workout' : ' workouts');
            case 'energy':
                return DataUtils.commaNumber(value) + ' kj';
            case 'volume':
                return DataUtils.commaNumber(value) + ' kg';
            default:
                return DataUtils.commaNumber(value);
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

    static commaNumber(value: number): string {
        let output: string = "";
        for (let i = 0; i < value.toString().length; i++) {
            output += value.toString()[i];
            const positionFromEnd = value.toString().length - i - 1;
            if (positionFromEnd % 3 === 0 && positionFromEnd !== 0) {
                output += ",";
            }
        }
        return output;
    }
}
