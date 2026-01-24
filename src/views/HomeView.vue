<!-- Home page view, shows a list of workout thumbnails -->
<script setup lang="ts">
import BubbleButton from '../components/BubbleButton.vue';
import LoadingView from '../views/LoadingView.vue';
import SplashView from '../views/SplashView.vue';
import WorkoutThumbnail from '../components/WorkoutThumbnail.vue';
import NoWorkouts from '../components/NoWorkouts.vue';
import { supabase } from '../lib/supabase';

import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import Workout from "../classes/Workout";
import WorkoutInfo from "../interfaces/WorkoutInfo";
import { getWorkoutsInfo } from '../utils/getWorkouts';

const workouts = ref<Array<WorkoutInfo>>([]);
const router = useRouter();

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
    <SplashView v-if="loading" />
    <div class="viewArea">
        <div class="header-section margins">
            <h1 class="page-title">Your Workouts</h1>
            <p class="page-subtitle">Track your fitness journey and view your workout history</p>
        </div>
        <div class="thumbnailContainer margins">
            <div class="create-workout-section">
                <BubbleButton
                    @click="Workout.createEmpty()"
                    class="create-button"
                >
                    <i class="fa-solid fa-plus"></i>
                    New Empty Workout
                </BubbleButton>
            </div>
            <div v-if="workouts.length > 0" class="workouts-section">
                <h3 class="section-title">Recent Workouts</h3>
                <div class="workouts-grid">
                    <WorkoutThumbnail
                        v-for="workout in workouts"
                        :key="workout.getId()"
                        :workout="workout"
                        @reload="loadWorkouts()"
                        class="workout-item"
                    />
                </div>
            </div>
        </div>
        <NoWorkouts v-if="!loading && workouts.length === 0" />
    </div>
</template>

<style scoped>
.header-section {
    text-align: center;
    padding: 20px 0;
    border-bottom: 1px solid var(--border);
    margin-bottom: 20px;
}

.page-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 10px 0;
    background: linear-gradient(135deg, var(--text) 0%, var(--accent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.page-subtitle {
    font-size: 1.1rem;
    opacity: 0.7;
    margin: 0;
    font-weight: 400;
}

.thumbnailContainer {
    display: flex;
    flex-direction: column;
    gap: 25px;
}

.create-workout-section {
    display: flex;
    justify-content: center;
    padding: 20px 0;
}

.create-button {
    padding: 15px 25px;
    font-size: 1.1rem;
    font-weight: 600;
    border: 2px solid var(--btnBorder);
    border-radius: 15px;
    background: linear-gradient(135deg, var(--btnBG) 0%, var(--sec) 100%);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
}

.create-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    border-color: var(--accent);
}

.workouts-section {
    animation: fadeInUp 0.6s ease-out;
}

.section-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 20px 0;
    color: var(--text);
    opacity: 0.9;
}

.workouts-grid {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.workout-item {
    animation: fadeInUp 0.4s ease-out;
    animation-fill-mode: both;
}

.workout-item:nth-child(1) { animation-delay: 0.1s; }
.workout-item:nth-child(2) { animation-delay: 0.2s; }
.workout-item:nth-child(3) { animation-delay: 0.3s; }
.workout-item:nth-child(4) { animation-delay: 0.4s; }
.workout-item:nth-child(5) { animation-delay: 0.5s; }

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
    .page-title {
        font-size: 2rem;
    }
    
    .create-button {
        padding: 12px 20px;
        font-size: 1rem;
    }
}
</style>
