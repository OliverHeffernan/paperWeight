<!-- Component to display a thumbnail summary of a workout -->
<!-- Found in HomeView.vue -->
<script setup lang="ts">
import WorkoutInfo from '../interfaces/WorkoutInfo';
import LoadingView from '../views/LoadingView.vue';
import ThumbnailItem from './ThumbnailItem.vue';
import DeleteWorkoutModal from './DeleteWorkoutModal.vue';

import { ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const props = defineProps<{
	workout: WorkoutInfo;
}>();
const emit = defineEmits(["reload"]);

const loading = ref<boolean>(false);

const deleteModalVisible = ref<boolean>(false);

async function deleteWorkout() {
	loading.value = true;
	await props.workout.deleteWorkout();
	setTimeout(() => {
		emit('reload');
		loading.value = false;
	}, 500);
}
</script>
<template>
	<LoadingView v-if="loading" />
	<DeleteWorkoutModal
		:visible="deleteModalVisible"
		:workout="workout"
		@confirm="deleteWorkout(); deleteModalVisible = false"
		@cancel="deleteModalVisible = false"
	/>
	<div class="workout-thumbnail">
		<div class="thumbnail-content">
			<!-- Header Section -->
			<div class="thumbnail-header">
				<RouterLink 
					class="workout-link" 
					:to="{ name: 'View Workout', params: { workout_id: workout.getId() } }"
				>
					<div class="title-section">
						<h3 class="workout-title">{{ workout.getTitle() }}</h3>
						<span class="workout-date">{{ workout.getDateString() }}</span>
					</div>
				</RouterLink>

				<!-- Delete Button -->
				<div class="actions-section">
					<button 
						class="delete-button"
						@click="deleteModalVisible = true"
						title="Delete workout"
					>
						<i class="fas fa-trash"></i>
					</button>
				</div>
			</div>

			<!-- Stats Section -->
			<div class="stats-grid">
				<ThumbnailItem
					icon="fa-solid fa-dumbbell"
					:label="workout.getVolumeString()"
					class="stat-item"
				/>
				<ThumbnailItem
					icon="fa-solid fa-clock"
					:label="workout.getDurationString()"
					class="stat-item"
				/>
				<ThumbnailItem
					icon="fa-solid fa-list"
					:label="workout.countSetsString()"
					class="stat-item"
				/>
				<ThumbnailItem
					icon="fa-solid fa-fire"
					:label="workout.getEnergyString()"
					class="stat-item"
				/>
				<ThumbnailItem
					icon="fa-solid fa-heart"
					:label="workout.getHeartRateString()"
					class="stat-item"
				/>
				<ThumbnailItem
					icon="fa-solid fa-medal"
					:label="workout.getPBCountString()"
					class="stat-item"
				/>
			</div>
		</div>
	</div>
</template>

<style scoped>
.workout-thumbnail {
	position: relative;
	background: var(--sec);
	border: 1px solid var(--border);
	border-radius: 16px;
	padding: 0;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	transition: all 0.3s ease;
	overflow: hidden;
}

.workout-thumbnail:hover {
	box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
	border-color: var(--accent);
}

.thumbnail-content {
	padding: 20px;
}

.thumbnail-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 20px;
	gap: 15px;
}

.workout-link {
	text-decoration: none;
	color: inherit;
	flex: 1;
	transition: color 0.3s ease;
}

.workout-link:hover .workout-title {
	background: linear-gradient(135deg, var(--accent) 0%, var(--text) 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}

.title-section {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.workout-title {
	font-size: 1.4rem;
	font-weight: 700;
	margin: 0;
	line-height: 1.3;
	color: var(--text);
	transition: all 0.3s ease;
}

.workout-date {
	font-size: 0.9rem;
	color: var(--border);
	font-weight: 500;
	opacity: 0.8;
}

.actions-section {
	display: flex;
	align-items: flex-start;
}

.delete-button {
	background: none;
	border: none;
	color: var(--border);
	font-size: 1rem;
	padding: 8px;
	border-radius: 8px;
	cursor: pointer;
	opacity: 0.6;
	transition: all 0.3s ease;
}

.delete-button:hover {
	opacity: 1;
	color: var(--errorBorder);
	background: color-mix(in srgb, var(--errorBorder) 10%, transparent);
}

.stats-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 15px;
	padding: 15px 0;
	border-top: 1px solid var(--border);
}

.stat-item {
	transition: transform 0.2s ease;
	padding: 8px;
	border-radius: 8px;
	flex: 1;
	min-width: 120px;
}

.stat-item:hover {
	background: color-mix(in srgb, var(--accent) 5%, transparent);
}

/* Responsive design */
@media (max-width: 768px) {
	.thumbnail-content {
		padding: 16px;
	}

	.workout-title {
		font-size: 1.2rem;
	}

	.stats-grid {
		flex-direction: column;
		gap: 10px;
	}

	.stat-item {
		min-width: auto;
	}

	.thumbnail-header {
		margin-bottom: 15px;
	}
}

@media (max-width: 480px) {
	.workout-title {
		font-size: 1.1rem;
	}

	.title-section {
		gap: 6px;
	}
}

@media (min-width: 769px) {
	.stats-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
	}

	.stat-item {
		flex: 0 1 calc(33.333% - 10px);
		min-width: 120px;
		max-width: 150px;
	}
}

/* Animation for new items */
.workout-thumbnail {
	animation: slideInUp 0.4s ease-out;
}

@keyframes slideInUp {
from {
	opacity: 0;
	transform: translateY(20px);
}
to {
	opacity: 1;
	transform: translateY(0);
}
}

/* Add subtle gradient overlay for premium feel */
.workout-thumbnail::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 3px;
	background: linear-gradient(90deg, var(--accent), var(--text), var(--accent));
	opacity: 0;
	transition: opacity 0.3s ease;
}

.workout-thumbnail:hover::before {
	opacity: 1;
}
</style>
