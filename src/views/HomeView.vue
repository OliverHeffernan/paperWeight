<!-- Home page view, shows a list of workout thumbnails -->
<script setup lang="ts">
import NavBar from '../components/NavBar.vue';
import WorkoutThumbnail from '../components/WorkoutThumbnail.vue';
import { supabase } from '../lib/supabase';

import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import Workout from "../classes/Workout";


const workouts = ref<Workout[]>([]);

onMounted(async () => {
    const jsonWorkouts = await supabase
        .from('workouts')
        .select();

    for (const workout of jsonWorkouts.data || []) {
        workouts.value.push(new Workout(workout));
    }

    workouts.value.sort((a, b) => b.getStartTime() - a.getStartTime());

});

</script>
<template>
    <NavBar active="/home" />
    <div class="viewArea">
        <div class="thumbnailContainer">
            <WorkoutThumbnail
                v-for="workout in workouts"
                :key="workout.getId()"
                :workout="workout"
            />
        </div>
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
