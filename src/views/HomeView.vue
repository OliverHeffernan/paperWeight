<!-- Home page view, shows a list of workout thumbnails -->
<script setup lang="ts">
import LoadingView from '../views/LoadingView.vue';
import NavBar from '../components/NavBar.vue';
import WorkoutThumbnail from '../components/WorkoutThumbnail.vue';
import NoWorkouts from '../components/NoWorkouts.vue';
import { supabase } from '../lib/supabase';

import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import Workout from "../classes/Workout";
import getWorkouts from '../utils/getWorkouts';


const workouts = ref<Workout[]>([]);

const loading = ref<boolean>(true);

onMounted(async () => {
    await loadWorkouts();
});

async function loadWorkouts() {
    workouts.value = await getWorkouts();
    loading.value = false;
}

</script>
<template>
    <LoadingView v-if="loading" />
    <NavBar active="/home" />
    <div class="viewArea">
        <div class="thumbnailContainer">
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
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    margin-top: 15px;
}
</style>
