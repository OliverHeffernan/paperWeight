export interface WorkoutResponse {
	exercises_full: Exercise[];
	startTime: {
		day: number
		month: number;
		hour: number;
		minute: number;
		year: number;
	};
	endTime: {
		day: number | null;
		month: number | null;
		hour: number | null;
		minute: number | null;
		year: number | null;
	};
	workout_id?: string;
	user_id?: string;
	title: string;
	notes: string;
}

export interface Exercise {
	exercise: string;
	sets: Set[];
	id?: string;
}

export interface Set {
	reps: number;
	weight: number;
	unit: string;
	rest: number | null;
	notes: string;
	id?: string;
}
