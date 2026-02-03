<script setup lang="ts">
import OptionPopup from "./OptionPopup.vue";
import Workout from "../classes/Workout";
import { ref, computed } from "vue";

const props = defineProps<{
    workout: Workout;
}>();

const emit = defineEmits<{
    (e: 'cancel'): void;
}>();

const title = ref<string>(props.workout.getTitle());
const heart_rate = ref<string>(props.workout.getHeartRate() || "");
const energy = ref<number | null>(props.workout.getEnergy() || "");
const startDateRef = ref<Date>(props.workout.getStartTime());
const endDateRef = ref<Date>(props.workout.getEndTime());

function update() {
    props.workout.setTitle(title.value);
    props.workout.setHeartRate(Number(heart_rate.value) || null);
    props.workout.setEnergy(Number(energy.value) || null);
    props.workout.setStartDate(startDateRef.value);
    props.workout.setEndDate(endDateRef.value);
    emit('cancel');
}

function getDateUTC(value: string): Date {
	const date = new Date();
	date.setUTCFullYear(Number(value.slice(0, 4)));
	date.setUTCMonth(Number(value.slice(5, 7)) - 1);
	date.setUTCDate(Number(value.slice(8, 10)));
	date.setUTCHours(Number(value.slice(11, 13)));
	date.setUTCMinutes(Number(value.slice(14, 16)));
	return date;
}
const startDate = computed({
    get() {
        // Convert Date to YYYY-MM-DD format for the input
        //return startDateRef.value.toISOString().slice(0, 16);
        return startDateRef.value.getFullYear() + '-' +
               String(startDateRef.value.getMonth() + 1).padStart(2, '0') + '-' +
               String(startDateRef.value.getDate()).padStart(2, '0') + 'T' +
               String(startDateRef.value.getHours()).padStart(2, '0') + ':' +
               String(startDateRef.value.getMinutes()).padStart(2, '0');
    },
    set(value) {
        // Convert the input string (YYYY-MM-DD) back to a Date object
		//startDateRef.value = getDateUTC(value);
        startDateRef.value = new Date(value);
    }
});

const endDate = computed({
    get() {
        // Convert Date to YYYY-MM-DD format for the input
        //return endDateRef.value.toISOString().slice(0, 16);
        return endDateRef.value.getFullYear() + '-' +
               String(endDateRef.value.getMonth() + 1).padStart(2, '0') + '-' +
               String(endDateRef.value.getDate()).padStart(2, '0') + 'T' +
               String(endDateRef.value.getHours()).padStart(2, '0') + ':' +
               String(endDateRef.value.getMinutes()).padStart(2, '0');
    },
    set(value) {
        // Convert the input string (YYYY-MM-DD) back to a Date object
        //endDateRef.value = new Date(value);
		endDateRef.value = new Date(value);
    }
});

</script>
<template>
    <OptionPopup
        title="Edit Workout Details"
        confirmText="Save"
        cancelText="Cancel"
        @confirm="update()"
        @cancel="emit('cancel')"
    >
        <div class="inputs">
            <label for="titleInput">Title:</label>
            <input
                id="titleInput"
                type="text"
                v-model="title"
            />
            <label for="startDate">Start Date and Time:</label>
            <input
                id="startDate"
                type="datetime-local"
                v-model="startDate"
            />

            <label for="endDate">End Date and Time:</label>
            <input
                id="startDate"
                type="datetime-local"
                v-model="endDate"
            />
            <label for="heartRateInput">Average Heart Rate (bpm):</label>
            <input
                id="heartRateInput"
                type="number"
                v-model.number="heart_rate"
                min="0"
            />
            <label for="energyInput">Energy Burned (kj):</label>
            <input
                id="energyInput"
                type="number"
                v-model.number="energy"
                min="0"
            />
        </div>
    </OptionPopup>
</template>

<style scoped>
.inputs {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
</style>
