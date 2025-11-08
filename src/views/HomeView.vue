<!-- Home page view, shows a list of workout thumbnails -->
<script setup lang="ts">
import BubbleButton from '../components/BubbleButton.vue';
import LoadingView from '../views/LoadingView.vue';
import WorkoutThumbnail from '../components/WorkoutThumbnail.vue';
import NoWorkouts from '../components/NoWorkouts.vue';
import { supabase } from '../lib/supabase';

import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import Workout from "../classes/Workout";
import WorkoutInfo from "../interfaces/WorkoutInfo";
import { getWorkoutsInfo } from '../utils/getWorkouts';

const workouts = ref<Array<WorkoutInfo>>([]);

const loading = ref<boolean>(true);

onMounted(async () => {
    await loadWorkouts();
});

async function loadWorkouts() {
    workouts.value = await getWorkoutsInfo();
    loading.value = false;
}

</script>
<template>
    <LoadingView v-if="loading" />
    <div class="viewArea">
        <div class="thumbnailContainer margins">
            <BubbleButton
                @click="Workout.createEmpty()"
            >
                <i class="fa-solid fa-plus"></i>
                New Empty Workout
            </BubbleButton>
            <WorkoutThumbnail
                v-for="workout in workouts"
                :key="workout.getId()"
                :workout="workout"
                @reload="loadWorkouts()"
            />
        </div>
        <NoWorkouts v-if="!loading && workouts.length === 0" />
    </div>
</template>

<style scoped>
.thumbnailContainer {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-top: 15px;
}
</style>
