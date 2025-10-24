<!-- A component for a button -->

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

<style scoped>
.bubbleButton {
	position: relative;
	padding: 15px;
	border: solid 1px var(--btnBorder);
	background-color: var(--btnBG);
	font-size: 16px;
	border-radius: 10px;
	white-space: nowrap;
	margin-left: 0;
	margin-right: 0;
	margin-bottom: 10px;
}

.bubbleButton i {
	color: inherit;
}
</style>
