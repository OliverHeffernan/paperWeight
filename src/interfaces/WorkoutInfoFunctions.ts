export default interface WorkoutInfoFunctions {

    getDuration(): number;
    getDurationString(): string;
    getTitle(): string;
    getDateString(): string;
    getStartTime(): Date;
    getEndTime(): Date;
    getEnergy(): number | null;
    countSets(): number| null;
    getVolume(): number;
    getItem(item: string): any;

}
