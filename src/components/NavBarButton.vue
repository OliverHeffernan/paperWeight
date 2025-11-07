<!-- a navigation bar component, found in Navbar.vue -->
<script setup lang="ts">
import { useRouter, RouterLink  } from 'vue-router';
const router = useRouter();
const props = defineProps<{
    label: string;
    icon: string;
    route: string;
    active: string;
}>();

</script>
<template>
    <RouterLink :to="route" :class="'navLink' + (active === label ? ' active' : '')">
        <i :class="icon"></i>
        <span class="navLabel">{{ label }}</span>
    </RouterLink>
</template>
<style scoped>
.navLink {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    opacity: 0.7;
}

.navLink.active {
    opacity: 1;
}

.navLink i {
    font-size: 32px;
}
</style>
