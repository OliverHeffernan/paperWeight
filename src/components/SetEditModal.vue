<script setup lang="ts">
import BubbleButton from "./BubbleButton.vue";
import OptionPopup from "./OptionPopup.vue";
import Exercise from "../classes/Exercise";
import JSONSet from "../interfaces/JSONSet";
import Set from "../classes/Set";
import { ref, onUpdated, onMounted } from "vue";
const weight = ref<number>(0);
const reps = ref<number>(0);
const notes = ref<string>("");

const props = defineProps<{
    set: Set;
    exercise: Exercise;
    index: number;
}>();

const emit = defineEmits<{
    (e: 'cancel'): void;
}>();

function saveChanges() {
    props.set.setWeight(Number(weight.value));
    props.set.setReps(Number(reps.value));
    props.set.setNotes(notes.value);
    props.set.updateDB();
    emit('cancel')
}

function fillInputs() {
    weight.value = props.set.getWeight() || 0;
    reps.value = props.set.getReps() || 0;
    notes.value = props.set.getNotes() || "";
}

onMounted(() => {
    fillInputs();
});

onUpdated(() =>{
    fillInputs();
});
</script>
<template>
    <OptionPopup
        title="Edit Set"
        confirmText="Confirm"
        cancelText="Cancel"
        @confirm="saveChanges()"
        @cancel="emit('cancel')"
    >
        <div class="inputs">
            <input
                id="weightInput"
                type="number"
                v-model="weight"
                min="0"
            />

            kg
            <i class="fa-solid fa-xmark"></i>
            <input
                id="weightInput"
                type="number"
                v-model="reps"
                min="0"
            />
            reps
        </div>
        <div class="flexCol">
            <textarea
                id="setNotesInput"
                v-model="notes"
                rows="4"
                placeholder="Set notes..."
            ></textarea>
            <BubbleButton
                red
                :loading="false"
                @click="() => {
                    props.exercise.removeSet(props.index);
                    emit('cancel');
                }"
            >
                <i class="fa-solid fa-trash"></i> Delete Set
            </BubbleButton>
        </div>
        </OptionPopup>
</template>

<style scoped>
.inputs {
    font-size: 30px;
    padding-bottom: 8px;
}
.inputs i {
    font-size: 20px;
    margin-right: 10px;
}
.inputs input {
    width: 80px;
    font-size: 30px;
    font-weight: bold;
}
.flexCol {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

#weightInput {
    width: 150px;
}
</style>
