import ExerciseInfo from '../classes/ExerciseInfo';

export default class ExerciseUtils {
	public static sortExercisesBy(exercises: ExerciseInfo[], sortBy: string, ascending: boolean | string): ExerciseInfo[] {
		if (typeof ascending === 'string') {
			ascending = ascending.toLowerCase() === 'true';
		}
		switch (sortBy) {
			case 'name':
				return exercises.sort((a, b) => {
					if (ascending) {
						return a.name.localeCompare(b.name);
					} else {
						return b.name.localeCompare(a.name);
					}
				});
			case 'sets':
				return exercises.sort((a, b) => {
					const aSets = a.setCount || 0;
					const bSets = b.setCount || 0;
					if (ascending) {
						return aSets - bSets;
					} else {
						return bSets - aSets;
					}
				});
			case 'workouts' :
				return exercises.sort((a, b) => {
					const aWorkouts = a.workoutCount || 0;
					const bWorkouts = b.workoutCount || 0;
					if (ascending) {
						return aWorkouts - bWorkouts;
					} else {
						return bWorkouts - aWorkouts;
					}
				});
			default:
				return exercises;
		}
	}
}
