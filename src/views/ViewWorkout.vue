<script setup lang="ts">
import { defineProps, onMounted, ref } from 'vue';
import { supabase } from '../lib/supabase';
import Workout from '../classes/Workout';
import LoadingView from '../views/LoadingView.vue';
import NavBar from '../components/NavBar.vue';
import WorkoutOverview from '../components/WorkoutOverview.vue';
import ExerciseContainer from '../components/ExerciseContainer.vue';
import SavingDisplay from '../components/SavingDisplay.vue';
import BubbleButton from '../components/BubbleButton.vue';

const props = defineProps(['workout_id']);

const workout = ref<Workout | null>(null);

onMounted(async () => {
    const { data, error } = await supabase
        .from('workouts')
        .select()
        .eq('workout_id', props.workout_id)
        .single();

    if (error) {
        console.error('Error fetching workout:', error);
        return;
    }

    workout.value = new Workout(data);
});

</script>
<template>
    <div class="viewArea" v-if="workout">
        <div class="margins">
            <h2>{{ workout.getTitle() }}</h2>
            <p class="greyed">{{ workout.getDateString() }}</p>
            <p class="softBubble" v-if="workout.getNotes() !== ''">{{ workout.getNotes() }}</p>
            <WorkoutOverview :workout="workout" />
            <ExerciseContainer v-for="exercise in workout.getExercises()" :key="exercise.getName()" :exercise="exercise" />
            <SavingDisplay :workout="workout" />
            <BubbleButton
                @click="workout.addEmptyExercise()"
                fullWidth
            >
                <i class="fa-solid fa-plus"></i> Add Exercise
            </BubbleButton>

        </div>
    </div>
    <LoadingView v-if="!workout" />

    <NavBar active="/home" />
</template>

<style scoped>
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

</style>
