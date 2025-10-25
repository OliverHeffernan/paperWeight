<script setup lang="ts">
import BubbleButton from "./BubbleButton.vue";
import OptionPopup from "./OptionPopup.vue";
import Exercise from "../classes/Exercise";
import JSONSet from "../classes/JSONSet";
import { ref, onUpdated, onMounted } from "vue";
const weight = ref<number>(0);
const reps = ref<number>(0);

const props = defineProps<{
    set: JSONSet;
    exercise: Exercise;
    index: number;
}>();

const emit = defineEmits<{
    (e: 'cancel'): void;
}>();

function saveChanges() {
    const updatedSet: JSONSet = {
        weight: Number(weight.value),
        reps: Number(reps.value),
        notes: props.set.notes || "",
        unit: props.set.units || "kg"
    };

    props.exercise.updateSet(props.index, updatedSet);
    emit('cancel')
}

onMounted(() => {
    weight.value = props.set.weight || 0;
    reps.value = props.set.reps || 0;
});
onUpdated(() =>{
    weight.value = props.set.weight || 0;
    reps.value = props.set.reps || 0;
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
</style>
