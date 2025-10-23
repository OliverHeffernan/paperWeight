import JSONExercise from "./JSONExercise";
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
}
