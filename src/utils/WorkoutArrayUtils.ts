import Workout from '../classes/Workout';
export default class WorkoutArrayUtils {
    static getTotalDuration(workoutsArray: Array<Workout>): number {
        return workoutsArray.reduce((acc, workout) => acc + workout.getDuration(), 0);
    }

    static getTotalEnergy(workoutsArray: Array<Workout>): number {
        return workoutsArray.reduce((acc, workout) => acc + (workout.getEnergy() || 0), 0);
    }

    static getTotalEnergyString(workoutsArray: Array<Workout>): string {
        const totalEnergy = this.getTotalEnergy(workoutsArray);
        return `${totalEnergy} kj`;
    }

    static getTotalVolume(workoutsArray: Array<Workout>): number {
        return workoutsArray.reduce((acc, workout) => acc + workout.getVolume(), 0);
    }
    
    static getTotalVolumeString(workoutsArray: Array<Workout>): string {
        const totalVolume = this.getTotalVolume(workoutsArray);
        return `${totalVolume} kg`;
    }
}
