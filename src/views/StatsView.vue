<script setup lang="ts">
import NavBar from '../components/NavBar.vue';
import WorkoutVolumeByWorkout from '../components/charts/WorkoutVolumeByWorkout.vue';

</script>
<template>
    <div class="viewArea">
        <div class="margins">
            <WorkoutVolumeByWorkout />
        </div>
    </div>
    <NavBar active="/stats" />
</template>
