<script setup lang="ts">
import JSONSet from "../interfaces/JSONSet";
import Set from "../classes/Set";
import Exercise from "../classes/Exercise";
import SetEditModal from "./SetEditModal.vue";
import { ref, onMounted } from "vue";
const props = defineProps<{
    set: Set;
    previousSet: Set | null;
    index: number;
    exercise: Exercise;
    weightPbSets: Array<string>;
    volumePbSets: Array<string>;
}>();

const previousSetId = ref<string>("");
const setId = ref<string>("");

onMounted(async() => {
    setId.value = await props.set.getId();
    if (props.previousSet) {
        previousSetId.value = await props.previousSet.getId();
    }
    console.log(`Set ID: ${setId.value}`);
    console.log(props.weightPbSets);
    if (props.weightPbSets.includes(setId.value)) {
        console.log(`Set ${setId.value} is a weight PB`);
    }
});

function isWeightPB(): boolean {
    if (!props.previousSet) {
        return props.weightPbSets.includes(setId.value);
    }

    const prevWeight = props.previousSet.getWeight();
    const currWeight = props.set.getWeight();
    if (prevWeight > currWeight) {
        return false;
    }

    if (prevWeight !== currWeight) {
        return props.weightPbSets.includes(setId.value);
    }
    return props.weightPbSets.includes(setId.value)
        && !props.weightPbSets.includes(previousSetId.value);
}

function isVolumePB(): boolean {
    if (!props.previousSet) {
        return props.volumePbSets.includes(setId.value);
    }

    const prevVolume = (props.previousSet.getWeight() ?? 0) * props.previousSet.getReps();
    const currVolume = (props.set.getWeight() ?? 0) * props.set.getReps();
    if (prevVolume > currVolume) {
        return false;
    }

    if (prevVolume !== currVolume) {
        return props.volumePbSets.includes(setId.value);
    }
    return props.volumePbSets.includes(setId.value)
        && !props.volumePbSets.includes(previousSetId.value);
}

function setWeightPB() {
    const result: boolean = isWeightPB();
    if (result) {
        props.set.setWeightPB();
    }
    return result;
}

function setVolumePB() {
    const result: boolean = isVolumePB();
    if (result) {
        props.set.setVolumePB();
    }
    return result;
}

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
            <span v-if="set.getWeight() !== null"> {{ set.getWeight() }} kg <i class="fa-solid fa-xmark"></i></span>
            {{ set.getReps() }} reps
            <i class="fa-solid fa-note-sticky noteIcon" v-if="set.getNotes() !== '' && set.getNotes() !== null" ></i>

            <div class="pbMedal" v-if="setVolumePB() || setWeightPB()">
                <i class="fa-solid fa-medal"></i>

                <span class="pbLabel">
                    {{ set.getPBString() }}
                </span>
            </div>
        </td>
    </tr>
</template>
<style scoped>
.setLabel {
    margin-right: 5px;
}


.setdetails i {
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

.fa-medal {
    color: var(--gold);
}

.setdetails {
    display: flex;
    flex-direction: row;
    position: relative;
}

.pbMedal {
    position: absolute;
    right: 20px;
}

@media screen and (max-width: 355px) {
    .pbLabel {
        display: none;
        color: pink;
    }
}
</style>
