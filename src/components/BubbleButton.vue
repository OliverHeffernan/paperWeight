<!-- A component for a button -->

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

interface Props {
    label?: string;
    loading?: boolean;
    red?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: 'click'): void;
}>();
</script>
<template>
    <button :class="['bubbleButton', { red: props.red }]" :disabled="loading" @click="emit('click')">
        <slot></slot>
        {{label || ''}}
    </button>
</template>

<style scoped>
.bubbleButton {
	position: relative;
	padding: 10px;
	border: solid 1px var(--btnBorder);
	background-color: var(--btnBG);
	font-size: 16px;
	border-radius: 10px;
	white-space: nowrap;
	margin-left: 0;
	margin-right: 0;
}

.red {
    border-color: var(--errorBorder);
    background-color: var(--errorBG);
}

.bubbleButton i {
	color: inherit;
}
</style>
