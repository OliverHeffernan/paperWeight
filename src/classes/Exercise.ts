import JSONExercise from "../interfaces/JSONExercise";
import JSONSet from "../interfaces/JSONSet";
export default class Exercise {
    private name: string;
    private sets: Array<JSONSet>;
    private notes: string;

    public constructor(object: JSONExercise) {
        this.name = object.exercise;
        this.sets = object.sets;
        this.notes = object.notes;
        console.log(this.sets);
    }

    public getVolume(): number {
        let volume: number = 0;
        for (const set of this.sets) {
            let setVolume = set.reps * set.weight;
            if (set.unit === "lbs") {
                setVolume = setVolume * 0.453592; // Convert pounds to kilograms
            }
            volume += setVolume;
        }
        return volume;
    }

    public getSets(): Array<JSONSet> {
        return this.sets;
    }

    public countSets(): number {
        return this.sets.length;
    }

    public getName(): string {
        return this.name;
    }

    public getNotes(): string {
        return this.notes;
    }

    public deserialize(): JSONExercise {
        return {
            exercise: this.name,
            sets: this.sets,
            notes: this.notes
        };
    }
}
