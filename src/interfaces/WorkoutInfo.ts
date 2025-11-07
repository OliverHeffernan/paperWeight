export default class WorkoutInfo {
    title: string;
    workout_id: string;
    start_time: string;
    end_time: string;
    energy: number | null;
    heart_rate: number | null;
    volume: number | null;
    set_count: number | null;

    constructor(data: {
        title: string;
        workout_id: string;
        start_time: string;
        end_time: string;
        energy: number | null;
        heart_rate: number | null;
        volume: number | null;
        set_count: number | null;
    }) {
        this.title = data.title;
        this.workout_id = data.workout_id;
        this.start_time = data.start_time;
        this.end_time = data.end_time;
        this.energy = data.energy;
        this.heart_rate = data.heart_rate;
        this.volume = data.volume;
        this.set_count = data.set_count;
    }

    public getDuration(): number {
        const start = new Date(this.start_time).getTime();
        const end = new Date(this.end_time).getTime();
        return (end - start) / 1000; // duration in seconds
    }

    public getDurationString(): string {
        const durationSeconds = this.getDuration();
        const hours = Math.floor(durationSeconds / 3600);
        const minutes = Math.floor((durationSeconds % 3600) / 60);
        const seconds = Math.floor(durationSeconds % 60);

        const parts = [];
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
        return parts.join(' ');
    }

    public getTitle(): string {
        return this.title;
    }

    public getDateString(): string {
        const date = new Date(this.start_time);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    public getWorkoutId(): string {
        return this.workout_id;
    }

    public getStartTime(): Date {
        return new Date(this.start_time);
    }

    public getEndTime(): Date {
        return new Date(this.end_time);
    }

    public getEnergy(): number | null {
        return this.energy;
    }

    public getEnergyString(): string | null {
        return this.energy !== null ? `${this.energy} kj` : null;
    }

    public getHeartRate(): number | null {
        return this.heart_rate;
    }

    public getHeartRateString(): string | null {
        return this.heart_rate !== null ? `${this.heart_rate} bpm` : null;
    }

    public getVolume(): number | null {
        return this.volume;
    }

    public getVolumeString(): string | null {
        return this.volume !== null ? `${this.volume} kg` : null;
    }

    public getId(): string {
        return this.workout_id;
    }

    public countSets(): number | null {
        return this.set_count;
    }

    public countSetsString(): string | null {
        return this.set_count !== null ? `${this.set_count} sets` : null;
    }
}
