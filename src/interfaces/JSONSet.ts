/**
 * Interface representing a set in a workout routine.
 * This is the form that set data takes when stored in the database.
 * This is also the form that it takes inside an Exercise object.
 */
export default interface JSONSet {
    reps?: number;
    weight?: number;
    unit?: string;
    notes?: string;
    id?: string | null;
}
