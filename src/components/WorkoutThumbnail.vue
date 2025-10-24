<script setup>
import Workout from '../classes/Workout';
import { defineProps } from 'vue';
defineProps(["workout"]);
</script>
<template>
    <RouterLink class="thumbnail" :to="`/viewWorkout/${workout.getId()}`">
        <h3>
            {{workout.getTitle()}}
            <span class="greyed">{{workout.getDateString()}}</span>
        </h3>
        <table>
            <tr>
                <td>
                    <i class="fa-solid fa-dumbbell"></i>
                    {{workout.getVolume()}} kg
                </td>
                <td v-if="workout.getDuration() !== 0">
                    <i class="fa-solid fa-clock"></i>
                    {{workout.getDurationString()}}
                </td>
            </tr>
            <tr>
                <td>{{workout.countSets()}} sets</td>
            </tr>
        </table>
    </RouterLink>
</template>
<style scoped>
.thumbnail {
    display: block;
    border: solid 1px var(--border);
    border-radius: 10px;
    padding: 15px;
    margin: 10px;
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
</style>
