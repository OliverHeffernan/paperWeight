<script setup lang="ts">
import { supabase } from '../lib/supabase';
import ExerciseRow from '../components/ExerciseRow.vue';
import ExerciseInfo from '../classes/ExerciseInfo';
import Selector from '../components/Selector.vue';
import LoadingView from './LoadingView.vue';
import ExerciseUtils from '../utils/ExercisesUtils';

import { ref, onMounted } from 'vue';
const exercises = ref<Array<Exercise>>([]);
const whichPR = ref<string>('weight');
const sortBy = ref<string>('name');
const ascending = ref<string>('true');
const loading = ref<boolean>(true);

onMounted(async () => {
    // Fetch the list of exercises from an API or data source
    const { data, error } = await supabase
        .from('exercises')
        .select('*');
    if (error) {
        console.error('Error fetching exercises:', error);
    }
    if (!data) return;
    for (const item of data) {
        exercises.value.push(new ExerciseInfo(item));
    }

    exercises.value.sort((a, b) => a.name.localeCompare(b.name));
    loading.value = false;
});
</script>
<template>
    <LoadingView v-if="loading" />
    <div class="viewArea margins">
        <Selector
            :options="[
                { label: 'best weight', value: 'weight' },
                { label: 'best volume', value: 'volume' },
                { label: 'count workouts', value: 'workouts' },
                { label: 'count sets', value: 'sets' },
                { label: 'sets/workout avg', value: 'setsPerWorkout' }
            ]"
            @select="whichPR = $event"
        />
		<Selector
			:options="[
				{ label: 'Sort by name', value: 'name' },
				{ label: 'set count', value: 'sets' },
				{ label: 'workout count', value: 'workouts' },
			]"
			@select="sortBy = $event"
		/>
		<Selector
			:options="[
				{ label: 'Ascending', value: true },
				{ label: 'Descending', value: false },]
			"
			@select="ascending = $event"
		/>
        <table id="exerciseTable">
            <ExerciseRow
                v-for="exercise in ExerciseUtils.sortExercisesBy(exercises, sortBy, ascending)"
                :key="exercise.id"
                :exercise="exercise"
                :whichPR="whichPR"
            />
        </table>
    </div>
</template>

<style scoped>
#exerciseTable {
    width: 100%;
    border-collapse: collapse;
}

.viewArea {
    padding-top: 15px;
    display: flex;
    flex-direction: column;
    gap: 15px;
}
</style>
