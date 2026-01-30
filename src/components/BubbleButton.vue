<!-- A component for a button -->

<script setup lang="ts">
import stravaConnectImage from '../assets/btn_strava_connect_with_orange.svg?url';

interface Props {
	label?: string;
	loading?: boolean;
	red?: boolean;
	orange?: boolean;
	fullWidth?: boolean;
	strava?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
	(e: 'click'): void;
}>();
</script>
<template>
	<button
		:class="[
			'bubbleButton',
			'clickable',
			{ red: props.red },
			{fullWidth: props.fullWidth},
			{strava: props.strava},
			{ orange: props.orange }
		]"
		:disabled="loading"
		@click="emit('click')"
	>
		<slot></slot>
		<img v-if="strava" :src="stravaConnectImage" alt="Strava Logo" class="strava" />
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
	transition: all 0.2s;
	flex-grow: 1;
}

.bubbleButton:hover {
	box-shadow: 0 0 5px 0 rgba(255,255,255,0.5);
}

.red {
	border-color: var(--errorBorder);
	background-color: var(--errorBG);
}

.orange {
	background-color: var(--stravaOrange);
	border: none;
}

.strava {
	height: 48px;
	border: none;
	padding: 0;
	margin: 0;
}

.red i {
	color: inherit;
}
.fullWidth {
	width: 100%;
	box-sizing: border-box;
	margin-top: 10px;
}

.bubbleButton i {
	color: inherit;
}
</style>
