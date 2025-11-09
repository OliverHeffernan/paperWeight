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

import ErrorPopup from '../components/ErrorPopup.vue';
import ErrorDisplay from '../classes/ErrorDisplay';

const props = defineProps(['workout_id']);

const workout = ref<Workout | null>(null);
const showSets = ref<boolean>(true);
const loading = ref<boolean>(true);
const weightPbSets = ref<Array<string>>([]);

const editingDetails = ref<boolean>(false);

const errorDisplay = ref<ErrorDisplay>(new ErrorDisplay());

onMounted(async () => {
    const { data, error } = await supabase
        .from('workouts')
        .select()
        .eq('workout_id', props.workout_id)
        .single();

    if (error) {
        console.error('Error fetching workout:', error);
        if (error.code == 'PGRST116') {
            errorDisplay.value.setError('Workout not found', "The requested workout does not exist.");
            loading.value = false;
            return;
        }
        errorDisplay.value.setError('Error fetching workout', "Please try again.");
        loading.value = false;
        return;
    }

    workout.value = await Workout.create(data);
    loading.value = false;

    const weightPbsRequest = await supabase
        .rpc('get_weight_pbs', { pb_exercise_ids: await workout.value.getExerciseIds() });
    if (weightPbsRequest.error) {
        console.error('Error fetching weight PBs:', weightPbsRequest.error);
        return;
    }
    console.log(weightPbsRequest.data);
    if (weightPbsRequest.data && Array.isArray(weightPbsRequest.data)) {
        weightPbSets.value = weightPbsRequest.data.map((item: any) => item.id);
    }
});

</script>
<template>
    <error-popup :error="errorDisplay" />
    <WorkoutDetailsEditModal
        v-if="editingDetails && workout"
        :workout="workout"
        @cancel="editingDetails = false"
    />

    <div class="viewArea" v-if="workout">
        <div class="margins">
            <h2>
                {{ workout.getTitle() }}
                <i class="fa-solid fa-ellipsis clickable" @click="editingDetails = true"></i>
            </h2>
            <p class="greyed">{{ workout.getDateString() }}</p>
            <p class="softBubble" v-if="workout.getNotes() !== ''">{{ workout.getNotes() }}</p>
            <WorkoutOverview :workout="workout" />
            <BubbleButton
                @click="showSets = !showSets"
                fullWidth
            >
                <i class="fa-solid" :class="showSets ? 'fa-eye-slash' : 'fa-eye'"></i>
                {{ showSets ? 'Hide Sets' : 'Show Sets' }}
            </BubbleButton>
            <ExerciseContainer
                v-for="(exercise, index) in workout.getExercises()"
                :key="exercise.getName()"
                :exercise="exercise"
                :showSets="showSets"
                :index="index"
                :weightPbSets="weightPbSets"
            />
            <SavingDisplay :workout="workout" />
            <BubbleButton
                @click="workout.addEmptyExercise()"
                fullWidth
            >
                <i class="fa-solid fa-plus"></i> Add Exercise
            </BubbleButton>

        </div>
    </div>
    <LoadingView v-if="loading" />
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

.margins {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
</style>
