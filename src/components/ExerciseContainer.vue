<!-- A component to display an exercise, given the exercise object. -->
<script setup lang="ts">
import Exercise from "../classes/Exercise";
import SetContainer from "./SetContainer.vue";
import ExerciseEditModal from "./ExerciseEditModal.vue";
import ExerciseTopBar from "./ExerciseTopBar.vue";
import Set from "../classes/Set";
import { ref } from "vue";
const editing = ref<boolean>(false);
const props = defineProps<{
    exercise: Exercise;
    showSets: boolean;
    index: number;
    weightPbSets: Array<string>;
    volumePbSets: Array<string>;
}>();
</script>
<template>
    <ExerciseEditModal
        v-if="editing"
        :exercise="exercise"
        @cancel="editing = false"
    />
    <div class="exerciseContainer softBubble">
        <ExerciseTopBar
            :exercise="exercise"
            :index="index"
            @edit="editing = true"
        />
        <table class="setsContainer">
            <thead v-if="showSets">
                <tr>
                    <th class="greyed" colspan="1">set</th>
                    <th class="greyed" colspan="1">weight & reps</th>
                </tr>
            </thead>
            <tbody v-if="showSets">
                <SetContainer
                    v-for="(set, index) in exercise.getSets()"
                    :key="index"
                    :index="index"
                    :set="set"
                    :previousSet="index > 0 ? exercise.getSets()[index - 1] : null"
                    :exercise="exercise"
                    :weightPbSets="weightPbSets"
                    :volumePbSets="volumePbSets"
                />
                <tr>
                    <td colspan="3" class="center"><button @click="exercise.addNewSet()" class="borderlessButton center"><i class="fa-solid fa-plus"></i>Add set</button></td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td></td>
                    <td class="setDetails">
                        <b>volume:</b> {{ exercise.getVolume() }} kg
                    </td>
                    <td>
                        <i v-if="index !== exercise.getWorkout().countExercises() - 1"@click="exercise.reorderDown()" class="fa-solid fa-chevron-down reorder"></i>
                    </td>
                </tr>
            </tfoot>
        </table>
    </div>
</template>

<style>
.exerciseContainer {
    padding: 0;
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

.reorderHandles {
}

.reorder {
    font-size: 25px;
    float: right;
}

h2 span i {
    font-size: 16px;
}

.center {
    text-align: center;
    width: 100%;
}
</style>
