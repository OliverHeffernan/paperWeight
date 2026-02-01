<template>
	<button 
		@click="emit('click')" 
		class="reorder-button"
		title="Move exercise down"
	>
		<i v-if="!up" class="fa-solid fa-chevron-down"></i>
		<i v-else class="fa-solid fa-chevron-up"></i>
	</button>
</template>
<script setup lang="ts">
defineProps<{
	up?: boolean;
}>();

const emit = defineEmits<{
	(e: "click"): void;
}>();
</script>
<style scoped>
.reorder-button {
	background: none;
	border: none;
	color: var(--border);
	font-size: 1.2rem;
	padding: 8px;
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.3s ease;
	opacity: 0.6;
}

.reorder-button:hover {
	opacity: 1;
	color: var(--accent);
	background: color-mix(in srgb, var(--accent) 10%, transparent);
}
</style>
