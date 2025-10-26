<script setup lang="ts">
import JSONSet from "../interfaces/JSONSet";
import Exercise from "../classes/Exercise";
import SetEditModal from "./SetEditModal.vue";
import { ref } from "vue";
defineProps<{
    set: JSONSet;
    index: number;
    exercise: Exercise;
}>();

const editing = ref<boolean>(false);
</script>
<template>
    <SetEditModal
        v-if="editing"
        :set="set"
        :exercise="exercise"
        :index="index"
        @cancel="editing = false"
    />
    <tr @click="editing = true" class="setItem">
        <td class="setlabel">{{ index + 1 }}</td>
        <td class="setdetails">
            <span v-if="set.weight !== null"> {{ set.weight }} kg <i class="fa-solid fa-xmark"></i></span>
            {{ set.reps }} reps
            <i class="fa-solid fa-note-sticky noteIcon" v-if="set.notes !== '' && set.notes !== null" ></i>
        </td>
    </tr>
</template>
<style scoped>
.setLabel {
    margin-right: 5px;
}

.setDetails i {
    font-size: 13px;
}

.setItem {
    cursor: pointer;
}

td {
    padding: 10px;
}

.noteIcon {
    float: right;
}
</style>
