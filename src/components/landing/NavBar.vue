<template>
    <nav class="navBar">
        <RouterLink class="navItem" :to="{ name: 'landing' }"><b>Paper</b><em>Weight</em></RouterLink>

        <RouterLink class="navItem right" :to="{ name: 'Home' }">App</RouterLink>
    </nav>
</template>
<style scoped>
.navBar {
    display: flex;
    gap: 20px;
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
