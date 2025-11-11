<script setup lang="ts">
import OptionPopup from './OptionPopup.vue';
import ErrorDisplay from '../classes/ErrorDisplay';
defineProps<{
    error: ErrorDisplay;
    notRed?: boolean;
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
        :error="notRed ? false : true"
        @confirm="error.clearError()"
    />
</template>
