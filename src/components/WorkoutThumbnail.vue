<!-- Component to display a thumbnail summary of a workout -->
<!-- Found in HomeView.vue -->
<script setup>
import Workout from '../classes/Workout';
import ThumbnailItem from './ThumbnailItem.vue';
import { defineProps } from 'vue';
defineProps(["workout"]);
</script>
<template>
    <RouterLink class="thumbnail" :to="`/viewWorkout/${workout.getId()}`">
        <h3>
            {{workout.getTitle()}}
            <span class="greyed">{{workout.getDateString()}}</span>
        </h3>
        <div class="items">
            <ThumbnailItem
                icon="fa-solid fa-dumbbell"
                :label="workout.getVolumeString()"
            />
            <ThumbnailItem
                icon="fa-solid fa-clock"
                :label="workout.getDurationString()"
            />
            <ThumbnailItem
                icon="fa-solid fa-list"
                :label="workout.countSetsString()"
            />
            <ThumbnailItem
                icon="fa-solid fa-fire"
                :label="workout.getEnergyString()"
            />
            <ThumbnailItem
                icon="fa-solid fa-heart"
                :label="workout.getHeartRateString()"
            />
        </div>
    </RouterLink>
</template>
<style scoped>
.thumbnail {
    display: block;
    border: solid 1px var(--border);
    border-radius: 10px;
    padding: 15px;
    margin: 1px 10px;
    background-color: var(--cardBackground);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-decoration: none;
}

.thumbnail td {
    padding-right: 15px;
}

.greyed {
    color: var(--border);
    font-weight: normal;
    margin-left: 10px;
}
.items {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin-top: 10px;
}
</style>
