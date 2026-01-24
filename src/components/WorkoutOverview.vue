<!-- A component to display an overview of a workout's key metrics -->
<!-- found in ViewWorkout.vue -->
<script setup lang="ts">
import Workout from "../classes/Workout";
import OverviewItem from '../components/OverviewItem.vue';
import { ref, watch, computed } from "vue";
const props = defineProps<{
    workout: Workout;
}>();

const pbs = computed<string | null>(() => {
    const count = props.workout.getPBCount();
    return count === 0 ? null : count.toString();
})

</script>
<template>
    <div class="workout-overview">
        <div class="overview-grid">
            <OverviewItem
                icon="fa-solid fa-clock"
                label="Duration"
                :value="workout.getDurationString()"
                class="overview-item"
            />
            <OverviewItem
                icon="fa-solid fa-dumbbell"
                label="Volume"
                :value="workout.getVolumeString()"
                class="overview-item"
            />
            <OverviewItem
                icon="fa-solid fa-list"
                label="Sets"
                :value="workout.countSets()"
                class="overview-item"
            />
            <OverviewItem
                icon="fa-solid fa-fire"
                label="Energy"
                :value="workout.getEnergyString()"
                class="overview-item"
            />
            <OverviewItem
                icon="fa-solid fa-heart"
                label="Avg. Heart Rate"
                :value="workout.getHeartRateString()"
                class="overview-item"
            />
            <OverviewItem
                icon="fa-solid fa-medal"
                label="Personal Bests"
                :value="pbs"
                class="overview-item"
            />
        </div>
    </div>
</template>

<style scoped>
.workout-overview {
    width: 100%;
}

.overview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 20px;
}

.overview-item {
    animation: fadeInUp 0.4s ease-out;
    animation-fill-mode: both;
}

.overview-item:nth-child(1) { animation-delay: 0.1s; }
.overview-item:nth-child(2) { animation-delay: 0.2s; }
.overview-item:nth-child(3) { animation-delay: 0.3s; }
.overview-item:nth-child(4) { animation-delay: 0.4s; }
.overview-item:nth-child(5) { animation-delay: 0.5s; }
.overview-item:nth-child(6) { animation-delay: 0.6s; }

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
    .overview-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
    }
}

@media (max-width: 480px) {
    .overview-grid {
        grid-template-columns: 1fr;
        gap: 12px;
    }
}
</style>
