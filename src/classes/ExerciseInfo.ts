import { supabase } from '../lib/supabase';
import { getWorkoutsInfoByExercise } from '../utils/getWorkouts';
export default class ExerciseInfo {
    public name: string;
    public id: string;
    public description: string;
	public weightPB: number | null = null;
	public volumePB: number | null = null;
	public setCount: number | null = null;
	public workoutCount: number | null = null;
	public aliases: string[] = [];

    public static async create(id: string): Promise<ExerciseInfo | null> {
		// I need to fetch the exercise info from the database, and in parallel fetch the aliases from the exercise_aliases table
		// Then I need to combine the two results into a single ExerciseInfo object
		// I can use Promise.all to run the two requests in parallel
		// First, fetch the aliases
		const aliasesPromise = supabase
			.from('exercise_aliases')
			.select('alias')
			.eq('exercise_id', id);

		// Then, fetch the exercise info
		const exerciseInfoPromise = supabase
			.from('exercises')
			.select()
			.eq('id', id)
			.single();

		// Wait for both requests to complete
		const [aliasesResult, exerciseInfoResult] = await Promise.all([aliasesPromise, exerciseInfoPromise]);

		// Check for errors
		const { data: aliasesData, error: aliasesError } = aliasesResult;
		const { data, error } = exerciseInfoResult;

		if (aliasesError) {
			console.error(`Error fetching aliases for exercise ID ${id}:`, aliasesError);
			return null;
		}

		// If no error, extract the aliases
		const aliases = aliasesData ? aliasesData.map((row) => row.alias) : [];

		if (data) {
			data.aliases = aliases;
		}

		if (error) {
			console.error(`Error fetching exercise info for ID ${id}:`, error);
			return null;
		}

		return new ExerciseInfo(data);
    }

	public async getMoreInfo(): Promise<void> {
		// Run all the requests in parallel using Promise.all
		const [weightPB, volumePB, setCount, workoutInfos] = await Promise.all([
			this.getWeightPB(),
			this.getVolumePB(),
			this.getSetCount(),
			getWorkoutsInfoByExercise(this.id)
		]);

		// Assign the results
		this.weightPB = weightPB;
		this.volumePB = volumePB;
		this.setCount = setCount;
		this.workoutCount = workoutInfos.length;
	}

    public constructor(data: { name: string; id: string; description: string, aliases?: string[] }) {
		this.aliases = data.aliases || [];
        this.name = data.name;
        this.id = data.id;
        this.description = data.description;
    }

    public getName(): string {
        return this.name;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public getId(): string {
        return this.id;
    }

    public getDescription(): string {
        return this.description;
    }

    public setDescription(description: string): void {
        this.description = description;
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
            return null;
        }
        if (data && data.length > 0) {
            return data[0].weight;
        }
        return null;
    }

    public async getVolumePB(): Promise<number | null> {
        const { data, error } = await supabase
            .rpc('get_volume_pb', { exercise_id: this.id });
        if (error) {
            console.error(`Error fetching volume PB for exercise ID ${this.id}:`, error);
            return null;
        }
        if (data && data.length > 0) {
            return data[0].volume;
        }
        return null;
    }

    public async getSetCount(): Promise<number> {
        const { data, error } = await supabase
            .from('sets')
            .select('id')
            .eq('exercise_id', this.id);

        if (error) {
            console.error(`Error fetching set count for exercise ID ${this.id}:`, error);
            return 0;
        }
        return data ? data.length : 0;
    }

	public getAliases(): string[] {
		return this.aliases;
	}

	public getAliasString(): string{
		return this.aliases.join(', ');
	}

    // Alias for backwards compatibility
    public async countSets(): Promise<number> {
        return this.getSetCount();
    }

    public async delete(): Promise<boolean> {
        const { error } = await supabase
            .from('exercises')
            .delete()
            .eq('id', this.id);

        // remove any remaining unreferenced sets
        supabase
            .from('sets')
            .delete()
            .eq('exercise_id', this.id);

        if (error) {
            console.error(`Error deleting exercise ID ${this.id}:`, error);
            return false;
        }
        return true;
    }

	public async setAliasesFromString(aliasesString: string): Promise<void> {
		const aliases = aliasesString.split(',').map(alias => alias.trim()).filter(alias => alias.length > 0);
		await this.setAliases(aliases);
	}

	public async setAliases(aliases: string[]): Promise<void> {
		// make it all lowercase
		aliases = aliases.map(alias => alias.toLowerCase());
		// Remove duplicates
		aliases = Array.from(new Set(aliases));

		// Find new aliases to add and aliases to remove
		this.aliases = aliases;
		const newAliases: string[] = aliases.filter(alias => this.aliases.includes(alias));
		const removedAliases: string[] = this.aliases.filter(alias => !aliases.includes(alias));

		const promises: any[] = [];

		newAliases.forEach(alias => {
			promises.push(
				supabase
					.from('exercise_aliases')
					.insert({ exercise_id: this.id, alias })
			)
		});

		removedAliases.forEach(alias => {
			promises.push(
				supabase
					.from('exercise_aliases')
					.delete()
					.eq('exercise_id', this.id)
					.eq('alias', alias)
			);
		});

		Promise.all(promises)
			.then(() => {
				this.aliases = aliases;
			})
			.catch(error => {
				console.error(`Error updating aliases for exercise ID ${this.id}:`, error);
			});
	}
}
