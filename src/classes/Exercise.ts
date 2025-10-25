import JSONExercise from "../interfaces/JSONExercise";
import JSONSet from "../interfaces/JSONSet";
import Workout from "./Workout";

/**
 * A class representing an exercise with its sets and notes.
 * Provides methods to calculate volume, retrieve sets, and serialize/deserialize the exercise data.
 */
export default class Exercise {
    // the name of the exercise, e.g. Bench Press.
    public name: string;
    // an array of sets for the exercise.
    private sets: Array<JSONSet>;
    // notes for the exercise.
    private notes: string;

    private workout: Workout;

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
    public constructor(object: JSONExercise, workout: Workout) {
        this.name = object.exercise;
        this.sets = object.sets;
        this.notes = object.notes;
        this.workout = workout;
    }

    /**
     * Deserializes the Exercise instance into a JSONExercise object.
     *
     * @returns A JSONExercise object representing the exercise data.
     */
    public deserialize(): JSONExercise {
        return {
            exercise: this.name,
            sets: this.sets,
            notes: this.notes
        };
    }

    // editor functions
    /**
     * add a copy of the last set to the sets array
     */
    public addNewSet(): void {
        if (this.sets.length === 0) {
            this.sets.push({ reps: 0, weight: 0, unit: "kg", notes: "" });
            return;
        }
        const lastSet: JSONSet = this.sets[this.sets.length - 1];
        const newSet: JSONSet = {
            reps: lastSet.reps,
            weight: lastSet.weight,
            unit: lastSet.unit,
            notes: lastSet.notes
        };
        this.sets.push(newSet);

        this.workout.changeMade();
    }

    public removeSet(index: number): void {
        if (index < 0 || index >= this.sets.length) {
            throw new Error("Index out of bounds");
        }
        this.sets.splice(index, 1);
        this.workout.changeMade();
    }

    public removeFromWorkout(): void {
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
        this.sets[index] = updatedSet;
        this.workout.changeMade();
    }

    // basic setters
    public setName(name: string): void {
        this.name = name;
        this.workout.changeMade();
    }

    public setNotes(notes: string): void {
        this.notes = notes;
        this.workout.changeMade();
    }

    public reorderUp(): void {
        const exercises: Array<Exercise> = this.workout.getExercises();
        const index: number = exercises.indexOf(this);
        if (index <= 0) return;
        [exercises[index - 1], exercises[index]] = [exercises[index], exercises[index - 1]];
        this.workout.setExercises(exercises);
    }

    public reorderDown(): void {
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
            let setVolume = set.reps * set.weight;
            if (set.unit === "lbs") {
                setVolume = setVolume * 0.453592; // Convert pounds to kilograms
            }
            volume += setVolume;
        }
        return volume;
    }

    /**
     * Retrieves the sets of the exercise.
     *
     * @returns An array of JSONSet objects representing the sets of the exercise.
     */
    public getSets(): Array<JSONSet> {
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

    public getWorkout(): Workout {
        return this.workout;
    }
}
