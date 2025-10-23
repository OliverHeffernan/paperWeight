<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

interface Props {
    label: string;
    loading: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: 'click'): void;
}>();
</script>
<template>
    <button class="bubbleButton" :disabled="loading" @click="emit('click')">
        {{label}}
    </button>
</template>
