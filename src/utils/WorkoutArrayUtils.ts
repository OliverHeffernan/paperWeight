import WorkoutInfoFunctions from '../interfaces/WorkoutInfoFunctions';
import DataUtils from './DataUtils';

export default class WorkoutArrayUtils {

    static getTotalDuration(workoutsArray: Array<WorkoutInfoFunctions>): number {
        return workoutsArray.reduce((acc, workout) => acc + workout.getDuration(), 0);
    }

    static getTotalEnergy(workoutsArray: Array<WorkoutInfoFunctions>): number {
        return workoutsArray.reduce((acc, workout) => acc + (workout.getEnergy() || 0), 0);
    }

    static getTotalEnergyString(workoutsArray: Array<WorkoutInfoFunctions>): string {
        const totalEnergy = this.getTotalEnergy(workoutsArray);
        return `${DataUtils.commaNumber(totalEnergy)} kj`;
    }

    static getTotalVolume(workoutsArray: Array<WorkoutInfoFunctions>): number {
        return workoutsArray.reduce((acc, workout) => acc + workout.getVolume(), 0);
    }

    static getTotalVolumeString(workoutsArray: Array<WorkoutInfoFunctions>): string {
        const totalVolume = WorkoutArrayUtils.getTotalVolume(workoutsArray);
        return `${DataUtils.commaNumber(totalVolume)} kg`;
    }

}
