import { supabase } from '../lib/supabase';
import Workout from '../classes/Workout';
export default async function getWorkoutsTimeframe(frame: string): Promise<Array<Workout>> {
    if (frame !== 'all') {
        const now = new Date();
        let start: Date;
        switch (frame) {
            case 'week':
                start = getStartOfWeek(now);
                break;
            case 'month':
                start = getStartOfMonth(now);
                break;
            case 'year':
                start = getStartOfYear(now);
                break;
            default:
                throw new Error(`Invalid timeframe: ${frame}`);
        }
        return getWorkoutsInTimeframe(start, now);
    }
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

async function getWorkoutsInTimeframe(start: Date, end: Date): Promise<Array<Workout>> {
    const jsonWorkouts = await supabase
        .from('workouts')
        .select()
        .gte('start_time', start.toISOString())
        .lte('end_time', end.toISOString());

    const workouts: Array<Workout> = [];

    for (const workout of jsonWorkouts.data || []) {
        workouts.push(await Workout.create(workout));
    }

    workouts.sort((a, b) => b.getStartTime().getTime() - a.getStartTime().getTime());
    return workouts;
}

function getStartOfWeek(date: Date): Date {
    date = new Date(date);
    var day = date.getDay(),
    diff = date.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
}

function getStartOfMonth(date: Date): Date {
    const result: Date = new Date(date);
    result.setDate(1);
    result.setHours(0, 0, 0, 0);
    return result;
}

function getStartOfYear(date: Date): Date {
    const result: Date = new Date(date);
    result.setMonth(0);
    result.setDate(1);
    result.setHours(0, 0, 0, 0);
    return result;
}
