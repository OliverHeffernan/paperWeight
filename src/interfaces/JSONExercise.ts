/**
 * Interface representing an exercise in JSON format.
 * This is the form that exercise data takes when stored in the database.
 */
export default interface JSONExercise {
    exercise: string;
    sets: Array<{
        reps: number;
        weight: number;
        unit: string;
        notes: string
    }>;
    notes: string;
}
