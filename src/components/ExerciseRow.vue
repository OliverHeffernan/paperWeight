<script setup lang="ts">
import { ExerciseInfo } from "../classes/ExerciseInfo";
import { useRouter } from "vue-router";
import { getWorkoutsInfoByExercise } from "../utils/getWorkouts";
import LoadingView from "../views/LoadingView.vue";

import { ref, onMounted } from "vue";

const loading = ref<boolean>(true);

const router = useRouter();

const props = defineProps<{
    exercise: ExerciseInfo;
    whichPR: string;
}>();

const weightPB = ref<number | null>(null);
const volumePB = ref<number | null>(null);
const workoutCount = ref<number | null>(null);
const setCount = ref<number | null>(null);

onMounted(async() => {
	await props.exercise.getMoreInfo();
	weightPB.value = props.exercise.weightPB;
	volumePB.value = props.exercise.volumePB;
	workoutCount.value = props.exercise.workoutCount;
	setCount.value = props.exercise.setCount;

    loading.value = false;
});
</script>
<template>
    <LoadingView v-if="loading" />
    <!--<tr class="exerciseRow clickable" @click="router.push(`/exercise/${exercise.getId()}`)">-->
    <tr class="exerciseRow clickable" @click="router.push({ name: 'View Exercise', params: { exercise_id: exercise.getId() } })">
        <td>
            {{ exercise.name }}
        </td>
        <td class="number" v-if="whichPR === 'weight'">
            {{ weightPB !== null ? weightPB + ' kg' : '' }}
            <i v-if="weightPB" class="fa-solid fa-medal"></i>
        </td>
        <td class="number" v-if="whichPR === 'volume'">
            {{ volumePB !== null ? volumePB + ' kg' : '' }}
            <i v-if="volumePB" class="fa-solid fa-medal"></i>
        </td>
        <td class="number" v-if="whichPR === 'workouts'">
            {{ workoutCount !== null ? workoutCount : '' }}
        </td>
        <td class="number" v-if="whichPR === 'sets'">
            {{ setCount !== null ? setCount : '' }}
        </td>
        <td class="number" v-if="whichPR === 'setsPerWorkout'">
            {{
                workoutCount && workoutCount > 0 && setCount !== null
                    ? (setCount / workoutCount).toFixed(2)
                    : ''
            }}
        </td>
    </tr>
</template>

<style scoped>
.number {
    text-align: right;
    min-width: 0px;
    padding-left: 0;
}

.exerciseRow {
    border-bottom: 1px solid var(--border);
}

.exerciseRow td {
    padding: 10px 5px;
}

.exerciseRow:hover {
    background-color: var(--sec);
}

.fa-medal {
    color: var(--gold);
}

</style>
