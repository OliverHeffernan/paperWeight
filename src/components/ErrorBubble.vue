<!-- A component to display error messages in a styled bubble -->
<script setup lang="ts">
import { defineProps } from "vue";

defineProps(["errorMsg"]);
</script>

<template>
	<div v-if="errorMsg" class="bubbleError">
		<i class="fa-solid fa-circle-exclamation"></i>
		<p>{{ errorMsg }}</p>
	</div>
</template>

<style scoped>
.bubbleError {
	padding: 15px;
	border: solid 1px var(--errorBorder);
	background-color: color-mix(in srgb, var(--errorBorder) 20%, transparent);
	font-size: 15px;
	border-radius: 10px;
	white-space: nowrap;
	margin-top: 10px;
	margin-left: 0;
	margin-right: 0;
	display: flex;
	position: relative;
	width: calc(100% - 15px);
}


.bubbleError i {
	color: var(--errorBorder);
	font-size: 40px;
	position: absolute;
	top: 50%;
	left: 15px;
	transform: translateY(-50%);
}

.bubbleError p {
	margin-left: 48px;
}

</style>
