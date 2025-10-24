<!-- A component to display a particular metric within the overview section -->
<!-- found in WorkoutOverview.vue -->
<script setup lang="ts">
defineProps<{
    label: string;
    value: string | number | null;
    icon: string;
}>();
</script>
<template>
    <div v-if="value" class="overview-item">
        <p class="overview-title">{{ label }}</p>
        <h1 class="overview-value"><i :class="icon + ' overview-icon'"></i>{{ value }}</h1>
    </div>
</template>

<style scoped>
.overview-item {
    display: flex;
    flex-direction: column;
    align-items: left;
    padding: 10px;
    border: 1px solid var(--borderColor);
    border-radius: 8px;
    background-color: var(--backgroundLight);
    margin-bottom: 10px;
    text-align: left;
}

.overview-item i {
    margin-right: 8px;
}

p {
    margin: 0;
    padding: 0;
    opacity: 0.7;
}

h1 {
    margin: 0;
    padding: 0;
}
</style>
