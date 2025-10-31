<!-- A component to display an overview of a workout's key metrics -->
<!-- found in ViewWorkout.vue -->
<script setup lang="ts">
import Workout from "../classes/Workout";
import OverviewItem from '../components/OverviewItem.vue';
defineProps<{
    workout: Workout;
}>();
</script>
<template>
    <div class="softBubble overview">
        <OverviewItem
            icon="fa-solid fa-clock"
            label="duration"
            :value="workout.getDurationString()"
        />
        <OverviewItem
            icon="fa-solid fa-dumbbell"
            label="volume"
            :value="workout.getVolumeString()"
        />
        <OverviewItem
            icon="fa-solid fa-list"
            label="sets"
            :value="workout.countSets()"
        />
        <OverviewItem
            icon="fa-solid fa-fire"
            label="energy"
            :value="workout.getEnergyString()"
        />
        <OverviewItem
            icon="fa-solid fa-heart"
            label="avg. heart rate"
            :value="workout.getHeartRateString()"
        />
    </div>
</template>
<style scoped>
.overview {
    display: flex;
    flex-wrap: wrap;
}
</style>
