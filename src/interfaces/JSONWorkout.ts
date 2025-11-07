import JSONExercise from "./JSONExercise";

/**
 * Interface representing a workout in JSON format.
 * This is the form that workout data takes when stored in the database.
 */
export default interface JSONWorkout {
    title: string;
    workout_id: string;
    start_time: string;
    end_time: string;
    created_at: string;
    exercises: Array<string>;
    exercises_full: Array<JSONExercise>;
    notes: string;
    energy: number | null;
    heart_rate: number | null;
    volume: number | null;
    set_count: number | null;
    exercise_ids?: Array<string>
    set_ids?: Array<string>
}
