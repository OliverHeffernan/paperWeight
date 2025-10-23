export default interface JSONExercise {
    exercise: string;
    sets: Array<{
        reps: number;
        weight: number;
        unit: string;
        notes: string
    }>;
    notes: string;
}
