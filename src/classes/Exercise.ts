import JSONExercise from "../interfaces/JSONExercise";
import JSONSet from "../interfaces/JSONSet";

/**
 * A class representing an exercise with its sets and notes.
 * Provides methods to calculate volume, retrieve sets, and serialize/deserialize the exercise data.
 */
export default class Exercise {
    // the name of the exercise, e.g. Bench Press.
    private name: string;
    // an array of sets for the exercise.
    private sets: Array<JSONSet>;
    // notes for the exercise.
    private notes: string;

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
    public constructor(object: JSONExercise) {
        this.name = object.exercise;
        this.sets = object.sets;
        this.notes = object.notes;
    }

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
}
