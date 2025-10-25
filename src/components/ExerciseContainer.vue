<!-- A component to display an exercise, given the exercise object. -->

<script setup lang="ts">
import Exercise from "../classes/Exercise";
import SetContainer from "./SetContainer.vue";
import ExerciseEditModal from "./ExerciseEditModal.vue";
import { ref } from "vue";
const editing = ref<boolean>(false);
const props = defineProps<{
    exercise: Exercise;
}>();
</script>
<template>
    <ExerciseEditModal
        v-if="editing"
        :exercise="exercise"
        @cancel="editing = false"
    />
    <div class="exerciseContainer softBubble">
        <h2 @click="editing = true" class="exerciseTitle">{{ exercise.getName() }}</h2>
        <table class="setsContainer">
            <thead>
                <tr>
                    <th class="greyed" colspan="1">set</th>
                    <th class="greyed" colspan="1">weight & reps</th>
                </tr>
            </thead>
            <tbody>
                <SetContainer
                    v-for="(set, index) in exercise.getSets()"
                    :key="index"
                    :index="index"
                    :set="set"
                    :exercise="exercise"
                />
                <tr>
                    <td colspan="2"><button @click="exercise.addNewSet()" class="borderlessButton"><i class="fa-solid fa-plus"></i>Add set</button></td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td class="setLabel"><b>sets:</b> {{ exercise.countSets() }}</td>
                    <td class="setDetails"><b>volume:</b> {{ exercise.getVolume() }} kg</td>
                </tr>
            </tfoot>
        </table>
    </div>
</template>

<style>
.exerciseContainer {
    padding: 0;
}

.exerciseTitle {
    padding: 10px;
    border-bottom: 1px solid var(--border);
    margin: 0;
}

.setsContainer {
    width: 100%;
    border-collapse: collapse;
}

.setsContainer th {
    text-align: left;
    padding: 10px;
    font-weight: normal;
}

.setsContainer td {
    text-align: left;
    padding: 10px;
}

.setsContainer tbody tr:nth-child(odd) td {
    background-color: var(--prim);
    border: none;
}

.setsContainer tfoot {
    border-top: 1px solid var(--border);
}
</style>
