import JSONExercise from "../interfaces/JSONExercise";
import JSONSet from "../interfaces/JSONSet";
import Set from "./Set";
import Workout from "./Workout";

import { supabase } from "../lib/supabase";

/**
 * A class representing an exercise with its sets and notes.
 * Provides methods to calculate volume, retrieve sets, and serialize/deserialize the exercise data.
 */
export default class Exercise {
    // the name of the exercise, e.g. Bench Press.
    public name: string;
    // an array of sets for the exercise.
    private sets: Array<Set>;
    // notes for the exercise.
    private notes: string;

    private workout: Workout | null;
    private id: string | null;

    /**
     * Creates an instance of Exercise.
     * @param object - A JSONExercise object containing the exercise data. This will typically be loaded from the database.
     *
     * @example
     * const exerciseData: JSONExercise = {
     *   exercise: "Bench Press",
     *   sets: [
     *     { reps: 10, weight: 100, unit: "lbs" },
     *     { reps: 8, weight: 120, unit: "lbs" }
     *   ],
     *   notes: "Felt strong today!"
     * };
     * const exercise = new Exercise(exerciseData);
     */
    public constructor(object: JSONExercise, workout: Workout | null, sets: Array<Set> = []) {
        this.name = object.exercise;
        //this.sets = object.sets;
        this.workout = workout;
        //this.sets = object.sets.map((setData: JSONSet) => new Set(setData, this));
        this.notes = object.notes;
        this.id = object.id;

        for (const set of sets) {
            // set the exercise reference in each set
            set.setExercise(this);
        }
        this.sets = sets;

        this.getId();
    }

    public static async create(object: JSONExercise, workout: Workout | null): Promise<Exercise> {
        const sets: Array<Set> = [];
        for (const setData of object.sets) {
            const set = await Set.create(setData, null); // Temporary null, will set exercise later
            sets.push(set);
        }
        return new Exercise(object, workout, sets);
    }

    public static createFromFullExercise(object: JSONExercise): Exercise {
        const sets: Array<Set> = object.sets.map((setData: JSONSet) => new Set(setData, null));
        const exercise = new Exercise(object, null, sets);
        for (const set of sets) {
            set.setExerciseWithoutUpdate(exercise);
        }
        return exercise;
    }

    public async getId(): Promise<string | null> {
        if (this.id) { return this.id; }

        const { data, error } = await supabase
            .from('exercises')
            .select()
            .eq('name', this.name.toLowerCase());

        if (error) {
            throw new Error(`Failed to fetch exercise ID: ${error.message}`);
        }

        if (data === null || data.length === 0) {
            return await this.createNewIdIfNeeded();
        }

        this.id = data[0].id;
        this.name = data[0].name;
        return this.id;
    }

    public async createNewIdIfNeeded(): Promise<string | null> {
        const { data, error } = await supabase
            .from('exercises')
            .select()
            .eq('name', this.name.toLowerCase());

        if (error) {
            throw new Error(`Failed to fetch exercise ID: ${error.message}`);
        }

        if (data === null || data.length === 0) {
            return await this.createNewId();
        }

        this.id = data[0].id;
        this.name = data[0].name;
        this.workout?.changeMade();
        return this.id;
    }

    public async createNewId(): Promise<string | null> {
        const { data: {user} } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('exercises')
            .insert([{
                name: this.name.toLowerCase(),
            }])
            .select('id')
            .single();

        if (error) {
            console.error(error);
            throw new Error(`Failed to create new exercise ID: ${error.message}`);
        }

        this.id = data.id;
        return this.id;
    }

    /**
     * Deserializes the Exercise instance into a JSONExercise object.
     *
     * @returns A JSONExercise object representing the exercise data.
     */
    public deserialize(): JSONExercise {
        return {
            exercise: this.name,
            sets: this.sets.map((set: Set) => set.deserialize()),
            notes: this.notes,
            id: this.id
        };
    }

    // editor functions
    /**
     * add a copy of the last set to the sets array
     */
    public async addNewSet(): Promise<void> {
        console.log("sets length: " + this.sets.length);
        console.log("153")
        if (this.sets.length === 0) {
            console.log("155");
            const id: string | null = null;
            const newSet = new Set({ reps: 0, weight: 0, unit: "kg", notes: "", id }, this);
            this.sets.push(newSet);
            await newSet.createNewId(); // Create ID after set is added
            if (this.workout) this.workout.changeMade();
            return;
        }
        console.log("163");
        const lastSet: Set = this.sets[this.sets.length - 1];
        const newSet: Set = new Set({
            reps: lastSet.getReps(),
            weight: lastSet.getWeight(),
            unit: "kg",
            notes: lastSet.getNotes(),
            id: null
        }, this);
        this.sets.push(newSet);
        await newSet.createNewId(); // Create ID after set is added
        console.log("174");
        console.log("sets length after add: " + this.sets.length);

        if (this.workout) {
            console.log("177");
            this.workout.changeMade();
        }
    }

    public removeSet(index: number): void {
        if (index < 0 || index >= this.sets.length) {
            throw new Error("Index out of bounds");
        }
        const removedSet: Set = this.sets[index];
        this.sets.splice(index, 1);
        removedSet.deleteFromDB();
        if (this.workout) this.workout.changeMade();

        supabase.from('sets')
            .delete()
            .eq('id', removedSet.getId());
    }

    public removeAllSets(): void {
        for (let i = 0; i < this.sets.length; i++) {
            this.removeSet(0);
        }
    }

    public removeFromWorkout(): void {
        if (!this.workout) return;
        const exerciseIndex: number = this.workout.getExercises().indexOf(this);
        if (exerciseIndex === -1) {
            throw new Error("Exercise not found in workout");
        }
        this.workout.removeExercise(exerciseIndex);
    }

    /**
     * Replaces the set at the specified index with the updated set.
     *
     * @param index - The index of the set to be updated.
     * @param updatedSet - The new JSONSet object to replace the existing set.
     *
     * @throws Will throw an error if the index is out of bounds.
     */
    public updateSet(index: number, updatedSet: JSONSet): void {
        if (index < 0 || index >= this.sets.length) {
            throw new Error("Index out of bounds");
        }
        const editingSet: Set = this.sets[index];
        editingSet.setReps(updatedSet.reps || 0);
        editingSet.setWeight(updatedSet.weight || 0);
        editingSet.setNotes(updatedSet.notes || "");
        //this.sets[index] = updatedSet;
        if (this.workout) this.workout.changeMade();
    }

    // basic setters
    public async setName(name: string) {
        this.name = name;
        await this.createNewIdIfNeeded();
        for (const set of this.sets) {
            set.setExercise(this);
            await set.updateDB();
        }
        if (this.workout) this.workout.changeMade();
    }

    public setWorkout(workout: Workout): void {
        this.workout = workout;
        for (const set of this.sets) {
            set.setExerciseWithoutUpdate(this);
            set.updateDB();
        }
    }

    public setWorkoutWithoutUpdate(workout: Workout): void {
        this.workout = workout;
        for (const set of this.sets) {
            set.setExerciseWithoutUpdate(this);
        }
    }

    public setNotes(notes: string): void {
        this.notes = notes;
        if (this.workout) this.workout.changeMade();
    }

    public reorderUp(): void {
        if (!this.workout) return;
        const exercises: Array<Exercise> = this.workout.getExercises();
        const index: number = exercises.indexOf(this);
        if (index <= 0) return;
        [exercises[index - 1], exercises[index]] = [exercises[index], exercises[index - 1]];
        this.workout.setExercises(exercises);
    }

    public reorderDown(): void {
        if (!this.workout) return;
        const exercises: Array<Exercise> = this.workout.getExercises();
        const index: number = exercises.indexOf(this);
        if (index === -1 || index >= exercises.length - 1) return;
        [exercises[index + 1], exercises[index]] = [exercises[index], exercises[index + 1]];
        this.workout.setExercises(exercises);
    }

    // getters

    /**
     * Calculates the total volume of the exercise in kilograms.
     * Volume is calculated as the sum of (reps * weight) for each set.
     * If the weight is in pounds, it is converted to kilograms.
     *
     * @returns The total volume of the exercise in kilograms.
     */
    public getVolume(): number {
        let volume: number = 0;
        for (const set of this.sets) {
            let setVolume = set.getReps() * set.getWeight();
            volume += setVolume;
        }
        return volume;
    }

    /**
     * Retrieves the sets of the exercise.
     *
     * @returns An array of JSONSet objects representing the sets of the exercise.
     */
    public getSets(): Array<Set> {
        return this.sets;
    }


    /**
     * Counts the number of sets in the exercise.
     *
     * @returns The number of sets.
     */
    public countSets(): number {
        return this.sets.length;
    }

    /**
     * Retrieves the name of the exercise.
     *
     * @returns The name of the exercise.
     */
    public getName(): string {
        return this.name;
    }

    /**
     * Retrieves the notes associated with the exercise.
     *
     * @returns The notes of the exercise.
     */
    public getNotes(): string {
        return this.notes;
    }

    public async waitForWorkout(): Promise<void> {
        while (!this.workout) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    public async getWorkoutId(): Promise<string> {
        await this.waitForWorkout();
        if (!this.workout) { return ""; }
        return this.workout.getId();
    }

    public getWorkout(): Workout | null {
        return this.workout;
    }

    public countPBSets(): number {
        let count: number = 0;
        for (const set of this.sets) {
            if (set.isItWeightPB()) {
                count++;
            }
        }
        return count;
    }
}
