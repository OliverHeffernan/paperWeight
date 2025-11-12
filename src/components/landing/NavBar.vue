<script setup lang="ts">
import { RouterLink } from 'vue-router';
import BubbleButton from '../BubbleButton.vue';
</script>
<template>
    <nav class="navBar margins">
        <RouterLink class="navItem" :to="{ name: 'landing' }"><b>Paper</b><em>Weight</em></RouterLink>

        <RouterLink class="navItem right" :to="{ name: 'Home' }"><BubbleButton>Sign In</BubbleButton></RouterLink>
    </nav>
</template>
<style scoped>
.navBar {
    position: relative;
    display: flex;
    gap: 20px;
    z-index: 20;
}
.navItem {
    text-decoration: none;
    color: inherit;
    font-size: 1.2em;
    padding: 15px 0;
    color: var(--border);
    transition: color 0.2s;
}

.navItem:hover {
    color: var(--text);
}

.right {
    margin-left: auto;

}
</style>
