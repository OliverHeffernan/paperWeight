import JSONExercise from "./JSONExercise";
import JSONDate from "./JSONDate";
import HeartrateStream from "./HeartrateStream";

/**
 * Interface representing a workout in JSON format.
 * This is the form that workout data takes when stored in the database.
 */
export default interface JSONWorkout {
    title: string;
    workout_id: string;
    start_time?: string;
    startTime?: JSONDate;
    endTime?: JSONDate;
    end_time?: string;
    created_at: string;
    exercises: Array<string>;
    exercises_full: Array<JSONExercise>;
    notes: string;
    energy: number | null | { amount: number | null; unit: string | null; };
    heart_rate: number | null;
	heartrate_stream: HeartrateStream | null;
    volume: number | null;
    set_count: number | null;
    exercise_ids?: Array<string>;
    set_ids?: Array<string>;
    count_pbs?: number;
}
