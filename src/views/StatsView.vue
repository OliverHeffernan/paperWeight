<script setup lang="ts">
import { nextTick } from 'vue';
import Selector from '../components/Selector.vue';
import WorkoutVolumeByWorkout from '../components/charts/WorkoutVolumeByWorkout.vue';
import DashboardStatBubble from '../components/DashboardStatBubble.vue';
import Workout from '../classes/Workout';
import { supabase } from '../lib/supabase';
import { getWorkoutsInfo } from '../utils/getWorkouts';
import DateUtils from '../utils/DateUtils';
import WorkoutArrayUtils from '../utils/WorkoutArrayUtils';
import ErrorPopup from '../components/ErrorPopup.vue';
import ErrorDisplay from '../classes/ErrorDisplay';
import WorkoutInfo from '../interfaces/WorkoutInfo';

import { ref, onMounted } from 'vue';
let workouts: Array<WorkoutInfo> = [];
const workoutsRef = ref<Array<WorkoutInfo>>([]);
const prevWorkoutsRef = ref<Array<WorkoutInfo>>([]);
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

	const workoutsFiltered: Array<WorkoutInfo> = [];
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
		workouts = await getWorkoutsInfo();
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
			<div class="dashboard-header">
				<h1 class="page-title">Workout Dashboard</h1>
				<p class="page-subtitle">Track your fitness journey and monitor your progress</p>
			</div>

			<div class="controls-section">
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
					<i class="fa-solid fa-chevron-left clickable period-nav" @click="backTimes = backTimes + 1; updateWorkouts(graphSize);"></i>
					<div class="period-display">
						{{ DateUtils.getPeriodString(graphSize, backTimes) }}
					</div>
					<i v-if="backTimes !== 0" class="fa-solid fa-chevron-right clickable period-nav" @click="backTimes = backTimes > 0 ? backTimes - 1 : 0; updateWorkouts(graphSize);"></i>
				</div>
			</div>

			<div class="stats-grid">
				<DashboardStatBubble
					label="Total Workouts"
					:value="workoutsRef.length"
					:prevValue="prevWorkoutsRef.length"
					:dispValue="workoutsRef.length.toString()"
					icon="fa-dumbbell"
					:selected="whatGraphed === 'workouts'"
					@click="whatGraphed = 'workouts'"
					class="stat-card"
				/>
				<DashboardStatBubble
					label="Total Time"
					:value="WorkoutArrayUtils.getTotalDuration(workoutsRef)"
					:prevValue="WorkoutArrayUtils.getTotalDuration(prevWorkoutsRef)"
					:dispValue="DateUtils.getDurationString(WorkoutArrayUtils.getTotalDuration(workoutsRef))||'--'"
					icon="fa-clock"
					:selected="whatGraphed === 'time'"
					@click="whatGraphed = 'time'"
					class="stat-card"
				/>
				<DashboardStatBubble
					label="Total Energy"
					:value="WorkoutArrayUtils.getTotalEnergy(workoutsRef)"
					:prevValue="WorkoutArrayUtils.getTotalEnergy(prevWorkoutsRef)"
					:dispValue="WorkoutArrayUtils.getTotalEnergyString(workoutsRef)"
					icon="fa-fire"
					:selected="whatGraphed === 'energy'"
					@click="whatGraphed = 'energy'"
					class="stat-card"
				/>
				<DashboardStatBubble
					label="Total Volume"
					:value="WorkoutArrayUtils.getTotalVolume(workoutsRef)"
					:prevValue="WorkoutArrayUtils.getTotalVolume(prevWorkoutsRef)"
					:dispValue="WorkoutArrayUtils.getTotalVolumeString(workoutsRef)"
					icon="fa-weight-hanging"
					:selected="whatGraphed === 'volume'"
					@click="whatGraphed = 'volume'"
					class="stat-card"
				/>
			</div>

			<div v-if="isLoading" class="loading-state">
				<i class="fa-solid fa-spinner fa-spin"></i>
				<p>Loading workouts...</p>
			</div>
			<WorkoutVolumeByWorkout
				v-else
				:workouts="workoutsRef"
				:graphSize="graphSize"
				:binSize="getBinSize(graphSize)"
				:whatGraphed="whatGraphed"
				:backTimes="backTimes"
				class="chart-container"
			/>
		</div>
	</div>
</template>
<style scoped>
.dashboard-header {
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
	opacity: 0.7;
	font-weight: 500;
	font-size: 1.1rem;
	margin: 0;
}

.margins {
	display: flex;
	flex-direction: column;
	gap: 25px;
}

.controls-section {
	display: flex;
	flex-direction: column;
	gap: 15px;
	align-items: center;
	padding: 20px;
	background: var(--sec);
	border-radius: 15px;
	border: 1px solid var(--border);
}

.stats-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: 20px;
	margin: 20px 0;
}

.stat-card {
	transition: transform 0.2s ease, box-shadow 0.2s ease;
	border-radius: 12px;
	overflow: hidden;
}

.stat-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.periodSelect {
	position: relative;
	display: flex;
	font-weight: 600;
	align-items: center;
	justify-content: center;
	margin: 10px 0;
	background: var(--btnBG);
	border: 1px solid var(--border);
	border-radius: 25px;
	padding: 10px 20px;
	min-width: 200px;
}

.period-nav {
	position: absolute;
	padding: 8px;
	border-radius: 50%;
	transition: all 0.2s ease;
}

.period-nav:hover {
	background: var(--accent);
	color: var(--prim);
}

.period-nav.fa-chevron-left {
	left: 10px;
}

.period-nav.fa-chevron-right {
	right: 10px;
}

.period-display {
	padding: 0 40px;
	text-align: center;
}

.chart-section {
	background: var(--sec);
	border-radius: 15px;
	padding: 25px;
	border: 1px solid var(--border);
	box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.loading-state {
	text-align: center;
	padding: 40px;
}

.loading-state i {
	font-size: 2rem;
	color: var(--accent);
	margin-bottom: 15px;
}

.loading-state p {
	font-size: 1.1rem;
	opacity: 0.7;
	margin: 0;
}

.chart-container {
	width: 100%;
	height: 100%;
}

@media (max-width: 768px) {
	.page-title {
		font-size: 2rem;
	}

	.stats-grid {
		grid-template-columns: 1fr;
		gap: 15px;
	}

	.chart-section {
		padding: 15px;
	}
}
</style>
