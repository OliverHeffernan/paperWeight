<script setup lang="ts">
defineProps<{
    icon: string|null;
    label: string|null;
}>();
</script>
<template>
    <div class="item" v-if="label">
        <i v-if="icon" :class="icon"></i>
        {{ label }}
    </div>
</template>
