<script setup lang="ts">
import BubbleButton from "./BubbleButton.vue";
import OptionPopup from './OptionPopup.vue';
import Exercise from '../classes/Exercise';
import DeleteExerciseModal from './DeleteExerciseModal.vue';
import { ref, onMounted, onUpdated } from 'vue';

const exerciseName = ref<string>("");
const exerciseNotes = ref<string>("");
const deleting = ref<boolean>(false);
const props = defineProps<{
    exercise: Exercise;
}>();

const emit = defineEmits<{
    (e: 'cancel'): void;
}>();

function saveChanges(): void {
    console.log("Saving changes to exercise");
    props.exercise.setName(exerciseName.value);
    props.exercise.setNotes(exerciseNotes.value);
    emit('cancel');
}

function removeExercise(): void {
    deleting.value = false;
    props.exercise.removeFromWorkout();
    emit('cancel');
}

onMounted(() => {
    exerciseName.value = props.exercise.getName();
    exerciseNotes.value = props.exercise.getNotes() || "";
});
onUpdated(() => {
    exerciseName.value = props.exercise.getName();
    exerciseNotes.value = props.exercise.getNotes() || "";
});

</script>
<template>

    <OptionPopup
        title="Edit Exercise"
        confirmText="Confirm"
        cancelText="Cancel"
        @confirm="saveChanges()"
        @cancel="$emit('cancel')"
    >
        <div class="inputs">
            <input
                id="exerciseNameInput"
                type="text"
                v-model="exerciseName"
            />

            <textarea
                id="exerciseNotesInput"
                v-model="exerciseNotes"
                rows="4"
                placeholder="Notes..."
            ></textarea>
        </div>
        <BubbleButton
            red
            :loading="false"
            @click="deleting = true"
        >
            <i class="fa-solid fa-trash"></i> Remove Exercise
        </BubbleButton>
    </OptionPopup>
    <DeleteExerciseModal
        :exercise="props.exercise"
        :visible="deleting"
        @confirm="removeExercise()"
        @cancel="deleting = false"
    />
</template>

<style scoped>
#exerciseNameInput {
    font-size: 30px;
}

.inputs {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-top: 15px;
}
</style>
