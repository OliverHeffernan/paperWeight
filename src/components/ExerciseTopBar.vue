<script setup lang="ts">
import Exercise from "../classes/Exercise";
import ReorderButton from "./ReorderButton.vue";
defineProps<{
    exercise: Exercise;
    index: number;
}>();

const emit = defineEmits<{
    (e: "edit"): void;
}>();
</script>
<template>
    <h2 class="exerciseTitle">
        <span @click="emit('edit')" class="clickable">
            {{ exercise.getName() }}
            <i class="fa-solid fa-pen-to-square"></i>
        </span>
		<!--
        <div class="reorderHandles clickable" v-if="index !== 0">
            <i @click="exercise.reorderUp()" class="fa-solid fa-chevron-up reorder"></i>
        </div>
		-->
		<ReorderButton
			v-if="index !== exercise.getWorkout().countExercises() - 1"
			@click="exercise.reorderDown()"
			up
		/>
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
