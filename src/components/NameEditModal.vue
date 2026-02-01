<script setup lang="ts">

import { supabase } from "../lib/supabase";
import OptionPopup from "./OptionPopup.vue";
import ErrorPopup from "./ErrorPopup.vue";
import ErrorDisplay from "../classes/ErrorDisplay";
import ExerciseInfo from "../classes/ExerciseInfo";

import { ref } from "vue";

const props = defineProps<{
	currentName: string;
	currentDescription: string;
	exerciseInfo: ExerciseInfo;
	id: string;
	label: string;
}>();

const emit = defineEmits<{
	(e: 'cancel'): void;
	(e: 'confirm', newName: string, newDescription: string): void;
}>();

const nameInput = ref<string>(props.currentName);
const descriptionInput = ref<string>(props.currentDescription);
const aliasInput = ref<string>(props.exerciseInfo.getAliasString());

const errorDisplay = ref<ErrorDisplay>(new ErrorDisplay());

async function saveChanges() {
	try {
		// Update aliases
		props.exerciseInfo.setAliasesFromString(aliasInput.value);
		const { data, error } = await supabase
			.from("exercises")
			.update({
				name: nameInput.value,
				description: descriptionInput.value,
			})
			.eq("id", props.id);

		if (error) {
			errorDisplay.value.setError("Failed to update exercise name.", "Please check your internet connection and try again.");
			return;
		}

		// Update the exercise info locally
		props.exerciseInfo.setName(nameInput.value);
		props.exerciseInfo.setDescription(descriptionInput.value);

		// Emit the changes back to the parent
		emit('confirm', nameInput.value, descriptionInput.value);
	} catch (error) {
		errorDisplay.value.setError("Failed to update exercise", "Please check your internet connection and try again.");
	}
}

</script>
<template>
	<ErrorPopup :error="errorDisplay" />
	<OptionPopup
		:title="`Edit ${label} Name`"
		confirmText="Save"
		cancelText="Cancel"
		@cancel="$emit('cancel')"
		@confirm="saveChanges()"
		v-bind="$attrs"
	>
		<div class="inputs">
			<div class="input-group">
				<label for="nameInput" class="input-label">{{ label }} Name</label>
				<input
					id="nameInput"
					type="text"
					:placeholder="`Enter new ${label} name`"
					v-model="nameInput"
					class="name-input"
				/>
			</div>
			<div class="input-group">
				<label for="aliasInput" class="input-label">Aliases: seperated by commas (Optional)</label>
				<input
					id="aliasInput"
					type="text"
					placeholder="Enter aliases..."
					class="name-input"
					v-model="aliasInput"
				/>
			</div>
			<div class="input-group">
				<label for="descriptionInput" class="input-label">Description (Optional)</label>
				<textarea
					id="descriptionInput"
					placeholder="Enter notes or description..."
					v-model="descriptionInput"
					class="description-input"
				/>
			</div>
		</div>
	</OptionPopup>
</template>

<style scoped>
.inputs {
	display: flex;
	flex-direction: column;
	gap: 20px;
	width: 100%;
	min-width: 300px;
}

.input-group {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.input-label {
	font-size: 0.9rem;
	font-weight: 600;
	opacity: 0.9;
	color: var(--text);
}

.name-input,
.description-input {
	width: 100%;
	margin: 0;
	padding: 12px;
	font-size: 1rem;
	border: 2px solid var(--border);
	border-radius: 8px;
	background: var(--btnBG);
	color: var(--text);
	transition: border-color 0.3s ease;
	box-sizing: border-box;
}

.name-input:focus,
.description-input:focus {
	border-color: var(--accent);
	outline: none;
}

.description-input {
	min-height: 80px;
	resize: vertical;
	font-family: inherit;
}
</style>
