<script setup lang="ts">
import Exercise from "../classes/Exercise";
defineProps<{
    exercise: Exercise;
    index: number;
}>();
</script>
<template>
    <h2 class="exerciseTitle">
        <span @click="editing = true" class="clickable">
            {{ exercise.getName() }}
            <i class="fa-solid fa-pen-to-square"></i>
        </span>
        <div class="reorderHandles clickable" v-if="index !== 0">
            <i @click="exercise.reorderUp()" class="fa-solid fa-chevron-up reorder"></i>
        </div>
    </h2>
</template>
<style scoped>
.exerciseTitle {
    padding: 10px;
    border-bottom: 1px solid var(--border);
    margin: 0;

    display: flex;
    justify-content: space-between;
}

.reorderHandles {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
</style>
