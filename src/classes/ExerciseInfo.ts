import { supabase } from '../lib/supabase';
export default class ExerciseInfo {
    public name: string;
    public id: string;
    public description: string;

    public static async create(id: string): Promise<ExerciseInfo | null> {
        const { data, error } = await supabase
            .from('exercises')
            .select()
            .eq('id', id)
            .single();

        if (error) {
            console.error(`Error fetching exercise info for ID ${id}:`, error);
            return null;
        }

        return new ExerciseInfo(data);
    }

    public constructor(data: { name: string; id: string; description: string }) {
        this.name = data.name;
        this.id = data.id;
        this.description = data.description;
    }

    public getName(): string {
        return this.name;
    }

    public getId(): string {
        return this.id;
    }

    public getDescription(): string {
        return this.description;
    }

    public async getWeightPB(): Promise<number | null> {
        const { data, error } = await supabase
            .from('sets')
            .select('weight')
            .eq('exercise_id', this.id)
            .order('weight', { ascending: false })
            .limit(1);

        if (error) {
            console.error(`Error fetching weight PB for exercise ID ${this.id}:`, error);
            return Promise.resolve(null);
        }
        if (data && data.length > 0) {
            return Promise.resolve(data[0].weight);
        }
        return Promise.resolve(null);
    }

    public async getVolumePB(): Promise<number | null> {
        const { data, error } = await supabase
            .rpc('get_volume_pb', { exercise_id: this.id });
        if (error) {
            console.error(`Error fetching volume PB for exercise ID ${this.id}:`, error);
            return Promise.resolve(null);
        }
        if (data && data.length > 0) {
            return Promise.resolve(data[0].volume);
        }
        return Promise.resolve(null);
    }

    public async countSets(): Promise<number> {
        const { data, error } = await supabase
            .from('sets')
            .select('id')
            .eq('exercise_id', this.id);

        if (error) {
            console.error(`Error counting sets for exercise ID ${this.id}:`, error);
            return Promise.resolve(0);
        }
        return Promise.resolve(data ? data.length : 0);
    }

    public async getSetCount(): Promise<number> {
        const { data, error } = await supabase
            .from('sets')
            .select('id')
            .eq('exercise_id', this.id);

        if (error) {
            console.error(`Error fetching set count for exercise ID ${this.id}:`, error);
            return Promise.resolve(0);
        }
        return Promise.resolve(data ? data.length : 0);
    }

    public async delete(): Promise<boolean> {
        const { error } = await supabase
            .from('exercises')
            .delete()
            .eq('id', this.id);

        if (error) {
            console.error(`Error deleting exercise ID ${this.id}:`, error);
            return false;
        }
        return true;
    }
}
