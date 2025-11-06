import JSONSet from "./JSONSet";
/**
 * Interface representing an exercise in JSON format.
 * This is the form that exercise data takes when stored in the database.
 */
export default interface JSONExercise {
    exercise: string;
    sets: Array<JSONSet>;
    notes: string;
    id: string | null;
}
