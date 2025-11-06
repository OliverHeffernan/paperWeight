import { supabase } from '../lib/supabase';
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
