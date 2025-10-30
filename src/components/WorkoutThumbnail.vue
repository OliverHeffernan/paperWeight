<!-- Component to display a thumbnail summary of a workout -->
<!-- Found in HomeView.vue -->
<script setup lang="ts">
import Workout from '../classes/Workout';
import LoadingView from '../views/LoadingView.vue';
import ThumbnailItem from './ThumbnailItem.vue';
import IconButton from './IconButton.vue';
import DeleteWorkoutModal from './DeleteWorkoutModal.vue';

import { ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const props = defineProps(["workout"]);
const emit = defineEmits(["reload"]);

const loading = ref<boolean>(false);

const deleteModalVisible = ref<boolean>(false);

async function deleteWorkout() {
    loading.value = true;
    await props.workout.deleteWorkout();
    setTimeout(() => {
        emit('reload');
        loading.value = false;
    }, 500);
}
</script>
<template>
    <LoadingView v-if="loading" />
    <DeleteWorkoutModal
        :visible="deleteModalVisible"
        :workout="workout"
        @confirm="deleteWorkout(); deleteModalVisible = false"
        @cancel="deleteModalVisible = false"
    />
    <div class="thumbnail">
        <RouterLink class="link" :to="`/viewWorkout/${workout.getId()}`">
            <h3>
                {{workout.getTitle()}}
                <span class="greyed">{{workout.getDateString()}}</span>
            </h3>
        </RouterLink>
        <div class="items">
            <ThumbnailItem
                icon="fa-solid fa-dumbbell"
                :label="workout.getVolumeString()"
            />
            <ThumbnailItem
                icon="fa-solid fa-clock"
                :label="workout.getDurationString()"
            />
            <ThumbnailItem
                icon="fa-solid fa-list"
                :label="workout.countSetsString()"
            />
            <ThumbnailItem
                icon="fa-solid fa-fire"
                :label="workout.getEnergyString()"
            />
            <ThumbnailItem
                icon="fa-solid fa-heart"
                :label="workout.getHeartRateString()"
            />
        </div>
        <div id="deleteContainer">
            <IconButton
                icon="fa-solid fa-trash"
                @click="deleteModalVisible = true"
            />
        </div>
    </div>
</template>
<style scoped>
.thumbnail {
    position: relative;
    display: block;
    border: solid 1px var(--border);
    border-radius: 10px;
    padding: 15px;
    background-color: var(--cardBackground);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-decoration: none;
}

.link {
    text-decoration: none;
}

.thumbnail td {
    padding-right: 15px;
}

.greyed {
    color: var(--border);
    font-weight: normal;
    margin-left: 10px;
}
.items {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin-top: 10px;
}
#deleteContainer {
    position: absolute;
    top: 10px;
    right: 10px;
}
</style>
