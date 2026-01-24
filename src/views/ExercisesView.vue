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
        <div class="exercises-header">
            <h1 class="page-title">Exercise Library</h1>
            <p class="page-subtitle">Track your personal records and exercise statistics</p>
        </div>
        
		<Selector
			:options="[
				{ label: 'Best Weight', value: 'weight' },
				{ label: 'Best Volume', value: 'volume' },
				{ label: 'Workout Count', value: 'workouts' },
				{ label: 'Sets Count', value: 'sets' },
				{ label: 'Sets/Workout Avg', value: 'setsPerWorkout' }
			]"
			@select="whichPR = $event"
		/>
	
		<Selector
			:options="[
				{ label: 'Exercise Name', value: 'name' },
				{ label: 'Set Count', value: 'sets' },
				{ label: 'Workout Count', value: 'workouts' },
			]"
			@select="sortBy = $event"
		/>
	
		<Selector
			:options="[
				{ label: 'Ascending', value: true },
				{ label: 'Descending', value: false },
			]"
			@select="ascending = $event"
		/>
        
        <div class="exercises-table-container">
            <div v-if="exercises.length === 0" class="empty-state">
                <i class="fa-solid fa-dumbbell fa-3x"></i>
                <h3>No Exercises Found</h3>
                <p>Start working out to see your exercise statistics here!</p>
            </div>
            <div v-else class="table-wrapper">
                <table id="exerciseTable" class="exercises-table">
					<ExerciseRow
						v-for="(exercise, index) in ExerciseUtils.sortExercisesBy(exercises, sortBy, ascending)"
						:key="exercise.id"
						:exercise="exercise"
						:whichPR="whichPR"
						class="table-row"
						:style="{ animationDelay: `${index * 0.05}s` }"
					/>
                </table>
            </div>
        </div>
    </div>
</template>

<style scoped>
.exercises-header {
    text-align: center;
    margin-bottom: 30px;
    padding: 20px 0;
    border-bottom: 1px solid var(--border);
}

.page-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 10px 0;
    background: linear-gradient(135deg, var(--text) 0%, var(--accent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.page-subtitle {
    font-size: 1.1rem;
    opacity: 0.7;
    margin: 0;
    font-weight: 400;
}

.viewArea {
    padding-top: 15px;
    display: flex;
    flex-direction: column;
    gap: 25px;
}

.filters-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    padding: 25px;
    background: var(--sec);
    border-radius: 15px;
    border: 1px solid var(--border);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.filter-label {
    font-size: 0.9rem;
    font-weight: 600;
    opacity: 0.8;
    margin-bottom: 5px;
}

.exercises-table-container {
    background: var(--sec);
    border-radius: 15px;
    border: 1px solid var(--border);
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
    color: var(--text);
}

.empty-state i {
    opacity: 0.3;
    margin-bottom: 20px;
    color: var(--accent);
}

.empty-state h3 {
    font-size: 1.5rem;
    margin: 0 0 10px 0;
    font-weight: 600;
}

.empty-state p {
    opacity: 0.7;
    font-size: 1rem;
    margin: 0;
}

.table-wrapper {
    overflow-x: auto;
}

.exercises-table {
    width: 100%;
    border-collapse: collapse;
    background: transparent;
}

.table-header {
    background: var(--btnBG);
    border-bottom: 2px solid var(--border);
}

.table-header th {
    padding: 20px 15px;
    text-align: left;
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    opacity: 0.9;
}

.table-row {
    animation: fadeInUp 0.3s ease-out;
    animation-fill-mode: both;
    transition: background-color 0.2s ease;
}

.table-row:hover {
    background-color: color-mix(in srgb, var(--accent) 5%, transparent);
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .page-title {
        font-size: 2rem;
    }
    
    .filters-section {
        grid-template-columns: 1fr;
        gap: 15px;
        padding: 20px;
    }
    
    .table-header th {
        padding: 15px 10px;
        font-size: 0.85rem;
    }
}
</style>
