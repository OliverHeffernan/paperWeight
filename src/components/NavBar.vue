<!-- a navbar component, given a prop with the active route -->
<script setup lang="ts">
import NavBarButton from './NavBarButton.vue';
const props = defineProps<{
    active: string;
}>();
</script>
<template>
    <nav class="nav-bar">
        <NavBarButton
            label="Home"
            icon="fas fa-home"
            route="/app"
            :active="active"
        />
        <NavBarButton
            label="Stats"
            icon="fas fa-chart-bar"
            route="/app/stats"
            :active="active"
        />
        <NavBarButton
            label="Exercises"
            icon="fas fa-dumbbell"
            route="/app/exercises"
            :active="active"
        />
        <NavBarButton
            label="Upload"
            icon="fas fa-camera"
            route="/app/upload"
            :active="active"
        />
    </nav>
</template>
<style scoped>
.nav-bar {
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 85px;
    background-color: var(--sec);
    box-shadow: 0px 0px 12px 0px rgba(255, 255, 255, 0.1);

    position: fixed;
    bottom: 0;
    width: 100%;
    border-top: 1px solid var(--border);
}
</style>


