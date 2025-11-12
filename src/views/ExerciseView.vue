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

function exerciseName(): string {
    return exercise.value ? exercise.value.getName() : "...";
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
        @confirm="confirmDelete()"
        @cancel="deletePopup = false"
    />
    <div class="viewArea margins">
        <h1>{{ exerciseName() }}</h1>
        <WeightByDate
            v-if="!loading && sets.length > 0"
            :sets="sets"
        />
        <h2 v-if="workouts.length > 0">Workouts with {{ exerciseName() }}</h2>
        <WorkoutThumbnail
            v-for="workout in workouts"
            :key="workout.getId()"
            :workout="workout"
        />
        <BubbleButton
            @click="deleteExercise()"
            red
        >Delete Exercise</BubbleButton>
    </div>
</template>

<style scoped>
h1, h2 {
    padding: 0;
    margin: 0;
}
.viewArea {
    padding-top: 15px;
    display: flex;
    flex-direction: column;
    gap: 15px;
}
</style>
