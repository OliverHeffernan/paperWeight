import Exercise from './Exercise';
import JSONWorkout from '../interfaces/JSONWorkout';
import JSONExercise from '../interfaces/JSONExercise';
export default class Workout {
    private workout_id: string;
    private title: string;
    private start_time: Date;
    private end_time: Date;
    private created_at: Date;
    private exercises: Array<Exercise>;
    private notes: string;
    private energy: number | null;
    private heart_rate: number | null;

    public constructor(object: JSONWorkout) {
        this.exercises = [];
        this.title = object.title;
        this.workout_id = object.workout_id;
        this.start_time = new Date(object.start_time);
        this.end_time = new Date(object.end_time);
        this.created_at = new Date(object.created_at);
        this.notes = object.notes;

        this.energy = object.energy;
        this.heart_rate = object.heart_rate;

        for (const exerciseObject of object.exercises_full) {
            this.exercises.push(new Exercise(exerciseObject));
        }
    }

    public deserialize(): JSONWorkout {
        const exercisesArray: Array<JSONExercise> = [];

        const exerciseNames: Array<string> = [];

        for (const exercise of this.exercises) {
            exercisesArray.push(exercise.deserialize());
            exerciseNames.push(exercise.getName());
        }
        return {
            title: this.title,
            workout_id: this.workout_id,
            start_time: this.start_time.toISOString(),
            end_time: this.end_time.toISOString(),
            created_at: this.created_at.toISOString(),
            exercises_full: exercisesArray,
            exercises: exerciseNames,
            notes: this.notes,
            energy: this.energy,
            heart_rate: this.heart_rate
        };
    }

    public getNotes(): string { return this.notes; }

    public getEnergy(): number | null { return this.energy; }
    public getEnergyString(): string | null {
        const energy: number | null = this.getEnergy();
        if (energy === null) {
            return null;
        }
        return `${energy} kj`;
    }

    public getHeartRate(): number | null { return this.heart_rate; }

    public getHeartRateString(): string | null {
        if (this.heart_rate === null) {
            return null;
        }
        return `${this.heart_rate} bpm`;
    }

    public getExercises(): Array<Exercise> { return this.exercises; }

    public getVolume(): number {
        let volume: number = 0;
        for (const exercise of this.exercises) {
            volume += exercise.getVolume();
        }
        return volume;
    }

    public getVolumeString(): string | null {
        const volume: number = this.getVolume();
        if (volume === 0) {
            return null;
        }
        return `${volume} kg`;
    }

    public countSets(): number {
        let sets: number = 0;
        for (const exercise of this.exercises) {
            sets += exercise.countSets();
        }
        return sets;
    }

    public countSetsString(): string|null {
        const sets: number = this.countSets();
        if (sets === 0) {
            return null;
        }
        return `${sets} sets`;
    }

    public getId(): string {
        console.log(this.workout_id);
        return this.workout_id;
    }

    public getTitle(): string {
        return this.title;
    }

    public getDuration(): number {
        return (this.end_time.getTime() - this.start_time.getTime()) / 1000;
    }

    public getDurationString(): string|null {
        const totalSeconds = this.getDuration();
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

    public getRelativeDate(): string {
        const now: Date = new Date();
        if (now.getMilliseconds() - this.start_time.getMilliseconds() < 86400000) {
            return 'Today';
        } else if (now.getMilliseconds() - this.start_time.getMilliseconds() < 172800000) {
            return 'Yesterday';
        } else {
            return this.start_time.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        }
    }

    public getDateString(): string {
        return this.start_time.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) + ', ' + this.start_time.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    }

    public getStartTime(): Date {
        return this.start_time;
    }
}
