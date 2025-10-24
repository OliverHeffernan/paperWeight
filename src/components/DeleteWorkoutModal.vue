<script setup lang="ts">
import OptionPopup from '../components/OptionPopup.vue';

defineProps<{
    workout: Workout|null;
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
        :title="`Delete Workout: ${workout.getTitle()}`"
        message="Are you sure you want to delete this workout? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        :confirmRed="true"
        @confirm="$emit('confirm')"
        @cancel="$emit('cancel')"
    />
</template>
