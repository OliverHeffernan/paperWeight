<!-- A component to display an exercise, given the exercise object. -->
<script setup lang="ts">
import Workout from "../classes/Workout";
import Exercise from "../classes/Exercise";
import SetContainer from "./SetContainer.vue";
import ExerciseEditModal from "./ExerciseEditModal.vue";
import ExerciseTopBar from "./ExerciseTopBar.vue";
import ReorderButton from "./ReorderButton.vue";
import { ref, computed } from "vue";
const editing = ref<boolean>(false);
const props = defineProps<{
	exercise: Exercise;
	showSets: boolean;
	index: number;
	weightPbSets: Array<string>;
	volumePbSets: Array<string>;
}>();

const displayDownButton = computed(() => {
	const workout: Workout | null = props.exercise.getWorkout();
	if (workout === null) return false;

	return props.index !== workout.countExercises() - 1
});
</script>
<template>
	<ExerciseEditModal
		v-if="editing"
		:exercise="exercise"
		@cancel="editing = false"
	/>
	<div class="exercise-container">
		<ExerciseTopBar
			:exercise="exercise"
			:index="index"
			@edit="editing = true"
			class="exercise-header"
		/>
		<div class="exercise-content">
			<table class="sets-table" v-if="showSets"><tbody>
				<SetContainer
					v-for="(set, index) in exercise.getSets()"
					:key="index"
					:index="index"
					:set="set"
					:previousSet="index > 0 ? exercise.getSets()[index - 1] : null"
					:exercise="exercise"
					:weightPbSets="weightPbSets"
					:volumePbSets="volumePbSets"
					class="set-row"
				/>
				<tr class="add-set-row">
					<td colspan="3" class="add-set-cell">
						<button @click="exercise.addNewSet()" class="add-set-button">
							<i class="fa-solid fa-plus"></i>
							Add Set
						</button>
					</td>
				</tr>
			</tbody></table>
			<div class="exercise-summary">
				<div>
					Total Volume:
					<strong class="summary-value">{{ exercise.getVolume() }} kg</strong>
				</div>
				<ReorderButton
					v-if="displayDownButton"
					@click="exercise.reorderDown()"
				/>
			</div>
		</div>
	</div>
</template>

<style scoped>
.exercise-container {
	background: var(--btnBG);
	border: 1px solid var(--border);
	border-radius: 15px;
	overflow: hidden;
	transition: all 0.3s ease;
}

.exercise-container:hover {
	box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
	border-color: var(--accent);
}

.exercise-header {
	background: var(--sec);
	border-bottom: 1px solid var(--border);
}

.exercise-content {
	padding: 0;
}

.sets-table {
	width: 100%;
	border-collapse: collapse;
	margin: 0;
}

.table-header {
	background: var(--sec);
	border-bottom: 2px solid var(--border);
}

.table-header th {
	text-align: left;
	padding: 15px 20px;
	font-weight: 600;
	font-size: 0.9rem;
	letter-spacing: 0.5px;
	text-transform: uppercase;
	opacity: 0.8;
}

.set-number-header {
	width: 60px;
	text-align: center;
}

.set-data-header {
	text-align: left;
}

.set-row {
	transition: background-color 0.2s ease;
}

.set-row:hover {
	background-color: color-mix(in srgb, var(--accent) 3%, transparent);
}

.add-set-row {
	border-top: 1px solid var(--border);
}

.add-set-cell {
	text-align: center;
	padding: 10px;
}

.add-set-button {
	background: none;
	border: 2px dashed var(--border);
	color: var(--text);
	/*padding: 12px 24px;*/
	padding: 10px 20px;
	margin: 0;
	border-radius: 8px;
	cursor: pointer;
	font-size: 0.9rem;
	font-weight: 600;
	transition: all 0.3s ease;
	opacity: 0.7;
}

.add-set-button:hover {
	opacity: 1;
	border-color: var(--accent);
	color: var(--accent);
	background: color-mix(in srgb, var(--accent) 5%, transparent);
}

.exercise-summary {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	padding: 10px;
	background: var(--sec);
	border-top: 1px solid var(--border);
}

.summary-item {
	display: flex;
	align-items: center;
	gap: 10px;
}

.summary-label {
	font-weight: 600;
	opacity: 0.8;
}

.summary-value {
	font-weight: 700;
	font-size: 1.1rem;
	color: var(--accent);
}


@media (max-width: 768px) {
	.table-header th {
		padding: 12px 15px;
		font-size: 0.85rem;
	}

	.exercise-summary {
		padding: 15px;
		gap: 15px;
	}

	.summary-item {
		width: 100%;
		justify-content: space-between;
	}
}
</style>
