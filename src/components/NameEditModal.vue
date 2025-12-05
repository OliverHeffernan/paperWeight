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
}>();

const nameInput = ref<string>(props.currentName);
console.log(nameInput.value);
const descriptionInput = ref<string>(props.currentDescription);
console.log(descriptionInput.value);

const errorDisplay = ref<ErrorDisplay>(new ErrorDisplay());

async function saveChanges() {
    console.log("yoyoyoyoyoyoyoyoyoyoyoyoyo");
    console.log(descriptionInput.value);
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
    props.exerciseInfo.setName(nameInput.value);
    props.exerciseInfo.setDescription(descriptionInput.value);
    console.log(data);
}

</script>
<template>
    <OptionPopup
        :title="`Edit ${label} Name`"
        confirmText="Save"
        cancelText="Cancel"
        @cancel="$emit('cancel')"
        @confirm="saveChanges()"
        v-bind="$attrs"
    >
        <div class="inputs">
            <h2>
                <input
                    id="nameInput"
                    type="text"
                    :placeholder="`Enter new ${label} name`"
                    v-model="nameInput"
                />
            </h2>
            <textarea
                placeholder="Notes..."
                v-model="descriptionInput"
            />
        </div>
    </OptionPopup>
</template>

<style scoped>
.inputs input, .inputs textarea {
    width: 100%;
    margin: 0;
}

.inputs {
    display: flex;
    flex-direction: column;
    gap: 0px;
}
</style>
