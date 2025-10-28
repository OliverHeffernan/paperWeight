<script setup lang="ts">
import { nextTick } from 'vue';
import NavBar from '../components/NavBar.vue';
import Selector from '../components/Selector.vue';
import WorkoutVolumeByWorkout from '../components/charts/WorkoutVolumeByWorkout.vue';
import DashboardStatBubble from '../components/DashboardStatBubble.vue';
import Workout from '../classes/Workout';
import { supabase } from '../lib/supabase';
import getWorkouts from '../utils/getWorkouts';
import DateUtils from '../utils/DateUtils';
import WorkoutArrayUtils from '../utils/WorkoutArrayUtils';

import { ref, onMounted } from 'vue';
let workouts: Array<Workout> = [];
const workoutsRef = ref<Array<Workout>>([]);
const prevWorkoutsRef = ref<Array<Workout>>([]);
const isLoading = ref<boolean>(true);
const graphSize = ref<string>('week');

function getBinSize(graphSize: string): string {
    switch (graphSize) {
        case 'week':
            return 'day';
        case 'month':
            return 'day';
        case 'year':
            return 'month';
        default:
            return 'month';
    }
}

async function updateWorkouts(timeframe: string) {
    graphSize.value = timeframe;
    isLoading.value = true;

    if (timeframe === 'all') {
        workoutsRef.value = [...workouts]; // Create a new array reference
        await nextTick();
        isLoading.value = false;
        return;
    }
    console.log('updateWorkouts called with:', timeframe);
    const end = new Date();
    const start = DateUtils.getStart(end, timeframe);

    const startPrevious = DateUtils.getStartOfPrevious(start, timeframe);

    const workoutsFiltered: Array<Workout> = [];
    prevWorkoutsRef.value = [];

    for (const workout of workouts) {
        if (workout.getStartTime() >= start && workout.getStartTime() <= end) {
            workoutsFiltered.push(workout);
        }

        if (workout.getStartTime() >= startPrevious && workout.getStartTime() < start) {
            prevWorkoutsRef.value.push(workout);
        }
    }

    console.log('Filtered workouts:', workoutsFiltered.length);
    workoutsRef.value = workoutsFiltered;
    await nextTick();
    isLoading.value = false;
}

onMounted(async () => {
    try {
        console.log('Loading workouts...');
        workouts = await getWorkouts();
        console.log('Loaded workouts:', workouts.length);
        await updateWorkouts('week');
        isLoading.value = false;
    } catch (error) {
        console.error('Failed to load workouts:', error);
        // Set empty array so component doesn't break
        workouts = [];
        workoutsRef.value = [];
        isLoading.value = false;
    }
});


</script>
<template>
    <div class="viewArea">
        <div class="margins">
            <h1>Workout Dashboard</h1>
            <p>Track your fitness journey and monitor your progress</p>
            <Selector
                :options="[
                    { label: 'This Week', value: 'week' },
                    { label: 'This Month', value: 'month' },
                    { label: 'This Year', value: 'year' },
                    { label: 'All Time', value: 'all' }
                ]"
                @select="updateWorkouts($event)"
            />
            <div class="flex">
                <DashboardStatBubble
                    label="Total Workouts"
                    :value="workoutsRef.length"
                    :prevValue="prevWorkoutsRef.length"
                    :dispValue="workoutsRef.length.toString()"
                    icon="fa-dumbbell"
                />
                <DashboardStatBubble
                    label="Total Time"
                    :value="WorkoutArrayUtils.getTotalDuration(workoutsRef)"
                    :prevValue="WorkoutArrayUtils.getTotalDuration(prevWorkoutsRef)"
                    :dispValue="DateUtils.getDurationString(WorkoutArrayUtils.getTotalDuration(workoutsRef))"
                    icon="fa-clock"
                />
                <DashboardStatBubble
                    label="Total Energy"
                    :value="WorkoutArrayUtils.getTotalEnergy(workoutsRef)"
                    :prevValue="WorkoutArrayUtils.getTotalEnergy(prevWorkoutsRef)"
                    :dispValue="WorkoutArrayUtils.getTotalEnergyString(workoutsRef)"
                    icon="fa-fire"
                />
                <DashboardStatBubble
                    label="Total Volume"
                    :value="WorkoutArrayUtils.getTotalVolume(workoutsRef)"
                    :prevValue="WorkoutArrayUtils.getTotalVolume(prevWorkoutsRef)"
                    :dispValue="WorkoutArrayUtils.getTotalVolumeString(workoutsRef)"
                    icon="fa-weight-hanging"
                />
            </div>
            <div v-if="isLoading">
                <p>Loading workouts...</p>
            </div>
            <WorkoutVolumeByWorkout
                v-else
                :workouts="workoutsRef"
                :graphSize="graphSize"
                :binSize="getBinSize(graphSize)"
            />
        </div>
    </div>
    <NavBar active="/stats" />
</template>
<style scoped>
p {
    opacity: 0.6;
    font-weight: 500;
}

.flex {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
}

.margins {
    display: flex;
    flex-direction: column;
    gap: 15px;
}
</style>
