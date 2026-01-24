<script setup lang="ts">
import { supabase } from '../lib/supabase';
import { ref, onMounted } from 'vue';
import { getWorkoutsInfoByExercise } from '../utils/getWorkouts';
import { useRouter } from 'vue-router';
import WorkoutInfo from '../interfaces/WorkoutInfo';
import ExerciseInfo from '../classes/ExerciseInfo';
import WorkoutThumbnail from '../components/WorkoutThumbnail.vue';
import LoadingView from './LoadingView.vue';
import WeightByDate from '../components/charts/WeightByDate.vue';
import BubbleButton from '../components/BubbleButton.vue';
import ErrorPopup from '../components/ErrorPopup.vue';
import ErrorDisplay from '../classes/ErrorDisplay';
import OptionPopup from '../components/OptionPopup.vue';
import NameEditModal from '../components/NameEditModal.vue';
import Set from '../classes/Set';

const router = useRouter();

const props = defineProps(['exercise_id']);

const workouts = ref<Array<WorkoutInfo>>([]);
const exercise = ref<ExerciseInfo | null>(null);
const loading = ref<boolean>(true);
const sets = ref<Array<{
	set: Set;
	date: Date;
}>>([]);

const errorDisplay = ref<ErrorDisplay>(new ErrorDisplay());
const deletePopup = ref<boolean>(false);

const editingName = ref<boolean>(false);

function exerciseName(): string {
	return exercise.value ? exercise.value.getName() : "";
}

function exerciseNotes(): string {
	const result = exercise.value ? exercise.value.getDescription() : "";
	console.log(result);
	return result;
}

async function getSets() {
	if (!exercise.value) return;
	const { data, error } = await supabase
		.from('sets')
		.select('*')
		.eq('exercise_id', exercise.value.getId());

	if (error) {
		console.error('Error fetching sets:', error);
		return;
	}

	if (!data) return;

	const setsArray: Array<Set> = [];
	for (const item of data) {
		setsArray.push(await Set.create(item, exercise.value));
	}

	for (const set of setsArray) {
		const { data, error } = await supabase
			.from('workouts')
			.select('start_time')
			.eq('workout_id', set.getWorkoutId())
			.single();

		if (error) {
			console.error('Error fetching workout for set:', error);
			continue;
		}

		sets.value.push({
			set: set,
			date: new Date(data.start_time)
		});
	}
}

onMounted(async () => {
	exercise.value = await ExerciseInfo.create(props.exercise_id);
	workouts.value = await getWorkoutsInfoByExercise(props.exercise_id);
	await getSets();
	loading.value = false;
});

function deleteExercise() {
	loading.value = true;
	if (!exercise.value) return;
	if (workouts.value.length > 0) {
		errorDisplay.value.setError('Cannot delete exercise', 'This exercise is used in existing workouts and cannot be deleted.');
		loading.value = false;
		return;
	}
	deletePopup.value = true;

}

async function confirmDelete() {
	deletePopup.value = false;
	loading.value = true;
	if (await exercise.value.delete()) {
		router.push({ name: 'Exercises' });
		loading.value = false;
		return;
	}
	errorDisplay.value.setError('Failed to delete exercise', 'An error occurred while trying to delete the exercise. Please try again later.');
	loading.value = false;
}

</script>

<template>
	<LoadingView v-if="loading" />
	<ErrorPopup :error="errorDisplay" />
	<OptionPopup
		v-if="deletePopup"
		title="Delete Exercise"
		message="Are you sure you want to delete this exercise? This action cannot be undone."
		confirmText="Delete"
		cancelText="Cancel"
		confirmRed
		@confirm="confirmDelete()"
		@cancel="deletePopup = false"
	/>

	<div class="exercise-container">
		<div class="exercise-content margins">
			<!-- Exercise Header -->
			<div class="exercise-header">
				<div class="header-content">
					<h1 class="exercise-title">
						{{ exerciseName() }}
						<i
							class="fas fa-edit edit-button"
							@click="editingName = true"
						></i>
					</h1>
					<p v-if="exercise?.getDescription()" class="exercise-description">
						{{ exercise.getDescription() }}
					</p>
				</div>
			</div>

			<!-- Progress Chart Section -->
			<div v-if="!loading && sets.length > 0" class="chart-section">
				<div class="section-header">
					<h2 class="section-title">
						<i class="fa-solid fa-chart-line section-icon"></i>
						Progress Over Time
					</h2>
				</div>
				<WeightByDate :sets="sets" />
			</div>

			<!-- Workouts Section -->
			<div v-if="workouts.length > 0" class="workouts-section">
				<div class="section-header">
					<h2 class="section-title">
						<i class="fa-solid fa-dumbbell section-icon"></i>
						Workouts with {{ exerciseName() }}
						<span class="workout-count">({{ workouts.length }})</span>
					</h2>
				</div>
				<div class="workouts-grid">
					<WorkoutThumbnail
						v-for="(workout, index) in workouts"
						:key="workout.getId()"
						:workout="workout"
						class="workout-item"
						:style="{ animationDelay: `${index * 0.1}s` }"
					/>
				</div>
			</div>

			<!-- Empty States -->
			<div v-if="!loading && sets.length === 0 && workouts.length === 0" class="empty-state">
				<i class="fa-solid fa-dumbbell fa-3x"></i>
				<h3>No Data Available</h3>
				<p>This exercise hasn't been used in any workouts yet.</p>
			</div>

			<!-- Actions Section -->
			<div class="actions-section">
				<BubbleButton
					@click="deleteExercise()"
					red
					class="delete-button"
				>
					<i class="fa-solid fa-trash"></i>
					Delete Exercise
				</BubbleButton>
			</div>
		</div>
	</div>

	<NameEditModal
		v-if="editingName && exercise"
		:currentName="exercise ? exercise.getName() : ''"
		:currentDescription="exercise ? exercise.getDescription() : ''"
		:exerciseInfo="exercise"
		:id="exercise ? exercise.getId() : ''"
		label="Exercise"
		@confirm="async (newName: string, newDescription: string) => {
		if (exercise.value) {
		loading.value = true;
				try {
					const success = await exercise.value.updateName(newName, newDescription);
					if (!success) {
						errorDisplay.value.setError('Failed to update exercise', 'An error occurred while updating the exercise. Please try again later.');
					} else {
						// Force reactivity update by re-creating the exercise object
						const updatedExercise = await ExerciseInfo.create(props.exercise_id);
						exercise.value = updatedExercise;
					}
				} catch (error) {
					errorDisplay.value.setError('Failed to update exercise', 'An error occurred while updating the exercise. Please try again later.');
				} finally {
					loading.value = false;
				}
			}
			editingName = false;
		}"
		@cancel="editingName = false"
	/>

	<NameEditModal
		v-if="editingName && exercise"
		:currentName="exercise ? exercise.getName() : ''"
		:currentDescription="exercise ? exercise.getDescription() : ''"
		:exerciseInfo="exercise"
		:id="exercise ? exercise.getId() : ''"
		label="Exercise"
		@confirm="async (newName: string, newDescription: string) => {
			if (exercise.value) {
				loading.value = true;
				try {
					const success = await exercise.value.updateName(newName, newDescription);
					if (!success) {
						errorDisplay.value.setError('Failed to update exercise', 'An error occurred while updating the exercise. Please try again later.');
					} else {
						// Force reactivity update
						exercise.value = { ...exercise.value };
					}
				} catch (error) {
					errorDisplay.value.setError('Failed to update exercise', 'An error occurred while updating the exercise. Please try again later.');
				} finally {
					loading.value = false;
				}
			}
			editingName = false;
		}"
		@cancel="editingName = false"
	/>
</template>

<style scoped>
.exercise-container {
	min-height: 100vh;
	background: linear-gradient(135deg, var(--prim) 0%, var(--sec) 20%);
	padding: 20px 0;
}

.exercise-content {
	max-width: 1000px;
	margin: 0 auto;
	display: flex;
	flex-direction: column;
	gap: 30px;
}

.exercise-header {
	background: var(--sec);
	border: 1px solid var(--border);
	border-radius: 20px;
	padding: 30px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
	animation: slideUp 0.6s ease-out;
}

.header-content {
	display: flex;
	flex-direction: column;
	gap: 15px;
}

.exercise-title {
	font-size: 2.5rem;
	font-weight: 700;
	margin: 0;
	gap: 15px;
	background: linear-gradient(135deg, var(--text) 0%, var(--accent) 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}

.edit-button {
	background: none;
	border: none;
	/*color: var(--accent);*/
	font-size: 1.2rem;
	padding: 10px;
	cursor: pointer;
}

.exercise-description {
	font-size: 1.1rem;
	opacity: 0.8;
	margin: 0;
	line-height: 1.6;
	font-weight: 400;
}

.chart-section,
.workouts-section {
	background: var(--sec);
	border: 1px solid var(--border);
	border-radius: 20px;
	padding: 30px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
	animation: slideUp 0.6s ease-out;
}

.section-header {
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
	color: var(--accent);
	font-size: 1.3rem;
}

.workout-count {
	font-size: 1rem;
	opacity: 0.7;
	font-weight: 400;
}

.workouts-grid {
	display: flex;
	flex-direction: column;
	gap: 15px;
}

.workout-item {
	animation: fadeInUp 0.4s ease-out;
	animation-fill-mode: both;
	transition: transform 0.2s ease;
}

.workout-item:hover {
	transform: translateY(-2px);
}

.empty-state {
	text-align: center;
	padding: 60px 20px;
	background: var(--sec);
	border: 1px solid var(--border);
	border-radius: 20px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
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
	color: var(--text);
}

.empty-state p {
	opacity: 0.7;
	font-size: 1rem;
	margin: 0;
	color: var(--text);
}

.actions-section {
	display: flex;
	justify-content: flex-end;
	padding: 20px 0;
}

.delete-button {
	padding: 12px 25px;
	border-radius: 12px;
	font-weight: 600;
	transition: all 0.3s ease;
}

.delete-button:hover {
	transform: translateY(-2px);
	box-shadow: 0 8px 25px rgba(255, 76, 113, 0.3);
}

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

@media (max-width: 768px) {
	.exercise-title {
		font-size: 2rem;
		flex-direction: column;
		align-items: flex-start;
		gap: 10px;
	}

	.chart-section,
	.workouts-section,
	.exercise-header {
		padding: 20px;
	}

	.exercise-content {
		gap: 20px;
	}

	.actions-section {
		justify-content: center;
	}
}

@media (max-width: 480px) {
	.exercise-title {
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
