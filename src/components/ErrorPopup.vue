<script setup lang="ts">
import OptionPopup from './OptionPopup.vue';
import ErrorDisplay from '../classes/ErrorDisplay';
defineProps<{
    error: ErrorDisplay;
}>();
defineEmits<{
    (e: 'close'): void;
}>();
</script>
<template>
    <OptionPopup
        v-if="error.shouldDisplay()"
        :title="error.getTitle()"
        :message="error.getMessage()"
        confirmText="OK"
        :error="true"
        @confirm="error.clearError()"
    />
</template>
