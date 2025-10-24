<!-- A component to display an exercise, given the exercise object. -->

<script setup lang="ts">
import Exercise from "../classes/Exercise";
defineProps<{
    exercise: Exercise;
}>();
</script>
<template>
    <div class="exerciseContainer softBubble">
        <h2 class="exerciseTitle">{{ exercise.getName() }}</h2>
        <table class="setsContainer">
            <thead>
                <tr>
                    <th class="greyed" colspan="1">set</th>
                    <th class="greyed" colspan="1">weight & reps</th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="(set, index) in exercise.getSets()"
                    :key="index"
                    class="setItem"
                >
                    <td class="setLabel">{{ index + 1 }}</td>
                    <td class="setDetails">
                        <span v-if="set.weight !== null"> {{ set.weight }} kg <i class="fa-solid fa-xmark"></i></span>
                        {{ set.reps }} reps
                    </td>
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

<style scoped>
.exerciseContainer {
    padding: 0;
}

.setLabel {
    margin-right: 5px;
}

.setDetails i {
    font-size: 13px;
}
.exerciseTitle {
    padding: 10px;
    border-bottom: 1px solid var(--border);
    margin: 0;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th {
    text-align: left;
    padding: 10px;
    font-weight: normal;
}

td {
    text-align: left;
    padding: 10px;
}

tbody tr:nth-child(odd) td {
    background-color: var(--prim);
    border: none;
}

tfoot {
    border-top: 1px solid var(--border);
}
</style>
