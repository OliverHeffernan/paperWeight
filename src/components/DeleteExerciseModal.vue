<script setup lang="ts">
import OptionPopup from '../components/OptionPopup.vue';

defineProps<{
    exercise: Exercise|null;
    visible: boolean;
}>();

defineEmits<{
    (e: 'confirm'): void;
    (e: 'cancel'): void;
}>();
</script>
<template>
    <OptionPopup
        v-if="visible"
        :title="`Remove Exercise: ${exercise.getName()}`"
        message="Are you sure you want to remove this exercise from the workout? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        :confirmRed="true"
        @confirm="$emit('confirm')"
        @cancel="$emit('cancel')"
    />
</template>
