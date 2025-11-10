import { supabase } from "../lib/supabase";
import JSONSet from "../interfaces/JSONSet";
import Workout from "./Workout";
import Exercise from "./Exercise";

export default class Set {
    private reps: number = 0;
    private weight: number = 0;
    private notes: string = "";
    private id: string | null = null;
    private exercise: Exercise | null;
    private workout_id: string | null = null;
    private isWeightPB: boolean = false;

    public static async create(object: JSONSet, exercise: Exercise | null): Promise<Set> {
        if (object.id) {
            const { data, error } = await supabase
                .from('sets')
                .select('*')
                .eq('id', object.id)
                .single();
            if (error) {
                object.id = null;
                return new Set(object, exercise);
            }

            return new Set(data as JSONSet, exercise);
        }
        if (object.workout_id) {
            return new Set(object, exercise);
        }
        object.workout_id = exercise ? exercise.getWorkout()?.getId() || null : null;
        return new Set(object, exercise);
    }

    public constructor(object: JSONSet, exercise: Exercise | null) {
        this.exercise = exercise;
        this.reps = object.reps || 0;
        this.weight = object.weight || 0;
        this.notes = object.notes || "";
        this.id = object.id || null;
        this.workout_id = object.workout_id || null;
        //this.createNewId();
        if (this.id == null || this.id === undefined) {
            this.createNewId();
        }
    }

    public async initialDBCheck(): Promise<void> {
        if (this.id !== null) await this.getFromDB();
        this.createNewId();
    }

    public async getFromDB(): Promise<JSONSet | null> {
        if (this.id === null) {
            return null;
        }

        const { data, error } = await supabase
            .from('sets')
            .select('*')
            .eq('id', this.id)
            .single();

        if (error) {
            throw new Error(`Failed to fetch set from DB: ${error.message}`);
        }

        this.reps = data.reps;
        this.weight = data.weight;
        this.notes = data.notes;

        return data as JSONSet;
    }

    public async deleteFromDB(): Promise<void> {
        if (this.id === null) {
            return;
        }

        const { error } = await supabase
            .from('sets')
            .delete()
            .eq('id', this.id);

        if (error) {
            throw new Error(`Failed to delete set from DB: ${error.message}`);
        }
    }

    private async waitForExercise(): Promise<void> {
        while (this.exercise === null) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    public async getExercise(): Promise<Exercise> {
        await this.waitForExercise();
        if (this.exercise === null) {
            throw new Error("Exercise is not set for this Set.");
        }
        return this.exercise;
    }

    public async createNewId(): Promise<string | null> {
        await this.waitForExercise();
        if (this.exercise === null) {
            throw new Error("Cannot create set without associated exercise.");
        }
        const workoutId: string | null = await this.exercise.getWorkoutId();
        const exerciseId = await this.exercise.createNewIdIfNeeded();
        const { data, error } = await supabase
            .from('sets')
            .insert({
                exercise_id: exerciseId,
                workout_id: workoutId,
                reps: this.reps,
                weight: this.weight,
                notes: this.notes
            })
            .select('id')
            .single();

        if (error) {
            throw new Error(`Failed to create new set ID: ${error.message}`);
        }
        this.id = data.id;
        return this.id;
    }

    public async updateDB(): Promise<void> {
        if (this.id === null) {
            await this.createNewId();
            return;
        }
        const { error } = await supabase
            .from('sets')
            .update({
                reps: this.reps,
                weight: this.weight,
                notes: this.notes,
                exercise_id: this.exercise ? await this.exercise.getId() : ""
            })
            .eq('id', this.id);

        if (error) {
            throw new Error(`Failed to update set in DB: ${error.message}`);
        }
        const exercise = await this.getExercise();
        const workout = exercise.getWorkout()
        if (workout) workout.changeMade();
    }

    // actions
    public deserialize(): JSONSet {
        return {
            id: this.id
        }
    }

    // getters and setters
    public getReps(): number {
        return this.reps;
    }

    public getWeight(): number {
        return this.weight;
    }

    public getNotes(): string {
        return this.notes;
    }

    public setReps(reps: number): void {
        this.reps = reps;
    }

    public setWeight(weight: number): void {
        this.weight = weight;
    }

    public setNotes(notes: string): void {
        this.notes = notes;
    }

    public setWeightPB(): void {
        this.isWeightPB = true;
    }

    public isItWeightPB(): boolean {
        return this.isWeightPB;
    }

    public setExercise(exercise: Exercise): void {
        this.exercise = exercise;
        this.workout_id = exercise.getWorkout()?.getId() || null;
        this.updateDB();
    }

    public getId(): string | null {
        return this.id;
    }

    public getWorkoutId(): string | null {
        return this.workout_id;
    }

    public getVolume(): number {
        return this.reps * this.weight;
    }
}
