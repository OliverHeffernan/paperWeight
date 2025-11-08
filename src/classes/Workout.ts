// imports
import { useRouter } from 'vue-router';
import Exercise from './Exercise';
import JSONWorkout from '../interfaces/JSONWorkout';
import JSONExercise from '../interfaces/JSONExercise';
import JSONDate from '../interfaces/JSONDate';
import { supabase } from '../lib/supabase';
import DataUtils from '../utils/DataUtils';

const router = useRouter();

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
        this.start_time = object.start_time ? new Date(object.start_time) : new Date();
        this.end_time = object.end_time ? new Date(object.end_time): new Date();
        this.created_at = object.created_at ? new Date(object.created_at) : new Date();
        this.notes = object.notes;

        this.energy = object.energy;
        this.heart_rate = object.heart_rate;

        this.exercises = exercises;
    }

    public static async createEmpty(): Promise<{ data: object | null, error: object | null }> {
        const now = new Date();
        const { data, error } = await supabase
            .from('workouts')
            .insert({
                title: "New Workout",
                start_time: now.toISOString(),
                end_time: now.toISOString(),
                created_at: now.toISOString(),
            })
            .select('workout_id')
            .single();
        return { data, error };
    }

    public static async create(object: JSONWorkout): Promise<Workout> {
        const exercises: Array<Exercise> = [];
        for (const exerciseObject of object.exercises_full) {
            const exercise = await Exercise.create(exerciseObject, null); // Temporary null, will set workout later
            exercises.push(exercise);
        }

        if (object.startTime) {
            const startTime = Workout.dateFromJSONDate(object.startTime);
            object.start_time = startTime.toISOString();
        }

        if (object.endTime) {
            const endTime = Workout.dateFromJSONDate(object.endTime);
            object.end_time = endTime.toISOString();
        }

        if (!object.start_time) {
            object.start_time = new Date().toISOString();
        }

        if (!object.end_time) {
            object.end_time = object.start_time;
        }


        const workout = new Workout(object, exercises);

        // Now set the workout reference in each exercise
        for (const exercise of exercises) {
            exercise.setWorkout(workout);
        }

        if (object.workout_id) return workout;

        const jsonWorkout: object = workout.deserialize();
        delete (jsonWorkout as any).workout_id; 
        const { data, error } = await supabase
            .from('workouts')
            .insert(workout.deserialize())
            .select('workout_id')
            .single();

        if (error) {
            throw new Error(`Failed to insert new workout into DB: ${error.message}`);
        }

        workout.workout_id = data.workout_id;
        for (const exercise of workout.exercises) {
            exercise.setWorkout(workout);
        }

        return workout;
    }

    // actions
    public async deleteWorkout() {
        const { error } = await supabase.from('workouts').delete().eq('workout_id', this.workout_id);
        for (const exercise of this.exercises) {
            exercise.removeAllSets();
        }
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
        const { error } = await supabase.from('workouts').update(this.deserialize()).eq('workout_id', this.workout_id);
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
        this.exercises[index].removeAllSets();
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

        const uniqueExerciseIds: Set<string> = new Set<string>();
        const uniqueSetIds: Set<string> = new Set<string>();

        // deserializing each exercise in the workout.
        for (const exercise of this.exercises) {
            const deserializedExercise: JSONExercise = exercise.deserialize();
            exercisesArray.push(deserializedExercise);
            exerciseNames.push(exercise.getName());

            for (const set of deserializedExercise.sets) {
                const setId: string | null | undefined = set.id;
                if (!setId) continue;
                uniqueSetIds.add(setId);
            }

            const id: string | null = deserializedExercise.id;
            if (id === null) continue;
            uniqueExerciseIds.add(id);
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
            set_count: this.countSets(),
            exercise_ids: Array.from(uniqueExerciseIds),
            set_ids: Array.from(uniqueSetIds)
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
    public static dateFromJSONDate(jsonDate: JSONDate): Date {
        const now = new Date();

        // Validate and sanitize year (reasonable range: 1900-2100)
        let year = now.getFullYear();
        if (jsonDate.year !== null && jsonDate.year !== undefined &&
            typeof jsonDate.year === 'number' &&
            jsonDate.year >= 1900 && jsonDate.year <= 2100) {
            year = Math.floor(jsonDate.year);
        }

        // Validate and sanitize month (1-12)
        let month = now.getMonth();
        if (jsonDate.month !== null && jsonDate.month !== undefined &&
            typeof jsonDate.month === 'number' &&
            jsonDate.month >= 1 && jsonDate.month <= 12) {
            month = Math.floor(jsonDate.month) - 1; // Convert to 0-based
        }

        // Validate and sanitize hour (0-23)
        let hour = now.getHours();
        if (jsonDate.hour !== null && jsonDate.hour !== undefined &&
            typeof jsonDate.hour === 'number' &&
            jsonDate.hour >= 0 && jsonDate.hour <= 23) {
            hour = Math.floor(jsonDate.hour);
        }

        // Validate and sanitize minute (0-59)
        let minute = now.getMinutes();
        if (jsonDate.minute !== null && jsonDate.minute !== undefined &&
            typeof jsonDate.minute === 'number' &&
            jsonDate.minute >= 0 && jsonDate.minute <= 59) {
            minute = Math.floor(jsonDate.minute);
        }

        // Validate and sanitize day (more complex - depends on month/year)
        let day = now.getDate();
        if (jsonDate.day !== null && jsonDate.day !== undefined &&
            typeof jsonDate.day === 'number' && jsonDate.day >= 1) {

            // Get the maximum valid day for the given month/year
            const tempDate = new Date(year, month + 1, 0); // Last day of the month
            const maxDaysInMonth = tempDate.getDate();

            if (jsonDate.day <= maxDaysInMonth) {
                day = Math.floor(jsonDate.day);
            }
            // If day is invalid (e.g., Feb 30), keep current day or use last valid day
            else {
                day = Math.min(day, maxDaysInMonth);
            }
        }

        // Create the date with validated components
        const date = new Date(year, month, day, hour, minute, 0, 0);

        // Final safety check - if somehow the date is still invalid, return current time
        if (isNaN(date.getTime())) {
            console.warn('Failed to create valid date from JSONDate:', jsonDate, 'Using current time instead');
            return new Date();
        }

        return date;
    }
}
