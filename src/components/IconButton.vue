<script setup lang="ts">
defineProps<{
    icon: string;
}>();

const emit = defineEmits(["click"])
</script>
<template>
    <button @click="$emit('click')" class="icon-button">
        <i :class="icon"></i>
    </button>
</template>
<style scoped>
.icon-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 5px;
    font-size: 1.2em;
}
</style>
