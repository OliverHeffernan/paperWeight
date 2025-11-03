<script setup lang="ts">
import { nextTick } from 'vue';
import Selector from '../components/Selector.vue';
import WorkoutVolumeByWorkout from '../components/charts/WorkoutVolumeByWorkout.vue';
import DashboardStatBubble from '../components/DashboardStatBubble.vue';
import Workout from '../classes/Workout';
import { supabase } from '../lib/supabase';
import getWorkouts from '../utils/getWorkouts';
import DateUtils from '../utils/DateUtils';
import WorkoutArrayUtils from '../utils/WorkoutArrayUtils';
import ErrorPopup from '../components/ErrorPopup.vue';
import ErrorDisplay from '../classes/ErrorDisplay';

import { ref, onMounted } from 'vue';
let workouts: Array<Workout> = [];
const workoutsRef = ref<Array<Workout>>([]);
const prevWorkoutsRef = ref<Array<Workout>>([]);
const isLoading = ref<boolean>(true);
const graphSize = ref<string>('week');
const whatGraphed = ref<string>('volume');
const backTimes = ref<number>(0);

const errorDisplay = ref<ErrorDisplay>(new ErrorDisplay());

function getBinSize(graphSize: string): string {
    switch (graphSize) {
        case 'week':
            return 'day';
        case 'month':
            return 'week';
        case 'year':
            return 'month';
        default:
            return 'year';
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
    const end = DateUtils.getEnd(DateUtils.addPeriod(new Date(), timeframe, -backTimes.value), timeframe);
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

    workoutsRef.value = workoutsFiltered;
    await nextTick();
    isLoading.value = false;
}

onMounted(async () => {
    try {
        workouts = await getWorkouts();
        await updateWorkouts('week');
        isLoading.value = false;
    } catch (error) {
        errorDisplay.value.setError('Failed to load workouts. Please try again later.');
        console.error('Failed to load workouts:', error);
        // Set empty array so component doesn't break
        workouts = [];
        workoutsRef.value = [];
        isLoading.value = false;
    }
});

</script>
<template>
    <ErrorPopup :error="errorDisplay" />
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
                @select="backTimes = 0; updateWorkouts($event)"
            />
            <div v-if="graphSize !== 'all'" class="periodSelect">
                <i class="fa-solid fa-chevron-left clickable floatleft" @click="backTimes = backTimes + 1; updateWorkouts(graphSize);"></i>
                <div class="center">
                    {{ DateUtils.getPeriodString(graphSize, backTimes) }}
                </div>
                <i v-if="backTimes !== 0" class="fa-solid fa-chevron-right clickable floatright" @click="backTimes = backTimes > 0 ? backTimes - 1 : 0; updateWorkouts(graphSize);"></i>
            </div>
            <div class="flex">
                <DashboardStatBubble
                    label="Total Workouts"
                    :value="workoutsRef.length"
                    :prevValue="prevWorkoutsRef.length"
                    :dispValue="workoutsRef.length.toString()"
                    icon="fa-dumbbell"
                    :selected="whatGraphed === 'workouts'"
                    @click="whatGraphed = 'workouts'"
                />
                <DashboardStatBubble
                    label="Total Time"
                    :value="WorkoutArrayUtils.getTotalDuration(workoutsRef)"
                    :prevValue="WorkoutArrayUtils.getTotalDuration(prevWorkoutsRef)"
                    :dispValue="DateUtils.getDurationString(WorkoutArrayUtils.getTotalDuration(workoutsRef))||'--'"
                    icon="fa-clock"
                    :selected="whatGraphed === 'time'"
                    @click="whatGraphed = 'time'"
                />
                <DashboardStatBubble
                    label="Total Energy"
                    :value="WorkoutArrayUtils.getTotalEnergy(workoutsRef)"
                    :prevValue="WorkoutArrayUtils.getTotalEnergy(prevWorkoutsRef)"
                    :dispValue="WorkoutArrayUtils.getTotalEnergyString(workoutsRef)"
                    icon="fa-fire"
                    :selected="whatGraphed === 'energy'"
                    @click="whatGraphed = 'energy'"
                />
                <DashboardStatBubble
                    label="Total Volume"
                    :value="WorkoutArrayUtils.getTotalVolume(workoutsRef)"
                    :prevValue="WorkoutArrayUtils.getTotalVolume(prevWorkoutsRef)"
                    :dispValue="WorkoutArrayUtils.getTotalVolumeString(workoutsRef)"
                    icon="fa-weight-hanging"
                    :selected="whatGraphed === 'volume'"
                    @click="whatGraphed = 'volume'"
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
                :whatGraphed="whatGraphed"
                :backTimes="backTimes"
            />
        </div>
    </div>
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

.floatright {
    position: absolute;
    right: 0;
}

.floatleft {
    position: absolute;
    left: 0;
}

.center {
    padding: 0 30px;
}

.periodSelect {
    position: relative;
    display: flex;
    font-weight: 600;
    align-items: center;
    justify-content: center;
    margin-top: 10px;
    margin-bottom: 10px;
}
</style>
