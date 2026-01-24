<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { supabase } from '../lib/supabase';
import Workout from '../classes/Workout';
import LoadingView from '../views/LoadingView.vue';
import WorkoutOverview from '../components/WorkoutOverview.vue';
import ExerciseContainer from '../components/ExerciseContainer.vue';
import SavingDisplay from '../components/SavingDisplay.vue';
import BubbleButton from '../components/BubbleButton.vue';
import WorkoutDetailsEditModal from '../components/WorkoutDetailsEditModal.vue';
import HeartRateChart from '../components/charts/HeartRateChart.vue';

import ErrorPopup from '../components/ErrorPopup.vue';
import ErrorDisplay from '../classes/ErrorDisplay';

const props = defineProps(['workout_id']);

const workout = ref<Workout | null>(null);
const showSets = ref<boolean>(true);
const loading = ref<boolean>(true);
const weightPbSets = ref<Array<string>>([]);
const volumePbSets = ref<Array<string>>([]);

const editingDetails = ref<boolean>(false);
const isSyncingStrava = ref<boolean>(false);
const stravaMessage = ref<string>('');
const stravaMessageType = ref<'success' | 'error'>('success');
const showHeartRateChart = ref<boolean>(false);

const errorDisplay = ref<ErrorDisplay>(new ErrorDisplay());

onMounted(async () => {
	const fetch = await Workout.fetchById(props.workout_id);
	workout.value = fetch.workout;
	loading.value = false;
	console.log(workout.value);

	const weightPbsRequest = await supabase
		.rpc('get_weight_pbs', { pb_exercise_ids: await workout.value.getExerciseIds() });
	if (weightPbsRequest.error) {
		console.error('Error fetching weight PBs:', weightPbsRequest.error);
		return;
	}
	if (weightPbsRequest.data && Array.isArray(weightPbsRequest.data)) {
		weightPbSets.value = weightPbsRequest.data.map((item: any) => item.id);
	}

	const volumePbsRequest = await supabase
		.rpc('get_volume_pbs', { pb_exercise_ids: await workout.value.getExerciseIds() });
	if (volumePbsRequest.error) {
		console.error('Error fetching volume PBs:', volumePbsRequest.error);
		return;
	}
	if (volumePbsRequest.data && Array.isArray(volumePbsRequest.data)) {
		volumePbSets.value = volumePbsRequest.data.map((item: any) => item.id);
	}

	// Check Strava connection
	await checkStravaConnection();
});

// Check if user has Strava connected
const isStravaConnected = ref<boolean>(false);
const checkStravaConnection = async () => {
	try {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return;

		const { data: profile, error } = await supabase
			.from('profiles')
			.select('strava_access_token')
			.eq('id', user.id)
			.single();

		if (error) {
			console.error('Error fetching profile:', error);
			return;
		}

		if (profile?.strava_access_token) {
			isStravaConnected.value = true;
		}
	} catch (error) {
		console.error('Error checking Strava connection:', error);
	}
};

// Sync this specific workout with Strava
const syncWorkoutWithStrava = async () => {
	if (!workout.value) return;

	try {
		isSyncingStrava.value = true;
		stravaMessage.value = '';

		const { data: { session } } = await supabase.auth.getSession();
		if (!session) {
			throw new Error('Not authenticated');
		}

		const response = await fetch(
			`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetchStrava`,
			{
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${session.access_token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ workout_id: workout.value.workout_id }),
			}
		);

		if (!response.ok) {
			throw new Error('Failed to sync workout');
		}

		const result = await response.json();
		console.log('Sync result:', result);

		if (result.linkedActivity) {
			stravaMessage.value = 'Workout synced successfully with Strava!';
			stravaMessageType.value = 'success';

			// Refresh workout data to show updated Strava info
			const fetch = await Workout.fetchById(props.workout_id);
			workout.value = fetch.workout;
		} else {
			stravaMessage.value = 'No matching Strava activity found for this workout.';
			stravaMessageType.value = 'error';
		}

		// Clear message after 3 seconds
		setTimeout(() => {
			stravaMessage.value = '';
		}, 3000);

	} catch (error) {
		console.error('Sync error:', error);
		stravaMessage.value = 'Failed to sync workout. Please try again.';
		stravaMessageType.value = 'error';

		setTimeout(() => {
			stravaMessage.value = '';
		}, 3000);
	} finally {
		isSyncingStrava.value = false;
	}
};



</script>
<template>
	<error-popup :error="errorDisplay" />
	<WorkoutDetailsEditModal
		v-if="editingDetails && workout"
		:workout="workout"
		@cancel="editingDetails = false"
	/>

	<div class="workout-view-container" v-if="workout">
		<div class="workout-content margins">
			<!-- Workout Header -->
			<div class="workout-header">
				<div class="header-content">
					<h1 class="workout-title">
						{{ workout.getTitle() }}
						<i
							class="fas fa-edit clickable"
							@click="editingDetails = true"
						></i>
					</h1>
					<p class="workout-date">{{ workout.getDateString() }}</p>
					<div v-if="workout.getNotes() !== ''" class="workout-notes">
						<p>{{ workout.getNotes() }}</p>
					</div>
				</div>
			</div>

			<!-- Workout Overview Section -->
			<div class="overview-section">
				<div class="section-header">
					<h2 class="section-title">
						<i class="fa-solid fa-chart-simple section-icon"></i>
						Workout Overview
					</h2>
				</div>
				<WorkoutOverview :workout="workout" />
			</div>
			<!-- Heart Rate Section -->
			<div v-if="workout.getHeartrateStream()" class="heart-rate-section">
				<div class="section-header">
					<h2 class="section-title">
						<i class="fa-solid fa-heart section-icon heart-icon"></i>
						Heart Rate Data
					</h2>
				</div>

				<BubbleButton
					@click="showHeartRateChart = !showHeartRateChart"
					fullWidth
					class="toggle-button"
				>
					<i class="fa-solid" :class="showHeartRateChart ? 'fa-eye-slash' : 'fa-heart'"></i>
					{{ showHeartRateChart ? 'Hide Heart Rate Chart' : 'Show Heart Rate Chart' }}
				</BubbleButton>

				<div v-if="showHeartRateChart" class="heart-rate-chart-container">
					<div class="hr-stats">
						<div class="hr-stat">
							<div class="label">Average</div>
							<div class="value">{{ Math.round(workout.getHeartrateStream()!.data.reduce((a, b) => a + b, 0) / workout.getHeartrateStream()!.data.length) }} BPM</div>
						</div>
						<div class="hr-stat">
							<div class="label">Maximum</div>
							<div class="value">{{ Math.max(...workout.getHeartrateStream()!.data) }} BPM</div>
						</div>
						<div class="hr-stat">
							<div class="label">Minimum</div>
							<div class="value">{{ Math.min(...workout.getHeartrateStream()!.data) }} BPM</div>
						</div>
					</div>
					<HeartRateChart 
						:heartrate-stream="workout.getHeartrateStream()!"
						:workout-duration="workout.getDuration()"
					/>
				</div>
			</div>

			<!-- Strava Section -->
			<div v-if="isStravaConnected" class="strava-section">

				<BubbleButton
					v-if="!workout.linked_strava_id"
					@click="syncWorkoutWithStrava"
					:disabled="isSyncingStrava"
					fullWidth
					orange
					class="strava-sync-btn"
				>
					<i class="fab fa-strava" v-if="!isSyncingStrava"></i>
					<i class="fa-solid fa-spinner fa-spin" v-else></i>
					{{ isSyncingStrava ? 'Syncing...' : 'Sync with Strava' }}
				</BubbleButton>

				<div v-if="workout.linked_strava_id" class="strava-status">
					<i class="fab fa-strava"></i>
					<span>Linked to Strava Activity</span>
					<span class="activity-id">#{{ workout.linked_strava_id }}</span>
				</div>

				<div v-if="stravaMessage" class="sync-message" :class="stravaMessageType">
					<i :class="stravaMessageType === 'success' ? 'fa-solid fa-check-circle' : 'fa-solid fa-exclamation-triangle'"></i>
					{{ stravaMessage }}
				</div>
			</div>

			<!-- Exercises Section -->
			<div class="exercises-section">
				<div class="section-header exercises-header">
					<h2 class="section-title">
						<i class="fa-solid fa-dumbbell section-icon"></i>
						Exercises
						<span class="exercise-count">({{ workout.getExercises().length }})</span>
					</h2>
					<BubbleButton
						@click="showSets = !showSets"
						class="toggle-sets-button"
						fullWidth
					>
						<i class="fa-solid" :class="showSets ? 'fa-eye-slash' : 'fa-eye'"></i>
						{{ showSets ? 'Hide Sets' : 'Show Sets' }}
					</BubbleButton>
				</div>

				<div class="exercises-grid">
					<ExerciseContainer
						v-for="(exercise, index) in workout.getExercises()"
						:key="exercise.getName()"
						:exercise="exercise"
						:showSets="showSets"
						:index="index"
						:weightPbSets="weightPbSets"
						:volumePbSets="volumePbSets"
						class="exercise-item"
					/>
				</div>

				<BubbleButton
					@click="workout.addEmptyExercise()"
					fullWidth
					class="add-exercise-button"
				>
					<i class="fa-solid fa-plus"></i> Add Exercise
				</BubbleButton>
			</div>

			<SavingDisplay :workout="workout" />
		</div>
	</div>
	<LoadingView v-if="loading" />
</template>

<style scoped>
.workout-view-container {
	min-height: 100vh;
	background: linear-gradient(135deg, var(--prim) 0%, var(--sec) 20%);
	padding: 20px 0;
}

.workout-content {
	max-width: 1000px;
	margin: 0 auto;
	display: flex;
	flex-direction: column;
	gap: 30px;
}

/* Workout Header */
.workout-header {
	background: var(--sec);
	border: 1px solid var(--border);
	border-radius: 20px;
	padding: 30px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
	animation: slideUp 0.6s ease-out;
	box-sizing: border-box;
}

.workout-header i {
	font-size: 1.4rem;
}

.header-content {
	display: flex;
	flex-direction: column;
	gap: 15px;
}

.workout-title {
	font-size: 2.5rem;
	display: inline;
	flex-direction: row;
	font-weight: 700;
	margin: 0;
	align-items: center;
	gap: 15px;
	background: linear-gradient(135deg, var(--text) 0%, var(--accent) 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}

.edit-details-button {
	background: none;
	border: none;
	color: var(--accent);
	font-size: 1.2rem;
	padding: 10px;
	border-radius: 8px;
	cursor: pointer;
	transition: all 0.3s ease;
	opacity: 0.7;
}

.edit-details-button:hover {
	opacity: 1;
	background: color-mix(in srgb, var(--accent) 10%, transparent);
	transform: scale(1.1);
}

.workout-date {
	font-size: 1.1rem;
	color: var(--border);
	margin: 0;
	opacity: 0.8;
	font-weight: 500;
}

.workout-notes {
	background: var(--btnBG);
	border: 1px solid var(--border);
	border-radius: 12px;
	padding: 15px;
	margin-top: 10px;
}

.workout-notes p {
	margin: 0;
	line-height: 1.6;
	opacity: 0.9;
}

/* Section Styles */
.overview-section,
.heart-rate-section,
.strava-section,
.exercises-section {
	background: var(--sec);
	border: 1px solid var(--border);
	border-radius: 20px;
	padding: 30px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
	animation: slideUp 0.6s ease-out;
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 25px;
	padding-bottom: 15px;
	border-bottom: 1px solid var(--border);
}

.section-title {
	font-size: 1.5rem;
	font-weight: 700;
	margin: 0;
	display: flex;
	align-items: center;
	gap: 12px;
	color: var(--text);
}

.section-icon {
	font-size: 1.3rem;
	color: var(--accent);
}

.heart-icon {
	color: #fc4c02;
}

.strava-icon {
	color: #fc4c02;
}

.exercise-count {
	font-size: 1rem;
	opacity: 0.7;
	font-weight: 400;
}

/* Button Styles */
.toggle-button,
.toggle-sets-button,
.add-exercise-button {
	margin-top: 15px;
	border-radius: 12px;
	font-weight: 600;
	transition: all 0.3s ease;
}

.toggle-sets-button {
	margin-top: 0;
	padding: 8px 16px;
	font-size: 0.9rem;
}

.add-exercise-button {
	margin-top: 20px;
}

/* Heart Rate Styles */
.heart-rate-chart-container {
	margin-top: 20px;
	padding: 20px;
	background: var(--btnBG);
	border: 1px solid var(--border);
	border-radius: 15px;
}

.hr-stats {
	display: flex;
	justify-content: space-around;
	flex-wrap: wrap;
	gap: 15px;
	padding: 20px;
	background: color-mix(in srgb, var(--accent) 5%, transparent);
	border-radius: 12px;
	margin-bottom: 20px;
}

.hr-stat {
	display: flex;
	flex-direction: column;
	align-items: center;
	min-width: 80px;
}

.hr-stat .label {
	font-size: 0.9rem;
	color: var(--text);
	opacity: 0.7;
	font-weight: 500;
	margin-bottom: 5px;
}

.hr-stat .value {
	font-size: 1.2rem;
	font-weight: 700;
	color: #fc4c02;
}

/* Strava Styles */
.strava-sync-btn:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

.strava-status {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 15px 20px;
	background: rgba(252, 76, 2, 0.1);
	border: 1px solid #fc4c02;
	border-radius: 12px;
	color: #fc4c02;
	font-weight: 600;
	margin-top: 15px;
}

.activity-id {
	margin-left: auto;
	font-family: monospace;
	font-size: 0.9em;
	opacity: 0.8;
}

.sync-message {
	padding: 15px 20px;
	border-radius: 12px;
	font-weight: 600;
	text-align: center;
	margin-top: 15px;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10px;
}

.sync-message.success {
	background: color-mix(in srgb, var(--goodBorder) 10%, transparent);
	color: var(--goodBorder);
	border: 1px solid var(--goodBorder);
}

.sync-message.error {
	background: color-mix(in srgb, var(--errorBorder) 10%, transparent);
	color: var(--errorBorder);
	border: 1px solid var(--errorBorder);
}

/* Exercises Styles */
.exercises-grid {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.exercise-item {
	animation: fadeInUp 0.4s ease-out;
	animation-fill-mode: both;
}

.exercise-item:nth-child(1) { animation-delay: 0.1s; }
.exercise-item:nth-child(2) { animation-delay: 0.2s; }
.exercise-item:nth-child(3) { animation-delay: 0.3s; }
.exercise-item:nth-child(4) { animation-delay: 0.4s; }
.exercise-item:nth-child(5) { animation-delay: 0.5s; }

/* Legacy table styles - keeping for compatibility */
table {
	text-align: center;
}
table td {
	padding: 10px 20px;
}
table p {
	margin: 0;
	padding: 0;
}
table h1 {
	margin: 0;
	padding: 0;
}

/* Animations */
@keyframes slideUp {
from {
	opacity: 0;
	transform: translateY(30px);
}
to {
	opacity: 1;
	transform: translateY(0);
}
}

@keyframes fadeInUp {
from {
	opacity: 0;
	transform: translateY(20px);
}
to {
	opacity: 1;
	transform: translateY(0);
}
}

/* Responsive Design */
@media (max-width: 768px) {
	.workout-title {
		font-size: 2rem;
		flex-direction: column;
		align-items: flex-start;
		gap: 10px;
	}

	.section-header {
		flex-direction: column;
		align-items: flex-start;
		gap: 15px;
	}

	.overview-section,
	.heart-rate-section,
	.strava-section,
	.exercises-section,
	.workout-header {
		padding: 20px;
	}

	.workout-content {
		gap: 20px;
	}

	.hr-stats {
		flex-direction: column;
		gap: 10px;
	}

	.hr-stat {
		flex-direction: row;
		justify-content: space-between;
		min-width: auto;
	}
}

.exercises-header {
	display: block;
}

.exercises-header h2 {
	display: flex;
	flex-direction: row;
	flex-wrap: no-wrap;
	gap: 10px;
	margin-bottom: 10px;
}

@media (max-width: 480px) {
	.workout-title {
		font-size: 1.8rem;
	}

	.section-title {
		font-size: 1.3rem;
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
	}
}
</style>
