import { supabase } from '../lib/supabase';
import WorkoutInfo from '../interfaces/WorkoutInfo';
import Workout from '../classes/Workout';
export default async function getWorkouts(): Promise<Array<Workout>> {
    const jsonWorkouts = await supabase
        .from('workouts')
        .select();

    const workouts: Array<Workout> = [];

    for (const workout of jsonWorkouts.data || []) {
        workouts.push(await Workout.create(workout));
    }

    workouts.sort((a, b) => b.getStartTime().getTime() - a.getStartTime().getTime());
    return workouts;
}

export async function getWorkoutsInfo(): Promise<Array<WorkoutInfo>> {
    const { data: jsonWorkouts, error } = await supabase
        .from('workouts')
        .select('title, workout_id, start_time, end_time, energy, heart_rate, volume, set_count');

    if (error) {
        console.error('Error fetching workouts info:', error);
        return [];
    }

    const result: Array<WorkoutInfo> = [];

    for (const workout of jsonWorkouts || []) {
        result.push(new WorkoutInfo(workout));
    }

    result.sort((a, b) => b.getStartTime().getTime() - a.getStartTime().getTime());

    return result;
}

export async function getWorkoutsInfoByExercise(exerciseId: string): Promise<Array<WorkoutInfo>> {
    const { data, error } = await supabase
        .rpc('get_workouts_by_exercise_id', { exercise_id_param: exerciseId });
    if (error) {
        console.error(`Error fetching workouts for exercise ID ${exerciseId}:`, error);
        return [];
    }

    const result: Array<WorkoutInfo> = [];

    for (const workout of data || []) {
        result.push(new WorkoutInfo(workout));
    }

    result.sort((a, b) => b.getStartTime().getTime() - a.getStartTime().getTime());

    return result;
}

