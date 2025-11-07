// imports
import Exercise from './Exercise';
import JSONWorkout from '../interfaces/JSONWorkout';
import JSONExercise from '../interfaces/JSONExercise';
import { supabase } from '../lib/supabase';
import DataUtils from '../utils/DataUtils';

/**
 * Class representing a workout session.
 * Stores details about the workout including exercises, duration, and other metrics.
 * Provides methods to retrieve and manipulate workout data.
 */
export default class Workout {
    // unique identifier for the workout. Key in the database.
    private workout_id: string;
    // title of the workout.
    private title: string;
    // start time of the workout.
    private start_time: Date;
    // end time of the workout.
    private end_time: Date;
    // creation time of the workout.
    private created_at: Date;
    // array of exercises in the workout. In order.
    private exercises: Array<Exercise>;
    // notes for the workout.
    private notes: string;
    // energy expended during the workout in kilojoules.
    private energy: number | null;
    // average heart rate during the workout in beats per minute.
    private heart_rate: number | null;
    private unsavedChanges: number = 0;
    private saving: boolean = false;

    /**
     * Creates an instance of Workout.
     * @param object - A JSONWorkout object containing the workout data. This will typically be loaded from the database.
     */
    public constructor(object: JSONWorkout, exercises: Array<Exercise>) {
        this.title = object.title;
        this.workout_id = object.workout_id;
        this.start_time = new Date(object.start_time);
        this.end_time = new Date(object.end_time);
        this.created_at = new Date(object.created_at);
        this.notes = object.notes;

        this.energy = object.energy;
        this.heart_rate = object.heart_rate;

        this.exercises = exercises;
    }

    public static async create(object: JSONWorkout): Promise<Workout> {
        const exercises: Array<Exercise> = [];
        for (const exerciseObject of object.exercises_full) {
            const exercise = await Exercise.create(exerciseObject, null); // Temporary null, will set workout later
            exercises.push(exercise);
        }

        const workout = new Workout(object, exercises);
        
        // Now set the workout reference in each exercise
        for (const exercise of exercises) {
            exercise.setWorkout(workout);
        }

        return workout;
    }

    // actions
    public async deleteWorkout() {
        const { data, error } = await supabase.from('workouts').delete().eq('workout_id', this.workout_id);
        if (error) {
            console.error("Failed to delete workout:", error);
        }
    }

    public changeMade(): void {
        this.unsavedChanges++;
        if (this.saving) return;
        this.saveChanges();
    }

    public async saveChanges(): Promise<void> {
        this.saving = true;
        const currentUnsavedChanges = this.unsavedChanges;
        const { data, error } = await supabase.from('workouts').update(this.deserialize()).eq('workout_id', this.workout_id);
        if (error) {
            console.error("Failed to save workout changes:", error);
        }
        this.unsavedChanges -= currentUnsavedChanges;

        // if more changes have been nmade since we started saving, save again.
        if (this.unsavedChanges == 0) {
            this.saving = false;
            return;
        }
        this.saveChanges();
    }

    public removeExercise(index: number): void {
        if (index < 0 || index >= this.exercises.length) {
            throw new Error("Index out of bounds");
        }
        this.exercises.splice(index, 1);
        this.changeMade();
    }

    public addEmptyExercise(): void {
        const newExerciseObject: JSONExercise = {
            exercise: "New Exercise",
            sets: [],
            notes: "",
            id: null
        };
        const newExercise: Exercise = new Exercise(newExerciseObject, this);
        this.exercises.push(newExercise);
        this.changeMade();
    }

    public setExercises(newExercises: Array<Exercise>): void {
        this.exercises = newExercises;
        this.changeMade();
    }

    public setHeartRate(newHeartRate: number | null): void {
        this.heart_rate = newHeartRate;
        this.changeMade();
    }

    public setEnergy(newEnergy: number | null): void {
        this.energy = newEnergy;
        this.changeMade();
    }

    public setTitle(newTitle: string): void {
        this.title = newTitle;
        this.changeMade();
    }

    public setStartDate(newStartTime: Date): void {
        this.start_time = newStartTime;
        this.changeMade();
    }

    public setEndDate(newEndTime: Date): void {
        this.end_time = newEndTime;
        this.changeMade();
    }

    /**
     * Deserializes the Workout instance into a JSONWorkout object.
     * @returns A JSONWorkout object representing the workout data.
     */
    public deserialize(): JSONWorkout {
        const exercisesArray: Array<JSONExercise> = [];

        const exerciseNames: Array<string> = [];

        // deserializing each exercise in the workout.
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
            heart_rate: this.heart_rate,
            volume: this.getVolume(),
            set_count: this.countSets()
        };
    }

    // getters
    public savingInProgress(): boolean {
        return this.saving;
    }

    /**
     * Retrieves the notes for the workout.
     */
    public getNotes(): string { return this.notes; }

    /**
     * Retrieves the energy expended during the workout in kilojoules.
     */
    public getEnergy(): number | null { return this.energy; }

    /**
     * Retrieves the energy expended during the workout as a formatted string.
     */
    public getEnergyString(): string | null {
        const energy: number | null = this.getEnergy();
        if (energy === null) {
            return null;
        }
        return `${DataUtils.commaNumber(energy)} kj`;
    }

    /**
     * Retrieves the average heart rate during the workout in beats per minute.
     */
    public getHeartRate(): number | null { return this.heart_rate; }

    /**
     * Retrieves the average heart rate during the workout as a formatted string.
     */
    public getHeartRateString(): string | null {
        if (this.heart_rate === null) {
            return null;
        }
        return `${this.heart_rate} bpm`;
    }

    /**
     * Retrieves the exercises in the workout.
     */
    public getExercises(): Array<Exercise> { return this.exercises; }

    /**
     * Calculates the total volume lifted during the workout.
     * Volume is calculated as the sum of volumes of all exercises.
     *
     * @returns The total volume lifted during the workout in kilograms.
     */
    public getVolume(): number {
        let volume: number = 0;
        for (const exercise of this.exercises) {
            volume += exercise.getVolume();
        }
        return volume;
    }

    /**
     * Retrieves the total volume lifted during the workout as a formatted string.
     */
    public getVolumeString(): string | null {
        const volume: number = this.getVolume();
        if (volume === 0) {
            return null;
        }
        return `${DataUtils.commaNumber(volume)} kg`;
    }

    /**
     * Counts the total number of sets performed during the workout.
     */
    public countSets(): number {
        let sets: number = 0;
        for (const exercise of this.exercises) {
            sets += exercise.countSets();
        }
        return sets;
    }

    /**
     * Retrieves the total number of sets performed during the workout as a formatted string.
     */
    public countSetsString(): string|null {
        const sets: number = this.countSets();
        if (sets === 0) {
            return null;
        }
        return `${sets} sets`;
    }

    /**
     * Retrieves the id of the workout. This is the key in the database.
     */
    public getId(): string {
        return this.workout_id;
    }

    /**
     * Retrieves the title of the workout.
     */
    public getTitle(): string {
        return this.title;
    }

    /**
     * Calculates the duration of the workout in seconds.
     */
    public getDuration(): number {
        return (this.end_time.getTime() - this.start_time.getTime()) / 1000;
    }

    /**
     * Retrieves the duration of the workout as a formatted string.
     */
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

    /**
     * Retrieves the start date and time of the workout as a formatted string.
     */
    public getDateString(): string {
        return this.start_time.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) + ', ' + this.start_time.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    }

    /**
     * Retrieves the start time of the workout.
     */
    public getStartTime(): Date {
        return this.start_time;
    }

    public getStartTimeShortDateString(): string {
        return this.start_time.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }

    public getEndTime(): Date {
        return this.end_time;
    }

    public countExercises(): number {
        return this.exercises.length;
    }

    public getItem(item: string): any {
        switch (item) {
            case "workouts": return 1;
            case "time": return this.getDuration();
            case "energy": return this.getEnergy();
            case "volume": return this.getVolume();
            default: throw new Error(`Unknown item: ${item}`);
        }
    }
}
