<script setup lang="ts">
defineProps<{
    workout: Workout|null;
}>();
</script>
<template>
    <div :class="['savingDisplay', { display: workout.savingInProgress() }]">
        <i class="fa-solid fa-floppy-disk"></i>
    </div>
</template>
<style scoped>

.savingDisplay {
    opacity: 0;
    position: fixed;
    top: 15px;
    right: 15px;
    z-index: 1100;
    font-size: 24px;
    transition: opacity 0.3s ease-in-out;
}

.display {
    opacity: 1;
}
</style>
