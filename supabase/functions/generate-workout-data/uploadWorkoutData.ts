import { WorkoutResponse, Exercise, Set } from './workoutResponse.ts';

async function getCurrentUserId(supabase: any): Promise<string | null> {
	const { data: { user }, error } = await supabase.auth.getUser();

	if (error) {
		console.error('Error fetching user:', error);
		return null;
	}

	if (user) {
		const userId = user.id;
		console.log('Authentic user ID:', userId);
		return userId;
	} else {
		console.log('User not found or not authenticated');
		return null;
	}
}

export default async function uploadWorkoutData(
	supabase: any,
	workoutData: WorkoutResponse,
): Promise<{ id: string | null, error: string | null }> {
	workoutData.workout_id = crypto.randomUUID();
	const user_id = await getCurrentUserId(supabase);
	if (!user_id) {
		return { id: null, error: 'User not authenticated' };
	}
	workoutData.user_id = user_id;
	console.log(workoutData.user_id);
	const exercises: Exercise[] = workoutData.exercises_full;

	for (const exercise of exercises) {
		const { data, error } = await supabase.from('exercises').select('id').eq('name', exercise.exercise.toLowerCase()).single();
		if (error || !data) {
			// Insert new exercise
			const insertResult = await supabase.from('exercises').insert({ name: exercise.exercise.toLowerCase() }).select('id').single();
			if (insertResult.error) {
				console.error('Error inserting exercise:', insertResult.error);
				return { id: null, error: insertResult.error.message };
			}
			exercise.id = insertResult.data.id;
		} else {
			exercise.id = data.id;
		}
		const { error: uploadError } = await uploadSetData(supabase, exercise, workoutData);
		if (uploadError) {
			return { id: null, error: uploadError };
		}
	}
	const { error } = await uploadWorkoutToSupabase(workoutData, supabase);
	if (error) {
		return { id: null, error };
	}
	return { id: workoutData.workout_id, error: null };
}

async function uploadSetData(
	supabase: any,
	exercise: Exercise,
	workout: WorkoutResponse,
): Promise<{ error: string | null }> {
	for (const set of exercise.sets) {
		// workout_id is null for now, will be updated later, this is due to foreign key constraints
		const { data, error } = await supabase.from('sets').insert({
			workout_id: null,
			exercise_id: exercise.id,
			weight: set.unit == "kg" ? set.weight : set.weight * 0.453592,
			reps: set.reps,
			user_id: workout.user_id,
		}).select('id').single();
		if (error) {
			console.error('Error inserting set:', error);
			return { error: error.message };
		}
		set.id = data.id;
	}
	return { error: null };
}

async function addWorkoutIdToSets(
	supabase: any,
	workout: WorkoutResponse
): Promise<{ error: string | null }> {
	for (const exercise of workout.exercises_full) {
		for (const set of exercise.sets) {
			const { error } = await supabase.from('sets').update({
				workout_id: workout.workout_id,
			}).eq('id', set.id);
			if (error) {
				console.error('Error updating set with workout_id:', error);
				return { error: error.message };
			}
		}
	}
	return { error: null };
}

async function uploadWorkoutToSupabase(
	workoutData: WorkoutResponse,
	supabase: any,
): Promise<{ id: string | null, error: string | null }> {
	// the field exercises_full should be the current exercises_full, but without the reps and weight fields in the sets, just leave the ids

	const { error } = await supabase.from('workouts').insert({
		'start_time': convertToISODateTime(workoutData.startTime),
		'end_time': convertToISODateTime(workoutData.endTime),
		'title': workoutData.title,
		'user_id': workoutData.user_id ? workoutData.user_id.trim() : null,
		'exercises_full': workoutData.exercises_full.map(exercise => ({
			exercise: exercise.exercise,
			sets: exercise.sets.map(set => ({
				id: set.id ? set.id : null
			}))
		})),
		'exercises': workoutData.exercises_full.map(exercise => exercise.exercise),
		'workout_id': workoutData.workout_id,
		'notes': workoutData.notes,
		'exercise_ids': workoutData.exercises_full.map(exercise => exercise.id ? exercise.id : null),
		'volume': getTotalVolume(workoutData),
		'set_count': workoutData.exercises_full.reduce((total, exercise) => total + exercise.sets.length, 0),
		'set_ids': workoutData.exercises_full.flatMap(exercise => exercise.sets.map(set => set.id ? set.id : null)),
	});

	if (error) {
		console.error('Error inserting workout:', error);
		return { id: null, error: error.message };
	}
	addWorkoutIdToSets(supabase, workoutData);
	return { id: workoutData.user_id ? workoutData.user_id : null, error: null };
}

function getVolume(set: Set): number {
	return set.weight * set.reps;
}

function getExerciseVolume(exercise: Exercise): number {
	return exercise.sets.reduce((total, set) => total + getVolume(set), 0);
}

function getTotalVolume(workout: WorkoutResponse): number {
	return workout.exercises_full.reduce((total, exercise) => total + getExerciseVolume(exercise), 0);
}

function convertToISODateTime(timeObj: { day: number | null; month: number | null; year: number | null; hour: number | null; minute: number | null; }): string {
	const date = dateFromJSONDate(timeObj);
	return date.toISOString();
}

function dateFromJSONDate(jsonDate: { day: number | null; month: number | null; year: number | null; hour: number | null; minute: number | null; }): Date {
	const now = new Date();

	// Validate and sanitize year (reasonable range: 1900-2100)
	let year = now.getFullYear();
	if (jsonDate.year !== null && jsonDate.year !== undefined &&
		typeof jsonDate.year === 'number' &&
		jsonDate.year >= 1900 && jsonDate.year <= 2100) {
		year = Math.floor(jsonDate.year);
	}

	// Validate and sanitize month (1-12)
	let month = now.getMonth();
	if (jsonDate.month !== null && jsonDate.month !== undefined &&
		typeof jsonDate.month === 'number' &&
		jsonDate.month >= 1 && jsonDate.month <= 12) {
		month = Math.floor(jsonDate.month) - 1; // Convert to 0-based
	}

	// Validate and sanitize hour (0-23)
	let hour = now.getHours();
	if (jsonDate.hour !== null && jsonDate.hour !== undefined &&
		typeof jsonDate.hour === 'number' &&
		jsonDate.hour >= 0 && jsonDate.hour <= 23) {
		hour = Math.floor(jsonDate.hour);
	}

	// Validate and sanitize minute (0-59)
	let minute = now.getMinutes();
	if (jsonDate.minute !== null && jsonDate.minute !== undefined &&
		typeof jsonDate.minute === 'number' &&
		jsonDate.minute >= 0 && jsonDate.minute <= 59) {
		minute = Math.floor(jsonDate.minute);
	}

	// Validate and sanitize day (more complex - depends on month/year)
	let day = now.getDate();
	if (jsonDate.day !== null && jsonDate.day !== undefined &&
		typeof jsonDate.day === 'number' && jsonDate.day >= 1) {

		// Get the maximum valid day for the given month/year
		const tempDate = new Date(year, month + 1, 0); // Last day of the month
		const maxDaysInMonth = tempDate.getDate();

		if (jsonDate.day <= maxDaysInMonth) {
			day = Math.floor(jsonDate.day);
		}
		// If day is invalid (e.g., Feb 30), keep current day or use last valid day
		else {
			day = Math.min(day, maxDaysInMonth);
		}
	}

	// Create the date with validated components
	const date = new Date(year, month, day, hour, minute, 0, 0);

	// Final safety check - if somehow the date is still invalid, return current time
	if (isNaN(date.getTime())) {
		console.warn('Failed to create valid date from JSONDate:', jsonDate, 'Using current time instead');
		return new Date();
	}

	return date;
}
